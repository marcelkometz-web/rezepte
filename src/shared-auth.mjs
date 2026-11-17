// One browser login for the three apps. Only Supabase session data and an idle
// timestamp are shared; application data and provider API keys never enter here.
export const IDLE_MS = 10 * 60 * 1000;
const memoryStorage = () => {
  const values = new Map();
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, String(value)), removeItem: key => values.delete(key) };
};
function browserStorage(name) {
  try {
    const storage = globalThis[name], probe = 'ramona-auth-storage-test';
    storage.setItem(probe, '1'); storage.removeItem(probe);
    return storage;
  } catch { return null; }
}
function validSession(raw) {
  try {
    if (!raw || raw.length > 262144) return false;
    const value = JSON.parse(raw);
    return typeof value?.access_token === 'string' && Boolean(value.access_token)
      && typeof value.refresh_token === 'string' && Boolean(value.refresh_token)
      && typeof value.user?.id === 'string';
  } catch { return false; }
}
function identity(raw) {
  try {
    const session = JSON.parse(raw), part = session.access_token.split('.')[1];
    const claims = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof session.user.id === 'string' && typeof claims.session_id === 'string' && claims.session_id
      ? session.user.id + ':' + claims.session_id : null;
  } catch { return null; }
}
export function createSharedAuth({ projectUrl, legacyKey, sharedStorage, tabStorage, now = Date.now, documentObject = globalThis.document, windowObject = globalThis.window, timers = globalThis } = {}) {
  const storageKey = `sb-${new URL(projectUrl).hostname.split('.')[0]}-auth-token`;
  const tab = tabStorage ?? browserStorage('sessionStorage') ?? memoryStorage();
  const shared = sharedStorage ?? browserStorage('localStorage') ?? tab;
  const activityKey = storageKey + ':activity', markerKey = storageKey + ':shared-v1', recoveryKey = storageKey + ':recovery', signedOutKey = storageKey + ':signed-out';
  const legacyKeys = [...new Set([legacyKey, storageKey, 'abnehmen-auth'].filter(Boolean))];
  let client, pending = null, bypassIdle = false, localCleanup = false, logoutTarget, timer;
  const emit = name => { if (typeof windowObject?.dispatchEvent === 'function') windowObject.dispatchEvent(new Event(name)); };
  const sameSession = (first, second) => first === second || Boolean(identity(first) && identity(first) === identity(second));
  // Only session identifiers and deadlines are retained. An in-flight refresh
  // must not restore the just-removed session, even in another app/tab.
  const signedOutSessions = () => {
    const raw = shared.getItem(signedOutKey);
    if (!raw) return [];
    let entries; try { entries = JSON.parse(raw); } catch { return []; }
    return Array.isArray(entries) ? entries.filter(entry => typeof entry?.id === 'string' && entry.id.length <= 300 && Number.isFinite(entry.until) && entry.until > now()).slice(-16) : [];
  };
  const isSignedOut = raw => { const id = identity(raw); return Boolean(id && signedOutSessions().some(entry => entry.id === id)); };
  const rememberSignOut = raw => {
    const id = identity(raw); if (!id) return;
    let expiry = 0;
    try { const token = JSON.parse(raw).access_token.split('.')[1]; expiry = Number(JSON.parse(atob(token.replace(/-/g, '+').replace(/_/g, '/'))).exp) * 1000; } catch {}
    const time = now(), until = Math.min(time + 24 * 60 * 60 * 1000, Math.max(time + IDLE_MS, Number.isFinite(expiry) ? expiry + IDLE_MS : 0));
    const entries = signedOutSessions().filter(entry => entry.id !== id);
    entries.push({ id, until }); shared.setItem(signedOutKey, JSON.stringify(entries.slice(-16)));
  };
  const newerSessionExists = () => {
    const current = shared.getItem(storageKey);
    return logoutTarget !== undefined && Boolean(current) && !sameSession(current, logoutTarget);
  };
  const clearLegacy = () => { if (tab !== shared) for (const key of legacyKeys) tab.removeItem(key); };
  const isIdle = () => {
    if (!shared.getItem(storageKey)) return false;
    const activity = Number(shared.getItem(activityKey)), time = now();
    return !Number.isFinite(activity) || activity <= 0 || activity > time + 60000 || time - activity >= IDLE_MS;
  };
  // Migrate an existing login once. A logout tombstone prevents another tab's
  // older sessionStorage copy from silently logging the person back in.
  if (!shared.getItem(markerKey)) {
    const existing = shared.getItem(storageKey);
    const candidate = validSession(existing) && !isSignedOut(existing) ? existing : legacyKeys.map(key => tab.getItem(key)).find(value => validSession(value) && !isSignedOut(value));
    if (candidate) {
      shared.setItem(activityKey, String(now())); shared.setItem(storageKey, candidate);
      shared.setItem(markerKey, '1'); clearLegacy();
    }
  } else clearLegacy();
  const changedSessionError = () => new Error('Die Anmeldung hat sich inzwischen geändert. Bitte erneut auf Abmelden tippen.');
  async function signOut({ expectedSession } = {}) {
    try {
      const current = shared.getItem(storageKey);
      if (expectedSession !== undefined && current && !sameSession(current, expectedSession)) return { error: changedSessionError(), remoteSignedOut: false };
    } catch (error) { return { error, remoteSignedOut: false }; }
    if (pending) return pending;
    const operation = (async () => {
      let remoteSignedOut = false;
      try {
        logoutTarget = shared.getItem(storageKey); bypassIdle = true;
        rememberSignOut(logoutTarget);
        if (client) { try { remoteSignedOut = !(await client.auth.signOut({ scope: 'local' }))?.error; } catch {} }
        if (newerSessionExists()) return { error: changedSessionError(), remoteSignedOut };
        if (!newerSessionExists()) {
          storage.removeItem(storageKey);
          storage.removeItem(storageKey + '-code-verifier');
          storage.removeItem(storageKey + '-user');
          if (client && !remoteSignedOut) {
            // Emit the SDK's SIGNED_OUT event with no stored token. This cleanup
            // must never submit another tab's newly-created session for logout.
            localCleanup = true;
            try { await client.auth.signOut({ scope: 'local' }); } catch {}
            finally { localCleanup = false; }
          }
          if (newerSessionExists()) return { error: changedSessionError(), remoteSignedOut };
          if (!shared.getItem(storageKey)) emit('ramona-signed-out');
        }
        return { error: null, remoteSignedOut };
      } catch (error) {
        return { error: error instanceof Error ? error : new Error('Die lokale Anmeldung konnte nicht entfernt werden.'), remoteSignedOut };
      } finally { bypassIdle = false; localCleanup = false; logoutTarget = undefined; }
    })();
    pending = operation;
    try { return await operation; } finally { if (pending === operation) pending = null; }
  }
  async function expire() {
    if (!client || pending || !isIdle()) return;
    const result = await signOut(); if (result.error) throw result.error;
  }
  const scheduleExpiry = () => { if (client && !pending) timers.setTimeout(() => expire().catch(() => {}), 0); };
  const storage = {
    getItem(key) {
      if (key === storageKey && localCleanup) return null;
      // The SDK's asynchronous auth lock may be acquired after another tab has
      // signed in. A pending logout may read only its original session.
      if (key === storageKey && logoutTarget !== undefined) return logoutTarget;
      if (key === storageKey && !bypassIdle && isSignedOut(shared.getItem(key))) return null;
      if (key === storageKey && !bypassIdle && isIdle()) { scheduleExpiry(); return null; }
      return shared.getItem(key);
    },
    setItem(key, value) {
      if (key === storageKey) {
        if (!validSession(value)) throw Error('Die Anmeldung konnte nicht gespeichert werden.');
        if (isSignedOut(value)) return;
        const before = shared.getItem(key), newIdentity = identity(value), previousIdentity = identity(before);
        const newLogin = !before || (newIdentity && previousIdentity && newIdentity !== previousIdentity);
        if (!newLogin && isIdle()) { scheduleExpiry(); return; }
        if (newLogin) shared.setItem(activityKey, String(now()));
        shared.setItem(markerKey, '1'); clearLegacy();
      }
      shared.setItem(key, value);
      if (key === storageKey) emit('ramona-session-changed');
    },
    removeItem(key) {
      if ([storageKey, storageKey + '-code-verifier', storageKey + '-user'].includes(key) && newerSessionExists()) return;
      const before = key === storageKey ? shared.getItem(key) : null;
      shared.removeItem(key);
      if (key === storageKey) {
        rememberSignOut(before);
        shared.removeItem(activityKey); shared.removeItem(recoveryKey); shared.setItem(markerKey, '1'); clearLegacy();
        emit('ramona-session-changed');
      }
    }
  };
  const touch = event => {
    if (event?.isTrusted === false || documentObject?.hidden || !shared.getItem(storageKey)) return;
    if (isIdle()) { scheduleExpiry(); return; }
    if (now() - Number(shared.getItem(activityKey)) >= 1000) shared.setItem(activityKey, String(now()));
  };
  return {
    storageKey, storage, isIdle, expire, signOut,
    isRecovering: session => Boolean(session && identity(JSON.stringify(session)) && shared.getItem(recoveryKey) === identity(JSON.stringify(session))),
    finishRecovery: () => shared.removeItem(recoveryKey),
    bind(currentClient) {
      if (client) return;
      client = currentClient;
      client.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' && session) shared.setItem(recoveryKey, identity(JSON.stringify(session)) || '');
        if (event === 'SIGNED_OUT') { shared.setItem(markerKey, '1'); clearLegacy(); }
      });
      for (const event of ['pointerdown', 'keydown', 'touchstart', 'wheel']) documentObject?.addEventListener(event, touch, { passive: true, capture: true });
      documentObject?.addEventListener('visibilitychange', scheduleExpiry);
      windowObject?.addEventListener('pageshow', scheduleExpiry);
      timer = timers.setInterval(() => expire().catch(() => {}), 15000);
      timer?.unref?.();
      scheduleExpiry();
    }
  };
}

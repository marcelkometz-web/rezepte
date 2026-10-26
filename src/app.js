import { createRecipeController } from './recipes-ui.js';
(() => {
  (() => {
    function Ri({ basePath: t, isSafe: e, onPending: n = () => {
    }, onReload: r = () => {
    } }) {
      if (!("serviceWorker" in navigator)) return { checkNow: async () => "unsupported" };
      let i = navigator.serviceWorker, a, s = false, l = false, c = Date.now(), u = false, d = !!i.controller, h = () => Date.now() - c > 1800 && e(), g = () => {
        c = Date.now();
      };
      for (let y of ["input", "change", "keydown"]) document.addEventListener(y, g, { capture: true });
      i.addEventListener("message", (y) => {
        y.data?.type === "GARDEN_UPDATE_CHECK" && y.ports[0]?.postMessage({ safe: h() });
      });
      function f() {
        l || !s || document.hidden || !h() || (l = true, r(), location.reload());
      }
      i.addEventListener("controllerchange", () => {
        if (!d) {
          d = true;
          return;
        }
        s = true, n(true), f();
      });
      function m() {
        f(), !l && a?.waiting && h() && (n(true), a.waiting.postMessage({ type: "GARDEN_REQUEST_ACTIVATION" }));
      }
      async function b() {
        if (!(u || !a || document.hidden || !navigator.onLine)) {
          u = true;
          try {
            await a.update();
          } catch {
          } finally {
            u = false, m();
          }
        }
      }
      let v = i.register(`${t}sw.js`, { scope: t, updateViaCache: "none" }).then((y) => {
        a = y, a.addEventListener("updatefound", () => {
          let k = a.installing;
          k?.addEventListener("statechange", () => {
            k.state === "installed" && m();
          });
        }), m(), b();
      }).catch(() => {
      });
      return setInterval(m, 3e3), setInterval(b, 5 * 6e4), document.addEventListener("visibilitychange", () => {
        document.hidden || (m(), b());
      }), window.addEventListener("online", b), { checkNow: async () => {
        if (await v, !a) return "unsupported";
        if (!navigator.onLine) throw new Error("Keine Verbindung. Die App-Aktualisierung braucht Internet.");
        await a.update();
        let y = a.installing;
        return y && !["installed", "activated", "redundant"].includes(y.state) && await new Promise((k, _) => {
          let T = () => {
            ["installed", "activated", "redundant"].includes(y.state) && (clearTimeout(I), y.removeEventListener("statechange", T), y.state === "redundant" ? _(new Error("Die neue App-Version konnte nicht geladen werden. Bitte sp\xE4ter erneut versuchen.")) : k());
          }, I = setTimeout(() => {
            y.removeEventListener("statechange", T), _(new Error("Das Laden der App-Version dauert l\xE4nger. Die automatische Pr\xFCfung l\xE4uft weiter."));
          }, 15e3);
          y.addEventListener("statechange", T), T();
        }), m(), a.waiting || s ? "waiting" : "current";
      } };
    }
    var zi = [{ id: "apple", label: "iPhone / iPad", steps: ["Die Garten-App in Safari \xF6ffnen. Falls du in einer anderen App bist, den Link zuerst in Safari \xF6ffnen.", "Im Browser auf \u201ETeilen\u201C und dann \u201EZum Home-Bildschirm\u201C tippen. Je nach Version steht der Eintrag unter \u201EMehr\u201C.", "Falls angeboten, \u201EAls Web-App \xF6ffnen\u201C einschalten und mit \u201EHinzuf\xFCgen\u201C best\xE4tigen. Danach das Gartensymbol auf dem Home-Bildschirm \xF6ffnen."] }, { id: "android", label: "Android", steps: ["Die Garten-App in Chrome, Edge oder Samsung Internet \xF6ffnen.", "Im Browsermen\xFC \u201EApp installieren\u201C oder \u201EZum Startbildschirm hinzuf\xFCgen\u201C w\xE4hlen. In Samsung Internet kann der Eintrag \u201ESeite hinzuf\xFCgen zu\u201C hei\xDFen.", "Die Installation auf dem Ger\xE4t best\xE4tigen. Danach das Gartensymbol im App-Men\xFC oder auf dem Startbildschirm \xF6ffnen."] }, { id: "windows", label: "Windows", steps: ["Die Garten-App in Microsoft Edge oder Google Chrome \xF6ffnen.", "Auf das Installationssymbol in der Adressleiste klicken. Alternativ im Browsermen\xFC unter \u201EApps\u201C oder \u201ESpeichern und teilen\u201C nach \u201EDiese Seite als App installieren\u201C suchen.", "Im Browser best\xE4tigen. Die App l\xE4sst sich anschlie\xDFend \xFCber das Startmen\xFC \xF6ffnen und dort an die Taskleiste anheften."] }, { id: "mac", label: "Mac", steps: ["In Safari ab macOS Sonoma \u201EAblage \u2192 Zum Dock hinzuf\xFCgen\u201C w\xE4hlen und best\xE4tigen.", "Alternativ die Garten-App in Chrome oder Edge \xF6ffnen und das Installationssymbol in der Adressleiste oder den App-Eintrag im Browsermen\xFC verwenden.", "Danach das Gartensymbol im Dock oder im App-Men\xFC \xF6ffnen."] }, { id: "other", label: "Anderes Ger\xE4t", steps: ["Die Garten-App in einem aktuellen Browser \xF6ffnen. Im Browsermen\xFC nach \u201EApp installieren\u201C oder \u201EZum Startbildschirm hinzuf\xFCgen\u201C suchen.", "Wenn dein Browser diese Funktion nicht anbietet, kannst du die Garten-App weiterhin als Webseite oder \xFCber ein Lesezeichen verwenden."] }];
    function qa(t = {}) {
      let e = t.userAgent || "";
      return /iPhone|iPad|iPod/i.test(e) || /Mac/i.test(t.platform || "") && t.maxTouchPoints > 1 ? "apple" : /Android/i.test(e) ? "android" : /Windows/i.test(e) ? "windows" : /Macintosh|Mac OS X/i.test(e) ? "mac" : "other";
    }
    function Wa({ window: t, navigator: e } = { window, navigator }) {
      let n = t.matchMedia?.("(display-mode: standalone)"), r = t.matchMedia?.("(display-mode: minimal-ui)"), i = null, a = false, s = e.standalone === true || !!n?.matches || !!r?.matches, l = /* @__PURE__ */ new Set(), c = () => ({ installed: s, canPrompt: !!i && !a && !s, pending: a }), u = () => {
        for (let f of l) f(c());
      }, d = () => {
        s = e.standalone === true || !!n?.matches || !!r?.matches, s && (i = null), u();
      }, h = (f) => {
        s || typeof f.prompt != "function" || (f.preventDefault(), i = f, u());
      }, g = () => {
        s = true, i = null, u();
      };
      t.addEventListener("beforeinstallprompt", h), t.addEventListener("appinstalled", g);
      for (let f of [n, r]) f?.addEventListener ? f.addEventListener("change", d) : f?.addListener?.(d);
      return { state: c, subscribe(f) {
        return l.add(f), () => l.delete(f);
      }, async prompt() {
        if (!i || a || s) return "unavailable";
        let f = i;
        i = null, a = true;
        try {
          let m = f.prompt();
          return u(), await m, (await f.userChoice)?.outcome === "accepted" ? "accepted" : "dismissed";
        } finally {
          a = false, u();
        }
      }, dispose() {
        t.removeEventListener("beforeinstallprompt", h), t.removeEventListener("appinstalled", g);
        for (let f of [n, r]) f?.removeEventListener ? f.removeEventListener("change", d) : f?.removeListener?.(d);
        l.clear(), i = null;
      } };
    }
    function Bt(t, e) {
      var n = {};
      for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
      if (t != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(t); i < r.length; i++) e.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(t, r[i]) && (n[r[i]] = t[r[i]]);
      return n;
    }
    function Ha(t, e, n, r) {
      function i(a) {
        return a instanceof n ? a : new n(function(s) {
          s(a);
        });
      }
      return new (n || (n = Promise))(function(a, s) {
        function l(d) {
          try {
            u(r.next(d));
          } catch (h) {
            s(h);
          }
        }
        function c(d) {
          try {
            u(r.throw(d));
          } catch (h) {
            s(h);
          }
        }
        function u(d) {
          d.done ? a(d.value) : i(d.value).then(l, c);
        }
        u((r = r.apply(t, e || [])).next());
      });
    }
    var Va = (t) => t ? (...e) => t(...e) : (...e) => fetch(...e);
    var tn = class extends Error {
      constructor(e, n = "FunctionsError", r) {
        super(e), this.name = n, this.context = r;
      }
      toJSON() {
        return { name: this.name, message: this.message, context: this.context };
      }
    }, Rn = class extends tn {
      constructor(e) {
        super("Failed to send a request to the Edge Function", "FunctionsFetchError", e);
      }
    }, nn = class extends tn {
      constructor(e) {
        super("Relay Error invoking the Edge Function", "FunctionsRelayError", e);
      }
    }, rn = class extends tn {
      constructor(e) {
        super("Edge Function returned a non-2xx status code", "FunctionsHttpError", e);
      }
    }, zn;
    (function(t) {
      t.Any = "any", t.ApNortheast1 = "ap-northeast-1", t.ApNortheast2 = "ap-northeast-2", t.ApSouth1 = "ap-south-1", t.ApSoutheast1 = "ap-southeast-1", t.ApSoutheast2 = "ap-southeast-2", t.CaCentral1 = "ca-central-1", t.EuCentral1 = "eu-central-1", t.EuWest1 = "eu-west-1", t.EuWest2 = "eu-west-2", t.EuWest3 = "eu-west-3", t.SaEast1 = "sa-east-1", t.UsEast1 = "us-east-1", t.UsWest1 = "us-west-1", t.UsWest2 = "us-west-2";
    })(zn || (zn = {}));
    var On = class {
      constructor(e, { headers: n = {}, customFetch: r, region: i = zn.Any } = {}) {
        this.url = e, this.headers = n, this.region = i, this.fetch = Va(r);
      }
      setAuth(e) {
        this.headers.Authorization = `Bearer ${e}`;
      }
      invoke(e) {
        return Ha(this, arguments, void 0, function* (n, r = {}) {
          var i;
          let a, s;
          try {
            let { headers: l, method: c, body: u, signal: d, timeout: h } = r, g = {}, { region: f } = r;
            f || (f = this.region);
            let m = new URL(`${this.url}/${n}`);
            f && f !== "any" && (g["x-region"] = f, m.searchParams.set("forceFunctionRegion", f));
            let b;
            u && (l && !Object.prototype.hasOwnProperty.call(l, "Content-Type") || !l) ? typeof Blob < "u" && u instanceof Blob || u instanceof ArrayBuffer ? (g["Content-Type"] = "application/octet-stream", b = u) : typeof u == "string" ? (g["Content-Type"] = "text/plain", b = u) : typeof FormData < "u" && u instanceof FormData ? b = u : (g["Content-Type"] = "application/json", b = JSON.stringify(u)) : u && typeof u != "string" && !(typeof Blob < "u" && u instanceof Blob) && !(u instanceof ArrayBuffer) && !(typeof FormData < "u" && u instanceof FormData) ? b = JSON.stringify(u) : b = u;
            let v = d;
            h && (s = new AbortController(), a = setTimeout(() => s.abort(), h), d ? (v = s.signal, d.addEventListener("abort", () => s.abort())) : v = s.signal);
            let y = yield this.fetch(m.toString(), { method: c || "POST", headers: Object.assign(Object.assign(Object.assign({}, g), this.headers), l), body: b, signal: v }).catch((I) => {
              throw new Rn(I);
            }), k = y.headers.get("x-relay-error");
            if (k && k === "true") throw new nn(y);
            if (!y.ok) throw new rn(y);
            let _ = ((i = y.headers.get("Content-Type")) !== null && i !== void 0 ? i : "text/plain").split(";")[0].trim(), T;
            return _ === "application/json" ? T = yield y.json() : _ === "application/octet-stream" || _ === "application/pdf" ? T = yield y.blob() : _ === "text/event-stream" ? T = y : _ === "multipart/form-data" ? T = yield y.formData() : T = yield y.text(), { data: T, error: null, response: y };
          } catch (l) {
            return { data: null, error: l, response: l instanceof rn || l instanceof nn ? l.context : void 0 };
          } finally {
            a && clearTimeout(a);
          }
        });
      }
    };
    var Ja = (t) => Math.min(1e3 * 2 ** t, 3e4), Ol = [520, 503], Qa = ["GET", "HEAD", "OPTIONS"], es = class extends Error {
      constructor(t) {
        super(t.message), this.name = "PostgrestError", this.details = t.details, this.hint = t.hint, this.code = t.code;
      }
      toJSON() {
        return { name: this.name, message: this.message, details: this.details, hint: this.hint, code: this.code };
      }
    };
    function Za(t, e) {
      return new Promise((n) => {
        if (e?.aborted) {
          n();
          return;
        }
        let r = setTimeout(() => {
          e?.removeEventListener("abort", i), n();
        }, t);
        function i() {
          clearTimeout(r), n();
        }
        e?.addEventListener("abort", i);
      });
    }
    function Cl(t, e, n, r) {
      return !(!r || n >= 3 || !Qa.includes(t) || !Ol.includes(e));
    }
    var $l = class {
      constructor(t) {
        var e, n, r, i, a;
        this.shouldThrowOnError = false, this.retryEnabled = true, this.method = t.method, this.url = t.url, this.headers = new Headers(t.headers), this.schema = t.schema, this.body = t.body, this.shouldThrowOnError = (e = t.shouldThrowOnError) !== null && e !== void 0 ? e : false, this.signal = t.signal, this.isMaybeSingle = (n = t.isMaybeSingle) !== null && n !== void 0 ? n : false, this.shouldStripNulls = (r = t.shouldStripNulls) !== null && r !== void 0 ? r : false, this.urlLengthLimit = (i = t.urlLengthLimit) !== null && i !== void 0 ? i : 8e3, this.retryEnabled = (a = t.retry) !== null && a !== void 0 ? a : true, t.fetch ? this.fetch = t.fetch : this.fetch = fetch;
      }
      throwOnError() {
        return this.shouldThrowOnError = true, this;
      }
      stripNulls() {
        if (this.headers.get("Accept") === "text/csv") throw new Error("stripNulls() cannot be used with csv()");
        return this.shouldStripNulls = true, this;
      }
      setHeader(t, e) {
        return this.headers = new Headers(this.headers), this.headers.set(t, e), this;
      }
      retry(t) {
        return this.retryEnabled = t, this;
      }
      then(t, e) {
        var n = this;
        if (this.schema === void 0 || (["GET", "HEAD"].includes(this.method) ? this.headers.set("Accept-Profile", this.schema) : this.headers.set("Content-Profile", this.schema)), this.method !== "GET" && this.method !== "HEAD" && this.headers.set("Content-Type", "application/json"), this.shouldStripNulls) {
          let s = this.headers.get("Accept");
          s === "application/vnd.pgrst.object+json" ? this.headers.set("Accept", "application/vnd.pgrst.object+json;nulls=stripped") : (!s || s === "application/json") && this.headers.set("Accept", "application/vnd.pgrst.array+json;nulls=stripped");
        }
        let r = this.fetch, a = (async () => {
          let s = 0;
          for (; ; ) {
            let u = new Headers(n.headers);
            s > 0 && u.set("X-Retry-Count", String(s));
            let d;
            try {
              d = await r(n.url.toString(), { method: n.method, headers: u, body: JSON.stringify(n.body, (h, g) => typeof g == "bigint" ? g.toString() : g), signal: n.signal });
            } catch (h) {
              if (h?.name === "AbortError" || h?.code === "ABORT_ERR" || !Qa.includes(n.method)) throw h;
              if (n.retryEnabled && s < 3) {
                let g = Ja(s);
                s++, await Za(g, n.signal);
                continue;
              }
              throw h;
            }
            if (Cl(n.method, d.status, s, n.retryEnabled)) {
              var l, c;
              let h = (l = (c = d.headers) === null || c === void 0 ? void 0 : c.get("Retry-After")) !== null && l !== void 0 ? l : null, g = h !== null ? Math.max(0, parseInt(h, 10) || 0) * 1e3 : Ja(s);
              await d.text(), s++, await Za(g, n.signal);
              continue;
            }
            return await n.processResponse(d);
          }
        })();
        return this.shouldThrowOnError || (a = a.catch((s) => {
          var l;
          let c = "", u = "", d = "", h = s?.cause;
          if (h) {
            var g, f, m, b;
            let k = (g = h?.message) !== null && g !== void 0 ? g : "", _ = (f = h?.code) !== null && f !== void 0 ? f : "";
            c = `${(m = s?.name) !== null && m !== void 0 ? m : "FetchError"}: ${s?.message}`, c += `

Caused by: ${(b = h?.name) !== null && b !== void 0 ? b : "Error"}: ${k}`, _ && (c += ` (${_})`), h?.stack && (c += `
${h.stack}`);
          } else {
            var v;
            c = (v = s?.stack) !== null && v !== void 0 ? v : "";
          }
          let y = this.url.toString().length;
          return s?.name === "AbortError" || s?.code === "ABORT_ERR" ? (d = "", u = "Request was aborted (timeout or manual cancellation)", y > this.urlLengthLimit && (u += `. Note: Your request URL is ${y} characters, which may exceed server limits. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [many IDs])), consider using an RPC function to pass values server-side.`)) : (h?.name === "HeadersOverflowError" || h?.code === "UND_ERR_HEADERS_OVERFLOW") && (d = "", u = "HTTP headers exceeded server limits (typically 16KB)", y > this.urlLengthLimit && (u += `. Your request URL is ${y} characters. If selecting many fields, consider using views. If filtering with large arrays (e.g., .in('id', [200+ IDs])), consider using an RPC function instead.`)), { success: false, error: { message: `${(l = s?.name) !== null && l !== void 0 ? l : "FetchError"}: ${s?.message}`, details: c, hint: u, code: d }, data: null, count: null, status: 0, statusText: "" };
        })), a.then(t, e);
      }
      async processResponse(t) {
        var e = this;
        let n = null, r = null, i = null, a = t.status, s = t.statusText;
        if (t.ok) {
          var l, c;
          if (e.method !== "HEAD") {
            var u;
            let g = await t.text();
            g === "" || (e.headers.get("Accept") === "text/csv" || e.headers.get("Accept") && (!((u = e.headers.get("Accept")) === null || u === void 0) && u.includes("application/vnd.pgrst.plan+text")) ? r = g : r = JSON.parse(g));
          }
          let d = (l = e.headers.get("Prefer")) === null || l === void 0 ? void 0 : l.match(/count=(exact|planned|estimated)/), h = (c = t.headers.get("content-range")) === null || c === void 0 ? void 0 : c.split("/");
          d && h && h.length > 1 && (i = parseInt(h[1])), e.isMaybeSingle && Array.isArray(r) && (r.length > 1 ? (n = { code: "PGRST116", details: `Results contain ${r.length} rows, application/vnd.pgrst.object+json requires 1 row`, hint: null, message: "JSON object requested, multiple (or no) rows returned" }, r = null, i = null, a = 406, s = "Not Acceptable") : r.length === 1 ? r = r[0] : r = null);
        } else {
          let d = await t.text();
          try {
            n = JSON.parse(d), Array.isArray(n) && t.status === 404 && (r = [], n = null, a = 200, s = "OK");
          } catch {
            t.status === 404 && d === "" ? (a = 204, s = "No Content") : n = { message: d };
          }
          if (n && e.shouldThrowOnError) throw new es(n);
        }
        return { success: n === null, error: n, data: r, count: i, status: a, statusText: s };
      }
      returns() {
        return this;
      }
      overrideTypes() {
        return this;
      }
    }, Il = class extends $l {
      select(t) {
        let e = false, n = (t ?? "*").split("").map((r) => /\s/.test(r) && !e ? "" : (r === '"' && (e = !e), r)).join("");
        return this.url.searchParams.set("select", n), this.headers.append("Prefer", "return=representation"), this;
      }
      order(t, { ascending: e = true, nullsFirst: n, foreignTable: r, referencedTable: i = r } = {}) {
        let a = i ? `${i}.order` : "order", s = this.url.searchParams.get(a);
        return this.url.searchParams.set(a, `${s ? `${s},` : ""}${t}.${e ? "asc" : "desc"}${n === void 0 ? "" : n ? ".nullsfirst" : ".nullslast"}`), this;
      }
      limit(t, { foreignTable: e, referencedTable: n = e } = {}) {
        let r = typeof n > "u" ? "limit" : `${n}.limit`;
        return this.url.searchParams.set(r, `${t}`), this;
      }
      range(t, e, { foreignTable: n, referencedTable: r = n } = {}) {
        let i = typeof r > "u" ? "offset" : `${r}.offset`, a = typeof r > "u" ? "limit" : `${r}.limit`;
        return this.url.searchParams.set(i, `${t}`), this.url.searchParams.set(a, `${e - t + 1}`), this;
      }
      abortSignal(t) {
        return this.signal = t, this;
      }
      single() {
        return this.headers.set("Accept", "application/vnd.pgrst.object+json"), this;
      }
      maybeSingle() {
        return this.isMaybeSingle = true, this;
      }
      csv() {
        return this.headers.set("Accept", "text/csv"), this;
      }
      geojson() {
        return this.headers.set("Accept", "application/geo+json"), this;
      }
      explain({ analyze: t = false, verbose: e = false, settings: n = false, buffers: r = false, wal: i = false, format: a = "text" } = {}) {
        var s;
        let l = [t ? "analyze" : null, e ? "verbose" : null, n ? "settings" : null, r ? "buffers" : null, i ? "wal" : null].filter(Boolean).join("|"), c = (s = this.headers.get("Accept")) !== null && s !== void 0 ? s : "application/json";
        return this.headers.set("Accept", `application/vnd.pgrst.plan+${a}; for="${c}"; options=${l};`), a === "json" ? this : this;
      }
      rollback() {
        return this.headers.append("Prefer", "tx=rollback"), this;
      }
      returns() {
        return this;
      }
      maxAffected(t) {
        return this.headers.append("Prefer", "handling=strict"), this.headers.append("Prefer", `max-affected=${t}`), this;
      }
    }, Ya = new RegExp("[,()]"), an = class extends Il {
      eq(t, e) {
        return this.url.searchParams.append(t, `eq.${e}`), this;
      }
      neq(t, e) {
        return this.url.searchParams.append(t, `neq.${e}`), this;
      }
      gt(t, e) {
        return this.url.searchParams.append(t, `gt.${e}`), this;
      }
      gte(t, e) {
        return this.url.searchParams.append(t, `gte.${e}`), this;
      }
      lt(t, e) {
        return this.url.searchParams.append(t, `lt.${e}`), this;
      }
      lte(t, e) {
        return this.url.searchParams.append(t, `lte.${e}`), this;
      }
      like(t, e) {
        return this.url.searchParams.append(t, `like.${e}`), this;
      }
      likeAllOf(t, e) {
        return this.url.searchParams.append(t, `like(all).{${e.join(",")}}`), this;
      }
      likeAnyOf(t, e) {
        return this.url.searchParams.append(t, `like(any).{${e.join(",")}}`), this;
      }
      ilike(t, e) {
        return this.url.searchParams.append(t, `ilike.${e}`), this;
      }
      ilikeAllOf(t, e) {
        return this.url.searchParams.append(t, `ilike(all).{${e.join(",")}}`), this;
      }
      ilikeAnyOf(t, e) {
        return this.url.searchParams.append(t, `ilike(any).{${e.join(",")}}`), this;
      }
      regexMatch(t, e) {
        return this.url.searchParams.append(t, `match.${e}`), this;
      }
      regexIMatch(t, e) {
        return this.url.searchParams.append(t, `imatch.${e}`), this;
      }
      is(t, e) {
        return this.url.searchParams.append(t, `is.${e}`), this;
      }
      isDistinct(t, e) {
        return this.url.searchParams.append(t, `isdistinct.${e}`), this;
      }
      in(t, e) {
        let n = Array.from(new Set(e)).map((r) => typeof r == "string" && Ya.test(r) ? `"${r}"` : `${r}`).join(",");
        return this.url.searchParams.append(t, `in.(${n})`), this;
      }
      notIn(t, e) {
        let n = Array.from(new Set(e)).map((r) => typeof r == "string" && Ya.test(r) ? `"${r}"` : `${r}`).join(",");
        return this.url.searchParams.append(t, `not.in.(${n})`), this;
      }
      contains(t, e) {
        return typeof e == "string" ? this.url.searchParams.append(t, `cs.${e}`) : Array.isArray(e) ? this.url.searchParams.append(t, `cs.{${e.join(",")}}`) : this.url.searchParams.append(t, `cs.${JSON.stringify(e)}`), this;
      }
      containedBy(t, e) {
        return typeof e == "string" ? this.url.searchParams.append(t, `cd.${e}`) : Array.isArray(e) ? this.url.searchParams.append(t, `cd.{${e.join(",")}}`) : this.url.searchParams.append(t, `cd.${JSON.stringify(e)}`), this;
      }
      rangeGt(t, e) {
        return this.url.searchParams.append(t, `sr.${e}`), this;
      }
      rangeGte(t, e) {
        return this.url.searchParams.append(t, `nxl.${e}`), this;
      }
      rangeLt(t, e) {
        return this.url.searchParams.append(t, `sl.${e}`), this;
      }
      rangeLte(t, e) {
        return this.url.searchParams.append(t, `nxr.${e}`), this;
      }
      rangeAdjacent(t, e) {
        return this.url.searchParams.append(t, `adj.${e}`), this;
      }
      overlaps(t, e) {
        return typeof e == "string" ? this.url.searchParams.append(t, `ov.${e}`) : this.url.searchParams.append(t, `ov.{${e.join(",")}}`), this;
      }
      textSearch(t, e, { config: n, type: r } = {}) {
        let i = "";
        r === "plain" ? i = "pl" : r === "phrase" ? i = "ph" : r === "websearch" && (i = "w");
        let a = n === void 0 ? "" : `(${n})`;
        return this.url.searchParams.append(t, `${i}fts${a}.${e}`), this;
      }
      match(t) {
        return Object.entries(t).filter(([e, n]) => n !== void 0).forEach(([e, n]) => {
          this.url.searchParams.append(e, `eq.${n}`);
        }), this;
      }
      not(t, e, n) {
        return this.url.searchParams.append(t, `not.${e}.${n}`), this;
      }
      or(t, { foreignTable: e, referencedTable: n = e } = {}) {
        let r = n ? `${n}.or` : "or";
        return this.url.searchParams.append(r, `(${t})`), this;
      }
      filter(t, e, n) {
        return this.url.searchParams.append(t, `${e}.${n}`), this;
      }
    }, Bl = class {
      constructor(t, { headers: e = {}, schema: n, fetch: r, urlLengthLimit: i = 8e3, retry: a }) {
        this.url = t, this.headers = new Headers(e), this.schema = n, this.fetch = r, this.urlLengthLimit = i, this.retry = a;
      }
      cloneRequestState() {
        return { url: new URL(this.url.toString()), headers: new Headers(this.headers) };
      }
      select(t, e) {
        let { head: n = false, count: r } = e ?? {}, i = n ? "HEAD" : "GET", a = false, s = (t ?? "*").split("").map((u) => /\s/.test(u) && !a ? "" : (u === '"' && (a = !a), u)).join(""), { url: l, headers: c } = this.cloneRequestState();
        return l.searchParams.set("select", s), r && c.append("Prefer", `count=${r}`), new an({ method: i, url: l, headers: c, schema: this.schema, fetch: this.fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
      }
      insert(t, { count: e, defaultToNull: n = true } = {}) {
        var r;
        let i = "POST", { url: a, headers: s } = this.cloneRequestState();
        if (e && s.append("Prefer", `count=${e}`), n || s.append("Prefer", "missing=default"), Array.isArray(t)) {
          let l = t.reduce((c, u) => c.concat(Object.keys(u)), []);
          if (l.length > 0) {
            let c = [...new Set(l)].map((u) => `"${u}"`);
            a.searchParams.set("columns", c.join(","));
          }
        }
        return new an({ method: i, url: a, headers: s, schema: this.schema, body: t, fetch: (r = this.fetch) !== null && r !== void 0 ? r : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
      }
      upsert(t, { onConflict: e, ignoreDuplicates: n = false, count: r, defaultToNull: i = true } = {}) {
        var a;
        let s = "POST", { url: l, headers: c } = this.cloneRequestState();
        if (c.append("Prefer", `resolution=${n ? "ignore" : "merge"}-duplicates`), e !== void 0 && l.searchParams.set("on_conflict", e), r && c.append("Prefer", `count=${r}`), i || c.append("Prefer", "missing=default"), Array.isArray(t)) {
          let u = t.reduce((d, h) => d.concat(Object.keys(h)), []);
          if (u.length > 0) {
            let d = [...new Set(u)].map((h) => `"${h}"`);
            l.searchParams.set("columns", d.join(","));
          }
        }
        return new an({ method: s, url: l, headers: c, schema: this.schema, body: t, fetch: (a = this.fetch) !== null && a !== void 0 ? a : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
      }
      update(t, { count: e } = {}) {
        var n;
        let r = "PATCH", { url: i, headers: a } = this.cloneRequestState();
        return e && a.append("Prefer", `count=${e}`), new an({ method: r, url: i, headers: a, schema: this.schema, body: t, fetch: (n = this.fetch) !== null && n !== void 0 ? n : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
      }
      delete({ count: t } = {}) {
        var e;
        let n = "DELETE", { url: r, headers: i } = this.cloneRequestState();
        return t && i.append("Prefer", `count=${t}`), new an({ method: n, url: r, headers: i, schema: this.schema, fetch: (e = this.fetch) !== null && e !== void 0 ? e : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
      }
    };
    function Cn(t) {
      "@babel/helpers - typeof";
      return Cn = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
        return typeof e;
      } : function(e) {
        return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
      }, Cn(t);
    }
    function Ll(t, e) {
      if (Cn(t) != "object" || !t) return t;
      var n = t[Symbol.toPrimitive];
      if (n !== void 0) {
        var r = n.call(t, e || "default");
        if (Cn(r) != "object") return r;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (e === "string" ? String : Number)(t);
    }
    function Nl(t) {
      var e = Ll(t, "string");
      return Cn(e) == "symbol" ? e : e + "";
    }
    function jl(t, e, n) {
      return (e = Nl(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: true, configurable: true, writable: true }) : t[e] = n, t;
    }
    function Xa(t, e) {
      var n = Object.keys(t);
      if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(t);
        e && (r = r.filter(function(i) {
          return Object.getOwnPropertyDescriptor(t, i).enumerable;
        })), n.push.apply(n, r);
      }
      return n;
    }
    function Rr(t) {
      for (var e = 1; e < arguments.length; e++) {
        var n = arguments[e] != null ? arguments[e] : {};
        e % 2 ? Xa(Object(n), true).forEach(function(r) {
          jl(t, r, n[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : Xa(Object(n)).forEach(function(r) {
          Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
        });
      }
      return t;
    }
    var ts = class ns {
      constructor(e, { headers: n = {}, schema: r, fetch: i, timeout: a, urlLengthLimit: s = 8e3, retry: l } = {}) {
        this.url = e, this.headers = new Headers(n), this.schemaName = r, this.urlLengthLimit = s;
        let c = i ?? globalThis.fetch;
        a !== void 0 && a > 0 ? this.fetch = (u, d) => {
          let h = new AbortController(), g = setTimeout(() => h.abort(), a), f = d?.signal;
          if (f) {
            if (f.aborted) return clearTimeout(g), c(u, d);
            let m = () => {
              clearTimeout(g), h.abort();
            };
            return f.addEventListener("abort", m, { once: true }), c(u, Rr(Rr({}, d), {}, { signal: h.signal })).finally(() => {
              clearTimeout(g), f.removeEventListener("abort", m);
            });
          }
          return c(u, Rr(Rr({}, d), {}, { signal: h.signal })).finally(() => clearTimeout(g));
        } : this.fetch = c, this.retry = l;
      }
      from(e) {
        if (!e || typeof e != "string" || e.trim() === "") throw new Error("Invalid relation name: relation must be a non-empty string.");
        return new Bl(new URL(`${this.url}/${e}`), { headers: new Headers(this.headers), schema: this.schemaName, fetch: this.fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
      }
      schema(e) {
        return new ns(this.url, { headers: this.headers, schema: e, fetch: this.fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
      }
      rpc(e, n = {}, { head: r = false, get: i = false, count: a } = {}) {
        var s;
        let l, c = new URL(`${this.url}/rpc/${e}`), u, d = (f) => f !== null && typeof f == "object" && (!Array.isArray(f) || f.some(d)), h = r && Object.values(n).some(d);
        h ? (l = "POST", u = n) : r || i ? (l = r ? "HEAD" : "GET", Object.entries(n).filter(([f, m]) => m !== void 0).map(([f, m]) => [f, Array.isArray(m) ? `{${m.join(",")}}` : `${m}`]).forEach(([f, m]) => {
          c.searchParams.append(f, m);
        })) : (l = "POST", u = n);
        let g = new Headers(this.headers);
        return h ? g.set("Prefer", a ? `count=${a},return=minimal` : "return=minimal") : a && g.set("Prefer", `count=${a}`), new an({ method: l, url: c, headers: g, schema: this.schemaName, body: u, fetch: (s = this.fetch) !== null && s !== void 0 ? s : fetch, urlLengthLimit: this.urlLengthLimit, retry: this.retry });
      }
    };
    var Oi = class {
      constructor() {
      }
      static detectEnvironment() {
        var e;
        if (typeof WebSocket < "u") return { type: "native", wsConstructor: WebSocket };
        let n = globalThis;
        if (typeof globalThis < "u" && typeof n.WebSocket < "u") return { type: "native", wsConstructor: n.WebSocket };
        let r = typeof global < "u" ? global : void 0;
        if (r && typeof r.WebSocket < "u") return { type: "native", wsConstructor: r.WebSocket };
        if (typeof globalThis < "u" && typeof n.WebSocketPair < "u" && typeof globalThis.WebSocket > "u") return { type: "cloudflare", error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.", workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime." };
        if (typeof globalThis < "u" && n.EdgeRuntime || typeof navigator < "u" && (!((e = navigator.userAgent) === null || e === void 0) && e.includes("Vercel-Edge"))) return { type: "unsupported", error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.", workaround: "Use serverless functions or a different deployment target for WebSocket functionality." };
        let i = globalThis.process;
        if (i) {
          let a = i.versions;
          if (a && a.node) {
            let s = a.node, l = parseInt(s.replace(/^v/, "").split(".")[0]);
            return l >= 22 ? typeof globalThis.WebSocket < "u" ? { type: "native", wsConstructor: globalThis.WebSocket } : { type: "unsupported", error: `Node.js ${l} detected but native WebSocket not found.`, workaround: "Provide a WebSocket implementation via the transport option." } : { type: "unsupported", error: `Node.js ${l} detected without native WebSocket support.`, workaround: `For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })` };
          }
        }
        return { type: "unsupported", error: "Unknown JavaScript runtime without WebSocket support.", workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation." };
      }
      static getWebSocketConstructor() {
        let e = this.detectEnvironment();
        if (e.wsConstructor) return e.wsConstructor;
        let n = e.error || "WebSocket not supported in this environment.";
        throw e.workaround && (n += `

Suggested solution: ${e.workaround}`), new Error(n);
      }
      static isWebSocketSupported() {
        try {
          let e = this.detectEnvironment();
          return e.type === "native" || e.type === "ws";
        } catch {
          return false;
        }
      }
    }, Ci = Oi;
    var rs = "2.106.1";
    var is = `realtime-js/${rs}`, as = "1.0.0", $i = "2.0.0", ss = $i;
    var os = 1e4;
    var ls = 100;
    var ct = { closed: "closed", errored: "errored", joined: "joined", joining: "joining", leaving: "leaving" }, zr = { close: "phx_close", error: "phx_error", join: "phx_join", reply: "phx_reply", leave: "phx_leave", access_token: "access_token" };
    var $n = { connecting: "connecting", open: "open", closing: "closing", closed: "closed" };
    var In = class {
      constructor(e) {
        this.HEADER_LENGTH = 1, this.USER_BROADCAST_PUSH_META_LENGTH = 6, this.KINDS = { userBroadcastPush: 3, userBroadcast: 4 }, this.BINARY_ENCODING = 0, this.JSON_ENCODING = 1, this.BROADCAST_EVENT = "broadcast", this.allowedMetadataKeys = [], this.allowedMetadataKeys = e ?? [];
      }
      encode(e, n) {
        if (e.event === this.BROADCAST_EVENT && !(e.payload instanceof ArrayBuffer) && typeof e.payload.event == "string") return n(this._binaryEncodeUserBroadcastPush(e));
        let r = [e.join_ref, e.ref, e.topic, e.event, e.payload];
        return n(JSON.stringify(r));
      }
      _binaryEncodeUserBroadcastPush(e) {
        var n;
        return this._isArrayBuffer((n = e.payload) === null || n === void 0 ? void 0 : n.payload) ? this._encodeBinaryUserBroadcastPush(e) : this._encodeJsonUserBroadcastPush(e);
      }
      _encodeBinaryUserBroadcastPush(e) {
        var n, r;
        let i = (r = (n = e.payload) === null || n === void 0 ? void 0 : n.payload) !== null && r !== void 0 ? r : new ArrayBuffer(0);
        return this._encodeUserBroadcastPush(e, this.BINARY_ENCODING, i);
      }
      _encodeJsonUserBroadcastPush(e) {
        var n, r;
        let i = (r = (n = e.payload) === null || n === void 0 ? void 0 : n.payload) !== null && r !== void 0 ? r : {}, s = new TextEncoder().encode(JSON.stringify(i)).buffer;
        return this._encodeUserBroadcastPush(e, this.JSON_ENCODING, s);
      }
      _encodeUserBroadcastPush(e, n, r) {
        var i, a;
        let s = e.topic, l = (i = e.ref) !== null && i !== void 0 ? i : "", c = (a = e.join_ref) !== null && a !== void 0 ? a : "", u = e.payload.event, d = this.allowedMetadataKeys ? this._pick(e.payload, this.allowedMetadataKeys) : {}, h = Object.keys(d).length === 0 ? "" : JSON.stringify(d);
        if (c.length > 255) throw new Error(`joinRef length ${c.length} exceeds maximum of 255`);
        if (l.length > 255) throw new Error(`ref length ${l.length} exceeds maximum of 255`);
        if (s.length > 255) throw new Error(`topic length ${s.length} exceeds maximum of 255`);
        if (u.length > 255) throw new Error(`userEvent length ${u.length} exceeds maximum of 255`);
        if (h.length > 255) throw new Error(`metadata length ${h.length} exceeds maximum of 255`);
        let g = this.USER_BROADCAST_PUSH_META_LENGTH + c.length + l.length + s.length + u.length + h.length, f = new ArrayBuffer(this.HEADER_LENGTH + g), m = new DataView(f), b = 0;
        m.setUint8(b++, this.KINDS.userBroadcastPush), m.setUint8(b++, c.length), m.setUint8(b++, l.length), m.setUint8(b++, s.length), m.setUint8(b++, u.length), m.setUint8(b++, h.length), m.setUint8(b++, n), Array.from(c, (y) => m.setUint8(b++, y.charCodeAt(0))), Array.from(l, (y) => m.setUint8(b++, y.charCodeAt(0))), Array.from(s, (y) => m.setUint8(b++, y.charCodeAt(0))), Array.from(u, (y) => m.setUint8(b++, y.charCodeAt(0))), Array.from(h, (y) => m.setUint8(b++, y.charCodeAt(0)));
        var v = new Uint8Array(f.byteLength + r.byteLength);
        return v.set(new Uint8Array(f), 0), v.set(new Uint8Array(r), f.byteLength), v.buffer;
      }
      decode(e, n) {
        if (this._isArrayBuffer(e)) {
          let r = this._binaryDecode(e);
          return n(r);
        }
        if (typeof e == "string") {
          let r = JSON.parse(e), [i, a, s, l, c] = r;
          return n({ join_ref: i, ref: a, topic: s, event: l, payload: c });
        }
        return n({});
      }
      _binaryDecode(e) {
        let n = new DataView(e), r = n.getUint8(0), i = new TextDecoder();
        switch (r) {
          case this.KINDS.userBroadcast:
            return this._decodeUserBroadcast(e, n, i);
        }
      }
      _decodeUserBroadcast(e, n, r) {
        let i = n.getUint8(1), a = n.getUint8(2), s = n.getUint8(3), l = n.getUint8(4), c = this.HEADER_LENGTH + 4, u = r.decode(e.slice(c, c + i));
        c = c + i;
        let d = r.decode(e.slice(c, c + a));
        c = c + a;
        let h = r.decode(e.slice(c, c + s));
        c = c + s;
        let g = e.slice(c, e.byteLength), f = l === this.JSON_ENCODING ? JSON.parse(r.decode(g)) : g, m = { type: this.BROADCAST_EVENT, event: d, payload: f };
        return s > 0 && (m.meta = JSON.parse(h)), { join_ref: null, ref: null, topic: u, event: this.BROADCAST_EVENT, payload: m };
      }
      _isArrayBuffer(e) {
        var n;
        return e instanceof ArrayBuffer || ((n = e?.constructor) === null || n === void 0 ? void 0 : n.name) === "ArrayBuffer";
      }
      _pick(e, n) {
        return !e || typeof e != "object" ? {} : Object.fromEntries(Object.entries(e).filter(([r]) => n.includes(r)));
      }
    };
    var pe;
    (function(t) {
      t.abstime = "abstime", t.bool = "bool", t.date = "date", t.daterange = "daterange", t.float4 = "float4", t.float8 = "float8", t.int2 = "int2", t.int4 = "int4", t.int4range = "int4range", t.int8 = "int8", t.int8range = "int8range", t.json = "json", t.jsonb = "jsonb", t.money = "money", t.numeric = "numeric", t.oid = "oid", t.reltime = "reltime", t.text = "text", t.time = "time", t.timestamp = "timestamp", t.timestamptz = "timestamptz", t.timetz = "timetz", t.tsrange = "tsrange", t.tstzrange = "tstzrange";
    })(pe || (pe = {}));
    var Bi = (t, e, n = {}) => {
      var r;
      let i = (r = n.skipTypes) !== null && r !== void 0 ? r : [];
      return e ? Object.keys(e).reduce((a, s) => (a[s] = Gl(s, t, e, i), a), {}) : {};
    }, Gl = (t, e, n, r) => {
      let i = e.find((l) => l.name === t), a = i?.type, s = n[t];
      return a && !r.includes(a) ? cs(a, s) : Ii(s);
    }, cs = (t, e) => {
      if (t.charAt(0) === "_") {
        let n = t.slice(1, t.length);
        return Kl(e, n);
      }
      switch (t) {
        case pe.bool:
          return Fl(e);
        case pe.float4:
        case pe.float8:
        case pe.int2:
        case pe.int4:
        case pe.int8:
        case pe.numeric:
        case pe.oid:
          return Ul(e);
        case pe.json:
        case pe.jsonb:
          return Ml(e);
        case pe.timestamp:
          return ql(e);
        case pe.abstime:
        case pe.date:
        case pe.daterange:
        case pe.int4range:
        case pe.int8range:
        case pe.money:
        case pe.reltime:
        case pe.text:
        case pe.time:
        case pe.timestamptz:
        case pe.timetz:
        case pe.tsrange:
        case pe.tstzrange:
          return Ii(e);
        default:
          return Ii(e);
      }
    }, Ii = (t) => t, Fl = (t) => {
      switch (t) {
        case "t":
          return true;
        case "f":
          return false;
        default:
          return t;
      }
    }, Ul = (t) => {
      if (typeof t == "string") {
        let e = parseFloat(t);
        if (!Number.isNaN(e)) return e;
      }
      return t;
    }, Ml = (t) => {
      if (typeof t == "string") try {
        return JSON.parse(t);
      } catch {
        return t;
      }
      return t;
    }, Kl = (t, e) => {
      if (typeof t != "string") return t;
      let n = t.length - 1, r = t[n];
      if (t[0] === "{" && r === "}") {
        let a, s = t.slice(1, n);
        try {
          a = JSON.parse("[" + s + "]");
        } catch {
          a = s ? s.split(",") : [];
        }
        return a.map((l) => cs(e, l));
      }
      return t;
    }, ql = (t) => typeof t == "string" ? t.replace(" ", "T") : t, Or = (t) => {
      let e = new URL(t);
      return e.protocol = e.protocol.replace(/^ws/i, "http"), e.pathname = e.pathname.replace(/\/+$/, "").replace(/\/socket\/websocket$/i, "").replace(/\/socket$/i, "").replace(/\/websocket$/i, ""), e.pathname === "" || e.pathname === "/" ? e.pathname = "/api/broadcast" : e.pathname = e.pathname + "/api/broadcast", e.href;
    };
    var ln = (t) => typeof t == "function" ? t : function() {
      return t;
    }, Hl = typeof self < "u" ? self : null, on = typeof window < "u" ? window : null, ut = Hl || on || globalThis, Vl = "2.0.0", Jl = 1e4, Zl = 1e3, Yl = 100, dt = { connecting: 0, open: 1, closing: 2, closed: 3 }, Ke = { closed: "closed", errored: "errored", joined: "joined", joining: "joining", leaving: "leaving" }, vt = { close: "phx_close", error: "phx_error", join: "phx_join", reply: "phx_reply", leave: "phx_leave" }, Li = { longpoll: "longpoll", websocket: "websocket" }, Xl = { complete: 4 }, Ni = "base64url.bearer.phx.", Cr = class {
      constructor(t, e, n, r) {
        this.channel = t, this.event = e, this.payload = n || function() {
          return {};
        }, this.receivedResp = null, this.timeout = r, this.timeoutTimer = null, this.recHooks = [], this.sent = false, this.ref = void 0;
      }
      resend(t) {
        this.timeout = t, this.reset(), this.send();
      }
      send() {
        this.hasReceived("timeout") || (this.startTimeout(), this.sent = true, this.channel.socket.push({ topic: this.channel.topic, event: this.event, payload: this.payload(), ref: this.ref, join_ref: this.channel.joinRef() }));
      }
      receive(t, e) {
        return this.hasReceived(t) && e(this.receivedResp.response), this.recHooks.push({ status: t, callback: e }), this;
      }
      reset() {
        this.cancelRefEvent(), this.ref = null, this.refEvent = null, this.receivedResp = null, this.sent = false;
      }
      destroy() {
        this.cancelRefEvent(), this.cancelTimeout();
      }
      matchReceive({ status: t, response: e, _ref: n }) {
        this.recHooks.filter((r) => r.status === t).forEach((r) => r.callback(e));
      }
      cancelRefEvent() {
        this.refEvent && this.channel.off(this.refEvent);
      }
      cancelTimeout() {
        clearTimeout(this.timeoutTimer), this.timeoutTimer = null;
      }
      startTimeout() {
        this.timeoutTimer && this.cancelTimeout(), this.ref = this.channel.socket.makeRef(), this.refEvent = this.channel.replyEventName(this.ref), this.channel.on(this.refEvent, (t) => {
          this.cancelRefEvent(), this.cancelTimeout(), this.receivedResp = t, this.matchReceive(t);
        }), this.timeoutTimer = setTimeout(() => {
          this.trigger("timeout", {});
        }, this.timeout);
      }
      hasReceived(t) {
        return this.receivedResp && this.receivedResp.status === t;
      }
      trigger(t, e) {
        this.channel.trigger(this.refEvent, { status: t, response: e });
      }
    }, us = class {
      constructor(t, e) {
        this.callback = t, this.timerCalc = e, this.timer = void 0, this.tries = 0;
      }
      reset() {
        this.tries = 0, clearTimeout(this.timer);
      }
      scheduleTimeout() {
        clearTimeout(this.timer), this.timer = setTimeout(() => {
          this.tries = this.tries + 1, this.callback();
        }, this.timerCalc(this.tries + 1));
      }
    }, Ql = class {
      constructor(t, e, n) {
        this.state = Ke.closed, this.topic = t, this.params = ln(e || {}), this.socket = n, this.bindings = [], this.bindingRef = 0, this.timeout = this.socket.timeout, this.joinedOnce = false, this.joinPush = new Cr(this, vt.join, this.params, this.timeout), this.pushBuffer = [], this.stateChangeRefs = [], this.rejoinTimer = new us(() => {
          this.socket.isConnected() && this.rejoin();
        }, this.socket.rejoinAfterMs), this.stateChangeRefs.push(this.socket.onError(() => this.rejoinTimer.reset())), this.stateChangeRefs.push(this.socket.onOpen(() => {
          this.rejoinTimer.reset(), this.isErrored() && this.rejoin();
        })), this.joinPush.receive("ok", () => {
          this.state = Ke.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((r) => r.send()), this.pushBuffer = [];
        }), this.joinPush.receive("error", (r) => {
          this.state = Ke.errored, this.socket.hasLogger() && this.socket.log("channel", `error ${this.topic}`, r), this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
        }), this.onClose(() => {
          this.rejoinTimer.reset(), this.socket.hasLogger() && this.socket.log("channel", `close ${this.topic}`), this.state = Ke.closed, this.socket.remove(this);
        }), this.onError((r) => {
          this.socket.hasLogger() && this.socket.log("channel", `error ${this.topic}`, r), this.isJoining() && this.joinPush.reset(), this.state = Ke.errored, this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
        }), this.joinPush.receive("timeout", () => {
          this.socket.hasLogger() && this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), new Cr(this, vt.leave, ln({}), this.timeout).send(), this.state = Ke.errored, this.joinPush.reset(), this.socket.isConnected() && this.rejoinTimer.scheduleTimeout();
        }), this.on(vt.reply, (r, i) => {
          this.trigger(this.replyEventName(i), r);
        });
      }
      join(t = this.timeout) {
        if (this.joinedOnce) throw new Error("tried to join multiple times. 'join' can only be called a single time per channel instance");
        return this.timeout = t, this.joinedOnce = true, this.rejoin(), this.joinPush;
      }
      teardown() {
        this.pushBuffer.forEach((t) => t.destroy()), this.pushBuffer = [], this.rejoinTimer.reset(), this.joinPush.destroy(), this.state = Ke.closed, this.bindings = [];
      }
      onClose(t) {
        this.on(vt.close, t);
      }
      onError(t) {
        return this.on(vt.error, (e) => t(e));
      }
      on(t, e) {
        let n = this.bindingRef++;
        return this.bindings.push({ event: t, ref: n, callback: e }), n;
      }
      off(t, e) {
        this.bindings = this.bindings.filter((n) => !(n.event === t && (typeof e > "u" || e === n.ref)));
      }
      canPush() {
        return this.socket.isConnected() && this.isJoined();
      }
      push(t, e, n = this.timeout) {
        if (e = e || {}, !this.joinedOnce) throw new Error(`tried to push '${t}' to '${this.topic}' before joining. Use channel.join() before pushing events`);
        let r = new Cr(this, t, function() {
          return e;
        }, n);
        return this.canPush() ? r.send() : (r.startTimeout(), this.pushBuffer.push(r)), r;
      }
      leave(t = this.timeout) {
        this.rejoinTimer.reset(), this.joinPush.cancelTimeout(), this.state = Ke.leaving;
        let e = () => {
          this.socket.hasLogger() && this.socket.log("channel", `leave ${this.topic}`), this.trigger(vt.close, "leave");
        }, n = new Cr(this, vt.leave, ln({}), t);
        return n.receive("ok", () => e()).receive("timeout", () => e()), n.send(), this.canPush() || n.trigger("ok", {}), n;
      }
      onMessage(t, e, n) {
        return e;
      }
      filterBindings(t, e, n) {
        return true;
      }
      isMember(t, e, n, r) {
        return this.topic !== t ? false : r && r !== this.joinRef() ? (this.socket.hasLogger() && this.socket.log("channel", "dropping outdated message", { topic: t, event: e, payload: n, joinRef: r }), false) : true;
      }
      joinRef() {
        return this.joinPush.ref;
      }
      rejoin(t = this.timeout) {
        this.isLeaving() || (this.socket.leaveOpenTopic(this.topic), this.state = Ke.joining, this.joinPush.resend(t));
      }
      trigger(t, e, n, r) {
        let i = this.onMessage(t, e, n, r);
        if (e && !i) throw new Error("channel onMessage callbacks must return the payload, modified or unmodified");
        let a = this.bindings.filter((s) => s.event === t && this.filterBindings(s, e, n));
        for (let s = 0; s < a.length; s++) a[s].callback(i, n, r || this.joinRef());
      }
      replyEventName(t) {
        return `chan_reply_${t}`;
      }
      isClosed() {
        return this.state === Ke.closed;
      }
      isErrored() {
        return this.state === Ke.errored;
      }
      isJoined() {
        return this.state === Ke.joined;
      }
      isJoining() {
        return this.state === Ke.joining;
      }
      isLeaving() {
        return this.state === Ke.leaving;
      }
    }, Ir = class {
      static request(t, e, n, r, i, a, s) {
        if (ut.XDomainRequest) {
          let l = new ut.XDomainRequest();
          return this.xdomainRequest(l, t, e, r, i, a, s);
        } else if (ut.XMLHttpRequest) {
          let l = new ut.XMLHttpRequest();
          return this.xhrRequest(l, t, e, n, r, i, a, s);
        } else {
          if (ut.fetch && ut.AbortController) return this.fetchRequest(t, e, n, r, i, a, s);
          throw new Error("No suitable XMLHttpRequest implementation found");
        }
      }
      static fetchRequest(t, e, n, r, i, a, s) {
        let l = { method: t, headers: n, body: r }, c = null;
        if (i) {
          c = new AbortController();
          let u = setTimeout(() => c.abort(), i);
          l.signal = c.signal;
        }
        return ut.fetch(e, l).then((u) => u.text()).then((u) => this.parseJSON(u)).then((u) => s && s(u)).catch((u) => {
          u.name === "AbortError" && a ? a() : s && s(null);
        }), c;
      }
      static xdomainRequest(t, e, n, r, i, a, s) {
        return t.timeout = i, t.open(e, n), t.onload = () => {
          let l = this.parseJSON(t.responseText);
          s && s(l);
        }, a && (t.ontimeout = a), t.onprogress = () => {
        }, t.send(r), t;
      }
      static xhrRequest(t, e, n, r, i, a, s, l) {
        t.open(e, n, true), t.timeout = a;
        for (let [c, u] of Object.entries(r)) t.setRequestHeader(c, u);
        return t.onerror = () => l && l(null), t.onreadystatechange = () => {
          if (t.readyState === Xl.complete && l) {
            let c = this.parseJSON(t.responseText);
            l(c);
          }
        }, s && (t.ontimeout = s), t.send(i), t;
      }
      static parseJSON(t) {
        if (!t || t === "") return null;
        try {
          return JSON.parse(t);
        } catch {
          return console && console.log("failed to parse JSON response", t), null;
        }
      }
      static serialize(t, e) {
        let n = [];
        for (var r in t) {
          if (!Object.prototype.hasOwnProperty.call(t, r)) continue;
          let i = e ? `${e}[${r}]` : r, a = t[r];
          typeof a == "object" ? n.push(this.serialize(a, i)) : n.push(encodeURIComponent(i) + "=" + encodeURIComponent(a));
        }
        return n.join("&");
      }
      static appendParams(t, e) {
        if (Object.keys(e).length === 0) return t;
        let n = t.match(/\?/) ? "&" : "?";
        return `${t}${n}${this.serialize(e)}`;
      }
    }, ec = (t) => {
      let e = "", n = new Uint8Array(t), r = n.byteLength;
      for (let i = 0; i < r; i++) e += String.fromCharCode(n[i]);
      return btoa(e);
    }, sn = class {
      constructor(t, e) {
        e && e.length === 2 && e[1].startsWith(Ni) && (this.authToken = atob(e[1].slice(Ni.length))), this.endPoint = null, this.token = null, this.skipHeartbeat = true, this.reqs = /* @__PURE__ */ new Set(), this.awaitingBatchAck = false, this.currentBatch = null, this.currentBatchTimer = null, this.batchBuffer = [], this.onopen = function() {
        }, this.onerror = function() {
        }, this.onmessage = function() {
        }, this.onclose = function() {
        }, this.pollEndpoint = this.normalizeEndpoint(t), this.readyState = dt.connecting, setTimeout(() => this.poll(), 0);
      }
      normalizeEndpoint(t) {
        return t.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)/" + Li.websocket), "$1/" + Li.longpoll);
      }
      endpointURL() {
        return Ir.appendParams(this.pollEndpoint, { token: this.token });
      }
      closeAndRetry(t, e, n) {
        this.close(t, e, n), this.readyState = dt.connecting;
      }
      ontimeout() {
        this.onerror("timeout"), this.closeAndRetry(1005, "timeout", false);
      }
      isActive() {
        return this.readyState === dt.open || this.readyState === dt.connecting;
      }
      poll() {
        let t = { Accept: "application/json" };
        this.authToken && (t["X-Phoenix-AuthToken"] = this.authToken), this.ajax("GET", t, null, () => this.ontimeout(), (e) => {
          if (e) {
            var { status: n, token: r, messages: i } = e;
            if (n === 410 && this.token !== null) {
              this.onerror(410), this.closeAndRetry(3410, "session_gone", false);
              return;
            }
            this.token = r;
          } else n = 0;
          switch (n) {
            case 200:
              i.forEach((a) => {
                setTimeout(() => this.onmessage({ data: a }), 0);
              }), this.poll();
              break;
            case 204:
              this.poll();
              break;
            case 410:
              this.readyState = dt.open, this.onopen({}), this.poll();
              break;
            case 403:
              this.onerror(403), this.close(1008, "forbidden", false);
              break;
            case 0:
            case 500:
              this.onerror(500), this.closeAndRetry(1011, "internal server error", 500);
              break;
            default:
              throw new Error(`unhandled poll status ${n}`);
          }
        });
      }
      send(t) {
        typeof t != "string" && (t = ec(t)), this.currentBatch ? this.currentBatch.push(t) : this.awaitingBatchAck ? this.batchBuffer.push(t) : (this.currentBatch = [t], this.currentBatchTimer = setTimeout(() => {
          this.batchSend(this.currentBatch), this.currentBatch = null;
        }, 0));
      }
      batchSend(t, e = 0) {
        this.awaitingBatchAck = true;
        let n = e + Yl, r = t.slice(e, n);
        this.ajax("POST", { "Content-Type": "application/x-ndjson" }, r.join(`
`), () => this.onerror("timeout"), (i) => {
          !i || i.status !== 200 ? (this.awaitingBatchAck = false, this.onerror(i && i.status), this.closeAndRetry(1011, "internal server error", false)) : n < t.length ? this.batchSend(t, n) : this.batchBuffer.length > 0 ? (this.batchSend(this.batchBuffer), this.batchBuffer = []) : this.awaitingBatchAck = false;
        });
      }
      close(t, e, n) {
        for (let i of this.reqs) i.abort();
        this.readyState = dt.closed;
        let r = Object.assign({ code: 1e3, reason: void 0, wasClean: true }, { code: t, reason: e, wasClean: n });
        this.batchBuffer = [], clearTimeout(this.currentBatchTimer), this.currentBatchTimer = null, typeof CloseEvent < "u" ? this.onclose(new CloseEvent("close", r)) : this.onclose(r);
      }
      ajax(t, e, n, r, i) {
        let a, s = () => {
          this.reqs.delete(a), r();
        };
        a = Ir.request(t, this.endpointURL(), e, n, this.timeout, s, (l) => {
          this.reqs.delete(a), this.isActive() && i(l);
        }), this.reqs.add(a);
      }
    }, ds = class Bn {
      constructor(e, n = {}) {
        let r = n.events || { state: "presence_state", diff: "presence_diff" };
        this.state = /* @__PURE__ */ Object.create(null), this.pendingDiffs = [], this.channel = e, this.joinRef = null, this.caller = { onJoin: function() {
        }, onLeave: function() {
        }, onSync: function() {
        } }, this.channel.on(r.state, (i) => {
          let { onJoin: a, onLeave: s, onSync: l } = this.caller;
          this.joinRef = this.channel.joinRef(), this.state = Bn.syncState(this.state, i, a, s), this.pendingDiffs.forEach((c) => {
            this.state = Bn.syncDiff(this.state, c, a, s);
          }), this.pendingDiffs = [], l();
        }), this.channel.on(r.diff, (i) => {
          let { onJoin: a, onLeave: s, onSync: l } = this.caller;
          this.inPendingSyncState() ? this.pendingDiffs.push(i) : (this.state = Bn.syncDiff(this.state, i, a, s), l());
        });
      }
      onJoin(e) {
        this.caller.onJoin = e;
      }
      onLeave(e) {
        this.caller.onLeave = e;
      }
      onSync(e) {
        this.caller.onSync = e;
      }
      list(e) {
        return Bn.list(this.state, e);
      }
      inPendingSyncState() {
        return !this.joinRef || this.joinRef !== this.channel.joinRef();
      }
      static syncState(e, n, r, i) {
        let a = this.toNullProtoObj(this.clone(e));
        n = this.toNullProtoObj(n);
        let s = /* @__PURE__ */ Object.create(null), l = /* @__PURE__ */ Object.create(null);
        return this.map(a, (c, u) => {
          n[c] || (l[c] = u);
        }), this.map(n, (c, u) => {
          let d = a[c];
          if (d) {
            let h = u.metas.map((b) => b.phx_ref), g = d.metas.map((b) => b.phx_ref), f = u.metas.filter((b) => g.indexOf(b.phx_ref) < 0), m = d.metas.filter((b) => h.indexOf(b.phx_ref) < 0);
            f.length > 0 && (s[c] = u, s[c].metas = f), m.length > 0 && (l[c] = this.clone(d), l[c].metas = m);
          } else s[c] = u;
        }), this.syncDiff(a, { joins: s, leaves: l }, r, i);
      }
      static syncDiff(e, n, r, i) {
        e = this.toNullProtoObj(e);
        let { joins: a, leaves: s } = this.clone(n);
        return r || (r = function() {
        }), i || (i = function() {
        }), this.map(a, (l, c) => {
          let u = e[l];
          if (e[l] = this.clone(c), u) {
            let d = e[l].metas.map((g) => g.phx_ref), h = u.metas.filter((g) => d.indexOf(g.phx_ref) < 0);
            e[l].metas.unshift(...h);
          }
          r(l, u, c);
        }), this.map(s, (l, c) => {
          let u = e[l];
          if (!u) return;
          let d = c.metas.map((h) => h.phx_ref);
          u.metas = u.metas.filter((h) => d.indexOf(h.phx_ref) < 0), i(l, u, c), u.metas.length === 0 && delete e[l];
        }), e;
      }
      static list(e, n) {
        return n || (n = function(r, i) {
          return i;
        }), this.map(e, (r, i) => n(r, i));
      }
      static map(e, n) {
        return Object.getOwnPropertyNames(e).map((r) => n(r, e[r]));
      }
      static toNullProtoObj(e) {
        if (Object.getPrototypeOf(e) === null) return e;
        let n = /* @__PURE__ */ Object.create(null);
        return Object.getOwnPropertyNames(e).forEach((r) => {
          n[r] = e[r];
        }), n;
      }
      static clone(e) {
        return JSON.parse(JSON.stringify(e));
      }
    }, $r = { HEADER_LENGTH: 1, META_LENGTH: 4, KINDS: { push: 0, reply: 1, broadcast: 2 }, encode(t, e) {
      if (t.payload.constructor === ArrayBuffer) return e(this.binaryEncode(t));
      {
        let n = [t.join_ref, t.ref, t.topic, t.event, t.payload];
        return e(JSON.stringify(n));
      }
    }, decode(t, e) {
      if (t.constructor === ArrayBuffer) return e(this.binaryDecode(t));
      {
        let [n, r, i, a, s] = JSON.parse(t);
        return e({ join_ref: n, ref: r, topic: i, event: a, payload: s });
      }
    }, binaryEncode(t) {
      let { join_ref: e, ref: n, event: r, topic: i, payload: a } = t, s = new TextEncoder(), l = s.encode(e), c = s.encode(n), u = s.encode(i), d = s.encode(r);
      this.assertFieldSize(l.byteLength, "join_ref"), this.assertFieldSize(c.byteLength, "ref"), this.assertFieldSize(u.byteLength, "topic"), this.assertFieldSize(d.byteLength, "event");
      let h = this.META_LENGTH + l.byteLength + c.byteLength + u.byteLength + d.byteLength, g = new ArrayBuffer(this.HEADER_LENGTH + h), f = new Uint8Array(g), m = new DataView(g), b = 0;
      m.setUint8(b++, this.KINDS.push), m.setUint8(b++, l.byteLength), m.setUint8(b++, c.byteLength), m.setUint8(b++, u.byteLength), m.setUint8(b++, d.byteLength), f.set(l, b), b += l.byteLength, f.set(c, b), b += c.byteLength, f.set(u, b), b += u.byteLength, f.set(d, b), b += d.byteLength;
      var v = new Uint8Array(g.byteLength + a.byteLength);
      return v.set(f, 0), v.set(new Uint8Array(a), g.byteLength), v.buffer;
    }, assertFieldSize(t, e) {
      if (t > 255) throw new Error(`unable to convert ${e} to binary: must be less than or equal to 255 bytes, but is ${t} bytes`);
    }, binaryDecode(t) {
      let e = new DataView(t), n = e.getUint8(0), r = new TextDecoder();
      switch (n) {
        case this.KINDS.push:
          return this.decodePush(t, e, r);
        case this.KINDS.reply:
          return this.decodeReply(t, e, r);
        case this.KINDS.broadcast:
          return this.decodeBroadcast(t, e, r);
      }
    }, decodePush(t, e, n) {
      let r = e.getUint8(1), i = e.getUint8(2), a = e.getUint8(3), s = this.HEADER_LENGTH + this.META_LENGTH - 1, l = n.decode(t.slice(s, s + r));
      s = s + r;
      let c = n.decode(t.slice(s, s + i));
      s = s + i;
      let u = n.decode(t.slice(s, s + a));
      s = s + a;
      let d = t.slice(s, t.byteLength);
      return { join_ref: l, ref: null, topic: c, event: u, payload: d };
    }, decodeReply(t, e, n) {
      let r = e.getUint8(1), i = e.getUint8(2), a = e.getUint8(3), s = e.getUint8(4), l = this.HEADER_LENGTH + this.META_LENGTH, c = n.decode(t.slice(l, l + r));
      l = l + r;
      let u = n.decode(t.slice(l, l + i));
      l = l + i;
      let d = n.decode(t.slice(l, l + a));
      l = l + a;
      let h = n.decode(t.slice(l, l + s));
      l = l + s;
      let g = t.slice(l, t.byteLength), f = { status: h, response: g };
      return { join_ref: c, ref: u, topic: d, event: vt.reply, payload: f };
    }, decodeBroadcast(t, e, n) {
      let r = e.getUint8(1), i = e.getUint8(2), a = this.HEADER_LENGTH + 2, s = n.decode(t.slice(a, a + r));
      a = a + r;
      let l = n.decode(t.slice(a, a + i));
      a = a + i;
      let c = t.slice(a, t.byteLength);
      return { join_ref: null, ref: null, topic: s, event: l, payload: c };
    } }, hs = class {
      constructor(t, e = {}) {
        this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] }, this.channels = [], this.sendBuffer = [], this.ref = 0, this.fallbackRef = null, this.timeout = e.timeout || Jl, this.transport = e.transport || ut.WebSocket || sn, this.conn = void 0, this.primaryPassedHealthCheck = false, this.longPollFallbackMs = e.longPollFallbackMs, this.fallbackTimer = null;
        let n = null;
        try {
          n = ut && ut.sessionStorage;
        } catch {
        }
        this.sessionStore = e.sessionStorage || n, this.establishedConnections = 0, this.defaultEncoder = $r.encode.bind($r), this.defaultDecoder = $r.decode.bind($r), this.closeWasClean = true, this.disconnecting = false, this.binaryType = e.binaryType || "arraybuffer", this.connectClock = 1, this.pageHidden = false, this.encode = void 0, this.decode = void 0, this.transport !== sn ? (this.encode = e.encode || this.defaultEncoder, this.decode = e.decode || this.defaultDecoder) : (this.encode = this.defaultEncoder, this.decode = this.defaultDecoder);
        let r = null;
        on && on.addEventListener && (on.addEventListener("pagehide", (i) => {
          this.conn && (this.disconnect(), r = this.connectClock);
        }), on.addEventListener("pageshow", (i) => {
          r === this.connectClock && (r = null, this.connect());
        }), on.addEventListener("visibilitychange", () => {
          document.visibilityState === "hidden" ? this.pageHidden = true : (this.pageHidden = false, !this.isConnected() && !this.closeWasClean && this.teardown(() => this.connect()));
        })), this.heartbeatIntervalMs = e.heartbeatIntervalMs || 3e4, this.autoSendHeartbeat = e.autoSendHeartbeat ?? true, this.heartbeatCallback = e.heartbeatCallback ?? (() => {
        }), this.rejoinAfterMs = (i) => e.rejoinAfterMs ? e.rejoinAfterMs(i) : [1e3, 2e3, 5e3][i - 1] || 1e4, this.reconnectAfterMs = (i) => e.reconnectAfterMs ? e.reconnectAfterMs(i) : [10, 50, 100, 150, 200, 250, 500, 1e3, 2e3][i - 1] || 5e3, this.logger = e.logger || null, !this.logger && e.debug && (this.logger = (i, a, s) => {
          console.log(`${i}: ${a}`, s);
        }), this.longpollerTimeout = e.longpollerTimeout || 2e4, this.params = ln(e.params || {}), this.endPoint = `${t}/${Li.websocket}`, this.vsn = e.vsn || Vl, this.heartbeatTimeoutTimer = null, this.heartbeatTimer = null, this.heartbeatSentAt = null, this.pendingHeartbeatRef = null, this.reconnectTimer = new us(() => {
          if (this.pageHidden) {
            this.log("Not reconnecting as page is hidden!"), this.teardown();
            return;
          }
          this.teardown(async () => {
            e.beforeReconnect && await e.beforeReconnect(), this.connect();
          });
        }, this.reconnectAfterMs), this.authToken = e.authToken && ln(e.authToken);
      }
      getLongPollTransport() {
        return sn;
      }
      replaceTransport(t) {
        this.connectClock++, this.closeWasClean = true, clearTimeout(this.fallbackTimer), this.reconnectTimer.reset(), this.conn && (this.conn.close(), this.conn = null), this.transport = t;
      }
      protocol() {
        return location.protocol.match(/^https/) ? "wss" : "ws";
      }
      endPointURL() {
        let t = Ir.appendParams(Ir.appendParams(this.endPoint, this.params()), { vsn: this.vsn });
        return t.charAt(0) !== "/" ? t : t.charAt(1) === "/" ? `${this.protocol()}:${t}` : `${this.protocol()}://${location.host}${t}`;
      }
      disconnect(t, e, n) {
        this.connectClock++, this.disconnecting = true, this.closeWasClean = true, clearTimeout(this.fallbackTimer), this.reconnectTimer.reset(), this.teardown(() => {
          this.disconnecting = false, t && t();
        }, e, n);
      }
      connect(t) {
        t && (console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor"), this.params = ln(t)), !(this.conn && !this.disconnecting) && (this.longPollFallbackMs && this.transport !== sn ? this.connectWithFallback(sn, this.longPollFallbackMs) : this.transportConnect());
      }
      log(t, e, n) {
        this.logger && this.logger(t, e, n);
      }
      hasLogger() {
        return this.logger !== null;
      }
      onOpen(t) {
        let e = this.makeRef();
        return this.stateChangeCallbacks.open.push([e, t]), e;
      }
      onClose(t) {
        let e = this.makeRef();
        return this.stateChangeCallbacks.close.push([e, t]), e;
      }
      onError(t) {
        let e = this.makeRef();
        return this.stateChangeCallbacks.error.push([e, t]), e;
      }
      onMessage(t) {
        let e = this.makeRef();
        return this.stateChangeCallbacks.message.push([e, t]), e;
      }
      onHeartbeat(t) {
        this.heartbeatCallback = t;
      }
      ping(t) {
        if (!this.isConnected()) return false;
        let e = this.makeRef(), n = Date.now();
        this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: e });
        let r = this.onMessage((i) => {
          i.ref === e && (this.off([r]), t(Date.now() - n));
        });
        return true;
      }
      transportName(t) {
        switch (t) {
          case sn:
            return "LongPoll";
          default:
            return t.name;
        }
      }
      transportConnect() {
        this.connectClock++, this.closeWasClean = false;
        let t;
        this.authToken && (t = ["phoenix", `${Ni}${btoa(this.authToken()).replace(/=/g, "")}`]), this.conn = new this.transport(this.endPointURL(), t), this.conn.binaryType = this.binaryType, this.conn.timeout = this.longpollerTimeout, this.conn.onopen = () => this.onConnOpen(), this.conn.onerror = (e) => this.onConnError(e), this.conn.onmessage = (e) => this.onConnMessage(e), this.conn.onclose = (e) => this.onConnClose(e);
      }
      getSession(t) {
        return this.sessionStore && this.sessionStore.getItem(t);
      }
      storeSession(t, e) {
        this.sessionStore && this.sessionStore.setItem(t, e);
      }
      connectWithFallback(t, e = 2500) {
        clearTimeout(this.fallbackTimer);
        let n = false, r = true, i, a, s = this.transportName(t), l = (c) => {
          this.log("transport", `falling back to ${s}...`, c), this.off([i, a]), r = false, this.replaceTransport(t), this.transportConnect();
        };
        if (this.getSession(`phx:fallback:${s}`)) return l("memorized");
        this.fallbackTimer = setTimeout(l, e), a = this.onError((c) => {
          this.log("transport", "error", c), r && !n && (clearTimeout(this.fallbackTimer), l(c));
        }), this.fallbackRef && this.off([this.fallbackRef]), this.fallbackRef = this.onOpen(() => {
          if (n = true, !r) {
            let c = this.transportName(t);
            return this.primaryPassedHealthCheck || this.storeSession(`phx:fallback:${c}`, "true"), this.log("transport", `established ${c} fallback`);
          }
          clearTimeout(this.fallbackTimer), this.fallbackTimer = setTimeout(l, e), this.ping((c) => {
            this.log("transport", "connected to primary after", c), this.primaryPassedHealthCheck = true, clearTimeout(this.fallbackTimer);
          });
        }), this.transportConnect();
      }
      clearHeartbeats() {
        clearTimeout(this.heartbeatTimer), clearTimeout(this.heartbeatTimeoutTimer);
      }
      onConnOpen() {
        this.hasLogger() && this.log("transport", `connected to ${this.endPointURL()}`), this.closeWasClean = false, this.disconnecting = false, this.establishedConnections++, this.flushSendBuffer(), this.reconnectTimer.reset(), this.autoSendHeartbeat && this.resetHeartbeat(), this.triggerStateCallbacks("open");
      }
      heartbeatTimeout() {
        if (this.pendingHeartbeatRef) {
          this.pendingHeartbeatRef = null, this.heartbeatSentAt = null, this.hasLogger() && this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
          try {
            this.heartbeatCallback("timeout");
          } catch (t) {
            this.log("error", "error in heartbeat callback", t);
          }
          this.triggerChanError(new Error("heartbeat timeout")), this.closeWasClean = false, this.teardown(() => this.reconnectTimer.scheduleTimeout(), Zl, "heartbeat timeout");
        }
      }
      resetHeartbeat() {
        this.conn && this.conn.skipHeartbeat || (this.pendingHeartbeatRef = null, this.clearHeartbeats(), this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs));
      }
      teardown(t, e, n) {
        if (!this.conn) return t && t();
        let r = this.conn;
        this.waitForBufferDone(r, () => {
          e ? r.close(e, n || "") : r.close(), this.waitForSocketClosed(r, () => {
            this.conn === r && (this.conn.onopen = function() {
            }, this.conn.onerror = function() {
            }, this.conn.onmessage = function() {
            }, this.conn.onclose = function() {
            }, this.conn = null), t && t();
          });
        });
      }
      waitForBufferDone(t, e, n = 1) {
        if (n === 5 || !t.bufferedAmount) {
          e();
          return;
        }
        setTimeout(() => {
          this.waitForBufferDone(t, e, n + 1);
        }, 150 * n);
      }
      waitForSocketClosed(t, e, n = 1) {
        if (n === 5 || t.readyState === dt.closed) {
          e();
          return;
        }
        setTimeout(() => {
          this.waitForSocketClosed(t, e, n + 1);
        }, 150 * n);
      }
      onConnClose(t) {
        this.conn && (this.conn.onclose = () => {
        }), this.hasLogger() && this.log("transport", "close", t), this.triggerChanError(t), this.clearHeartbeats(), this.closeWasClean || this.reconnectTimer.scheduleTimeout(), this.triggerStateCallbacks("close", t);
      }
      onConnError(t) {
        this.hasLogger() && this.log("transport", "error", t);
        let e = this.transport, n = this.establishedConnections;
        this.triggerStateCallbacks("error", t, e, n), (e === this.transport || n > 0) && this.triggerChanError(t);
      }
      triggerChanError(t) {
        this.channels.forEach((e) => {
          e.isErrored() || e.isLeaving() || e.isClosed() || e.trigger(vt.error, t);
        });
      }
      connectionState() {
        switch (this.conn && this.conn.readyState) {
          case dt.connecting:
            return "connecting";
          case dt.open:
            return "open";
          case dt.closing:
            return "closing";
          default:
            return "closed";
        }
      }
      isConnected() {
        return this.connectionState() === "open";
      }
      remove(t) {
        this.off(t.stateChangeRefs), this.channels = this.channels.filter((e) => e !== t);
      }
      off(t) {
        for (let e in this.stateChangeCallbacks) this.stateChangeCallbacks[e] = this.stateChangeCallbacks[e].filter(([n]) => t.indexOf(n) === -1);
      }
      channel(t, e = {}) {
        let n = new Ql(t, e, this);
        return this.channels.push(n), n;
      }
      push(t) {
        if (this.hasLogger()) {
          let { topic: e, event: n, payload: r, ref: i, join_ref: a } = t;
          this.log("push", `${e} ${n} (${a}, ${i})`, r);
        }
        this.isConnected() ? this.encode(t, (e) => this.conn.send(e)) : this.sendBuffer.push(() => this.encode(t, (e) => this.conn.send(e)));
      }
      makeRef() {
        let t = this.ref + 1;
        return t === this.ref ? this.ref = 0 : this.ref = t, this.ref.toString();
      }
      sendHeartbeat() {
        if (!this.isConnected()) {
          try {
            this.heartbeatCallback("disconnected");
          } catch (t) {
            this.log("error", "error in heartbeat callback", t);
          }
          return;
        }
        if (this.pendingHeartbeatRef) {
          this.heartbeatTimeout();
          return;
        }
        this.pendingHeartbeatRef = this.makeRef(), this.heartbeatSentAt = Date.now(), this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.pendingHeartbeatRef });
        try {
          this.heartbeatCallback("sent");
        } catch (t) {
          this.log("error", "error in heartbeat callback", t);
        }
        this.heartbeatTimeoutTimer = setTimeout(() => this.heartbeatTimeout(), this.heartbeatIntervalMs);
      }
      flushSendBuffer() {
        this.isConnected() && this.sendBuffer.length > 0 && (this.sendBuffer.forEach((t) => t()), this.sendBuffer = []);
      }
      onConnMessage(t) {
        this.decode(t.data, (e) => {
          let { topic: n, event: r, payload: i, ref: a, join_ref: s } = e;
          if (a && a === this.pendingHeartbeatRef) {
            let l = this.heartbeatSentAt ? Date.now() - this.heartbeatSentAt : void 0;
            this.clearHeartbeats();
            try {
              this.heartbeatCallback(i.status === "ok" ? "ok" : "error", l);
            } catch (c) {
              this.log("error", "error in heartbeat callback", c);
            }
            this.pendingHeartbeatRef = null, this.heartbeatSentAt = null, this.autoSendHeartbeat && (this.heartbeatTimer = setTimeout(() => this.sendHeartbeat(), this.heartbeatIntervalMs));
          }
          this.hasLogger() && this.log("receive", `${i.status || ""} ${n} ${r} ${a && "(" + a + ")" || ""}`.trim(), i);
          for (let l = 0; l < this.channels.length; l++) {
            let c = this.channels[l];
            c.isMember(n, r, i, s) && c.trigger(r, i, a, s);
          }
          this.triggerStateCallbacks("message", e);
        });
      }
      triggerStateCallbacks(t, ...e) {
        try {
          this.stateChangeCallbacks[t].forEach(([n, r]) => {
            try {
              r(...e);
            } catch (i) {
              this.log("error", `error in ${t} callback`, i);
            }
          });
        } catch (n) {
          this.log("error", `error triggering ${t} callbacks`, n);
        }
      }
      leaveOpenTopic(t) {
        let e = this.channels.find((n) => n.topic === t && (n.isJoined() || n.isJoining()));
        e && (this.hasLogger() && this.log("transport", `leaving duplicate topic "${t}"`), e.leave());
      }
    };
    var Ln = class t {
      constructor(e, n) {
        let r = nc(n);
        this.presence = new ds(e.getChannel(), r), this.presence.onJoin((i, a, s) => {
          let l = t.onJoinPayload(i, a, s);
          e.getChannel().trigger("presence", l);
        }), this.presence.onLeave((i, a, s) => {
          let l = t.onLeavePayload(i, a, s);
          e.getChannel().trigger("presence", l);
        }), this.presence.onSync(() => {
          e.getChannel().trigger("presence", { event: "sync" });
        });
      }
      get state() {
        return t.transformState(this.presence.state);
      }
      static transformState(e) {
        return e = tc(e), Object.getOwnPropertyNames(e).reduce((n, r) => {
          let i = e[r];
          return n[r] = Br(i), n;
        }, {});
      }
      static onJoinPayload(e, n, r) {
        let i = fs(n), a = Br(r);
        return { event: "join", key: e, currentPresences: i, newPresences: a };
      }
      static onLeavePayload(e, n, r) {
        let i = fs(n), a = Br(r);
        return { event: "leave", key: e, currentPresences: i, leftPresences: a };
      }
    };
    function Br(t) {
      return t.metas.map((e) => (e.presence_ref = e.phx_ref, delete e.phx_ref, delete e.phx_ref_prev, e));
    }
    function tc(t) {
      return JSON.parse(JSON.stringify(t));
    }
    function nc(t) {
      return t?.events && { events: t.events };
    }
    function fs(t) {
      return t?.metas ? Br(t) : [];
    }
    var ji;
    (function(t) {
      t.SYNC = "sync", t.JOIN = "join", t.LEAVE = "leave";
    })(ji || (ji = {}));
    var cn = class {
      get state() {
        return this.presenceAdapter.state;
      }
      constructor(e, n) {
        this.channel = e, this.presenceAdapter = new Ln(this.channel.channelAdapter, n);
      }
    };
    function gs(t) {
      if (t instanceof Error) return t;
      if (typeof t == "string") return new Error(t);
      if (t && typeof t == "object") {
        let e = t;
        if (typeof e.code == "number") {
          let n = typeof e.reason == "string" && e.reason ? ` (${e.reason})` : "";
          return new Error(`socket closed: ${e.code}${n}`, { cause: t });
        }
        return new Error("channel error: transport failure", { cause: t });
      }
      return new Error("channel error: connection lost");
    }
    var Nn = class {
      constructor(e, n, r) {
        let i = rc(r);
        this.channel = e.getSocket().channel(n, i), this.socket = e;
      }
      get state() {
        return this.channel.state;
      }
      set state(e) {
        this.channel.state = e;
      }
      get joinedOnce() {
        return this.channel.joinedOnce;
      }
      get joinPush() {
        return this.channel.joinPush;
      }
      get rejoinTimer() {
        return this.channel.rejoinTimer;
      }
      on(e, n) {
        return this.channel.on(e, n);
      }
      off(e, n) {
        this.channel.off(e, n);
      }
      subscribe(e) {
        return this.channel.join(e);
      }
      unsubscribe(e) {
        return this.channel.leave(e);
      }
      teardown() {
        this.channel.teardown();
      }
      onClose(e) {
        this.channel.onClose(e);
      }
      onError(e) {
        return this.channel.onError(e);
      }
      push(e, n, r) {
        let i;
        try {
          i = this.channel.push(e, n, r);
        } catch {
          throw new Error(`tried to push '${e}' to '${this.channel.topic}' before joining. Use channel.subscribe() before pushing events`);
        }
        if (this.channel.pushBuffer.length > ls) {
          let a = this.channel.pushBuffer.shift();
          a.cancelTimeout(), this.socket.log("channel", `discarded push due to buffer overflow: ${a.event}`, a.payload());
        }
        return i;
      }
      updateJoinPayload(e) {
        let n = this.channel.joinPush.payload();
        this.channel.joinPush.payload = () => Object.assign(Object.assign({}, n), e);
      }
      canPush() {
        return this.socket.isConnected() && this.state === ct.joined;
      }
      isJoined() {
        return this.state === ct.joined;
      }
      isJoining() {
        return this.state === ct.joining;
      }
      isClosed() {
        return this.state === ct.closed;
      }
      isLeaving() {
        return this.state === ct.leaving;
      }
      updateFilterBindings(e) {
        this.channel.filterBindings = e;
      }
      updatePayloadTransform(e) {
        this.channel.onMessage = e;
      }
      getChannel() {
        return this.channel;
      }
    };
    function rc(t) {
      return { config: Object.assign({ broadcast: { ack: false, self: false }, presence: { key: "", enabled: false }, private: false }, t.config) };
    }
    var Gi;
    (function(t) {
      t.ALL = "*", t.INSERT = "INSERT", t.UPDATE = "UPDATE", t.DELETE = "DELETE";
    })(Gi || (Gi = {}));
    var Lt;
    (function(t) {
      t.BROADCAST = "broadcast", t.PRESENCE = "presence", t.POSTGRES_CHANGES = "postgres_changes", t.SYSTEM = "system";
    })(Lt || (Lt = {}));
    var ht;
    (function(t) {
      t.SUBSCRIBED = "SUBSCRIBED", t.TIMED_OUT = "TIMED_OUT", t.CLOSED = "CLOSED", t.CHANNEL_ERROR = "CHANNEL_ERROR";
    })(ht || (ht = {}));
    var un = class t {
      get state() {
        return this.channelAdapter.state;
      }
      set state(e) {
        this.channelAdapter.state = e;
      }
      get joinedOnce() {
        return this.channelAdapter.joinedOnce;
      }
      get timeout() {
        return this.socket.timeout;
      }
      get joinPush() {
        return this.channelAdapter.joinPush;
      }
      get rejoinTimer() {
        return this.channelAdapter.rejoinTimer;
      }
      constructor(e, n = { config: {} }, r) {
        var i, a;
        if (this.topic = e, this.params = n, this.socket = r, this.bindings = {}, this.subTopic = e.replace(/^realtime:/i, ""), this.params.config = Object.assign({ broadcast: { ack: false, self: false }, presence: { key: "", enabled: false }, private: false }, n.config), this.channelAdapter = new Nn(this.socket.socketAdapter, e, this.params), this.presence = new cn(this), this._onClose(() => {
          this.socket._remove(this);
        }), this._updateFilterTransform(), this.broadcastEndpointURL = Or(this.socket.socketAdapter.endPointURL()), this.private = this.params.config.private || false, !this.private && (!((a = (i = this.params.config) === null || i === void 0 ? void 0 : i.broadcast) === null || a === void 0) && a.replay)) throw new Error(`tried to use replay on public channel '${this.topic}'. It must be a private channel.`);
      }
      subscribe(e, n = this.timeout) {
        var r, i, a;
        if (this.socket.isConnected() || this.socket.connect(), this.channelAdapter.isClosed()) {
          let { config: { broadcast: s, presence: l, private: c } } = this.params, u = (i = (r = this.bindings.postgres_changes) === null || r === void 0 ? void 0 : r.map((f) => f.filter)) !== null && i !== void 0 ? i : [], d = !!this.bindings[Lt.PRESENCE] && this.bindings[Lt.PRESENCE].length > 0 || ((a = this.params.config.presence) === null || a === void 0 ? void 0 : a.enabled) === true, h = {}, g = { broadcast: s, presence: Object.assign(Object.assign({}, l), { enabled: d }), postgres_changes: u, private: c };
          this.socket.accessTokenValue && (h.access_token = this.socket.accessTokenValue), this._onError((f) => {
            e?.(ht.CHANNEL_ERROR, gs(f));
          }), this._onClose(() => e?.(ht.CLOSED)), this.updateJoinPayload(Object.assign({ config: g }, h)), this._updateFilterMessage(), this.channelAdapter.subscribe(n).receive("ok", async ({ postgres_changes: f }) => {
            if (this.socket._isManualToken() || this.socket.setAuth(), f === void 0) {
              e?.(ht.SUBSCRIBED);
              return;
            }
            this._updatePostgresBindings(f, e);
          }).receive("error", (f) => {
            this.state = ct.errored;
            let m = Object.values(f).join(", ") || "error";
            e?.(ht.CHANNEL_ERROR, new Error(m, { cause: f }));
          }).receive("timeout", () => {
            e?.(ht.TIMED_OUT);
          });
        }
        return this;
      }
      _updatePostgresBindings(e, n) {
        var r;
        let i = this.bindings.postgres_changes, a = (r = i?.length) !== null && r !== void 0 ? r : 0, s = [];
        for (let l = 0; l < a; l++) {
          let c = i[l], { filter: { event: u, schema: d, table: h, filter: g } } = c, f = e && e[l];
          if (f && f.event === u && t.isFilterValueEqual(f.schema, d) && t.isFilterValueEqual(f.table, h) && t.isFilterValueEqual(f.filter, g)) s.push(Object.assign(Object.assign({}, c), { id: f.id }));
          else {
            this.unsubscribe(), this.state = ct.errored, n?.(ht.CHANNEL_ERROR, new Error("mismatch between server and client bindings for postgres changes"));
            return;
          }
        }
        this.bindings.postgres_changes = s, this.state != ct.errored && n && n(ht.SUBSCRIBED);
      }
      presenceState() {
        return this.presence.state;
      }
      async track(e, n = {}) {
        return await this.send({ type: "presence", event: "track", payload: e }, n.timeout || this.timeout);
      }
      async untrack(e = {}) {
        return await this.send({ type: "presence", event: "untrack" }, e);
      }
      on(e, n, r) {
        let i = this.channelAdapter.isJoined() || this.channelAdapter.isJoining(), a = e === Lt.PRESENCE || e === Lt.POSTGRES_CHANGES;
        if (i && a) throw this.socket.log("channel", `cannot add \`${e}\` callbacks for ${this.topic} after \`subscribe()\`.`), new Error(`cannot add \`${e}\` callbacks for ${this.topic} after \`subscribe()\`.`);
        return this._on(e, n, r);
      }
      async httpSend(e, n, r = {}) {
        var i;
        if (n == null) return Promise.reject(new Error("Payload is required for httpSend()"));
        let a = { apikey: this.socket.apiKey ? this.socket.apiKey : "", "Content-Type": "application/json" };
        this.socket.accessTokenValue && (a.Authorization = `Bearer ${this.socket.accessTokenValue}`);
        let s = { method: "POST", headers: a, body: JSON.stringify({ messages: [{ topic: this.subTopic, event: e, payload: n, private: this.private }] }) }, l = await this._fetchWithTimeout(this.broadcastEndpointURL, s, (i = r.timeout) !== null && i !== void 0 ? i : this.timeout);
        if (l.status === 202) return { success: true };
        let c = l.statusText;
        try {
          let u = await l.json();
          c = u.error || u.message || c;
        } catch {
        }
        return Promise.reject(new Error(c));
      }
      async send(e, n = {}) {
        var r, i;
        if (!this.channelAdapter.canPush() && e.type === "broadcast") {
          console.warn("Realtime send() is automatically falling back to REST API. This behavior will be deprecated in the future. Please use httpSend() explicitly for REST delivery.");
          let { event: a, payload: s } = e, l = { apikey: this.socket.apiKey ? this.socket.apiKey : "", "Content-Type": "application/json" };
          this.socket.accessTokenValue && (l.Authorization = `Bearer ${this.socket.accessTokenValue}`);
          let c = { method: "POST", headers: l, body: JSON.stringify({ messages: [{ topic: this.subTopic, event: a, payload: s, private: this.private }] }) };
          try {
            let u = await this._fetchWithTimeout(this.broadcastEndpointURL, c, (r = n.timeout) !== null && r !== void 0 ? r : this.timeout);
            return await ((i = u.body) === null || i === void 0 ? void 0 : i.cancel()), u.ok ? "ok" : "error";
          } catch (u) {
            return u instanceof Error && u.name === "AbortError" ? "timed out" : "error";
          }
        } else return new Promise((a) => {
          var s, l, c;
          let u = this.channelAdapter.push(e.type, e, n.timeout || this.timeout);
          e.type === "broadcast" && !(!((c = (l = (s = this.params) === null || s === void 0 ? void 0 : s.config) === null || l === void 0 ? void 0 : l.broadcast) === null || c === void 0) && c.ack) && a("ok"), u.receive("ok", () => a("ok")), u.receive("error", () => a("error")), u.receive("timeout", () => a("timed out"));
        });
      }
      updateJoinPayload(e) {
        this.channelAdapter.updateJoinPayload(e);
      }
      async unsubscribe(e = this.timeout) {
        return new Promise((n) => {
          this.channelAdapter.unsubscribe(e).receive("ok", () => n("ok")).receive("timeout", () => n("timed out")).receive("error", () => n("error"));
        });
      }
      teardown() {
        this.channelAdapter.teardown();
      }
      async _fetchWithTimeout(e, n, r) {
        let i = new AbortController(), a = setTimeout(() => i.abort(), r), s = await this.socket.fetch(e, Object.assign(Object.assign({}, n), { signal: i.signal }));
        return clearTimeout(a), s;
      }
      _on(e, n, r) {
        let i = e.toLocaleLowerCase(), a = this.channelAdapter.on(e, r), s = { type: i, filter: n, callback: r, ref: a };
        return this.bindings[i] ? this.bindings[i].push(s) : this.bindings[i] = [s], this._updateFilterMessage(), this;
      }
      _onClose(e) {
        this.channelAdapter.onClose(e);
      }
      _onError(e) {
        this.channelAdapter.onError(e);
      }
      _updateFilterMessage() {
        this.channelAdapter.updateFilterBindings((e, n, r) => {
          var i, a, s, l, c, u, d;
          let h = e.event.toLocaleLowerCase();
          if (this._notThisChannelEvent(h, r)) return false;
          let g = (i = this.bindings[h]) === null || i === void 0 ? void 0 : i.find((f) => f.ref === e.ref);
          if (!g) return true;
          if (["broadcast", "presence", "postgres_changes"].includes(h)) if ("id" in g) {
            let f = g.id, m = (a = g.filter) === null || a === void 0 ? void 0 : a.event;
            return f && ((s = n.ids) === null || s === void 0 ? void 0 : s.includes(f)) && (m === "*" || m?.toLocaleLowerCase() === ((l = n.data) === null || l === void 0 ? void 0 : l.type.toLocaleLowerCase()));
          } else {
            let f = (u = (c = g?.filter) === null || c === void 0 ? void 0 : c.event) === null || u === void 0 ? void 0 : u.toLocaleLowerCase();
            return f === "*" || f === ((d = n?.event) === null || d === void 0 ? void 0 : d.toLocaleLowerCase());
          }
          else return g.type.toLocaleLowerCase() === h;
        });
      }
      _notThisChannelEvent(e, n) {
        let { close: r, error: i, leave: a, join: s } = zr;
        return n && [r, i, a, s].includes(e) && n !== this.joinPush.ref;
      }
      _updateFilterTransform() {
        this.channelAdapter.updatePayloadTransform((e, n, r) => {
          if (typeof n == "object" && "ids" in n) {
            let i = n.data, { schema: a, table: s, commit_timestamp: l, type: c, errors: u } = i;
            return Object.assign(Object.assign({}, { schema: a, table: s, commit_timestamp: l, eventType: c, new: {}, old: {}, errors: u }), this._getPayloadRecords(i));
          }
          return n;
        });
      }
      copyBindings(e) {
        if (this.joinedOnce) throw new Error("cannot copy bindings into joined channel");
        for (let n in e.bindings) for (let r of e.bindings[n]) this._on(r.type, r.filter, r.callback);
      }
      static isFilterValueEqual(e, n) {
        return (e ?? void 0) === (n ?? void 0);
      }
      _getPayloadRecords(e) {
        let n = { new: {}, old: {} };
        return (e.type === "INSERT" || e.type === "UPDATE") && (n.new = Bi(e.columns, e.record)), (e.type === "UPDATE" || e.type === "DELETE") && (n.old = Bi(e.columns, e.old_record)), n;
      }
    };
    var jn = class {
      constructor(e, n) {
        this.socket = new hs(e, n);
      }
      get timeout() {
        return this.socket.timeout;
      }
      get endPoint() {
        return this.socket.endPoint;
      }
      get transport() {
        return this.socket.transport;
      }
      get heartbeatIntervalMs() {
        return this.socket.heartbeatIntervalMs;
      }
      get heartbeatCallback() {
        return this.socket.heartbeatCallback;
      }
      set heartbeatCallback(e) {
        this.socket.heartbeatCallback = e;
      }
      get heartbeatTimer() {
        return this.socket.heartbeatTimer;
      }
      get pendingHeartbeatRef() {
        return this.socket.pendingHeartbeatRef;
      }
      get reconnectTimer() {
        return this.socket.reconnectTimer;
      }
      get vsn() {
        return this.socket.vsn;
      }
      get encode() {
        return this.socket.encode;
      }
      get decode() {
        return this.socket.decode;
      }
      get reconnectAfterMs() {
        return this.socket.reconnectAfterMs;
      }
      get sendBuffer() {
        return this.socket.sendBuffer;
      }
      get stateChangeCallbacks() {
        return this.socket.stateChangeCallbacks;
      }
      connect() {
        this.socket.connect();
      }
      disconnect(e, n, r, i = 1e4) {
        return new Promise((a) => {
          setTimeout(() => a("timeout"), i), this.socket.disconnect(() => {
            e(), a("ok");
          }, n, r);
        });
      }
      push(e) {
        this.socket.push(e);
      }
      log(e, n, r) {
        this.socket.log(e, n, r);
      }
      makeRef() {
        return this.socket.makeRef();
      }
      onOpen(e) {
        this.socket.onOpen(e);
      }
      onClose(e) {
        this.socket.onClose(e);
      }
      onError(e) {
        this.socket.onError(e);
      }
      onMessage(e) {
        this.socket.onMessage(e);
      }
      isConnected() {
        return this.socket.isConnected();
      }
      isConnecting() {
        return this.socket.connectionState() == $n.connecting;
      }
      isDisconnecting() {
        return this.socket.connectionState() == $n.closing;
      }
      connectionState() {
        return this.socket.connectionState();
      }
      endPointURL() {
        return this.socket.endPointURL();
      }
      sendHeartbeat() {
        this.socket.sendHeartbeat();
      }
      getSocket() {
        return this.socket;
      }
    };
    var ps = { HEARTBEAT_INTERVAL: 25e3, RECONNECT_DELAY: 10, HEARTBEAT_TIMEOUT_FALLBACK: 100 }, ic = [1e3, 2e3, 5e3, 1e4], ac = 1e4;
    function sc() {
      let t = /* @__PURE__ */ new Map();
      return { get length() {
        return t.size;
      }, clear() {
        t.clear();
      }, getItem(e) {
        return t.has(e) ? t.get(e) : null;
      }, key(e) {
        var n;
        return (n = Array.from(t.keys())[e]) !== null && n !== void 0 ? n : null;
      }, removeItem(e) {
        t.delete(e);
      }, setItem(e, n) {
        t.set(e, String(n));
      } };
    }
    function oc() {
      try {
        if (typeof globalThis < "u" && globalThis.sessionStorage) return globalThis.sessionStorage;
      } catch {
      }
      return sc();
    }
    var lc = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`, dn = class {
      get endPoint() {
        return this.socketAdapter.endPoint;
      }
      get timeout() {
        return this.socketAdapter.timeout;
      }
      get transport() {
        return this.socketAdapter.transport;
      }
      get heartbeatCallback() {
        return this.socketAdapter.heartbeatCallback;
      }
      get heartbeatIntervalMs() {
        return this.socketAdapter.heartbeatIntervalMs;
      }
      get heartbeatTimer() {
        return this.worker ? this._workerHeartbeatTimer : this.socketAdapter.heartbeatTimer;
      }
      get pendingHeartbeatRef() {
        return this.worker ? this._pendingWorkerHeartbeatRef : this.socketAdapter.pendingHeartbeatRef;
      }
      get reconnectTimer() {
        return this.socketAdapter.reconnectTimer;
      }
      get vsn() {
        return this.socketAdapter.vsn;
      }
      get encode() {
        return this.socketAdapter.encode;
      }
      get decode() {
        return this.socketAdapter.decode;
      }
      get reconnectAfterMs() {
        return this.socketAdapter.reconnectAfterMs;
      }
      get sendBuffer() {
        return this.socketAdapter.sendBuffer;
      }
      get stateChangeCallbacks() {
        return this.socketAdapter.stateChangeCallbacks;
      }
      constructor(e, n) {
        var r;
        if (this.channels = new Array(), this.accessTokenValue = null, this.accessToken = null, this.apiKey = null, this.httpEndpoint = "", this.headers = {}, this.params = {}, this.ref = 0, this.serializer = new In(), this._manuallySetToken = false, this._authPromise = null, this._workerHeartbeatTimer = void 0, this._pendingWorkerHeartbeatRef = null, this._pendingDisconnectTimer = null, this._disconnectOnEmptyChannelsAfterMs = 0, this._resolveFetch = (a) => a ? (...s) => a(...s) : (...s) => fetch(...s), !(!((r = n?.params) === null || r === void 0) && r.apikey)) throw new Error("API key is required to connect to Realtime");
        this.apiKey = n.params.apikey;
        let i = this._initializeOptions(n);
        this.socketAdapter = new jn(e, i), this.httpEndpoint = Or(e), this.fetch = this._resolveFetch(n?.fetch);
      }
      connect() {
        if (!(this.isConnecting() || this.isDisconnecting() || this.isConnected())) {
          this.accessToken && !this._authPromise && this._setAuthSafely("connect"), this._setupConnectionHandlers();
          try {
            this.socketAdapter.connect();
          } catch (e) {
            let n = e.message;
            throw n.includes("Node.js") ? new Error(`${n}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`) : new Error(`WebSocket not available: ${n}`);
          }
          this._handleNodeJsRaceCondition();
        }
      }
      endpointURL() {
        return this.socketAdapter.endPointURL();
      }
      async disconnect(e, n) {
        return this._cancelPendingDisconnect(), this.isDisconnecting() ? "ok" : await this.socketAdapter.disconnect(() => {
          clearInterval(this._workerHeartbeatTimer), this._terminateWorker();
        }, e, n);
      }
      getChannels() {
        return this.channels;
      }
      async removeChannel(e) {
        let n = await e.unsubscribe();
        return n === "ok" && e.teardown(), n;
      }
      async removeAllChannels() {
        let e = this.channels.map(async (r) => {
          let i = await r.unsubscribe();
          return r.teardown(), i;
        }), n = await Promise.all(e);
        return await this.disconnect(), n;
      }
      log(e, n, r) {
        this.socketAdapter.log(e, n, r);
      }
      connectionState() {
        return this.socketAdapter.connectionState() || $n.closed;
      }
      isConnected() {
        return this.socketAdapter.isConnected();
      }
      isConnecting() {
        return this.socketAdapter.isConnecting();
      }
      isDisconnecting() {
        return this.socketAdapter.isDisconnecting();
      }
      channel(e, n = { config: {} }) {
        let r = `realtime:${e}`, i = this.getChannels().find((a) => a.topic === r);
        if (i) return i;
        {
          let a = new un(`realtime:${e}`, n, this);
          return this._cancelPendingDisconnect(), this.channels.push(a), a;
        }
      }
      push(e) {
        this.socketAdapter.push(e);
      }
      async setAuth(e = null) {
        this._authPromise = this._performAuth(e);
        try {
          await this._authPromise;
        } finally {
          this._authPromise = null;
        }
      }
      _isManualToken() {
        return this._manuallySetToken;
      }
      async sendHeartbeat() {
        this.socketAdapter.sendHeartbeat();
      }
      onHeartbeat(e) {
        this.socketAdapter.heartbeatCallback = this._wrapHeartbeatCallback(e);
      }
      _makeRef() {
        return this.socketAdapter.makeRef();
      }
      _remove(e) {
        this.channels = this.channels.filter((n) => n.topic !== e.topic), this.channels.length === 0 && (this.log("transport", "no channels remaining, scheduling disconnect"), this._schedulePendingDisconnect());
      }
      _schedulePendingDisconnect() {
        if (this._cancelPendingDisconnect(), this._disconnectOnEmptyChannelsAfterMs === 0) {
          this.log("transport", "disconnecting immediately - no channels"), this.disconnect();
          return;
        }
        this._pendingDisconnectTimer = setTimeout(() => {
          this._pendingDisconnectTimer = null, this.channels.length === 0 && (this.log("transport", "deferred disconnect fired - no channels, disconnecting"), this.disconnect());
        }, this._disconnectOnEmptyChannelsAfterMs), this.log("transport", `deferred disconnect scheduled in ${this._disconnectOnEmptyChannelsAfterMs}ms`);
      }
      _cancelPendingDisconnect() {
        this._pendingDisconnectTimer !== null && (this.log("transport", "pending disconnect cancelled - channel activity detected"), clearTimeout(this._pendingDisconnectTimer), this._pendingDisconnectTimer = null);
      }
      async _performAuth(e = null) {
        let n, r = false;
        if (e) n = e, r = true;
        else if (this.accessToken) try {
          n = await this.accessToken();
        } catch (i) {
          this.log("error", "Error fetching access token from callback", i), n = this.accessTokenValue;
        }
        else n = this.accessTokenValue;
        r ? this._manuallySetToken = true : this.accessToken && (this._manuallySetToken = false), this.accessTokenValue != n && (this.accessTokenValue = n, this.channels.forEach((i) => {
          let a = { access_token: n, version: is };
          n && i.updateJoinPayload(a), i.joinedOnce && i.channelAdapter.isJoined() && i.channelAdapter.push(zr.access_token, { access_token: n });
        }));
      }
      async _waitForAuthIfNeeded() {
        this._authPromise && await this._authPromise;
      }
      _setAuthSafely(e = "general") {
        this._isManualToken() || this.setAuth().catch((n) => {
          this.log("error", `Error setting auth in ${e}`, n);
        });
      }
      _setupConnectionHandlers() {
        this.socketAdapter.onOpen(() => {
          (this._authPromise || (this.accessToken && !this.accessTokenValue ? this.setAuth() : Promise.resolve())).catch((n) => {
            this.log("error", "error waiting for auth on connect", n);
          }), this.worker && !this.workerRef && this._startWorkerHeartbeat();
        }), this.socketAdapter.onClose(() => {
          this.worker && this.workerRef && this._terminateWorker();
        }), this.socketAdapter.onMessage((e) => {
          e.ref && e.ref === this._pendingWorkerHeartbeatRef && (this._pendingWorkerHeartbeatRef = null);
        });
      }
      _handleNodeJsRaceCondition() {
        this.socketAdapter.isConnected() && this.socketAdapter.getSocket().onConnOpen();
      }
      _wrapHeartbeatCallback(e) {
        return (n, r) => {
          n == "sent" && this._setAuthSafely(), e && e(n, r);
        };
      }
      _startWorkerHeartbeat() {
        this.workerUrl ? this.log("worker", `starting worker for from ${this.workerUrl}`) : this.log("worker", "starting default worker");
        let e = this._workerObjectUrl(this.workerUrl);
        this.workerRef = new Worker(e), this.workerRef.onerror = (n) => {
          this.log("worker", "worker error", n.message), this._terminateWorker(), this.disconnect();
        }, this.workerRef.onmessage = (n) => {
          n.data.event === "keepAlive" && this.sendHeartbeat();
        }, this.workerRef.postMessage({ event: "start", interval: this.heartbeatIntervalMs });
      }
      _terminateWorker() {
        this.workerRef && (this.log("worker", "terminating worker"), this.workerRef.terminate(), this.workerRef = void 0);
      }
      _workerObjectUrl(e) {
        let n;
        if (e) n = e;
        else {
          let r = new Blob([lc], { type: "application/javascript" });
          n = URL.createObjectURL(r);
        }
        return n;
      }
      _initializeOptions(e) {
        var n, r, i, a, s, l, c, u, d, h, g, f;
        this.worker = (n = e?.worker) !== null && n !== void 0 ? n : false, this.accessToken = (r = e?.accessToken) !== null && r !== void 0 ? r : null;
        let m = {};
        m.timeout = (i = e?.timeout) !== null && i !== void 0 ? i : os, m.heartbeatIntervalMs = (a = e?.heartbeatIntervalMs) !== null && a !== void 0 ? a : ps.HEARTBEAT_INTERVAL, this._disconnectOnEmptyChannelsAfterMs = (s = e?.disconnectOnEmptyChannelsAfterMs) !== null && s !== void 0 ? s : 2 * ((l = e?.heartbeatIntervalMs) !== null && l !== void 0 ? l : ps.HEARTBEAT_INTERVAL), m.transport = (c = e?.transport) !== null && c !== void 0 ? c : Ci.getWebSocketConstructor(), m.params = e?.params, m.logger = e?.logger, m.heartbeatCallback = this._wrapHeartbeatCallback(e?.heartbeatCallback), m.sessionStorage = (u = e?.sessionStorage) !== null && u !== void 0 ? u : oc(), m.reconnectAfterMs = (d = e?.reconnectAfterMs) !== null && d !== void 0 ? d : ((k) => ic[k - 1] || ac);
        let b, v, y = (h = e?.vsn) !== null && h !== void 0 ? h : ss;
        switch (y) {
          case as:
            b = (k, _) => _(JSON.stringify(k)), v = (k, _) => _(JSON.parse(k));
            break;
          case $i:
            b = this.serializer.encode.bind(this.serializer), v = this.serializer.decode.bind(this.serializer);
            break;
          default:
            throw new Error(`Unsupported serializer version: ${m.vsn}`);
        }
        if (m.vsn = y, m.encode = (g = e?.encode) !== null && g !== void 0 ? g : b, m.decode = (f = e?.decode) !== null && f !== void 0 ? f : v, m.beforeReconnect = this._reconnectAuth.bind(this), (e?.logLevel || e?.log_level) && (this.logLevel = e.logLevel || e.log_level, m.params = Object.assign(Object.assign({}, m.params), { log_level: this.logLevel })), this.worker) {
          if (typeof window < "u" && !window.Worker) throw new Error("Web Worker is not supported");
          this.workerUrl = e?.workerUrl, m.autoSendHeartbeat = !this.worker;
        }
        return m;
      }
      async _reconnectAuth() {
        await this._waitForAuthIfNeeded(), this.isConnected() || this.connect();
      }
    };
    var Gn = class extends Error {
      constructor(t, e) {
        super(t), this.name = "IcebergError", this.status = e.status, this.icebergType = e.icebergType, this.icebergCode = e.icebergCode, this.details = e.details, this.isCommitStateUnknown = e.icebergType === "CommitStateUnknownException" || [500, 502, 504].includes(e.status) && e.icebergType?.includes("CommitState") === true;
      }
      isNotFound() {
        return this.status === 404;
      }
      isConflict() {
        return this.status === 409;
      }
      isAuthenticationTimeout() {
        return this.status === 419;
      }
    };
    function cc(t, e, n) {
      let r = new URL(e, t);
      if (n) for (let [i, a] of Object.entries(n)) a !== void 0 && r.searchParams.set(i, a);
      return r.toString();
    }
    async function uc(t) {
      return !t || t.type === "none" ? {} : t.type === "bearer" ? { Authorization: `Bearer ${t.token}` } : t.type === "header" ? { [t.name]: t.value } : t.type === "custom" ? await t.getHeaders() : {};
    }
    function dc(t) {
      let e = t.fetchImpl ?? globalThis.fetch;
      return { async request({ method: n, path: r, query: i, body: a, headers: s }) {
        let l = cc(t.baseUrl, r, i), c = await uc(t.auth), u = await e(l, { method: n, headers: { ...a ? { "Content-Type": "application/json" } : {}, ...c, ...s }, body: a ? JSON.stringify(a) : void 0 }), d = await u.text(), h = (u.headers.get("content-type") || "").includes("application/json"), g = h && d ? JSON.parse(d) : d;
        if (!u.ok) {
          let f = h ? g : void 0, m = f?.error;
          throw new Gn(m?.message ?? `Request failed with status ${u.status}`, { status: u.status, icebergType: m?.type, icebergCode: m?.code, details: f });
        }
        return { status: u.status, headers: u.headers, data: g };
      } };
    }
    function Lr(t) {
      return t.join("");
    }
    var hc = class {
      constructor(t, e = "") {
        this.client = t, this.prefix = e;
      }
      async listNamespaces(t) {
        let e = t ? { parent: Lr(t.namespace) } : void 0;
        return (await this.client.request({ method: "GET", path: `${this.prefix}/namespaces`, query: e })).data.namespaces.map((r) => ({ namespace: r }));
      }
      async createNamespace(t, e) {
        let n = { namespace: t.namespace, properties: e?.properties };
        return (await this.client.request({ method: "POST", path: `${this.prefix}/namespaces`, body: n })).data;
      }
      async dropNamespace(t) {
        await this.client.request({ method: "DELETE", path: `${this.prefix}/namespaces/${Lr(t.namespace)}` });
      }
      async loadNamespaceMetadata(t) {
        return { properties: (await this.client.request({ method: "GET", path: `${this.prefix}/namespaces/${Lr(t.namespace)}` })).data.properties };
      }
      async namespaceExists(t) {
        try {
          return await this.client.request({ method: "HEAD", path: `${this.prefix}/namespaces/${Lr(t.namespace)}` }), true;
        } catch (e) {
          if (e instanceof Gn && e.status === 404) return false;
          throw e;
        }
      }
      async createNamespaceIfNotExists(t, e) {
        try {
          return await this.createNamespace(t, e);
        } catch (n) {
          if (n instanceof Gn && n.status === 409) return;
          throw n;
        }
      }
    };
    function hn(t) {
      return t.join("");
    }
    var fc = class {
      constructor(t, e = "", n) {
        this.client = t, this.prefix = e, this.accessDelegation = n;
      }
      async listTables(t) {
        return (await this.client.request({ method: "GET", path: `${this.prefix}/namespaces/${hn(t.namespace)}/tables` })).data.identifiers;
      }
      async createTable(t, e) {
        let n = {};
        return this.accessDelegation && (n["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({ method: "POST", path: `${this.prefix}/namespaces/${hn(t.namespace)}/tables`, body: e, headers: n })).data.metadata;
      }
      async updateTable(t, e) {
        let n = await this.client.request({ method: "POST", path: `${this.prefix}/namespaces/${hn(t.namespace)}/tables/${t.name}`, body: e });
        return { "metadata-location": n.data["metadata-location"], metadata: n.data.metadata };
      }
      async dropTable(t, e) {
        await this.client.request({ method: "DELETE", path: `${this.prefix}/namespaces/${hn(t.namespace)}/tables/${t.name}`, query: { purgeRequested: String(e?.purge ?? false) } });
      }
      async loadTable(t) {
        let e = {};
        return this.accessDelegation && (e["X-Iceberg-Access-Delegation"] = this.accessDelegation), (await this.client.request({ method: "GET", path: `${this.prefix}/namespaces/${hn(t.namespace)}/tables/${t.name}`, headers: e })).data.metadata;
      }
      async tableExists(t) {
        let e = {};
        this.accessDelegation && (e["X-Iceberg-Access-Delegation"] = this.accessDelegation);
        try {
          return await this.client.request({ method: "HEAD", path: `${this.prefix}/namespaces/${hn(t.namespace)}/tables/${t.name}`, headers: e }), true;
        } catch (n) {
          if (n instanceof Gn && n.status === 404) return false;
          throw n;
        }
      }
      async createTableIfNotExists(t, e) {
        try {
          return await this.createTable(t, e);
        } catch (n) {
          if (n instanceof Gn && n.status === 409) return await this.loadTable({ namespace: t.namespace, name: e.name });
          throw n;
        }
      }
    }, ms = class {
      constructor(t) {
        let e = "v1";
        t.catalogName && (e += `/${t.catalogName}`);
        let n = t.baseUrl.endsWith("/") ? t.baseUrl : `${t.baseUrl}/`;
        this.client = dc({ baseUrl: n, auth: t.auth, fetchImpl: t.fetch }), this.accessDelegation = t.accessDelegation?.join(","), this.namespaceOps = new hc(this.client, e), this.tableOps = new fc(this.client, e, this.accessDelegation);
      }
      async listNamespaces(t) {
        return this.namespaceOps.listNamespaces(t);
      }
      async createNamespace(t, e) {
        return this.namespaceOps.createNamespace(t, e);
      }
      async dropNamespace(t) {
        await this.namespaceOps.dropNamespace(t);
      }
      async loadNamespaceMetadata(t) {
        return this.namespaceOps.loadNamespaceMetadata(t);
      }
      async listTables(t) {
        return this.tableOps.listTables(t);
      }
      async createTable(t, e) {
        return this.tableOps.createTable(t, e);
      }
      async updateTable(t, e) {
        return this.tableOps.updateTable(t, e);
      }
      async dropTable(t, e) {
        await this.tableOps.dropTable(t, e);
      }
      async loadTable(t) {
        return this.tableOps.loadTable(t);
      }
      async namespaceExists(t) {
        return this.namespaceOps.namespaceExists(t);
      }
      async tableExists(t) {
        return this.tableOps.tableExists(t);
      }
      async createNamespaceIfNotExists(t, e) {
        return this.namespaceOps.createNamespaceIfNotExists(t, e);
      }
      async createTableIfNotExists(t, e) {
        return this.tableOps.createTableIfNotExists(t, e);
      }
    };
    function Un(t) {
      "@babel/helpers - typeof";
      return Un = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
        return typeof e;
      } : function(e) {
        return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
      }, Un(t);
    }
    function gc(t, e) {
      if (Un(t) != "object" || !t) return t;
      var n = t[Symbol.toPrimitive];
      if (n !== void 0) {
        var r = n.call(t, e || "default");
        if (Un(r) != "object") return r;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (e === "string" ? String : Number)(t);
    }
    function pc(t) {
      var e = gc(t, "string");
      return Un(e) == "symbol" ? e : e + "";
    }
    function mc(t, e, n) {
      return (e = pc(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: true, configurable: true, writable: true }) : t[e] = n, t;
    }
    function bs(t, e) {
      var n = Object.keys(t);
      if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(t);
        e && (r = r.filter(function(i) {
          return Object.getOwnPropertyDescriptor(t, i).enumerable;
        })), n.push.apply(n, r);
      }
      return n;
    }
    function H(t) {
      for (var e = 1; e < arguments.length; e++) {
        var n = arguments[e] != null ? arguments[e] : {};
        e % 2 ? bs(Object(n), true).forEach(function(r) {
          mc(t, r, n[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : bs(Object(n)).forEach(function(r) {
          Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
        });
      }
      return t;
    }
    var Gr = class extends Error {
      constructor(t, e = "storage", n, r) {
        super(t), this.__isStorageError = true, this.namespace = e, this.name = e === "vectors" ? "StorageVectorsError" : "StorageError", this.status = n, this.statusCode = r;
      }
      toJSON() {
        return { name: this.name, message: this.message, status: this.status, statusCode: this.statusCode };
      }
    };
    function Fr(t) {
      return typeof t == "object" && t !== null && "__isStorageError" in t;
    }
    var Nr = class extends Gr {
      constructor(t, e, n, r = "storage") {
        super(t, r, e, n), this.name = r === "vectors" ? "StorageVectorsApiError" : "StorageApiError", this.status = e, this.statusCode = n;
      }
      toJSON() {
        return H({}, super.toJSON());
      }
    }, vs = class extends Gr {
      constructor(t, e, n = "storage") {
        super(t, n), this.name = n === "vectors" ? "StorageVectorsUnknownError" : "StorageUnknownError", this.originalError = e;
      }
    };
    function jr(t, e, n) {
      let r = H({}, t), i = e.toLowerCase();
      for (let a of Object.keys(r)) a.toLowerCase() === i && delete r[a];
      return r[i] = n, r;
    }
    function bc(t) {
      let e = {};
      for (let [n, r] of Object.entries(t)) e[n.toLowerCase()] = r;
      return e;
    }
    var wc = (t) => t ? (...e) => t(...e) : (...e) => fetch(...e), yc = (t) => {
      if (typeof t != "object" || t === null) return false;
      let e = Object.getPrototypeOf(t);
      return (e === null || e === Object.prototype || Object.getPrototypeOf(e) === null) && !(Symbol.toStringTag in t) && !(Symbol.iterator in t);
    }, Fi = (t) => {
      if (Array.isArray(t)) return t.map((n) => Fi(n));
      if (typeof t == "function" || t !== Object(t)) return t;
      let e = {};
      return Object.entries(t).forEach(([n, r]) => {
        let i = n.replace(/([-_][a-z])/gi, (a) => a.toUpperCase().replace(/[-_]/g, ""));
        e[i] = Fi(r);
      }), e;
    }, vc = (t) => !t || typeof t != "string" || t.length === 0 || t.length > 100 || t.trim() !== t || t.includes("/") || t.includes("\\") ? false : /^[\w!.\*'() &$@=;:+,?-]+$/.test(t), ws = (t) => {
      if (typeof t == "object" && t !== null) {
        let e = t;
        if (typeof e.msg == "string") return e.msg;
        if (typeof e.message == "string") return e.message;
        if (typeof e.error_description == "string") return e.error_description;
        if (typeof e.error == "string") return e.error;
        if (typeof e.error == "object" && e.error !== null) {
          let n = e.error;
          if (typeof n.message == "string") return n.message;
        }
      }
      return JSON.stringify(t);
    }, _c = async (t, e, n, r) => {
      if (t !== null && typeof t == "object" && "json" in t && typeof t.json == "function") {
        let i = t, a = parseInt(String(i.status), 10);
        Number.isFinite(a) || (a = 500), i.json().then((s) => {
          let l = s?.statusCode || s?.code || a + "";
          e(new Nr(ws(s), a, l, r));
        }).catch(() => {
          let s = a + "";
          e(new Nr(i.statusText || `HTTP ${a} error`, a, s, r));
        });
      } else e(new vs(ws(t), t, r));
    }, kc = (t, e, n, r) => {
      let i = { method: t, headers: e?.headers || {} };
      if (t === "GET" || t === "HEAD" || !r) return H(H({}, i), n);
      if (yc(r)) {
        var a;
        let s = e?.headers || {}, l;
        for (let [c, u] of Object.entries(s)) c.toLowerCase() === "content-type" && (l = u);
        i.headers = jr(s, "Content-Type", (a = l) !== null && a !== void 0 ? a : "application/json"), i.body = JSON.stringify(r);
      } else i.body = r;
      return e?.duplex && (i.duplex = e.duplex), H(H({}, i), n);
    };
    async function Fn(t, e, n, r, i, a, s) {
      return new Promise((l, c) => {
        t(n, kc(e, r, i, a)).then((u) => {
          if (!u.ok) throw u;
          if (r?.noResolveJson) return u;
          if (s === "vectors") {
            let d = u.headers.get("content-type");
            if (u.headers.get("content-length") === "0" || u.status === 204) return {};
            if (!d || !d.includes("application/json")) return {};
          }
          return u.json();
        }).then((u) => l(u)).catch((u) => _c(u, c, r, s));
      });
    }
    function _s(t = "storage") {
      return { get: async (e, n, r, i) => Fn(e, "GET", n, r, i, void 0, t), post: async (e, n, r, i, a) => Fn(e, "POST", n, i, a, r, t), put: async (e, n, r, i, a) => Fn(e, "PUT", n, i, a, r, t), head: async (e, n, r, i) => Fn(e, "HEAD", n, H(H({}, r), {}, { noResolveJson: true }), i, void 0, t), remove: async (e, n, r, i, a) => Fn(e, "DELETE", n, i, a, r, t) };
    }
    var Sc = _s("storage"), { get: Mn, post: it, put: Ui, head: Ec, remove: Mi } = Sc, Ze = _s("vectors"), fn = class {
      constructor(t, e = {}, n, r = "storage") {
        this.shouldThrowOnError = false, this.url = t, this.headers = bc(e), this.fetch = wc(n), this.namespace = r;
      }
      throwOnError() {
        return this.shouldThrowOnError = true, this;
      }
      setHeader(t, e) {
        return this.headers = jr(this.headers, t, e), this;
      }
      async handleOperation(t) {
        var e = this;
        try {
          return { data: await t(), error: null };
        } catch (n) {
          if (e.shouldThrowOnError) throw n;
          if (Fr(n)) return { data: null, error: n };
          throw n;
        }
      }
    }, ks;
    ks = Symbol.toStringTag;
    var Ac = class {
      constructor(t, e) {
        this.downloadFn = t, this.shouldThrowOnError = e, this[ks] = "StreamDownloadBuilder", this.promise = null;
      }
      then(t, e) {
        return this.getPromise().then(t, e);
      }
      catch(t) {
        return this.getPromise().catch(t);
      }
      finally(t) {
        return this.getPromise().finally(t);
      }
      getPromise() {
        return this.promise || (this.promise = this.execute()), this.promise;
      }
      async execute() {
        var t = this;
        try {
          return { data: (await t.downloadFn()).body, error: null };
        } catch (e) {
          if (t.shouldThrowOnError) throw e;
          if (Fr(e)) return { data: null, error: e };
          throw e;
        }
      }
    }, Ss;
    Ss = Symbol.toStringTag;
    var Tc = class {
      constructor(t, e) {
        this.downloadFn = t, this.shouldThrowOnError = e, this[Ss] = "BlobDownloadBuilder", this.promise = null;
      }
      asStream() {
        return new Ac(this.downloadFn, this.shouldThrowOnError);
      }
      then(t, e) {
        return this.getPromise().then(t, e);
      }
      catch(t) {
        return this.getPromise().catch(t);
      }
      finally(t) {
        return this.getPromise().finally(t);
      }
      getPromise() {
        return this.promise || (this.promise = this.execute()), this.promise;
      }
      async execute() {
        var t = this;
        try {
          return { data: await (await t.downloadFn()).blob(), error: null };
        } catch (e) {
          if (t.shouldThrowOnError) throw e;
          if (Fr(e)) return { data: null, error: e };
          throw e;
        }
      }
    }, Pc = { limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } }, ys = { cacheControl: "3600", contentType: "text/plain;charset=UTF-8", upsert: false }, xc = class extends fn {
      constructor(t, e = {}, n, r) {
        super(t, e, r, "storage"), this.bucketId = n;
      }
      async uploadOrUpdate(t, e, n, r) {
        var i = this;
        return i.handleOperation(async () => {
          let a, s = H(H({}, ys), r), l = H(H({}, i.headers), t === "POST" && { "x-upsert": String(s.upsert) }), c = s.metadata;
          if (typeof Blob < "u" && n instanceof Blob ? (a = new FormData(), a.append("cacheControl", s.cacheControl), c && a.append("metadata", i.encodeMetadata(c)), a.append("", n)) : typeof FormData < "u" && n instanceof FormData ? (a = n, a.has("cacheControl") || a.append("cacheControl", s.cacheControl), c && !a.has("metadata") && a.append("metadata", i.encodeMetadata(c))) : (a = n, l["cache-control"] = `max-age=${s.cacheControl}`, l["content-type"] = s.contentType, c && (l["x-metadata"] = i.toBase64(i.encodeMetadata(c))), (typeof ReadableStream < "u" && a instanceof ReadableStream || a && typeof a == "object" && "pipe" in a && typeof a.pipe == "function") && !s.duplex && (s.duplex = "half")), r?.headers) for (let [g, f] of Object.entries(r.headers)) l = jr(l, g, f);
          let u = i._removeEmptyFolders(e), d = i._getFinalPath(u), h = await (t == "PUT" ? Ui : it)(i.fetch, `${i.url}/object/${d}`, a, H({ headers: l }, s?.duplex ? { duplex: s.duplex } : {}));
          return { path: u, id: h.Id, fullPath: h.Key };
        });
      }
      async upload(t, e, n) {
        return this.uploadOrUpdate("POST", t, e, n);
      }
      async uploadToSignedUrl(t, e, n, r) {
        var i = this;
        let a = i._removeEmptyFolders(t), s = i._getFinalPath(a), l = new URL(i.url + `/object/upload/sign/${s}`);
        return l.searchParams.set("token", e), i.handleOperation(async () => {
          let c, u = H(H({}, ys), r), d = H(H({}, i.headers), { "x-upsert": String(u.upsert) }), h = u.metadata;
          if (typeof Blob < "u" && n instanceof Blob ? (c = new FormData(), c.append("cacheControl", u.cacheControl), h && c.append("metadata", i.encodeMetadata(h)), c.append("", n)) : typeof FormData < "u" && n instanceof FormData ? (c = n, c.has("cacheControl") || c.append("cacheControl", u.cacheControl), h && !c.has("metadata") && c.append("metadata", i.encodeMetadata(h))) : (c = n, d["cache-control"] = `max-age=${u.cacheControl}`, d["content-type"] = u.contentType, h && (d["x-metadata"] = i.toBase64(i.encodeMetadata(h))), (typeof ReadableStream < "u" && c instanceof ReadableStream || c && typeof c == "object" && "pipe" in c && typeof c.pipe == "function") && !u.duplex && (u.duplex = "half")), r?.headers) for (let [g, f] of Object.entries(r.headers)) d = jr(d, g, f);
          return { path: a, fullPath: (await Ui(i.fetch, l.toString(), c, H({ headers: d }, u?.duplex ? { duplex: u.duplex } : {}))).Key };
        });
      }
      async createSignedUploadUrl(t, e) {
        var n = this;
        return n.handleOperation(async () => {
          let r = n._getFinalPath(t), i = H({}, n.headers);
          e?.upsert && (i["x-upsert"] = "true");
          let a = await it(n.fetch, `${n.url}/object/upload/sign/${r}`, {}, { headers: i }), s = new URL(n.url + a.url), l = s.searchParams.get("token");
          if (!l) throw new Gr("No token returned by API");
          return { signedUrl: s.toString(), path: t, token: l };
        });
      }
      async update(t, e, n) {
        return this.uploadOrUpdate("PUT", t, e, n);
      }
      async move(t, e, n) {
        var r = this;
        return r.handleOperation(async () => await it(r.fetch, `${r.url}/object/move`, { bucketId: r.bucketId, sourceKey: t, destinationKey: e, destinationBucket: n?.destinationBucket }, { headers: r.headers }));
      }
      async copy(t, e, n) {
        var r = this;
        return r.handleOperation(async () => ({ path: (await it(r.fetch, `${r.url}/object/copy`, { bucketId: r.bucketId, sourceKey: t, destinationKey: e, destinationBucket: n?.destinationBucket }, { headers: r.headers })).Key }));
      }
      async createSignedUrl(t, e, n) {
        var r = this;
        return r.handleOperation(async () => {
          let i = r._getFinalPath(t), a = typeof n?.transform == "object" && n.transform !== null && Object.keys(n.transform).length > 0, s = await it(r.fetch, `${r.url}/object/sign/${i}`, H({ expiresIn: e }, a ? { transform: n.transform } : {}), { headers: r.headers }), l = new URLSearchParams();
          n?.download && l.set("download", n.download === true ? "" : n.download), n?.cacheNonce != null && l.set("cacheNonce", String(n.cacheNonce));
          let c = l.toString();
          return { signedUrl: encodeURI(`${r.url}${s.signedURL}${c ? `&${c}` : ""}`) };
        });
      }
      async createSignedUrls(t, e, n) {
        var r = this;
        return r.handleOperation(async () => {
          let i = await it(r.fetch, `${r.url}/object/sign/${r.bucketId}`, { expiresIn: e, paths: t }, { headers: r.headers }), a = new URLSearchParams();
          n?.download && a.set("download", n.download === true ? "" : n.download), n?.cacheNonce != null && a.set("cacheNonce", String(n.cacheNonce));
          let s = a.toString();
          return i.map((l) => H(H({}, l), {}, { signedUrl: l.signedURL ? encodeURI(`${r.url}${l.signedURL}${s ? `&${s}` : ""}`) : null }));
        });
      }
      download(t, e, n) {
        let r = typeof e?.transform == "object" && e.transform !== null && Object.keys(e.transform).length > 0 ? "render/image/authenticated" : "object", i = new URLSearchParams();
        e?.transform && this.applyTransformOptsToQuery(i, e.transform), e?.cacheNonce != null && i.set("cacheNonce", String(e.cacheNonce));
        let a = i.toString(), s = this._getFinalPath(t), l = () => Mn(this.fetch, `${this.url}/${r}/${s}${a ? `?${a}` : ""}`, { headers: this.headers, noResolveJson: true }, n);
        return new Tc(l, this.shouldThrowOnError);
      }
      async info(t) {
        var e = this;
        let n = e._getFinalPath(t);
        return e.handleOperation(async () => Fi(await Mn(e.fetch, `${e.url}/object/info/${n}`, { headers: e.headers })));
      }
      async exists(t) {
        var e = this;
        let n = e._getFinalPath(t);
        try {
          return await Ec(e.fetch, `${e.url}/object/${n}`, { headers: e.headers }), { data: true, error: null };
        } catch (i) {
          if (e.shouldThrowOnError) throw i;
          if (Fr(i)) {
            var r;
            let a = i instanceof Nr ? i.status : i instanceof vs ? (r = i.originalError) === null || r === void 0 ? void 0 : r.status : void 0;
            if (a !== void 0 && [400, 404].includes(a)) return { data: false, error: i };
          }
          throw i;
        }
      }
      getPublicUrl(t, e) {
        let n = this._getFinalPath(t), r = new URLSearchParams();
        e?.download && r.set("download", e.download === true ? "" : e.download), e?.transform && this.applyTransformOptsToQuery(r, e.transform), e?.cacheNonce != null && r.set("cacheNonce", String(e.cacheNonce));
        let i = r.toString(), a = typeof e?.transform == "object" && e.transform !== null && Object.keys(e.transform).length > 0 ? "render/image" : "object";
        return { data: { publicUrl: encodeURI(`${this.url}/${a}/public/${n}`) + (i ? `?${i}` : "") } };
      }
      async remove(t) {
        var e = this;
        return e.handleOperation(async () => await Mi(e.fetch, `${e.url}/object/${e.bucketId}`, { prefixes: t }, { headers: e.headers }));
      }
      async list(t, e, n) {
        var r = this;
        return r.handleOperation(async () => {
          let i = H(H(H({}, Pc), e), {}, { prefix: t || "" });
          return await it(r.fetch, `${r.url}/object/list/${r.bucketId}`, i, { headers: r.headers }, n);
        });
      }
      async listV2(t, e) {
        var n = this;
        return n.handleOperation(async () => {
          let r = H({}, t);
          return await it(n.fetch, `${n.url}/object/list-v2/${n.bucketId}`, r, { headers: n.headers }, e);
        });
      }
      encodeMetadata(t) {
        return JSON.stringify(t);
      }
      toBase64(t) {
        return typeof Buffer < "u" ? Buffer.from(t).toString("base64") : btoa(t);
      }
      _getFinalPath(t) {
        return `${this.bucketId}/${t.replace(/^\/+/, "")}`;
      }
      _removeEmptyFolders(t) {
        return t.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
      }
      applyTransformOptsToQuery(t, e) {
        return e.width && t.set("width", e.width.toString()), e.height && t.set("height", e.height.toString()), e.resize && t.set("resize", e.resize), e.format && t.set("format", e.format), e.quality && t.set("quality", e.quality.toString()), t;
      }
    }, Dc = "2.106.1", Kn = { "X-Client-Info": `storage-js/${Dc}` }, Rc = class extends fn {
      constructor(t, e = {}, n, r) {
        let i = new URL(t);
        r?.useNewHostname && /supabase\.(co|in|red)$/.test(i.hostname) && !i.hostname.includes("storage.supabase.") && (i.hostname = i.hostname.replace("supabase.", "storage.supabase."));
        let a = i.href.replace(/\/$/, ""), s = H(H({}, Kn), e);
        super(a, s, n, "storage");
      }
      async listBuckets(t) {
        var e = this;
        return e.handleOperation(async () => {
          let n = e.listBucketOptionsToQueryString(t);
          return await Mn(e.fetch, `${e.url}/bucket${n}`, { headers: e.headers });
        });
      }
      async getBucket(t) {
        var e = this;
        return e.handleOperation(async () => await Mn(e.fetch, `${e.url}/bucket/${t}`, { headers: e.headers }));
      }
      async createBucket(t, e = { public: false }) {
        var n = this;
        return n.handleOperation(async () => await it(n.fetch, `${n.url}/bucket`, { id: t, name: t, type: e.type, public: e.public, file_size_limit: e.fileSizeLimit, allowed_mime_types: e.allowedMimeTypes }, { headers: n.headers }));
      }
      async updateBucket(t, e) {
        var n = this;
        return n.handleOperation(async () => await Ui(n.fetch, `${n.url}/bucket/${t}`, { id: t, name: t, public: e.public, file_size_limit: e.fileSizeLimit, allowed_mime_types: e.allowedMimeTypes }, { headers: n.headers }));
      }
      async emptyBucket(t) {
        var e = this;
        return e.handleOperation(async () => await it(e.fetch, `${e.url}/bucket/${t}/empty`, {}, { headers: e.headers }));
      }
      async deleteBucket(t) {
        var e = this;
        return e.handleOperation(async () => await Mi(e.fetch, `${e.url}/bucket/${t}`, {}, { headers: e.headers }));
      }
      listBucketOptionsToQueryString(t) {
        let e = {};
        return t && ("limit" in t && (e.limit = String(t.limit)), "offset" in t && (e.offset = String(t.offset)), t.search && (e.search = t.search), t.sortColumn && (e.sortColumn = t.sortColumn), t.sortOrder && (e.sortOrder = t.sortOrder)), Object.keys(e).length > 0 ? "?" + new URLSearchParams(e).toString() : "";
      }
    }, zc = class extends fn {
      constructor(t, e = {}, n) {
        let r = t.replace(/\/$/, ""), i = H(H({}, Kn), e);
        super(r, i, n, "storage");
      }
      async createBucket(t) {
        var e = this;
        return e.handleOperation(async () => await it(e.fetch, `${e.url}/bucket`, { name: t }, { headers: e.headers }));
      }
      async listBuckets(t) {
        var e = this;
        return e.handleOperation(async () => {
          let n = new URLSearchParams();
          t?.limit !== void 0 && n.set("limit", t.limit.toString()), t?.offset !== void 0 && n.set("offset", t.offset.toString()), t?.sortColumn && n.set("sortColumn", t.sortColumn), t?.sortOrder && n.set("sortOrder", t.sortOrder), t?.search && n.set("search", t.search);
          let r = n.toString(), i = r ? `${e.url}/bucket?${r}` : `${e.url}/bucket`;
          return await Mn(e.fetch, i, { headers: e.headers });
        });
      }
      async deleteBucket(t) {
        var e = this;
        return e.handleOperation(async () => await Mi(e.fetch, `${e.url}/bucket/${t}`, {}, { headers: e.headers }));
      }
      from(t) {
        var e = this;
        if (!vc(t)) throw new Gr("Invalid bucket name: File, folder, and bucket names must follow AWS object key naming guidelines and should avoid the use of any other characters.");
        let n = new ms({ baseUrl: this.url, catalogName: t, auth: { type: "custom", getHeaders: async () => e.headers }, fetch: this.fetch }), r = this.shouldThrowOnError;
        return new Proxy(n, { get(i, a) {
          let s = i[a];
          return typeof s != "function" ? s : async (...l) => {
            try {
              return { data: await s.apply(i, l), error: null };
            } catch (c) {
              if (r) throw c;
              return { data: null, error: c };
            }
          };
        } });
      }
    }, Oc = class extends fn {
      constructor(t, e = {}, n) {
        let r = t.replace(/\/$/, ""), i = H(H({}, Kn), {}, { "Content-Type": "application/json" }, e);
        super(r, i, n, "vectors");
      }
      async createIndex(t) {
        var e = this;
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/CreateIndex`, t, { headers: e.headers }) || {});
      }
      async getIndex(t, e) {
        var n = this;
        return n.handleOperation(async () => await Ze.post(n.fetch, `${n.url}/GetIndex`, { vectorBucketName: t, indexName: e }, { headers: n.headers }));
      }
      async listIndexes(t) {
        var e = this;
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/ListIndexes`, t, { headers: e.headers }));
      }
      async deleteIndex(t, e) {
        var n = this;
        return n.handleOperation(async () => await Ze.post(n.fetch, `${n.url}/DeleteIndex`, { vectorBucketName: t, indexName: e }, { headers: n.headers }) || {});
      }
    }, Cc = class extends fn {
      constructor(t, e = {}, n) {
        let r = t.replace(/\/$/, ""), i = H(H({}, Kn), {}, { "Content-Type": "application/json" }, e);
        super(r, i, n, "vectors");
      }
      async putVectors(t) {
        var e = this;
        if (t.vectors.length < 1 || t.vectors.length > 500) throw new Error("Vector batch size must be between 1 and 500 items");
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/PutVectors`, t, { headers: e.headers }) || {});
      }
      async getVectors(t) {
        var e = this;
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/GetVectors`, t, { headers: e.headers }));
      }
      async listVectors(t) {
        var e = this;
        if (t.segmentCount !== void 0) {
          if (t.segmentCount < 1 || t.segmentCount > 16) throw new Error("segmentCount must be between 1 and 16");
          if (t.segmentIndex !== void 0 && (t.segmentIndex < 0 || t.segmentIndex >= t.segmentCount)) throw new Error(`segmentIndex must be between 0 and ${t.segmentCount - 1}`);
        }
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/ListVectors`, t, { headers: e.headers }));
      }
      async queryVectors(t) {
        var e = this;
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/QueryVectors`, t, { headers: e.headers }));
      }
      async deleteVectors(t) {
        var e = this;
        if (t.keys.length < 1 || t.keys.length > 500) throw new Error("Keys batch size must be between 1 and 500 items");
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/DeleteVectors`, t, { headers: e.headers }) || {});
      }
    }, $c = class extends fn {
      constructor(t, e = {}, n) {
        let r = t.replace(/\/$/, ""), i = H(H({}, Kn), {}, { "Content-Type": "application/json" }, e);
        super(r, i, n, "vectors");
      }
      async createBucket(t) {
        var e = this;
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/CreateVectorBucket`, { vectorBucketName: t }, { headers: e.headers }) || {});
      }
      async getBucket(t) {
        var e = this;
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/GetVectorBucket`, { vectorBucketName: t }, { headers: e.headers }));
      }
      async listBuckets(t = {}) {
        var e = this;
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/ListVectorBuckets`, t, { headers: e.headers }));
      }
      async deleteBucket(t) {
        var e = this;
        return e.handleOperation(async () => await Ze.post(e.fetch, `${e.url}/DeleteVectorBucket`, { vectorBucketName: t }, { headers: e.headers }) || {});
      }
    }, Ic = class extends $c {
      constructor(t, e = {}) {
        super(t, e.headers || {}, e.fetch);
      }
      from(t) {
        return new Bc(this.url, this.headers, t, this.fetch);
      }
      async createBucket(t) {
        var e = () => super.createBucket, n = this;
        return e().call(n, t);
      }
      async getBucket(t) {
        var e = () => super.getBucket, n = this;
        return e().call(n, t);
      }
      async listBuckets(t = {}) {
        var e = () => super.listBuckets, n = this;
        return e().call(n, t);
      }
      async deleteBucket(t) {
        var e = () => super.deleteBucket, n = this;
        return e().call(n, t);
      }
    }, Bc = class extends Oc {
      constructor(t, e, n, r) {
        super(t, e, r), this.vectorBucketName = n;
      }
      async createIndex(t) {
        var e = () => super.createIndex, n = this;
        return e().call(n, H(H({}, t), {}, { vectorBucketName: n.vectorBucketName }));
      }
      async listIndexes(t = {}) {
        var e = () => super.listIndexes, n = this;
        return e().call(n, H(H({}, t), {}, { vectorBucketName: n.vectorBucketName }));
      }
      async getIndex(t) {
        var e = () => super.getIndex, n = this;
        return e().call(n, n.vectorBucketName, t);
      }
      async deleteIndex(t) {
        var e = () => super.deleteIndex, n = this;
        return e().call(n, n.vectorBucketName, t);
      }
      index(t) {
        return new Lc(this.url, this.headers, this.vectorBucketName, t, this.fetch);
      }
    }, Lc = class extends Cc {
      constructor(t, e, n, r, i) {
        super(t, e, i), this.vectorBucketName = n, this.indexName = r;
      }
      async putVectors(t) {
        var e = () => super.putVectors, n = this;
        return e().call(n, H(H({}, t), {}, { vectorBucketName: n.vectorBucketName, indexName: n.indexName }));
      }
      async getVectors(t) {
        var e = () => super.getVectors, n = this;
        return e().call(n, H(H({}, t), {}, { vectorBucketName: n.vectorBucketName, indexName: n.indexName }));
      }
      async listVectors(t = {}) {
        var e = () => super.listVectors, n = this;
        return e().call(n, H(H({}, t), {}, { vectorBucketName: n.vectorBucketName, indexName: n.indexName }));
      }
      async queryVectors(t) {
        var e = () => super.queryVectors, n = this;
        return e().call(n, H(H({}, t), {}, { vectorBucketName: n.vectorBucketName, indexName: n.indexName }));
      }
      async deleteVectors(t) {
        var e = () => super.deleteVectors, n = this;
        return e().call(n, H(H({}, t), {}, { vectorBucketName: n.vectorBucketName, indexName: n.indexName }));
      }
    }, Es = class extends Rc {
      constructor(t, e = {}, n, r) {
        super(t, e, n, r);
      }
      from(t) {
        return new xc(this.url, this.headers, t, this.fetch);
      }
      get vectors() {
        return new Ic(this.url + "/vector", { headers: this.headers, fetch: this.fetch });
      }
      get analytics() {
        return new zc(this.url + "/iceberg", this.headers, this.fetch);
      }
    };
    var Ur = "2.106.1";
    var Nt = 30 * 1e3, Mr = 3, Kr = Mr * Nt, As = "http://localhost:9999", Ts = "supabase.auth.token";
    var Ps = { "X-Client-Info": `gotrue-js/${Ur}` };
    var qn = "X-Supabase-Api-Version", Ki = { "2024-01-01": { timestamp: Date.parse("2024-01-01T00:00:00.0Z"), name: "2024-01-01" } }, xs = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i, Ds = 600 * 1e3;
    var ft = class extends Error {
      constructor(e, n, r) {
        super(e), this.__isAuthError = true, this.name = "AuthError", this.status = n, this.code = r;
      }
      toJSON() {
        return { name: this.name, message: this.message, status: this.status, code: this.code };
      }
    };
    function O(t) {
      return typeof t == "object" && t !== null && "__isAuthError" in t;
    }
    var qr = class extends ft {
      constructor(e, n, r) {
        super(e, n, r), this.name = "AuthApiError", this.status = n, this.code = r;
      }
    };
    function Rs(t) {
      return O(t) && t.name === "AuthApiError";
    }
    var $e = class extends ft {
      constructor(e, n) {
        super(e), this.name = "AuthUnknownError", this.originalError = n;
      }
    }, at = class extends ft {
      constructor(e, n, r, i) {
        super(e, r, i), this.name = n, this.status = r;
      }
    }, ye = class extends at {
      constructor() {
        super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
      }
    };
    function Vn(t) {
      return O(t) && t.name === "AuthSessionMissingError";
    }
    var _t = class extends at {
      constructor() {
        super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
      }
    }, jt = class extends at {
      constructor(e) {
        super(e, "AuthInvalidCredentialsError", 400, void 0);
      }
    }, Gt = class extends at {
      constructor(e, n = null) {
        super(e, "AuthImplicitGrantRedirectError", 500, void 0), this.details = null, this.details = n;
      }
      toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
      }
    };
    function zs(t) {
      return O(t) && t.name === "AuthImplicitGrantRedirectError";
    }
    var Wn = class extends at {
      constructor(e, n = null) {
        super(e, "AuthPKCEGrantCodeExchangeError", 500, void 0), this.details = null, this.details = n;
      }
      toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { details: this.details });
      }
    }, Wr = class extends at {
      constructor() {
        super("PKCE code verifier not found in storage. This can happen if the auth flow was initiated in a different browser or device, or if the storage was cleared. For SSR frameworks (Next.js, SvelteKit, etc.), use @supabase/ssr on both the server and client to store the code verifier in cookies.", "AuthPKCECodeVerifierMissingError", 400, "pkce_code_verifier_not_found");
      }
    };
    var gn = class extends at {
      constructor(e, n) {
        super(e, "AuthRetryableFetchError", n, void 0);
      }
    };
    function Hr(t) {
      return O(t) && t.name === "AuthRetryableFetchError";
    }
    var Hn = class extends at {
      constructor(e, n, r) {
        super(e, "AuthWeakPasswordError", n, "weak_password"), this.reasons = r;
      }
      toJSON() {
        return Object.assign(Object.assign({}, super.toJSON()), { reasons: this.reasons });
      }
    };
    var Ft = class extends at {
      constructor(e) {
        super(e, "AuthInvalidJwtError", 400, "invalid_jwt");
      }
    };
    var Vr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), Os = ` 	
\r=`.split(""), Nc = (() => {
      let t = new Array(128);
      for (let e = 0; e < t.length; e += 1) t[e] = -1;
      for (let e = 0; e < Os.length; e += 1) t[Os[e].charCodeAt(0)] = -2;
      for (let e = 0; e < Vr.length; e += 1) t[Vr[e].charCodeAt(0)] = e;
      return t;
    })();
    function Cs(t, e, n) {
      if (t !== null) for (e.queue = e.queue << 8 | t, e.queuedBits += 8; e.queuedBits >= 6; ) {
        let r = e.queue >> e.queuedBits - 6 & 63;
        n(Vr[r]), e.queuedBits -= 6;
      }
      else if (e.queuedBits > 0) for (e.queue = e.queue << 6 - e.queuedBits, e.queuedBits = 6; e.queuedBits >= 6; ) {
        let r = e.queue >> e.queuedBits - 6 & 63;
        n(Vr[r]), e.queuedBits -= 6;
      }
    }
    function $s(t, e, n) {
      let r = Nc[t];
      if (r > -1) for (e.queue = e.queue << 6 | r, e.queuedBits += 6; e.queuedBits >= 8; ) n(e.queue >> e.queuedBits - 8 & 255), e.queuedBits -= 8;
      else {
        if (r === -2) return;
        throw new Error(`Invalid Base64-URL character "${String.fromCharCode(t)}"`);
      }
    }
    function qi(t) {
      let e = [], n = (s) => {
        e.push(String.fromCodePoint(s));
      }, r = { utf8seq: 0, codepoint: 0 }, i = { queue: 0, queuedBits: 0 }, a = (s) => {
        Fc(s, r, n);
      };
      for (let s = 0; s < t.length; s += 1) $s(t.charCodeAt(s), i, a);
      return e.join("");
    }
    function jc(t, e) {
      if (t <= 127) {
        e(t);
        return;
      } else if (t <= 2047) {
        e(192 | t >> 6), e(128 | t & 63);
        return;
      } else if (t <= 65535) {
        e(224 | t >> 12), e(128 | t >> 6 & 63), e(128 | t & 63);
        return;
      } else if (t <= 1114111) {
        e(240 | t >> 18), e(128 | t >> 12 & 63), e(128 | t >> 6 & 63), e(128 | t & 63);
        return;
      }
      throw new Error(`Unrecognized Unicode codepoint: ${t.toString(16)}`);
    }
    function Gc(t, e) {
      for (let n = 0; n < t.length; n += 1) {
        let r = t.charCodeAt(n);
        if (r > 55295 && r <= 56319) {
          let i = (r - 55296) * 1024 & 65535;
          r = (t.charCodeAt(n + 1) - 56320 & 65535 | i) + 65536, n += 1;
        }
        jc(r, e);
      }
    }
    function Fc(t, e, n) {
      if (e.utf8seq === 0) {
        if (t <= 127) {
          n(t);
          return;
        }
        for (let r = 1; r < 6; r += 1) if ((t >> 7 - r & 1) === 0) {
          e.utf8seq = r;
          break;
        }
        if (e.utf8seq === 2) e.codepoint = t & 31;
        else if (e.utf8seq === 3) e.codepoint = t & 15;
        else if (e.utf8seq === 4) e.codepoint = t & 7;
        else throw new Error("Invalid UTF-8 sequence");
        e.utf8seq -= 1;
      } else if (e.utf8seq > 0) {
        if (t <= 127) throw new Error("Invalid UTF-8 sequence");
        e.codepoint = e.codepoint << 6 | t & 63, e.utf8seq -= 1, e.utf8seq === 0 && n(e.codepoint);
      }
    }
    function Tt(t) {
      let e = [], n = { queue: 0, queuedBits: 0 }, r = (i) => {
        e.push(i);
      };
      for (let i = 0; i < t.length; i += 1) $s(t.charCodeAt(i), n, r);
      return new Uint8Array(e);
    }
    function Is(t) {
      let e = [];
      return Gc(t, (n) => e.push(n)), new Uint8Array(e);
    }
    function kt(t) {
      let e = [], n = { queue: 0, queuedBits: 0 }, r = (i) => {
        e.push(i);
      };
      return t.forEach((i) => Cs(i, n, r)), Cs(null, n, r), e.join("");
    }
    function Bs(t) {
      return Math.round(Date.now() / 1e3) + t;
    }
    function Ls() {
      return /* @__PURE__ */ Symbol("auth-callback");
    }
    var Pe = () => typeof window < "u" && typeof document < "u", Ut = { tested: false, writable: false }, Jr = () => {
      if (!Pe()) return false;
      try {
        if (typeof globalThis.localStorage != "object") return false;
      } catch {
        return false;
      }
      if (Ut.tested) return Ut.writable;
      let t = `lswt-${Math.random()}${Math.random()}`;
      try {
        globalThis.localStorage.setItem(t, t), globalThis.localStorage.removeItem(t), Ut.tested = true, Ut.writable = true;
      } catch {
        Ut.tested = true, Ut.writable = false;
      }
      return Ut.writable;
    };
    function Ns(t) {
      let e = {}, n = new URL(t);
      if (n.hash && n.hash[0] === "#") try {
        new URLSearchParams(n.hash.substring(1)).forEach((i, a) => {
          e[a] = i;
        });
      } catch {
      }
      return n.searchParams.forEach((r, i) => {
        e[i] = r;
      }), e;
    }
    var Zr = (t) => t ? (...e) => t(...e) : (...e) => fetch(...e), js = (t) => typeof t == "object" && t !== null && "status" in t && "ok" in t && "json" in t && typeof t.json == "function", Mt = async (t, e, n) => {
      await t.setItem(e, JSON.stringify(n));
    }, Pt = async (t, e) => {
      let n = await t.getItem(e);
      if (!n) return null;
      try {
        return JSON.parse(n);
      } catch {
        return null;
      }
    }, Re = async (t, e) => {
      await t.removeItem(e);
    }, Jn = class t {
      constructor() {
        this.promise = new t.promiseConstructor((e, n) => {
          this.resolve = e, this.reject = n;
        });
      }
    };
    Jn.promiseConstructor = Promise;
    function Zn(t) {
      let e = t.split(".");
      if (e.length !== 3) throw new Ft("Invalid JWT structure");
      for (let r = 0; r < e.length; r++) if (!xs.test(e[r])) throw new Ft("JWT not in base64url format");
      return { header: JSON.parse(qi(e[0])), payload: JSON.parse(qi(e[1])), signature: Tt(e[2]), raw: { header: e[0], payload: e[1] } };
    }
    async function Gs(t) {
      return await new Promise((e) => {
        setTimeout(() => e(null), t);
      });
    }
    function Fs(t, e) {
      return new Promise((r, i) => {
        (async () => {
          for (let a = 0; a < 1 / 0; a++) try {
            let s = await t(a);
            if (!e(a, null, s)) {
              r(s);
              return;
            }
          } catch (s) {
            if (!e(a, s)) {
              i(s);
              return;
            }
          }
        })();
      });
    }
    function Uc(t) {
      return ("0" + t.toString(16)).substr(-2);
    }
    function Mc() {
      let e = new Uint32Array(56);
      if (typeof crypto > "u") {
        let n = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~", r = n.length, i = "";
        for (let a = 0; a < 56; a++) i += n.charAt(Math.floor(Math.random() * r));
        return i;
      }
      return crypto.getRandomValues(e), Array.from(e, Uc).join("");
    }
    async function Kc(t) {
      let n = new TextEncoder().encode(t), r = await crypto.subtle.digest("SHA-256", n), i = new Uint8Array(r);
      return Array.from(i).map((a) => String.fromCharCode(a)).join("");
    }
    async function qc(t) {
      if (!(typeof crypto < "u" && typeof crypto.subtle < "u" && typeof TextEncoder < "u")) return console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), t;
      let n = await Kc(t);
      return btoa(n).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    }
    async function Kt(t, e, n = false) {
      let r = Mc(), i = r;
      n && (i += "/recovery"), await Mt(t, `${e}-code-verifier`, i);
      let a = await qc(r);
      return [a, r === a ? "plain" : "s256"];
    }
    var Wc = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i;
    function Us(t) {
      let e = t.headers.get(qn);
      if (!e || !e.match(Wc)) return null;
      try {
        return /* @__PURE__ */ new Date(`${e}T00:00:00.0Z`);
      } catch {
        return null;
      }
    }
    function Ms(t) {
      if (!t) throw new Error("Missing exp claim");
      let e = Math.floor(Date.now() / 1e3);
      if (t <= e) throw new Error("JWT has expired");
    }
    function Ks(t) {
      switch (t) {
        case "RS256":
          return { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } };
        case "ES256":
          return { name: "ECDSA", namedCurve: "P-256", hash: { name: "SHA-256" } };
        default:
          throw new Error("Invalid alg claim");
      }
    }
    var Hc = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    function gt(t) {
      if (!Hc.test(t)) throw new Error("@supabase/auth-js: Expected parameter to be UUID but is not");
    }
    function Ye(t) {
      if (!t.passkey) throw new Error("@supabase/auth-js: the passkey API is experimental and disabled by default. Enable it by passing `auth: { experimental: { passkey: true } }` to createClient (or to the GoTrueClient constructor).");
    }
    function Yr() {
      let t = {};
      return new Proxy(t, { get: (e, n) => {
        if (n === "__isUserNotAvailableProxy") return true;
        if (typeof n == "symbol") {
          let r = n.toString();
          if (r === "Symbol(Symbol.toPrimitive)" || r === "Symbol(Symbol.toStringTag)" || r === "Symbol(util.inspect.custom)") return;
        }
        throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${n}" property of the session object is not supported. Please use getUser() instead.`);
      }, set: (e, n) => {
        throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${n}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
      }, deleteProperty: (e, n) => {
        throw new Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${n}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
      } });
    }
    function qs(t, e) {
      return new Proxy(t, { get: (n, r, i) => {
        if (r === "__isInsecureUserWarningProxy") return true;
        if (typeof r == "symbol") {
          let a = r.toString();
          if (a === "Symbol(Symbol.toPrimitive)" || a === "Symbol(Symbol.toStringTag)" || a === "Symbol(util.inspect.custom)" || a === "Symbol(nodejs.util.inspect.custom)") return Reflect.get(n, r, i);
        }
        return !e.value && typeof r == "string" && (console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."), e.value = true), Reflect.get(n, r, i);
      } });
    }
    function Wi(t) {
      return JSON.parse(JSON.stringify(t));
    }
    var qt = (t) => {
      if (typeof t == "object" && t !== null) {
        let e = t;
        if (typeof e.msg == "string") return e.msg;
        if (typeof e.message == "string") return e.message;
        if (typeof e.error_description == "string") return e.error_description;
        if (typeof e.error == "string") return e.error;
      }
      return JSON.stringify(t);
    }, Vc = [502, 503, 504, 520, 521, 522, 523, 524, 530];
    async function Ws(t) {
      var e;
      if (!js(t)) throw new gn(qt(t), 0);
      if (Vc.includes(t.status)) throw new gn(qt(t), t.status);
      let n;
      try {
        n = await t.json();
      } catch (a) {
        throw new $e(qt(a), a);
      }
      let r, i = Us(t);
      if (i && i.getTime() >= Ki["2024-01-01"].timestamp && typeof n == "object" && n && typeof n.code == "string" ? r = n.code : typeof n == "object" && n && typeof n.error_code == "string" && (r = n.error_code), r) {
        if (r === "weak_password") throw new Hn(qt(n), t.status, ((e = n.weak_password) === null || e === void 0 ? void 0 : e.reasons) || []);
        if (r === "session_not_found") throw new ye();
      } else if (typeof n == "object" && n && typeof n.weak_password == "object" && n.weak_password && Array.isArray(n.weak_password.reasons) && n.weak_password.reasons.length && n.weak_password.reasons.reduce((a, s) => a && typeof s == "string", true)) throw new Hn(qt(n), t.status, n.weak_password.reasons);
      throw new qr(qt(n), t.status || 500, r);
    }
    var Jc = (t, e, n, r) => {
      let i = { method: t, headers: e?.headers || {} };
      return t === "GET" ? i : (i.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, e?.headers), i.body = JSON.stringify(r), Object.assign(Object.assign({}, i), n));
    };
    async function N(t, e, n, r) {
      var i;
      let a = Object.assign({}, r?.headers);
      a[qn] || (a[qn] = Ki["2024-01-01"].name), r?.jwt && (a.Authorization = `Bearer ${r.jwt}`);
      let s = (i = r?.query) !== null && i !== void 0 ? i : {};
      r?.redirectTo && (s.redirect_to = r.redirectTo);
      let l = Object.keys(s).length ? "?" + new URLSearchParams(s).toString() : "", c = await Zc(t, e, n + l, { headers: a, noResolveJson: r?.noResolveJson }, {}, r?.body);
      return r?.xform ? r?.xform(c) : { data: Object.assign({}, c), error: null };
    }
    async function Zc(t, e, n, r, i, a) {
      let s = Jc(e, r, i, a), l;
      try {
        l = await t(n, Object.assign({}, s));
      } catch (c) {
        throw console.error(c), new gn(qt(c), 0);
      }
      if (l.ok || await Ws(l), r?.noResolveJson) return l;
      try {
        return await l.json();
      } catch (c) {
        await Ws(c);
      }
    }
    function Xe(t) {
      var e;
      let n = null;
      Yc(t) && (n = Object.assign({}, t), t.expires_at || (n.expires_at = Bs(t.expires_in)));
      let r = (e = t.user) !== null && e !== void 0 ? e : null;
      return { data: { session: n, user: r }, error: null };
    }
    function Hi(t) {
      let e = Xe(t);
      return !e.error && t.weak_password && typeof t.weak_password == "object" && Array.isArray(t.weak_password.reasons) && t.weak_password.reasons.length && t.weak_password.message && typeof t.weak_password.message == "string" && t.weak_password.reasons.reduce((n, r) => n && typeof r == "string", true) && (e.data.weak_password = t.weak_password), e;
    }
    function pt(t) {
      var e;
      return { data: { user: (e = t.user) !== null && e !== void 0 ? e : t }, error: null };
    }
    function Hs(t) {
      return { data: t, error: null };
    }
    function Vs(t) {
      let { action_link: e, email_otp: n, hashed_token: r, redirect_to: i, verification_type: a } = t, s = Bt(t, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"]), l = { action_link: e, email_otp: n, hashed_token: r, redirect_to: i, verification_type: a }, c = Object.assign({}, s);
      return { data: { properties: l, user: c }, error: null };
    }
    function Vi(t) {
      return t;
    }
    function Yc(t) {
      return !!t.access_token && !!t.refresh_token && !!t.expires_in;
    }
    var Xr = ["global", "local", "others"];
    var Wt = class {
      _encodePathSegment(e) {
        if (e === "." || e === "..") throw new ft("Invalid path segment");
        return encodeURIComponent(e);
      }
      constructor({ url: e = "", headers: n = {}, fetch: r, experimental: i }) {
        this.url = e, this.headers = n, this.fetch = Zr(r), this.experimental = i ?? {}, this.mfa = { listFactors: this._listFactors.bind(this), deleteFactor: this._deleteFactor.bind(this) }, this.oauth = { listClients: this._listOAuthClients.bind(this), createClient: this._createOAuthClient.bind(this), getClient: this._getOAuthClient.bind(this), updateClient: this._updateOAuthClient.bind(this), deleteClient: this._deleteOAuthClient.bind(this), regenerateClientSecret: this._regenerateOAuthClientSecret.bind(this) }, this.customProviders = { listProviders: this._listCustomProviders.bind(this), createProvider: this._createCustomProvider.bind(this), getProvider: this._getCustomProvider.bind(this), updateProvider: this._updateCustomProvider.bind(this), deleteProvider: this._deleteCustomProvider.bind(this) }, this.passkey = { listPasskeys: this._adminListPasskeys.bind(this), deletePasskey: this._adminDeletePasskey.bind(this) };
      }
      async signOut(e, n = Xr[0]) {
        if (Xr.indexOf(n) < 0) throw new Error(`@supabase/auth-js: Parameter scope must be one of ${Xr.join(", ")}`);
        try {
          return await N(this.fetch, "POST", `${this.url}/logout?scope=${n}`, { headers: this.headers, jwt: e, noResolveJson: true }), { data: null, error: null };
        } catch (r) {
          if (O(r)) return { data: null, error: r };
          throw r;
        }
      }
      async inviteUserByEmail(e, n = {}) {
        try {
          return await N(this.fetch, "POST", `${this.url}/invite`, { body: { email: e, data: n.data }, headers: this.headers, redirectTo: n.redirectTo, xform: pt });
        } catch (r) {
          if (O(r)) return { data: { user: null }, error: r };
          throw r;
        }
      }
      async generateLink(e) {
        try {
          let { options: n } = e, r = Bt(e, ["options"]), i = Object.assign(Object.assign({}, r), n);
          return "newEmail" in r && (i.new_email = r?.newEmail, delete i.newEmail), await N(this.fetch, "POST", `${this.url}/admin/generate_link`, { body: i, headers: this.headers, xform: Vs, redirectTo: n?.redirectTo });
        } catch (n) {
          if (O(n)) return { data: { properties: null, user: null }, error: n };
          throw n;
        }
      }
      async createUser(e) {
        try {
          return await N(this.fetch, "POST", `${this.url}/admin/users`, { body: e, headers: this.headers, xform: pt });
        } catch (n) {
          if (O(n)) return { data: { user: null }, error: n };
          throw n;
        }
      }
      async listUsers(e) {
        var n, r, i, a, s, l, c;
        try {
          let u = { nextPage: null, lastPage: 0, total: 0 }, d = await N(this.fetch, "GET", `${this.url}/admin/users`, { headers: this.headers, noResolveJson: true, query: { page: (r = (n = e?.page) === null || n === void 0 ? void 0 : n.toString()) !== null && r !== void 0 ? r : "", per_page: (a = (i = e?.perPage) === null || i === void 0 ? void 0 : i.toString()) !== null && a !== void 0 ? a : "" }, xform: Vi });
          if (d.error) throw d.error;
          let h = await d.json(), g = (s = d.headers.get("x-total-count")) !== null && s !== void 0 ? s : 0, f = (c = (l = d.headers.get("link")) === null || l === void 0 ? void 0 : l.split(",")) !== null && c !== void 0 ? c : [];
          return f.length > 0 && (f.forEach((m) => {
            let b = parseInt(m.split(";")[0].split("=")[1].substring(0, 1)), v = JSON.parse(m.split(";")[1].split("=")[1]);
            u[`${v}Page`] = b;
          }), u.total = parseInt(g)), { data: Object.assign(Object.assign({}, h), u), error: null };
        } catch (u) {
          if (O(u)) return { data: { users: [] }, error: u };
          throw u;
        }
      }
      async getUserById(e) {
        gt(e);
        try {
          return await N(this.fetch, "GET", `${this.url}/admin/users/${e}`, { headers: this.headers, xform: pt });
        } catch (n) {
          if (O(n)) return { data: { user: null }, error: n };
          throw n;
        }
      }
      async updateUserById(e, n) {
        gt(e);
        try {
          return await N(this.fetch, "PUT", `${this.url}/admin/users/${e}`, { body: n, headers: this.headers, xform: pt });
        } catch (r) {
          if (O(r)) return { data: { user: null }, error: r };
          throw r;
        }
      }
      async deleteUser(e, n = false) {
        gt(e);
        try {
          return await N(this.fetch, "DELETE", `${this.url}/admin/users/${e}`, { headers: this.headers, body: { should_soft_delete: n }, xform: pt });
        } catch (r) {
          if (O(r)) return { data: { user: null }, error: r };
          throw r;
        }
      }
      async _listFactors(e) {
        gt(e.userId);
        try {
          let { data: n, error: r } = await N(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/factors`, { headers: this.headers, xform: (i) => ({ data: { factors: i }, error: null }) });
          return { data: n, error: r };
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _deleteFactor(e) {
        gt(e.userId), gt(e.id);
        try {
          return { data: await N(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/factors/${e.id}`, { headers: this.headers }), error: null };
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _listOAuthClients(e) {
        var n, r, i, a, s, l, c;
        try {
          let u = { nextPage: null, lastPage: 0, total: 0 }, d = await N(this.fetch, "GET", `${this.url}/admin/oauth/clients`, { headers: this.headers, noResolveJson: true, query: { page: (r = (n = e?.page) === null || n === void 0 ? void 0 : n.toString()) !== null && r !== void 0 ? r : "", per_page: (a = (i = e?.perPage) === null || i === void 0 ? void 0 : i.toString()) !== null && a !== void 0 ? a : "" }, xform: Vi });
          if (d.error) throw d.error;
          let h = await d.json(), g = (s = d.headers.get("x-total-count")) !== null && s !== void 0 ? s : 0, f = (c = (l = d.headers.get("link")) === null || l === void 0 ? void 0 : l.split(",")) !== null && c !== void 0 ? c : [];
          return f.length > 0 && (f.forEach((m) => {
            let b = parseInt(m.split(";")[0].split("=")[1].substring(0, 1)), v = JSON.parse(m.split(";")[1].split("=")[1]);
            u[`${v}Page`] = b;
          }), u.total = parseInt(g)), { data: Object.assign(Object.assign({}, h), u), error: null };
        } catch (u) {
          if (O(u)) return { data: { clients: [] }, error: u };
          throw u;
        }
      }
      async _createOAuthClient(e) {
        try {
          return await N(this.fetch, "POST", `${this.url}/admin/oauth/clients`, { body: e, headers: this.headers, xform: (n) => ({ data: n, error: null }) });
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _getOAuthClient(e) {
        try {
          let n = this._encodePathSegment(e);
          return await N(this.fetch, "GET", `${this.url}/admin/oauth/clients/${n}`, { headers: this.headers, xform: (r) => ({ data: r, error: null }) });
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _updateOAuthClient(e, n) {
        try {
          let r = this._encodePathSegment(e);
          return await N(this.fetch, "PUT", `${this.url}/admin/oauth/clients/${r}`, { body: n, headers: this.headers, xform: (i) => ({ data: i, error: null }) });
        } catch (r) {
          if (O(r)) return { data: null, error: r };
          throw r;
        }
      }
      async _deleteOAuthClient(e) {
        try {
          let n = this._encodePathSegment(e);
          return await N(this.fetch, "DELETE", `${this.url}/admin/oauth/clients/${n}`, { headers: this.headers, noResolveJson: true }), { data: null, error: null };
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _regenerateOAuthClientSecret(e) {
        try {
          let n = this._encodePathSegment(e);
          return await N(this.fetch, "POST", `${this.url}/admin/oauth/clients/${n}/regenerate_secret`, { headers: this.headers, xform: (r) => ({ data: r, error: null }) });
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _listCustomProviders(e) {
        try {
          let n = {};
          return e?.type && (n.type = e.type), await N(this.fetch, "GET", `${this.url}/admin/custom-providers`, { headers: this.headers, query: n, xform: (r) => {
            var i;
            return { data: { providers: (i = r?.providers) !== null && i !== void 0 ? i : [] }, error: null };
          } });
        } catch (n) {
          if (O(n)) return { data: { providers: [] }, error: n };
          throw n;
        }
      }
      async _createCustomProvider(e) {
        try {
          return await N(this.fetch, "POST", `${this.url}/admin/custom-providers`, { body: e, headers: this.headers, xform: (n) => ({ data: n, error: null }) });
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _getCustomProvider(e) {
        try {
          let n = this._encodePathSegment(e);
          return await N(this.fetch, "GET", `${this.url}/admin/custom-providers/${n}`, { headers: this.headers, xform: (r) => ({ data: r, error: null }) });
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _updateCustomProvider(e, n) {
        try {
          let r = this._encodePathSegment(e);
          return await N(this.fetch, "PUT", `${this.url}/admin/custom-providers/${r}`, { body: n, headers: this.headers, xform: (i) => ({ data: i, error: null }) });
        } catch (r) {
          if (O(r)) return { data: null, error: r };
          throw r;
        }
      }
      async _deleteCustomProvider(e) {
        try {
          let n = this._encodePathSegment(e);
          return await N(this.fetch, "DELETE", `${this.url}/admin/custom-providers/${n}`, { headers: this.headers, noResolveJson: true }), { data: null, error: null };
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _adminListPasskeys(e) {
        Ye(this.experimental), gt(e.userId);
        try {
          return await N(this.fetch, "GET", `${this.url}/admin/users/${e.userId}/passkeys`, { headers: this.headers, xform: (n) => ({ data: n, error: null }) });
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
      async _adminDeletePasskey(e) {
        Ye(this.experimental), gt(e.userId), gt(e.passkeyId);
        try {
          return await N(this.fetch, "DELETE", `${this.url}/admin/users/${e.userId}/passkeys/${e.passkeyId}`, { headers: this.headers, noResolveJson: true }), { data: null, error: null };
        } catch (n) {
          if (O(n)) return { data: null, error: n };
          throw n;
        }
      }
    };
    function Ji(t = {}) {
      return { getItem: (e) => t[e] || null, setItem: (e, n) => {
        t[e] = n;
      }, removeItem: (e) => {
        delete t[e];
      } };
    }
    var st = { debug: !!(globalThis && Jr() && globalThis.localStorage && globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug") === "true") }, Yn = class extends Error {
      constructor(e) {
        super(e), this.isAcquireTimeout = true;
      }
    }, Xn = class extends Yn {
    };
    async function Zi(t, e, n) {
      st.debug && console.log("@supabase/gotrue-js: navigatorLock: acquire lock", t, e);
      let r = new globalThis.AbortController(), i;
      e > 0 && (i = setTimeout(() => {
        r.abort(), st.debug && console.log("@supabase/gotrue-js: navigatorLock acquire timed out", t);
      }, e)), await Promise.resolve();
      try {
        return await globalThis.navigator.locks.request(t, e === 0 ? { mode: "exclusive", ifAvailable: true } : { mode: "exclusive", signal: r.signal }, async (a) => {
          if (a) {
            clearTimeout(i), st.debug && console.log("@supabase/gotrue-js: navigatorLock: acquired", t, a.name);
            try {
              return await n();
            } finally {
              st.debug && console.log("@supabase/gotrue-js: navigatorLock: released", t, a.name);
            }
          } else {
            if (e === 0) throw st.debug && console.log("@supabase/gotrue-js: navigatorLock: not immediately available", t), new Xn(`Acquiring an exclusive Navigator LockManager lock "${t}" immediately failed`);
            if (st.debug) try {
              let s = await globalThis.navigator.locks.query();
              console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(s, null, "  "));
            } catch (s) {
              console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", s);
            }
            return console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request"), clearTimeout(i), await n();
          }
        });
      } catch (a) {
        if (e > 0 && clearTimeout(i), a !== null && typeof a == "object" && "name" in a && a.name === "AbortError" && e > 0) {
          if (r.signal.aborted) return st.debug && console.log("@supabase/gotrue-js: navigatorLock: acquire timeout, recovering by stealing lock", t), console.warn(`@supabase/gotrue-js: Lock "${t}" was not released within ${e}ms. This may indicate an orphaned lock from a component unmount (e.g., React Strict Mode). Forcefully acquiring the lock to recover.`), await Promise.resolve().then(() => globalThis.navigator.locks.request(t, { mode: "exclusive", steal: true }, async (s) => {
            if (s) {
              st.debug && console.log("@supabase/gotrue-js: navigatorLock: recovered (stolen)", t, s.name);
              try {
                return await n();
              } finally {
                st.debug && console.log("@supabase/gotrue-js: navigatorLock: released (stolen)", t, s.name);
              }
            } else return console.warn("@supabase/gotrue-js: Navigator LockManager returned null lock even with steal: true"), await n();
          }));
          throw st.debug && console.log("@supabase/gotrue-js: navigatorLock: lock was stolen by another request", t), new Xn(`Lock "${t}" was released because another request stole it`);
        }
        throw a;
      }
    }
    function Js() {
      if (typeof globalThis != "object") try {
        Object.defineProperty(Object.prototype, "__magic__", { get: function() {
          return this;
        }, configurable: true }), __magic__.globalThis = __magic__, delete Object.prototype.__magic__;
      } catch {
        typeof self < "u" && (self.globalThis = self);
      }
    }
    function Yi(t) {
      if (!/^0x[a-fA-F0-9]{40}$/.test(t)) throw new Error(`@supabase/auth-js: Address "${t}" is invalid.`);
      return t.toLowerCase();
    }
    function Zs(t) {
      return parseInt(t, 16);
    }
    function Ys(t) {
      let e = new TextEncoder().encode(t);
      return "0x" + Array.from(e, (r) => r.toString(16).padStart(2, "0")).join("");
    }
    function Xs(t) {
      var e;
      let { chainId: n, domain: r, expirationTime: i, issuedAt: a = /* @__PURE__ */ new Date(), nonce: s, notBefore: l, requestId: c, resources: u, scheme: d, uri: h, version: g } = t;
      {
        if (!Number.isInteger(n)) throw new Error(`@supabase/auth-js: Invalid SIWE message field "chainId". Chain ID must be a EIP-155 chain ID. Provided value: ${n}`);
        if (!r) throw new Error('@supabase/auth-js: Invalid SIWE message field "domain". Domain must be provided.');
        if (s && s.length < 8) throw new Error(`@supabase/auth-js: Invalid SIWE message field "nonce". Nonce must be at least 8 characters. Provided value: ${s}`);
        if (!h) throw new Error('@supabase/auth-js: Invalid SIWE message field "uri". URI must be provided.');
        if (g !== "1") throw new Error(`@supabase/auth-js: Invalid SIWE message field "version". Version must be '1'. Provided value: ${g}`);
        if (!((e = t.statement) === null || e === void 0) && e.includes(`
`)) throw new Error(`@supabase/auth-js: Invalid SIWE message field "statement". Statement must not include '\\n'. Provided value: ${t.statement}`);
      }
      let f = Yi(t.address), m = d ? `${d}://${r}` : r, b = t.statement ? `${t.statement}
` : "", v = `${m} wants you to sign in with your Ethereum account:
${f}

${b}`, y = `URI: ${h}
Version: ${g}
Chain ID: ${n}${s ? `
Nonce: ${s}` : ""}
Issued At: ${a.toISOString()}`;
      if (i && (y += `
Expiration Time: ${i.toISOString()}`), l && (y += `
Not Before: ${l.toISOString()}`), c && (y += `
Request ID: ${c}`), u) {
        let k = `
Resources:`;
        for (let _ of u) {
          if (!_ || typeof _ != "string") throw new Error(`@supabase/auth-js: Invalid SIWE message field "resources". Every resource must be a valid string. Provided value: ${_}`);
          k += `
- ${_}`;
        }
        y += k;
      }
      return `${v}
${y}`;
    }
    var we = class extends Error {
      constructor({ message: e, code: n, cause: r, name: i }) {
        var a;
        super(e, { cause: r }), this.__isWebAuthnError = true, this.name = (a = i ?? (r instanceof Error ? r.name : void 0)) !== null && a !== void 0 ? a : "Unknown Error", this.code = n;
      }
      toJSON() {
        return { name: this.name, message: this.message, code: this.code };
      }
    }, Ht = class extends we {
      constructor(e, n) {
        super({ code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: n, message: e }), this.name = "WebAuthnUnknownError", this.originalError = n;
      }
    };
    function Qs({ error: t, options: e }) {
      var n, r, i;
      let { publicKey: a } = e;
      if (!a) throw Error("options was missing required publicKey property");
      if (t.name === "AbortError") {
        if (e.signal instanceof AbortSignal) return new we({ message: "Registration ceremony was sent an abort signal", code: "ERROR_CEREMONY_ABORTED", cause: t });
      } else if (t.name === "ConstraintError") {
        if (((n = a.authenticatorSelection) === null || n === void 0 ? void 0 : n.requireResidentKey) === true) return new we({ message: "Discoverable credentials were required but no available authenticator supported it", code: "ERROR_AUTHENTICATOR_MISSING_DISCOVERABLE_CREDENTIAL_SUPPORT", cause: t });
        if (e.mediation === "conditional" && ((r = a.authenticatorSelection) === null || r === void 0 ? void 0 : r.userVerification) === "required") return new we({ message: "User verification was required during automatic registration but it could not be performed", code: "ERROR_AUTO_REGISTER_USER_VERIFICATION_FAILURE", cause: t });
        if (((i = a.authenticatorSelection) === null || i === void 0 ? void 0 : i.userVerification) === "required") return new we({ message: "User verification was required but no available authenticator supported it", code: "ERROR_AUTHENTICATOR_MISSING_USER_VERIFICATION_SUPPORT", cause: t });
      } else {
        if (t.name === "InvalidStateError") return new we({ message: "The authenticator was previously registered", code: "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED", cause: t });
        if (t.name === "NotAllowedError") return new we({ message: t.message, code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: t });
        if (t.name === "NotSupportedError") return a.pubKeyCredParams.filter((l) => l.type === "public-key").length === 0 ? new we({ message: 'No entry in pubKeyCredParams was of type "public-key"', code: "ERROR_MALFORMED_PUBKEYCREDPARAMS", cause: t }) : new we({ message: "No available authenticator supported any of the specified pubKeyCredParams algorithms", code: "ERROR_AUTHENTICATOR_NO_SUPPORTED_PUBKEYCREDPARAMS_ALG", cause: t });
        if (t.name === "SecurityError") {
          let s = window.location.hostname;
          if (Xi(s)) {
            if (a.rp.id !== s) return new we({ message: `The RP ID "${a.rp.id}" is invalid for this domain`, code: "ERROR_INVALID_RP_ID", cause: t });
          } else return new we({ message: `${window.location.hostname} is an invalid domain`, code: "ERROR_INVALID_DOMAIN", cause: t });
        } else if (t.name === "TypeError") {
          if (a.user.id.byteLength < 1 || a.user.id.byteLength > 64) return new we({ message: "User ID was not between 1 and 64 characters", code: "ERROR_INVALID_USER_ID_LENGTH", cause: t });
        } else if (t.name === "UnknownError") return new we({ message: "The authenticator was unable to process the specified options, or could not create a new credential", code: "ERROR_AUTHENTICATOR_GENERAL_ERROR", cause: t });
      }
      return new we({ message: "a Non-Webauthn related error has occurred", code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: t });
    }
    function eo({ error: t, options: e }) {
      let { publicKey: n } = e;
      if (!n) throw Error("options was missing required publicKey property");
      if (t.name === "AbortError") {
        if (e.signal instanceof AbortSignal) return new we({ message: "Authentication ceremony was sent an abort signal", code: "ERROR_CEREMONY_ABORTED", cause: t });
      } else {
        if (t.name === "NotAllowedError") return new we({ message: t.message, code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: t });
        if (t.name === "SecurityError") {
          let r = window.location.hostname;
          if (Xi(r)) {
            if (n.rpId !== r) return new we({ message: `The RP ID "${n.rpId}" is invalid for this domain`, code: "ERROR_INVALID_RP_ID", cause: t });
          } else return new we({ message: `${window.location.hostname} is an invalid domain`, code: "ERROR_INVALID_DOMAIN", cause: t });
        } else if (t.name === "UnknownError") return new we({ message: "The authenticator was unable to process the specified options, or could not create a new assertion signature", code: "ERROR_AUTHENTICATOR_GENERAL_ERROR", cause: t });
      }
      return new we({ message: "a Non-Webauthn related error has occurred", code: "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY", cause: t });
    }
    var Qi = class {
      createNewAbortSignal() {
        if (this.controller) {
          let n = new Error("Cancelling existing WebAuthn API call for new one");
          n.name = "AbortError", this.controller.abort(n);
        }
        let e = new AbortController();
        return this.controller = e, e.signal;
      }
      cancelCeremony() {
        if (this.controller) {
          let e = new Error("Manually cancelling existing WebAuthn API call");
          e.name = "AbortError", this.controller.abort(e), this.controller = void 0;
        }
      }
    }, ti = new Qi();
    function ea(t) {
      if (!t) throw new Error("Credential creation options are required");
      if (typeof PublicKeyCredential < "u" && "parseCreationOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseCreationOptionsFromJSON == "function") return PublicKeyCredential.parseCreationOptionsFromJSON(t);
      let { challenge: e, user: n, excludeCredentials: r } = t, i = Bt(t, ["challenge", "user", "excludeCredentials"]), a = Tt(e).buffer, s = Object.assign(Object.assign({}, n), { id: Tt(n.id).buffer }), l = Object.assign(Object.assign({}, i), { challenge: a, user: s });
      if (r && r.length > 0) {
        l.excludeCredentials = new Array(r.length);
        for (let c = 0; c < r.length; c++) {
          let u = r[c];
          l.excludeCredentials[c] = Object.assign(Object.assign({}, u), { id: Tt(u.id).buffer, type: u.type || "public-key", transports: u.transports });
        }
      }
      return l;
    }
    function ta(t) {
      if (!t) throw new Error("Credential request options are required");
      if (typeof PublicKeyCredential < "u" && "parseRequestOptionsFromJSON" in PublicKeyCredential && typeof PublicKeyCredential.parseRequestOptionsFromJSON == "function") return PublicKeyCredential.parseRequestOptionsFromJSON(t);
      let { challenge: e, allowCredentials: n } = t, r = Bt(t, ["challenge", "allowCredentials"]), i = Tt(e).buffer, a = Object.assign(Object.assign({}, r), { challenge: i });
      if (n && n.length > 0) {
        a.allowCredentials = new Array(n.length);
        for (let s = 0; s < n.length; s++) {
          let l = n[s];
          a.allowCredentials[s] = Object.assign(Object.assign({}, l), { id: Tt(l.id).buffer, type: l.type || "public-key", transports: l.transports });
        }
      }
      return a;
    }
    function na(t) {
      var e;
      if ("toJSON" in t && typeof t.toJSON == "function") return t.toJSON();
      let n = t;
      return { id: t.id, rawId: t.id, response: { attestationObject: kt(new Uint8Array(t.response.attestationObject)), clientDataJSON: kt(new Uint8Array(t.response.clientDataJSON)) }, type: "public-key", clientExtensionResults: t.getClientExtensionResults(), authenticatorAttachment: (e = n.authenticatorAttachment) !== null && e !== void 0 ? e : void 0 };
    }
    function ra(t) {
      var e;
      if ("toJSON" in t && typeof t.toJSON == "function") return t.toJSON();
      let n = t, r = t.getClientExtensionResults(), i = t.response;
      return { id: t.id, rawId: t.id, response: { authenticatorData: kt(new Uint8Array(i.authenticatorData)), clientDataJSON: kt(new Uint8Array(i.clientDataJSON)), signature: kt(new Uint8Array(i.signature)), userHandle: i.userHandle ? kt(new Uint8Array(i.userHandle)) : void 0 }, type: "public-key", clientExtensionResults: r, authenticatorAttachment: (e = n.authenticatorAttachment) !== null && e !== void 0 ? e : void 0 };
    }
    function Xi(t) {
      return t === "localhost" || /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i.test(t);
    }
    function Qn() {
      var t, e;
      return !!(Pe() && "PublicKeyCredential" in window && window.PublicKeyCredential && "credentials" in navigator && typeof ((t = navigator?.credentials) === null || t === void 0 ? void 0 : t.create) == "function" && typeof ((e = navigator?.credentials) === null || e === void 0 ? void 0 : e.get) == "function");
    }
    async function ia(t) {
      try {
        let e = await navigator.credentials.create(t);
        return e ? e instanceof PublicKeyCredential ? { data: e, error: null } : { data: null, error: new Ht("Browser returned unexpected credential type", e) } : { data: null, error: new Ht("Empty credential response", e) };
      } catch (e) {
        return { data: null, error: Qs({ error: e, options: t }) };
      }
    }
    async function aa(t) {
      try {
        let e = await navigator.credentials.get(t);
        return e ? e instanceof PublicKeyCredential ? { data: e, error: null } : { data: null, error: new Ht("Browser returned unexpected credential type", e) } : { data: null, error: new Ht("Empty credential response", e) };
      } catch (e) {
        return { data: null, error: eo({ error: e, options: t }) };
      }
    }
    var Xc = { hints: ["security-key"], authenticatorSelection: { authenticatorAttachment: "cross-platform", requireResidentKey: false, userVerification: "preferred", residentKey: "discouraged" }, attestation: "direct" }, Qc = { userVerification: "preferred", hints: ["security-key"], attestation: "direct" };
    function Qr(...t) {
      let e = (i) => i !== null && typeof i == "object" && !Array.isArray(i), n = (i) => i instanceof ArrayBuffer || ArrayBuffer.isView(i), r = {};
      for (let i of t) if (i) for (let a in i) {
        let s = i[a];
        if (s !== void 0) if (Array.isArray(s)) r[a] = s;
        else if (n(s)) r[a] = s;
        else if (e(s)) {
          let l = r[a];
          e(l) ? r[a] = Qr(l, s) : r[a] = Qr(s);
        } else r[a] = s;
      }
      return r;
    }
    function eu(t, e) {
      return Qr(Xc, t, e || {});
    }
    function tu(t, e) {
      return Qr(Qc, t, e || {});
    }
    var ei = class {
      constructor(e) {
        this.client = e, this.enroll = this._enroll.bind(this), this.challenge = this._challenge.bind(this), this.verify = this._verify.bind(this), this.authenticate = this._authenticate.bind(this), this.register = this._register.bind(this);
      }
      async _enroll(e) {
        return this.client.mfa.enroll(Object.assign(Object.assign({}, e), { factorType: "webauthn" }));
      }
      async _challenge({ factorId: e, webauthn: n, friendlyName: r, signal: i }, a) {
        var s;
        try {
          let { data: l, error: c } = await this.client.mfa.challenge({ factorId: e, webauthn: n });
          if (!l) return { data: null, error: c };
          let u = i ?? ti.createNewAbortSignal();
          if (l.webauthn.type === "create") {
            let { user: d } = l.webauthn.credential_options.publicKey;
            if (!d.name) {
              let h = r;
              if (h) d.name = `${d.id}:${h}`;
              else {
                let f = (await this.client.getUser()).data.user, m = ((s = f?.user_metadata) === null || s === void 0 ? void 0 : s.name) || f?.email || f?.id || "User";
                d.name = `${d.id}:${m}`;
              }
            }
            d.displayName || (d.displayName = d.name);
          }
          switch (l.webauthn.type) {
            case "create": {
              let d = eu(l.webauthn.credential_options.publicKey, a?.create), { data: h, error: g } = await ia({ publicKey: d, signal: u });
              return h ? { data: { factorId: e, challengeId: l.id, webauthn: { type: l.webauthn.type, credential_response: h } }, error: null } : { data: null, error: g };
            }
            case "request": {
              let d = tu(l.webauthn.credential_options.publicKey, a?.request), { data: h, error: g } = await aa(Object.assign(Object.assign({}, l.webauthn.credential_options), { publicKey: d, signal: u }));
              return h ? { data: { factorId: e, challengeId: l.id, webauthn: { type: l.webauthn.type, credential_response: h } }, error: null } : { data: null, error: g };
            }
          }
        } catch (l) {
          return O(l) ? { data: null, error: l } : { data: null, error: new $e("Unexpected error in challenge", l) };
        }
      }
      async _verify({ challengeId: e, factorId: n, webauthn: r }) {
        return this.client.mfa.verify({ factorId: n, challengeId: e, webauthn: r });
      }
      async _authenticate({ factorId: e, webauthn: { rpId: n = typeof window < "u" ? window.location.hostname : void 0, rpOrigins: r = typeof window < "u" ? [window.location.origin] : void 0, signal: i } = {} }, a) {
        if (!n) return { data: null, error: new ft("rpId is required for WebAuthn authentication") };
        try {
          if (!Qn()) return { data: null, error: new $e("Browser does not support WebAuthn", null) };
          let { data: s, error: l } = await this.challenge({ factorId: e, webauthn: { rpId: n, rpOrigins: r }, signal: i }, { request: a });
          if (!s) return { data: null, error: l };
          let { webauthn: c } = s;
          return this._verify({ factorId: e, challengeId: s.challengeId, webauthn: { type: c.type, rpId: n, rpOrigins: r, credential_response: c.credential_response } });
        } catch (s) {
          return O(s) ? { data: null, error: s } : { data: null, error: new $e("Unexpected error in authenticate", s) };
        }
      }
      async _register({ friendlyName: e, webauthn: { rpId: n = typeof window < "u" ? window.location.hostname : void 0, rpOrigins: r = typeof window < "u" ? [window.location.origin] : void 0, signal: i } = {} }, a) {
        if (!n) return { data: null, error: new ft("rpId is required for WebAuthn registration") };
        try {
          if (!Qn()) return { data: null, error: new $e("Browser does not support WebAuthn", null) };
          let { data: s, error: l } = await this._enroll({ friendlyName: e });
          if (!s) return await this.client.mfa.listFactors().then((d) => {
            var h;
            return (h = d.data) === null || h === void 0 ? void 0 : h.all.find((g) => g.factor_type === "webauthn" && g.friendly_name === e && g.status !== "unverified");
          }).then((d) => d ? this.client.mfa.unenroll({ factorId: d?.id }) : void 0), { data: null, error: l };
          let { data: c, error: u } = await this._challenge({ factorId: s.id, friendlyName: s.friendly_name, webauthn: { rpId: n, rpOrigins: r }, signal: i }, { create: a });
          return c ? this._verify({ factorId: s.id, challengeId: c.challengeId, webauthn: { rpId: n, rpOrigins: r, type: c.webauthn.type, credential_response: c.webauthn.credential_response } }) : { data: null, error: u };
        } catch (s) {
          return O(s) ? { data: null, error: s } : { data: null, error: new $e("Unexpected error in register", s) };
        }
      }
    };
    Js();
    var nu = { url: As, storageKey: Ts, autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, headers: Ps, flowType: "implicit", debug: false, hasCustomAuthorizationHeader: false, throwOnError: false, lockAcquireTimeout: 5e3, skipAutoInitialize: false, experimental: {} };
    async function to(t, e, n) {
      return await n();
    }
    var pn = {}, ni = class t {
      get jwks() {
        var e, n;
        return (n = (e = pn[this.storageKey]) === null || e === void 0 ? void 0 : e.jwks) !== null && n !== void 0 ? n : { keys: [] };
      }
      set jwks(e) {
        pn[this.storageKey] = Object.assign(Object.assign({}, pn[this.storageKey]), { jwks: e });
      }
      get jwks_cached_at() {
        var e, n;
        return (n = (e = pn[this.storageKey]) === null || e === void 0 ? void 0 : e.cachedAt) !== null && n !== void 0 ? n : Number.MIN_SAFE_INTEGER;
      }
      set jwks_cached_at(e) {
        pn[this.storageKey] = Object.assign(Object.assign({}, pn[this.storageKey]), { cachedAt: e });
      }
      constructor(e) {
        var n, r, i, a;
        this.userStorage = null, this.memoryStorage = null, this.stateChangeEmitters = /* @__PURE__ */ new Map(), this.autoRefreshTicker = null, this.autoRefreshTickTimeout = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.initializePromise = null, this.detectSessionInUrl = true, this.hasCustomAuthorizationHeader = false, this.suppressGetSessionWarning = false, this.lockAcquired = false, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log;
        let s = Object.assign(Object.assign({}, nu), e);
        if (this.storageKey = s.storageKey, this.instanceID = (n = t.nextInstanceID[this.storageKey]) !== null && n !== void 0 ? n : 0, t.nextInstanceID[this.storageKey] = this.instanceID + 1, this.logDebugMessages = !!s.debug, typeof s.debug == "function" && (this.logger = s.debug), this.instanceID > 0 && Pe()) {
          let l = `${this._logPrefix()} Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.`;
          console.warn(l), this.logDebugMessages && console.trace(l);
        }
        if (this.persistSession = s.persistSession, this.autoRefreshToken = s.autoRefreshToken, this.experimental = (r = s.experimental) !== null && r !== void 0 ? r : {}, this.admin = new Wt({ url: s.url, headers: s.headers, fetch: s.fetch, experimental: this.experimental }), this.url = s.url, this.headers = s.headers, this.fetch = Zr(s.fetch), this.lock = s.lock || to, this.detectSessionInUrl = s.detectSessionInUrl, this.flowType = s.flowType, this.hasCustomAuthorizationHeader = s.hasCustomAuthorizationHeader, this.throwOnError = s.throwOnError, this.lockAcquireTimeout = s.lockAcquireTimeout, s.lock ? this.lock = s.lock : this.persistSession && Pe() && (!((i = globalThis?.navigator) === null || i === void 0) && i.locks) ? this.lock = Zi : this.lock = to, this.jwks || (this.jwks = { keys: [] }, this.jwks_cached_at = Number.MIN_SAFE_INTEGER), this.mfa = { verify: this._verify.bind(this), enroll: this._enroll.bind(this), unenroll: this._unenroll.bind(this), challenge: this._challenge.bind(this), listFactors: this._listFactors.bind(this), challengeAndVerify: this._challengeAndVerify.bind(this), getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this), webauthn: new ei(this) }, this.oauth = { getAuthorizationDetails: this._getAuthorizationDetails.bind(this), approveAuthorization: this._approveAuthorization.bind(this), denyAuthorization: this._denyAuthorization.bind(this), listGrants: this._listOAuthGrants.bind(this), revokeGrant: this._revokeOAuthGrant.bind(this) }, this.passkey = { startRegistration: this._startPasskeyRegistration.bind(this), verifyRegistration: this._verifyPasskeyRegistration.bind(this), startAuthentication: this._startPasskeyAuthentication.bind(this), verifyAuthentication: this._verifyPasskeyAuthentication.bind(this), list: this._listPasskeys.bind(this), update: this._updatePasskey.bind(this), delete: this._deletePasskey.bind(this) }, this.persistSession ? (s.storage ? this.storage = s.storage : Jr() ? this.storage = globalThis.localStorage : (this.memoryStorage = {}, this.storage = Ji(this.memoryStorage)), s.userStorage && (this.userStorage = s.userStorage)) : (this.memoryStorage = {}, this.storage = Ji(this.memoryStorage)), Pe() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
          try {
            this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
          } catch (l) {
            console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", l);
          }
          (a = this.broadcastChannel) === null || a === void 0 || a.addEventListener("message", async (l) => {
            this._debug("received broadcast notification from other tab or client", l);
            try {
              await this._notifyAllSubscribers(l.data.event, l.data.session, false);
            } catch (c) {
              this._debug("#broadcastChannel", "error", c);
            }
          });
        }
        s.skipAutoInitialize || this.initialize().catch((l) => {
          this._debug("#initialize()", "error", l);
        });
      }
      isThrowOnErrorEnabled() {
        return this.throwOnError;
      }
      _returnResult(e) {
        if (this.throwOnError && e && e.error) throw e.error;
        return e;
      }
      _logPrefix() {
        return `GoTrueClient@${this.storageKey}:${this.instanceID} (${Ur}) ${(/* @__PURE__ */ new Date()).toISOString()}`;
      }
      _debug(...e) {
        return this.logDebugMessages && this.logger(this._logPrefix(), ...e), this;
      }
      async initialize() {
        return this.initializePromise ? await this.initializePromise : (this.initializePromise = (async () => await this._acquireLock(this.lockAcquireTimeout, async () => await this._initialize()))(), await this.initializePromise);
      }
      async _initialize() {
        var e;
        try {
          let n = {}, r = "none";
          if (Pe() && (n = Ns(window.location.href), this._isImplicitGrantCallback(n) ? r = "implicit" : await this._isPKCECallback(n) && (r = "pkce")), Pe() && this.detectSessionInUrl && r !== "none") {
            let { data: i, error: a } = await this._getSessionFromURL(n, r);
            if (a) {
              if (this._debug("#_initialize()", "error detecting session from URL", a), zs(a)) {
                let c = (e = a.details) === null || e === void 0 ? void 0 : e.code;
                if (c === "identity_already_exists" || c === "identity_not_found" || c === "single_identity_not_deletable") return { error: a };
              }
              return { error: a };
            }
            let { session: s, redirectType: l } = i;
            return this._debug("#_initialize()", "detected session in URL", s, "redirect type", l), await this._saveSession(s), setTimeout(async () => {
              l === "recovery" ? await this._notifyAllSubscribers("PASSWORD_RECOVERY", s) : await this._notifyAllSubscribers("SIGNED_IN", s);
            }, 0), { error: null };
          }
          return await this._recoverAndRefresh(), { error: null };
        } catch (n) {
          return O(n) ? this._returnResult({ error: n }) : this._returnResult({ error: new $e("Unexpected error during initialization", n) });
        } finally {
          await this._handleVisibilityChange(), this._debug("#_initialize()", "end");
        }
      }
      async signInAnonymously(e) {
        var n, r, i;
        try {
          let a = await N(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, body: { data: (r = (n = e?.options) === null || n === void 0 ? void 0 : n.data) !== null && r !== void 0 ? r : {}, gotrue_meta_security: { captcha_token: (i = e?.options) === null || i === void 0 ? void 0 : i.captchaToken } }, xform: Xe }), { data: s, error: l } = a;
          if (l || !s) return this._returnResult({ data: { user: null, session: null }, error: l });
          let c = s.session, u = s.user;
          return s.session && (await this._saveSession(s.session), await this._notifyAllSubscribers("SIGNED_IN", c)), this._returnResult({ data: { user: u, session: c }, error: null });
        } catch (a) {
          if (O(a)) return this._returnResult({ data: { user: null, session: null }, error: a });
          throw a;
        }
      }
      async signUp(e) {
        var n, r, i;
        try {
          let a;
          if ("email" in e) {
            let { email: d, password: h, options: g } = e, f = null, m = null;
            this.flowType === "pkce" && ([f, m] = await Kt(this.storage, this.storageKey)), a = await N(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, redirectTo: g?.emailRedirectTo, body: { email: d, password: h, data: (n = g?.data) !== null && n !== void 0 ? n : {}, gotrue_meta_security: { captcha_token: g?.captchaToken }, code_challenge: f, code_challenge_method: m }, xform: Xe });
          } else if ("phone" in e) {
            let { phone: d, password: h, options: g } = e;
            a = await N(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, body: { phone: d, password: h, data: (r = g?.data) !== null && r !== void 0 ? r : {}, channel: (i = g?.channel) !== null && i !== void 0 ? i : "sms", gotrue_meta_security: { captcha_token: g?.captchaToken } }, xform: Xe });
          } else throw new jt("You must provide either an email or phone number and a password");
          let { data: s, error: l } = a;
          if (l || !s) return await Re(this.storage, `${this.storageKey}-code-verifier`), this._returnResult({ data: { user: null, session: null }, error: l });
          let c = s.session, u = s.user;
          return s.session && (await this._saveSession(s.session), await this._notifyAllSubscribers("SIGNED_IN", c)), this._returnResult({ data: { user: u, session: c }, error: null });
        } catch (a) {
          if (await Re(this.storage, `${this.storageKey}-code-verifier`), O(a)) return this._returnResult({ data: { user: null, session: null }, error: a });
          throw a;
        }
      }
      async signInWithPassword(e) {
        try {
          let n;
          if ("email" in e) {
            let { email: a, password: s, options: l } = e;
            n = await N(this.fetch, "POST", `${this.url}/token?grant_type=password`, { headers: this.headers, body: { email: a, password: s, gotrue_meta_security: { captcha_token: l?.captchaToken } }, xform: Hi });
          } else if ("phone" in e) {
            let { phone: a, password: s, options: l } = e;
            n = await N(this.fetch, "POST", `${this.url}/token?grant_type=password`, { headers: this.headers, body: { phone: a, password: s, gotrue_meta_security: { captcha_token: l?.captchaToken } }, xform: Hi });
          } else throw new jt("You must provide either an email or phone number and a password");
          let { data: r, error: i } = n;
          if (i) return this._returnResult({ data: { user: null, session: null }, error: i });
          if (!r || !r.session || !r.user) {
            let a = new _t();
            return this._returnResult({ data: { user: null, session: null }, error: a });
          }
          return r.session && (await this._saveSession(r.session), await this._notifyAllSubscribers("SIGNED_IN", r.session)), this._returnResult({ data: Object.assign({ user: r.user, session: r.session }, r.weak_password ? { weakPassword: r.weak_password } : null), error: i });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: { user: null, session: null }, error: n });
          throw n;
        }
      }
      async signInWithOAuth(e) {
        var n, r, i, a;
        return await this._handleProviderSignIn(e.provider, { redirectTo: (n = e.options) === null || n === void 0 ? void 0 : n.redirectTo, scopes: (r = e.options) === null || r === void 0 ? void 0 : r.scopes, queryParams: (i = e.options) === null || i === void 0 ? void 0 : i.queryParams, skipBrowserRedirect: (a = e.options) === null || a === void 0 ? void 0 : a.skipBrowserRedirect });
      }
      async exchangeCodeForSession(e) {
        return await this.initializePromise, this._acquireLock(this.lockAcquireTimeout, async () => this._exchangeCodeForSession(e));
      }
      async signInWithWeb3(e) {
        let { chain: n } = e;
        switch (n) {
          case "ethereum":
            return await this.signInWithEthereum(e);
          case "solana":
            return await this.signInWithSolana(e);
          default:
            throw new Error(`@supabase/auth-js: Unsupported chain "${n}"`);
        }
      }
      async signInWithEthereum(e) {
        var n, r, i, a, s, l, c, u, d, h, g;
        let f, m;
        if ("message" in e) f = e.message, m = e.signature;
        else {
          let { chain: b, wallet: v, statement: y, options: k } = e, _;
          if (Pe()) if (typeof v == "object") _ = v;
          else {
            let P = window;
            if ("ethereum" in P && typeof P.ethereum == "object" && "request" in P.ethereum && typeof P.ethereum.request == "function") _ = P.ethereum;
            else throw new Error("@supabase/auth-js: No compatible Ethereum wallet interface on the window object (window.ethereum) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'ethereum', wallet: resolvedUserWallet }) instead.");
          }
          else {
            if (typeof v != "object" || !k?.url) throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
            _ = v;
          }
          let T = new URL((n = k?.url) !== null && n !== void 0 ? n : window.location.href), I = await _.request({ method: "eth_requestAccounts" }).then((P) => P).catch(() => {
            throw new Error("@supabase/auth-js: Wallet method eth_requestAccounts is missing or invalid");
          });
          if (!I || I.length === 0) throw new Error("@supabase/auth-js: No accounts available. Please ensure the wallet is connected.");
          let D = Yi(I[0]), x = (r = k?.signInWithEthereum) === null || r === void 0 ? void 0 : r.chainId;
          if (!x) {
            let P = await _.request({ method: "eth_chainId" });
            x = Zs(P);
          }
          let w = { domain: T.host, address: D, statement: y, uri: T.href, version: "1", chainId: x, nonce: (i = k?.signInWithEthereum) === null || i === void 0 ? void 0 : i.nonce, issuedAt: (s = (a = k?.signInWithEthereum) === null || a === void 0 ? void 0 : a.issuedAt) !== null && s !== void 0 ? s : /* @__PURE__ */ new Date(), expirationTime: (l = k?.signInWithEthereum) === null || l === void 0 ? void 0 : l.expirationTime, notBefore: (c = k?.signInWithEthereum) === null || c === void 0 ? void 0 : c.notBefore, requestId: (u = k?.signInWithEthereum) === null || u === void 0 ? void 0 : u.requestId, resources: (d = k?.signInWithEthereum) === null || d === void 0 ? void 0 : d.resources };
          f = Xs(w), m = await _.request({ method: "personal_sign", params: [Ys(f), D] });
        }
        try {
          let { data: b, error: v } = await N(this.fetch, "POST", `${this.url}/token?grant_type=web3`, { headers: this.headers, body: Object.assign({ chain: "ethereum", message: f, signature: m }, !((h = e.options) === null || h === void 0) && h.captchaToken ? { gotrue_meta_security: { captcha_token: (g = e.options) === null || g === void 0 ? void 0 : g.captchaToken } } : null), xform: Xe });
          if (v) throw v;
          if (!b || !b.session || !b.user) {
            let y = new _t();
            return this._returnResult({ data: { user: null, session: null }, error: y });
          }
          return b.session && (await this._saveSession(b.session), await this._notifyAllSubscribers("SIGNED_IN", b.session)), this._returnResult({ data: Object.assign({}, b), error: v });
        } catch (b) {
          if (O(b)) return this._returnResult({ data: { user: null, session: null }, error: b });
          throw b;
        }
      }
      async signInWithSolana(e) {
        var n, r, i, a, s, l, c, u, d, h, g, f;
        let m, b;
        if ("message" in e) m = e.message, b = e.signature;
        else {
          let { chain: v, wallet: y, statement: k, options: _ } = e, T;
          if (Pe()) if (typeof y == "object") T = y;
          else {
            let D = window;
            if ("solana" in D && typeof D.solana == "object" && ("signIn" in D.solana && typeof D.solana.signIn == "function" || "signMessage" in D.solana && typeof D.solana.signMessage == "function")) T = D.solana;
            else throw new Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.");
          }
          else {
            if (typeof y != "object" || !_?.url) throw new Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
            T = y;
          }
          let I = new URL((n = _?.url) !== null && n !== void 0 ? n : window.location.href);
          if ("signIn" in T && T.signIn) {
            let D = await T.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, _?.signInWithSolana), { version: "1", domain: I.host, uri: I.href }), k ? { statement: k } : null)), x;
            if (Array.isArray(D) && D[0] && typeof D[0] == "object") x = D[0];
            else if (D && typeof D == "object" && "signedMessage" in D && "signature" in D) x = D;
            else throw new Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
            if ("signedMessage" in x && "signature" in x && (typeof x.signedMessage == "string" || x.signedMessage instanceof Uint8Array) && x.signature instanceof Uint8Array) m = typeof x.signedMessage == "string" ? x.signedMessage : new TextDecoder().decode(x.signedMessage), b = x.signature;
            else throw new Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
          } else {
            if (!("signMessage" in T) || typeof T.signMessage != "function" || !("publicKey" in T) || typeof T != "object" || !T.publicKey || !("toBase58" in T.publicKey) || typeof T.publicKey.toBase58 != "function") throw new Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
            m = [`${I.host} wants you to sign in with your Solana account:`, T.publicKey.toBase58(), ...k ? ["", k, ""] : [""], "Version: 1", `URI: ${I.href}`, `Issued At: ${(i = (r = _?.signInWithSolana) === null || r === void 0 ? void 0 : r.issuedAt) !== null && i !== void 0 ? i : (/* @__PURE__ */ new Date()).toISOString()}`, ...!((a = _?.signInWithSolana) === null || a === void 0) && a.notBefore ? [`Not Before: ${_.signInWithSolana.notBefore}`] : [], ...!((s = _?.signInWithSolana) === null || s === void 0) && s.expirationTime ? [`Expiration Time: ${_.signInWithSolana.expirationTime}`] : [], ...!((l = _?.signInWithSolana) === null || l === void 0) && l.chainId ? [`Chain ID: ${_.signInWithSolana.chainId}`] : [], ...!((c = _?.signInWithSolana) === null || c === void 0) && c.nonce ? [`Nonce: ${_.signInWithSolana.nonce}`] : [], ...!((u = _?.signInWithSolana) === null || u === void 0) && u.requestId ? [`Request ID: ${_.signInWithSolana.requestId}`] : [], ...!((h = (d = _?.signInWithSolana) === null || d === void 0 ? void 0 : d.resources) === null || h === void 0) && h.length ? ["Resources", ..._.signInWithSolana.resources.map((x) => `- ${x}`)] : []].join(`
`);
            let D = await T.signMessage(new TextEncoder().encode(m), "utf8");
            if (!D || !(D instanceof Uint8Array)) throw new Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
            b = D;
          }
        }
        try {
          let { data: v, error: y } = await N(this.fetch, "POST", `${this.url}/token?grant_type=web3`, { headers: this.headers, body: Object.assign({ chain: "solana", message: m, signature: kt(b) }, !((g = e.options) === null || g === void 0) && g.captchaToken ? { gotrue_meta_security: { captcha_token: (f = e.options) === null || f === void 0 ? void 0 : f.captchaToken } } : null), xform: Xe });
          if (y) throw y;
          if (!v || !v.session || !v.user) {
            let k = new _t();
            return this._returnResult({ data: { user: null, session: null }, error: k });
          }
          return v.session && (await this._saveSession(v.session), await this._notifyAllSubscribers("SIGNED_IN", v.session)), this._returnResult({ data: Object.assign({}, v), error: y });
        } catch (v) {
          if (O(v)) return this._returnResult({ data: { user: null, session: null }, error: v });
          throw v;
        }
      }
      async _exchangeCodeForSession(e) {
        let n = await Pt(this.storage, `${this.storageKey}-code-verifier`), [r, i] = (n ?? "").split("/");
        try {
          if (!r && this.flowType === "pkce") throw new Wr();
          let { data: a, error: s } = await N(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, { headers: this.headers, body: { auth_code: e, code_verifier: r }, xform: Xe });
          if (await Re(this.storage, `${this.storageKey}-code-verifier`), s) throw s;
          if (!a || !a.session || !a.user) {
            let l = new _t();
            return this._returnResult({ data: { user: null, session: null, redirectType: null }, error: l });
          }
          return a.session && (await this._saveSession(a.session), await this._notifyAllSubscribers(i === "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", a.session)), this._returnResult({ data: Object.assign(Object.assign({}, a), { redirectType: i ?? null }), error: s });
        } catch (a) {
          if (await Re(this.storage, `${this.storageKey}-code-verifier`), O(a)) return this._returnResult({ data: { user: null, session: null, redirectType: null }, error: a });
          throw a;
        }
      }
      async signInWithIdToken(e) {
        try {
          let { options: n, provider: r, token: i, access_token: a, nonce: s } = e, l = await N(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, { headers: this.headers, body: { provider: r, id_token: i, access_token: a, nonce: s, gotrue_meta_security: { captcha_token: n?.captchaToken } }, xform: Xe }), { data: c, error: u } = l;
          if (u) return this._returnResult({ data: { user: null, session: null }, error: u });
          if (!c || !c.session || !c.user) {
            let d = new _t();
            return this._returnResult({ data: { user: null, session: null }, error: d });
          }
          return c.session && (await this._saveSession(c.session), await this._notifyAllSubscribers("SIGNED_IN", c.session)), this._returnResult({ data: c, error: u });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: { user: null, session: null }, error: n });
          throw n;
        }
      }
      async signInWithOtp(e) {
        var n, r, i, a, s;
        try {
          if ("email" in e) {
            let { email: l, options: c } = e, u = null, d = null;
            this.flowType === "pkce" && ([u, d] = await Kt(this.storage, this.storageKey));
            let { error: h } = await N(this.fetch, "POST", `${this.url}/otp`, { headers: this.headers, body: { email: l, data: (n = c?.data) !== null && n !== void 0 ? n : {}, create_user: (r = c?.shouldCreateUser) !== null && r !== void 0 ? r : true, gotrue_meta_security: { captcha_token: c?.captchaToken }, code_challenge: u, code_challenge_method: d }, redirectTo: c?.emailRedirectTo });
            return this._returnResult({ data: { user: null, session: null }, error: h });
          }
          if ("phone" in e) {
            let { phone: l, options: c } = e, { data: u, error: d } = await N(this.fetch, "POST", `${this.url}/otp`, { headers: this.headers, body: { phone: l, data: (i = c?.data) !== null && i !== void 0 ? i : {}, create_user: (a = c?.shouldCreateUser) !== null && a !== void 0 ? a : true, gotrue_meta_security: { captcha_token: c?.captchaToken }, channel: (s = c?.channel) !== null && s !== void 0 ? s : "sms" } });
            return this._returnResult({ data: { user: null, session: null, messageId: u?.message_id }, error: d });
          }
          throw new jt("You must provide either an email or phone number.");
        } catch (l) {
          if (await Re(this.storage, `${this.storageKey}-code-verifier`), O(l)) return this._returnResult({ data: { user: null, session: null }, error: l });
          throw l;
        }
      }
      async verifyOtp(e) {
        var n, r;
        try {
          let i, a;
          "options" in e && (i = (n = e.options) === null || n === void 0 ? void 0 : n.redirectTo, a = (r = e.options) === null || r === void 0 ? void 0 : r.captchaToken);
          let { data: s, error: l } = await N(this.fetch, "POST", `${this.url}/verify`, { headers: this.headers, body: Object.assign(Object.assign({}, e), { gotrue_meta_security: { captcha_token: a } }), redirectTo: i, xform: Xe });
          if (l) throw l;
          if (!s) throw new Error("An error occurred on token verification.");
          let c = s.session, u = s.user;
          return c?.access_token && (await this._saveSession(c), await this._notifyAllSubscribers(e.type == "recovery" ? "PASSWORD_RECOVERY" : "SIGNED_IN", c)), this._returnResult({ data: { user: u, session: c }, error: null });
        } catch (i) {
          if (O(i)) return this._returnResult({ data: { user: null, session: null }, error: i });
          throw i;
        }
      }
      async signInWithSSO(e) {
        var n, r, i, a, s;
        try {
          let l = null, c = null;
          this.flowType === "pkce" && ([l, c] = await Kt(this.storage, this.storageKey));
          let u = await N(this.fetch, "POST", `${this.url}/sso`, { body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in e ? { provider_id: e.providerId } : null), "domain" in e ? { domain: e.domain } : null), { redirect_to: (r = (n = e.options) === null || n === void 0 ? void 0 : n.redirectTo) !== null && r !== void 0 ? r : void 0 }), !((i = e?.options) === null || i === void 0) && i.captchaToken ? { gotrue_meta_security: { captcha_token: e.options.captchaToken } } : null), { skip_http_redirect: true, code_challenge: l, code_challenge_method: c }), headers: this.headers, xform: Hs });
          return !((a = u.data) === null || a === void 0) && a.url && Pe() && !(!((s = e.options) === null || s === void 0) && s.skipBrowserRedirect) && window.location.assign(u.data.url), this._returnResult(u);
        } catch (l) {
          if (await Re(this.storage, `${this.storageKey}-code-verifier`), O(l)) return this._returnResult({ data: null, error: l });
          throw l;
        }
      }
      async reauthenticate() {
        return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._reauthenticate());
      }
      async _reauthenticate() {
        try {
          return await this._useSession(async (e) => {
            let { data: { session: n }, error: r } = e;
            if (r) throw r;
            if (!n) throw new ye();
            let { error: i } = await N(this.fetch, "GET", `${this.url}/reauthenticate`, { headers: this.headers, jwt: n.access_token });
            return this._returnResult({ data: { user: null, session: null }, error: i });
          });
        } catch (e) {
          if (O(e)) return this._returnResult({ data: { user: null, session: null }, error: e });
          throw e;
        }
      }
      async resend(e) {
        try {
          let n = `${this.url}/resend`;
          if ("email" in e) {
            let { email: r, type: i, options: a } = e, { error: s } = await N(this.fetch, "POST", n, { headers: this.headers, body: { email: r, type: i, gotrue_meta_security: { captcha_token: a?.captchaToken } }, redirectTo: a?.emailRedirectTo });
            return this._returnResult({ data: { user: null, session: null }, error: s });
          } else if ("phone" in e) {
            let { phone: r, type: i, options: a } = e, { data: s, error: l } = await N(this.fetch, "POST", n, { headers: this.headers, body: { phone: r, type: i, gotrue_meta_security: { captcha_token: a?.captchaToken } } });
            return this._returnResult({ data: { user: null, session: null, messageId: s?.message_id }, error: l });
          }
          throw new jt("You must provide either an email or phone number and a type");
        } catch (n) {
          if (O(n)) return this._returnResult({ data: { user: null, session: null }, error: n });
          throw n;
        }
      }
      async getSession() {
        return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => this._useSession(async (n) => n));
      }
      async _acquireLock(e, n) {
        this._debug("#_acquireLock", "begin", e);
        try {
          if (this.lockAcquired) {
            let r = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve(), i = (async () => (await r, await n()))();
            return this.pendingInLock.push((async () => {
              try {
                await i;
              } catch {
              }
            })()), i;
          }
          return await this.lock(`lock:${this.storageKey}`, e, async () => {
            this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
            try {
              this.lockAcquired = true;
              let r = n();
              for (this.pendingInLock.push((async () => {
                try {
                  await r;
                } catch {
                }
              })()), await r; this.pendingInLock.length; ) {
                let i = [...this.pendingInLock];
                await Promise.all(i), this.pendingInLock.splice(0, i.length);
              }
              return await r;
            } finally {
              this._debug("#_acquireLock", "lock released for storage key", this.storageKey), this.lockAcquired = false;
            }
          });
        } finally {
          this._debug("#_acquireLock", "end");
        }
      }
      async _useSession(e) {
        this._debug("#_useSession", "begin");
        try {
          let n = await this.__loadSession();
          return await e(n);
        } finally {
          this._debug("#_useSession", "end");
        }
      }
      async __loadSession() {
        this._debug("#__loadSession()", "begin"), this.lockAcquired || this._debug("#__loadSession()", "used outside of an acquired lock!", new Error().stack);
        try {
          let e = null, n = await Pt(this.storage, this.storageKey);
          if (this._debug("#getSession()", "session from storage", n), n !== null && (this._isValidSession(n) ? e = n : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !e) return { data: { session: null }, error: null };
          let r = e.expires_at ? e.expires_at * 1e3 - Date.now() < Kr : false;
          if (this._debug("#__loadSession()", `session has${r ? "" : " not"} expired`, "expires_at", e.expires_at), !r) {
            if (this.userStorage) {
              let s = await Pt(this.userStorage, this.storageKey + "-user");
              s?.user ? e.user = s.user : e.user = Yr();
            }
            if (this.storage.isServer && e.user && !e.user.__isUserNotAvailableProxy) {
              let s = { value: this.suppressGetSessionWarning };
              e.user = qs(e.user, s), s.value && (this.suppressGetSessionWarning = true);
            }
            return { data: { session: e }, error: null };
          }
          let { data: i, error: a } = await this._callRefreshToken(e.refresh_token);
          return a ? this._returnResult({ data: { session: null }, error: a }) : this._returnResult({ data: { session: i }, error: null });
        } finally {
          this._debug("#__loadSession()", "end");
        }
      }
      async getUser(e) {
        if (e) return await this._getUser(e);
        await this.initializePromise;
        let n = await this._acquireLock(this.lockAcquireTimeout, async () => await this._getUser());
        return n.data.user && (this.suppressGetSessionWarning = true), n;
      }
      async _getUser(e) {
        try {
          return e ? await N(this.fetch, "GET", `${this.url}/user`, { headers: this.headers, jwt: e, xform: pt }) : await this._useSession(async (n) => {
            var r, i, a;
            let { data: s, error: l } = n;
            if (l) throw l;
            return !(!((r = s.session) === null || r === void 0) && r.access_token) && !this.hasCustomAuthorizationHeader ? { data: { user: null }, error: new ye() } : await N(this.fetch, "GET", `${this.url}/user`, { headers: this.headers, jwt: (a = (i = s.session) === null || i === void 0 ? void 0 : i.access_token) !== null && a !== void 0 ? a : void 0, xform: pt });
          });
        } catch (n) {
          if (O(n)) return Vn(n) && (await this._removeSession(), await Re(this.storage, `${this.storageKey}-code-verifier`)), this._returnResult({ data: { user: null }, error: n });
          throw n;
        }
      }
      async updateUser(e, n = {}) {
        return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._updateUser(e, n));
      }
      async _updateUser(e, n = {}) {
        try {
          return await this._useSession(async (r) => {
            let { data: i, error: a } = r;
            if (a) throw a;
            if (!i.session) throw new ye();
            let s = i.session, l = null, c = null;
            this.flowType === "pkce" && e.email != null && ([l, c] = await Kt(this.storage, this.storageKey));
            let { data: u, error: d } = await N(this.fetch, "PUT", `${this.url}/user`, { headers: this.headers, redirectTo: n?.emailRedirectTo, body: Object.assign(Object.assign({}, e), { code_challenge: l, code_challenge_method: c }), jwt: s.access_token, xform: pt });
            if (d) throw d;
            return s.user = u.user, await this._saveSession(s), await this._notifyAllSubscribers("USER_UPDATED", s), this._returnResult({ data: { user: s.user }, error: null });
          });
        } catch (r) {
          if (await Re(this.storage, `${this.storageKey}-code-verifier`), O(r)) return this._returnResult({ data: { user: null }, error: r });
          throw r;
        }
      }
      async setSession(e) {
        return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._setSession(e));
      }
      async _setSession(e) {
        try {
          if (!e.access_token || !e.refresh_token) throw new ye();
          let n = Date.now() / 1e3, r = n, i = true, a = null, { payload: s } = Zn(e.access_token);
          if (s.exp && (r = s.exp, i = r <= n), i) {
            let { data: l, error: c } = await this._callRefreshToken(e.refresh_token);
            if (c) return this._returnResult({ data: { user: null, session: null }, error: c });
            if (!l) return { data: { user: null, session: null }, error: null };
            a = l;
          } else {
            let { data: l, error: c } = await this._getUser(e.access_token);
            if (c) return this._returnResult({ data: { user: null, session: null }, error: c });
            a = { access_token: e.access_token, refresh_token: e.refresh_token, user: l.user, token_type: "bearer", expires_in: r - n, expires_at: r }, await this._saveSession(a), await this._notifyAllSubscribers("SIGNED_IN", a);
          }
          return this._returnResult({ data: { user: a.user, session: a }, error: null });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: { session: null, user: null }, error: n });
          throw n;
        }
      }
      async refreshSession(e) {
        return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._refreshSession(e));
      }
      async _refreshSession(e) {
        try {
          return await this._useSession(async (n) => {
            var r;
            if (!e) {
              let { data: s, error: l } = n;
              if (l) throw l;
              e = (r = s.session) !== null && r !== void 0 ? r : void 0;
            }
            if (!e?.refresh_token) throw new ye();
            let { data: i, error: a } = await this._callRefreshToken(e.refresh_token);
            return a ? this._returnResult({ data: { user: null, session: null }, error: a }) : i ? this._returnResult({ data: { user: i.user, session: i }, error: null }) : this._returnResult({ data: { user: null, session: null }, error: null });
          });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: { user: null, session: null }, error: n });
          throw n;
        }
      }
      async _getSessionFromURL(e, n) {
        var r;
        try {
          if (!Pe()) throw new Gt("No browser detected.");
          if (e.error || e.error_description || e.error_code) throw new Gt(e.error_description || "Error in URL with unspecified error_description", { error: e.error || "unspecified_error", code: e.error_code || "unspecified_code" });
          switch (n) {
            case "implicit":
              if (this.flowType === "pkce") throw new Wn("Not a valid PKCE flow url.");
              break;
            case "pkce":
              if (this.flowType === "implicit") throw new Gt("Not a valid implicit grant flow url.");
              break;
            default:
          }
          if (n === "pkce") {
            if (this._debug("#_initialize()", "begin", "is PKCE flow", true), !e.code) throw new Wn("No code detected.");
            let { data: _, error: T } = await this._exchangeCodeForSession(e.code);
            if (T) throw T;
            let I = new URL(window.location.href);
            return I.searchParams.delete("code"), window.history.replaceState(window.history.state, "", I.toString()), { data: { session: _.session, redirectType: (r = _.redirectType) !== null && r !== void 0 ? r : null }, error: null };
          }
          let { provider_token: i, provider_refresh_token: a, access_token: s, refresh_token: l, expires_in: c, expires_at: u, token_type: d } = e;
          if (!s || !c || !l || !d) throw new Gt("No session defined in URL");
          let h = Math.round(Date.now() / 1e3), g = parseInt(c), f = h + g;
          u && (f = parseInt(u));
          let m = f - h;
          m * 1e3 <= Nt && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${m}s, should have been closer to ${g}s`);
          let b = f - g;
          h - b >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", b, f, h) : h - b < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", b, f, h);
          let { data: v, error: y } = await this._getUser(s);
          if (y) throw y;
          let k = { provider_token: i, provider_refresh_token: a, access_token: s, expires_in: g, expires_at: f, refresh_token: l, token_type: d, user: v.user };
          return window.location.hash = "", this._debug("#_getSessionFromURL()", "clearing window.location.hash"), this._returnResult({ data: { session: k, redirectType: e.type }, error: null });
        } catch (i) {
          if (O(i)) return this._returnResult({ data: { session: null, redirectType: null }, error: i });
          throw i;
        }
      }
      _isImplicitGrantCallback(e) {
        return typeof this.detectSessionInUrl == "function" ? this.detectSessionInUrl(new URL(window.location.href), e) : !!(e.access_token || e.error_description);
      }
      async _isPKCECallback(e) {
        let n = await Pt(this.storage, `${this.storageKey}-code-verifier`);
        return !!(e.code && n);
      }
      async signOut(e = { scope: "global" }) {
        return await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => await this._signOut(e));
      }
      async _signOut({ scope: e } = { scope: "global" }) {
        return await this._useSession(async (n) => {
          var r;
          let { data: i, error: a } = n;
          if (a && !Vn(a)) return this._returnResult({ error: a });
          let s = (r = i.session) === null || r === void 0 ? void 0 : r.access_token;
          if (s) {
            let { error: l } = await this.admin.signOut(s, e);
            if (l && !(Rs(l) && (l.status === 404 || l.status === 401 || l.status === 403) || Vn(l))) return this._returnResult({ error: l });
          }
          return e !== "others" && (await this._removeSession(), await Re(this.storage, `${this.storageKey}-code-verifier`)), this._returnResult({ error: null });
        });
      }
      onAuthStateChange(e) {
        let n = Ls(), r = { id: n, callback: e, unsubscribe: () => {
          this._debug("#unsubscribe()", "state change callback with id removed", n), this.stateChangeEmitters.delete(n);
        } };
        return this._debug("#onAuthStateChange()", "registered callback with id", n), this.stateChangeEmitters.set(n, r), (async () => (await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => {
          this._emitInitialSession(n);
        })))(), { data: { subscription: r } };
      }
      async _emitInitialSession(e) {
        return await this._useSession(async (n) => {
          var r, i;
          try {
            let { data: { session: a }, error: s } = n;
            if (s) throw s;
            await ((r = this.stateChangeEmitters.get(e)) === null || r === void 0 ? void 0 : r.callback("INITIAL_SESSION", a)), this._debug("INITIAL_SESSION", "callback id", e, "session", a);
          } catch (a) {
            await ((i = this.stateChangeEmitters.get(e)) === null || i === void 0 ? void 0 : i.callback("INITIAL_SESSION", null)), this._debug("INITIAL_SESSION", "callback id", e, "error", a), Vn(a) ? console.warn(a) : console.error(a);
          }
        });
      }
      async resetPasswordForEmail(e, n = {}) {
        let r = null, i = null;
        this.flowType === "pkce" && ([r, i] = await Kt(this.storage, this.storageKey, true));
        try {
          return await N(this.fetch, "POST", `${this.url}/recover`, { body: { email: e, code_challenge: r, code_challenge_method: i, gotrue_meta_security: { captcha_token: n.captchaToken } }, headers: this.headers, redirectTo: n.redirectTo });
        } catch (a) {
          if (await Re(this.storage, `${this.storageKey}-code-verifier`), O(a)) return this._returnResult({ data: null, error: a });
          throw a;
        }
      }
      async getUserIdentities() {
        var e;
        try {
          let { data: n, error: r } = await this.getUser();
          if (r) throw r;
          return this._returnResult({ data: { identities: (e = n.user.identities) !== null && e !== void 0 ? e : [] }, error: null });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
      async linkIdentity(e) {
        return "token" in e ? this.linkIdentityIdToken(e) : this.linkIdentityOAuth(e);
      }
      async linkIdentityOAuth(e) {
        var n;
        try {
          let { data: r, error: i } = await this._useSession(async (a) => {
            var s, l, c, u, d;
            let { data: h, error: g } = a;
            if (g) throw g;
            let f = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, e.provider, { redirectTo: (s = e.options) === null || s === void 0 ? void 0 : s.redirectTo, scopes: (l = e.options) === null || l === void 0 ? void 0 : l.scopes, queryParams: (c = e.options) === null || c === void 0 ? void 0 : c.queryParams, skipBrowserRedirect: true });
            return await N(this.fetch, "GET", f, { headers: this.headers, jwt: (d = (u = h.session) === null || u === void 0 ? void 0 : u.access_token) !== null && d !== void 0 ? d : void 0 });
          });
          if (i) throw i;
          return Pe() && !(!((n = e.options) === null || n === void 0) && n.skipBrowserRedirect) && window.location.assign(r?.url), this._returnResult({ data: { provider: e.provider, url: r?.url }, error: null });
        } catch (r) {
          if (O(r)) return this._returnResult({ data: { provider: e.provider, url: null }, error: r });
          throw r;
        }
      }
      async linkIdentityIdToken(e) {
        return await this._useSession(async (n) => {
          var r;
          try {
            let { error: i, data: { session: a } } = n;
            if (i) throw i;
            let { options: s, provider: l, token: c, access_token: u, nonce: d } = e, h = await N(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, { headers: this.headers, jwt: (r = a?.access_token) !== null && r !== void 0 ? r : void 0, body: { provider: l, id_token: c, access_token: u, nonce: d, link_identity: true, gotrue_meta_security: { captcha_token: s?.captchaToken } }, xform: Xe }), { data: g, error: f } = h;
            return f ? this._returnResult({ data: { user: null, session: null }, error: f }) : !g || !g.session || !g.user ? this._returnResult({ data: { user: null, session: null }, error: new _t() }) : (g.session && (await this._saveSession(g.session), await this._notifyAllSubscribers("USER_UPDATED", g.session)), this._returnResult({ data: g, error: f }));
          } catch (i) {
            if (await Re(this.storage, `${this.storageKey}-code-verifier`), O(i)) return this._returnResult({ data: { user: null, session: null }, error: i });
            throw i;
          }
        });
      }
      async unlinkIdentity(e) {
        try {
          return await this._useSession(async (n) => {
            var r, i;
            let { data: a, error: s } = n;
            if (s) throw s;
            return await N(this.fetch, "DELETE", `${this.url}/user/identities/${e.identity_id}`, { headers: this.headers, jwt: (i = (r = a.session) === null || r === void 0 ? void 0 : r.access_token) !== null && i !== void 0 ? i : void 0 });
          });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
      async _refreshAccessToken(e) {
        let n = `#_refreshAccessToken(${e.substring(0, 5)}...)`;
        this._debug(n, "begin");
        try {
          let r = Date.now();
          return await Fs(async (i) => (i > 0 && await Gs(200 * Math.pow(2, i - 1)), this._debug(n, "refreshing attempt", i), await N(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, { body: { refresh_token: e }, headers: this.headers, xform: Xe })), (i, a) => {
            let s = 200 * Math.pow(2, i);
            return a && Hr(a) && Date.now() + s - r < Nt;
          });
        } catch (r) {
          if (this._debug(n, "error", r), O(r)) return this._returnResult({ data: { session: null, user: null }, error: r });
          throw r;
        } finally {
          this._debug(n, "end");
        }
      }
      _isValidSession(e) {
        return typeof e == "object" && e !== null && "access_token" in e && "refresh_token" in e && "expires_at" in e;
      }
      async _handleProviderSignIn(e, n) {
        let r = await this._getUrlForProvider(`${this.url}/authorize`, e, { redirectTo: n.redirectTo, scopes: n.scopes, queryParams: n.queryParams });
        return this._debug("#_handleProviderSignIn()", "provider", e, "options", n, "url", r), Pe() && !n.skipBrowserRedirect && window.location.assign(r), { data: { provider: e, url: r }, error: null };
      }
      async _recoverAndRefresh() {
        var e, n;
        let r = "#_recoverAndRefresh()";
        this._debug(r, "begin");
        try {
          let i = await Pt(this.storage, this.storageKey);
          if (i && this.userStorage) {
            let s = await Pt(this.userStorage, this.storageKey + "-user");
            !this.storage.isServer && Object.is(this.storage, this.userStorage) && !s && (s = { user: i.user }, await Mt(this.userStorage, this.storageKey + "-user", s)), i.user = (e = s?.user) !== null && e !== void 0 ? e : Yr();
          } else if (i && !i.user && !i.user) {
            let s = await Pt(this.storage, this.storageKey + "-user");
            s && s?.user ? (i.user = s.user, await Re(this.storage, this.storageKey + "-user"), await Mt(this.storage, this.storageKey, i)) : i.user = Yr();
          }
          if (this._debug(r, "session from storage", i), !this._isValidSession(i)) {
            this._debug(r, "session is not valid"), i !== null && await this._removeSession();
            return;
          }
          let a = ((n = i.expires_at) !== null && n !== void 0 ? n : 1 / 0) * 1e3 - Date.now() < Kr;
          if (this._debug(r, `session has${a ? "" : " not"} expired with margin of ${Kr}s`), a) {
            if (this.autoRefreshToken && i.refresh_token) {
              let { error: s } = await this._callRefreshToken(i.refresh_token);
              s && (console.error(s), Hr(s) || (this._debug(r, "refresh failed with a non-retryable error, removing the session", s), await this._removeSession()));
            }
          } else if (i.user && i.user.__isUserNotAvailableProxy === true) try {
            let { data: s, error: l } = await this._getUser(i.access_token);
            !l && s?.user ? (i.user = s.user, await this._saveSession(i), await this._notifyAllSubscribers("SIGNED_IN", i)) : this._debug(r, "could not get user data, skipping SIGNED_IN notification");
          } catch (s) {
            console.error("Error getting user data:", s), this._debug(r, "error getting user data, skipping SIGNED_IN notification", s);
          }
          else await this._notifyAllSubscribers("SIGNED_IN", i);
        } catch (i) {
          this._debug(r, "error", i), console.error(i);
          return;
        } finally {
          this._debug(r, "end");
        }
      }
      async _callRefreshToken(e) {
        var n, r;
        if (!e) throw new ye();
        if (this.refreshingDeferred) return this.refreshingDeferred.promise;
        let i = `#_callRefreshToken(${e.substring(0, 5)}...)`;
        this._debug(i, "begin");
        try {
          this.refreshingDeferred = new Jn();
          let { data: a, error: s } = await this._refreshAccessToken(e);
          if (s) throw s;
          if (!a.session) throw new ye();
          await this._saveSession(a.session), await this._notifyAllSubscribers("TOKEN_REFRESHED", a.session);
          let l = { data: a.session, error: null };
          return this.refreshingDeferred.resolve(l), l;
        } catch (a) {
          if (this._debug(i, "error", a), O(a)) {
            let s = { data: null, error: a };
            return Hr(a) || await this._removeSession(), (n = this.refreshingDeferred) === null || n === void 0 || n.resolve(s), s;
          }
          throw (r = this.refreshingDeferred) === null || r === void 0 || r.reject(a), a;
        } finally {
          this.refreshingDeferred = null, this._debug(i, "end");
        }
      }
      async _notifyAllSubscribers(e, n, r = true) {
        let i = `#_notifyAllSubscribers(${e})`;
        this._debug(i, "begin", n, `broadcast = ${r}`);
        try {
          this.broadcastChannel && r && this.broadcastChannel.postMessage({ event: e, session: n });
          let a = [], s = Array.from(this.stateChangeEmitters.values()).map(async (l) => {
            try {
              await l.callback(e, n);
            } catch (c) {
              a.push(c);
            }
          });
          if (await Promise.all(s), a.length > 0) {
            for (let l = 0; l < a.length; l += 1) console.error(a[l]);
            throw a[0];
          }
        } finally {
          this._debug(i, "end");
        }
      }
      async _saveSession(e) {
        this._debug("#_saveSession()", e), this.suppressGetSessionWarning = true, await Re(this.storage, `${this.storageKey}-code-verifier`);
        let n = Object.assign({}, e), r = n.user && n.user.__isUserNotAvailableProxy === true;
        if (this.userStorage) {
          !r && n.user && await Mt(this.userStorage, this.storageKey + "-user", { user: n.user });
          let i = Object.assign({}, n);
          delete i.user;
          let a = Wi(i);
          await Mt(this.storage, this.storageKey, a);
        } else {
          let i = Wi(n);
          await Mt(this.storage, this.storageKey, i);
        }
      }
      async _removeSession() {
        this._debug("#_removeSession()"), this.suppressGetSessionWarning = false, await Re(this.storage, this.storageKey), await Re(this.storage, this.storageKey + "-code-verifier"), await Re(this.storage, this.storageKey + "-user"), this.userStorage && await Re(this.userStorage, this.storageKey + "-user"), await this._notifyAllSubscribers("SIGNED_OUT", null);
      }
      _removeVisibilityChangedCallback() {
        this._debug("#_removeVisibilityChangedCallback()");
        let e = this.visibilityChangedCallback;
        this.visibilityChangedCallback = null;
        try {
          e && Pe() && window?.removeEventListener && window.removeEventListener("visibilitychange", e);
        } catch (n) {
          console.error("removing visibilitychange callback failed", n);
        }
      }
      async _startAutoRefresh() {
        await this._stopAutoRefresh(), this._debug("#_startAutoRefresh()");
        let e = setInterval(() => this._autoRefreshTokenTick(), Nt);
        this.autoRefreshTicker = e, e && typeof e == "object" && typeof e.unref == "function" ? e.unref() : typeof Deno < "u" && typeof Deno.unrefTimer == "function" && Deno.unrefTimer(e);
        let n = setTimeout(async () => {
          await this.initializePromise, await this._autoRefreshTokenTick();
        }, 0);
        this.autoRefreshTickTimeout = n, n && typeof n == "object" && typeof n.unref == "function" ? n.unref() : typeof Deno < "u" && typeof Deno.unrefTimer == "function" && Deno.unrefTimer(n);
      }
      async _stopAutoRefresh() {
        this._debug("#_stopAutoRefresh()");
        let e = this.autoRefreshTicker;
        this.autoRefreshTicker = null, e && clearInterval(e);
        let n = this.autoRefreshTickTimeout;
        this.autoRefreshTickTimeout = null, n && clearTimeout(n);
      }
      async startAutoRefresh() {
        this._removeVisibilityChangedCallback(), await this._startAutoRefresh();
      }
      async stopAutoRefresh() {
        this._removeVisibilityChangedCallback(), await this._stopAutoRefresh();
      }
      async _autoRefreshTokenTick() {
        this._debug("#_autoRefreshTokenTick()", "begin");
        try {
          await this._acquireLock(0, async () => {
            try {
              let e = Date.now();
              try {
                return await this._useSession(async (n) => {
                  let { data: { session: r } } = n;
                  if (!r || !r.refresh_token || !r.expires_at) {
                    this._debug("#_autoRefreshTokenTick()", "no session");
                    return;
                  }
                  let i = Math.floor((r.expires_at * 1e3 - e) / Nt);
                  this._debug("#_autoRefreshTokenTick()", `access token expires in ${i} ticks, a tick lasts ${Nt}ms, refresh threshold is ${Mr} ticks`), i <= Mr && await this._callRefreshToken(r.refresh_token);
                });
              } catch (n) {
                console.error("Auto refresh tick failed with error. This is likely a transient error.", n);
              }
            } finally {
              this._debug("#_autoRefreshTokenTick()", "end");
            }
          });
        } catch (e) {
          if (e instanceof Yn) this._debug("auto refresh token tick lock not available");
          else throw e;
        }
      }
      async _handleVisibilityChange() {
        if (this._debug("#_handleVisibilityChange()"), !Pe() || !window?.addEventListener) return this.autoRefreshToken && this.startAutoRefresh(), false;
        try {
          this.visibilityChangedCallback = async () => {
            try {
              await this._onVisibilityChanged(false);
            } catch (e) {
              this._debug("#visibilityChangedCallback", "error", e);
            }
          }, window?.addEventListener("visibilitychange", this.visibilityChangedCallback), await this._onVisibilityChanged(true);
        } catch (e) {
          console.error("_handleVisibilityChange", e);
        }
      }
      async _onVisibilityChanged(e) {
        let n = `#_onVisibilityChanged(${e})`;
        this._debug(n, "visibilityState", document.visibilityState), document.visibilityState === "visible" ? (this.autoRefreshToken && this._startAutoRefresh(), e || (await this.initializePromise, await this._acquireLock(this.lockAcquireTimeout, async () => {
          if (document.visibilityState !== "visible") {
            this._debug(n, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
            return;
          }
          await this._recoverAndRefresh();
        }))) : document.visibilityState === "hidden" && this.autoRefreshToken && this._stopAutoRefresh();
      }
      async _getUrlForProvider(e, n, r) {
        let i = [`provider=${encodeURIComponent(n)}`];
        if (r?.redirectTo && i.push(`redirect_to=${encodeURIComponent(r.redirectTo)}`), r?.scopes && i.push(`scopes=${encodeURIComponent(r.scopes)}`), this.flowType === "pkce") {
          let [a, s] = await Kt(this.storage, this.storageKey), l = new URLSearchParams({ code_challenge: `${encodeURIComponent(a)}`, code_challenge_method: `${encodeURIComponent(s)}` });
          i.push(l.toString());
        }
        if (r?.queryParams) {
          let a = new URLSearchParams(r.queryParams);
          i.push(a.toString());
        }
        return r?.skipBrowserRedirect && i.push(`skip_http_redirect=${r.skipBrowserRedirect}`), `${e}?${i.join("&")}`;
      }
      async _unenroll(e) {
        try {
          return await this._useSession(async (n) => {
            var r;
            let { data: i, error: a } = n;
            return a ? this._returnResult({ data: null, error: a }) : await N(this.fetch, "DELETE", `${this.url}/factors/${e.factorId}`, { headers: this.headers, jwt: (r = i?.session) === null || r === void 0 ? void 0 : r.access_token });
          });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
      async _enroll(e) {
        try {
          return await this._useSession(async (n) => {
            var r, i;
            let { data: a, error: s } = n;
            if (s) return this._returnResult({ data: null, error: s });
            let l = Object.assign({ friendly_name: e.friendlyName, factor_type: e.factorType }, e.factorType === "phone" ? { phone: e.phone } : e.factorType === "totp" ? { issuer: e.issuer } : {}), { data: c, error: u } = await N(this.fetch, "POST", `${this.url}/factors`, { body: l, headers: this.headers, jwt: (r = a?.session) === null || r === void 0 ? void 0 : r.access_token });
            return u ? this._returnResult({ data: null, error: u }) : (e.factorType === "totp" && c.type === "totp" && (!((i = c?.totp) === null || i === void 0) && i.qr_code) && (c.totp.qr_code = `data:image/svg+xml;utf-8,${c.totp.qr_code}`), this._returnResult({ data: c, error: null }));
          });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
      async _verify(e) {
        return this._acquireLock(this.lockAcquireTimeout, async () => {
          try {
            return await this._useSession(async (n) => {
              var r;
              let { data: i, error: a } = n;
              if (a) return this._returnResult({ data: null, error: a });
              let s = Object.assign({ challenge_id: e.challengeId }, "webauthn" in e ? { webauthn: Object.assign(Object.assign({}, e.webauthn), { credential_response: e.webauthn.type === "create" ? na(e.webauthn.credential_response) : ra(e.webauthn.credential_response) }) } : { code: e.code }), { data: l, error: c } = await N(this.fetch, "POST", `${this.url}/factors/${e.factorId}/verify`, { body: s, headers: this.headers, jwt: (r = i?.session) === null || r === void 0 ? void 0 : r.access_token });
              return c ? this._returnResult({ data: null, error: c }) : (await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + l.expires_in }, l)), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", l), this._returnResult({ data: l, error: c }));
            });
          } catch (n) {
            if (O(n)) return this._returnResult({ data: null, error: n });
            throw n;
          }
        });
      }
      async _challenge(e) {
        return this._acquireLock(this.lockAcquireTimeout, async () => {
          try {
            return await this._useSession(async (n) => {
              var r;
              let { data: i, error: a } = n;
              if (a) return this._returnResult({ data: null, error: a });
              let s = await N(this.fetch, "POST", `${this.url}/factors/${e.factorId}/challenge`, { body: e, headers: this.headers, jwt: (r = i?.session) === null || r === void 0 ? void 0 : r.access_token });
              if (s.error) return s;
              let { data: l } = s;
              if (l.type !== "webauthn") return { data: l, error: null };
              switch (l.webauthn.type) {
                case "create":
                  return { data: Object.assign(Object.assign({}, l), { webauthn: Object.assign(Object.assign({}, l.webauthn), { credential_options: Object.assign(Object.assign({}, l.webauthn.credential_options), { publicKey: ea(l.webauthn.credential_options.publicKey) }) }) }), error: null };
                case "request":
                  return { data: Object.assign(Object.assign({}, l), { webauthn: Object.assign(Object.assign({}, l.webauthn), { credential_options: Object.assign(Object.assign({}, l.webauthn.credential_options), { publicKey: ta(l.webauthn.credential_options.publicKey) }) }) }), error: null };
              }
            });
          } catch (n) {
            if (O(n)) return this._returnResult({ data: null, error: n });
            throw n;
          }
        });
      }
      async _challengeAndVerify(e) {
        let { data: n, error: r } = await this._challenge({ factorId: e.factorId });
        return r ? this._returnResult({ data: null, error: r }) : await this._verify({ factorId: e.factorId, challengeId: n.id, code: e.code });
      }
      async _listFactors() {
        var e;
        let { data: { user: n }, error: r } = await this.getUser();
        if (r) return { data: null, error: r };
        let i = { all: [], phone: [], totp: [], webauthn: [] };
        for (let a of (e = n?.factors) !== null && e !== void 0 ? e : []) i.all.push(a), a.status === "verified" && i[a.factor_type].push(a);
        return { data: i, error: null };
      }
      async _getAuthenticatorAssuranceLevel(e) {
        var n, r, i, a;
        if (e) try {
          let { payload: f } = Zn(e), m = null;
          f.aal && (m = f.aal);
          let b = m, { data: { user: v }, error: y } = await this.getUser(e);
          if (y) return this._returnResult({ data: null, error: y });
          ((r = (n = v?.factors) === null || n === void 0 ? void 0 : n.filter((T) => T.status === "verified")) !== null && r !== void 0 ? r : []).length > 0 && (b = "aal2");
          let _ = f.amr || [];
          return { data: { currentLevel: m, nextLevel: b, currentAuthenticationMethods: _ }, error: null };
        } catch (f) {
          if (O(f)) return this._returnResult({ data: null, error: f });
          throw f;
        }
        let { data: { session: s }, error: l } = await this.getSession();
        if (l) return this._returnResult({ data: null, error: l });
        if (!s) return { data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] }, error: null };
        let { payload: c } = Zn(s.access_token), u = null;
        c.aal && (u = c.aal);
        let d = u;
        ((a = (i = s.user.factors) === null || i === void 0 ? void 0 : i.filter((f) => f.status === "verified")) !== null && a !== void 0 ? a : []).length > 0 && (d = "aal2");
        let g = c.amr || [];
        return { data: { currentLevel: u, nextLevel: d, currentAuthenticationMethods: g }, error: null };
      }
      async _getAuthorizationDetails(e) {
        try {
          return await this._useSession(async (n) => {
            let { data: { session: r }, error: i } = n;
            return i ? this._returnResult({ data: null, error: i }) : r ? await N(this.fetch, "GET", `${this.url}/oauth/authorizations/${e}`, { headers: this.headers, jwt: r.access_token, xform: (a) => ({ data: a, error: null }) }) : this._returnResult({ data: null, error: new ye() });
          });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
      async _approveAuthorization(e, n) {
        try {
          return await this._useSession(async (r) => {
            let { data: { session: i }, error: a } = r;
            if (a) return this._returnResult({ data: null, error: a });
            if (!i) return this._returnResult({ data: null, error: new ye() });
            let s = await N(this.fetch, "POST", `${this.url}/oauth/authorizations/${e}/consent`, { headers: this.headers, jwt: i.access_token, body: { action: "approve" }, xform: (l) => ({ data: l, error: null }) });
            return s.data && s.data.redirect_url && Pe() && !n?.skipBrowserRedirect && window.location.assign(s.data.redirect_url), s;
          });
        } catch (r) {
          if (O(r)) return this._returnResult({ data: null, error: r });
          throw r;
        }
      }
      async _denyAuthorization(e, n) {
        try {
          return await this._useSession(async (r) => {
            let { data: { session: i }, error: a } = r;
            if (a) return this._returnResult({ data: null, error: a });
            if (!i) return this._returnResult({ data: null, error: new ye() });
            let s = await N(this.fetch, "POST", `${this.url}/oauth/authorizations/${e}/consent`, { headers: this.headers, jwt: i.access_token, body: { action: "deny" }, xform: (l) => ({ data: l, error: null }) });
            return s.data && s.data.redirect_url && Pe() && !n?.skipBrowserRedirect && window.location.assign(s.data.redirect_url), s;
          });
        } catch (r) {
          if (O(r)) return this._returnResult({ data: null, error: r });
          throw r;
        }
      }
      async _listOAuthGrants() {
        try {
          return await this._useSession(async (e) => {
            let { data: { session: n }, error: r } = e;
            return r ? this._returnResult({ data: null, error: r }) : n ? await N(this.fetch, "GET", `${this.url}/user/oauth/grants`, { headers: this.headers, jwt: n.access_token, xform: (i) => ({ data: i, error: null }) }) : this._returnResult({ data: null, error: new ye() });
          });
        } catch (e) {
          if (O(e)) return this._returnResult({ data: null, error: e });
          throw e;
        }
      }
      async _revokeOAuthGrant(e) {
        try {
          return await this._useSession(async (n) => {
            let { data: { session: r }, error: i } = n;
            return i ? this._returnResult({ data: null, error: i }) : r ? (await N(this.fetch, "DELETE", `${this.url}/user/oauth/grants`, { headers: this.headers, jwt: r.access_token, query: { client_id: e.clientId }, noResolveJson: true }), { data: {}, error: null }) : this._returnResult({ data: null, error: new ye() });
          });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
      async fetchJwk(e, n = { keys: [] }) {
        let r = n.keys.find((l) => l.kid === e);
        if (r) return r;
        let i = Date.now();
        if (r = this.jwks.keys.find((l) => l.kid === e), r && this.jwks_cached_at + Ds > i) return r;
        let { data: a, error: s } = await N(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, { headers: this.headers });
        if (s) throw s;
        return !a.keys || a.keys.length === 0 || (this.jwks = a, this.jwks_cached_at = i, r = a.keys.find((l) => l.kid === e), !r) ? null : r;
      }
      async getClaims(e, n = {}) {
        try {
          let r = e;
          if (!r) {
            let { data: f, error: m } = await this.getSession();
            if (m || !f.session) return this._returnResult({ data: null, error: m });
            r = f.session.access_token;
          }
          let { header: i, payload: a, signature: s, raw: { header: l, payload: c } } = Zn(r);
          n?.allowExpired || Ms(a.exp);
          let u = !i.alg || i.alg.startsWith("HS") || !i.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(i.kid, n?.keys ? { keys: n.keys } : n?.jwks);
          if (!u) {
            let { error: f } = await this.getUser(r);
            if (f) throw f;
            return { data: { claims: a, header: i, signature: s }, error: null };
          }
          let d = Ks(i.alg), h = await crypto.subtle.importKey("jwk", u, d, true, ["verify"]);
          if (!await crypto.subtle.verify(d, h, s, Is(`${l}.${c}`))) throw new Ft("Invalid JWT signature");
          return { data: { claims: a, header: i, signature: s }, error: null };
        } catch (r) {
          if (O(r)) return this._returnResult({ data: null, error: r });
          throw r;
        }
      }
      async signInWithPasskey(e) {
        var n, r, i;
        Ye(this.experimental);
        try {
          if (!Qn()) return this._returnResult({ data: null, error: new $e("Browser does not support WebAuthn", null) });
          let { data: a, error: s } = await this._startPasskeyAuthentication({ options: { captchaToken: (n = e?.options) === null || n === void 0 ? void 0 : n.captchaToken } });
          if (s || !a) return this._returnResult({ data: null, error: s });
          let l = ta(a.options), c = (i = (r = e?.options) === null || r === void 0 ? void 0 : r.signal) !== null && i !== void 0 ? i : ti.createNewAbortSignal(), { data: u, error: d } = await aa({ publicKey: l, signal: c });
          if (d || !u) return this._returnResult({ data: null, error: d ?? new $e("WebAuthn ceremony failed", null) });
          let h = ra(u);
          return this._verifyPasskeyAuthentication({ challengeId: a.challenge_id, credential: h });
        } catch (a) {
          if (O(a)) return this._returnResult({ data: null, error: a });
          throw a;
        }
      }
      async registerPasskey(e) {
        var n, r;
        Ye(this.experimental);
        try {
          if (!Qn()) return this._returnResult({ data: null, error: new $e("Browser does not support WebAuthn", null) });
          let { data: i, error: a } = await this._startPasskeyRegistration();
          if (a || !i) return this._returnResult({ data: null, error: a });
          let s = ea(i.options), l = (r = (n = e?.options) === null || n === void 0 ? void 0 : n.signal) !== null && r !== void 0 ? r : ti.createNewAbortSignal(), { data: c, error: u } = await ia({ publicKey: s, signal: l });
          if (u || !c) return this._returnResult({ data: null, error: u ?? new $e("WebAuthn ceremony failed", null) });
          let d = na(c);
          return this._verifyPasskeyRegistration({ challengeId: i.challenge_id, credential: d });
        } catch (i) {
          if (O(i)) return this._returnResult({ data: null, error: i });
          throw i;
        }
      }
      async _startPasskeyRegistration() {
        Ye(this.experimental);
        try {
          return await this._useSession(async (e) => {
            let { data: { session: n }, error: r } = e;
            if (r) return this._returnResult({ data: null, error: r });
            if (!n) return this._returnResult({ data: null, error: new ye() });
            let { data: i, error: a } = await N(this.fetch, "POST", `${this.url}/passkeys/registration/options`, { headers: this.headers, jwt: n.access_token, body: {} });
            return a ? this._returnResult({ data: null, error: a }) : this._returnResult({ data: i, error: null });
          });
        } catch (e) {
          if (O(e)) return this._returnResult({ data: null, error: e });
          throw e;
        }
      }
      async _verifyPasskeyRegistration(e) {
        Ye(this.experimental);
        try {
          return await this._useSession(async (n) => {
            let { data: { session: r }, error: i } = n;
            if (i) return this._returnResult({ data: null, error: i });
            if (!r) return this._returnResult({ data: null, error: new ye() });
            let { data: a, error: s } = await N(this.fetch, "POST", `${this.url}/passkeys/registration/verify`, { headers: this.headers, jwt: r.access_token, body: { challenge_id: e.challengeId, credential: e.credential } });
            return s ? this._returnResult({ data: null, error: s }) : this._returnResult({ data: a, error: null });
          });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
      async _startPasskeyAuthentication(e) {
        var n;
        Ye(this.experimental);
        try {
          let { data: r, error: i } = await N(this.fetch, "POST", `${this.url}/passkeys/authentication/options`, { headers: this.headers, body: { gotrue_meta_security: { captcha_token: (n = e?.options) === null || n === void 0 ? void 0 : n.captchaToken } } });
          return i ? this._returnResult({ data: null, error: i }) : this._returnResult({ data: r, error: null });
        } catch (r) {
          if (O(r)) return this._returnResult({ data: null, error: r });
          throw r;
        }
      }
      async _verifyPasskeyAuthentication(e) {
        Ye(this.experimental);
        try {
          let { data: n, error: r } = await N(this.fetch, "POST", `${this.url}/passkeys/authentication/verify`, { headers: this.headers, body: { challenge_id: e.challengeId, credential: e.credential }, xform: Xe });
          return r ? this._returnResult({ data: null, error: r }) : (n.session && (await this._saveSession(n.session), await this._notifyAllSubscribers("SIGNED_IN", n.session)), this._returnResult({ data: n, error: null }));
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
      async _listPasskeys() {
        Ye(this.experimental);
        try {
          return await this._useSession(async (e) => {
            let { data: { session: n }, error: r } = e;
            if (r) return this._returnResult({ data: null, error: r });
            if (!n) return this._returnResult({ data: null, error: new ye() });
            let { data: i, error: a } = await N(this.fetch, "GET", `${this.url}/passkeys`, { headers: this.headers, jwt: n.access_token, xform: (s) => ({ data: s, error: null }) });
            return a ? this._returnResult({ data: null, error: a }) : this._returnResult({ data: i, error: null });
          });
        } catch (e) {
          if (O(e)) return this._returnResult({ data: null, error: e });
          throw e;
        }
      }
      async _updatePasskey(e) {
        Ye(this.experimental);
        try {
          return await this._useSession(async (n) => {
            let { data: { session: r }, error: i } = n;
            if (i) return this._returnResult({ data: null, error: i });
            if (!r) return this._returnResult({ data: null, error: new ye() });
            let { data: a, error: s } = await N(this.fetch, "PATCH", `${this.url}/passkeys/${e.passkeyId}`, { headers: this.headers, jwt: r.access_token, body: { friendly_name: e.friendlyName } });
            return s ? this._returnResult({ data: null, error: s }) : this._returnResult({ data: a, error: null });
          });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
      async _deletePasskey(e) {
        Ye(this.experimental);
        try {
          return await this._useSession(async (n) => {
            let { data: { session: r }, error: i } = n;
            if (i) return this._returnResult({ data: null, error: i });
            if (!r) return this._returnResult({ data: null, error: new ye() });
            let { error: a } = await N(this.fetch, "DELETE", `${this.url}/passkeys/${e.passkeyId}`, { headers: this.headers, jwt: r.access_token, noResolveJson: true });
            return a ? this._returnResult({ data: null, error: a }) : this._returnResult({ data: null, error: null });
          });
        } catch (n) {
          if (O(n)) return this._returnResult({ data: null, error: n });
          throw n;
        }
      }
    };
    ni.nextInstanceID = {};
    var sa = ni;
    var ru = sa, oa = ru;
    var iu = "2.106.1", er = "";
    typeof Deno < "u" ? er = "deno" : typeof document < "u" ? er = "web" : typeof navigator < "u" && navigator.product === "ReactNative" ? er = "react-native" : er = "node";
    var au = { "X-Client-Info": `supabase-js-${er}/${iu}` }, su = { headers: au }, ou = { schema: "public" }, lu = { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: "implicit" }, cu = {}, uu = { enabled: false, respectSamplingDecision: true };
    function du(t, e, n, r) {
      function i(a) {
        return a instanceof n ? a : new n(function(s) {
          s(a);
        });
      }
      return new (n || (n = Promise))(function(a, s) {
        function l(d) {
          try {
            u(r.next(d));
          } catch (h) {
            s(h);
          }
        }
        function c(d) {
          try {
            u(r.throw(d));
          } catch (h) {
            s(h);
          }
        }
        function u(d) {
          d.done ? a(d.value) : i(d.value).then(l, c);
        }
        u((r = r.apply(t, e || [])).next());
      });
    }
    var la = null, hu = "@opentelemetry/api";
    function fu() {
      return la === null && (la = import(hu).catch(() => null)), la;
    }
    function gu() {
      return du(this, void 0, void 0, function* () {
        try {
          let t = yield fu();
          if (!t || !t.propagation || !t.context) return null;
          let e = {};
          t.propagation.inject(t.context.active(), e);
          let n = e.traceparent;
          return n ? { traceparent: n, tracestate: e.tracestate, baggage: e.baggage } : null;
        } catch {
          return null;
        }
      });
    }
    function pu(t) {
      if (!t || typeof t != "string") return null;
      let e = t.split("-");
      if (e.length !== 4) return null;
      let [n, r, i, a] = e;
      if (n.length !== 2 || r.length !== 32 || i.length !== 16 || a.length !== 2) return null;
      let s = /^[0-9a-f]+$/i;
      return !s.test(n) || !s.test(r) || !s.test(i) || !s.test(a) || r === "00000000000000000000000000000000" || i === "0000000000000000" ? null : { version: n, traceId: r, parentId: i, traceFlags: a, isSampled: (parseInt(a, 16) & 1) === 1 };
    }
    function mu(t, e) {
      if (!t || !e || e.length === 0) return false;
      let n;
      if (t instanceof URL) n = t;
      else try {
        n = new URL(t);
      } catch {
        return false;
      }
      for (let r of e) try {
        if (typeof r == "string") {
          if (bu(n.hostname, r)) return true;
        } else if (r instanceof RegExp) {
          if (r.test(n.hostname)) return true;
        } else if (typeof r == "function" && r(n)) return true;
      } catch {
        continue;
      }
      return false;
    }
    function bu(t, e) {
      if (e === t) return true;
      if (e.startsWith("*.")) {
        let n = e.slice(2);
        if (t.endsWith(n) && (t === n || t.endsWith("." + n))) return true;
      }
      return false;
    }
    function wu(t) {
      let e = [];
      try {
        let n = new URL(t);
        e.push(n.hostname);
      } catch {
      }
      return e.push("*.supabase.co", "*.supabase.in"), e.push("localhost", "127.0.0.1", "[::1]"), e;
    }
    function tr(t) {
      "@babel/helpers - typeof";
      return tr = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
        return typeof e;
      } : function(e) {
        return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
      }, tr(t);
    }
    function yu(t, e) {
      if (tr(t) != "object" || !t) return t;
      var n = t[Symbol.toPrimitive];
      if (n !== void 0) {
        var r = n.call(t, e || "default");
        if (tr(r) != "object") return r;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return (e === "string" ? String : Number)(t);
    }
    function vu(t) {
      var e = yu(t, "string");
      return tr(e) == "symbol" ? e : e + "";
    }
    function _u(t, e, n) {
      return (e = vu(e)) in t ? Object.defineProperty(t, e, { value: n, enumerable: true, configurable: true, writable: true }) : t[e] = n, t;
    }
    function no(t, e) {
      var n = Object.keys(t);
      if (Object.getOwnPropertySymbols) {
        var r = Object.getOwnPropertySymbols(t);
        e && (r = r.filter(function(i) {
          return Object.getOwnPropertyDescriptor(t, i).enumerable;
        })), n.push.apply(n, r);
      }
      return n;
    }
    function ve(t) {
      for (var e = 1; e < arguments.length; e++) {
        var n = arguments[e] != null ? arguments[e] : {};
        e % 2 ? no(Object(n), true).forEach(function(r) {
          _u(t, r, n[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(t, Object.getOwnPropertyDescriptors(n)) : no(Object(n)).forEach(function(r) {
          Object.defineProperty(t, r, Object.getOwnPropertyDescriptor(n, r));
        });
      }
      return t;
    }
    var ku = (t) => t ? (...e) => t(...e) : (...e) => fetch(...e), Su = () => Headers, Eu = (t, e, n, r, i) => {
      let a = ku(r), s = Su(), l = i?.enabled === true, c = i?.respectSamplingDecision !== false, u = l ? wu(e) : null;
      return async (d, h) => {
        var g;
        let f = (g = await n()) !== null && g !== void 0 ? g : t, m = new s(h?.headers);
        if (m.has("apikey") || m.set("apikey", t), m.has("Authorization") || m.set("Authorization", `Bearer ${f}`), u) {
          let b = await Au(d, u, c);
          b && (b.traceparent && !m.has("traceparent") && m.set("traceparent", b.traceparent), b.tracestate && !m.has("tracestate") && m.set("tracestate", b.tracestate), b.baggage && !m.has("baggage") && m.set("baggage", b.baggage));
        }
        return a(d, ve(ve({}, h), {}, { headers: m }));
      };
    };
    async function Au(t, e, n) {
      if (!mu(typeof t == "string" || t instanceof URL ? t : t.url, e)) return null;
      let r = await gu();
      if (!r || !r.traceparent) return null;
      if (n) {
        let i = pu(r.traceparent);
        if (i && !i.isSampled) return null;
      }
      return r;
    }
    function ro(t) {
      return typeof t == "boolean" ? { enabled: t } : t;
    }
    function Tu(t) {
      return t.endsWith("/") ? t : t + "/";
    }
    function Pu(t, e) {
      var n, r, i, a, s, l;
      let { db: c, auth: u, realtime: d, global: h } = t, { db: g, auth: f, realtime: m, global: b } = e, v = ro(t.tracePropagation), y = ro(e.tracePropagation), k = { db: ve(ve({}, g), c), auth: ve(ve({}, f), u), realtime: ve(ve({}, m), d), storage: {}, global: ve(ve(ve({}, b), h), {}, { headers: ve(ve({}, (n = b?.headers) !== null && n !== void 0 ? n : {}), (r = h?.headers) !== null && r !== void 0 ? r : {}) }), tracePropagation: { enabled: (i = (a = v?.enabled) !== null && a !== void 0 ? a : y?.enabled) !== null && i !== void 0 ? i : false, respectSamplingDecision: (s = (l = v?.respectSamplingDecision) !== null && l !== void 0 ? l : y?.respectSamplingDecision) !== null && s !== void 0 ? s : true }, accessToken: async () => "" };
      return t.accessToken ? k.accessToken = t.accessToken : delete k.accessToken, k;
    }
    function xu(t) {
      let e = t?.trim();
      if (!e) throw new Error("supabaseUrl is required.");
      if (!e.match(/^https?:\/\//i)) throw new Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
      try {
        return new URL(Tu(e));
      } catch {
        throw Error("Invalid supabaseUrl: Provided URL is malformed.");
      }
    }
    var Du = class extends oa {
      constructor(t) {
        super(t);
      }
    }, Ru = class {
      constructor(t, e, n) {
        var r, i;
        this.supabaseUrl = t, this.supabaseKey = e;
        let a = xu(t);
        if (!e) throw new Error("supabaseKey is required.");
        this.realtimeUrl = new URL("realtime/v1", a), this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws"), this.authUrl = new URL("auth/v1", a), this.storageUrl = new URL("storage/v1", a), this.functionsUrl = new URL("functions/v1", a);
        let s = `sb-${a.hostname.split(".")[0]}-auth-token`, l = { db: ou, realtime: cu, auth: ve(ve({}, lu), {}, { storageKey: s }), global: su, tracePropagation: uu }, c = Pu(n ?? {}, l);
        if (this.settings = c, this.storageKey = (r = c.auth.storageKey) !== null && r !== void 0 ? r : "", this.headers = (i = c.global.headers) !== null && i !== void 0 ? i : {}, c.accessToken) this.accessToken = c.accessToken, this.auth = new Proxy({}, { get: (d, h) => {
          throw new Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(h)} is not possible`);
        } });
        else {
          var u;
          this.auth = this._initSupabaseAuthClient((u = c.auth) !== null && u !== void 0 ? u : {}, this.headers, c.global.fetch);
        }
        this.fetch = Eu(e, t, this._getAccessToken.bind(this), c.global.fetch, c.tracePropagation), this.realtime = this._initRealtimeClient(ve({ headers: this.headers, accessToken: this._getAccessToken.bind(this), fetch: this.fetch }, c.realtime)), this.accessToken && Promise.resolve(this.accessToken()).then((d) => this.realtime.setAuth(d)).catch((d) => console.warn("Failed to set initial Realtime auth token:", d)), this.rest = new ts(new URL("rest/v1", a).href, { headers: this.headers, schema: c.db.schema, fetch: this.fetch, timeout: c.db.timeout, urlLengthLimit: c.db.urlLengthLimit }), this.storage = new Es(this.storageUrl.href, this.headers, this.fetch, n?.storage), c.accessToken || this._listenForAuthEvents();
      }
      get functions() {
        return new On(this.functionsUrl.href, { headers: this.headers, customFetch: this.fetch });
      }
      from(t) {
        return this.rest.from(t);
      }
      schema(t) {
        return this.rest.schema(t);
      }
      rpc(t, e = {}, n = { head: false, get: false, count: void 0 }) {
        return this.rest.rpc(t, e, n);
      }
      channel(t, e = { config: {} }) {
        return this.realtime.channel(t, e);
      }
      getChannels() {
        return this.realtime.getChannels();
      }
      removeChannel(t) {
        return this.realtime.removeChannel(t);
      }
      removeAllChannels() {
        return this.realtime.removeAllChannels();
      }
      async _getAccessToken() {
        var t = this, e, n;
        if (t.accessToken) return await t.accessToken();
        let { data: r } = await t.auth.getSession();
        return (e = (n = r.session) === null || n === void 0 ? void 0 : n.access_token) !== null && e !== void 0 ? e : t.supabaseKey;
      }
      _initSupabaseAuthClient({ autoRefreshToken: t, persistSession: e, detectSessionInUrl: n, storage: r, userStorage: i, storageKey: a, flowType: s, lock: l, debug: c, throwOnError: u, experimental: d, lockAcquireTimeout: h, skipAutoInitialize: g }, f, m) {
        let b = { Authorization: `Bearer ${this.supabaseKey}`, apikey: `${this.supabaseKey}` };
        return new Du({ url: this.authUrl.href, headers: ve(ve({}, b), f), storageKey: a, autoRefreshToken: t, persistSession: e, detectSessionInUrl: n, storage: r, userStorage: i, flowType: s, lock: l, debug: c, throwOnError: u, experimental: d, fetch: m, lockAcquireTimeout: h, skipAutoInitialize: g, hasCustomAuthorizationHeader: Object.keys(this.headers).some((v) => v.toLowerCase() === "authorization") });
      }
      _initRealtimeClient(t) {
        return new dn(this.realtimeUrl.href, ve(ve({}, t), {}, { params: ve(ve({}, { apikey: this.supabaseKey }), t?.params) }));
      }
      _listenForAuthEvents() {
        return this.auth.onAuthStateChange((t, e) => {
          this._handleTokenChanged(t, "CLIENT", e?.access_token);
        });
      }
      _handleTokenChanged(t, e, n) {
        (t === "TOKEN_REFRESHED" || t === "SIGNED_IN") && this.changedAccessToken !== n ? (this.changedAccessToken = n, this.realtime.setAuth(n)) : t === "SIGNED_OUT" && (this.realtime.setAuth(), e == "STORAGE" && this.auth.signOut(), this.changedAccessToken = void 0);
      }
    }, io = (t, e, n) => new Ru(t, e, n);
    function zu() {
      if (typeof window < "u") return false;
      let t = globalThis.process;
      if (!t) return false;
      let e = t.version;
      if (e == null) return false;
      let n = e.match(/^v(\d+)\./);
      return n ? parseInt(n[1], 10) <= 18 : false;
    }
    zu() && console.warn("\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217");
    var ca = (t) => String(t || "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/ß/g, "ss"), Ou = "Einj\xE4hrige Nutzung: nach der Ernte wird neu ges\xE4t oder gepflanzt.", Cu = "Botanisch zweij\xE4hrig, als Gem\xFCse meist einj\xE4hrig genutzt. Im zweiten Jahr folgen Bl\xFCte und Samen.", $u = "Kein regelm\xE4\xDFiger Formschnitt n\xF6tig. Kranke Pflanzenteile entfernen; gesunde Bl\xE4tter versorgen die Pflanze bis zur Ernte.", Iu = "F\xFCr die n\xE4chste Kultur ein anderes Beet einplanen. Wurzelgem\xFCse m\xF6glichst direkt am endg\xFCltigen Platz s\xE4en. Jungpflanzen mit feuchtem Ballen bei mildem Wetter setzen, anschlie\xDFend angie\xDFen.", Bu = "Unter einer lichten Baumkrone nur mit gen\xFCgend Licht und eigener Wasserversorgung. Abstand zum Stamm halten, starke Baumwurzeln nicht verletzen und keine Erde am Stamm anh\xE4ufen. Trockener, dichter Vollschatten ist kein geeigneter Ertragsstandort.", xt = { shade: "https://www.landwirtschaft.de/garten/selbst-anbauen/obst-und-gemuese/obst-gemuese-und-kraeuter-fuer-schattige-gaerten-was-waechst-gut", rotation: "https://www.rhs.org.uk/vegetables/crop-rotation", raspberries: "https://www.rhs.org.uk/fruit/raspberries/grow-your-own", currants: "https://www.rhs.org.uk/fruit/redcurrants/redcurrant-pruning-and-training", blackcurrants: "https://www.rhs.org.uk/fruit/blackcurrants/grow-your-own", gooseberries: "https://www.rhs.org.uk/fruit/gooseberries/grow-your-own", strawberries: "https://www.rhs.org.uk/fruit/strawberries/grow-your-own", blueberries: "https://www.rhs.org.uk/fruit/blueberries/grow-your-own" }, Lu = { nachtschatten: ["Nachtschattengew\xE4chse", 4, "Zum Beispiel Salat oder Spinat als Folgekultur, wenn Saison, N\xE4hrstoff- und Lichtbedarf passen. Tomate, Kartoffel, Paprika, Aubergine und Physalis geh\xF6ren zur selben Familie und z\xE4hlen nicht als Wechsel."], kreuz: ["Kreuzbl\xFCtler", 4, "Zum Beispiel Salat, Spinat oder Mangold aus einer anderen Familie. Kohl, Radieschen, Rettich, Rucola sowie Senf und \xD6lrettich als Gr\xFCnd\xFCngung verl\xE4ngern die Kohlfolge. Bei Kohlhernie sind l\xE4ngere Pausen und Beratung n\xF6tig."], dolde: ["Doldenbl\xFCtler", 4, "Zum Beispiel Salat oder Spinat. M\xF6hren, Sellerie, Pastinaken, Fenchel, Petersilie und Dill z\xE4hlen zur selben Pflanzenfamilie."], lauch: ["Amaryllisgew\xE4chse", 4, "Zum Beispiel Salat oder M\xF6hren, wenn deren eigene Anbaupause eingehalten ist. Zwiebeln, Porree, Knoblauch und Schnittlauch z\xE4hlen nicht als Familienwechsel."], fuchs: ["Fuchsschwanzgew\xE4chse", 4, "Zum Beispiel Salat oder Bohnen in passender Jahreszeit. Spinat, Mangold und Rote Bete sind miteinander verwandt."], korb: ["Korbbl\xFCtler", 4, "Zum Beispiel Spinat, Radieschen oder Bohnen; deren eigene Fruchtfolge mitpr\xFCfen. Salat, Endivie, Radicchio und Schwarzwurzel sind kein Familienwechsel untereinander."], huelse: ["H\xFClsenfr\xFCchtler", 6, "Zum Beispiel Kohl oder Salat, sofern deren eigene Anbaupause passt. Erbsen und Bohnen nicht direkt aufeinander folgen lassen. Gesunde Feinwurzeln k\xF6nnen im Boden bleiben; das ersetzt keine bedarfsgerechte D\xFCngung."], kuerbis: ["K\xFCrbisgew\xE4chse", 4, "Zum Beispiel Salat, Spinat oder Radieschen bei passender Saison. Gurke, K\xFCrbis, Zucchini und Melone geh\xF6ren zur selben Familie."] };
    function Nu(t) {
      let e = ca(t.name), n = ca(t.variety), r = ca(t.care?.match(/^Typ:\s*(.*)$/m)?.[1]), i = `${e} ${n} ${r}`;
      return /garten-praxis/i.test(t.category || "") ? "practice" : /johannis|him-.*brom/.test(e) ? /himbeer|autumn bliss|tulameen|polka|polana|himbo|sugana|glen ample/.test(`${n} ${r}`) ? /herbst|autumn bliss|polka|polana|himbo|sugana/.test(`${n} ${r}`) ? "raspberry-autumn" : "raspberry-summer" : /brombeer|loch ness|loch tay|navaho|black satin|chester|triple crown/.test(`${n} ${r}`) ? "blackberry" : /schwarz|titania|ben sarek|ben hope|ometa|tsema/.test(`${n} ${r}`) ? "blackcurrant" : /johannis|jonkheer|rovada|rolan|rondom|werdavia|versailler|gloire/.test(`${n} ${r}`) ? "currant" : "unknown-berry" : /aronia|cranberry/.test(e) ? /cranberry|early black|pilgrim|stevens|ben lear|howes/.test(`${n} ${r}`) ? "cranberry" : "aronia" : /erdbeer/.test(e) ? /rugen|alexandria|walderdbeer|fragaria vesca/.test(`${n} ${r}`) ? "woodland-strawberry" : "strawberry" : /spargel.*rhabarber/.test(e) ? /rhabarber|holsteiner|sutton|livingstone|timperley|victoria/.test(`${n} ${r}`) ? "rhubarb" : "asparagus" : /krauter|liebstockel/.test(e) || t.category === "Kr\xE4uter" ? /waldmeister/.test(i) ? "woodruff" : /schnittlauch|stangellauch|polyvert/.test(i) ? "chives" : /schnittknoblauch|neko/.test(i) ? "garlic-chives" : /minze|multimentha/.test(i) ? "mint" : /melisse|binsuga/.test(i) ? "balm" : /liebstockel|verino/.test(`${n} ${r}`) ? "lovage" : /estragon/.test(i) ? "tarragon" : /rosmarin|\barp\b|blue winter/.test(i) ? "rosemary" : /salbei|berggarten|salvador/.test(i) ? "sage" : /thymian|deutscher winter|faustini/.test(i) ? "thyme" : /oregano|dost|hot and spicy/.test(i) ? "oregano" : /bergbohnenkraut|aromakugel/.test(i) ? "savory-perennial" : /lavendel|hidcote/.test(i) ? "lavender" : /petersil|gigante|mooskrause|annettes|einfache schnitt/.test(i) ? "parsley" : /dill|tetra|vierling|mammut/.test(i) && !/basilikum/.test(i) ? "dill" : /koriander|santo|konrad/.test(i) ? "coriander" : /kerbel|massa|commun/.test(i) ? "chervil" : /basilikum|dark opal/.test(i) ? "basil" : /schnittsellerie|gewone snij/.test(i) ? "cutting-celery" : /winterhecken|freddy/.test(i) ? "welsh-onion" : "unknown-herb" : /pastinak.*schwarzwurzel/.test(e) ? /schwarz|hoffmann|russische riesen|einjaehrige|einjahrige/.test(`${n} ${r}`) ? "salsify" : "parsnip" : /salat|ruck?ola/.test(e) ? /sylvetta|rucola|wasabino/.test(`${n} ${r}`) ? "rocket" : /\bvit\b|feldsalat/.test(`${n} ${r}`) ? "lambs-lettuce" : "lettuce" : /spinat/.test(e) && /neuseel/.test(n) ? "new-zealand-spinach" : /zucchini/.test(e) ? "zucchini" : /bohnen/.test(e) ? /aquadulce|hangdown|witkiem|dicke bohne|puffbohne/.test(`${n} ${r}`) ? "broad-bean" : "bean" : [[/artischock/, "artichoke"], [/aubergine/, "aubergine"], [/blumenkohl/, "cauliflower"], [/brokkoli/, "broccoli"], [/chili|paprika|peperoni/, "pepper"], [/erbsen/, "pea"], [/fenchel/, "fennel"], [/grunkohl|chinakohl|weisskohl/, "cabbage"], [/gurke/, "cucumber"], [/heidelbeere/, "blueberry"], [/stachelbeere/, "gooseberry"], [/kartoffel/, "potato"], [/knoblauch/, "garlic"], [/kohlrabi/, "kohlrabi"], [/kurbis/, "pumpkin"], [/lauch|poree/, "leek"], [/herbstruben|mairube|mai-.*ruben/, "turnip"], [/mangold/, "chard"], [/mohre|karotte/, "carrot"], [/pak choi/, "pakchoi"], [/palmkohl|spitzkohl/, "cabbage"], [/physalis/, "physalis"], [/radicchio|endivie/, "chicory"], [/radieschen|rettich/, "radish"], [/rosenkohl/, "brussels"], [/rote bete/, "beet"], [/sellerie/, "celery"], [/spinat/, "spinach"], [/susskartoffel/, "sweet-potato"], [/tomate/, "tomato"], [/topinambur/, "jerusalem-artichoke"], [/melone/, "melon"], [/wirsing/, "cabbage"], [/mais/, "corn"], [/zwiebel|schalotten/, "onion"]].find(([s]) => s.test(e))?.[1] || "unknown";
    }
    var ju = { aubergine: "nachtschatten", pepper: "nachtschatten", potato: "nachtschatten", tomato: "nachtschatten", physalis: "nachtschatten", cauliflower: "kreuz", broccoli: "kreuz", cabbage: "kreuz", kohlrabi: "kreuz", turnip: "kreuz", pakchoi: "kreuz", radish: "kreuz", brussels: "kreuz", rocket: "kreuz", carrot: "dolde", parsnip: "dolde", fennel: "dolde", celery: "dolde", parsley: "dolde", dill: "dolde", coriander: "dolde", chervil: "dolde", "cutting-celery": "dolde", onion: "lauch", leek: "lauch", garlic: "lauch", chives: "lauch", "garlic-chives": "lauch", "welsh-onion": "lauch", spinach: "fuchs", beet: "fuchs", chard: "fuchs", lettuce: "korb", chicory: "korb", salsify: "korb", artichoke: "korb", bean: "huelse", "broad-bean": "huelse", pea: "huelse", cucumber: "kuerbis", zucchini: "kuerbis", pumpkin: "kuerbis", melon: "kuerbis" }, Gu = /* @__PURE__ */ new Set(["lettuce", "lambs-lettuce", "rocket", "spinach", "chard", "beet", "radish", "kohlrabi", "broccoli", "cauliflower", "cabbage", "brussels", "turnip", "pakchoi", "pea", "parsley", "dill", "chervil", "chives", "garlic-chives", "mint", "balm", "lovage", "woodruff", "currant", "blackcurrant", "gooseberry", "raspberry-autumn", "raspberry-summer", "blackberry", "rhubarb", "blueberry", "woodland-strawberry"]), Fu = /* @__PURE__ */ new Set(["woodruff", "mint", "balm", "chives", "garlic-chives", "currant", "blackcurrant", "gooseberry", "woodland-strawberry"]), Uu = /* @__PURE__ */ new Set(["artichoke", "strawberry", "woodland-strawberry", "rhubarb", "asparagus", "jerusalem-artichoke", "blueberry", "gooseberry", "currant", "blackcurrant", "raspberry-autumn", "raspberry-summer", "blackberry", "aronia", "cranberry", "chives", "garlic-chives", "welsh-onion", "mint", "balm", "lovage", "woodruff", "tarragon", "rosemary", "sage", "thyme", "oregano", "savory-perennial", "lavender"]), Mu = /* @__PURE__ */ new Set(["carrot", "parsnip", "salsify", "beet", "chard", "fennel", "celery", "leek", "onion", "garlic", "cabbage", "brussels", "kohlrabi", "turnip", "parsley", "cutting-celery"]);
    function Ku(t = {}) {
      let e = Nu(t);
      if (e === "practice") return { kind: e, practice: true, shade: false, sources: [] };
      let n = !e.startsWith("unknown"), r = Uu.has(e), i = Lu[ju[e]], a = { kind: e, shade: Gu.has(e), underTrees: Fu.has(e), family: i?.[0], rotationYears: i?.[1], life: n ? r ? "Mehrj\xE4hrig: bleibt normalerweise mehrere Jahre am Standort." : Mu.has(e) ? Cu : Ou : "Die Lebensdauer dieser Pflanzenart ist noch nicht sicher zugeordnet. Bitte die Sortenangabe beim Anbieter pr\xFCfen.", cutWhen: "W\xE4hrend der Kultur nach Bedarf", cutHow: n ? $u : "Schnittzeit und Vorgehen erst nach sicherer Bestimmung der Pflanzenart festlegen.", move: r ? "Nur bei Bedarf umsetzen, bevorzugt w\xE4hrend der Vegetationsruhe an einem frostfreien Tag. Einen gro\xDFen feuchten Wurzelballen erhalten, Standort vorbereiten und danach gut angie\xDFen. Alte oder kranke Best\xE4nde eher durch gesundes Pflanzgut erneuern." : Iu, after: i?.[2] || "Folgekultur aus einer anderen Pflanzenfamilie w\xE4hlen. Bodenzustand, Krankheiten, N\xE4hrstoffbedarf, Jahreszeit und die Belegung der letzten Jahre pr\xFCfen.", sources: [xt.rotation] };
      a.shade ? (a.light = "Halbschatten / lichter Schatten m\xF6glich. Mit weniger Sonne k\xF6nnen Wachstum, Reife und Ertrag nachlassen.", a.siteNote = a.underTrees ? Bu : "Geeignet f\xFCr einen hellen halbschattigen Platz; kein Versprechen f\xFCr trockenen Vollschatten unter dicht bewurzelten B\xE4umen.", a.sources.push(xt.shade)) : (a.light = n ? "Sonnigen bzw. zur Kultur passenden Standort w\xE4hlen; nicht f\xFCr die Schattenauswahl eingeordnet." : "Lichtbedarf noch nicht sicher eingeordnet.", a.siteNote = "Die konkrete Standortangabe dieser Sorte und die \xF6rtlichen Verh\xE4ltnisse haben Vorrang.");
      let s = (l) => Object.assign(a, l);
      return (e === "strawberry" || e === "woodland-strawberry") && (s({ life: "Mehrj\xE4hrig. Gartenerdbeeren meist nach 2\u20133 Ertragsjahren auf einem anderen Beet erneuern; Monats- und Walderdbeeren nach Vitalit\xE4t beurteilen.", cutWhen: "Einmaltragende Sorten nach der letzten Ernte; \xF6ftertragende nur vorsichtig ausputzen", cutHow: "Altes oder krankes Laub und unerw\xFCnschte Ausl\xE4ufer entfernen. Herz und junge Herzbl\xE4tter erhalten. \xD6ftertragende Sorten nicht pauschal im Sommer vollst\xE4ndig zur\xFCckschneiden.", move: "Gesunde junge Pflanzen auf ein vorbereitetes neues Beet setzen, Gartenerdbeeren meist im Juli/August oder Fr\xFChjahr. Das Herz bleibt \xFCber dem Boden; danach gut w\xE4ssern.", after: "Zum Beispiel Salat oder Spinat. Erdbeeren m\xF6glichst mindestens 4 Jahre nicht auf dieselbe Fl\xE4che setzen. Bei Wurzelkrankheiten gesundes Pflanzgut und Beratung einplanen." }), a.sources.push(xt.strawberries)), (e === "raspberry-autumn" || e === "raspberry-summer") && (s({ cutWhen: e === "raspberry-autumn" ? "Februar\u2013M\xE4rz, frostfrei, vor dem Austrieb" : "Nach der Sommerernte", cutHow: e === "raspberry-autumn" ? "F\xFCr eine einfache Herbsternte alle Ruten bodennah abschneiden. Eine gezielte Doppelernte braucht eine andere Schnittf\xFChrung; nicht mit der Sommerhimbeerpflege verwechseln." : "Nur die abgeernteten zweij\xE4hrigen Ruten bodennah entfernen. Gesunde diesj\xE4hrige Ruten f\xFCr die Ernte im n\xE4chsten Jahr erhalten und am Ger\xFCst anbinden.", after: "Himbeerreihen sind Dauerkulturen. Bei Aufgabe des Bestands zun\xE4chst andere Pflanzenfamilien anbauen; vor erneuten Himbeeren mehrj\xE4hrige Pause, Wurzelreste und m\xF6glichen Krankheitsdruck pr\xFCfen." }), a.sources.push(xt.raspberries)), e === "blackberry" && s({ cutWhen: "Nach der Ernte oder im Februar\u2013M\xE4rz vor dem Austrieb", cutHow: "Abgeerntete zweij\xE4hrige Ruten bodennah entfernen. Junge Ruten f\xFCr das n\xE4chste Jahr stehen lassen und getrennt anbinden; deren Seitentriebe im Sp\xE4twinter auf wenige Knospen k\xFCrzen." }), (e === "currant" || e === "gooseberry" || e === "blackcurrant") && (s({ cutWhen: "Nach der Ernte oder im Sp\xE4twinter, frostfrei vor dem Austrieb", cutHow: e === "blackcurrant" ? "Nach dem Anwachsen j\xE4hrlich einen Teil der \xE4ltesten dunklen Triebe bodennah entfernen und kr\xE4ftige junge Triebe erhalten. Schwarze Johannisbeeren fruchten vor allem an jungem Holz." : "Kranke, sich kreuzende und bodennahe Triebe entfernen. Alte Ger\xFCst\xE4ste schrittweise durch junge Bodentriebe ersetzen; fruchtendes junges Seitenholz erhalten. Nicht den ganzen Strauch j\xE4hrlich bodennah abschneiden.", after: "Ein Beerenstrauch bleibt \xFCber Jahre am Platz. Nach dem Roden Wurzeln und Krankheitszeichen pr\xFCfen; zun\xE4chst Gem\xFCse aus anderer Pflanzenfamilie anbauen und keinen gleichartigen Strauch direkt in denselben Wurzelraum setzen." }), a.sources.push(e === "gooseberry" ? xt.gooseberries : e === "blackcurrant" ? xt.blackcurrants : xt.currants)), e === "blueberry" && (s({ cutWhen: "Sp\xE4twinter bis Fr\xFChjahr, frostfrei vor dem Austrieb", cutHow: "In den ersten Jahren nur krankes oder besch\xE4digtes Holz entfernen. Sp\xE4ter einzelne alte, schwach tragende Triebe bodennah auslichten und kr\xE4ftige junge Triebe erhalten.", move: "Mit gro\xDFem flachem Wurzelballen im Herbst oder zeitigen Fr\xFChjahr umsetzen. Heidelbeeren ben\xF6tigen sauren Boden (etwa pH 4\u20135,5), keine Kalkgabe und m\xF6glichst kalkarmes Gie\xDFwasser.", after: "Vor Gem\xFCseanbau den pH-Wert messen: Ein saures Heidelbeerbeet passt nicht automatisch zu den meisten Gem\xFCsearten. Bodenverbesserung gezielt planen, nicht pauschal stark kalken." }), a.sources.push(xt.blueberries)), e === "cranberry" && s({ cutWhen: "Fr\xFChjahr vor dem Austrieb, nur bei Bedarf", cutHow: "Tote und sehr lange kriechende Triebe sparsam auslichten; kurze fruchttragende aufrechte Triebe erhalten.", move: "Flachen Wurzelballen erhalten und wieder in einen sauren, gleichm\xE4\xDFig feuchten Standort setzen. Kein kalkhaltiges Substrat verwenden.", after: "Zuerst den pH-Wert pr\xFCfen. Das saure Moorbeet eignet sich ohne gezielte Vorbereitung nicht direkt als normales Gem\xFCsebeet." }), e === "aronia" && s({ cutWhen: "Sp\xE4twinter, frostfrei", cutHow: "Nur bei Bedarf auslichten. Einzelne alte, schwache oder kranke Triebe bodennah entfernen; junge Triebe als Ersatz erhalten." }), e === "rhubarb" && s({ cutWhen: "Ab Fr\xFChsommer Bl\xFCtenstiele bei Bedarf; abgestorbenes Laub im Herbst", cutHow: "Bl\xFCtenstiele am Ansatz entfernen, wenn St\xE4ngelertrag im Vordergrund steht. Gr\xFCne Bl\xE4tter nach Ende der Ernte stehen lassen; erst eingezogenes Laub abr\xE4umen.", move: "Kr\xE4ftige \xE4ltere Stauden im Herbst oder zeitigen Fr\xFChjahr teilen. Jedes Teilst\xFCck braucht gesunde Knospen und Wurzeln. Gut angie\xDFen und im ersten Standjahr nicht oder nur sehr zur\xFCckhaltend ernten.", after: "Nach der Dauerkultur Bodenstruktur und N\xE4hrstoffversorgung pr\xFCfen. Zum Beispiel Bohnen oder Salat anbauen; einen neuen Rhabarber m\xF6glichst auf einen anderen Platz setzen." }), e === "asparagus" && s({ life: "Mehrj\xE4hrige Dauerkultur, oft 8\u201312 Ertragsjahre. Neue Anlagen zun\xE4chst aufbauen lassen.", cutWhen: "Sp\xE4therbst, wenn das Kraut vollst\xE4ndig gelb/braun ist", cutHow: "Abgestorbenes Kraut knapp \xFCber dem Boden entfernen. Gr\xFCnes Kraut w\xE4hrend des Sommers erhalten; es f\xFCllt die Reserven f\xFCr die n\xE4chste Ernte.", move: "Alte Anlagen m\xF6glichst nicht verpflanzen. Eine neue Anlage mit gesundem Pflanzgut auf einer anderen Fl\xE4che anlegen.", after: "Nach einer gerodeten Spargelanlage mehrere Jahre andere Kulturen nutzen. Spargel nicht direkt erneut am selben Standort anbauen; Nachbauprobleme vor einer Neuanlage fachlich pr\xFCfen." }), e === "jerusalem-artichoke" && s({ cutWhen: "Nach dem Absterben im Herbst/Winter", cutHow: "Trockene St\xE4ngel bodennah entfernen. W\xE4hrend der Vegetation Bl\xE4tter f\xFCr den Knollenaufbau erhalten.", move: "Knollen im Fr\xFChjahr oder Herbst setzen. Standort begrenzen: verbliebene Knollen treiben wieder aus; au\xDFerhalb des Beets konsequent entfernen.", after: "F\xFCr ein Gem\xFCsebeet alle Knollen sorgf\xE4ltig entfernen und Austriebe nachkontrollieren. Danach beispielsweise Bohnen oder Kohl passend zur eigenen Fruchtfolge anbauen." }), e === "artichoke" && s({ life: "Mehrj\xE4hrige Staude, in Deutschland frostgef\xE4hrdet; je nach Sorte auch einj\xE4hrig angebaut.", cutWhen: "Nach der Ernte Bl\xFCtenst\xE4ngel; im Fr\xFChjahr Frostsch\xE4den", cutHow: "Abgeerntete Bl\xFCtenst\xE4ngel tief abschneiden. Gr\xFCne Rosettenbl\xE4tter erhalten; im Winter vor N\xE4sse und starken Fr\xF6sten sch\xFCtzen." }), ["aubergine", "pepper", "physalis", "sweet-potato"].includes(e) && (a.life = "Botanisch mehrj\xE4hrig, in Deutschland frostempfindlich und meist einj\xE4hrig angebaut. \xDCberwinterung nur hell, passend temperiert und gesund versuchen."), e === "garlic" && (a.life = "Mehrj\xE4hrige Zwiebelpflanze, im Garten zur Knollenernte meist in einer Saison vom Herbst oder Fr\xFChjahr bis Sommer angebaut; danach neue gesunde Zehen stecken."), e === "salsify" && (a.life = "Botanisch mehrj\xE4hrig, zur Wurzelernte meist einj\xE4hrig angebaut. Tiefe Wurzeln m\xF6glichst direkt am endg\xFCltigen Platz s\xE4en."), e === "fennel" && (a.life = "Knollenfenchel wird meist einj\xE4hrig zur Knollenernte angebaut. Saatgutvermehrung und Gew\xFCrzfenchel sind gesonderte Kulturen."), e === "broccoli" && (a.life = "Meist einj\xE4hrige Gem\xFCsekultur; Winter- und Sproutingtypen k\xF6nnen bis zur Ernte im n\xE4chsten Fr\xFChjahr stehen bleiben."), e === "new-zealand-spinach" && (a.family = "Mittagsblumengew\xE4chse", a.rotationYears = 4, a.life = "Botanisch mehrj\xE4hrig, in Deutschland frostempfindlich und meist einj\xE4hrig angebaut."), ["rosemary", "sage", "thyme", "savory-perennial", "lavender"].includes(e) && s({ cutWhen: "Fr\xFChjahr nach starken Fr\xF6sten; Ernteschnitt w\xE4hrend des Wachstums", cutHow: "Gr\xFCne Triebspitzen mit sauberer Schere zur\xFCcknehmen. Nicht tief in unbelaubtes altes Holz schneiden. Im Herbst keinen starken R\xFCckschnitt vor Frost vornehmen." }), ["mint", "balm", "lovage", "oregano", "tarragon", "woodruff"].includes(e) && s({ cutWhen: "W\xE4hrend der Saison zur Ernte; abgestorbene Triebe im zeitigen Fr\xFChjahr", cutHow: "Gesunde junge Triebe ernten, gen\xFCgend Blattmasse belassen. Abgestorbene St\xE4ngel vor dem neuen Austrieb bodennah entfernen.", move: "Im Fr\xFChjahr oder Fr\xFChherbst gesunde Teilst\xFCcke mit Wurzeln versetzen und angie\xDFen. Minze mit Wurzelsperre oder im Topf begrenzen." }), ["chives", "garlic-chives", "welsh-onion"].includes(e) && s({ cutWhen: "W\xE4hrend der Wachstumszeit, portionsweise", cutHow: "Bl\xE4tter einige Zentimeter \xFCber dem Boden schneiden, das Herz erhalten. Alte Horste im Fr\xFChjahr teilen. Nicht vollst\xE4ndig kahl in den Winter schicken." }), e === "basil" && s({ cutWhen: "Ab kr\xE4ftigem Jugendwachstum, regelm\xE4\xDFig im Sommer", cutHow: "Triebspitzen knapp oberhalb eines Blattpaars schneiden; gen\xFCgend Bl\xE4tter stehen lassen. Bl\xFCtenans\xE4tze entfernen, wenn Blatt-Ernte im Vordergrund steht." }), e === "tomato" && s({ cutWhen: "W\xE4hrend des Wachstums, abh\xE4ngig vom Wuchstyp", cutHow: "Bei Stabtomaten kleine Geiztriebe regelm\xE4\xDFig ausbrechen und am Stab f\xFChren. Busch- und Wildtomaten nicht pauschal ausgeizen. Kranke bodennahe Bl\xE4tter gezielt entfernen." }), e === "unknown-berry" && s({ cutWhen: "Erst Beerenart und Tragtyp kl\xE4ren", cutHow: "Sommerhimbeeren, Herbsthimbeeren, Johannisbeeren und Brombeeren ben\xF6tigen unterschiedliche Schnitte. Ohne sichere Zuordnung nur krankes und totes Holz entfernen." }), a.rotationNote = i ? `Mindestens ${i[1]} Jahre Abstand zwischen Kulturen derselben Familie als allgemeiner Planungswert. Keine Garantie gegen Krankheiten; bei Befall l\xE4nger pausieren. Nachbarpflanzung ersetzt keine Fruchtfolge.` : "F\xFCr Dauerkulturen und gemischte Gruppen ist eine pauschale j\xE4hrliche Rotation nicht sinnvoll. Vor dem Wechsel die genaue Pflanzenart und Beetgeschichte pr\xFCfen.", a.sources = [...new Set(a.sources)], a;
    }
    var ua = /* @__PURE__ */ new WeakMap();
    function mn(t = {}) {
      return ua.has(t) || ua.set(t, Ku(t)), ua.get(t);
    }
    var Z = (t, e, n, r, i, a = false, s = 4) => ({ icon: t, family: e, indoor: n, direct: r, planting: i, frostSensitive: a, rotation: s }), qu = { artischocke: Z("\u{1F33A}", "Korbbl\xFCtler", [1, 2, 3], [], [5], true), aubergine: Z("\u{1F346}", "Nachtschattengew\xE4chse", [2, 3], [], [5, 6], true), blumenkohl: Z("\u{1F966}", "Kreuzbl\xFCtler", [2, 3, 4, 5, 6], [], [4, 5, 6, 7]), bohnen: Z("\u{1FAD8}", "H\xFClsenfr\xFCchtler", [], [5, 6, 7], [], true), brokkoli: Z("\u{1F966}", "Kreuzbl\xFCtler", [3, 4, 5, 6], [], [4, 5, 6, 7]), chili: Z("\u{1F336}\uFE0F", "Nachtschattengew\xE4chse", [1, 2, 3], [], [5, 6], true), kraeuter_einj: Z("\u{1F33F}", "", [3, 4], [4, 5, 6], []), erbsen: Z("\u{1FADB}", "H\xFClsenfr\xFCchtler", [], [3, 4, 5, 6], [], false, 6), obst_beeren: Z("\u{1F353}", "Rosengew\xE4chse", [], [], [3, 4, 7, 8, 9], false, 0), fenchel: Z("\u{1F331}", "Doldenbl\xFCtler", [4, 5, 6], [6, 7], [5, 6, 7]), gruenkohl: Z("\u{1F96C}", "Kreuzbl\xFCtler", [3, 4, 5, 6], [], [4, 5, 6, 7]), gurke: Z("\u{1F952}", "K\xFCrbisgew\xE4chse", [4], [5, 6], [5, 6], true), heidelbeere: Z("\u{1FAD0}", "Heidekrautgew\xE4chse", [], [], [3, 4, 10, 11], false, 0), strauchbeeren: Z("\u{1FAD0}", "", [], [], [3, 4, 10, 11], false, 0), stachelbeere: Z("\u{1FAD0}", "Stachelbeergew\xE4chse", [], [], [3, 4, 10, 11], false, 0), aronia: Z("\u{1FAD0}", "", [], [], [3, 4, 10, 11], false, 0), kartoffel: Z("\u{1F954}", "Nachtschattengew\xE4chse", [], [], [4, 5], true), knoblauch: Z("\u{1F9C4}", "Amaryllisgew\xE4chse", [], [], [2, 3, 10, 11]), kohlrabi: Z("\u{1F96C}", "Kreuzbl\xFCtler", [2, 3, 4, 5, 6, 7], [4, 5, 6], [4, 5, 6, 7, 8]), kuerbis: Z("\u{1F383}", "K\xFCrbisgew\xE4chse", [4], [5, 6], [5, 6], true), lauch: Z("\u{1F331}", "Amaryllisgew\xE4chse", [2, 3, 4], [], [4, 5, 6, 7]), liebstoeckel: Z("\u{1F33F}", "", [], [], [3, 4, 5, 9], false, 0), mairuebe: Z("\u{1F331}", "Kreuzbl\xFCtler", [], [3, 4, 7, 8], []), mangold: Z("\u{1F96C}", "Fuchsschwanzgew\xE4chse", [3, 4], [4, 5, 6, 7], [4, 5, 6]), kraeuter_mehrj: Z("\u{1F33F}", "", [], [], [4, 5, 9], false, 0), moehre: Z("\u{1F955}", "Doldenbl\xFCtler", [], [3, 4, 5, 6, 7], []), pakchoi: Z("\u{1F96C}", "Kreuzbl\xFCtler", [7], [7, 8], [8, 9]), palmkohl: Z("\u{1F96C}", "Kreuzbl\xFCtler", [3, 4, 5, 6], [], [4, 5, 6, 7]), pastinake: Z("\u{1F955}", "Doldenbl\xFCtler", [], [3, 4, 5], []), physalis: Z("\u{1F3EE}", "Nachtschattengew\xE4chse", [2, 3], [], [5, 6], true), radicchio: Z("\u{1F96C}", "Korbbl\xFCtler", [5, 6], [6, 7], [6, 7, 8]), radieschen: Z("\u{1F331}", "Kreuzbl\xFCtler", [], [3, 4, 5, 6, 7, 8, 9], []), rosenkohl: Z("\u{1F96C}", "Kreuzbl\xFCtler", [3, 4], [], [5, 6]), rotebete: Z("\u{1F7E3}", "Fuchsschwanzgew\xE4chse", [3, 4], [4, 5, 6, 7], [4, 5, 6]), salate: Z("\u{1F957}", "Korbbl\xFCtler", [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 8], [3, 4, 5, 6, 7, 8]), sellerie: Z("\u{1F331}", "Doldenbl\xFCtler", [2, 3], [], [5, 6]), spargel: Z("\u{1F33F}", "", [], [], [3, 4], false, 0), spinat: Z("\u{1F96C}", "Fuchsschwanzgew\xE4chse", [], [3, 4, 8, 9], []), suesskartoffel: Z("\u{1F360}", "Windengew\xE4chse", [], [], [5, 6], true), tomate: Z("\u{1F345}", "Nachtschattengew\xE4chse", [3, 4], [], [5, 6], true), topinambur: Z("\u{1F33B}", "Korbbl\xFCtler", [], [], [3, 4, 10, 11], false, 0), melone: Z("\u{1F349}", "K\xFCrbisgew\xE4chse", [4], [], [5, 6], true), wirsing: Z("\u{1F96C}", "Kreuzbl\xFCtler", [2, 3, 4, 5, 6], [], [4, 5, 6, 7]), zucchini: Z("\u{1F952}", "K\xFCrbisgew\xE4chse", [4], [5, 6], [5, 6], true), mais: Z("\u{1F33D}", "S\xFC\xDFgr\xE4ser", [4], [5], [5], true, 3), zwiebel: Z("\u{1F9C5}", "Amaryllisgew\xE4chse", [2, 3], [3, 4], [3, 4, 9, 10]), sonnenblume: Z("\u{1F33B}", "Korbbl\xFCtler", [3, 4], [4, 5, 6], [5], true, 0), ringelblume: Z("\u{1F33C}", "Korbbl\xFCtler", [], [4, 5, 6], [], false, 0) }, Wu = { M\u00F6hren: "moehre", Karotte: "moehre", "Rote Bete": "rotebete", K\u00FCrbis: "kuerbis", "Zwiebeln & Schalotten": "zwiebel", "Lauch & Poree": "lauch", "Mai- & Herbstr\xFCben": "mairuebe", Erdbeere: "obst_beeren", Erdbeeren: "obst_beeren", "Salate & Rucola": "salate", Pfl\u00FCcksalat: "salate", "Radieschen & Rettich": "radieschen", Radieschen: "radieschen", "Chili, Paprika & Peperoni": "chili", "Gr\xFCnkohl, Chinakohl & Wei\xDFkohl": "gruenkohl", "Palmkohl & Spitzkohl": "palmkohl", "Pastinake & Schwarzwurzel": "pastinake", "Physalis (Andenbeere)": "physalis", "Radicchio & Endivie": "radicchio", "Spargel & Rhabarber": "spargel", S\u00FC\u00DFkartoffel: "suesskartoffel", "Wasser- & Zuckermelone": "melone", "Wirsing (Wirz)": "wirsing", Zuckermais: "mais", "Einj\xE4hrige Kr\xE4uter": "kraeuter_einj", "Mehrj\xE4hrige & Mediterrane Kr\xE4uter": "kraeuter_mehrj", "Liebst\xF6ckel & W\xFCrzkr\xE4uter": "liebstoeckel", "Johannis-, Him- & Brombeeren": "strauchbeeren", "Aronia & Cranberry": "aronia" }, Ie = { indoor: "Vorziehen", direct: "Direktsaat", planting: "Pflanzen / Stecken" };
    function St(t) {
      let e = t.legacy_data?.culture?.id || Wu[t.name] || t.name?.toLocaleLowerCase("de"), n = qu[e];
      if (!n) return null;
      n = { ...n };
      let r = t.variety || "";
      e === "knoblauch" && /printanor|messidrome/i.test(r) && (n.planting = [2, 3]), e === "knoblauch" && /chesnok|music|germidour|thermidrome|red duke|purple glazer|german extra/i.test(r) && (n.planting = [10, 11]), e === "bohnen" && /hangdown|dicke bohne|aquadulce|witkiem/i.test(r) && (n.direct = [2, 3, 4], n.frostSensitive = false), e === "salate" && /rucola|sylvetta|wasabino/i.test(r) && (n.family = "Kreuzbl\xFCtler"), e === "salate" && /sylvetta|rucola/i.test(r) && (n.indoor = [], n.direct = [3, 4, 5, 6, 7, 8, 9], n.planting = []), e === "salate" && /wasabino/i.test(r) && (n.indoor = [], n.direct = [3, 4, 8, 9], n.planting = []), e === "salate" && /baquieu|kaufunger|altenburger winter|nansen winter/i.test(r) && (n.indoor = [8], n.direct = [8, 9], n.planting = [9, 10]), e === "salate" && /\bvit\b|feldsalat/i.test(r) && (n.family = "Gei\xDFblattgew\xE4chse", n.indoor = [], n.direct = [8, 9], n.planting = []), e === "pastinake" && /schwarz|hoffmann|halblange weiße|russische riesen/i.test(r) && (n.family = "Korbbl\xFCtler", n.direct = [3, 4]), e === "kraeuter_einj" && /basilikum|dark opal|mammut/i.test(r) && (n.family = "Lippenbl\xFCtler", n.indoor = [3, 4], n.direct = [5, 6], n.planting = [5, 6], n.frostSensitive = true), e === "spinat" && /neuseel/i.test(r) && (n.family = "Mittagsblumengew\xE4chse", n.indoor = [3, 4], n.direct = [5, 6], n.planting = [5, 6], n.frostSensitive = true), e === "gruenkohl" && /granat|chinakohl/i.test(r) && (n.indoor = [6, 7], n.direct = [7], n.planting = [7, 8]), e === "physalis" && /toma verde/i.test(r) && (n.note = "Toma Verde ist ein Tomatillo, keine Andenbeere. Zur Fruchtbildung werden in der Regel mindestens zwei Pflanzen ben\xF6tigt.");
      let i = mn(t);
      return i.family && (n.family = i.family, n.rotation = i.rotationYears), n;
    }
    function da(t) {
      if (t == null) return {};
      if (typeof t != "object" || Array.isArray(t) || Object.keys(t).some((n) => !Object.hasOwn(Ie, n))) throw new Error("Ung\xFCltige Anbautermine.");
      let e = {};
      for (let [n, r] of Object.entries(t)) {
        if (!Array.isArray(r) || r.length > 12 || r.some((i) => !Number.isInteger(i) || i < 1 || i > 12)) throw new Error("Ung\xFCltige Anbautermine.");
        e[n] = [...new Set(r)].sort((i, a) => i - a);
      }
      return e;
    }
    function bn(t) {
      if (t.schedule && Object.keys(t.schedule).length) return { ...da(t.schedule), estimated: false };
      let e = St(t);
      return e ? { indoor: e.indoor, direct: e.direct, planting: e.planting, estimated: true } : { indoor: [], direct: [], planting: [], estimated: true, unknown: t.months || [] };
    }
    function ri(t = {}) {
      let e = String(t.location || "").trim();
      if (e.length > 100 || !["mild", "normal", "cool"].includes(t.climate || "normal")) throw new Error("Ung\xFCltiger Standort.");
      let n = t.last_frost || "05-15", r = /* @__PURE__ */ new Date(`2000-${n}T12:00:00Z`);
      if (!/^\d{2}-\d{2}$/.test(n) || !Number.isFinite(r.getTime()) || r.toISOString().slice(5, 10) !== n) throw new Error("Ung\xFCltiger Frost-Planungstermin.");
      return { location: e, climate: t.climate || "normal", last_frost: n };
    }
    function wn(t, { date: e = /* @__PURE__ */ new Date(), month: n = e.getMonth() + 1, growing: r = {}, phase: i = "all" } = {}) {
      let a = bn(t), s = St(t), l = ri(r).last_frost, c = n === e.getMonth() + 1 && `${String(n).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}` < l;
      return Object.keys(Ie).filter((u) => (i === "all" || i === u) && a[u]?.includes(n) && !(u !== "indoor" && s?.frostSensitive && c));
    }
    function so(t, e) {
      let n = bn(t);
      return !!(wn(t, e).length > 0 || (!e.phase || e.phase === "all") && n.unknown?.includes(e.month ?? (/* @__PURE__ */ new Date()).getMonth() + 1));
    }
    function ao(t) {
      if (!t || /\bm\b/.test(t.replace(/cm/g, ""))) return null;
      let e = [...t.matchAll(/\d+(?:[.,]\d+)?/g)].map((r) => Number(r[0].replace(",", "."))), n = Math.max(...e);
      return n > 0 && n <= 1e3 ? n : null;
    }
    function ii(t) {
      let e = t.spacing || "", n = e.match(/Pflanze:\s*([^;]+)/)?.[1] || e, r = e.match(/Reihe:\s*([^;]+)/)?.[1], i = ao(n), a = ao(r);
      return i && a ? i * a / 1e4 : null;
    }
    function ai(t, e, n, r, i) {
      let a = St(t);
      if (!a?.family || !a.rotation) return [];
      let s = new Map(i.map((l) => [l.id, l]));
      return r.filter((l) => l.bed_id === e && l.season_year < n && n - l.season_year < a.rotation && St(s.get(l.plant_id) || {})?.family === a.family).map((l) => `${l.season_year}: ${s.get(l.plant_id).name} (${a.family}) \u2013 empfohlen sind mindestens ${a.rotation} Jahre Anbaupause.`);
    }
    var si = ["Gem\xFCse", "Obst", "Kr\xE4uter", "Blumen", "Garten-Praxis"], fa = ["Alle", "Gem\xFCse", "Obst", "Beeren", "Kr\xE4uter", "Blumen", "Garten-Praxis", "Schattige Pl\xE4tze"], nr = ["Jan", "Feb", "M\xE4r", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"], rr = { Gem\u00FCse: "\u{1F96C}", Obst: "\u{1F353}", Kr\u00E4uter: "\u{1F33F}", Blumen: "\u{1F33C}", "Garten-Praxis": "\u{1F9D1}\u200D\u{1F33E}" };
    function co(t) {
      let e = new URL(t.url);
      if (e.protocol !== "https:" || !e.hostname.endsWith(".supabase.co") || e.pathname !== "/" || e.search || e.hash || e.username || e.password) throw new Error("Ung\xFCltige Supabase-Projektadresse.");
      let n = t.key;
      if (typeof n != "string" || !n) throw new Error("Der \xF6ffentliche Supabase-Schl\xFCssel fehlt.");
      if (!n.startsWith("sb_publishable_")) try {
        let r = n.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        if (JSON.parse(globalThis.atob(r)).role !== "anon") throw new Error();
      } catch {
        throw new Error("Nur Publishable-/anon-Keys d\xFCrfen in die Web-App. Niemals einen service_role- oder Secret-Key eintragen.");
      }
      return { url: e.origin, key: n };
    }
    function yn(t) {
      let e = (n, r, i = false) => {
        let a = t[n] ?? "";
        if (typeof a != "string" || a.length > r || i && !a.trim()) throw new Error(`Ung\xFCltiges Feld: ${n}.`);
        return a.trim();
      };
      if (!si.includes(t.category)) throw new Error("Bitte w\xE4hle eine Kategorie.");
      if (!Array.isArray(t.months) || t.months.length > 12 || t.months.some((n) => !Number.isInteger(n) || n < 1 || n > 12)) throw new Error("Ung\xFCltige Aussaatmonate.");
      return { name: e("name", 100, true), variety: e("variety", 100), category: t.category, location: e("location", 300), spacing: e("spacing", 100), sowing: e("sowing", 300), harvest: e("harvest", 300), care: e("care", 4e3), months: [...new Set(t.months)].sort((n, r) => n - r), ...t.schedule !== void 0 ? { schedule: da(t.schedule) } : {}, favorite: t.favorite === true, source: ["manual", "ai", "seed"].includes(t.source) ? t.source : "manual" };
    }
    var oo = (t) => t.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("de").replace(/ß/g, "ss"), ha = /* @__PURE__ */ new WeakMap(), lo = new Intl.Collator("de", { numeric: true });
    function uo(t, { query: e = "", category: n = "Alle", favorites: r = false, radar: i = false, month: a = (/* @__PURE__ */ new Date()).getMonth() + 1, phase: s = "all", growing: l = {}, regional: c = false } = {}) {
      let u = oo(e.trim()), d = (h) => n === "Alle" || (n === "Schattige Pl\xE4tze" ? mn(h).shade : n === "Beeren" ? h.category === "Obst" && /beere|aronia|cranberry/iu.test(h.name) : h.category === n);
      return t.filter((h) => !d(h) || r && !h.favorite || i && !(c ? so(h, { month: a, phase: s, growing: l }) : h.months.includes(a)) ? false : u ? (ha.has(h) || ha.set(h, oo(`${h.name} ${h.variety} ${h.care}`)), ha.get(h).includes(u)) : true).sort((h, g) => lo.compare(h.name, g.name) || lo.compare(h.variety || "", g.variety || ""));
    }
    var ho = [{ name: "Tomate", variety: "", category: "Gem\xFCse", location: "Sonnig, warm und vor Regen gesch\xFCtzt", spacing: "Etwa 50\u201380 cm, abh\xE4ngig von Sorte und Erziehung", sowing: "Vorzucht M\xE4rz\u2013April; nach den letzten Fr\xF6sten auspflanzen", harvest: "Meist Juli\u2013Oktober", months: [3, 4], care: "Gleichm\xE4\xDFig am Boden gie\xDFen. Stabtomaten st\xFCtzen; die Pflege an den Wuchstyp anpassen. Region und Sorte k\xF6nnen die Termine ver\xE4ndern." }, { name: "Radieschen", variety: "", category: "Gem\xFCse", location: "Sonnig bis halbschattig", spacing: "Etwa 4\u20136 cm, Reihen 15\u201320 cm", sowing: "Direktsaat M\xE4rz\u2013September; geeignete Sommer- oder Wintersorte w\xE4hlen", harvest: "Je nach Sorte und Witterung nach etwa 4\u20138 Wochen", months: [3, 4, 5, 6, 7, 8, 9], care: "In lockeren Boden s\xE4en und gleichm\xE4\xDFig feucht halten. F\xFCr eine fortlaufende Ernte in kleinen S\xE4tzen auss\xE4en." }, { name: "Basilikum", variety: "", category: "Kr\xE4uter", location: "Sonnig, warm und windgesch\xFCtzt", spacing: "Etwa 20\u201325 cm", sowing: "Vorzucht M\xE4rz\u2013Mai, ins Freie nach den letzten Fr\xF6sten", harvest: "Juni\u2013September", months: [3, 4, 5], care: "Lichtkeimer: Saat nur andr\xFCcken. Triebspitzen oberhalb eines Blattpaares schneiden. Keine Staun\xE4sse und keine kalten N\xE4chte." }, { name: "Pfl\xFCcksalat", variety: "", category: "Gem\xFCse", location: "Sonnig bis halbschattig", spacing: "Etwa 20\u201330 cm", sowing: "Je nach Sorte Februar\u2013August; Saatgutangaben beachten", harvest: "April\u2013Oktober", months: [2, 3, 4, 5, 6, 7, 8], care: "\xC4u\xDFere Bl\xE4tter pfl\xFCcken, das Herz stehen lassen. Bei Hitze Schatten und ausreichend Wasser geben." }, { name: "Erdbeere", variety: "", category: "Obst", location: "Sonnig, humoser und durchl\xE4ssiger Boden", spacing: "Etwa 25\u201335 cm, Reihen 60\u201380 cm", sowing: "Jungpflanzen je nach Typ im Fr\xFChjahr oder Juli\u2013August setzen", harvest: "Je nach Sorte Mai\u2013Oktober", months: [], care: "Das Herz bleibt \xFCber der Erde. Stroh h\xE4lt Fr\xFCchte sauber. Leere Aussaatmonate: Diese Orientierung bezieht sich auf Jungpflanzen." }, { name: "Ringelblume", variety: "", category: "Blumen", location: "Sonnig bis halbschattig", spacing: "Etwa 20\u201330 cm", sowing: "Direktsaat April\u2013Juni", harvest: "Bl\xFCte meist Juni\u2013Oktober", months: [4, 5, 6], care: "Verbl\xFChte Bl\xFCten entfernen, wenn keine Selbstaussaat gew\xFCnscht ist. Saatgutangaben und \xF6rtliche Bedingungen haben Vorrang." }].map((t) => ({ ...t, favorite: false, source: "seed" }));
    var Be, le = document.documentElement.dataset.base || "/";
    async function po() {
      let t = await fetch(`${le}config.json`, { cache: "no-store" });
      if (!t.ok) throw new Error("Die \xF6ffentliche Projektkonfiguration fehlt. Bitte den Build ausf\xFChren.");
      let e = co(await t.json()), n = { getItem: (i) => (i.endsWith("-code-verifier") ? localStorage : sessionStorage).getItem(i), setItem: (i, a) => (i.endsWith("-code-verifier") ? localStorage : sessionStorage).setItem(i, a), removeItem: (i) => (i.endsWith("-code-verifier") ? localStorage : sessionStorage).removeItem(i) }, r = new URLSearchParams(globalThis.location?.hash?.slice(1) || "").get("type") === "invite";
      return Be = io(e.url, e.key, { auth: { flowType: r ? "implicit" : "pkce", persistSession: true, storage: n, autoRefreshToken: true, detectSessionInUrl: true }, global: { fetch: (i, a = {}) => fetch(i, { ...a, cache: "no-store", signal: a.signal || AbortSignal.timeout(2e4) }) } }), Be;
    }
    var $ = () => Be;
    function C(t) {
      if (t.error) throw t.error;
      return t.data;
    }
    async function oi(t, e, n = 1e4, r = "*") {
      let i = [];
      for (let a = 0; a < n; a += 500) {
        let s = Be.from(t).select(r), l = C(await (t === "rg_plants" ? e ? s.or(`family_id.eq.${e},is_catalog.eq.true`) : s.eq("is_catalog", true) : s.eq("family_id", e)).order("id").range(a, a + 499));
        if (i.push(...l), l.length < 500) return i;
      }
      throw new Error("Der Datenbestand \xFCberschreitet die Ansichtsgrenze. Bitte die Seitengr\xF6\xDFe im Projekt erweitern, bevor du weitere \xC4nderungen vornimmst.");
    }
    var fo = "id,family_id,is_catalog,name,variety,category,location,spacing,sowing,harvest,care,months,schedule,favorite,source,version,created_by,created_at,updated_at,photo_path,culture_id:legacy_data->culture->>id,culture_icon:legacy_data->culture->>icon,source_url:legacy_data->>source_url";
    function go(t) {
      let { culture_id: e, culture_icon: n, source_url: r, ...i } = t;
      return (Object.hasOwn(t, "culture_id") || Object.hasOwn(t, "culture_icon") || Object.hasOwn(t, "source_url")) && (i.legacy_data = { culture: { id: e, icon: n }, ...r ? { source_url: r } : {} }), i;
    }
    const RECIPE_EMPTY=[];
    async function ga(t,e=null){
      const capabilities=C(await Be.rpc('rg_app_capabilities'));
      if(capabilities?.blocked||(capabilities?.maintenance&&!capabilities?.maintenance_access))return {membership:null,capabilities};
      const membership=C(await Be.from('rg_members').select('*').eq('user_id',t).maybeSingle());
      if(!membership)return {membership:null,capabilities};
      const [family,members,profile]=await Promise.all([
        Be.from('rg_families').select('*').eq('id',membership.family_id).single(),
        Be.from('rg_members').select('*').eq('family_id',membership.family_id).order('joined_at'),
        Be.from('rg_profiles').select('*').eq('user_id',t).maybeSingle()
      ]);
      return {membership,capabilities,family:C(family),members:C(members),profile:C(profile),plants:RECIPE_EMPTY,beds:RECIPE_EMPTY,notes:RECIPE_EMPTY,events:RECIPE_EMPTY,plantings:RECIPE_EMPTY};
    }
    function Hu(t) {
      return Array.isArray(t) ? t : C(t);
    }
    async function ze(t, e, n, r) {
      if (!["rg_plants", "rg_beds", "rg_notes", "rg_plantings", "rg_events", "rg_tasks", "rg_harvests", "rg_forum_topics", "rg_forum_replies"].includes(t)) throw new Error("Unbekannter Bereich.");
      let a;
      r ? a = Be.from(t).update(n).eq("id", r.id).eq("family_id", e).eq("version", r.version) : a = Be.from(t).insert({ ...n, family_id: e });
      let s = await a.select().maybeSingle(), l = C(s);
      if (!l) throw new Error("Dieser Eintrag wurde inzwischen ge\xE4ndert oder dein Zugriff wurde entzogen. Dein Formular bleibt offen. Aktualisiere die Ansicht und vergleiche deine \xC4nderungen.");
      return l;
    }
    async function nt(t, e, n) {
      if (!["rg_plants", "rg_beds", "rg_notes", "rg_plantings", "rg_events", "rg_tasks", "rg_harvests", "rg_forum_topics", "rg_forum_replies"].includes(t)) throw new Error("Unbekannter Bereich.");
      let r = await Be.from(t).delete().eq("id", n.id).eq("family_id", e).eq("version", n.version).select("id").maybeSingle();
      if (!C(r)) throw new Error("Der Eintrag hat sich inzwischen ge\xE4ndert oder dein Zugriff wurde entzogen. Bitte aktualisieren.");
    }
    async function Dt(t) {
      let e = await Be.functions.invoke("garden-ai", { body: t, timeout: 55e3 });
      if (e.error) {
        let n = "Die KI-Funktion ist nicht erreichbar. Pr\xFCfe die Einrichtung in Supabase.";
        try {
          n = (await e.error.context.json()).error || n;
        } catch {
        }
        throw new Error(n);
      }
      return e.data;
    }
    async function mo(t, { personal: e = false, userId: n } = {}) {
      let r = e ? ["tasks"] : ["harvests", "forum_topics", "forum_replies"], i = await Promise.all(r.map(async (a) => {
        let s = await oi("rg_" + a, t);
        return [a, e ? s.filter((l) => l.created_by === n) : s];
      }));
      return Object.fromEntries(i);
    }
    async function bo(t) {
      let e = await Be.functions.invoke("garden-account", { body: t, timeout: 55e3 });
      if (e.error) {
        let n = "Die Kontol\xF6schung ist gerade nicht erreichbar. Bitte sp\xE4ter erneut versuchen.";
        try {
          n = (await e.error.context.json()).error || n;
        } catch {
        }
        throw new Error(n);
      }
      if (e.data?.deleted !== true) throw new Error("Die Kontol\xF6schung wurde nicht best\xE4tigt.");
    }
    async function wo(t) {
      let e = await Be.functions.invoke("garden-invite", { body: t, timeout: 55e3 });
      if (e.error) {
        let n = "Die Einladung konnte nicht versendet werden.";
        try {
          n = (await e.error.context.json()).error || n;
        } catch {
        }
        throw new Error(n);
      }
      if (e.data?.sent !== true) throw new Error("Der Einladungsversand wurde nicht best\xE4tigt.");
    }
    function yo(t) {
      if (!/^[a-f0-9]{64}$/.test(t)) throw new Error("Ung\xFCltige Kalenderkennung.");
      let e = new URL("functions/v1/garden-calendar", Be.supabaseUrl + "/");
      if (e.protocol !== "https:") throw new Error("F\xFCr das Kalenderabo ist HTTPS erforderlich.");
      return e.searchParams.set("token", t), e.href;
    }
    var li = new Intl.Collator("de", { sensitivity: "base", numeric: true });
    function rt(t) {
      let e = /* @__PURE__ */ new Map();
      for (let i of t) {
        let a = JSON.stringify([i.name, i.category]);
        e.has(a) || e.set(a, { key: a, name: i.name, category: i.category, plants: [] }), e.get(a).plants.push(i);
      }
      let n = [...e.values()].sort((i, a) => li.compare(i.name, a.name) || li.compare(i.category, a.category)), r = /* @__PURE__ */ new Map();
      for (let i of n) r.set(i.name, (r.get(i.name) || 0) + 1);
      for (let i of n) i.label = r.get(i.name) > 1 ? `${i.name} (${i.category})` : i.name, i.plants.sort((a, s) => li.compare(a.variety, s.variety) || li.compare(a.name, s.name) || a.id.localeCompare(s.id));
      return n;
    }
    var Vu = "Europe/Berlin", Ju = new Intl.DateTimeFormat("en-GB", { timeZone: Vu, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }), ma = (t) => Object.fromEntries(Ju.formatToParts(t).filter((e) => e.type !== "literal").map((e) => [e.type, Number(e.value)])), vo = (t) => String(t).padStart(2, "0");
    function mt(t = /* @__PURE__ */ new Date()) {
      let e = ma(t);
      return `${e.year}-${vo(e.month)}-${vo(e.day)}`;
    }
    function So(t) {
      if (typeof t != "string" || !/^(20|21)\d\d-\d{2}-\d{2}$/.test(t)) throw new Error("Bitte ein g\xFCltiges Datum zwischen 2000 und 2199 w\xE4hlen.");
      let [e, n, r] = t.split("-").map(Number), i = new Date(Date.UTC(e, n - 1, r));
      if (i.getUTCFullYear() !== e || i.getUTCMonth() + 1 !== n || i.getUTCDate() !== r) throw new Error("Dieses Kalenderdatum gibt es nicht.");
      return { year: e, month: n, day: r, value: i };
    }
    function Zu(t, e) {
      let n = So(t);
      if (typeof e != "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(e)) throw new Error("Bitte eine g\xFCltige Uhrzeit w\xE4hlen.");
      let [r, i] = e.split(":").map(Number), a = Date.UTC(n.year, n.month - 1, n.day, r, i), l = [...new Set([-864e5, 0, 864e5].map((c) => {
        let u = a + c, d = ma(new Date(u));
        return Date.UTC(d.year, d.month - 1, d.day, d.hour, d.minute, d.second) - u;
      }))].map((c) => a - c).filter((c) => {
        let u = ma(new Date(c));
        return u.year === n.year && u.month === n.month && u.day === n.day && u.hour === r && u.minute === i;
      });
      if (l.length !== 1) throw new Error("Diese Uhrzeit ist wegen der Zeitumstellung nicht eindeutig oder f\xE4llt aus. Bitte eine andere Uhrzeit w\xE4hlen.");
      return new Date(l[0]);
    }
    var ci = (t) => t.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z"), _o = (t) => t.toISOString().slice(0, 10).replaceAll("-", "");
    function ko(t, e) {
      if (typeof t != "string" || t.length > e || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(t)) throw new Error("Ung\xFCltiger oder zu langer Kalendertext.");
      return t.replace(/\r\n?/g, `
`);
    }
    var pa = (t) => t.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
    function Yu(t) {
      let e = new TextEncoder(), n = "", r = 0;
      for (let i of t) {
        let a = e.encode(i).length;
        r + a > 75 && (n += `\r
 `, r = 1), n += i, r += a;
      }
      return n;
    }
    var ui = ["Vorziehen", "Direktsaat", "Pflanzen / Stecken", "Ernte", "Pflege", "Erde kaufen", "Saatgut kaufen", "Pflanzen kaufen", "D\xFCnger kaufen", "D\xFCngen", "Gie\xDFen", "Beet vorbereiten", "Werkzeug besorgen", "Sonstiges"];
    function Xu({ title: t, date: e, time: n = null, duration: r = 30, reminder: i = "day", description: a = "", url: s, uid: l = crypto.randomUUID(), now: c = /* @__PURE__ */ new Date(), modified: u = c, sequence: d = 0 }) {
      let h = ko(t, 240).trim();
      if (!h) throw new Error("Bitte einen Titel eingeben.");
      let g = ko(a, 5e3), f = So(e);
      if (!/^[a-zA-Z0-9-]{1,100}$/.test(l)) throw new Error("Ung\xFCltige Terminkennung.");
      let m = { none: null, day: "-P1D", week: "-P1W", hour: "-PT1H", start: "PT0S" };
      if (!Object.hasOwn(m, i) || n === null && ["hour", "start"].includes(i)) throw new Error("Ung\xFCltige Erinnerung.");
      if (!(c instanceof Date) || !Number.isFinite(c.getTime())) throw new Error("Ung\xFCltiger Erstellungszeitpunkt.");
      if (!(u instanceof Date) || !Number.isFinite(u.getTime()) || !Number.isInteger(d) || d < 0) throw new Error("Ung\xFCltige Terminversion.");
      let b = ["BEGIN:VEVENT", `UID:${l}@ramonas-garten.invalid`, `DTSTAMP:${ci(u)}`, `LAST-MODIFIED:${ci(u)}`, `SEQUENCE:${d}`];
      if (n === null) b.push(`DTSTART;VALUE=DATE:${_o(f.value)}`, `DTEND;VALUE=DATE:${_o(new Date(f.value.getTime() + 864e5))}`);
      else {
        if (!Number.isInteger(r) || r < 5 || r > 480) throw new Error("Bitte eine Dauer von 5 bis 480 Minuten w\xE4hlen.");
        let v = Zu(e, n);
        b.push(`DTSTART:${ci(v)}`, `DTEND:${ci(new Date(v.getTime() + r * 6e4))}`);
      }
      if (b.push(`SUMMARY:${pa(h)}`, `DESCRIPTION:${pa(g)}`, "CLASS:PRIVATE", "TRANSP:TRANSPARENT"), s !== void 0) {
        if (typeof s != "string" || s.length > 1e3 || /[\s\u0000-\u001f\u007f]/.test(s)) throw new Error("Ung\xFCltiger Kalenderlink.");
        let v = new URL(s);
        if (v.protocol !== "https:" || v.username || v.password || v.hash) throw new Error("Ung\xFCltiger Kalenderlink.");
        b.push(`URL:${v.href}`);
      }
      return m[i] && b.push("BEGIN:VALARM", `TRIGGER:${m[i]}`, "ACTION:DISPLAY", `DESCRIPTION:${pa(h)}`, "END:VALARM"), b.push("END:VEVENT"), b;
    }
    var Qu = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Ramonas Garten//Gartentermine//DE", "CALSCALE:GREGORIAN"], ed = (t) => t.map(Yu).join(`\r
`) + `\r
`;
    function Vt(t) {
      return ed([...Qu, ...Xu(t), "END:VCALENDAR"]);
    }
    function Eo(t) {
      if (t.event_time !== null && (typeof t.event_time != "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d:00$/.test(t.event_time))) throw new Error("Ung\xFCltige Terminzeit.");
      return { title: t.title, date: t.event_date, time: t.event_time?.slice(0, 5) ?? null, duration: t.duration, reminder: t.reminder, description: t.description, uid: t.id, sequence: t.version - 1, modified: new Date(t.updated_at) };
    }
    async function Ao(t) {
      let e = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t));
      return Array.from(new Uint8Array(e), (n) => n.toString(16).padStart(2, "0")).join("");
    }
    function To() {
      return Array.from(crypto.getRandomValues(new Uint8Array(32)), (t) => t.toString(16).padStart(2, "0")).join("");
    }
    var ba = "rg-garden-photos", wa = "rg-profile-photos";
    async function Po(t, e) {
      if (t.blob.size > 262144 || t.blob.type !== "image/jpeg") throw new Error("Bitte das Profilfoto vor dem Speichern verkleinern.");
      let n = `${e}/${crypto.randomUUID()}.jpg`;
      return C(await $().storage.from(wa).upload(n, t.blob, { contentType: "image/jpeg", cacheControl: "0", upsert: false })), n;
    }
    async function ya(t) {
      return C(await $().storage.from(wa).download(t));
    }
    async function di(t) {
      t && C(await $().storage.from(wa).remove([t]));
    }
    var xo = "rg-public-profile-photos";
    async function Do(t, e) {
      if (t.size > 262144 || t.type !== "image/jpeg") throw new Error("Bitte ein verkleinertes JPEG-Profilfoto verwenden.");
      let n = `${e}/${crypto.randomUUID()}.jpg`;
      return C(await $().storage.from(xo).upload(n, t, { contentType: "image/jpeg", cacheControl: "0", upsert: false })), n;
    }
    async function hi(t) {
      t && C(await $().storage.from(xo).remove([t]));
    }
    async function ir(t) {
      if (!t || t.size > 15e6 || !["image/jpeg", "image/png", "image/webp"].includes(t.type)) throw new Error("Bitte ein JPEG-, PNG- oder WebP-Foto mit h\xF6chstens 15 MB w\xE4hlen.");
      let e = await createImageBitmap(t);
      try {
        if (!e.width || !e.height || e.width * e.height > 5e7) throw new Error("Das Bild ist zu gro\xDF. Bitte mit geringerer Aufl\xF6sung fotografieren.");
        let n = document.createElement("canvas");
        for (let r of [1280, 1024, 800]) {
          let i = Math.min(1, r / Math.max(e.width, e.height));
          n.width = Math.max(1, Math.round(e.width * i)), n.height = Math.max(1, Math.round(e.height * i));
          let a = n.getContext("2d");
          if (!a) throw new Error("Der Browser kann dieses Foto nicht verkleinern.");
          a.fillStyle = "#fff", a.fillRect(0, 0, n.width, n.height), a.drawImage(e, 0, 0, n.width, n.height);
          for (let s of [0.78, 0.65, 0.52]) {
            let l = await new Promise((c) => n.toBlob(c, "image/jpeg", s));
            if (l && l.size <= 262144) {
              let c = await new Promise((u, d) => {
                let h = new FileReader();
                h.onload = () => u(String(h.result).split(",")[1]), h.onerror = () => d(new Error("Das Foto konnte nicht gelesen werden.")), h.readAsDataURL(l);
              });
              return { blob: l, base64: c, width: n.width, height: n.height, originalBytes: t.size };
            }
          }
        }
        throw new Error("Das Foto l\xE4sst sich nicht ausreichend verkleinern. Bitte einen kleineren Ausschnitt w\xE4hlen.");
      } finally {
        e.close();
      }
    }
    async function ar(t, e) {
      if (t.blob.size > 262144 || t.blob.type !== "image/jpeg") throw new Error("Bitte das Foto vor dem Speichern verkleinern.");
      let n = `${e}/${crypto.randomUUID()}.jpg`;
      return C(await $().storage.from(ba).upload(n, t.blob, { contentType: "image/jpeg", cacheControl: "0", upsert: false })), n;
    }
    async function Qe(t) {
      t && C(await $().storage.from(ba).remove([t]));
    }
    async function vn(t) {
      return C(await $().storage.from(ba).download(t));
    }
    async function Ro(t, { count: e = 6 } = {}) {
      if (!t || t.size > 25e7 || !["video/mp4", "video/quicktime", "video/webm"].includes(t.type)) throw new Error("Bitte ein MP4-, MOV- oder WebM-Video mit h\xF6chstens 250 MB w\xE4hlen.");
      let n = URL.createObjectURL(t), r = document.createElement("video");
      r.muted = true, r.playsInline = true, r.preload = "auto", r.className = "video-frame-source", r.setAttribute("aria-hidden", "true"), r.src = n, document.body.append(r);
      let i = (a) => new Promise((s, l) => {
        let c = setTimeout(() => h(new Error("Das Videoformat konnte nicht gelesen werden. Bitte ein kompatibles MP4 oder Fotos verwenden.")), 12e3), u = () => h(), d = () => h(new Error("Dieses Videoformat kann der Browser nicht lesen. Bitte MP4 oder Fotos verwenden."));
        function h(g) {
          clearTimeout(c), r.removeEventListener(a, u), r.removeEventListener("error", d), g ? l(g) : s();
        }
        r.addEventListener(a, u, { once: true }), r.addEventListener("error", d, { once: true });
      });
      try {
        let a = i("loadedmetadata");
        if (r.load(), await a, !Number.isFinite(r.duration) || r.duration <= 0 || r.duration > 300) throw new Error("Bitte einen Rundgang mit h\xF6chstens 5 Minuten ausw\xE4hlen.");
        if (!r.videoWidth || !r.videoHeight) throw new Error("Das Video enth\xE4lt kein lesbares Bild. Bitte MP4 oder Fotos verwenden.");
        if (!Number.isInteger(e) || e < 1 || e > 9) throw new Error("Bitte 1 bis 9 Standbilder verwenden.");
        let s = [], l = document.createElement("canvas"), c = Math.min(1, 1280 / Math.max(r.videoWidth, r.videoHeight));
        l.width = Math.max(1, Math.round(r.videoWidth * c)), l.height = Math.max(1, Math.round(r.videoHeight * c));
        let u = l.getContext("2d");
        if (!u) throw new Error("Standbilder sind in diesem Browser nicht verf\xFCgbar.");
        for (let d = 0; d < e; d++) {
          let h = Math.max(0, Math.min(r.duration * 0.99, r.duration * (d + 0.5) / e));
          if (Math.abs(r.currentTime - h) > 1e-5) {
            let f = i("seeked");
            r.currentTime = h, await f;
          }
          u.drawImage(r, 0, 0, l.width, l.height);
          let g = await new Promise((f) => l.toBlob(f, "image/jpeg", 0.8));
          if (!g) throw new Error("Ein Standbild konnte nicht erzeugt werden.");
          s.push(await ir(new File([g], `standbild-${d + 1}.jpg`, { type: "image/jpeg" })));
        }
        return s;
      } finally {
        r.pause(), r.removeAttribute("src"), r.load(), r.remove(), URL.revokeObjectURL(n);
      }
    }
    var or = ["Allgemein", "Fragen", "Erfahrungen", "Ernte & Tauschen"], fi = ["kg", "g", "St\xFCck", "Bund", "Liter"], zo = [["tasks", "\u2713", "Meine Aufgaben"], ["forum", "\u260F", "Familienforum"], ["harvests", "\u{1F9FA}", "Erntetagebuch"], ["notes", "\u270E", "Notizen"]];
    function sr(t) {
      if (typeof t != "string" || !/^(?:20\d{2}|2100)-\d{2}-\d{2}$/.test(t)) throw new Error("Bitte ein g\xFCltiges Datum zwischen 2000 und 2100 w\xE4hlen.");
      let e = /* @__PURE__ */ new Date(t + "T12:00:00Z");
      if (!Number.isFinite(e.getTime()) || e.toISOString().slice(0, 10) !== t || t > "2100-12-31") throw new Error("Bitte ein g\xFCltiges Datum zwischen 2000 und 2100 w\xE4hlen.");
      return t;
    }
    var va = (t) => t?.split("-").reverse().join(".") || "\u2013";
    function _a(t, e = mt()) {
      return t.status === "erledigt" ? "Erledigt" : t.due_date < e ? "\xDCberf\xE4llig" : t.due_date === e ? "Heute" : va(t.due_date);
    }
    function ka(t) {
      let e = Number(String(t).trim().replace(",", "."));
      if (!Number.isFinite(e) || e <= 0 || e > 1e5 || Math.abs(e * 1e3 - Math.round(e * 1e3)) > 1e-6) throw new Error("Bitte eine Menge gr\xF6\xDFer als 0 mit h\xF6chstens drei Nachkommastellen eingeben.");
      return e;
    }
    function Oo(t) {
      let e = /* @__PURE__ */ new Map();
      for (let n of t) fi.includes(n.unit) && e.set(n.unit, (e.get(n.unit) || 0) + Number(n.quantity));
      return [...e].map(([n, r]) => `${r.toLocaleString("de-DE", { maximumFractionDigits: 3 })} ${n}`).join(" \xB7 ");
    }
    function Co(t, { date: e = /* @__PURE__ */ new Date(), limit: n = 6 } = {}) {
      let r = mt(e), i = Number(r.slice(0, 4)), a = /* @__PURE__ */ new Date(r + "T12:00:00"), s = new Map(t.plants.map((d) => [d.id, d])), l = new Map(t.beds.map((d) => [d.id, d])), c = [], u = /* @__PURE__ */ new Set();
      for (let d of t.plantings) {
        if ((d.season_year ?? i) !== i || d.status !== "geplant") continue;
        let h = s.get(d.plant_id), g = l.get(d.bed_id);
        if (!(!h || !g)) for (let f of wn(h, { date: a, month: Number(r.slice(5, 7)), growing: t.family.growing_settings || {} })) {
          let m = `${i}:${r.slice(5, 7)}:${h.id}:${g.id}:${f}`;
          if (!u.has(m) && (u.add(m), c.push({ title: `${Ie[f]}: ${h.name}${h.variety ? " \xB7 " + h.variety : ""}`.slice(0, 150), due_date: r, status: "offen", plant_id: h.id, bed_id: g.id, suggestion_key: m, notes: `Vorschlag f\xFCr ${g.name} aus deiner geplanten Beetbelegung. Allgemeiner Monatsrichtwert: Saatgutt\xFCtchen, Bodentemperatur und \xF6rtliche Witterung pr\xFCfen. Erst durch \xDCbernehmen entsteht deine pers\xF6nliche Aufgabe.` }), c.length >= n)) return c;
        }
      }
      return c;
    }
    function $o(t, e) {
      if (!t || t.format !== "ramonas-garten-gartenleben" || t.version !== 1 || t.scope !== e || !["personal", "family"].includes(e)) throw new Error("Bitte eine passende Gartenleben-Sicherung ausw\xE4hlen.");
      let n = (g) => typeof g == "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(g), r = (g, f, m = false) => {
        if (typeof g != "string" || g.length > f || m && !g.trim()) throw new Error("Die Sicherung enth\xE4lt ung\xFCltige Textfelder.");
        return g.trim();
      }, i = (g) => {
        if (!Array.isArray(t[g]) || t[g].length > 9999) throw new Error("Die Sicherung ist unvollst\xE4ndig oder zu gro\xDF.");
        let f = /* @__PURE__ */ new Set();
        return t[g].map((m) => {
          if (!m || !n(m.id) || f.has(m.id) || m.origin_id != null && !n(m.origin_id)) throw new Error("Die Sicherung enth\xE4lt fehlende oder doppelte Kennungen.");
          return f.add(m.id), m;
        });
      }, a = i("plants").map((g) => ({ id: g.id, name: r(g.name, 100, true), variety: r(g.variety || "", 100), category: r(g.category, 30, true) })), s = i("beds").map((g) => ({ id: g.id, name: r(g.name, 100, true) })), l = new Set(a.map((g) => g.id)), c = new Set(s.map((g) => g.id)), u = (g) => ({ id: g.id, origin_id: g.origin_id || g.id }), d = (g) => {
        if (g.plant_id != null && !l.has(g.plant_id) || g.bed_id != null && !c.has(g.bed_id)) throw new Error("Eine Zuordnung in der Sicherung fehlt.");
        return { plant_id: g.plant_id || null, bed_id: g.bed_id || null };
      }, h = { format: t.format, version: 1, scope: e, plants: a, beds: s };
      if (e === "personal") h.tasks = i("tasks").map((g) => {
        if (!["offen", "erledigt"].includes(g.status) || g.suggestion_key != null && (typeof g.suggestion_key != "string" || g.suggestion_key.length > 200)) throw new Error("Ung\xFCltige Aufgabe in der Sicherung.");
        return { ...u(g), ...d(g), title: r(g.title, 150, true), notes: r(g.notes || "", 3e3), due_date: sr(g.due_date), status: g.status, suggestion_key: g.suggestion_key || null };
      });
      else {
        h.harvests = i("harvests").map((f) => {
          if (!fi.includes(f.unit) || f.rating != null && (!Number.isInteger(f.rating) || f.rating < 1 || f.rating > 5) || f.photo_path != null && (typeof f.photo_path != "string" || !/^[-0-9a-f]{36}\/[-0-9a-f]{36}\.jpg$/.test(f.photo_path))) throw new Error("Ung\xFCltiger Ernteeintrag in der Sicherung.");
          return { ...u(f), ...d(f), title: r(f.title, 150, true), harvested_on: sr(f.harvested_on), quantity: ka(f.quantity), unit: f.unit, rating: f.rating ?? null, taste: r(f.taste || "", 500), notes: r(f.notes || "", 3e3), photo_path: f.photo_path || null };
        }), h.forum_topics = i("forum_topics").map((f) => {
          if (!or.includes(f.category) || typeof f.locked != "boolean") throw new Error("Ung\xFCltiges Forumthema.");
          return { ...u(f), title: r(f.title, 150, true), content: r(f.content, 8e3, true), category: f.category, locked: f.locked };
        });
        let g = new Set(h.forum_topics.map((f) => f.id));
        h.forum_replies = i("forum_replies").map((f) => {
          if (!g.has(f.topic_id)) throw new Error("Eine Antwort verweist auf ein fehlendes Thema.");
          return { ...u(f), topic_id: f.topic_id, content: r(f.content, 3e3, true) };
        });
      }
      return h;
    }
    function Io(t) {
      let { h: e, button: n, small: r, empty: i, field: a, formError: s, actions: l, showDialog: c, formAction: u, perform: d, notify: h, friendly: g, getState: f, captureScope: m, afterSave: b, photoEditor: v, dialog: y, navigate: k, notesView: _, disposeMedia: T, plantDetail: I } = t, D = "tasks", x = () => f(), w = () => x().data.membership.family_id, P = () => x().user.id, F = (A) => A.created_by === P() || x().data.membership.role === "owner";
      function z(A, V) {
        let B = () => {
          A.isConnected && !y.open && V();
        };
        window.addEventListener("garden-life-refresh", B), T(() => window.removeEventListener("garden-life-refresh", B));
      }
      let q = (A) => new Date(A).toLocaleString("de-DE", { timeZone: "Europe/Berlin", dateStyle: "short", timeStyle: "short" }), ne = (A) => `${A.name}${A.variety ? " \xB7 " + A.variety : ""}`;
      function R(A) {
        let V = x().data.plants.find((M) => M.id === A.plant_id), B = x().data.beds.find((M) => M.id === A.bed_id);
        return e("div", { class: "life-links" }, V ? n(ne(V), () => I(V), "text-button") : null, B ? r(B.name) : null);
      }
      function U(A = {}) {
        let V = e("input", { type: "search", placeholder: "Sorte suchen \u2026", "aria-label": "Sorte f\xFCr diesen Eintrag suchen" }), B = e("select", { name: "plant_id", id: `life-plant-${crypto.randomUUID()}` }), M = A.plant_id || "", K = () => {
          let Y = V.value.trim().toLocaleLowerCase("de"), fe = x().data.plants.filter((ge) => ge.id === M || ne(ge).toLocaleLowerCase("de").includes(Y));
          B.replaceChildren(e("option", { value: "" }, "Ohne bestimmte Sorte"), ...rt(fe).map((ge) => e("optgroup", { label: ge.label }, ge.plants.map((be) => e("option", { value: be.id }, be.variety || be.name))))), B.value = M;
        };
        V.addEventListener("input", K), B.addEventListener("change", () => {
          M = B.value;
        }), K();
        let Q = n("\xD7", () => {
          V.value = "", K(), V.focus();
        }, "icon-button", { "aria-label": "Sortensuche leeren" }), X = e("select", { name: "bed_id", id: `life-bed-${crypto.randomUUID()}` }, e("option", { value: "" }, "Ohne bestimmtes Beet"), [...x().data.beds].sort((Y, fe) => Y.name.localeCompare(fe.name, "de", { numeric: true })).map((Y) => e("option", { value: Y.id, selected: Y.id === A.bed_id }, Y.name)));
        return e("div", {}, e("div", { class: "field" }, e("label", { for: B.id }, "Sorte (optional)"), e("div", { class: "life-search" }, V, Q), B), e("div", { class: "field" }, e("label", { for: X.id }, "Beet (optional)"), X));
      }
      function L(A, V, B) {
        let M = new Blob([A], { type: B }), K = URL.createObjectURL(M), Q = e("a", { href: K, download: V });
        document.body.append(Q), Q.click(), Q.remove(), setTimeout(() => URL.revokeObjectURL(K), 1e3);
      }
      function oe(A) {
        L(Vt({ title: A.title, date: A.due_date, time: null, duration: 30, reminder: "none", description: A.notes || "" }), "meine-gartenaufgabe.ics", "text/calendar;charset=utf-8"), h("Kalenderdatei erstellt. Sie enth\xE4lt nur diese pers\xF6nliche Aufgabe.");
      }
      function ee(A = null, V = null) {
        let B = m(), M = A || V || {}, K = e("form", {}, r("Nur du kannst deine Aufgaben sehen und bearbeiten \u2013 auch die Gartenverwaltung hat darauf keinen Zugriff."), a("Aufgabe", "title", M.title || "", { required: true, maxlength: 150 }), a("F\xE4llig am", "due_date", M.due_date || mt(), { type: "date", required: true, min: "2000-01-01", max: "2100-12-31" }), a("Status", "status", M.status || "offen", { select: ["offen", "erledigt"] }), U(M), a("Hinweise", "notes", M.notes || "", { area: true, maxlength: 3e3 }), s(), l(A ? n("Aufgabe l\xF6schen", (Q) => d(async () => {
          confirm("Diese pers\xF6nliche Aufgabe l\xF6schen?") && (await nt("rg_tasks", w(), A), B() && await b(K, "Aufgabe gel\xF6scht."));
        }, Q.currentTarget), "button danger") : null, A ? n("Kalenderdatei", () => oe(A), "button secondary") : null, e("button", { type: "submit", class: "button" }, "Aufgabe speichern")));
        K.addEventListener("submit", (Q) => {
          Q.preventDefault();
          let X = Object.fromEntries(new FormData(K));
          u(K, async () => {
            X.due_date = sr(X.due_date), X.plant_id ||= null, X.bed_id ||= null, V?.suggestion_key && (X.suggestion_key = V.suggestion_key), await ze("rg_tasks", w(), X, A), B() && await b(K, "Deine Aufgabe ist gespeichert.");
          });
        }), c(A ? "Meine Aufgabe bearbeiten" : "Meine Gartenaufgabe", K);
      }
      function _e(A, V) {
        let B = m();
        return e("article", { class: `life-card task-card ${A.status === "erledigt" ? "task-complete" : ""}` }, e("div", { class: "life-card-top" }, n(A.status === "erledigt" ? "\u2713" : "\u25CB", (M) => d(async () => {
          await ze("rg_tasks", w(), { status: A.status === "offen" ? "erledigt" : "offen" }, A), B() && (h(A.status === "offen" ? "Aufgabe erledigt." : "Aufgabe wieder ge\xF6ffnet."), await V());
        }, M.currentTarget), "task-toggle", { "aria-label": `${A.title}: ${A.status === "offen" ? "als erledigt markieren" : "wieder \xF6ffnen"}` }), e("div", {}, r(_a(A)), e("h3", {}, n(A.title, () => ee(A), "card-title")))), R(A), A.notes ? e("p", { class: "life-excerpt preserve-lines" }, A.notes) : null, l(n("Bearbeiten", () => ee(A), "text-button"), n("Kalenderdatei", () => oe(A), "text-button")));
      }
      function ie(A = null) {
        let V = m(), B = A || {}, M = v({ path: B.photo_path, label: "Erntefoto" }), K = e("select", { name: "rating", id: "harvest-rating" }, e("option", { value: "" }, "Noch nicht bewertet"), [1, 2, 3, 4, 5].map((X) => e("option", { value: X, selected: Number(B.rating) === X }, `${X} von 5`))), Q = e("form", {}, r("F\xFCr eure Familie sichtbar. Du und die Gartenverwaltung k\xF6nnen diesen Eintrag bearbeiten."), a("Was hast du geerntet?", "title", B.title || "", { required: true, maxlength: 150, placeholder: "Zum Beispiel Tomaten aus Beet 2" }), U(B), a("Erntedatum", "harvested_on", B.harvested_on || mt(), { type: "date", required: true, min: "2000-01-01", max: "2100-12-31" }), e("div", { class: "form-grid" }, a("Menge", "quantity", B.quantity ?? "", { required: true, inputmode: "decimal", placeholder: "Zum Beispiel 1,5" }), a("Einheit", "unit", B.unit || "kg", { select: fi })), e("div", { class: "field" }, e("label", { for: "harvest-rating" }, "Bewertung"), K), a("Geschmack & Qualit\xE4t", "taste", B.taste || "", { area: true, maxlength: 500, rows: 3 }), a("Notizen", "notes", B.notes || "", { area: true, maxlength: 3e3 }), M.node, s(), l(A ? n("Ernte l\xF6schen", (X) => d(async () => {
          if (confirm("Diesen Ernteeintrag l\xF6schen?")) {
            if (await nt("rg_harvests", w(), A), B.photo_path) try {
              await Qe(B.photo_path);
            } catch {
              h("Eintrag gel\xF6scht. Das Foto konnte nicht entfernt werden.", true);
            }
            V() && await b(Q, "Ernteeintrag gel\xF6scht.");
          }
        }, X.currentTarget), "button danger") : null, e("button", { type: "submit", class: "button" }, "Ernte speichern")));
        Q.addEventListener("submit", (X) => {
          X.preventDefault();
          let Y = Object.fromEntries(new FormData(Q));
          u(Q, async () => {
            Y.quantity = ka(Y.quantity), Y.harvested_on = sr(Y.harvested_on), Y.rating = Y.rating ? Number(Y.rating) : null, Y.plant_id ||= null, Y.bed_id ||= null;
            let fe = await M.getPhoto();
            if (!V()) return;
            let ge = null;
            try {
              fe && (ge = await ar(fe, w())), Y.photo_path = ge || (M.remove() ? null : B.photo_path || null), await ze("rg_harvests", w(), Y, A);
            } catch (be) {
              if (ge) try {
                await Qe(ge);
              } catch {
              }
              throw be;
            }
            if (B.photo_path && B.photo_path !== Y.photo_path) try {
              await Qe(B.photo_path);
            } catch {
              h("Gespeichert. Das fr\xFChere Foto konnte nicht entfernt werden.", true);
            }
            V() && await b(Q, "Deine Ernte ist im Tagebuch.");
          });
        }), c(A ? "Ernte bearbeiten" : "Ernte festhalten", Q, { cleanup: M.cleanup });
      }
      function me(A, V = T) {
        let B = e("div"), M = m(), K = null, Q = false;
        V(() => {
          Q = true, K && URL.revokeObjectURL(K);
        });
        let X = e("article", { class: "life-card" }, B, r(va(A.harvested_on)), e("h3", {}, A.title), e("strong", { class: "harvest-amount" }, `${Number(A.quantity).toLocaleString("de-DE", { maximumFractionDigits: 3 })} ${A.unit}`), R(A), A.rating ? r(`Bewertung: ${A.rating} von 5`) : null, A.taste ? e("p", { class: "preserve-lines" }, A.taste) : null, A.notes ? e("details", {}, e("summary", {}, "Notizen zur Ernte"), e("p", { class: "preserve-lines" }, A.notes)) : null, F(A) ? n("Ernte bearbeiten", () => ie(A), "text-button") : null);
        if (A.photo_path) {
          let Y = n("Erntefoto ansehen", (fe) => d(async () => {
            let ge = await vn(A.photo_path);
            !M() || Q || !X.isConnected || (K = URL.createObjectURL(ge), B.replaceChildren(e("img", { src: K, alt: `Ernte: ${A.title}`, class: "harvest-photo" })));
          }, fe.currentTarget), "button secondary");
          B.append(Y);
        }
        return X;
      }
      function It(A = null) {
        let V = m(), B = A || {}, M = e("form", {}, r("Nur Mitglieder deiner Familie k\xF6nnen mitlesen. Dein Profilname wird als Autorenname gespeichert, sonst \u201EFamilienmitglied\u201C. Bitte keine vertraulichen Daten anderer Personen posten."), a("Thema", "title", B.title || "", { required: true, maxlength: 150 }), a("Bereich", "category", B.category || or[0], { select: or }), a("Dein Beitrag", "content", B.content || "", { area: true, required: true, maxlength: 8e3, rows: 8 }), s(), l(e("button", { type: "submit", class: "button" }, A ? "Beitrag speichern" : "Thema ver\xF6ffentlichen")));
        M.addEventListener("submit", (K) => {
          K.preventDefault();
          let Q = Object.fromEntries(new FormData(M));
          u(M, async () => {
            await ze("rg_forum_topics", w(), Q, A), V() && await b(M, "Thema gespeichert.");
          });
        }), c(A ? "Thema bearbeiten" : "Neues Familienthema", M);
      }
      function Ve(A) {
        let V = m(), B = e("div", {}, r("Thema wird geladen \u2026")), M = 0, K = null, Q = false;
        c("Familienforum", B, { className: "forum-dialog" });
        let X = () => V() && y.contains(B) && y.open, Y = e("div", { class: "forum-replies" }), fe = e("div"), ge = e("p", { role: "status", class: "muted small" });
        async function be(Ee = false) {
          if (!Q) {
            Q = true, fe.replaceChildren(r("Antworten werden geladen \u2026"));
            try {
              let de = C(await $().from("rg_forum_replies").select("*").eq("family_id", w()).eq("topic_id", A).order("created_at").order("id").range(Ee ? 0 : M, (Ee ? 0 : M) + 30));
              if (!X()) return;
              Ee && (M = 0, Y.replaceChildren());
              let ke = de.length > 30;
              for (let tt of de.slice(0, 30)) Y.append(Oe(tt));
              M += Math.min(de.length, 30), ge.textContent = M ? `${M} Antworten geladen.` : "Noch keine Antworten. Beginne den Austausch.", fe.replaceChildren(...ke ? [n("Weitere Antworten", () => be(), "button secondary")] : []);
            } catch (de) {
              X() && fe.replaceChildren(e("p", { class: "form-error" }, g(de)), n("Erneut laden", () => be(Ee), "button secondary"));
            } finally {
              Q = false;
            }
          }
        }
        function Oe(Ee) {
          let de = e("article", { class: "forum-reply" }, r(`${Ee.author_label} \xB7 ${q(Ee.created_at)}`), e("p", { class: "preserve-lines" }, Ee.content));
          return F(Ee) && de.append(l(K.locked ? null : n("Antwort bearbeiten", () => {
            let ke = e("form", {}, a("Antwort", "content", Ee.content, { area: true, required: true, maxlength: 3e3 }), s(), l(e("button", { type: "submit", class: "button" }, "Antwort speichern"), n("Abbrechen", () => Ve(A), "button secondary")));
            ke.addEventListener("submit", (tt) => {
              tt.preventDefault();
              let Je = new FormData(ke).get("content");
              u(ke, async () => {
                await ze("rg_forum_replies", w(), { content: Je }, Ee), V() && Ve(A);
              });
            }), c("Antwort bearbeiten", ke);
          }, "text-button"), n("Antwort l\xF6schen", (ke) => d(async () => {
            confirm("Diese Antwort l\xF6schen?") && (await nt("rg_forum_replies", w(), Ee), X() && await be(true));
          }, ke.currentTarget), "text-button"))), de;
        }
        (async () => {
          try {
            if (K = C(await $().from("rg_forum_topics").select("*").eq("family_id", w()).eq("id", A).maybeSingle()), !X()) return;
            if (!K) {
              B.replaceChildren(r("Dieses Thema ist nicht mehr verf\xFCgbar."));
              return;
            }
            let Ee = l(F(K) ? n("Thema bearbeiten", () => It(K), "text-button") : null, x().data.membership.role === "owner" ? n(K.locked ? "Thema wieder \xF6ffnen" : "Thema schlie\xDFen", (ke) => d(async () => {
              await ze("rg_forum_topics", w(), { locked: !K.locked }, K), X() && Ve(A);
            }, ke.currentTarget), "text-button") : null, F(K) ? n("Thema l\xF6schen", (ke) => d(async () => {
              confirm("Dieses Thema mit allen Antworten l\xF6schen?") && (await nt("rg_forum_topics", w(), K), V() && await b(B, "Thema gel\xF6scht."));
            }, ke.currentTarget), "text-button") : null), de = e("form", {}, a("Deine Antwort", "content", "", { area: true, required: true, maxlength: 3e3, rows: 4 }), s(), l(e("button", { type: "submit", class: "button" }, "Antwort senden")));
            de.addEventListener("submit", (ke) => {
              ke.preventDefault();
              let tt = new FormData(de).get("content");
              u(de, async () => {
                await ze("rg_forum_replies", w(), { topic_id: A, content: tt }), X() && (de.reset(), delete de.dataset.dirty, await be(true), h("Antwort gesendet."));
              });
            }), B.replaceChildren(e("span", { class: "pill" }, K.category), e("h3", { class: "forum-title" }, K.title), r(`${K.author_label} \xB7 ${q(K.created_at)}`), e("p", { class: "preserve-lines" }, K.content), Ee, e("hr"), e("div", { class: "section-heading" }, e("h3", {}, "Antworten"), n("Antworten aktualisieren", () => be(true), "text-button")), ge, Y, fe, K.locked ? e("p", { class: "callout" }, "Dieses Thema ist geschlossen. Die Familienverwaltung kann es wieder \xF6ffnen.") : de), await be(true);
          } catch (Ee) {
            X() && B.replaceChildren(e("p", { class: "form-error" }, g(Ee)), n("Erneut laden", () => Ve(A), "button secondary"));
          }
        })();
      }
      function Er(A) {
        if (A === "forum" && x().data?.capabilities?.forum === false) return i("Das Familienforum pausiert.", "Der Betreiber hat das Forum vor\xFCbergehend deaktiviert. Vorhandene Beitr\xE4ge bleiben gespeichert.", null);
        let V = m(), B = e("section", { class: "life-collection" }), M = e("div", { class: "life-list" }), K = e("div", { class: "life-pagination" }), Q = e("p", { class: "muted small", role: "status" }), X = A === "tasks" ? "rg_tasks" : A === "forum" ? "rg_forum_topics" : "rg_harvests", Y = 0, fe = 0, ge = /* @__PURE__ */ new Set(), be = () => {
          for (let Le of ge) Le();
          ge.clear();
        };
        T(be);
        let Oe = e("input", { type: "search", placeholder: A === "forum" ? "Thementitel suchen \u2026" : "Eintr\xE4ge suchen \u2026", "aria-label": A === "forum" ? "Themen durchsuchen" : "Eintr\xE4ge durchsuchen" }), Ee = n("\xD7", () => {
          Oe.value = "", Y = 0, Je(), Oe.focus();
        }, "icon-button", { "aria-label": "Eintragssuche leeren" }), de = A === "tasks" ? e("select", { "aria-label": "Aufgaben filtern" }, ["offen", "erledigt", "alle"].map((Le) => e("option", { value: Le }, Le === "alle" ? "Alle Aufgaben" : Le === "offen" ? "Offene Aufgaben" : "Erledigte Aufgaben"))) : A === "forum" ? e("select", { "aria-label": "Forumbereich ausw\xE4hlen" }, e("option", { value: "" }, "Alle Bereiche"), or.map((Le) => e("option", { value: Le }, Le))) : e("input", { type: "number", min: 2e3, max: 2100, value: (/* @__PURE__ */ new Date()).getFullYear(), "aria-label": "Erntejahr" }), ke;
        Oe.addEventListener("input", () => {
          clearTimeout(ke), ke = setTimeout(() => {
            Y = 0, Je();
          }, 250);
        }), de.addEventListener("change", () => {
          Y = 0, Je();
        });
        let tt = e("div", { class: "life-suggestions" });
        async function Je() {
          if (!V() || !B.isConnected) return;
          let Le = ++fe;
          Q.textContent = "Eintr\xE4ge werden geladen \u2026", K.replaceChildren();
          try {
            let Se = $().from(X).select("*").eq("family_id", w());
            if (A === "tasks" && (Se = Se.eq("created_by", P()), de.value !== "alle" && (Se = Se.eq("status", de.value)), Se = Se.order("due_date").order("id")), A === "forum" && (de.value && (Se = Se.eq("category", de.value)), Se = Se.order("created_at", { ascending: false }).order("id", { ascending: false })), A === "harvests") {
              let De = Number(de.value);
              if (!Number.isInteger(De) || De < 2e3 || De > 2100) throw new Error("Bitte ein g\xFCltiges Erntejahr ausw\xE4hlen.");
              Se = Se.gte("harvested_on", `${De}-01-01`).lte("harvested_on", `${De}-12-31`).order("harvested_on", { ascending: false }).order("id", { ascending: false });
            }
            let xr = Oe.value.trim();
            xr && (Se = Se.ilike("title", `%${xr.replace(/[\\%_]/g, "\\$&")}%`));
            let Dr = C(await Se.range(Y, Y + 20));
            if (!V() || !B.isConnected || Le !== fe) return;
            let Dn = Dr.length > 20, Ne = Dr.slice(0, 20);
            if (Q.textContent = Ne.length ? `Eintr\xE4ge ${Y + 1}\u2013${Y + Ne.length}${Dn ? " \xB7 weitere vorhanden" : ""}${A === "harvests" ? ` \xB7 Auf dieser Seite: ${Oo(Ne)}` : ""}` : "Keine Eintr\xE4ge f\xFCr diese Auswahl.", be(), M.replaceChildren(...Ne.map((De) => A === "tasks" ? _e(De, Je) : A === "harvests" ? me(De, (zl) => ge.add(zl)) : e("article", { class: "life-card forum-topic" }, e("div", { class: "life-card-top" }, e("span", { class: "pill" }, De.category), De.locked ? r("Geschlossen") : null), e("h3", {}, n(De.title, () => Ve(De.id), "card-title")), r(`${De.author_label} \xB7 ${q(De.created_at)}`), e("p", { class: "life-excerpt preserve-lines" }, De.content), n("Thema & Antworten \xF6ffnen \u2192", () => Ve(De.id), "text-button")))), Ne.length || M.append(i(A === "forum" ? "Hier w\xE4chst euer Austausch." : A === "tasks" ? "Raum f\xFCr deine n\xE4chsten Schritte." : "Zeit f\xFCr die erste Ernte.", "Lege einen Eintrag an oder \xE4ndere deine Filter.", null)), K.replaceChildren(...[Y ? n("\u2190 Vorherige", () => {
              Y = Math.max(0, Y - 20), Je();
            }, "button secondary") : null, Dn ? n("Weitere \u2192", () => {
              Y += 20, Je();
            }, "button secondary") : null].filter(Boolean)), A === "tasks") try {
              await Rl(Le);
            } catch {
              V() && B.isConnected && Le === fe && tt.replaceChildren(r("Beetvorschl\xE4ge konnten gerade nicht geladen werden. Deine Aufgaben bleiben verf\xFCgbar."));
            }
          } catch (Se) {
            V() && B.isConnected && Le === fe && (be(), Q.textContent = "Laden fehlgeschlagen.", M.replaceChildren(e("p", { class: "form-error" }, g(Se)), n("Erneut versuchen", Je, "button secondary")));
          }
        }
        async function Rl(Le) {
          let Se = Co(x().data, { limit: 30 });
          if (!Se.length) {
            tt.replaceChildren();
            return;
          }
          let xr = C(await $().from("rg_tasks").select("suggestion_key").eq("family_id", w()).eq("created_by", P()).in("suggestion_key", Se.map((Ne) => Ne.suggestion_key)));
          if (!V() || !B.isConnected || Le !== fe) return;
          let Dr = new Set(xr.map((Ne) => Ne.suggestion_key)), Dn = Se.filter((Ne) => !Dr.has(Ne.suggestion_key));
          tt.replaceChildren(...Dn.length ? [e("h3", {}, "Vorschl\xE4ge aus deinen Beeten"), r("Aus geplanten Belegungen und Monatsrichtwerten. Pr\xFCfe Wetter und Saatgutt\xFCtchen. \xDCbernimm nur, was f\xFCr dich passt."), ...Dn.slice(0, 6).map((Ne) => e("article", { class: "life-suggestion" }, e("div", {}, e("strong", {}, Ne.title), r(x().data.beds.find((De) => De.id === Ne.bed_id)?.name || "")), n("\xDCbernehmen", () => ee(null, Ne), "button secondary")))] : []);
        }
        return B.append(e("div", { class: "life-toolbar" }, e("div", { class: "life-search" }, Oe, Ee), de, n(A === "tasks" ? "+ Aufgabe" : A === "forum" ? "+ Thema" : "+ Ernte", () => A === "tasks" ? ee() : A === "forum" ? It() : ie())), r(A === "tasks" ? "Deine Aufgaben bleiben privat. Du bestimmst Datum und Erledigung." : A === "forum" ? "Ein gesch\xFCtzter Austausch nur f\xFCr eure Familie." : "Eure Ernten mit Menge, Geschmack, Bewertung und optionalem Foto. Einheiten werden getrennt summiert."), Q, M, K, tt), z(B, Je), queueMicrotask(Je), B;
      }
      function Ar(A) {
        let V = m(), B = e("input", { type: "file", accept: ".json,application/json", "aria-label": "Gartenleben-Sicherung ausw\xE4hlen" }), M = e("div", { role: "status" }), K = e("button", { type: "submit", class: "button", disabled: true }, "Gepr\xFCfte Eintr\xE4ge erg\xE4nzen"), Q = A || x().data.membership.role === "owner", X = null, Y = 0, fe = e("form", {}, r(A ? "Diese separate Sicherung enth\xE4lt nur deine pers\xF6nlichen Aufgaben. Bewahre sie privat auf." : "Diese separate Sicherung enth\xE4lt Erntetagebuch und Familienforum mit allen Antworten. Pers\xF6nliche Aufgaben und Profile sind nicht enthalten."), n("Sicherung herunterladen", (ge) => d(async () => {
          let be = await mo(w(), { personal: A, userId: P() });
          if (!V()) return;
          let Oe = x().data.plants.map(({ id: de, name: ke, variety: tt, category: Je }) => ({ id: de, name: ke, variety: tt, category: Je })), Ee = x().data.beds.map(({ id: de, name: ke }) => ({ id: de, name: ke }));
          L(JSON.stringify({ format: "ramonas-garten-gartenleben", version: 1, scope: A ? "personal" : "family", exportedAt: (/* @__PURE__ */ new Date()).toISOString(), plants: Oe, beds: Ee, ...be }, null, 2), `gartenleben-${A ? "meine-aufgaben" : "familie"}-${mt()}.json`, "application/json");
        }, ge.currentTarget), "button secondary"), e("hr"), Q ? e("div", {}, e("h3", {}, "Sicherung wiederherstellen"), r("Erg\xE4nzt Eintr\xE4ge ohne vorhandene zu \xFCberschreiben. Wiederholter Import derselben Originaleintr\xE4ge wird \xFCbersprungen. Sorte und Beet werden \xFCber Namen zugeordnet; fehlende Zuordnungen bleiben leer. Importierte Beitr\xE4ge erhalten dich als Autor. Erntefotos sind nur als Verweise enthalten und funktionieren nur mit vorhandenen Dateien in diesem Familiengarten."), B, M, e("label", { class: "consent" }, e("input", { type: "checkbox", required: true }), e("span", {}, "Ich m\xF6chte die gepr\xFCften Eintr\xE4ge erg\xE4nzen.")), s(), l(K)) : r("Nur die Familienverwaltung kann eine gemeinsame Sicherung wiederherstellen."));
        B.addEventListener("change", async () => {
          let ge = ++Y;
          X = null, K.disabled = true;
          let be = B.files[0];
          if (be) {
            if (be.size > 2e7) {
              M.textContent = "Bitte eine Datei bis 20 MB ausw\xE4hlen.";
              return;
            }
            try {
              let Oe = $o(JSON.parse(await be.text()), A ? "personal" : "family");
              if (!V() || !y.contains(fe) || ge !== Y) return;
              X = Oe, M.textContent = A ? `${Oe.tasks.length} pers\xF6nliche Aufgaben gepr\xFCft.` : `${Oe.harvests.length} Ernten, ${Oe.forum_topics.length} Themen und ${Oe.forum_replies.length} Antworten gepr\xFCft.`, K.disabled = false;
            } catch (Oe) {
              V() && y.contains(fe) && ge === Y && (M.textContent = g(Oe));
            }
          }
        }), fe.addEventListener("submit", (ge) => {
          ge.preventDefault(), X && u(fe, async () => {
            let be = C(await $().rpc("rg_import_garden_life", { backup: X }));
            V() && await b(fe, `${be.inserted} Eintr\xE4ge erg\xE4nzt; vorhandene Originaleintr\xE4ge \xFCbersprungen.`);
          });
        }), c(A ? "Meine Aufgaben sichern" : "Forum & Ernte sichern", fe);
      }
      function Tr() {
        let A = e("div", { class: "garden-life-view" }), V = e("div"), B = e("div", { class: "life-tabs", role: "group", "aria-label": "Gartenleben ausw\xE4hlen" }, zo.map(([M, K, Q]) => n([e("span", { "aria-hidden": "true" }, K), e("span", {}, Q)], () => {
          D = M, k("notes");
        }, `life-tab ${D === M ? "active" : ""}`, { "aria-pressed": String(D === M) })));
        return V.append(D === "notes" ? _() : Er(D)), A.append(B, V, l(n("Meine Aufgaben sichern", () => Ar(true), "text-button"), n("Forum & Ernte sichern", () => Ar(false), "text-button"))), A;
      }
      function Pr(A = "tasks") {
        D = A, k("notes");
      }
      function Dl() {
        let A = m(), V = e("div", { class: "home-task-list" }, r("Deine Aufgaben werden geladen \u2026")), B = e("section", { class: "panel home-garden-life" }, e("div", { class: "section-heading" }, e("div", {}, e("p", { class: "eyebrow" }, "HEUTE IM GARTEN"), e("h2", {}, "Deine n\xE4chsten Schritte.")), n("Alle Aufgaben \u2192", () => Pr("tasks"), "text-button")), V, e("div", { class: "home-life-actions" }, n("+ Aufgabe", () => ee(), "button secondary"), n("Familienforum", () => Pr("forum"), "button secondary", { disabled: x().data?.capabilities?.forum === false }), n("Ernte festhalten", () => ie(), "button secondary"))), M = false, K = async () => {
          if (!(M || !A() || !B.isConnected)) {
            M = true;
            try {
              let Q = C(await $().from("rg_tasks").select("*").eq("family_id", w()).eq("created_by", P()).eq("status", "offen").lte("due_date", mt()).order("due_date").order("id").limit(3));
              A() && B.isConnected && V.replaceChildren(...Q.length ? Q.map((X) => n([e("span", {}, X.title), e("span", { class: "muted small" }, _a(X))], () => ee(X), "home-task-link")) : [r("Heute ist keine offene Aufgabe f\xE4llig. Plane deinen n\xE4chsten Gartenschritt.")]);
            } catch {
              A() && B.isConnected && V.replaceChildren(r("Deine Aufgaben konnten gerade nicht geladen werden."), n("Aufgaben \xF6ffnen", () => Pr("tasks"), "text-button"));
            } finally {
              M = false;
            }
          }
        };
        return z(B, K), queueMicrotask(K), B;
      }
      return { view: () => Er("forum"), home: Dl, open: Pr, taskDialog: ee, harvestDialog: ie };
    }
    var td = /* @__PURE__ */ new Set(["Kategorie", "Wasserbedarf", "Boden", "D\xFCnger", "Gie\xDFen", "N\xE4hrstoffbedarf", "Tipp", "Gute Nachbarn", "Schlechte Nachbarn", "Untergruppen", "Typ", "Gruppe", "Aussehen", "Geschmack", "Verwendung", "Lebensdauer", "Schnittzeit", "Schnitt", "Standortwechsel", "Fruchtfolge"]);
    function nd(t = "") {
      let e = { extra: "" }, n = "extra";
      for (let r of t.split(`
`)) {
        let i = r.match(/^([^:]+):\s*(.*)$/);
        i && td.has(i[1]) ? (n = i[1], e[n] = [e[n], i[2]].filter(Boolean).join(`
`)) : e[n] = [e[n], r].filter(Boolean).join(`
`);
      }
      return e;
    }
    function Bo(t = "", e) {
      let n = [...t.matchAll(new RegExp(`(?:^|;\\s*)(${e.join("|")}):\\s*`, "g"))];
      return Object.fromEntries(n.map((r, i) => [r[1], t.slice(r.index + r[0].length, n[i + 1]?.index ?? t.length).trim()]));
    }
    function _n(t) {
      let e = nd(t.care), n = Bo(t.spacing, ["Pflanze", "Reihe"]), r = Bo(t.sowing, ["Anbau", "Vorzucht", "Ins Beet", "Saattiefe"]);
      return { icon: typeof t.legacy_data?.culture?.icon == "string" ? t.legacy_data.culture.icon.slice(0, 16) : St(t)?.icon || rr[t.category] || "\u{1F331}", category: [t.category, e.Kategorie].filter(Boolean).join(" / "), water: e.Wasserbedarf || "", nutrients: e.N\u00E4hrstoffbedarf || "", type: e.Typ || "", group: e.Gruppe || "", appearance: e.Aussehen || "", taste: e.Geschmack || "", use: e.Verwendung || "", location: t.location, knowledge: { ...mn(t), ...Object.fromEntries([["life", "Lebensdauer"], ["cutWhen", "Schnittzeit"], ["cutHow", "Schnitt"], ["move", "Standortwechsel"], ["after", "Fruchtfolge"]].filter(([, i]) => e[i]).map(([i, a]) => [i, e[a]])) }, method: r.Anbau || "", plantSpacing: n.Pflanze || t.spacing, rowSpacing: n.Reihe || "", depth: r.Saattiefe || "", sowing: r.Vorzucht || (Object.keys(r).length ? t.months.map((i) => nr[i - 1]).join(", ") : t.sowing), outdoors: r["Ins Beet"] || "", harvest: t.harvest, watering: e.Gie\u00DFen || "", soil: e.Boden || "", fertilizer: e.D\u00FCnger || "", tip: e.Tipp || "", goodNeighbors: e["Gute Nachbarn"] || "", badNeighbors: e["Schlechte Nachbarn"] || "", extra: e.extra };
    }
    function Lo(t, e) {
      let n = e.legacy_data?.culture?.id;
      return t.filter((r) => r.family_id === e.family_id && r.name === e.name && r.category === e.category && (!n || !r.legacy_data?.culture?.id || r.legacy_data.culture.id === n)).sort((r, i) => r.variety.localeCompare(i.variety, "de"));
    }
    function No({ value: t = "", persist: e, active: n = () => true, delay: r = 800 }) {
      let i = t, a = t, s = null, l, c = null, u = false, d = /* @__PURE__ */ new Set(), h = () => ({ value: i, dirty: i !== a, saving: !!c, error: s }), g = () => {
        for (let b of d) b(h());
      }, f = () => {
        clearTimeout(l), l = void 0;
      };
      function m() {
        return f(), c || (i === a || u || !n() ? Promise.resolve() : (s = null, c = (async () => {
          try {
            for (; i !== a && !u && n(); ) {
              let b = i;
              if (await e(b), u || !n()) return;
              a = b;
            }
          } catch (b) {
            throw u || (s = b), b;
          } finally {
            c = null, g();
          }
        })(), g(), c));
      }
      return { state: h, set(b) {
        u || (i = b, s = null, f(), g(), l = setTimeout(() => m().catch(() => {
        }), r));
      }, reset(b) {
        if (c) throw new Error("Die Notiz wird gerade gespeichert.");
        f(), i = a = b, s = null, g();
      }, subscribe(b) {
        return d.add(b), b(h()), () => d.delete(b);
      }, flush: m, dispose() {
        u = true, f(), d.clear(), i = a = "";
      } };
    }
    var lr = [{ id: "spring", name: "Fr\xFChling", icon: "\u{1F331}", palette: "Frisches Gr\xFCn & neue Bl\xFCten", color: "#14261c", tag: "ALLES DARF WACHSEN", title: `Ein neuer Anfang.
Mitten im Gr\xFCnen.`, description: "Die ersten Triebe, frische Ideen und ein Gartenjahr voller M\xF6glichkeiten. Sch\xF6n, dass ihr zusammen g\xE4rtnert.", art: ["\u{1F33F}", "\u{1F331}"] }, { id: "summer", name: "Sommer", icon: "\u2600\uFE0F", palette: "Sonniges Gold & Olivgr\xFCn", color: "#252e1a", tag: "SONNENTAGE IM GARTEN", title: `Ein kleiner Garten.
Voller Leben.`, description: "Zwischen Bl\xFCten und Lieblingspl\xE4tzen wachsen die besten Momente. Behaltet eure Pflanzen und die n\xE4chste Ernte im Blick.", art: ["\u{1F33B}", "\u{1F33E}"] }, { id: "autumn", name: "Herbst", icon: "\u{1F342}", palette: "Warmes Kupfer & Erdt\xF6ne", color: "#2a221b", tag: "GOLDENE STUNDEN DRAUSSEN", title: `Gutes ernten.
Neues im Herzen tragen.`, description: "Haltet fest, was gut gewachsen ist. Sammelt eure Lieblingssorten und Ideen f\xFCr alles, was noch kommt.", art: ["\u{1F342}", "\u{1F341}"] }, { id: "winter", name: "Winter", icon: "\u2744\uFE0F", palette: "K\xFChles Eisblau & Tannent\xF6ne", color: "#152936", tag: "ZEIT F\xDCR RUHE & IDEEN", title: `Drau\xDFen wird es still.
Eure Ideen wachsen weiter.`, description: "Ein guter Platz f\xFCr Gartenpl\xE4ne, Erinnerungen und die Vorfreude auf das n\xE4chste Gr\xFCn.", art: ["\u{1F332}", "\u2744\uFE0F"] }], jo = () => `ramonas-garten-season:${document.documentElement.dataset.base || "/"}`;
    function Go() {
      let t;
      try {
        t = localStorage.getItem(jo());
      } catch {
      }
      let e = (/* @__PURE__ */ new Date()).getMonth(), n = e < 2 || e === 11 ? "winter" : e < 5 ? "spring" : e < 8 ? "summer" : "autumn";
      return lr.find((r) => r.id === t) || lr.find((r) => r.id === n);
    }
    function Sa(t, { persist: e = true } = {}) {
      let n = lr.find((r) => r.id === t);
      if (!n) throw new Error("Unbekannte Jahreszeit.");
      if (document.documentElement.dataset.season = n.id, document.querySelector('meta[name="theme-color"]')?.setAttribute("content", n.color), e) try {
        localStorage.setItem(jo(), n.id);
      } catch {
      }
      return n;
    }
    var Ea = ["", "vorne", "links", "rechts", "hinten", "vorne rechts", "hinten rechts", "vorne links", "hinten links", "Mitte rechts", "Mitte links", "mittig"];
    function Fo(t = "") {
      if (!Ea.includes(t)) throw new Error("Bitte eine g\xFCltige Position im Beet ausw\xE4hlen.");
      return t;
    }
    var Uo = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, Jt = (t, e, n = false) => {
      if (typeof t != "string" || t.length > e || n && !t.trim()) throw new Error("Die Sicherung enth\xE4lt ung\xFCltige Textfelder.");
      return t.trim();
    }, Rt = (t, e, n, r = false) => {
      if (r && (t == null || t === "")) return null;
      if (!Number.isInteger(t) || t < e || t > n) throw new Error("Die Sicherung enth\xE4lt ung\xFCltige Mengen oder Ma\xDFe.");
      return t;
    }, Mo = (t) => JSON.stringify([t.name.trim().toLocaleLowerCase("de"), (t.variety || "").trim().toLocaleLowerCase("de"), t.category]);
    function Ko(t, e = { plants: [], beds: [], plantings: [], notes: [] }) {
      if (!t || t.format !== "ramonas-garten" || ![1, 2].includes(t.version)) throw new Error("Bitte eine Gartensicherung im unterst\xFCtzten JSON-Format ausw\xE4hlen.");
      let n = {};
      for (let w of ["plants", "beds", "plantings", "notes"]) {
        if (!Array.isArray(t[w]) || t[w].length > 9999) throw new Error("Die Sicherung ist unvollst\xE4ndig oder zu gro\xDF.");
        let P = /* @__PURE__ */ new Set();
        n[w] = t[w].map((F) => {
          if (!F || typeof F != "object" || !Uo.test(F.id) || P.has(F.id)) throw new Error("Die Sicherung enth\xE4lt fehlende oder doppelte IDs.");
          return P.add(F.id), F;
        });
      }
      let r = n.plants.map((w) => {
        let P = { id: w.id, ...yn(w) };
        if (w.legacy_data != null) {
          if (typeof w.legacy_data != "object" || Array.isArray(w.legacy_data) || JSON.stringify(w.legacy_data).length > 5e4) throw new Error("Die Sicherung enth\xE4lt ung\xFCltige Katalogdaten.");
          P.legacy_data = w.legacy_data;
        }
        if (w.photo_path != null) {
          if (typeof w.photo_path != "string" || !/^[-0-9a-f]{36}\/[-0-9a-f]{36}\.jpg$/.test(w.photo_path)) throw new Error("Die Sicherung enth\xE4lt einen ung\xFCltigen Fotoverweis.");
          P.photo_path = w.photo_path;
        }
        return P;
      }), i = n.beds.map((w) => {
        let P = Rt(w.layout_x_cm, 0, 5e4, true), F = Rt(w.layout_y_cm, 0, 5e4, true);
        if (P === null != (F === null)) throw new Error("Die Sicherung enth\xE4lt eine unvollst\xE4ndige Beetposition.");
        let z = P === null ? "unset" : w.layout_source ?? "manual";
        if (!["unset", "manual", "ai"].includes(z)) throw new Error("Die Sicherung enth\xE4lt einen ung\xFCltigen Lageplan-Verweis.");
        return { id: w.id, name: Jt(w.name, 100, true), description: Jt(w.description ?? "", 1e3), width_cm: Rt(w.width_cm, 10, 1e4, true), length_cm: Rt(w.length_cm, 10, 1e4, true), photo_path: w.photo_path ?? null, layout_x_cm: P, layout_y_cm: F, rotation_deg: Rt(w.rotation_deg ?? 0, 0, 359), layout_source: z };
      });
      if (i.some((w) => w.photo_path !== null && (typeof w.photo_path != "string" || !/^[-0-9a-f]{36}\/[-0-9a-f]{36}\.jpg$/.test(w.photo_path)))) throw new Error("Die Sicherung enth\xE4lt einen ung\xFCltigen Beetfotoverweis.");
      let a = new Set(r.map((w) => w.id)), s = new Set(i.map((w) => w.id)), l = n.plantings.map((w) => {
        if (!a.has(w.plant_id) || !s.has(w.bed_id) || !["geplant", "ges\xE4t", "gepflanzt", "geerntet"].includes(w.status)) throw new Error("Die Sicherung enth\xE4lt eine ung\xFCltige Beetzuweisung.");
        return { id: w.id, plant_id: w.plant_id, bed_id: w.bed_id, status: w.status, position: Fo(w.position ?? ""), season_year: Rt(w.season_year ?? (/* @__PURE__ */ new Date()).getFullYear(), 2e3, 2100), quantity: Rt(w.quantity ?? 1, 1, 1e4) };
      }), c = n.notes.map((w) => {
        if (w.plant_id != null && !a.has(w.plant_id)) throw new Error("Eine Notiz verweist auf eine fehlende Pflanze.");
        return { id: w.id, title: Jt(w.title, 150, true), content: Jt(w.content, 12e3, true), plant_id: w.plant_id ?? null };
      }), u = /* @__PURE__ */ new Set();
      if (t.events !== void 0 && (!Array.isArray(t.events) || t.events.length > 2e3)) throw new Error("Die Sicherung enth\xE4lt ung\xFCltige Kalenderdaten.");
      let d = (t.events || []).map((w) => {
        if (!w || !Uo.test(w.id) || u.has(w.id) || w.plant_id != null && !a.has(w.plant_id) || w.bed_id != null && !s.has(w.bed_id) || !ui.includes(w.task)) throw new Error("Die Sicherung enth\xE4lt einen ung\xFCltigen Gartentermin.");
        if (u.add(w.id), w.event_time !== null && (typeof w.event_time != "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d:00$/.test(w.event_time))) throw new Error("Die Sicherung enth\xE4lt eine ung\xFCltige Terminzeit.");
        let P = { id: w.id, title: Jt(w.title, 240, true), event_date: w.event_date, event_time: w.event_time, duration: Rt(w.duration, 5, 480), reminder: w.reminder, description: Jt(w.description ?? "", 5e3), notes: Jt(w.notes ?? "", 1e3), task: w.task, plant_id: w.plant_id ?? null, bed_id: w.bed_id ?? null };
        return Vt({ title: P.title, date: P.event_date, time: P.event_time?.slice(0, 5) ?? null, duration: P.duration, reminder: P.reminder, description: P.description }), P;
      }), h = new Map(e.plants.map((w) => [Mo(w), w.id])), g = new Map(e.beds.map((w) => [w.name.trim().toLocaleLowerCase("de"), w.id])), f = /* @__PURE__ */ new Map(), m = /* @__PURE__ */ new Map(), b = 0, v = 0;
      for (let w of r) {
        let P = Mo(w);
        h.has(P) || (b++, h.set(P, w.id)), f.set(w.id, h.get(P));
      }
      for (let w of i) {
        let P = w.name.toLocaleLowerCase("de");
        g.has(P) || (v++, g.set(P, w.id)), m.set(w.id, g.get(P));
      }
      let y = new Set(e.plantings.map((w) => JSON.stringify([w.plant_id, w.bed_id, w.season_year ?? (/* @__PURE__ */ new Date()).getFullYear()]))), k = 0;
      for (let w of l) {
        let P = JSON.stringify([f.get(w.plant_id), m.get(w.bed_id), w.season_year]);
        y.has(P) || (k++, y.add(P));
      }
      let _ = new Set(e.notes.map((w) => w.plant_id ? `plant:${w.plant_id}` : JSON.stringify([w.title, w.content]))), T = 0;
      for (let w of c) {
        let P = w.plant_id ? `plant:${f.get(w.plant_id)}` : JSON.stringify([w.title, w.content]);
        _.has(P) || (T++, _.add(P));
      }
      let I = (w) => JSON.stringify([w.title, w.event_date, w.event_time, w.duration, w.reminder, w.description, w.notes || "", w.task, w.plant_id, w.bed_id]), D = new Set((e.events || []).map(I)), x = 0;
      for (let w of d) {
        let P = I({ ...w, plant_id: f.get(w.plant_id) || null, bed_id: m.get(w.bed_id) || null });
        D.has(P) || (x++, D.add(P));
      }
      return { backup: { format: "ramonas-garten", version: 2, family: typeof t.family == "string" ? t.family.slice(0, 100) : "", plants: r, beds: i, plantings: l, notes: c, events: d }, summary: { plants: b, beds: v, plantings: k, notes: T, events: x, photos: r.filter((w) => w.photo_path).length + i.filter((w) => w.photo_path).length } };
    }
    function zt(t = {}) {
      let e = (a, s, l) => {
        if (!Number.isInteger(a) || a < s || a > l) throw new Error("Ung\xFCltige Ma\xDFe oder Positionen im Lageplan.");
        return a;
      }, n = e(t.width_cm ?? 2e3, 50, 5e4), r = e(t.length_cm ?? 3e3, 50, 5e4), i = t.features ?? [];
      if (!Array.isArray(i) || i.length > 50) throw new Error("Zu viele Elemente im Lageplan.");
      return { width_cm: n, length_cm: r, features: i.map((a, s) => {
        if (!a || typeof a.label != "string" || a.label.length > 80 || !["path", "building", "tree", "lawn", "other"].includes(a.kind)) throw new Error("Ung\xFCltiges Element im Lageplan.");
        return { id: String(s), label: a.label, kind: a.kind, x_cm: e(a.x_cm, 0, 5e4), y_cm: e(a.y_cm, 0, 5e4), width_cm: e(a.width_cm, 10, 5e4), length_cm: e(a.length_cm, 10, 5e4), rotation_deg: e(a.rotation_deg ?? 0, 0, 359) };
      }) };
    }
    function Aa(t, e) {
      if (!Array.isArray(t) || t.length > 1e3) throw new Error("Ung\xFCltige Beetpositionen.");
      let n = new Set(e.map((i) => i.id)), r = /* @__PURE__ */ new Set();
      return t.map((i) => {
        if (!n.has(i.bed_id) || r.has(i.bed_id)) throw new Error("Der Plan enth\xE4lt unbekannte oder doppelte Beete.");
        r.add(i.bed_id);
        for (let a of ["x_cm", "y_cm"]) if (!Number.isInteger(i[a]) || i[a] < 0 || i[a] > 5e4) throw new Error("Ung\xFCltige Beetposition.");
        for (let a of ["width_cm", "length_cm"]) if (!Number.isInteger(i[a]) || i[a] < 10 || i[a] > 1e4) throw new Error("Ung\xFCltige Beetma\xDFe.");
        if (!Number.isInteger(i.rotation_deg ?? 0) || (i.rotation_deg ?? 0) < 0 || (i.rotation_deg ?? 0) > 359) throw new Error("Ung\xFCltige Beetausrichtung.");
        return { bed_id: i.bed_id, x_cm: i.x_cm, y_cm: i.y_cm, width_cm: i.width_cm, length_cm: i.length_cm, rotation_deg: i.rotation_deg ?? 0 };
      });
    }
    var rd = "http://www.w3.org/2000/svg";
    function qe(t, e = {}, n) {
      let r = document.createElementNS(rd, t);
      for (let [i, a] of Object.entries(e)) r.setAttribute(i, String(a));
      return n != null && (r.textContent = n), r;
    }
    function gi({ layout: t, beds: e, onBed: n = () => {
    }, onDraw: r = null, drawing: i = () => false }) {
      let a = zt(t), s = `grid-${crypto.randomUUID()}`, l = qe("svg", { viewBox: `0 0 ${a.width_cm} ${a.length_cm}`, role: "img", "aria-label": `Lageplan, ${a.width_cm / 100} mal ${a.length_cm / 100} Meter Zeichenfl\xE4che`, class: "garden-map-svg", preserveAspectRatio: "xMidYMid meet" }), c = qe("defs"), u = qe("pattern", { id: s, width: 100, height: 100, patternUnits: "userSpaceOnUse" });
      u.append(qe("path", { d: "M 100 0 L 0 0 0 100", fill: "none", stroke: "var(--line)", "stroke-width": 2 })), c.append(u), l.append(c, qe("rect", { width: a.width_cm, height: a.length_cm, fill: "var(--paper-raised)" }), qe("rect", { width: a.width_cm, height: a.length_cm, fill: `url(#${s})` }));
      for (let d of a.features) {
        let h = qe("g", { transform: `rotate(${d.rotation_deg} ${d.x_cm + d.width_cm / 2} ${d.y_cm + d.length_cm / 2})` });
        h.append(qe("rect", { x: d.x_cm, y: d.y_cm, width: d.width_cm, height: d.length_cm, rx: d.kind === "tree" ? Math.min(d.width_cm, d.length_cm) / 2 : 10, class: `map-feature map-${d.kind}` })), h.append(qe("title", {}, `${d.label} \xB7 ungepr\xFCftes Planelement`)), l.append(h);
      }
      if (e.forEach((d, h) => {
        let g = d.layout_x_cm != null && d.layout_y_cm != null, f = g ? d.layout_x_cm : 100 + h % 4 * 350, m = g ? d.layout_y_cm : 100 + Math.floor(h / 4) * 400, b = d.width_cm || 150, v = d.length_cm || 250, y = qe("g", { class: `map-bed ${g ? "placed" : "unplaced"}`, transform: `rotate(${d.rotation_deg || 0} ${f + b / 2} ${m + v / 2})`, role: "button", tabindex: 0, "aria-label": `${d.name}${g ? "" : " \u2013 Position noch offen"}`, "data-bed": d.id });
        y.append(qe("rect", { x: f, y: m, width: b, height: v, rx: 12 }), qe("text", { x: f + b / 2, y: m + v / 2, "text-anchor": "middle", "dominant-baseline": "middle", "font-size": Math.max(40, Math.min(b, v) / 3) }, h + 1), qe("title", {}, `${d.name} \xB7 ${b / 100} \xD7 ${v / 100} m${g ? "" : " \xB7 ungef\xE4hre Ablageposition"}`)), y.addEventListener("click", () => {
          i() || n(d);
        }), y.addEventListener("keydown", (k) => {
          ["Enter", " "].includes(k.key) && (k.preventDefault(), n(d));
        }), l.append(y);
      }), r) {
        let d = null, h = null, g = (b) => {
          let v = l.getScreenCTM();
          if (!v) return null;
          let y = new DOMPoint(b.clientX, b.clientY).matrixTransform(v.inverse());
          return { x: Math.max(0, Math.min(a.width_cm, Math.round(y.x))), y: Math.max(0, Math.min(a.length_cm, Math.round(y.y))) };
        }, f = (b) => ({ x_cm: Math.min(d.x, b.x), y_cm: Math.min(d.y, b.y), width_cm: Math.abs(b.x - d.x), length_cm: Math.abs(b.y - d.y) });
        l.addEventListener("pointerdown", (b) => {
          !i() || b.button !== 0 || b.target.closest("[data-bed]") || (d = g(b), d && (b.preventDefault(), l.setPointerCapture(b.pointerId), l.dataset.drawing = "true", h = qe("rect", { class: "map-draw-preview", x: d.x, y: d.y, width: 0, height: 0 }), l.append(h)));
        }), l.addEventListener("pointermove", (b) => {
          if (!d) return;
          let v = g(b);
          if (!v) return;
          let y = f(v);
          for (let [k, _] of Object.entries({ x: y.x_cm, y: y.y_cm, width: y.width_cm, height: y.length_cm })) h.setAttribute(k, String(_));
        });
        let m = (b, v = false) => {
          if (!d) return;
          let y = g(b), k = y ? f(y) : null;
          d = null, h?.remove(), h = null, delete l.dataset.drawing, l.hasPointerCapture(b.pointerId) && l.releasePointerCapture(b.pointerId), !v && k && k.width_cm >= 20 && k.length_cm >= 20 && r(k);
        };
        l.addEventListener("pointerup", (b) => m(b)), l.addEventListener("pointercancel", (b) => m(b, true));
      }
      return l;
    }
    var cr = (t) => t.split("|").map((e) => e.trim().replace(" / ", `
`)), id = cr("Mit jedem Blatt / w\xE4chst eine Geschichte.|Ein Garten w\xE4chst / auch mit Geduld.|Kleine Schritte. / Lebendiges Gr\xFCn.|Wer g\xE4rtnert, findet / immer einen Anfang.|Ein bisschen Erde. / Ein gro\xDFes Gl\xFCck.|Hier ist Platz / f\xFCr gute Gedanken.|Zwischen den Beeten / wird der Alltag leiser.|Aus einer kleinen Idee / kann viel wachsen.|Jedes Beet erz\xE4hlt / auf seine eigene Art.|Ein Garten schenkt / mehr als eine Ernte.|Manchmal beginnt Gl\xFCck / mit schmutzigen H\xE4nden.|Ein guter Tag / f\xFCr einen Blick ins Gr\xFCne.|Was du mit Liebe pflegst, / macht deinen Garten aus.|Im eigenen Tempo / w\xE4chst es sich gut.|Natur braucht Zeit. / Wir d\xFCrfen sie genie\xDFen.|Ein St\xFCckchen Garten. / Ein St\xFCckchen Zuhause."), ad = { winter: cr("Auch in der Ruhe / w\xE4chst Vorfreude.|Unter stillen Beeten / warten neue Anf\xE4nge.|Drau\xDFen wird es leiser. / Die Ideen bleiben wach.|Ein Wintertag. / Ein neuer Gartenplan.|Noch ruht die Erde. / Die Vorfreude w\xE4chst.|Zwischen Frost und Stille / wohnt ein neuer Anfang.|Der Garten macht Pause. / Die Tr\xE4ume wachsen weiter.|Heute wird geplant, / morgen wird es gr\xFCn.|Ein leeres Beet / ist noch kein leeres Blatt.|Winterlicht macht / kleine Dinge sichtbar.|Unter kahlen Zweigen / bleibt Platz f\xFCr Hoffnung.|Die n\xE4chste Bl\xFCte / beginnt mit Vorfreude.|Ein Blick ins Saatgut. / Ein Gedanke an den Fr\xFChling.|Auch ein ruhender Garten / steckt voller Leben.|Was im Winter reift, / ist manchmal eine Idee.|Die Beete ruhen. / Die Fantasie zieht weiter.|Zwischen Schnee und Erde / schlummert ein Gartenjahr.|Ein hei\xDFer Tee. / Ein gr\xFCner Gedanke.|Zeit f\xFCr Erinnerungen / an sonnige Gartentage.|Im stillen Garten / wachsen gro\xDFe Pl\xE4ne.|Der Winter schenkt Raum / f\xFCr neue M\xF6glichkeiten.|Auch kahle \xC4ste / k\xF6nnen sch\xF6n erz\xE4hlen.|Heute z\xE4hlen Ideen / statt voller Erntek\xF6rbe.|Ein Gartenjahr endet. / Die Neugier bleibt.|Noch ist es still / vor dem n\xE4chsten Gr\xFCn.|Im Saatgut steckt / ein kleines Versprechen.|Der Garten schl\xE4ft / in seinem eigenen Rhythmus.|Das n\xE4chste Gartenjahr / beginnt auf dem Papier.|Ein freies Beet. / Tausend M\xF6glichkeiten.|Wo jetzt Ruhe liegt, / kann sp\xE4ter Leben wachsen.|Wintertage sind / auch Gartentage.|Ein Plan im Warmen. / Vorfreude aufs Drau\xDFen.|Die Ruhe der Natur / muss nichts beweisen.|Ein stiller Moment / zwischen zwei Gartenjahren.|Auch ohne Bl\xFCten / bleibt der Garten Zuhause.|Kalte Luft. / Warme Gartengedanken.|Der Fr\xFChling darf warten. / Die Freude ist schon da.|Ein Samen in der Hand. / Ein Garten im Kopf.|Heute darf der Garten / einfach nur sein.|Leise Tage / geben Ideen Raum.|Ein Winterspaziergang / zeigt andere Gartenseiten.|Die Erde ruht. / Unsere Neugier nicht.|Was gut gewachsen ist, / bleibt in Erinnerung.|Ein neues Gartenjahr / darf langsam beginnen.|Unter dem Winterhimmel / ist Platz f\xFCr Vorfreude.|Auch Pausen geh\xF6ren / zum Wachsen dazu.|Der Garten sammelt Ruhe. / Wir sammeln Ideen.|Aus Wintergedanken / werden Fr\xFChlingspl\xE4ne."), spring: cr("Ein neuer Trieb. / Ein kleiner Grund zur Freude.|Mit dem ersten Gr\xFCn / beginnt die Vorfreude.|Der Fr\xFChling \xF6ffnet / die Gartent\xFCr.|Ein Samenkorn. / So viele M\xF6glichkeiten.|Heute w\xE4chst / ein kleines St\xFCck Hoffnung.|Zwischen jungen Bl\xE4ttern / beginnt ein neues Kapitel.|Die Beete werden wach. / Die Ideen auch.|Ein heller Morgen. / Ein gr\xFCner Anfang.|Mit jeder Knospe / kommt der Garten n\xE4her.|Frisches Gr\xFCn / macht Lust auf mehr.|Der erste Keim / braucht keine gro\xDFen Worte.|Hier beginnt / ein neues Gartenjahr.|Ein bisschen Fr\xFChlingsluft / f\xFCr gro\xDFe Gartenpl\xE4ne.|Aus kleinen Samen / werden neue Geschichten.|Ein Beet voller Pl\xE4ne / wartet auf dich.|Der Garten erwacht / Schritt f\xFCr Schritt.|Junge Bl\xE4tter. / Neue M\xF6glichkeiten.|Wer genau hinschaut, / entdeckt den Fr\xFChling.|Ein erster Trieb / ver\xE4ndert den ganzen Blick.|Die Erde duftet / nach einem neuen Anfang.|Mit dem Fr\xFChling / zieht Zuversicht ein.|Ein kleiner Keim / macht gro\xDFe Freude.|Noch ist vieles klein. / Die Freude ist es nicht.|Im frischen Gr\xFCn / steckt ein neuer Rhythmus.|Ein Gartenanfang / darf ganz einfach sein.|Die ersten Bl\xFCten / machen den Tag heller.|Zwischen Knospen / w\xE4chst die Neugier.|Der Fr\xFChling bringt / Bewegung in die Beete.|Ein neues Blatt / ist ein sch\xF6ner Anfang.|Bunte Ideen / treffen auf frische Erde.|Das Gartenjahr / bekommt wieder Farbe.|Aus Vorfreude / wird langsam Gr\xFCn.|Ein Morgen im Garten. / Ein frischer Gedanke.|Jeder junge Trieb / hat seinen eigenen Weg.|Mit offenen Augen / w\xE4chst die Fr\xFChlingsfreude.|Ein Samenkorn passt / in jede gro\xDFe Idee.|Der Garten zeigt / seine ersten Zeilen.|Wo gestern Erde war, / kann heute ein Keim stehen.|Zwischen Regen und Licht / w\xE4chst der Fr\xFChling.|Ein Anfang muss / noch nicht perfekt sein.|Die erste Bl\xFCte / ist immer besonders.|Fr\xFChlingsluft / macht Platz f\xFCr neue Ideen.|Langsam wird / aus einem Plan ein Beet.|Jede Knospe erz\xE4hlt / vom Weiterwachsen.|Ein bisschen Sonne. / Ein neuer Gartengedanke.|Wachsendes Gr\xFCn / macht den Alltag heller.|Hier w\xE4chst / die Freude aufs Gartenjahr.|Der Fr\xFChling erinnert: / Anfangen lohnt sich."), summer: cr("Ein Garten voller Leben. / Ein Tag zum Genie\xDFen.|Zwischen Bl\xFCten / summt der Sommer.|Ein reifer Moment / mitten im Gr\xFCnen.|Sonnenlicht f\xE4llt / auf kleine Gartengl\xFCcke.|Der Sommer schmeckt / nach dem eigenen Garten.|Ein Schattenplatz. / Ein Blick auf volle Beete.|Heute darf die Ernte / auch Freude machen.|Ein Blatt im Licht. / Ein stiller Sommermoment.|Zwischen warmen Tagen / w\xE4chst die Gartengeschichte.|Bunte Beete / machen den Sommer reicher.|Ein voller Erntekorb / beginnt im Kleinen.|Sommerluft / zwischen Bl\xE4ttern und Bl\xFCten.|Ein Gartenmorgen / ist ein guter Tagesanfang.|Der sch\xF6nste Sommerplatz / liegt manchmal vor der T\xFCr.|Was jetzt bl\xFCht, / macht den Tag bunter.|Ein bisschen Schatten / geh\xF6rt zum Sommergl\xFCck.|Hier w\xE4chst / der Geschmack des Sommers.|Zwischen Bl\xE4ttern / verstecken sich Erntemomente.|Ein warmer Abend. / Ein ruhiger Garten.|Die Beete stehen / mitten im Gartenjahr.|Sommerfarben / brauchen keine Eile.|Ein Beet voller Leben / ist ein kleiner Kosmos.|Heute z\xE4hlt / der Blick auf das Gewachsene.|Ein Garten erz\xE4hlt / in vielen Gr\xFCnt\xF6nen.|Sonnige Erinnerungen / wachsen ganz nebenbei.|Ein reifer Bissen / aus dem eigenen Beet.|Der Sommer l\xE4dt ein: / Schau genauer hin.|Ein offenes Fenster. / Der Garten ganz nah.|Zwischen Bl\xFCten und Ruhe / findet der Sommer Platz.|Ein Erntetag / ist auch ein Freudentag.|Jedes Beet hat / seinen eigenen Sommer.|Aus Fr\xFChlingsideen / ist Sommergr\xFCn geworden.|Ein schmaler Gartenweg. / Ein weiter Blick ins Gr\xFCne.|Wenn der Garten summt, / lohnt sich eine Pause.|Die kleinen Ernten / sind oft die sch\xF6nsten.|Sommer im Garten / darf einfach sein.|Ein Blatt bewegt sich. / Der Alltag h\xE4lt kurz an.|Hier duftet es / nach einem guten Gartentag.|Zwischen Beeten / sammeln sich Sommermomente.|Ein sonniger Tag / f\xFCr kleine Entdeckungen.|Manches Gl\xFCck w\xE4chst / direkt vor unseren Augen.|Der Garten tr\xE4gt / seine Sommerfarben.|Ein guter Moment / f\xFCr einen Platz im Schatten.|Heute ist Zeit / f\xFCr das Gewachsene.|Mitten im Sommer / bleibt Raum f\xFCr neue Ideen.|Ein gr\xFCner Abend / nach einem langen Tag.|Aus kleinen Trieben / wurden Sommergeschichten.|Der Sommer schenkt / Momente zum Festhalten."), autumn: cr("Gutes ernten. / Neues im Herzen tragen.|Goldene Bl\xE4tter. / Kostbare Gartentage.|Im Herbst wird sichtbar, / was \xFCbers Jahr gewachsen ist.|Ein letzter Erntekorb. / Viele neue Ideen.|Der Garten wird leiser. / Die Erinnerungen bleiben.|Zwischen buntem Laub / w\xE4chst die Vorfreude weiter.|Herbstlicht macht / vertraute Beete besonders.|Ein Blatt f\xE4llt. / Eine neue Idee bleibt.|Heute sammeln wir / mehr als nur die Ernte.|Was gut gewachsen ist, / darf gefeiert werden.|Ein Gartenjahr / voller kleiner Entdeckungen.|Goldene Stunden / zwischen den Beeten.|Der Herbst erz\xE4hlt / von einem reichen Jahr.|Ein ruhiger Morgen / im bunten Garten.|Die Farben wechseln. / Die Freude bleibt.|Zwischen Laub und Erde / liegt ein neuer Anfang.|Jede Ernte erz\xE4hlt / von vielen kleinen Schritten.|Ein Beet macht Pause. / Eine Idee w\xE4chst weiter.|Herbsttage laden ein, / genauer hinzusehen.|Ein Gartenjahr / passt in viele Erinnerungen.|Die letzte Bl\xFCte / hat ihren eigenen Zauber.|Bunte Bl\xE4tter / machen den Abschied leichter.|Ein Herbstspaziergang / durch das eigene Gartenjahr.|Die Erde bleibt. / Die Jahreszeit zieht weiter.|Ein guter Moment, / das Gewachsene festzuhalten.|Zwischen reifen Fr\xFCchten / und neuen Pl\xE4nen.|Der Garten legt / seine Herbstfarben an.|Ein voller Korb. / Ein dankbarer Blick.|Manche Gartensch\xE4tze / zeigen sich erst im Herbst.|Der Herbst schenkt / Zeit zum Zur\xFCckschauen.|Ein Blatt im Wind. / Ein Gedanke ans n\xE4chste Jahr.|Aus Sommergr\xFCn / werden Herbstgeschichten.|Die Tage werden k\xFCrzer. / Die Ideen bleiben gro\xDF.|Ein bisschen Herbstlicht / f\xFCr die Gartenseele.|Heute darf / auch das Bewahren z\xE4hlen.|Zwischen alten Bl\xE4ttern / beginnt die n\xE4chste Geschichte.|Was wir geerntet haben, / bleibt nicht nur im Korb.|Der Garten ver\xE4ndert sich. / Die Verbundenheit bleibt.|Ein sp\xE4tes Bl\xFChen / macht den Herbst besonders.|Zeit, die Lieblingssorten / in Erinnerung zu behalten.|Ein gutes Gartenjahr / hat viele leise Momente.|Goldenes Licht / auf vertrauten Wegen.|Die Beete erz\xE4hlen / vom vergangenen Sommer.|Ein Herbsttag / voller kleiner Gartensch\xE4tze.|Der Wandel geh\xF6rt / zum Garten dazu.|Auch im Loslassen / steckt ein neuer Anfang.|Heute ernten wir Freude. / Morgen neue Ideen.|Ein ruhiger Garten / ist noch lange nicht leer.") }, sd = [["Januar", "winter", "Der Garten darf ruhen. Jetzt ist Platz f\xFCr Saatgut, Erinnerungen und neue Beetpl\xE4ne."], ["Februar", "winter", "Das Licht kehrt langsam zur\xFCck. Lass deinen Gartenpl\xE4nen Zeit zum Wachsen."], ["M\xE4rz", "spring", "Die ersten Fr\xFChlingszeichen sind da. Entdecke, was in deinem Garten wieder wach wird."], ["April", "spring", "Zwischen Sonne und Regenschauern ver\xE4ndert sich der Garten fast jeden Tag."], ["Mai", "spring", "Frisches Gr\xFCn und neue Bl\xFCten laden dazu ein, die Beete mit offenen Augen zu begleiten."], ["Juni", "summer", "Lange Tage geben Raum f\xFCr Gartenfreude, kleine Pausen und neue Entdeckungen."], ["Juli", "summer", "Mitten im Sommer lohnt sich der Blick auf Bl\xFCten, junge Fr\xFCchte und kleine Ernten."], ["August", "summer", "Genie\xDFe die Sommerf\xFClle und halte fest, welche Sorten dir besonders Freude machen."], ["September", "autumn", "Erntezeit und erste Herbstfarben gehen ineinander \xFCber. Sammle deine liebsten Gartenmomente."], ["Oktober", "autumn", "Buntes Laub, sp\xE4te Ernten und neue Ideen begleiten den Garten durch den Herbst."], ["November", "autumn", "Der Garten wird ruhiger. Bewahre die Erfahrungen und Erinnerungen dieses Gartenjahres."], ["Dezember", "winter", "Zwischen stillen Beeten bleibt Zeit f\xFCr R\xFCckblicke und die Vorfreude auf das n\xE4chste Gr\xFCn."]], qo = Object.fromEntries(Object.entries(ad).map(([t, e]) => [t, [...e.map((n, r) => ({ id: `${t}:${r}`, title: n })), ...id.map((n, r) => ({ id: `all:${r}`, title: n }))]])), od = new Set(Object.values(qo).flat().map((t) => t.id)), ld = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit" });
    function Wo({ storage: t = null, storageKey: e = "ramonas-garten-sayings", random: n = Math.random } = {}) {
      let r = { current: null, history: [] }, i = () => {
        try {
          let a = JSON.parse(t?.getItem(e) || "null");
          r = a?.version === 1 && Array.isArray(a.history) ? a : { current: null, history: [] };
        } catch {
          r = { current: null, history: [] };
        }
      };
      return i(), { reload: i, current(a = /* @__PURE__ */ new Date()) {
        let s = a.getTime();
        if (!Number.isFinite(s)) throw new Error("Ung\xFCltiges Datum f\xFCr den Gartenspruch.");
        let l = ld.formatToParts(a), c = Number(l.find((w) => w.type === "month").value) - 1, u = l.find((w) => w.type === "year").value, [d, h, g] = sd[c], f = `${u}-${c}`, m = qo[h], b = (w) => ({ ...w, month: c + 1, season: h, tag: `${d} im Garten`, description: g }), v = m.find((w) => w.id === r.current?.id), y = r.current?.shownAt;
        if (v && r.current.period === f && Number.isFinite(y) && s >= y && s - y < 3e5) return b(v);
        let k = r.history.filter((w) => w && od.has(w.id) && Number.isFinite(w.shownAt) && w.shownAt <= s && w.shownAt > s - 144e5).slice(-96), _ = new Set(k.map((w) => w.id)), T = m.filter((w) => !_.has(w.id));
        if (!T.length && v) return b(v);
        let I = T.length ? T : m, D = Math.max(0, Math.min(I.length - 1, Math.floor(n() * I.length) || 0)), x = I[D];
        r = { version: 1, current: { id: x.id, period: f, shownAt: s }, history: [...k.filter((w) => w.id !== x.id), { id: x.id, shownAt: s }] };
        try {
          t?.setItem(e, JSON.stringify(r));
        } catch {
        }
        return b(x);
      } };
    }
    var cd = "https://api.open-meteo.com/v1/forecast?latitude=51.4344&longitude=6.7623&current=temperature_2m,apparent_temperature,weather_code&daily=temperature_2m_min,temperature_2m_max&forecast_days=2&timezone=Europe%2FBerlin", Ot = Object.freeze({ latitude: 51.4344, longitude: 6.7623, label: "Duisburg" }), ur = /* @__PURE__ */ new Map(), pi = /* @__PURE__ */ new Map();
    function Ta(t) {
      if (!t || typeof t.latitude != "number" || typeof t.longitude != "number" || !Number.isFinite(t.latitude) || !Number.isFinite(t.longitude) || Math.abs(t.latitude) > 90 || Math.abs(t.longitude) > 180) throw new Error("Der Ger\xE4testandort ist ung\xFCltig.");
      return { latitude: Math.round(t.latitude * 100) / 100, longitude: Math.round(t.longitude * 100) / 100, label: "Aktueller Standort" };
    }
    function Ho(t) {
      return t === 0 ? "\u2600\uFE0F Klar" : t <= 2 ? "\u{1F324}\uFE0F Teilweise bew\xF6lkt" : t === 3 ? "\u2601\uFE0F Bedeckt" : [45, 48].includes(t) ? "\u{1F32B}\uFE0F Nebel" : t >= 51 && t <= 57 ? "\u{1F326}\uFE0F Nieselregen" : t >= 61 && t <= 67 ? "\u{1F327}\uFE0F Regen" : t >= 71 && t <= 77 ? "\u{1F328}\uFE0F Schnee" : t >= 80 && t <= 82 ? "\u{1F326}\uFE0F Regenschauer" : t >= 85 && t <= 86 ? "\u{1F328}\uFE0F Schneeschauer" : t >= 95 ? "\u26C8\uFE0F Gewitter" : "Wetterlage";
    }
    async function Vo({ location: t = Ot, force: e = false, fetcher: n = fetch, now: r = Date.now() } = {}) {
      let i = t === Ot ? t : Ta(t), a = `${i.latitude},${i.longitude}`, s = ur.get(a);
      if (s && r - s.fetchedAt < (e ? 1e4 : 9e5)) return s;
      if (pi.has(a)) return pi.get(a);
      let l = (async () => {
        try {
          let c = new URL(cd);
          c.searchParams.set("latitude", String(i.latitude)), c.searchParams.set("longitude", String(i.longitude)), i !== Ot && c.searchParams.set("timezone", "auto");
          let u = await n(c.href, { cache: "no-store", referrerPolicy: "no-referrer", signal: AbortSignal.timeout(8e3) });
          if (!u.ok) throw new Error("weather");
          let d = await u.json(), h = d.current, g = (v) => typeof v == "number" && Number.isFinite(v) && v >= -80 && v <= 70;
          if (typeof d.timezone != "string" || d.timezone.length > 100) throw new Error("weather");
          try {
            new Intl.DateTimeFormat("de", { timeZone: d.timezone });
          } catch {
            throw new Error("weather");
          }
          if (!g(h?.temperature_2m) || !g(h?.apparent_temperature) || !Number.isInteger(h?.weather_code) || h.weather_code < 0 || h.weather_code > 99 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(h?.time || "")) throw new Error("weather");
          let f = d.daily?.temperature_2m_min, m = d.daily?.temperature_2m_max;
          if (!Array.isArray(f) || !Array.isArray(m) || f.length < 2 || m.length < 2 || ![...f, ...m].every(g)) throw new Error("weather");
          let b = { temperature: h.temperature_2m, feelsLike: h.apparent_temperature, code: h.weather_code, time: h.time, timeZone: d.timezone, min: f[0], max: m[0], tomorrowMin: f[1], fetchedAt: r, stale: false, location: i };
          return ur.set(a, b), ur.size > 8 && ur.delete(ur.keys().next().value), b;
        } catch {
          if (s) return { ...s, stale: true };
          throw new Error(`Wetter f\xFCr ${i.label === "Duisburg" ? "Duisburg" : "deinen Standort"} ist gerade nicht erreichbar.`);
        } finally {
          pi.delete(a);
        }
      })();
      return pi.set(a, l), l;
    }
    var mi = [{ id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash-Lite" }, { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro (Vorschau)" }, { id: "gemini-3.8-flash", label: "Gemini 3.8 Flash" }, { id: "gemini-4-argon", label: "Gemini 4 Argon" }];
    var bi = [{ id: "gpt-5.4-mini", label: "GPT-5.4 mini \xB7 schnell & sparsam" }, { id: "gpt-5.5", label: "GPT-5.5" }, { id: "gpt-6-astra", label: "GPT-6 Astra \xB7 wichtige Fragen", warning: "Hoher Token- und Kostenverbrauch m\xF6glich. Nur f\xFCr wichtige Fragen nutzen." }];
    function Jo(t) {
      let { h: e, button: n, small: r, field: i, formError: a, formAction: s, perform: l, notify: c, container: u, active: d, getToken: h, usersView: g, changePassword: f, recover: m, close: b, refresh: v } = t, y = async (P) => {
        let F = h();
        if (!F) throw new Error("Bitte deinen pers\xF6nlichen Adminbereich erneut entsperren.");
        return C(await $().rpc("rg_admin_console", { unlock_token: F, ...P }));
      }, k = (P = "users") => e("div", { class: "admin-console-nav", role: "group", "aria-label": "Superadminbereich ausw\xE4hlen" }, [["users", "Konten"], ["maintenance", "Wartung"], ["features", "Funktionen"], ["limits", "KI-Limits"], ["security", "Sicherheit"], ["audit", "Protokoll"], ["system", "System"]].map(([F, z]) => n(z, (q) => l(() => F === "users" ? g() : w(F), q.currentTarget), `button secondary ${P === F ? "active" : ""}`, { "aria-pressed": String(P === F) }))), _ = (P, F, z) => {
        let q = e("input", { type: "checkbox", checked: F });
        return { input: q, node: e("label", { class: "consent" }, q, e("span", {}, e("strong", {}, P), z ? r(z) : null)) };
      };
      async function T() {
        let P = async (z) => C(await $().rpc("rg_maintenance", { unlock_token: h(), ...z })), F = await P({});
        d() && u.replaceChildren(k("maintenance"), e("h3", {}, "Web-App vor\xFCbergehend schlie\xDFen"), e("p", { class: "pill", role: "status" }, F.enabled ? "Wartungsmodus aktiv \xB7 Zugang nur f\xFCr den Superadmin" : "Web-App ge\xF6ffnet"), r("Im Wartungsmodus sehen Besucher und andere angemeldete Nutzer die Wartungsseite. Auch ernannte Admins bekommen keinen Gartenzugang. Dein Betreiberkonto kann weiterarbeiten und die App wieder \xF6ffnen."), e("blockquote", { class: "maintenance-preview" }, e("strong", {}, "Wir bearbeiten zurzeit die Web-App."), e("p", {}, "Zugang nur f\xFCr den Superadmin.")), e("details", {}, e("summary", {}, "Was passiert mit offenen Sitzungen?"), r("Neue Datenzugriffe werden serverseitig sofort gesperrt. Ge\xF6ffnete Apps wechseln beim n\xE4chsten Abgleich, normalerweise sp\xE4testens nach 30 Sekunden, auf die Wartungsseite. Ungespeicherte Eingaben vorher sichern. Bereits geladene Inhalte oder Kopien lassen sich nicht zur\xFCckholen. Kalenderabos pausieren w\xE4hrend der Wartung; gespeicherte Daten, Links und Termine bleiben erhalten.")), n(F.enabled ? "Web-App wieder \xF6ffnen" : "Wartungsmodus einschalten", (z) => l(async () => {
          !F.enabled && !confirm("Die App f\xFCr alle au\xDFer deinem Superadmin-Konto schlie\xDFen? Andere Personen sollten ungespeicherte Eingaben vorher sichern.") || (await P({ enabled: !F.enabled, expected_version: F.version }), d() && (await v(), await T(), c(F.enabled ? "Die Web-App ist wieder ge\xF6ffnet." : "Wartungsmodus aktiv. Nur dein Superadmin-Konto hat Zugang.")));
        }, z.currentTarget), "button"));
      }
      async function I(P) {
        let F = await y({ action: "status" });
        if (!d()) return;
        let z = F.settings, q = () => Object.fromEntries(["public_profiles_enabled", "forum_enabled", "ai_enabled", "ai_hour_limit", "ai_day_limit", "models"].map((U) => [U, z[U]])), ne = e("form", {}, a()), R;
        if (P === "features") {
          let U = [["public_profiles_enabled", "\xD6ffentliche Profile", "Unterbindet \xF6ffentliche Profil- und Fotoabrufe. Bereits gespeicherte Kopien bei anderen bleiben bestehen. Beim Einschalten werden zuvor freiwillig ver\xF6ffentlichte Profile wieder erreichbar."], ["forum_enabled", "Familienforum", "Schaltet Lesen und neue Beitr\xE4ge zentral ab. Vorhandene Themen bleiben gespeichert."], ["ai_enabled", "Garten-KI", "Gilt f\xFCr Fragen, T\xFCtchenscanner, Sortenvorschl\xE4ge, Lagepl\xE4ne und Verbindungstests."]].map(([L, oe, ee]) => ({ key: L, ..._(oe, z[L], ee) }));
          ne.append(...U.map((L) => L.node)), R = () => ({ ...q(), ...Object.fromEntries(U.map((L) => [L.key, L.input.checked])) });
        } else {
          let U = i("Anfragen je Familie pro Stunde", "ai_hour_limit", z.ai_hour_limit, { type: "number", required: true, min: 1, max: 200, step: 1 }), L = i("Anfragen je Familie pro 24 Stunden", "ai_day_limit", z.ai_day_limit, { type: "number", required: true, min: 1, max: 2e3, step: 1 }), oe = {};
          ne.append(r("Gemeinsame Grenzen f\xFCr alle Mitglieder und beide Anbieter. Auch Verbindungstests z\xE4hlen. Die Zeitfenster beginnen mit der ersten zugelassenen Anfrage und laufen eine Stunde beziehungsweise 24 Stunden. Abgelehnte Anfragen z\xE4hlen nicht weiter."), U, L);
          for (let [ee, _e, ie] of [["gemini", "Google Gemini", mi], ["openai", "ChatGPT / OpenAI", bi]]) oe[ee] = ie.map((me) => ({ id: me.id, ..._(me.label, z.models[ee].includes(me.id), me.warning) })), ne.append(e("fieldset", { class: "admin-models" }, e("legend", {}, _e), oe[ee].map((me) => me.node)));
          ne.append(r("Ohne angekreuztes Modell ist dieser Anbieter gesperrt. Die Freigabe garantiert keine Verf\xFCgbarkeit beim Anbieter. Anfragelimits sind kein Euro- oder Tokenbudget: verbindliche Ausgabenlimits zus\xE4tzlich beim API-Anbieter setzen.")), R = () => ({ ...q(), ai_hour_limit: Number(U.querySelector("input").value), ai_day_limit: Number(L.querySelector("input").value), models: Object.fromEntries(Object.entries(oe).map(([ee, _e]) => [ee, _e.filter((ie) => ie.input.checked).map((ie) => ie.id)])) });
        }
        ne.append(e("button", { type: "submit", class: "button" }, "Zentrale Einstellungen speichern")), ne.addEventListener("submit", (U) => {
          U.preventDefault();
          let L = R();
          s(ne, async () => {
            await y({ action: "save_settings", payload: L, expected_version: z.version }), d() && (await v(), await I(P), c("Zentrale Einstellungen gespeichert."));
          });
        }), u.replaceChildren(k(P), e("h3", {}, P === "features" ? "Freigaben f\xFCr die ganze Garten-App" : "KI-Modelle & gemeinsame Limits"), ne);
      }
      async function D(P = 0) {
        let F = await y({ action: "audit", page_number: P });
        if (!d()) return;
        let z = { role_changed: "Gartenrolle ge\xE4ndert", member_added: "Mitglied hinzugef\xFCgt", member_removed: "Mitglied entfernt", admin_password_changed: "Admin-Zusatzpasswort ge\xE4ndert", admin_locked: "Adminbereich gesperrt", maintenance_changed: "Wartungsmodus ge\xE4ndert", app_settings_changed: "Zentrale Einstellungen ge\xE4ndert", account_block: "Konto gesperrt", account_unblock: "Konto entsperrt", ai_key_insert: "KI-Zugang hinterlegt", ai_key_update: "KI-Zugang ersetzt", ai_key_delete: "KI-Zugang entfernt" }, q = F.entries || [], ne = e("ul", { class: "admin-user-list" }, q.slice(0, 20).map((R) => e("li", {}, e("div", {}, e("strong", {}, z[R.action] || "Verwaltung ge\xE4ndert"), r(new Date(R.created_at).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })), r(`${R.actor_id ? "Konto " + R.actor_id.slice(0, 8) : "System / gel\xF6schtes Konto"}${R.target_id ? " \u2192 " + R.target_id.slice(0, 8) : ""}`), Object.keys(R.details || {}).length ? e("details", {}, e("summary", {}, "\xC4nderungsdetails"), e("pre", { class: "admin-log-details" }, JSON.stringify(R.details, null, 2))) : null))));
        u.replaceChildren(k("audit"), e("h3", {}, "\xC4nderungsprotokoll"), r("Aufgezeichnet werden Verwaltungs\xE4nderungen ab Aktivierung dieser Funktion. Keine Passw\xF6rter, API-Schl\xFCssel, Fragen oder privaten Beitr\xE4ge. Konto-IDs werden bei Kontol\xF6schung aus dem Protokoll entfernt."), q.length ? ne : r("Bisher keine Verwaltungs\xE4nderungen protokolliert."), e("div", { class: "form-actions" }, n("Vorherige Seite", (R) => l(() => D(P - 1), R.currentTarget), "button secondary", { disabled: P === 0 }), r(`Seite ${P + 1}`), n("N\xE4chste Seite", (R) => l(() => D(P + 1), R.currentTarget), "button secondary", { disabled: q.length <= 20 })));
      }
      async function x() {
        let P = await y({ action: "system" });
        if (!d()) return;
        let F = (z) => `${(Number(z || 0) / 1048576).toLocaleString("de-DE", { maximumFractionDigits: 2 })} MB`;
        u.replaceChildren(k("system"), e("h3", {}, "Systemstatus"), e("dl", { class: "backup-counts" }, [["Programmstand", document.documentElement.dataset.build || "Noch ohne Versionskennung"], ["Server erreichbar", new Date(P.server_time).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })], ["Registrierte Konten", P.users], ["Familieng\xE4rten", P.gardens], ["Gez\xE4hlte KI-Anfragen", P.ai_requests_last_24h_windows]].map(([z, q]) => e("div", {}, e("dt", {}, z), e("dd", {}, String(q))))), r("KI-Z\xE4hler: Summe der noch laufenden 24-Stunden-Fenster. Enth\xE4lt auch beim Anbieter fehlgeschlagene zugelassene Anfragen. Keine Token-, Kosten- oder Abrechnungsdaten."), e("h4", {}, "Fotospeicher"), ...(P.storage || []).map((z) => r(`${z.bucket}: ${z.objects} Dateien \xB7 ${F(z.bytes)}`)), r("Nur die drei Fotospeicher der Garten-App. Gr\xF6\xDFen stammen aus den Dateimetadaten; Datenbankgr\xF6\xDFe, Backups und Anbieterquoten sind darin nicht enthalten."), e("details", {}, e("summary", {}, "Technische Pr\xFCfungen"), r("Datenbank und Adminfreigabe wurden mit diesem Abruf gepr\xFCft. KI-Anbieter werden hier nicht aufgerufen. Funktions-, Sicherheits- und Buildtests werden bei \xC4nderungen ausgef\xFChrt; ein erreichbarer Server ist keine Garantie f\xFCr Fehlerfreiheit. Technische Laufzeitfehler sind in Supabase unter Logs einsehbar. Es werden keine zus\xE4tzlichen Nutzerinhalte f\xFCr ein Fehlertracking erfasst."), e("a", { href: `https://supabase.com/dashboard/project/${new URL($().supabaseUrl).hostname.split(".")[0]}/logs/explorer`, target: "_blank", rel: "noopener noreferrer" }, "Logs in Supabase \xF6ffnen \u2197")), n("Status aktualisieren", (z) => l(x, z.currentTarget), "button secondary"));
      }
      async function w(P) {
        if (P === "maintenance") return T();
        if (P === "features" || P === "limits") return I(P);
        if (P === "audit") return D();
        if (P === "system") return x();
        u.replaceChildren(k("security"), e("h3", {}, "Dein zus\xE4tzlicher Schutz"), r("Nur dein fest zugeordnetes Betreiberkonto erh\xE4lt Zugang. Die zus\xE4tzliche Freigabe gilt h\xF6chstens zehn Minuten. Beim Schlie\xDFen wird sie verworfen und bei bestehender Verbindung serverseitig gesperrt. Eine neue Entsperrung ersetzt die bisherige Freigabe \u2013 auch auf anderen Ger\xE4ten."), n("Admin-Zusatzpasswort \xE4ndern", f, "button secondary"), n("Zusatzpasswort per E-Mail wiederherstellen", m, "button secondary"), n("Adminfreigabe jetzt beenden", b, "button"), r("Dies ist ein zus\xE4tzliches Passwort, keine Zwei-Faktor-Anmeldung. Der Supabase-Schutz gegen bereits geleakte Passw\xF6rter bleibt im vereinbarten kostenlosen Tarif deaktiviert."));
      }
      return { navigation: k, rpc: y, show: w };
    }
    function Zt(t) {
      return t?.maintenance === true && t.maintenance_access !== true;
    }
    var xe = document.getElementById("app"), j = document.getElementById("dialog"), Pa = Wa(), hr = new URL(location.href).searchParams.get("plant");
    /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(hr || "") || (hr = null);
    var je = Sa(Go().id, { persist: false }), p = { access: null, user: null, data: null, view: "overview", query: "", category: "Alle", favorites: false, radar: false, phase: "all", bedView: "list", bedYear: (/* @__PURE__ */ new Date()).getFullYear(), loading: true, error: "", lastSync: null }, br = 0, Zo = false, _i = null, Ae = "login", kn = null, et = 0, Yo = false, Ge = false, bt = false;
    async function Xo(t) {
      let e = C(await $().rpc("rg_invitation", { action: "status" }));
      p.user?.id === t && (bt = !!e?.pending, bt && (Ge = true, Ae = "password"));
    }
    var ki = () => {
    }, Yt = null, il = `ramonas-garten-haptics:${le}`, yi = typeof navigator.vibrate == "function", En = true, Na = `ramonas-garten-weather:${le}`, yt = true, al = `ramonas-garten-weather-location:${le}`, _r = "duisburg", wi = null, dr = null, fr = 0, Xt = 0, Qt = "";
    try {
      localStorage.getItem(al) === "device" && (_r = "device");
    } catch {
    }
    var sl = `ramonas-garten-sayings:${le}`, ol = null;
    try {
      ol = localStorage;
    } catch {
    }
    var ja = Wo({ storage: ol, storageKey: sl });
    window.addEventListener("storage", (t) => {
      (t.key === sl || t.key === null) && (ja.reload(), Ga());
    });
    try {
      yt = localStorage.getItem(Na) !== "off";
    } catch {
    }
    try {
      En = localStorage.getItem(il) !== "off";
    } catch {
    }
    function ll() {
      if (!(!En || !yi)) try {
        navigator.vibrate(25);
      } catch {
      }
    }
    document.addEventListener("click", (t) => {
      if (!t.isTrusted || !(t.target instanceof Element)) return;
      let e = t.target.closest('button, a[href], input[type="checkbox"], input[type="radio"]');
      e && !e.disabled && e.getAttribute("aria-disabled") !== "true" && e.id !== "haptics-toggle" && ll();
    }, { capture: true });
    var Si = /* @__PURE__ */ new Set();
    function hd() {
      for (let t of Si) t();
      Si.clear();
    }
    var ot = /* @__PURE__ */ new Map(), We = null, cl = (t) => `ramonas-garten-ai-model:${le}:${p.user?.id || ""}:${t}`;
    function wt() {
      return p.data?.family?.ai_provider === "openai" ? "openai" : "gemini";
    }
    function At() {
      return p.data?.membership?.preferred_ai_provider || wt();
    }
    function Ce(t = At()) {
      return t === "openai" ? "OpenAI" : "Google Gemini";
    }
    function Et(t = At()) {
      return t === "openai" ? "ChatGPT" : "Gemini";
    }
    function An(t) {
      let e = t === "openai" ? bi : mi, n = p.data?.capabilities?.models?.[t];
      return Array.isArray(n) ? e.filter((r) => n.includes(r.id)) : e;
    }
    function Tn(t = At()) {
      if (We ??= {}, !Object.hasOwn(We, t)) {
        try {
          We[t] = localStorage.getItem(cl(t)) || (t === "gemini" ? localStorage.getItem(`ramonas-garten-ai-model:${le}:${p.user?.id || ""}`) : "") || "";
        } catch {
          We[t] = "";
        }
        An(t).some((e) => e.id === We[t]) || (We[t] = "");
      }
      return We[t] && !An(t).some((e) => e.id === We[t]) && (We[t] = ""), We[t];
    }
    function en(t, e = At(), n = null) {
      let r = o("p", { class: "ai-model-warning small", "data-ai-model-warning": "", role: "status", "aria-live": "polite", hidden: true }), i = () => {
        r.textContent = An(e).find((s) => s.id === a.value)?.warning || "", r.hidden = !r.textContent;
      }, a = o("select", { id: t, name: "model", onchange: (s) => {
        We[e] = s.target.value;
        try {
          localStorage.setItem(cl(e), We[e]);
        } catch {
        }
        for (let l of document.querySelectorAll("select[data-ai-model]")) l.dataset.aiProvider === e && (l.value = We[e], l.dispatchEvent(new Event("modelchoiceupdated")));
      }, "data-ai-model": "", "data-ai-provider": e }, o("option", { value: "" }, "Standard (Servereinstellung)"), An(e).map((s) => o("option", { value: s.id }, s.label)));
      return a.value = Tn(e), a.addEventListener("modelchoiceupdated", i), i(), o("div", { class: "field" }, o("label", { for: t }, n || (e === "openai" ? "OpenAI-Modell" : "Gemini-Modell")), a, r, p.data?.capabilities?.ai === false ? E("Die Garten-KI ist derzeit vom Betreiber deaktiviert.") : An(e).length ? null : E("F\xFCr diesen Anbieter ist derzeit kein Modell freigegeben."), E(`Tempo, API-Kosten und Verf\xFCgbarkeit h\xE4ngen vom Modell und eurem ${Ce(e)}-Zugang ab.`));
    }
    function o(t, e = {}, ...n) {
      let r = document.createElement(t);
      for (let [i, a] of Object.entries(e)) a == null || a === false || (i.startsWith("on") ? r.addEventListener(i.slice(2).toLowerCase(), a) : i === "class" ? r.className = a : i === "text" ? r.textContent = a : ["value", "checked", "disabled", "selected"].includes(i) ? r[i] = a : r.setAttribute(i, a === true ? "" : String(a)));
      for (let i of n.flat(1 / 0)) i != null && i !== false && r.append(i instanceof Node ? i : document.createTextNode(String(i)));
      return r;
    }
    var S = (t, e, n = "button", r = {}) => o("button", { type: "button", class: n, onclick: e, ...r }, t);
    function za(t) {
      let e = { share: ["M12 15V3m-4 4 4-4 4 4", "M7 10H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2"], camera: ["M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z", "M16 13a4 4 0 1 1-8 0 4 4 0 0 1 8 0"], sparkle: ["M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z"], refresh: ["M20 10a8 8 0 1 0-2.2 7.7", "M20 3v7h-7"] }, n = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      for (let [r, i] of Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false", class: "ui-icon", width: "20", height: "20" })) n.setAttribute(r, i);
      for (let r of e[t] || []) {
        let i = document.createElementNS(n.namespaceURI, "path");
        i.setAttribute("d", r), n.append(i);
      }
      return n;
    }
    var E = (t) => o("p", { class: "muted small" }, t);
    function ul(t, e, { count: n, active: r = false, className: i = "", ...a } = {}) {
      let s = t === "Alle" ? "\u{1F331}" : t === "Obst" ? "\u{1F34E}" : t === "Beeren" ? "\u{1FAD0}" : t === "Schattige Pl\xE4tze" ? "\u{1F324}\uFE0F" : rr[t];
      return S([o("span", { class: "category-icon", "aria-hidden": "true" }, s), o("span", { class: "category-copy" }, o("span", { class: "category-label" }, t), n === void 0 ? null : o("span", { class: "category-count", "aria-hidden": "true" }, `${n} ${n === 1 ? "Eintrag" : "Eintr\xE4ge"}`))], e, `category-tile ${t === "Alle" || t === "Schattige Pl\xE4tze" ? "category-all" : ""} ${r ? "active" : ""} ${i}`, a);
    }
    var lt = (t, e, n) => o("div", { class: "empty-state" }, o("span", { class: "empty-icon", "aria-hidden": "true" }, "\u2667"), o("h3", {}, t), o("p", {}, e), n);
    function J(t, e = false) {
      let n = o("div", { class: `toast ${e ? "error" : ""}`, role: e ? "alert" : "status" }, t);
      document.getElementById("notifications").replaceChildren(n), setTimeout(() => n.remove(), e ? 12e3 : 5e3);
    }
    function dl() {
      let t = p.lastSync?.toLocaleTimeString("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }) || "\u2013";
      return navigator.onLine ? p.error || `Stand ${t}${p.view === "overview" ? "" : " \xB7 automatisch alle 30 Sekunden"}` : "Offline \xB7 Speichern braucht eine Verbindung";
    }
    function hl() {
      let t = xe.querySelector(".sync-line");
      t && (t.classList.toggle("has-error", !!(p.error || !navigator.onLine)), t.querySelector("[data-sync-message]").textContent = dl());
    }
    function Oa() {
      let t = /* @__PURE__ */ new Date(), e = { timeZone: "Europe/Berlin" }, n = t.toLocaleTimeString("de-DE", { ...e, hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }), [r, i, a] = n.split(":");
      for (let s of document.querySelectorAll("[data-clock]")) {
        s.dateTime = t.toISOString(), s.setAttribute("aria-label", `${n} Uhr \xB7 Europe/Berlin`), s.querySelector("[data-clock-part]") || s.replaceChildren(o("span", { "data-clock-part": "hours", "aria-hidden": "true" }), o("span", { class: "clock-colon", "aria-hidden": "true" }, ":"), o("span", { "data-clock-part": "minutes", "aria-hidden": "true" }), o("span", { class: "clock-colon clock-seconds-colon", "aria-hidden": "true" }, ":"), o("span", { class: "clock-seconds", "data-clock-part": "seconds", "aria-hidden": "true" }));
        for (let [l, c] of Object.entries({ hours: r, minutes: i, seconds: a })) {
          let u = s.querySelector(`[data-clock-part="${l}"]`);
          u.textContent !== c && (u.textContent = c);
        }
      }
      for (let s of document.querySelectorAll("[data-calendar-day]")) s.textContent = t.toLocaleDateString("de-DE", { ...e, weekday: s.dataset.compact === "true" ? "short" : "long" });
      for (let s of document.querySelectorAll("[data-calendar-date]")) s.textContent = t.toLocaleDateString("de-DE", { ...e, day: "2-digit", month: "2-digit", year: "numeric" });
      Ga(t);
    }
    function Ga(t = /* @__PURE__ */ new Date()) {
      let e = xe.querySelector("[data-saying-card]");
      if (!e || j.open || document.hidden) return;
      let n = ja.current(t), r = `${n.tag}:${n.id}`;
      if (e.dataset.sayingId !== r) {
        for (let i of e.querySelectorAll("[data-saying-part]")) i.textContent = n[i.dataset.sayingPart];
        e.dataset.sayingId = r;
      }
    }
    async function fl(t = false) {
      if (!navigator.geolocation) throw new Error("Dieser Browser stellt keinen Ger\xE4testandort bereit. Duisburg bleibt verf\xFCgbar.");
      if (!t && wi && Date.now() - wi.at < 9e5) return wi.location;
      if (dr) return dr;
      dr = new Promise((e, n) => navigator.geolocation.getCurrentPosition((r) => {
        try {
          e(Ta(r.coords));
        } catch (i) {
          n(i);
        }
      }, (r) => n(new Error(r.code === 1 ? "Die Standortfreigabe fehlt. Erlaube sie in den Website-Einstellungen oder verwende Duisburg." : "Der Standort konnte nicht ermittelt werden. Bitte sp\xE4ter erneut versuchen oder Duisburg verwenden.")), { enableHighAccuracy: false, timeout: 1e4, maximumAge: t ? 0 : 3e5 }));
      try {
        let e = await dr;
        return wi = { location: e, at: Date.now() }, fr = 0, e;
      } finally {
        dr = null;
      }
    }
    async function fd() {
      if (_r !== "device") return Ot;
      if (fr && Date.now() - fr < 9e5) return Ot;
      try {
        let t = await fl();
        return Qt = "", t;
      } catch (t) {
        return fr = Date.now(), Qt = Ue(t) + " Angezeigt wird Duisburg als Ausweichort.", Ot;
      }
    }
    async function Qo(t) {
      let e = ++Xt;
      if (t === "device") {
        Qt = "Standort wird ermittelt \u2026";
        try {
          await fl(true);
        } catch (n) {
          throw e === Xt && (Qt = Ue(n) + " Angezeigt wird Duisburg als Ausweichort.", fr = Date.now(), await Ei()), n;
        }
        if (e !== Xt) return;
      }
      _r = t, Qt = "", yt = true;
      for (let n of document.querySelectorAll("[data-weather-enabled]")) n.checked = true;
      try {
        localStorage.setItem(al, t), localStorage.setItem(Na, "on");
      } catch {
      }
      for (let n of document.querySelectorAll("[data-weather-choice-status]")) n.textContent = t === "device" ? "Wetter am aktuellen Ger\xE4testandort ist ausgew\xE4hlt." : "Duisburg ist als Wetterort ausgew\xE4hlt.";
      await Ei(), J(t === "device" ? "Wetter f\xFCr deinen aktuellen Standort ausgew\xE4hlt." : "Wetterort: Duisburg.");
    }
    function Ca() {
      return o("div", { class: "weather-location-controls" }, o("div", { class: "form-actions" }, S("Meinen Standort verwenden", (t) => W(() => Qo("device"), t.currentTarget), "button secondary"), S("Duisburg verwenden", (t) => W(() => Qo("duisburg"), t.currentTarget), "text-button")), E("F\xFCr das Standortwetter werden gerundete Koordinaten an Open-Meteo \xFCbertragen. Deine genaue Position wird nicht in der Gartendatenbank gespeichert."));
    }
    async function gl(t, e = false) {
      if (!yt) return;
      let n = ae(), r = Xt, i = Ot;
      try {
        if (i = await fd(), r !== Xt || !yt) return;
        let a = await Vo({ force: e, location: i });
        if (!n() || !t.isConnected || !yt || r !== Xt) return;
        let s = (c) => `${c.toLocaleString("de-DE", { maximumFractionDigits: 1 })} \xB0C`, l = a.stale || Date.now() - a.fetchedAt > 18e5;
        t.setAttribute("aria-label", `Wetter: ${i.label}`), t.replaceChildren(o("summary", { class: "weather-summary" }, o("span", { class: "weather-temperature" }, o("span", { class: "eyebrow" }, i.label.toLocaleUpperCase("de")), o("strong", {}, s(a.temperature))), o("span", { class: "weather-brief" }, o("strong", {}, Ho(a.code)), o("span", { class: "weather-updated" }, `${l ? "\xC4lterer Stand" : "Stand"} ${a.time.slice(11)} Uhr`), a.tomorrowMin < 3 ? o("span", { class: "weather-frost" }, "Bodenfrost m\xF6glich") : null), o("span", { class: "weather-toggle", "aria-hidden": "true" }, "\u2304")), o("div", { class: "weather-expanded" }, E(`Gef\xFChlt ${s(a.feelsLike)} \xB7 heute ${s(a.min)} bis ${s(a.max)}`), E(`${a.time.slice(8, 10)}.${a.time.slice(5, 7)}. \xB7 Wettermodell f\xFCr ${i.label} \xB7 ${a.timeZone}`), Qt ? o("p", { class: "small", role: "status" }, Qt) : null, a.tomorrowMin < 3 ? E(`Morgen laut Vorhersage bis ${s(a.tomorrowMin)}: Bodenfrost ist m\xF6glich. \xD6rtliche Wetterlage pr\xFCfen.`) : null, o("a", { href: "https://open-meteo.com/", target: "_blank", rel: "noopener noreferrer", class: "weather-source" }, "Wetter: Open-Meteo"), Ca()));
      } catch (a) {
        n() && t.isConnected && r === Xt && t.replaceChildren(o("summary", { class: "weather-summary weather-unavailable" }, o("strong", {}, i.label), o("span", {}, "Wetter gerade nicht erreichbar"), o("span", { class: "weather-toggle", "aria-hidden": "true" }, "\u2304")), o("div", { class: "weather-expanded" }, E(Ue(a)), Ca()));
      }
    }
    function gd() {
      let t = o("details", { class: "weather-panel", "data-weather": "", "aria-label": "Wetter" }, o("summary", { class: "weather-summary weather-unavailable" }, o("strong", {}, _r === "device" ? "Aktueller Standort" : "Duisburg"), o("span", {}, "Wetter wird geladen \u2026")));
      return gl(t), t;
    }
    async function Ei(){return;}

    function Ue(t) {
      let e = t?.message || String(t);
      return /Invalid login credentials/i.test(e) ? "E-Mail oder Passwort stimmt nicht." : /Email not confirmed/i.test(e) ? "Bitte best\xE4tige zuerst deine E-Mail-Adresse." : /Failed to fetch|NetworkError|fetch failed|timed out|timeout/i.test(e) ? "Keine Verbindung. Deine Eingaben bleiben erhalten. Bitte versuche es erneut." : /row-level security|permission denied/i.test(e) ? "Du hast keinen Zugriff auf diese Daten. Bitte aktualisiere die Ansicht." : /relation .* does not exist|schema cache|Could not find the table/i.test(e) ? "Die Garten-Tabellen fehlen noch. Bitte zuerst die mitgelieferte SQL-Migration in Supabase ausf\xFChren." : /duplicate key|unique constraint/i.test(e) ? "Dieser Eintrag besteht bereits." : /rate limit|too many requests/i.test(e) ? "Zu viele Versuche. Bitte warte einen Moment." : e.slice(0, 450);
    }
    async function W(t, e) {
      if (!e?.disabled) {
        e && (e.disabled = true, e.setAttribute("aria-busy", "true")), br++;
        try {
          return await t();
        } catch (n) {
          J(Ue(n), true);
        } finally {
          br--, e && (e.disabled = false, e.removeAttribute("aria-busy"));
        }
      }
    }
    async function te(t, e) {
      let n = [...t.querySelectorAll("input, button, select, textarea")], r = new Set(n.filter((a) => a.disabled));
      if (t.dataset.busy) return;
      t.dataset.busy = "true", br++;
      let i = t.querySelector("[data-error]");
      i && (i.textContent = ""), n.forEach((a) => a.disabled = true), t.setAttribute("aria-busy", "true");
      try {
        await e();
      } catch (a) {
        i ? i.textContent = Ue(a) : J(Ue(a), true);
      } finally {
        br--, n.forEach((a) => a.disabled = r.has(a)), t.removeAttribute("aria-busy"), delete t.dataset.busy;
      }
    }
    function pd() {
      if (Yt) return;
      let t = document.body, e = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
      Yt = { x: window.scrollX, y: window.scrollY }, t.style.setProperty("--dialog-scroll-top", `${-Yt.y}px`), t.style.setProperty("--dialog-scroll-left", `${-Yt.x}px`), t.style.setProperty("--dialog-scroll-padding", `${(parseFloat(getComputedStyle(t).paddingRight) || 0) + e}px`), document.documentElement.classList.add("dialog-scroll-locked"), t.classList.add("dialog-scroll-locked");
    }
    function pl() {
      if (!Yt) return;
      let { x: t, y: e } = Yt;
      Yt = null, document.documentElement.classList.remove("dialog-scroll-locked"), document.body.classList.remove("dialog-scroll-locked");
      for (let n of ["--dialog-scroll-top", "--dialog-scroll-left", "--dialog-scroll-padding"]) document.body.style.removeProperty(n);
      window.scrollTo(t, e);
    }
    function se(t, e, { className: n = "", heading: r = null, cleanup: i = () => {
    } } = {}) {
      ki(), ki = i, pd();
      try {
        j.open && j.close(), j.className = n, j.replaceChildren(o("div", { class: "dialog-close-rail" }, S("\u2715", () => j.close(), "dialog-close-button", { "aria-label": "Dialog schlie\xDFen", title: "Fenster schlie\xDFen" })), o("div", { class: "dialog-content" }, r || o("div", { class: "dialog-heading" }, o("div", {}, o("p", { class: "eyebrow" }, "REZEPTE"), o("h2", { id: "dialog-title" }, t))), e)), j.showModal();
      } catch (a) {
        throw j.open || pl(), a;
      }
    }
    j.addEventListener("close", () => {
      if (!j.open) try {
        ki();
      } finally {
        ki = () => {
        }, j.className = "", pl(), Ga();
      }
    });
    window.addEventListener("beforeunload", (t) => {
      [...ot.values()].some((e) => e.draft.state().dirty) && (t.preventDefault(), t.returnValue = "");
    });
    var md = 0;
    function G(t, e, n = "", r = {}) {
      let { area: i, select: a, ...s } = r, l = s.id || `field-${e}-${++md}`, c;
      return a ? c = o("select", { name: e, id: l, ...s }, a.map((u) => o("option", { value: u, selected: u === n }, u))) : i ? c = o("textarea", { name: e, id: l, rows: 4, ...s }, n) : c = o("input", { name: e, id: l, value: n, ...s }), o("div", { class: "field" }, o("label", { for: l }, t), c);
    }
    var re = () => o("p", { class: "form-error", "data-error": "", role: "alert", "aria-live": "polite" }), ce = (...t) => o("div", { class: "form-actions" }, t), Fa = Io({ h: o, button: S, small: E, empty: lt, field: G, formError: re, actions: ce, showDialog: se, formAction: te, perform: W, notify: J, friendly: Ue, getState: () => p, captureScope: ae, afterSave: vr, photoEditor: xi, dialog: j, navigate: Pn, notesView: Jd, disposeMedia: (t) => Si.add(t), plantDetail: He });
    function ml() {
      return S(`${je.icon} ${je.name}`, wd, "season-shortcut", { "data-season-shortcut": "", "aria-label": `Design wechseln, aktuell ${je.name}`, "aria-haspopup": "dialog" });
    }
    function bd(t) {
      je = Sa(t);
      for (let e of document.querySelectorAll("[data-season-shortcut]")) e.textContent = `${je.icon} ${je.name}`, e.setAttribute("aria-label", `Design wechseln, aktuell ${je.name}`);
      for (let e of document.querySelectorAll("[data-season-choice]")) {
        let n = e.dataset.seasonChoice === t;
        e.setAttribute("aria-pressed", String(n)), e.querySelector(".season-check").textContent = n ? "\u2713" : "";
      }
      for (let e of document.querySelectorAll("[data-season-art]")) e.textContent = je.art[Number(e.dataset.seasonArt)];
      for (let e of document.querySelectorAll("[data-season-status]")) e.textContent = `${je.name} ist ausgew\xE4hlt. Die Gestaltung gilt auf diesem Ger\xE4t.`;
    }
    function bl() {
      return o("div", { class: "season-grid", role: "group", "aria-label": "Jahreszeit ausw\xE4hlen" }, lr.map((t) => S([o("span", { class: "season-preview", "aria-hidden": "true" }, o("span", { class: "season-preview-sun" }), o("span", { class: "season-preview-icon" }, t.icon), o("span", { class: "season-preview-ground" })), o("span", { class: "season-choice-copy" }, o("strong", {}, t.name), o("span", {}, t.palette)), o("span", { class: "season-check", "aria-hidden": "true" }, t.id === je.id ? "\u2713" : "")], () => bd(t.id), "season-option", { "data-season-choice": t.id, "aria-label": `${t.name}-Design ausw\xE4hlen`, "aria-pressed": String(t.id === je.id) })));
    }
    function wd() {
      se("Vier Jahreszeiten. Dein Garten.", o("div", { class: "season-dialog-copy" }, o("p", { class: "muted" }, "Ein vertrauter Garten. Vier Farben f\xFCr eure Jahreszeiten."), bl(), o("p", { class: "season-selection-status", "data-season-status": "", role: "status" }, `${je.name} ist ausgew\xE4hlt. Die Gestaltung gilt auf diesem Ger\xE4t.`), ce(S("Fertig", () => j.close()))));
    }
    function yd() {
      return o("section", { class: "panel appearance-panel" }, o("p", { class: "eyebrow" }, "DEIN GARTEN. DEINE FARBEN."), o("h2", {}, "Im Wandel der Jahreszeiten."), o("p", { class: "muted" }, "W\xE4hle die Stimmung, die gerade zu dir passt. Dein ganzes Gartenbuch bekommt die passenden Farben."), bl(), o("p", { class: "season-selection-status", "data-season-status": "", role: "status" }, `${je.name} ist ausgew\xE4hlt. Die Gestaltung gilt auf diesem Ger\xE4t.`));
    }
    function vd() {
      let t = o("input", { id: "haptics-toggle", type: "checkbox", role: "switch", class: "feedback-switch", checked: yi && En, disabled: !yi, "aria-describedby": "haptics-support", onchange: (e) => {
        En = e.target.checked;
        try {
          localStorage.setItem(il, En ? "on" : "off");
        } catch {
        }
        ll(), J(En ? "Haptik eingeschaltet." : "Haptik ausgeschaltet.");
      } });
      return o("section", { class: "panel feedback-panel" }, o("p", { class: "eyebrow" }, "BEDIENUNG AUF DIESEM GER\xC4T"), o("h2", {}, "Ein gutes Gef\xFChl."), o("label", { class: "feedback-toggle", for: "haptics-toggle" }, o("span", {}, "Vibration beim Antippen"), t), o("p", { id: "haptics-support", class: "muted small" }, yi ? "Kurze Vibrationsimpulse begleiten deine Ber\xFChrungen. Die Einstellung gilt auf diesem Ger\xE4t; das Ger\xE4t kann Vibrationen einschr\xE4nken." : "Dieser Browser unterst\xFCtzt keine Vibration. Auf dem iPhone bleibt die sichtbare R\xFCckmeldung beim Antippen."));
    }
    async function _d(t) {
      return W(async () => {
        if (!_i) {
          J("Die App-Aktualisierung wird noch vorbereitet. Bitte gleich erneut versuchen.");
          return;
        }
        let e = await _i.checkNow();
        J(e === "waiting" ? "Neue App-Version bereit. Speichere offene Eingaben und schlie\xDFe die Fenster in allen App-Tabs; danach wird sie automatisch \xFCbernommen." : e === "unsupported" ? "Dieser Browser erlaubt keine App-Aktualisierung im Hintergrund. Bitte \xFCber das Browser-Men\xFC neu laden." : "Die App-Version ist auf dem neuesten verf\xFCgbaren Stand.");
      }, t);
    }
    function kd() {
      return o("section", { class: "panel app-updates-panel" }, o("p", { class: "eyebrow" }, "DEINE APP-VERSION"), o("h2", {}, "Alles auf dem neuesten Stand."), o("p", { class: "muted" }, "Neue Funktionen und Verbesserungen werden automatisch gepr\xFCft. Hier kannst du sofort nach einer neuen Programmversion suchen."), S("App aktualisieren", (t) => _d(t.currentTarget), "button secondary"), E("Offene Formulare, Fenster und laufende Aktionen werden gesch\xFCtzt. Speichere Eingaben und schlie\xDFe Dialoge in allen App-Tabs, damit die neue Version \xFCbernommen wird. Der schwebende Aktualisieren-Knopf l\xE4dt eure Gartendaten und das Wetter."));
    }
    function Ua() {
      return S("Web-App installieren", wl, "text-button install-link", { "data-install-link": "", "aria-label": "Web-App installieren \u2013 Anleitung \xF6ffnen" });
    }
    function Sd() {
      return o("section", { class: "panel installation-panel" }, o("p", { class: "eyebrow" }, "AUF DEINEM GER\xC4T"), o("h2", {}, "Dein Garten. Ein Fingertipp."), o("p", { class: "muted" }, "Mit eigenem Symbol auf Handy, Tablet oder Computer \xF6ffnen. Die Web-App bleibt auch im Browser verf\xFCgbar."), S("Web-App installieren", wl, "button secondary"), E("Die Schritte f\xFCr Apple, Android, Windows und Mac findest du in der Installationshilfe. Speichern und KI brauchen Internet."));
    }
    function wl() {
      let t = o("p", { class: "installation-status small", role: "status" }), e = S("Jetzt installieren", async () => {
        try {
          let c = await Pa.prompt();
          t.textContent = c === "accepted" ? "Die Anfrage wurde best\xE4tigt. Folge den letzten Schritten deines Ger\xE4ts." : c === "dismissed" ? "Installation geschlossen. Du kannst die App weiterhin im Browser verwenden." : "Bitte die Anleitung f\xFCr dein Ger\xE4t verwenden.";
        } catch {
          t.textContent = "Der Browser konnte die Installation nicht \xF6ffnen. Bitte die Anleitung f\xFCr dein Ger\xE4t verwenden.";
        }
      }, "button", { "data-native-install": "" }), n = qa(navigator), r = o("select", { "aria-label": "Installationsanleitung f\xFCr", onchange: () => a() }, zi.map((c) => o("option", { value: c.id }, c.label)));
      r.value = n;
      let i = o("ol", { class: "installation-steps" });
      function a() {
        i.replaceChildren(...zi.find((c) => c.id === r.value).steps.map((c) => o("li", {}, c)));
      }
      a();
      let s = (c) => {
        e.hidden = !c.canPrompt, e.disabled = c.pending, c.installed && (t.textContent = "Die App l\xE4uft bereits als installierte Web-App. Auf einem anderen Ger\xE4t erfolgt die Installation dort erneut.");
      };
      s(Pa.state());
      let l = Pa.subscribe(s);
      se("Web-App installieren", o("div", { class: "installation-guide" }, o("p", { class: "muted" }, "Ein Gartensymbol und ein eigenes App-Fenster \u2013 ohne App-Store-Konto. Die Installation best\xE4tigst du auf deinem Ger\xE4t."), e, t, o("label", { class: "field" }, o("span", {}, "Dein Ger\xE4t"), r), i, E("Men\xFCnamen und Verf\xFCgbarkeit h\xE4ngen von Browser, Systemversion und Ger\xE4teeinstellungen ab. Bei einem bereits installierten Gartensymbol ist keine neue Installation n\xF6tig."), E("Nach der Installation kann eine erneute Anmeldung n\xF6tig sein. Kamera, Teilen, Kalender und Haptik richten sich nach den M\xF6glichkeiten deines Browsers.")), { cleanup: l });
    }
    function Ct(){return RX.footer();}

    function Ed(t, e, n) {
      document.getElementById("print-content")?.remove();
      let r = o("article", { id: "print-content", class: "print-content" }, o("p", { class: "eyebrow" }, "REZEPTE"), o("h1", {}, t), o("p", { class: "print-meta" }, (/* @__PURE__ */ new Date()).toLocaleString("de-DE", { timeZone: "Europe/Berlin" })), o("pre", {}, e), n ? o("p", {}, n) : null);
      document.body.append(r), window.addEventListener("afterprint", () => r.remove(), { once: true });
      try {
        window.print();
      } catch (i) {
        throw r.remove(), i;
      }
    }
    function gr({ title: t, text: e, url: n = new URL(le, location.origin).href, back: r = null, privateContent: i = false }) {
      let a = o("textarea", { rows: 3, readonly: true, "aria-label": "Link oder Text zum Kopieren" }, n), s = async (u) => {
        try {
          await navigator.clipboard.writeText(u), J("Kopiert.");
        } catch {
          a.value = u, a.focus(), a.select(), J("Bitte den markierten Text \xFCber das Kopiermen\xFC deines Ger\xE4ts kopieren.");
        }
      }, l = e.length > 1200 ? e.slice(0, 1200) + " \u2026" : e, c = `https://wa.me/?text=${encodeURIComponent(`${t}

${l}

${n}`)}`;
      se("Teilen & Drucken", o("div", { class: "share-options" }, o("h3", {}, t), E(i ? "Diese Auswahl enth\xE4lt eigene Gartendaten. W\xE4hle bewusst, an wen du sie weitergibst." : "Geteilte Pflanzenangaben enthalten keine separat gespeicherten Familiennotizen. Ein Sortenlink \xF6ffnet Daten nur f\xFCr berechtigte Familienmitglieder."), o("div", { class: "share-actions" }, typeof navigator.share == "function" ? S("\xDCber das Ger\xE4t teilen", (u) => W(async () => {
        try {
          await navigator.share({ title: t, text: e, url: n });
        } catch (d) {
          if (d.name !== "AbortError") throw d;
        }
      }, u.currentTarget), "button") : null, o("a", { class: "button secondary", href: c, target: "_blank", rel: "noopener noreferrer" }, "WhatsApp \xB7 Kurzfassung"), S("Link kopieren", (u) => W(() => s(n), u.currentTarget), "button secondary"), S("Text kopieren", (u) => W(() => s(`${t}

${e}

${n}`), u.currentTarget), "button secondary"), S("Drucken / als PDF", () => Ed(t, e, n), "button secondary")), a, r ? ce(S("Zur\xFCck", r, "button secondary")) : null));
    }
    function Ad(t) {
      let e = _n(t), n = new URL(le, location.origin);
      n.searchParams.set("plant", t.id);
      let r = [`Standort: ${t.location || "\u2013"}`, `Pflanzabstand: ${t.spacing || "\u2013"}`, `Saattiefe: ${e.depth || "Angaben auf dem Saatgutt\xFCtchen pr\xFCfen"}`, `Aussaat / Anbau: ${t.sowing || "\u2013"}`, `Ernte: ${t.harvest || "\u2013"}`, t.care, ...e.knowledge.practice ? [] : [`Lebensdauer: ${e.knowledge.life}`, `Schnittzeit: ${e.knowledge.cutWhen}`, `Schnitt: ${e.knowledge.cutHow}`, `Standortwechsel: ${e.knowledge.move}`, `Fruchtfolge: ${e.knowledge.after}`], "Termine sind Richtwerte. Sorte, \xF6rtliche Witterung und Saatgutangaben ber\xFCcksichtigen."].filter(Boolean).join(`

`);
      gr({ title: `${t.name}${t.variety ? " \xB7 " + t.variety : ""}`, text: r, url: n.href, back: () => He(t) });
    }
    function Td() {
      if (p.view === "beds") {
        let t = new Map(p.data.plants.map((n) => [n.id, n])), e = p.data.beds.map((n) => `${n.name}${n.description ? " \u2013 " + n.description : ""}
` + p.data.plantings.filter((r) => r.bed_id === n.id && (r.season_year ?? (/* @__PURE__ */ new Date()).getFullYear()) === p.bedYear).map((r) => {
          let i = t.get(r.plant_id);
          return `\u2022 ${r.quantity ?? 1} \xD7 ${i?.name || "Pflanze"} ${i?.variety || ""} \u2013 ${r.status}${r.position ? " \xB7 " + r.position : ""}`;
        }).join(`
`)).join(`

`);
        return gr({ title: `Beetplan ${p.bedYear}`, text: e || "Noch keine Beete angelegt.", privateContent: true });
      }
      if (p.view === "plants") {
        let t = rt(yr(p)).map((e) => `${e.name}: ${e.plants.map((n) => n.variety || "Ohne Sortenangabe").join(", ")}`).join(`

`);
        return gr({ title: "Unser Pflanzenkatalog", text: t || "F\xFCr diese Filter keine Eintr\xE4ge.", privateContent: true });
      }
      gr({ title: "Rezepte", text: "Pflanzen entdecken, Sorten ausw\xE4hlen und gemeinsam Beete planen. Privates Familienprojekt mit eigener Anmeldung." });
    }
    function Pd() {
      if (!hr || !p.data?.membership || j.open || Ge) return;
      let t = p.data.plants.find((n) => n.id === hr);
      hr = null;
      let e = new URL(location.href);
      e.searchParams.delete("plant"), history.replaceState(null, "", e), t ? (p.view = "plants", p.radar = false, p.category = "Alle", p.favorites = false, p.query = "", ue(), He(t)) : J("Diese geteilte Sorte ist in deinem Familiengarten nicht verf\xFCgbar.", true);
    }
    function wr({ plant: t = null, bed: e = null, event: n = null, back: r = null } = {}) {
      let i = ae(), a = new Map(p.data.plants.map((L) => [L.id, L])), s = new Map(p.data.beds.map((L) => [L.id, L])), l = n, c = null, u = n?.title || "", d = o("select", { id: "calendar-plant", name: "plant" }), h = n?.plant_id || t?.id || "", g = o("input", { id: "calendar-search", type: "search", placeholder: "Kultur oder Sorte eingeben \u2026", autocomplete: "off", maxlength: 150 }), f = o("p", { class: "muted small", role: "status", "aria-live": "polite" }), m = (L) => L.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("de");
      function b() {
        let L = m(g.value.trim()), oe = [...a.values()].filter((ie) => m(`${ie.name} ${ie.variety}`).includes(L)), ee = a.get(h);
        ee && !oe.includes(ee) && oe.push(ee), d.replaceChildren(o("option", { value: "" }, "Ohne bestimmte Sorte"), ...rt(oe).map((ie) => o("optgroup", { label: ie.label }, ie.plants.map((me) => o("option", { value: me.id }, me.variety || me.name))))), d.value = h;
        let _e = oe.filter((ie) => !L || m(`${ie.name} ${ie.variety}`).includes(L)).length;
        f.textContent = `${_e} ${_e === 1 ? "Sorte gefunden" : "Sorten gefunden"}${ee && L && !m(`${ee.name} ${ee.variety}`).includes(L) ? " \xB7 bisherige Auswahl bleibt erhalten" : ""}. Bitte die gew\xFCnschte Sorte ausw\xE4hlen.`;
      }
      g.addEventListener("input", b);
      let v = o("select", { id: "calendar-bed", name: "bed" }, o("option", { value: "" }, "Ohne bestimmtes Beet"), [...s.values()].sort((L, oe) => L.name.localeCompare(oe.name, "de", { numeric: true })).map((L) => o("option", { value: L.id }, L.name)));
      v.value = n?.bed_id || e?.id || "";
      let y = G("Gartenaufgabe", "task", n?.task || (t ? "Pflanzen / Stecken" : "Pflege"), { select: ui }), k = G("Titel", "title", n?.title || "", { required: true, maxlength: 240 }), _ = o("input", { type: "checkbox", checked: !n?.event_time, id: "calendar-all-day" }), T = G("Uhrzeit (Europe/Berlin)", "time", n?.event_time?.slice(0, 5) || "09:00", { type: "time", step: 60 }), I = G("Dauer in Minuten", "duration", n?.duration || 30, { type: "number", min: 5, max: 480, step: 5 }), D = o("div", { class: "form-grid", hidden: true }, T, I), x = o("select", { id: "calendar-reminder", name: "reminder" }), w = o("p", { class: "muted small calendar-guidance" }), P = o("section", { class: "calendar-result", hidden: true, "aria-label": "Gespeicherter Gartentermin" }), F = o("p", { role: "status", "aria-live": "polite", class: "small" });
      function z() {
        c && URL.revokeObjectURL(c), c = null, P.hidden = true, P.replaceChildren(), F.textContent = "";
      }
      function q() {
        h = d.value;
        let L = a.get(h), oe = s.get(v.value), ee = y.querySelector("select").value, _e = k.querySelector("input"), ie = `${ee}: ${[L ? [L.name, L.variety].filter(Boolean).join(" \xB7 ") : "", oe?.name].filter(Boolean).join(" \xB7 ") || "Garten"}`.slice(0, 240);
        (!_e.value || _e.value === u && !l) && (_e.value = ie), u = ie;
        let me = Object.keys(Ie).find((Ve) => Ie[Ve] === ee), It = L ? bn(L) : null;
        w.textContent = L && me ? `${ee}: ${It[me]?.length ? _l(It[me]) : "Keine Monate hinterlegt"}. ${kr()} Datum passend zur Sorte und Witterung selbst w\xE4hlen; das T\xFCtchen hat Vorrang.` : "W\xE4hle deinen gew\xFCnschten Termin \u2013 auch f\xFCr Eink\xE4ufe, Vorbereitungen und andere Gartenaufgaben.";
      }
      function ne() {
        D.hidden = _.checked, T.querySelector("input").required = !_.checked, I.querySelector("input").required = !_.checked;
        let L = x.value || n?.reminder, oe = [["none", "Keine Erinnerung"], ..._.checked ? [] : [["start", "Zum Beginn"], ["hour", "1 Stunde vorher"]], ["day", "1 Tag vorher"], ["week", "1 Woche vorher"]];
        x.replaceChildren(...oe.map(([ee, _e]) => o("option", { value: ee }, _e))), x.value = oe.some(([ee]) => ee === L) ? L : "day";
      }
      let R = o("button", { type: "submit", class: "button" }, n ? "\xC4nderungen speichern" : "Termin speichern"), U = o("form", { class: "calendar-form" }, o("p", { class: "muted" }, "Plane Aussaat, Pflege und Eink\xE4ufe. Gespeicherte Termine geh\xF6ren zu eurem Familiengarten und werden \xFCber ein eingerichtetes Kalenderabo automatisch abgerufen."), o("div", { class: "field calendar-search" }, o("label", { for: g.id }, "Sorte suchen"), o("div", { class: "search-with-clear" }, g, S("\u2715", () => {
        g.value = "", b(), g.focus();
      }, "icon-button", { "aria-label": "Sortensuche leeren" })), f), o("div", { class: "form-grid" }, o("div", { class: "field" }, o("label", { for: d.id }, "Sorte (optional)"), d), o("div", { class: "field" }, o("label", { for: v.id }, "Beet (optional)"), v)), y, w, k, G("Datum", "date", n?.event_date || mt(), { type: "date", min: "2000-01-01", max: "2199-12-31", required: true }), o("label", { class: "consent", for: _.id }, _, o("span", {}, "Ganzt\xE4giger Termin")), D, o("div", { class: "field" }, o("label", { for: x.id }, "Erinnerung"), x, E("Kalender-Abos und Erinnerungen werden je nach Kalender-App unterschiedlich unterst\xFCtzt. Die Uhrzeit gilt in Europe/Berlin.")), G("Eigene Hinweise f\xFCr diesen Termin (optional)", "notes", n?.notes || "", { area: true, maxlength: 1e3 }), E("Nur die gew\xE4hlte Sorte / das Beet und die hier eingegebenen Hinweise werden mit dem Kalender geteilt. Separat gespeicherte Notizen und Fotos bleiben in der Garten-App."), re(), ce(r ? S("Zur\xFCck", r, "button secondary") : S("Abbrechen", () => j.close(), "button secondary"), R), F, P, o("details", { class: "calendar-help" }, o("summary", {}, "Apple, Android und einzelne Kalenderdateien"), o("p", {}, "Das automatische Kalenderabo richtest du unter \u201EFamilie & Konto \u2192 Kalenderabo einrichten\u201C ein. \xC4nderungen und L\xF6schungen werden beim n\xE4chsten Abruf \xFCbernommen; Apple und Google bestimmen den Aktualisierungszeitpunkt."), o("p", {}, "Einzelne Termine lassen sich nach dem Speichern weiterhin als .ics-Datei laden. Mac: in Apple Kalender \xF6ffnen. Google Kalender / Android: \xFCber die Importfunktion der Google-Kalender-Webseite importieren; danach im Kalender auf dem Handy anzeigen lassen. iPhone / iPad: Datei \xF6ffnen oder als eigenen E-Mail-Anhang in Apple Mail \xF6ffnen. Die verf\xFCgbaren Schritte h\xE4ngen vom Ger\xE4t ab. Einmal importierte Dateien werden nicht automatisch aktualisiert und erneutes Importieren kann doppelte Eintr\xE4ge erzeugen.")));
      for (let L of [d, v, y.querySelector("select")]) L.addEventListener("change", q);
      _.addEventListener("change", ne), U.addEventListener("input", z), U.addEventListener("change", z), U.addEventListener("submit", (L) => {
        if (L.preventDefault(), !i()) return;
        let oe = a.get(d.value), ee = s.get(v.value), _e = new FormData(U), ie = { title: _e.get("title").trim(), event_date: _e.get("date"), event_time: _.checked ? null : `${_e.get("time")}:00`, duration: _.checked ? 30 : Number(_e.get("duration")), reminder: x.value, task: _e.get("task"), notes: _e.get("notes").trim(), plant_id: oe?.id || null, bed_id: ee?.id || null };
        ie.description = ["Rezepte", oe ? `Sorte: ${[oe.name, oe.variety].filter(Boolean).join(" \xB7 ")}` : "", ee ? `Beet: ${ee.name}` : "", ie.notes].filter(Boolean).join(`

`), te(U, async () => {
          z(), Vt({ title: ie.title, date: ie.event_date, time: ie.event_time?.slice(0, 5) ?? null, duration: ie.duration, reminder: ie.reminder, description: ie.description });
          let me = await ze("rg_events", Te(), ie, l);
          if (!i() || !j.contains(U) || (l = me, delete U.dataset.dirty, R.textContent = "\xC4nderungen speichern", await he({ quiet: true }), !i() || !j.contains(U))) return;
          let It = Vt(Eo(me)), Ve = new File([It], `ramonas-garten-${me.event_date}.ics`, { type: "text/calendar;charset=utf-8" });
          c = URL.createObjectURL(Ve);
          let Er = false;
          try {
            Er = !!navigator.canShare?.({ files: [Ve] });
          } catch {
          }
          P.replaceChildren(o("h3", {}, me.title), E(`${me.event_date.split("-").reverse().join(".")} \xB7 ${me.event_time ? `${me.event_time.slice(0, 5)} Uhr` : "ganzt\xE4gig"}`), o("div", { class: "share-actions" }, o("a", { class: "button secondary", href: c, download: Ve.name }, "Kalenderdatei \xF6ffnen / laden"), Er ? S("Datei teilen", (Ar) => W(async () => {
            try {
              await navigator.share({ files: [Ve], title: me.title });
            } catch (Tr) {
              if (Tr.name !== "AbortError") throw Tr;
            }
          }, Ar.currentTarget), "button secondary") : null)), P.hidden = false, F.textContent = "Termin im Familiengarten gespeichert. Ein eingerichtetes Kalenderabo \xFCbernimmt ihn beim n\xE4chsten Abruf.";
        });
      }), b(), q(), ne(), se(n ? "Gartentermin bearbeiten" : "Zum Kalender hinzuf\xFCgen", U, { cleanup: z });
    }
    function vi() {
      let t = ae(), e = [...p.data.events || []].sort((n, r) => n.event_date.localeCompare(r.event_date) || (n.event_time || "").localeCompare(r.event_time || "") || n.title.localeCompare(r.title, "de"));
      se("Unsere Gartentermine", o("div", { class: "calendar-agenda" }, S("+ Gartentermin", () => wr({ back: vi })), e.length ? o("ul", { class: "calendar-event-list" }, e.map((n) => o("li", {}, o("div", {}, o("strong", {}, n.title), E(`${n.event_date.split("-").reverse().join(".")} \xB7 ${n.event_time ? n.event_time.slice(0, 5) + " Uhr" : "ganzt\xE4gig"}`)), ce(S("Bearbeiten", () => wr({ event: n, back: vi }), "button secondary"), S("L\xF6schen", (r) => W(async () => {
        confirm(`\u201E${n.title}\u201C aus dem Familiengarten und dem Kalenderabo l\xF6schen? Einzelne Datei-Importe bleiben im Kalender bestehen.`) && (await nt("rg_events", Te(), n), t() && (await he({ quiet: true }), t() && vi()));
      }, r.currentTarget), "text-button danger-text"))))) : E("Noch keine Gartentermine gespeichert.")));
    }
    function yl() {
      let t = ae(), e = o("div", { "aria-live": "polite" }, E("Kalenderabo wird gepr\xFCft \u2026")), n = o("div", { class: "calendar-subscription" }, o("p", { class: "muted" }, "Einmal abonnieren, danach automatisch abrufen: eure gespeicherten Gartentermine in Apple Kalender oder Google Kalender auf Android."), e, o("details", { class: "calendar-help" }, o("summary", {}, "So richtest du das Abo ein"), o("p", {}, "Apple: \u201EIn Apple Kalender abonnieren\u201C antippen und in Kalender best\xE4tigen. Alternativ auf dem Mac \u201EAblage \u2192 Neues Kalenderabonnement\u201C \xF6ffnen und den HTTPS-Link einf\xFCgen. Auf dem iPhone unter Kalender \u2192 Kalender \u2192 Hinzuf\xFCgen \u2192 Kalenderabonnement hinzuf\xFCgen; die Bezeichnungen k\xF6nnen je nach Version abweichen."), o("p", {}, "Android / Google: calendar.google.com im Desktop-Browser oder in der Desktopansicht \xF6ffnen. Unter \u201EWeitere Kalender \u2192 + \u2192 Per URL\u201C den HTTPS-Link einf\xFCgen und abonnieren. Anschlie\xDFend den Kalender in der Google-Kalender-App einblenden."), o("p", {}, "Der Kalender ist schreibgesch\xFCtzt: Termine in der Garten-App bearbeiten. Apple und Google legen den Abrufrhythmus fest; \xC4nderungen k\xF6nnen verz\xF6gert erscheinen. Benachrichtigungen bei Abos h\xE4ngen vom jeweiligen Kalender ab. Nach dem Widerruf erfolgen keine neuen Abrufe; schon heruntergeladene Termine bleiben beim Anbieter, bis du das Abo dort entfernst.")));
      se("Privates Kalenderabo", n);
      let r = () => t() && j.contains(n);
      function i(a, s = null) {
        if (!r()) return;
        let l = s ? o("textarea", { rows: 4, readonly: true, "aria-label": "Privater Kalender-Abo-Link", spellcheck: false }, s) : null;
        e.replaceChildren(E(a.configured ? "Dein Kalenderabo ist aktiviert. Der geheime Link wird nur direkt nach dem Erstellen angezeigt." : "Noch kein Kalenderabo f\xFCr dein Konto eingerichtet."), E("Wer diesen privaten Link kennt, kann eure Gartentermine ohne Anmeldung lesen. Nur in deiner Kalender-App verwenden. Der Link \xFCbermittelt Titel, Datum und Termin-Hinweise an den Kalenderanbieter."), s ? o("div", { class: "calendar-abo-link" }, o("a", { class: "button", href: s.replace(/^https:/, "webcal:"), referrerpolicy: "no-referrer" }, "In Apple Kalender abonnieren"), l, S("Abo-Link kopieren", async () => {
          try {
            await navigator.clipboard.writeText(s), J("Privater Kalenderlink kopiert.");
          } catch {
            l.focus(), l.select(), J("Bitte den markierten Link \xFCber das Kopiermen\xFC kopieren.");
          }
        }, "button secondary"), E("F\xFCr Google Kalender den HTTPS-Link \xFCber \u201EPer URL\u201C hinzuf\xFCgen. Den Link jetzt kopieren; nach dem Schlie\xDFen ist er hier nicht mehr abrufbar.")) : null, ce(S(a.configured ? "Neuen Abo-Link erstellen" : "Privaten Abo-Link erstellen", (c) => W(async () => {
          if (a.configured && !confirm("Ein neuer Link macht deinen bisherigen Abo-Link ung\xFCltig. Danach das neue Abo im Kalender einrichten?")) return;
          let u = To(), d = await Ao(u);
          if (!r()) return;
          let h = C(await $().rpc("rg_calendar_subscription", { action: "create", token_hash: d }));
          r() && i(h, yo(u));
        }, c.currentTarget), "button secondary"), a.configured ? S("Abo-Link widerrufen", (c) => W(async () => {
          if (!confirm("Deinen Kalenderlink sperren? Dein Kalender kann danach keine neuen Termine mehr abrufen.")) return;
          let u = C(await $().rpc("rg_calendar_subscription", { action: "revoke" }));
          r() && i(u);
        }, c.currentTarget), "text-button danger-text") : null));
      }
      $().rpc("rg_calendar_subscription", { action: "status" }).then((a) => i(C(a))).catch((a) => {
        r() && e.replaceChildren(E(Ue(a)), S("Erneut versuchen", yl, "button secondary"));
      });
    }
    function xd() {
      let t = p.data.events?.length || 0;
      return o("section", { class: "panel calendar-panel" }, o("p", { class: "eyebrow" }, "DEINE GARTENTERMINE"), o("h2", {}, "Dein Garten im Kalender."), o("p", { class: "muted" }, "Aussaat, Pflege, Erde oder Saatgut kaufen: eure Termine gemeinsam planen und automatisch in Apple oder Google Kalender abrufen."), ce(S("Gartentermin planen", () => wr(), "button secondary"), S(`Termine ansehen (${t})`, vi, "button secondary"), S("Kalenderabo einrichten", yl, "button secondary")), E("Das private Abo einmal in deiner Kalender-App hinzuf\xFCgen. \xC4nderungen werden beim n\xE4chsten Abruf \xFCbernommen. Apple-Zugangsdaten werden nicht ben\xF6tigt. Einzelne .ics-Dateien sind weiterhin verf\xFCgbar."));
    }
    function vl(t, e = () => He(t)) {
      let n = t.category === "Obst" && !/melone/i.test(t.name) ? "Pflanze" : "Saatgut", r = `${t.name} ${t.variety || ""} ${n}`.trim(), i = null;
      try {
        let s = new URL(t.legacy_data?.source_url);
        s.protocol === "https:" && s.hostname === "dreschflegel-saatgut.de" && (i = s.href);
      } catch {
      }
      let a = [...i ? [["Zum gepr\xFCften Katalogeintrag", i]] : [], ["Bei Dreschflegel suchen", `https://dreschflegel-saatgut.de/search?search=${encodeURIComponent(`${t.name} ${t.variety || ""}`.trim())}`], ["Weitere Anbieter suchen", `https://www.google.com/search?q=${encodeURIComponent(r + " kaufen")}`]];
      se("Saatgut / Pflanzen nachbestellen", o("div", { class: "order-options" }, o("h3", {}, `${t.name} \xB7 ${t.variety || "Ohne Sortenangabe"}`), E("Die Links \xF6ffnen einen Anbieter oder eine Suche. Verf\xFCgbarkeit, Sorte und Versandbedingungen pr\xFCfst du dort; die Bestellung schlie\xDFt du beim Anbieter ab."), o("div", { class: "share-actions" }, a.map(([s, l]) => o("a", { class: "button secondary", href: l, target: "_blank", rel: "noopener noreferrer" }, s))), ce(S("Zur\xFCck", e, "button secondary"))));
    }
    var Te = () => p.data.membership.family_id, xn = () => ri(p.data?.family?.growing_settings || {}), yr = (t = {}) => uo(p.data.plants, { ...t, regional: true, growing: xn() }), _l = (t) => (t || []).map((e) => nr[e - 1]).join(", ") || "Kein Termin hinterlegt", kr = () => {
      let t = xn();
      return `${t.location || "Mitteleuropa"} \xB7 Frostvorsorge bis ${t.last_frost.slice(3)}.${t.last_frost.slice(0, 2)}. als Planungswert, keine Wettervorhersage.`;
    };
    function ae() {
      let t = et, e = p.user?.id, n = p.data?.membership?.family_id;
      return () => !!(e && n) && t === et && e === p.user?.id && n === p.data?.membership?.family_id;
    }
    function Pn(t) {
      p.view = t, p.query = "", ue(), window.scrollTo({ top: 0 });
    }
    function xa({ category: t = "Alle", radar: e = false } = {}) {
      p.category = t, p.favorites = false, p.radar = e, p.phase = "all", Pn("plants");
    }
    async function he({ quiet: t = false } = {}) {
      if (!p.user) return;
      if (kn) return kn;
      let e = et, n = p.user.id, r = p.data, i = false, a = (async () => {
        try {
          let s = await ga(n, r);
          if (e !== et) return;
          let l = p.data?.membership?.family_id;
          i = !!(l && l !== s.membership?.family_id), i && kl(), p.data = s, p.access = s.capabilities, p.lastSync = /* @__PURE__ */ new Date(), p.error = "";
        } catch (s) {
          if (e !== et) return;
          p.error = Ue(s), t || J(p.error, true);
        } finally {
          if (e === et) {
            p.loading = false;
            let s = p.data?.plants === r?.plants && p.data?.beds === r?.beds && p.data?.notes === r?.notes && p.data?.plantings === r?.plantings && p.data?.events === r?.events && JSON.stringify(p.data?.family) === JSON.stringify(r?.family) && JSON.stringify(p.data?.members) === JSON.stringify(r?.members) && JSON.stringify(p.data?.membership) === JSON.stringify(r?.membership) && JSON.stringify(p.data?.profile) === JSON.stringify(r?.profile) && JSON.stringify(p.data?.capabilities) === JSON.stringify(r?.capabilities);
            !t || i || !s && !xe.querySelector("form[data-dirty]") && !xe.querySelector('[data-drawing="true"]') || !p.data?.membership ? ue() : (hl(), window.dispatchEvent(new Event("garden-life-refresh"))), Ei(), Pd(), ih();
          }
        }
      })();
      kn = a;
      try {
        await a;
      } finally {
        kn === a && (kn = null);
      }
    }
    async function Me(t = "Gespeichert.") {
      j.close(), J(t), await he();
    }
    async function vr(t, e) {
      if (j.open && j.contains(t)) return Me(e);
      J(e), await he({ quiet: true });
    }
    function Dd() {
      let t = { login: "Willkommen bei euren Rezepten.", register: "Dein Platz am Tisch.", reset: "Wieder Zugang finden.", password: "Ein neues Passwort." }, e = o("form", { class: "auth-form" }), n = Ae !== "password" ? G("E-Mail-Adresse", "email", "", { type: "email", autocomplete: "email", required: true, maxlength: 254 }) : null, r = ["login", "register", "password"].includes(Ae) ? G("Passwort", "password", "", { type: "password", autocomplete: Ae === "login" ? "current-password" : "new-password", required: true, minlength: Ae === "login" ? 1 : 12, maxlength: 128 }) : null, i = o("button", { class: "button full", type: "submit" }, { login: "Anmelden  \u2192", register: "Konto erstellen", reset: "Link anfordern", password: "Passwort speichern" }[Ae]);
      return e.append(...[bt ? E("Willkommen! Lege dein eigenes Passwort fest, um die Einladung in euren Familiengarten anzunehmen. Du erh\xE4ltst normale Mitgliedsrechte.") : null, n, r, bt ? G("Passwort wiederholen", "confirm_password", "", { type: "password", autocomplete: "new-password", required: true, minlength: 12, maxlength: 128 }) : null, Ae === "register" || Ae === "password" ? E("Mindestens 12 Zeichen. Eine lange, einzigartige Wortfolge ist eine gute Wahl.") : null, re(), i].filter(Boolean)), e.addEventListener("submit", (a) => {
        a.preventDefault();
        let s = new FormData(e);
        te(e, async () => {
          let l = String(s.get("email") || "").trim(), c = String(s.get("password") || "");
          if (Ae === "login") C(await $().auth.signInWithPassword({ email: l, password: c }));
          else if (Ae === "register") C(await $().auth.signUp({ email: l, password: c, options: { emailRedirectTo: location.origin + "/garten/" } })), J("Pr\xFCfe dein Postfach und best\xE4tige deine E-Mail-Adresse. Die Best\xE4tigung muss im selben Browser ge\xF6ffnet werden."), Ae = "login", ue();
          else if (Ae === "reset") C(await $().auth.resetPasswordForEmail(l, { redirectTo: location.origin + "/garten/" })), J("Wenn das Konto existiert, erh\xE4ltst du einen Link per E-Mail. \xD6ffne ihn im selben Browser.");
          else {
            if (bt && c !== s.get("confirm_password")) throw new Error("Die Passw\xF6rter stimmen nicht \xFCberein.");
            if (C(await $().auth.updateUser({ password: c })), bt) {
              if (!C(await $().rpc("rg_invitation", { action: "accept" }))?.accepted) throw new Error("Die Einladung ist nicht mehr offen. Bitte den Einladenden kontaktieren.");
              C(await $().auth.signOut({ scope: "global" })), location.replace(`${le}?invited=1`);
              return;
            }
            C(await $().auth.signOut({ scope: "global" })), Ge = false, Ae = "login", J("Passwort ge\xE4ndert. Bitte melde dich neu an."), ue();
          }
        });
      }), o("div", { class: "auth-layout" }, o("section", { class: "auth-story" }, o("a", { href: le, class: "brand light" }, o("span", { class: "brand-symbol" }, "\u2667"), "Rezepte"), o("div", { class: "story-copy" }, o("p", { class: "eyebrow" }, "ZUSAMMEN WACHSEN LASSEN"), o("h1", {}, "Gemeinsam kochen.", o("br"), "Gutes Essen genießen."), o("p", {}, "Eure Gerichte, eure Ideen und der Einkauf dazu. Ein gemeinsamer Platz für die Familie."), o("div", { class: "garden-art", "aria-hidden": "true" }, o("span", {}, "\u{1F331}"), o("span", {}, "\u{1F345}"), o("span", {}, "\u{1F33F}"))), o("p", { class: "story-foot" }, "F\xFCr die Familie. F\xFCr jede Jahreszeit.")), o("section", { class: "auth-panel" }, o("div", { class: "installation-top" }, Ua(), o("a", { href: "/garten/", class: "button secondary" }, "♧ Zum Garten")), o("div", { class: "auth-card" }, o("span", { class: "pill" }, "Eure private Rezeptsammlung"), o("h2", {}, bt ? "Dein Zugang zum Garten." : t[Ae]), o("p", { class: "muted" }, new URL(location.href).searchParams.get("invited") === "1" ? "Einladung angenommen. Melde dich jetzt mit deinem eigenen Passwort an." : "Melde dich mit deinem eigenen Konto an."), e, Ae === "login" ? o("div", { class: "auth-links" }, S("Konto erstellen", () => {
        Ae = "register", ue();
      }, "text-button"), S("Passwort vergessen?", () => {
        Ae = "reset", ue();
      }, "text-button")) : S("Zur\xFCck zur Anmeldung", () => {
        if (bt) {
          W(async () => {
            C(await $().auth.signOut({ scope: "local" })), bt = false, Ge = false, Ae = "login", location.replace(le);
          });
          return;
        }
        Ae = "login", Ge = false, ue();
      }, "text-button"), o("div", { class: "privacy-note" }, "\u2311 ", "Eure Inhalte sind nur für freigeschaltete Mitglieder sichtbar. Ihr verwendet dieselben Konten wie in der Garten-App. Auf gemeinsam genutzten Geräten bitte abmelden."), ml(), Ct())));
    }
    function Rd() {
      let t = o("form", {}, G("Name eurer Familie oder eures Gartens", "name", "Rezepte", { required: true, maxlength: 100 }), re(), o("button", { type: "submit", class: "button" }, "Gemeinsamen Garten anlegen"));
      t.addEventListener("submit", (n) => {
        n.preventDefault();
        let r = new FormData(t).get("name");
        te(t, async () => {
          C(await $().rpc("rg_create_family", { family_name: r })), await he();
        });
      });
      let e = p.data?.plants || [];
      return o("main", { class: "setup-page" }, o("div", { class: "brand" }, o("span", { class: "brand-symbol" }, "\u2667"), "Rezepte"), o("div", { class: "panel setup-card" }, o("span", { class: "pill" }, "Sch\xF6n, dass du da bist"), o("h1", {}, "Ein Garten f\xFCr euch."), o("p", { class: "muted" }, "Wenn dich jemand zur Familie hinzuf\xFCgen m\xF6chte: Lege keinen neuen Garten an. Gib der Familienverwaltung deine best\xE4tigte E-Mail-Adresse und aktualisiere danach diese Seite."), S("Mitgliedschaft pr\xFCfen", () => W(() => he()), "button secondary"), zd(e), o("hr"), o("h2", {}, "Du f\xE4ngst neu an?"), E("Erstelle einen gemeinsamen Garten. Du verwaltest anschlie\xDFend die Mitglieder."), t), S("Abmelden", pr, "text-button"), S("Eigenes Konto l\xF6schen", Pl, "text-button danger-text"), Ct());
    }
    function zd(t) {
      if (!t.length) return null;
      let e = rt(t), n = o("div", { class: "catalog-preview-grid" }, e.map((r) => S([o("span", { class: "eyebrow" }, r.category), o("strong", {}, r.name), E(`${r.plants.length} ${r.plants.length === 1 ? "Sorte" : "Sorten"} ansehen  \u2192`)], () => Od(r), "catalog-preview-card")));
      return o("section", { class: "catalog-preview", "aria-labelledby": "catalog-preview-title" }, o("p", { class: "eyebrow" }, "GEMEINSAMER SORTENKATALOG"), o("h2", { id: "catalog-preview-title" }, `${t.length} Sorten zum Entdecken`), E("Du kannst den Katalog bereits ansehen und Sorten ausw\xE4hlen. Pers\xF6nliche Beete und Notizen werden erst nach dem Beitritt zu einem Garten gespeichert."), n);
    }
    function Od(t) {
      let e = o("div", { class: "culture-varieties", role: "group", "aria-label": `Sorten von ${t.name}` }, t.plants.map((n) => S([o("strong", {}, n.variety || "Ohne Sortenangabe"), o("span", { "aria-hidden": "true" }, "\u2192")], () => Cd(n), "variety-choice")));
      se(`${t.name} \u2013 Sorten`, o("div", {}, E(`${t.plants.length} ${t.plants.length === 1 ? "Sorte" : "Sorten"} im gemeinsamen Katalog.`), e));
    }
    function Cd(t) {
      let e = _n(t);
      se(`${t.name} \xB7 ${t.variety || "Sorte"}`, o("div", { class: "catalog-plant-preview" }, o("p", { class: "pill" }, "Gemeinsamer Katalog"), o("h3", {}, t.variety || t.name), e.location ? o("p", {}, o("strong", {}, "Standort: "), e.location) : null, e.sowing ? o("p", {}, o("strong", {}, "Aussaat / Vorzucht: "), e.sowing) : null, e.harvest ? o("p", {}, o("strong", {}, "Ernte: "), e.harvest) : null, e.taste ? o("p", { class: "preserve-lines" }, o("strong", {}, "Geschmack: "), e.taste) : null, o("p", { class: "muted" }, "Nach dem Beitritt zu einem Familiengarten kannst du diese Sorte dort einem Beet zuweisen, Notizen speichern und den Anbau planen.")));
    }
    async function pr() {
      await W(async () => {
        await $a() && (C(await $().auth.signOut({ scope: "local" })), Ai(), ue());
      });
    }
    async function $a() {
      return await Promise.allSettled([...ot.values()].map((t) => t.draft.flush())), ![...ot.values()].some((t) => t.draft.state().dirty) || confirm("Einige Sortennotizen konnten nicht gespeichert werden. Entw\xFCrfe verwerfen und trotzdem abmelden?");
    }
    function kl() {
      for (let t of ot.values()) t.draft.dispose();
      ot.clear(), j.open && j.close(), j.replaceChildren();
    }
    function Ai() {
      RX.reset();
      kl(), We = null, bt = false, et++, kn = null, p = { ...p, access: p.access ? { ...p.access, maintenance_access: false } : null, user: null, data: null, error: "", query: "", loading: false, lastSync: null };
    }
    function $d() {
      let t = et, e = p.user?.id;
      return () => !!e && t === et && e === p.user?.id;
    }
    async function Ti() {
      let t = et, e = p.user?.id, n = C(await $().rpc("rg_app_capabilities"));
      t === et && e === p.user?.id && (p.access = n);
    }
    async function Da() {
      if (p.user || Ge || document.hidden) return;
      let t = Zt(p.access);
      try {
        await Ti(), t !== Zt(p.access) && ue();
      } catch {
      }
    }
    function Id() {
      let t = o("form", {}, G("E-Mail-Adresse", "email", "", { type: "email", autocomplete: "email", required: true, maxlength: 254 }), G("Passwort", "password", "", { type: "password", autocomplete: "current-password", required: true, maxlength: 128 }), re(), o("button", { type: "submit", class: "button full" }, "Als Superadmin anmelden"));
      return t.addEventListener("submit", (e) => {
        e.preventDefault();
        let n = new FormData(t);
        te(t, () => $().auth.signInWithPassword({ email: String(n.get("email")).trim(), password: n.get("password") }).then(C));
      }), o("main", { class: "setup-page maintenance-page" }, o("div", { class: "brand" }, o("span", { class: "brand-symbol", "aria-hidden": "true" }, "\u2667"), "Rezepte"), o("section", { class: "panel maintenance-card", "aria-labelledby": "maintenance-title" }, o("span", { class: "maintenance-symbol", "aria-hidden": "true" }, "\u{1F6E0}\uFE0F"), o("p", { class: "eyebrow" }, "KURZE GARTENPAUSE"), o("h1", { id: "maintenance-title" }, "Wir bearbeiten zurzeit die Web-App."), o("p", { class: "pill" }, "Zugang nur f\xFCr den Superadmin"), o("p", { class: "muted" }, "Wir verbessern die App. Deine gespeicherten Gartendaten bleiben erhalten. Bitte schaue sp\xE4ter wieder vorbei."), S("Erneut pr\xFCfen", (e) => W(async () => {
        await Ti(), p.user ? await he() : ue();
      }, e.currentTarget), "button secondary"), p.user ? [E("Dein Konto ist angemeldet. Der Gartenzugang ist w\xE4hrend der Wartung vor\xFCbergehend geschlossen."), S("Abmelden", pr, "text-button")] : o("details", { class: "maintenance-login" }, o("summary", {}, "Superadmin-Anmeldung"), t)), Ct());
    }
    function el() {
      return p.access?.maintenance && p.access?.maintenance_access ? o("aside", { class: "maintenance-banner", role: "status" }, o("strong", {}, "\u{1F6E0}\uFE0F Wartungsmodus aktiv \xB7 Zugang nur f\xFCr den Superadmin"), S("Wartung verwalten", () => Ma(true, "maintenance"), "text-button")) : null;
    }
    function ue(){
      hd();
      if(p.loading&&!p.data)return xe.replaceChildren(o('div',{class:'initial-loader'},o('span',{class:'brand-symbol'},'♧'),o('p',{},'Eure Rezepte werden geladen …')));
      if(!Ge&&Zt(p.access||p.data?.capabilities))return xe.replaceChildren(Id());
      if(!p.user||Ge)return xe.replaceChildren(Dd());
      if(!p.data)return xe.replaceChildren(o('main',{class:'setup-page'},lt('Die Anmeldung konnte nicht geprüft werden.',p.error||'Bitte Verbindung prüfen.',S('Erneut versuchen',()=>he())),S('Abmelden',pr,'text-button')));
      if(p.data.capabilities?.blocked)return xe.replaceChildren(o('main',{class:'setup-page'},lt('Dein Zugang ist gesperrt.','Bitte den Betreiber kontaktieren.'),S('Abmelden',pr,'button')));
      if(!p.data.membership)return xe.replaceChildren(o('main',{class:'setup-page'},o('h1',{},'Fast geschafft.'),o('p',{},'Dein bestätigtes Konto muss zuerst vom Betreiber freigeschaltet werden. Garten und Rezepte verwenden denselben Zugang.'),S('Freigabe prüfen',()=>he(),'button secondary'),S('Abmelden',pr,'text-button'),o('a',{href:'/garten/',class:'text-button'},'Zur Garten-App')));
      xe.replaceChildren(RX.render());Oa();
    }
    function Bd() {
      let t = o("input", { type: "search", id: "home-plant-search", placeholder: "Pflanze oder Sorte suchen \u2026", "aria-label": "Pflanzen auf der Startseite suchen" }), e = S("\xD7", () => {
        t.value = "", e.hidden = true, delete n.dataset.dirty, t.focus();
      }, "icon-button search-clear", { "aria-label": "Startseitensuche leeren", hidden: true });
      t.addEventListener("input", () => {
        e.hidden = !t.value;
      });
      let n = o("form", { class: "home-search", role: "search" }, o("div", { class: "search-wrap" }, o("span", { "aria-hidden": "true" }, "\u2315"), t, e), o("button", { type: "submit", class: "button" }, "Suchen"));
      n.addEventListener("submit", (i) => {
        i.preventDefault();
        let a = t.value.trim();
        p.query = a, p.category = "Alle", p.favorites = false, p.radar = false, p.phase = "all", p.view = "plants", ue(), window.scrollTo(0, 0), document.getElementById("plant-search")?.focus({ preventScroll: true });
      });
      let r = (i, a, s, l) => S([o("span", { class: "home-action-icon", "aria-hidden": "true" }, za(i)), o("span", {}, a)], s, "home-action", { "aria-label": l });
      return o("section", { class: "home-tools", "aria-label": "Suchen und Garten-KI" }, n, o("div", { class: "home-quick-actions" }, r("sparkle", `${Et()} fragen`, xl, `${Et()} fragen`), r("camera", "T\xFCtchen scannen", Ka, "T\xFCtchen fotografieren")));
    }
    function Ld() {
      let t = p.data, e = ja.current(), n = yr({ radar: true }), r = rt(n), i = (/* @__PURE__ */ new Date()).toLocaleDateString("de-DE", { month: "long" }), a = o("div", { class: "category-grid sowing-categories", role: "group", "aria-label": "Pflanzenkategorien" }, fa.map((s) => {
        let l = yr({ category: s }).length;
        return ul(s, () => {
          xa({ category: s });
          let c = document.querySelector(".page-header h1");
          c.tabIndex = -1, c.focus({ preventScroll: true });
        }, { count: l, className: "sowing-category", "aria-label": s === "Alle" ? `Alle: ${l} Eintr\xE4ge \u2013 gesamten Katalog \xF6ffnen` : `${s}: ${l} Eintr\xE4ge \u2013 alle Sorten ansehen` });
      }));
      return o("div", { class: "overview-content" }, Bd(), yt ? gd() : null, o("section", { class: "hero", "data-saying-card": "", "data-saying-id": `${e.tag}:${e.id}` }, o("div", { class: "hero-copy" }, o("span", { class: "hero-tag", "data-saying-part": "tag" }, e.tag), o("h2", { "data-saying-part": "title" }, e.title), o("p", { "data-saying-part": "description" }, e.description), o("div", { class: "hero-actions" }, S("Zu meinen Beeten  \u2192", () => Pn("beds"), "button cream"), S("Pflanze hinzuf\xFCgen", () => Sr(), "button ghost"))), o("div", { class: "hero-illustration", "aria-hidden": "true" }, o("div", { class: "sun" }), o("span", { class: "sprout sprout-one", "data-season-art": "0" }, je.art[0]), o("span", { class: "sprout sprout-two", "data-season-art": "1" }, je.art[1]), o("div", { class: "soil" }))), o("div", { class: "stats" }, [["Katalogeintr\xE4ge", t.plants.length, "\u2667", "plants"], ["Beete angelegt", t.beds.length, "\u25A4", "beds"], ["Gartennotizen", t.notes.length, "\u270E", "notes"]].map(([s, l, c, u]) => S([o("div", {}, o("span", { class: "muted small" }, s), o("strong", {}, l)), o("span", { class: "stat-icon", "aria-hidden": "true" }, c)], () => {
        u === "plants" && (p.category = "Alle", p.favorites = false, p.radar = false, p.phase = "all"), Pn(u);
      }, "stat", { "aria-label": `${s}: ${l} \u2013 \xF6ffnen` }))), Fa.home(), o("section", { class: "sowing-section", "aria-labelledby": "sowing-title" }, o("div", { class: "section-heading" }, o("div", {}, o("p", { class: "eyebrow" }, "IM RHYTHMUS DER JAHRESZEITEN"), o("h2", { id: "sowing-title" }, "Jetzt ist Aussaatzeit f\xFCr\xA0\u2026")), S("Alle Pflanzen ansehen  \u2192", () => xa(), "text-button")), E(`Vorziehen, Direktsaat und Pflanzen im ${i}. ${kr()} Saatgutangaben haben Vorrang. Die Kategorien \xF6ffnen alle Sorten; \u201EAussaat jetzt\u201C kannst du dort selbst einschalten.`), a, n.length ? o("div", { class: "plant-grid" }, r.slice(0, 4).map((s) => Sl(s, { radar: true }))) : lt("Alles zu seiner Zeit.", t.plants.length ? "F\xFCr diesen Monat sind bei euren Pflanzen keine Aussaattermine hinterlegt." : "Legt eure ersten Pflanzen an. Dann seht ihr hier, was gerade ges\xE4t werden kann.", S("Pflanzen entdecken", () => xa(), "button secondary"))), o("div", { class: "bottom-panels" }, o("section", { class: "panel" }, o("p", { class: "eyebrow" }, "EINE IDEE F\xDCR SP\xC4TER"), o("h2", {}, "Gute Gedanken bleiben."), o("p", { class: "muted" }, "Was hat dieses Jahr gut geklappt? Welche Sorte m\xF6chtest du wieder anbauen?"), S("Notiz schreiben  \u2197", () => Sn(), "button secondary")), o("section", { class: "panel scanner-panel" }, o("span", { class: "pill" }, "Mit pr\xFCfender Hand"), o("h2", {}, "Vom T\xFCtchen ins Beet."), o("p", { class: "muted" }, "Saatgut fotografieren, Angaben pr\xFCfen und als Pflanze \xFCbernehmen."), S("T\xFCtchen scannen  \u2197", Ka, "button secondary"))));
    }
    function Sl(t, e) {
      let n = _n(t.plants[0]).icon, r = t.plants.length;
      return o("article", { class: "plant-card culture-card" }, S([o("span", { class: `plant-visual visual-${si.indexOf(t.category)}` }, o("span", { class: "plant-emoji", "aria-hidden": "true" }, n)), o("span", { class: "culture-card-copy" }, o("span", { class: "eyebrow plant-category" }, t.category), o("span", { class: "culture-card-title" }, t.name), o("span", { class: "culture-card-count" }, `${r} passende ${r === 1 ? "Sorte" : "Sorten"}`), e?.radar ? o("span", { class: "culture-tasks" }, [...new Set(t.plants.flatMap((i) => wn(i, { growing: xn(), phase: e.phase || "all" })))].map((i) => Ie[i]).join(" \xB7 ") || "Gartentermin pr\xFCfen") : null, o("span", { class: "culture-card-link", "aria-hidden": "true" }, "Sorten ausw\xE4hlen  \u2192"))], () => Ia(t, e), "culture-open", { "aria-label": `${t.name}: ${r} passende ${r === 1 ? "Sorte" : "Sorten"} \u2013 ausw\xE4hlen` }));
    }
    function Ia(t, e) {
      if (!p.data?.membership) return;
      let n = rt(yr(e)).find((a) => a.key === t.key);
      if (!n?.plants.length) return j.close(), J("F\xFCr diese Kultur passen gerade keine Sorten zu den Filtern. Bitte aktualisiere die Auswahl.");
      let r = n.plants.length, i = o("div", { class: "culture-varieties", role: "group", "aria-label": `Sorten von ${n.name}` }, n.plants.map((a) => o("div", { class: "variety-choice-row" }, S([o("span", {}, o("strong", {}, a.variety || "Ohne Sortenangabe"), e?.radar ? o("span", { class: "muted small" }, wn(a, { growing: xn(), phase: e.phase || "all" }).map((s) => Ie[s]).join(" \xB7 ") || "Gartentermin pr\xFCfen") : null), o("span", { "aria-hidden": "true" }, "\u2192")], () => He(a), "variety-choice", { "aria-label": `${a.variety || "Ohne Sortenangabe"} \u2013 Details \xF6ffnen` }), a.category !== "Garten-Praxis" ? S("\u{1F6D2}", () => vl(a, () => Ia(t, e)), "variety-order", { "aria-label": `Saatgut f\xFCr ${a.variety || a.name} nachbestellen` }) : null, S(a.favorite ? "\u2605" : "\u2606", (s) => W(async () => {
        let l = ae();
        await ze("rg_plants", Te(), { favorite: !a.favorite }, a), l() && (await he(), l() && j.open && j.contains(i) && Ia(t, e));
      }, s.currentTarget), `variety-favorite ${a.favorite ? "selected" : ""}`, { "aria-label": `${a.name} \xB7 ${a.variety || "Ohne Sortenangabe"} ${a.favorite ? "aus Favoriten entfernen" : "als Favorit merken"}`, "aria-pressed": String(a.favorite) }))));
      se(`${n.name} \u2013 Sorte ausw\xE4hlen`, o("div", {}, E(`${r} passende ${r === 1 ? "Sorte" : "Sorten"} f\xFCr deine Auswahl. W\xE4hle eine Sorte, um alle Angaben zu sehen.`), i));
    }
    function Nd() {
      let t = o("div", { id: "plant-results" }), e = o("p", { class: "plant-results-summary muted small", role: "status", "aria-live": "polite", "aria-atomic": "true" }), n, r = o("input", { id: "plant-search", type: "search", placeholder: "Pflanze oder Sorte suchen \u2026", value: p.query, "aria-label": "Pflanzen durchsuchen", oninput: (s) => {
        p.query = s.target.value, n.hidden = !p.query, i();
      } });
      n = S("\xD7", () => {
        p.query = "", r.value = "", n.hidden = true, i(), r.focus({ preventScroll: true });
      }, "icon-button search-clear", { "aria-label": "Suche leeren", title: "Suche leeren", "aria-controls": "plant-results", hidden: !p.query });
      let i = () => {
        let s = yr(p), l = rt(s), c = (/* @__PURE__ */ new Date()).toLocaleDateString("de-DE", { month: "long" });
        e.textContent = `${s.length} ${s.length === 1 ? "Eintrag" : "Eintr\xE4ge"} in ${l.length} ${l.length === 1 ? "Gruppe" : "Gruppen"} \xB7 ${p.category === "Alle" ? "Alle Kategorien" : p.category}${p.radar ? ` \xB7 Aussaat & Pflanzung im ${c}` : ""}`;
        let u = p.radar && !p.query.trim() && !p.favorites && p.data.plants.length;
        t.replaceChildren(s.length ? o("div", { class: "plant-grid" }, l.map((d) => Sl(d, { query: p.query, category: p.category, favorites: p.favorites, radar: p.radar, phase: p.phase }))) : u ? lt("Diesen Monat ist hier noch Ruhe.", `F\xFCr diese Auswahl sind im ${c} keine Aussaat- oder Pflanztermine hinterlegt.`, S("Alle Termine dieser Kategorie", () => {
          p.radar = false, ue();
        }, "button secondary")) : lt("Hier w\xE4chst noch etwas Neues.", p.data.plants.length ? "Passe deine Suche oder die Filter an." : "F\xFCge eigene Pflanzen hinzu oder starte mit sechs bearbeitbaren Orientierungshilfen f\xFCr den Garten.", p.data.plants.length ? S("Filter zur\xFCcksetzen", () => {
          p.query = "", p.category = "Alle", p.favorites = false, p.radar = false, ue();
        }, "button secondary") : S("Mit sechs Pflanzen starten", (d) => W(jd, d.currentTarget), "button secondary")));
      };
      i();
      let a = o("select", { id: "sowing-phase", onchange: (s) => {
        p.phase = s.target.value, ue();
      } }, [["all", "Alle Anbauschritte"], ...Object.entries(Ie)].map(([s, l]) => o("option", { value: s, selected: s === p.phase }, l)));
      return o("div", {}, o("p", { class: "catalog-total" }, `${rt(p.data.plants).length} Kulturen & Themen \xB7 ${p.data.plants.length} Sorten & Eintr\xE4ge`), o("div", { class: "toolbar" }, o("div", { class: "search-wrap" }, o("span", { "aria-hidden": "true" }, "\u2315"), r, n), o("div", { class: "toolbar-actions" }, S("T\xFCtchen scannen", Ka, "button secondary"), S("+ Pflanze", () => Sr()))), o("section", { class: "plant-filters", "aria-label": "Pflanzen filtern" }, o("h2", { class: "category-heading", id: "plant-category-heading" }, "Kategorien"), o("div", { class: "category-grid plant-categories", role: "group", "aria-labelledby": "plant-category-heading" }, fa.map((s, l) => {
        let c = `plant-category-${l}`;
        return ul(s, () => {
          p.category = s, s === "Alle" && (p.radar = false, p.phase = "all"), ue(), document.getElementById(c)?.focus({ preventScroll: true });
        }, { id: c, active: p.category === s, "aria-label": s, "aria-pressed": String(p.category === s) });
      })), o("div", { class: "plant-quick-filters", role: "group", "aria-label": "Weitere Pflanzenfilter" }, S("\u2606 Favoriten", () => {
        p.favorites = !p.favorites, ue();
      }, `chip ${p.favorites ? "active" : ""}`, { "aria-pressed": String(p.favorites) }), S("\u25F7 Aussaat jetzt", () => {
        p.radar = !p.radar, ue();
      }, `chip ${p.radar ? "active" : ""}`, { "aria-pressed": String(p.radar) }))), p.radar ? o("div", { class: "sowing-controls" }, o("label", { for: "sowing-phase" }, "Anbauschritt"), a, E(kr())) : null, p.category === "Schattige Pl\xE4tze" ? o("details", { class: "detail-section-accordion shade-guide" }, o("summary", {}, o("span", {}, "\u{1F324}\uFE0F Was w\xE4chst im Schatten?"), o("span", { class: "detail-section-hint" }, "Hinweise f\xFCr Pl\xE4tze unter B\xE4umen")), o("div", { class: "detail-section-content" }, E("Diese Auswahl meint Halbschatten und lichte Baumkronen. Dichter Vollschatten und starke Wurzelkonkurrenz begrenzen den Ertrag. Gem\xFCse braucht meist einige Stunden Licht; Obst reift mit weniger Sonne oft sp\xE4ter und weniger s\xFC\xDF."), E("Unter vorhandenen B\xE4umen Abstand zum Stamm halten, gro\xDFe Wurzeln nicht verletzen, Feuchtigkeit pr\xFCfen und ausreichend w\xE4ssern. Ob die Sorte dort passt, steht unter \u201EStandort & Pflege\u201C."))) : null, e, t);
    }
    async function jd() {
      C(await $().from("rg_plants").insert(ho.map((t) => ({ ...t, family_id: Te() })))), J("Sechs Pflanzen wurden angelegt. Passe die Angaben an eure Sorten und euren Standort an."), await he();
    }
    function xi({ path: t = null, preparedPhoto: e = null, label: n = "T\xFCtchenfoto", loadPhoto: r = vn, personal: i = false } = {}) {
      let a = ae(), s = `photo-${crypto.randomUUID()}`, l = o("img", { alt: n, class: "seed-photo-preview", hidden: true }), c = o("p", { class: "muted small", role: "status" }), u = o("input", { type: "checkbox" }), d = o("input", { id: s, type: "file", accept: "image/jpeg,image/png,image/webp" }), h = o("input", { type: "file", accept: "image/jpeg,image/png,image/webp", capture: "environment", "aria-label": `${n} aufnehmen`, class: "camera-input" }), g = o("section", { class: "photo-editor" }, o("h3", {}, n), E(`${i ? "Optional \xB7 zun\xE4chst nur f\xFCr dich." : "Optional \xB7 nur f\xFCr deine Familie."} Gespeichert wird ein neues JPEG mit h\xF6chstens 1280 Pixeln und 256 KB ohne \xFCbernommene Metadaten. Das Original wird nicht hochgeladen.`), o("label", { class: "button secondary photo-camera" }, "\u{1F4F7} Foto aufnehmen", h), o("label", { class: "field", for: s }, o("span", {}, "Foto ausw\xE4hlen oder ersetzen (max. 15 MB)"), d), l, c, o("label", { class: "consent" }, u, o("span", {}, "Foto entfernen / ohne Foto speichern"))), f = null, m = Promise.resolve(e), b = false, v = (k) => {
        if (f && URL.revokeObjectURL(f), f = null, !k) {
          l.hidden = true, l.removeAttribute("src"), c.textContent = t ? "Ein verkleinertes Foto ist gespeichert." : "";
          return;
        }
        f = URL.createObjectURL(k.blob), l.src = f, l.hidden = false, c.textContent = `${k.width ?? ""}${k.width ? " \xD7 " : ""}${k.height ?? ""}${k.width ? " Pixel \xB7 " : ""}${Math.ceil(k.blob.size / 1024)} KB \xB7 Original wird nicht hochgeladen.`;
      };
      v(e), t && !e && r(t).then((k) => {
        !b && a() && g.isConnected && !u.checked && m === y && v({ blob: k });
      }).catch(() => {
        !b && g.isConnected && (c.textContent = "Das gespeicherte Foto konnte nicht geladen werden.");
      });
      let y = m;
      for (let k of [d, h]) k.addEventListener("change", () => {
        let _ = k.files[0];
        c.textContent = _ ? "Foto wird verkleinert \u2026" : "";
        let T = _ ? ir(_) : Promise.resolve(null);
        m = T, T.then((I) => {
          !b && a() && m === T && g.isConnected && (u.checked = false, v(I));
        }).catch((I) => {
          !b && m === T && g.isConnected && (c.textContent = Ue(I));
        });
      });
      return { node: g, getPhoto: () => u.checked ? Promise.resolve(null) : m, remove: () => u.checked, cleanup() {
        b = true, f && URL.revokeObjectURL(f);
      } };
    }
    function Sr(t = null, e = null, n = null) {
      let r = t || e || { name: "", variety: "", category: "Gem\xFCse", months: [], favorite: false, source: "manual" }, i = bn(r), a = ae(), s = At(), l = r.source, c = "", u = o("input", { type: "checkbox", checked: !t && !e }), d = o("p", { class: "muted small", role: "status" }), h = S(`Mit ${Et(s)} erg\xE4nzen`, () => T(true), "button secondary"), g = o("section", { class: "ai-enrichment" }, o("h3", {}, `Neue Sorte mit ${Et(s)} erg\xE4nzen`), o("label", { class: "consent" }, u, o("span", {}, "Neue, noch nicht vorhandene Sorten nach der Eingabe automatisch erg\xE4nzen lassen.")), E(`Kultur, Sortenname und Gartenregion werden daf\xFCr an ${Ce(s)} gesendet. Geschmack, Standort, Saattiefe und Pflege sind KI-Vorschl\xE4ge. Pr\xFCfe sie vor \u201EPflanze speichern\u201C am T\xFCtchen. Unbekannte Daten d\xFCrfen leer bleiben.`), en("plant-ai-model", s), h, d), f = o("input", { type: "checkbox", name: "custom_schedule", checked: !i.estimated }), m = Object.keys(Ie).map((D) => o("fieldset", { class: "month-field" }, o("legend", {}, Ie[D]), o("div", { class: "month-checks" }, nr.map((x, w) => o("label", {}, o("input", { type: "checkbox", name: D, value: w + 1, checked: i[D]?.includes(w + 1) }), o("span", {}, x)))))), b = xi({ path: r.photo_path, preparedPhoto: n, label: "T\xFCtchenfoto" }), v = o("form", {}, e ? o("div", { class: "callout" }, "KI-Vorschlag: Pr\xFCfe alle Angaben am T\xFCtchen. Erst mit \u201EPflanze speichern\u201C wird ein Eintrag angelegt.") : null, o("div", { class: "form-grid" }, G("Pflanzenname", "name", r.name, { required: true, maxlength: 100 }), G("Sorte", "variety", r.variety, { maxlength: 100 }), G("Kategorie", "category", r.category, { select: si }), G("Standort", "location", r.location, { maxlength: 300 }), G("Pflanzabstand", "spacing", r.spacing, { maxlength: 100 }), G("Erntezeit", "harvest", r.harvest, { maxlength: 300 })), g, G("Aussaat & Vorzucht", "sowing", r.sowing, { maxlength: 300 }), o("details", { class: "schedule-editor" }, o("summary", {}, "Termine je Anbauschritt bearbeiten"), E("Vorausgef\xFCllte Angaben sind allgemeine Kultur-Richtwerte. \xDCbernimm nur passende Termine vom T\xFCtchen."), o("label", { class: "consent" }, f, o("span", {}, "Eigene Termine f\xFCr diese Sorte verwenden")), m), G("Pflege & Hinweise", "care", r.care, { area: true, maxlength: 4e3 }), b.node, re(), ce(S("Abbrechen", () => j.close(), "button secondary"), o("button", { type: "submit", class: "button" }, "Pflanze speichern"))), y = v.elements.namedItem("name"), k = v.elements.namedItem("variety"), _ = o("datalist", { id: "culture-names" }, rt(p.data.plants).map((D) => o("option", { value: D.name })));
      y.setAttribute("list", "culture-names"), v.append(_);
      let T = async (D = false) => {
        let x = y.value.trim(), w = k.value.trim();
        if (!x || !w) {
          d.textContent = "Bitte zuerst Kultur und Sortenname eingeben.";
          return;
        }
        if (p.data.plants.find((q) => q.name.localeCompare(x, "de", { sensitivity: "base" }) === 0 && q.variety.localeCompare(w, "de", { sensitivity: "base" }) === 0) && !D) {
          d.textContent = "Diese Sorte ist bereits im Katalog. Ein erneuter KI-Aufruf ist nicht n\xF6tig.";
          return;
        }
        let F = JSON.stringify([x, w, Tn(s)]);
        if (F === c && !D) return;
        c = F, d.textContent = `${Et(s)} erg\xE4nzt die Sorte \u2026`;
        let z = false;
        await te(v, async () => {
          let q = await Dt({ mode: "variety", provider: s, name: x, variety: w, region: xn().location || "Mitteleuropa", model: Tn(s), consent: true });
          if (!a() || !j.contains(v)) return;
          let ne = yn(q.plant);
          for (let R of ["location", "spacing", "sowing", "harvest", "care"]) {
            let U = v.elements.namedItem(R);
            U.value.trim() || (U.value = ne[R]);
          }
          if (!t && v.elements.namedItem("category").value === "Gem\xFCse" && (v.elements.namedItem("category").value = ne.category), ne.schedule && Object.keys(ne.schedule).length && !f.checked) {
            f.checked = true;
            for (let R of Object.keys(Ie)) for (let U of v.querySelectorAll(`input[name="${R}"]`)) U.checked = ne.schedule[R]?.includes(Number(U.value)) || false;
          }
          l = "ai", z = true, d.textContent = "KI-Vorschlag erg\xE4nzt. Eigene ausgef\xFCllte Felder wurden beibehalten. Bitte alle Angaben pr\xFCfen und speichern." + (q.uncertainty ? " " + q.uncertainty : "");
        }), !z && a() && j.contains(v) && (d.textContent = "Die automatische Erg\xE4nzung hat nicht geklappt. Du kannst die Angaben manuell eintragen oder die KI erneut versuchen.");
      }, I = () => {
        u.checked && !t && T();
      };
      y.addEventListener("change", () => {
        let D = p.data.plants.find((x) => x.name.localeCompare(y.value.trim(), "de", { sensitivity: "base" }) === 0);
        D && (y.value = D.name, v.elements.namedItem("category").value = D.category), k.value.trim() && I();
      }), k.addEventListener("change", I), v.addEventListener("submit", (D) => {
        D.preventDefault();
        let x = new FormData(v), w = Object.fromEntries(x);
        w.favorite = r.favorite, w.source = l, w.months = r.months || [], w.schedule = x.has("custom_schedule") ? Object.fromEntries(Object.keys(Ie).map((P) => [P, x.getAll(P).map(Number)])) : {}, x.has("custom_schedule") && (w.months = [...new Set(Object.values(w.schedule).flat())].sort((P, F) => P - F)), te(v, async () => {
          let P = await b.getPhoto();
          if (!a() || !j.contains(v)) return;
          let F = yn(w), z = null;
          try {
            if (P && (z = await ar(P, Te())), !a() || !j.contains(v)) {
              z && await Qe(z).catch(() => {
              });
              return;
            }
            F.photo_path = z || (b.remove() ? null : r.photo_path || null), await ze("rg_plants", Te(), F, t);
          } catch (q) {
            throw z && await Qe(z).catch(() => {
            }), q;
          }
          a() && (r.photo_path && (z || b.remove()) && await Qe(r.photo_path).catch(() => J("Die Pflanze ist gespeichert; das bisherige Foto konnte noch nicht entfernt werden.", true)), await Me("Pflanze gespeichert."));
        });
      }), se(t ? "Pflanze bearbeiten" : "Eine neue Pflanze", v, { cleanup: b.cleanup });
    }
    function Gd(t) {
      let e = ot.get(t.id), n = p.data.notes.find((u) => u.plant_id === t.id) || null;
      if (e) !e.draft.state().dirty && !e.draft.state().saving && (e.original = n, e.draft.reset(n?.content || ""));
      else {
        let u = Te(), d = p.user.id, h = et, g = () => h === et && p.user?.id === d && p.data?.membership?.family_id === u;
        e = { original: n, draft: null }, e.draft = No({ value: n?.content || "", active: g, persist: async (f) => {
          if (!g()) throw new Error("Bitte melde dich erneut an.");
          let m = e.original, b = null;
          f.trim() ? b = await ze("rg_notes", u, { title: m?.title || `Notiz: ${t.name}${t.variety ? " \xB7 " + t.variety : ""}`.slice(0, 150), content: f, plant_id: t.id }, m) : m && await nt("rg_notes", u, m), g() && (e.original = b, p.data.notes = p.data.notes.filter((v) => v.id !== m?.id && v.id !== b?.id), b && p.data.notes.unshift(b));
        } }), ot.set(t.id, e);
      }
      let r = o("textarea", { id: "plant-note", rows: 4, maxlength: 12e3, placeholder: "Wie w\xE4chst diese Sorte bei euch? Was m\xF6chtest du festhalten?", oninput: (u) => e.draft.set(u.target.value), onblur: () => {
        e.draft.state().error || e.draft.flush().catch(() => {
        });
      } }, e.draft.state().value), i = o("p", { class: "detail-note-status", role: "status", "aria-live": "polite" }), a = o("div", { class: "note-comparison", hidden: true }), s = S("Notiz speichern", (u) => W(() => e.draft.flush(), u.currentTarget), "detail-secondary"), l = S("Gespeicherten Stand anzeigen", (u) => W(async () => {
        let d = C(await $().from("rg_notes").select("*").eq("family_id", Te()).eq("plant_id", t.id).maybeSingle()), h = async (g) => {
          e.draft.state().saving || (e.original = d, p.data.notes = p.data.notes.filter((f) => f.plant_id !== t.id), d && p.data.notes.unshift(d), a.hidden = true, g ? await e.draft.flush() : (e.draft.reset(d?.content || ""), r.value = d?.content || ""));
        };
        a.replaceChildren(o("strong", {}, "Aktuell gespeicherte Notiz"), o("p", { class: "preserve-lines" }, d?.content || "Keine Notiz gespeichert."), ce(S("Gespeicherten Text \xFCbernehmen", (g) => W(() => h(false), g.currentTarget), "detail-secondary"), S("Meinen Text speichern", (g) => W(() => h(true), g.currentTarget), "detail-primary"))), a.hidden = false;
      }, u.currentTarget), "detail-secondary"), c = e.draft.subscribe((u) => {
        r.value !== u.value && (r.value = u.value), i.textContent = u.error ? `Speichern fehlgeschlagen: ${Ue(u.error)} Dein Entwurf bleibt hier erhalten.` : u.saving ? "Wird gespeichert \u2026" : u.dirty ? "Ungespeicherte \xC4nderungen \u2026" : e.original ? "Automatisch gespeichert." : "F\xFCr deine Familie sichtbar. Speichert automatisch.", i.classList.toggle("has-error", !!u.error), s.disabled = u.saving || !u.dirty, l.hidden = !u.error;
      });
      return { node: o("section", { class: "detail-note" }, o("label", { for: "plant-note" }, "\u{1F4DD} Meine Garten-Notizen"), E(`Zu ${t.variety || t.name} \xB7 gemeinsam mit der Familie`), r, i, ce(s, l), a), cleanup() {
        c(), e.draft.state().error || e.draft.flush().catch(() => J("Deine Sortennotiz konnte nicht gespeichert werden. \xD6ffne die Sorte erneut; dein Entwurf bleibt bis zum Abmelden erhalten.", true));
      } };
    }
    function Fd(t) {
      let e = At(), n = ae(), r = o("div", { class: "ai-answer preserve-lines", "aria-live": "polite" }), i = o("form", { class: "detail-ai-question" }, E(`${t.name} \xB7 ${t.variety || "Ohne Sortenangabe"}`), G("Deine Frage zu dieser Sorte", "question", "", { area: true, required: true, maxlength: 2e3, placeholder: "Zum Beispiel: Wie erkenne ich, wann diese Sorte erntereif ist?" }), en("detail-question-ai-model", e), E(`Deine Frage und die gespeicherten Anbaudaten dieser Sorte werden an ${Ce(e)} \xFCbermittelt. Familiennotizen und Fotos werden nicht mitgesendet. KI kann sich irren.`), re(), o("button", { type: "submit", class: "button" }, "Frage zur Sorte senden"), r);
      return i.addEventListener("submit", (a) => {
        a.preventDefault();
        let s = new FormData(i), l = s.get("question"), c = s.get("model");
        te(i, async () => {
          r.textContent = "Die Antwort wird vorbereitet \u2026";
          try {
            let u = await Dt({ mode: "question", provider: e, model: c, question: l, plant_id: t.id });
            n() && j.contains(i) && (r.textContent = u.answer);
          } catch (u) {
            throw n() && j.contains(i) && (r.textContent = ""), u;
          }
        });
      }), o("details", { class: "detail-ai-accordion detail-section-accordion" }, o("summary", {}, o("span", {}, `\u2728 ${Et(e)} zur Sorte fragen`)), i);
    }
    function He(t) {
      let e = p.data.plants.find((R) => R.id === t.id);
      if (!e) return J("Die Pflanze ist nicht mehr vorhanden. Bitte aktualisiere die Ansicht.", true);
      let n = _n(e), r = Lo(p.data.plants, e), i = Gd(e), a = (/* @__PURE__ */ new Date()).getFullYear(), s = p.data.plantings.filter((R) => R.plant_id === e.id && (R.season_year ?? a) === a), l = s.length ? new Set(s.map((R) => R.status)).size === 1 ? s[0].status : "mixed" : "none", c = async (R) => {
        if (!s.length) {
          R !== "none" && Ba(e, null, { status: R, onSaved: () => He(e) });
          return;
        }
        if (R === "none" && !confirm(`Alle Beetzuweisungen f\xFCr \u201E${e.variety || e.name}\u201C entfernen?`)) return;
        let U = ae();
        try {
          C(await $().rpc("rg_set_plant_beds", { selected_plant: e.id, selected_year: a, selections: R === "none" ? [] : s.map((L) => ({ bed_id: L.bed_id, status: R, quantity: L.quantity ?? 1, position: L.position || "" })), expected_versions: s.map((L) => ({ id: L.id, version: L.version })) }));
        } finally {
          U() && (await he(), U() && He(e));
        }
      }, u = !!(e.is_catalog && e.family_id !== Te()), d = o("fieldset", { class: "detail-status-buttons", disabled: u }, o("legend", { class: "visually-hidden" }, "Beet-Status \xE4ndern"), [["none", "\u2715 Nicht im Beet"], ["geplant", "\u{1F4CB} Geplant"], ["ges\xE4t", "\u{1F331} Ges\xE4t"], ["gepflanzt", "\u{1FAB4} Gepflanzt"], ["geerntet", "\u{1F9FA} Geerntet"]].map(([R, U]) => S(U, (L) => W(async () => {
        d.disabled = true;
        try {
          await c(R);
        } finally {
          d.disabled = false;
        }
      }, L.currentTarget), `detail-status-button ${l === R ? "selected" : ""}`, { "aria-pressed": String(l === R), disabled: l === R || u }))), h = (R, U, L = false) => o("div", { class: `detail-fact ${L ? "wide" : ""}` }, o("span", {}, R), o("strong", {}, U || "Noch nicht eingetragen")), g = (R, U, L) => L ? o("section", { class: `detail-info info-${R}` }, o("h3", {}, U), o("p", { class: "preserve-lines" }, L)) : null, f = () => Ad(e), m = o("div", { class: "plant-detail-heading" }, o("div", { class: "detail-grip", "aria-hidden": "true" }), o("div", { class: "detail-title-row" }, o("h2", { id: "dialog-title" }, n.icon + " " + e.name), o("div", { class: "detail-heading-actions" }, S("\u2197 Teilen", f, "detail-share"))), o("div", { class: "detail-badges" }, o("span", {}, n.category), n.nutrients ? o("span", {}, n.nutrients) : null, n.water ? o("span", { class: "detail-water" }, n.water) : null)), b = o("div", { class: "detail-variety-tabs", role: "tablist", "aria-label": "Verf\xFCgbare Sorten" }, r.map((R) => S(R.variety || "Ohne Sortenangabe", () => {
        He(R), j.querySelector('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true });
      }, `detail-variety ${R.id === e.id ? "selected" : ""}`, { role: "tab", id: `variety-${R.id}`, "aria-selected": String(R.id === e.id), "aria-controls": "selected-variety", tabindex: R.id === e.id ? "0" : "-1", onkeydown: (U) => {
        if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(U.key)) return;
        U.preventDefault();
        let L = r.findIndex((ee) => ee.id === e.id), oe = U.key === "Home" ? 0 : U.key === "End" ? r.length - 1 : (L + (U.key === "ArrowRight" ? 1 : -1) + r.length) % r.length;
        He(r[oe]), j.querySelector('[role="tab"][aria-selected="true"]')?.focus({ preventScroll: true });
      } }))), v = bn(e), y = St(e), k = ae(), _ = null, T = o("img", { alt: `Saatgutt\xFCtchen: ${e.name} ${e.variety || ""}`, class: "seed-photo-preview", hidden: true }), I = o("figcaption", { class: "muted small" }, "T\xFCtchenfoto wird geladen \u2026"), D = e.photo_path ? o("figure", { class: "seed-photo-figure" }, T, I) : null, x = o("section", { class: "detail-growing-plan" }, o("h3", {}, "\u{1F4C5} Anbauplanung"), o("div", { class: "detail-facts" }, Object.keys(Ie).map((R) => h(Ie[R], _l(v[R])))), E(`${kr()} ${v.estimated ? "Allgemeine Kultur-Richtwerte; f\xFCr diese Sorte bitte am Saatgutt\xFCtchen pr\xFCfen." : "Eigene Termine f\xFCr diese Sorte."}`), y?.family ? E(`Pflanzenfamilie: ${y.family}${y.rotation ? ` \xB7 empfohlene Anbaupause: mindestens ${y.rotation} Jahre` : ""}.`) : null, S("Zum Kalender hinzuf\xFCgen", () => wr({ plant: e, back: () => He(e) }), "button secondary calendar-shortcut")), w = (R, U, { open: L = false, hint: oe = "" } = {}) => o("details", { class: "detail-section-accordion", open: L }, o("summary", {}, o("span", {}, R), oe ? o("span", { class: "detail-section-hint" }, oe) : null), o("div", { class: "detail-section-content" }, U)), P = o("span", { class: "detail-section-hint" }), F = () => {
        P.textContent = i.node.querySelector("textarea").value.trim() ? "Notizen vorhanden" : "Noch keine Notizen";
      };
      F(), i.node.addEventListener("input", F);
      let z = w("\u{1F4DD} Meine Notizen", i.node);
      z.querySelector("summary").append(P);
      let q = D ? w("\u{1F4F7} T\xFCtchenfoto", D, { hint: "Foto erst beim \xD6ffnen laden" }) : null;
      if (q) {
        let R = false;
        q.addEventListener("toggle", () => {
          !q.open || R || (R = true, vn(e.photo_path).then((U) => {
            k() && j.contains(D) && (_ = URL.createObjectURL(U), T.src = _, T.hidden = false, I.textContent = `Privates T\xFCtchenfoto \xB7 ${Math.ceil(U.size / 1024)} KB`);
          }).catch(() => {
            R = false, k() && j.contains(D) && (I.textContent = "Das Foto konnte nicht geladen werden. Zum Wiederholen zu- und aufklappen.");
          }));
        });
      }
      let ne = o("div", { class: "plant-detail-body" }, o("p", { class: "detail-variety-label" }, `Verf\xFCgbare Sorten (${r.length}):`), b, o("div", { role: "tabpanel", id: "selected-variety", "aria-labelledby": `variety-${e.id}` }, o("section", { class: "detail-variety-card" }, o("h3", {}, e.variety || e.name, n.type ? o("em", {}, ` (${n.type})`) : null), u ? E("Gemeinsamer Sortenkatalog \xB7 \xC4nderungen und Beetzuweisungen werden im eigenen Garten gespeichert.") : null, o("div", { class: "detail-variety-actions" }, S("Teilen / Drucken", f, "detail-secondary"), e.category !== "Garten-Praxis" ? S("\u{1F6D2} Saatgut / Pflanzen nachbestellen", () => vl(e), "detail-order-button") : null)), o("section", { class: "detail-bed-status" }, o("h3", {}, `\u{1F3E1} Beet-Status f\xFCr ${e.variety || e.name}`), d, s.length ? o("p", { class: "detail-bed-list" }, s.map((R) => `${p.data.beds.find((U) => U.id === R.bed_id)?.name || "Beet"} \xB7 ${R.status}${R.position ? " \xB7 " + R.position : ""}`).join(" / ")) : null, u ? E("\xD6ffne die Sorte aus deinem eigenen Katalog, um sie einem Beet zuzuweisen.") : S("Beete ausw\xE4hlen / Status \xE4ndern", () => Qd(e), "detail-text-button")), w("\u{1F331} Aussaat & Anbau", [x, o("div", { class: "detail-facts" }, n.method ? h("\u{1F331} Anbaumethode", n.method, true) : null, h("Pflanzabstand", n.plantSpacing), h("Reihenabstand", n.rowSpacing), h("Saattiefe", n.depth), h("Aussaat / Vorzucht", n.sowing), h("Ins Beet / Freiland", n.outdoors), h("Erntefenster", n.harvest)), y?.note ? g("extra", "\u{1F33F} Hinweis zur Kultur", y.note) : null], { hint: "Termine, Saattiefe & Abst\xE4nde" }), w("\u2600\uFE0F Standort & Pflege", [o("div", { class: "detail-facts" }, h("\u2600\uFE0F Standort / Lichtbedarf", n.location, true)), n.knowledge.practice ? null : g("site", "\u{1F324}\uFE0F Schatten & Pl\xE4tze unter B\xE4umen", [n.knowledge.light, n.knowledge.siteNote].join(`

`)), g("watering", "\u{1F4A7} Gie\xDFempfehlung (bei Trockenheit)", n.watering), g("soil", "\u{1F331} Bodenvorbereitung & Erde", n.soil), g("fertilizer", "\u{1F9EA} Empfohlener D\xFCnger & N\xE4hrstoffe", n.fertilizer), g("tip", "\u{1F4A1} Profi-Gartentipp", n.tip), g("extra", "\u{1F33F} Pflege & Hinweise", n.extra)], { hint: "Licht, Boden, Gie\xDFen & D\xFCnger" }), n.knowledge.practice ? null : w("\u{1F33F} Lebensdauer & Schnitt", [g("life", "Einj\xE4hrig oder mehrj\xE4hrig?", n.knowledge.life), g("cut", "Wann schneiden?", n.knowledge.cutWhen), g("cut", "So gehst du vor", n.knowledge.cutHow)], { hint: "Lebensdauer, Zeitpunkt & Anleitung" }), n.knowledge.practice ? null : w("\u{1F504} Fruchtfolge & Standortwechsel", [g("move", "Beim Umsetzen beachten", n.knowledge.move), g("rotation", "Was kann danach ins Beet?", n.knowledge.after), E(n.knowledge.rotationNote), o("details", { class: "knowledge-sources" }, o("summary", {}, "Quellen & Einordnung"), E("Allgemeine Empfehlungen zur Pflanzenart. Sorte, Tragtyp, \xF6rtliche Witterung und die tats\xE4chliche Beetgeschichte haben Vorrang. Die Vorschl\xE4ge ber\xFCcksichtigen keine unbekannten Bodenkrankheiten."), n.knowledge.sources.map((R, U) => o("p", {}, o("a", { href: R, target: "_blank", rel: "noopener noreferrer" }, `Fachquelle ${U + 1} \xB7 ${new URL(R).hostname}`))))], { hint: "Umsetzen, Anbaupause & n\xE4chste Kultur" }), n.knowledge.practice ? S("Als pers\xF6nliche Aufgabe planen", () => Fa.taskDialog(null, { title: `${e.name}: ${e.variety}`.slice(0, 150), plant_id: e.id, notes: e.care.slice(0, 3e3) }), "button secondary") : null, n.group || n.appearance || n.taste || n.use ? w("\u{1F37D}\uFE0F Sorte & Verwendung", [n.group ? o("p", {}, n.group) : null, [["\u{1F3A8} Aussehen", n.appearance], ["\u{1F445} Geschmack", n.taste], ["\u{1F37D}\uFE0F Verwendung", n.use]].map(([R, U]) => U ? o("p", { class: "preserve-lines" }, o("strong", {}, R + ": "), U) : null)]) : null, w("\u{1F91D} Gute & schlechte Nachbarn", [o("div", { class: "detail-neighbors" }, g("good", "\u2705 Gute Nachbarn", n.goodNeighbors), g("bad", "\u274C Schlechte Nachbarn", n.badNeighbors)), E(n.goodNeighbors || n.badNeighbors ? "Nachbarschaftstipps sind Erfahrungswerte, keine Wirkungsgarantie. Pflanzabst\xE4nde, Fruchtfolge, Licht, Wasser und Krankheitsdruck haben Vorrang." : "F\xFCr diese Sorte sind noch keine Nachbarschaftsangaben hinterlegt.")]), z, Fd(e), q, o("p", { class: "detail-disclaimer" }, e.source === "ai" ? "KI-generierte Angaben. Bitte anhand verl\xE4sslicher Quellen pr\xFCfen." : "Termine und Abst\xE4nde h\xE4ngen von Sorte und Standort ab. Pr\xFCfe die Angaben auf eurem Saatgutt\xFCtchen."), u ? E("Dieser gemeinsame Katalogeintrag bleibt unver\xE4ndert und ist f\xFCr alle Familien sichtbar.") : ce(S("L\xF6schen", (R) => W(async () => {
        confirm(`\u201E${e.name} \xB7 ${e.variety}\u201C mit Beetzuweisungen und Sortennotiz l\xF6schen?`) && (await nt("rg_plants", Te(), e), ot.get(e.id)?.draft.dispose(), ot.delete(e.id), await Qe(e.photo_path).catch(() => J("Die Pflanze ist gel\xF6scht; das Foto konnte noch nicht entfernt werden.", true)), await Me("Pflanze gel\xF6scht."));
      }, R.currentTarget), "detail-danger"), S("Bearbeiten", () => Sr(e), "detail-secondary"), S("Einem Beet zuweisen", () => Ba(e, null, { onSaved: () => He(e) }), "detail-primary"))));
      se(e.name, ne, { className: "plant-detail-dialog", heading: m, cleanup: () => {
        i.cleanup(), _ && URL.revokeObjectURL(_);
      } }), j.scrollTop = 0;
    }
    function Ud(t) {
      if (!t.photo_path) return null;
      let e = ae(), n = o("img", { alt: `Beet ${t.name}`, class: "bed-photo-image", hidden: true }), r = o("span", { class: "muted small" }, "Beetfoto wird geladen \u2026"), i = null, a = null, s = false, l = false, c = null, d = S([n, r], async () => {
        if (!a) return;
        let g = URL.createObjectURL(a);
        se(`Beetfoto \xB7 ${t.name}`, o("figure", { class: "bed-photo-large" }, o("img", { src: g, alt: `Fertiges Beet: ${t.name}` }), o("figcaption", { class: "muted small" }, "Verkleinertes Foto \xB7 nur f\xFCr eure Familie.")), { cleanup: () => URL.revokeObjectURL(g) });
      }, "bed-photo-open", { "aria-label": `Foto von ${t.name} vergr\xF6\xDFern`, disabled: true }), h = async () => {
        if (!(l || s)) {
          l = true, c?.disconnect();
          try {
            if (a = await vn(t.photo_path), s || !e() || !d.isConnected) return;
            i = URL.createObjectURL(a), n.src = i, n.hidden = false, r.textContent = "Foto vergr\xF6\xDFern \u2197", d.disabled = false;
          } catch {
            !s && d.isConnected && (r.textContent = "Foto nicht erreichbar. Beim Bearbeiten kannst du es ersetzen.");
          }
        }
      };
      return "IntersectionObserver" in window ? (c = new IntersectionObserver((g) => {
        g.some((f) => f.isIntersecting) && h();
      }, { rootMargin: "200px" }), c.observe(d)) : queueMicrotask(h), Si.add(() => {
        s = true, c?.disconnect(), i && URL.revokeObjectURL(i);
      }), d;
    }
    function Di() {
      return zt(p.data.family.layout_settings || {});
    }
    function Fe(t) {
      return Number(t) / 100;
    }
    function El(t) {
      return { width_cm: Math.round(Number(t.elements.namedItem("width_m").value) * 100), length_cm: Math.round(Number(t.elements.namedItem("length_m").value) * 100) };
    }
    function Al(t) {
      return o("div", { class: "form-grid" }, G("Gartenbreite in m", "width_m", Fe(t.width_cm), { type: "number", min: 0.5, max: 500, step: 0.01, required: true }), G("Gartenl\xE4nge in m", "length_m", Fe(t.length_cm), { type: "number", min: 0.5, max: 500, step: 0.01, required: true }));
    }
    async function Pi(t, e, n) {
      C(await $().rpc("rg_save_layout", { layout: zt(t), positions: e, expected_version: n }));
    }
    function Md() {
      let t = Di(), e = o("article", { id: "print-content", class: "print-content" }, o("h1", {}, `2D-Lageplan \xB7 ${p.data.family.name}`), E(`${Fe(t.width_cm)} \xD7 ${Fe(t.length_cm)} m \xB7 Raster: 1 m \xB7 Ausgabe ${(/* @__PURE__ */ new Date()).toLocaleDateString("de-DE")}`), gi({ layout: t, beds: p.data.beds }), o("ol", {}, p.data.beds.map((n) => o("li", {}, `${n.name} \xB7 ${n.width_cm && n.length_cm ? `${Fe(n.width_cm)} \xD7 ${Fe(n.length_cm)} m` : "Ma\xDFe noch offen"}${n.layout_x_cm == null ? " \xB7 Position offen" : n.layout_source === "ai" ? " \xB7 ungepr\xFCfte KI-Position" : ""}`))), E("Unplatzierte Beete werden nur vorl\xE4ufig abgelegt. KI-Vorschl\xE4ge sind ungepr\xFCfte Sch\xE4tzungen. Der Plan ersetzt keine Vermessung."));
      document.getElementById("print-content")?.remove(), document.body.append(e), window.addEventListener("afterprint", () => e.remove(), { once: true });
      try {
        window.print();
      } catch (n) {
        throw e.remove(), n;
      }
    }
    function Kd() {
      let t = Di(), e = p.data.membership.role === "owner", n = ae(), r = p.data.family.settings_version ?? 1, i = false, a = S("\u25B1 Beet einzeichnen", () => {
        i = !i, a.classList.toggle("active", i), a.setAttribute("aria-pressed", String(i)), l.classList.toggle("is-drawing", i), s.textContent = i ? "Ziehe auf der freien Zeichenfl\xE4che ein Rechteck. Danach w\xE4hlst du das Beet und pr\xFCfst seine Ma\xDFe." : "Tippe auf ein Beet, um Foto, Ma\xDFe und Position zu bearbeiten.";
      }, "button secondary", { "aria-pressed": "false" }), s = E("Tippe auf ein Beet, um Foto, Ma\xDFe und Position zu bearbeiten."), l = gi({ layout: t, beds: p.data.beds, drawing: () => i, onBed: (u) => $t(u, { showPosition: true }), onDraw: (u) => {
        i = false, a.classList.remove("active"), a.setAttribute("aria-pressed", "false"), l.classList.remove("is-drawing"), qd(u);
      } }), c = o("form", { class: "plan-dimensions" }, Al(t), E("Standard-Zeichenfl\xE4che: 20 \xD7 30 m. Bitte durch gemessene Gartenma\xDFe ersetzen. Eine Gr\xF6\xDFen\xE4nderung skaliert vorhandene Beete nicht."), re(), o("button", { type: "submit", class: "button secondary" }, "Gartenma\xDFe speichern"));
      return c.addEventListener("submit", (u) => {
        u.preventDefault();
        let d = zt({ ...t, ...El(c) });
        te(c, async () => {
          await Pi(d, [], r), n() && (delete c.dataset.dirty, await he(), J("Gartenma\xDFe gespeichert."));
        });
      }), o("section", { class: "garden-plan" }, o("div", { class: "section-heading" }, o("div", {}, o("p", { class: "eyebrow" }, "EUER GARTEN VON OBEN"), o("h2", {}, "Ein Plan f\xFCr eure Beete.")), S("Drucken / PDF", Md, "button secondary")), o("p", { class: "muted" }, "Ein bearbeitbarer 2D-Plan. Raster: 1 m. Beete ohne Position sind gestrichelt und zun\xE4chst lose abgelegt. Oben und unten sind Planrichtungen; Norden wurde nicht ermittelt."), e ? o("details", { class: "panel plan-settings" }, o("summary", {}, "Gartenma\xDFe einstellen"), c) : null, o("div", { class: "plan-toolbar" }, e ? a : null, S("+ Neues Beet", () => $t(null, { showPosition: true }), "button secondary"), e ? S("\u{1F3AC} Video / Fotos \u2192 Planentwurf", Wd, "button") : null), s, o("div", { class: "garden-map-frame" }, l), E("Gestrichelte Beete und KI-Vorschl\xE4ge m\xFCssen gepr\xFCft werden. Gemessene Beetma\xDFe bleiben bei einer KI-\xDCbernahme erhalten."), o("ol", { class: "map-legend" }, p.data.beds.map((u) => o("li", {}, S(`${u.name}${u.width_cm && u.length_cm ? ` \xB7 ${Fe(u.width_cm)} \xD7 ${Fe(u.length_cm)} m` : ""}${u.layout_source === "ai" ? " \xB7 KI-Vorschlag" : ""}`, () => $t(u, { showPosition: true }), "text-button")))), e ? o("section", { class: "panel map-elements" }, o("h3", {}, "Wege, Laube und B\xE4ume"), S("+ Planelement", () => tl(), "button secondary"), t.features.length ? o("ul", {}, t.features.map((u, d) => o("li", {}, S(u.label || "Element ohne Namen", () => tl(d), "text-button")))) : E("Du kannst diese Elemente selbst eintragen oder einen KI-Entwurf als Ausgangspunkt verwenden.")) : null);
    }
    function qd(t) {
      let e = o("select", { name: "bed_id", id: "draw-bed" }, o("option", { value: "" }, "Neues Beet erstellen"), p.data.beds.map((i) => o("option", { value: i.id }, i.name))), n = o("form", {}, o("div", { class: "field" }, o("label", { for: "draw-bed" }, "Welches Beet liegt hier?"), e), G("Name f\xFCr neues Beet", "name", `Beet ${p.data.beds.length + 1}`, { maxlength: 100, required: true }), o("div", { class: "form-grid" }, G("Breite in m", "width_m", Fe(t.width_cm), { type: "number", min: 0.1, max: 100, step: 0.01, required: true }), G("L\xE4nge in m", "length_m", Fe(t.length_cm), { type: "number", min: 0.1, max: 100, step: 0.01, required: true })), E("Gezeichnete Ma\xDFe bitte nachmessen. Bei einem bestehenden Beet werden eingetragene Ma\xDFe vorgeschlagen."), re(), ce(S("Abbrechen", () => j.close(), "button secondary"), o("button", { type: "submit", class: "button" }, "Beet im Plan speichern")));
      e.addEventListener("change", () => {
        let i = p.data.beds.find((a) => a.id === e.value);
        n.elements.namedItem("name").disabled = !!i, n.elements.namedItem("name").required = !i, i?.width_cm && (n.elements.namedItem("width_m").value = Fe(i.width_cm)), i?.length_cm && (n.elements.namedItem("length_m").value = Fe(i.length_cm));
      });
      let r = ae();
      n.addEventListener("submit", (i) => {
        i.preventDefault();
        let a = p.data.beds.find((l) => l.id === e.value), s = { width_cm: Math.round(Number(n.elements.namedItem("width_m").value) * 100), length_cm: Math.round(Number(n.elements.namedItem("length_m").value) * 100), layout_x_cm: t.x_cm, layout_y_cm: t.y_cm, rotation_deg: 0, layout_source: "manual", ...a ? {} : { name: n.elements.namedItem("name").value.trim() } };
        te(n, async () => {
          await ze("rg_beds", Te(), s, a), r() && await Me("Beet im Lageplan gespeichert.");
        });
      }), se("Gezeichnetes Beet zuordnen", n);
    }
    function tl(t = null) {
      let e = Di(), n = p.data.family.settings_version ?? 1, r = ae(), i = e.features[t] || { label: "", kind: "path", x_cm: 0, y_cm: 0, width_cm: 100, length_cm: 200, rotation_deg: 0 }, a = o("select", { name: "kind", id: "feature-kind" }, [["path", "Weg"], ["building", "Laube / Geb\xE4ude"], ["tree", "Baum"], ["lawn", "Rasen"], ["other", "Sonstiges"]].map(([l, c]) => o("option", { value: l, selected: l === i.kind }, c))), s = o("form", {}, G("Bezeichnung", "label", i.label, { required: true, maxlength: 80 }), o("div", { class: "field" }, o("label", { for: "feature-kind" }, "Element"), a), o("div", { class: "form-grid" }, ...["x_cm", "y_cm", "width_cm", "length_cm"].map((l, c) => G(["Abstand links in m", "Abstand oben in m", "Breite in m", "L\xE4nge in m"][c], l, Fe(i[l]), { type: "number", min: c < 2 ? 0 : 0.1, max: 500, step: 0.01, required: true }))), G("Drehung in Grad", "rotation_deg", i.rotation_deg, { type: "number", min: 0, max: 359, step: 1, required: true }), re(), ce(t !== null ? S("Element entfernen", (l) => W(async () => {
        await Pi({ ...e, features: e.features.filter((c, u) => u !== t) }, [], n), r() && await Me("Planelement entfernt.");
      }, l.currentTarget), "button danger") : null, o("button", { type: "submit", class: "button" }, "Element speichern")));
      s.addEventListener("submit", (l) => {
        l.preventDefault();
        let c = Object.fromEntries(new FormData(s));
        for (let d of ["x_cm", "y_cm", "width_cm", "length_cm"]) c[d] = Math.round(Number(c[d]) * 100);
        c.rotation_deg = Number(c.rotation_deg);
        let u = [...e.features];
        t === null ? u.push(c) : u[t] = c, te(s, async () => {
          await Pi({ ...e, features: u }, [], n), r() && await Me("Planelement gespeichert.");
        });
      }), se("Planelement bearbeiten", s);
    }
    function Wd() {
      let t = At(), e = ae(), n = Di(), r = p.data.family.settings_version ?? 1, i = p.data.beds.map((f) => ({ ...f })), a = o("input", { type: "file", id: "layout-media", accept: "video/mp4,video/quicktime,video/webm,image/jpeg,image/png,image/webp", multiple: true, required: true }), s = o("input", { type: "checkbox", required: true }), l = o("p", { class: "muted small", role: "status", "aria-live": "polite" }), c = o("div", { class: "plan-frame-previews" }), u = o("form", {}, o("p", {}, `W\xE4hle ein Rundgangvideo oder bis zu 9 \xFCberlappende Fotos. Daraus kann ${Et(t)} eine ungef\xE4hre Draufsicht vorschlagen. Anschlie\xDFend zeichnest du fehlende Beete selbst ein und korrigierst die Ma\xDFe.`), o("label", { class: "field", for: "layout-media" }, o("span", {}, "Video (MP4 / MOV / WebM \xB7 bis 5 Minuten / 250 MB) oder Fotos (JPEG / PNG / WebP \xB7 je 15 MB)"), a), Al(n), G("Hinweise zur Zuordnung (optional)", "context", "", { area: true, maxlength: 1e3, placeholder: "Zum Beispiel: Eingang unten, Laube hinten links. Beet 1 steht vor der Laube." }), en("layout-ai-model", t), o("label", { class: "consent" }, s, o("span", {}, `Ich m\xF6chte die verkleinerten Gartenbilder und Beetnamen an ${Ce(t)} senden. Es sind keine Personen oder privaten Dokumente zu sehen.`)), E("Das Video bleibt auf deinem Ger\xE4t. Nur 6 verkleinerte Standbilder beziehungsweise deine verkleinerten Fotos werden \xFCbertragen. Originaldateien werden nicht hochgeladen oder in der App gespeichert. Eine genaue Vermessung ist damit nicht m\xF6glich."), l, c, re(), ce(S("Abbrechen", () => j.close(), "button secondary"), o("button", { type: "submit", class: "button" }, "2D-Entwurf erstellen"))), d = [], h = 0, g = () => {
        for (let f of d) URL.revokeObjectURL(f);
        d = [], c.replaceChildren();
      };
      a.addEventListener("change", () => {
        h++, g(), l.textContent = "";
      }), u.addEventListener("submit", (f) => {
        f.preventDefault();
        let m = [...a.files], b = ++h, v = Tn(t), y = u.elements.namedItem("context").value, k = zt({ ...n, ...El(u) }), _ = () => e() && j.contains(u) && b === h;
        te(u, async () => {
          if (!s.checked || !m.length) throw new Error("Bitte Dateien ausw\xE4hlen und die \xDCbermittlung freigeben.");
          let T = m[0].type.startsWith("video/");
          if (T && m.length !== 1 || !T && (m.length > 9 || m.some((x) => x.type.startsWith("video/")))) throw new Error("Bitte genau ein Video oder bis zu 9 Fotos ausw\xE4hlen.");
          g(), l.textContent = T ? "6 verkleinerte Standbilder werden auf deinem Ger\xE4t vorbereitet \u2026" : "Gartenfotos werden auf deinem Ger\xE4t verkleinert \u2026";
          let I = T ? await Ro(m[0]) : await Promise.all(m.map((x) => ir(x)));
          if (!_()) return;
          for (let x of I) {
            let w = URL.createObjectURL(x.blob);
            d.push(w), c.append(o("img", { src: w, alt: "Verkleinertes Gartenbild f\xFCr den Entwurf" }));
          }
          l.textContent = `${I.length} verkleinerte Bilder \xB7 ${Math.ceil(I.reduce((x, w) => x + w.blob.size, 0) / 1024)} KB. ${Et(t)} erstellt den Entwurf \u2026`;
          let D = await Dt({ mode: "layout", provider: t, model: v, consent: true, images: I.map((x) => ({ mimeType: "image/jpeg", data: x.base64 })), knownBedIds: i.map((x) => x.id), width_cm: k.width_cm, length_cm: k.length_cm, context: y });
          _() && Hd(D, { beds: i, version: r, dimensions: k });
        });
      }), se("Aus Video oder Fotos zum 2D-Plan", u, { cleanup: () => {
        h++, g();
      } });
    }
    function Hd(t, { beds: e, version: n, dimensions: r }) {
      let i = ae(), a = zt({ ...t.layout, width_cm: r.width_cm, length_cm: r.length_cm }), s = Aa(t.positions || [], e), l = new Map(s.map((h) => [h.bed_id, h])), c = e.map((h) => {
        let g = l.get(h.id);
        return g ? { ...h, layout_x_cm: g.x_cm, layout_y_cm: g.y_cm, width_cm: h.width_cm ?? g.width_cm, length_cm: h.length_cm ?? g.length_cm, rotation_deg: g.rotation_deg, layout_source: "ai" } : h;
      }), u = o("input", { type: "checkbox", required: true }), d = o("form", {}, o("div", { class: "callout" }, o("strong", {}, "Ungepr\xFCfter KI-Entwurf \xB7 keine Vermessung"), o("p", {}, String(t.notes || "Bitte Ma\xDFe und Zuordnung selbst pr\xFCfen.").slice(0, 1e3))), o("div", { class: "garden-map-frame" }, gi({ layout: a, beds: c })), E(`${s.length} vorhandene Beete zugeordnet \xB7 ${a.features.length} Planelemente. Bestehende Planelemente werden bei der \xDCbernahme durch diesen Entwurf ersetzt. Nicht zugeordnete Beete behalten ihre bisherige Position. Neue Beete legst du anschlie\xDFend durch Einzeichnen an.`), o("label", { class: "consent" }, u, o("span", {}, "Ich m\xF6chte diesen groben Entwurf als bearbeitbaren Ausgangspunkt \xFCbernehmen und anschlie\xDFend pr\xFCfen.")), re(), ce(S("Verwerfen", () => j.close(), "button secondary"), o("button", { type: "submit", class: "button" }, "Entwurf in den Lageplan \xFCbernehmen")));
      d.addEventListener("submit", (h) => {
        h.preventDefault(), te(d, async () => {
          await Pi(a, s.map((g) => ({ ...g, source: "ai", version: e.find((f) => f.id === g.bed_id).version })), n), i() && (p.bedView = "map", await Me("Ungepr\xFCfter Entwurf \xFCbernommen. Jetzt bitte Beete und Ma\xDFe vergleichen."));
        });
      }), se("2D-Entwurf pr\xFCfen", d, { className: "plan-preview-dialog" });
    }
    function Vd() {
      let t = o("div", { class: "bed-view-switch", role: "group", "aria-label": "Beetansicht" }, [["list", "Beetliste"], ["map", "2D-Lageplan"]].map(([a, s]) => S(s, () => {
        p.bedView = a, ue();
      }, `chip ${p.bedView === a ? "active" : ""}`, { "aria-pressed": String(p.bedView === a) })));
      if (p.bedView === "map") return o("div", {}, t, Kd());
      let e = (/* @__PURE__ */ new Date()).getFullYear(), n = [.../* @__PURE__ */ new Set([e - 3, e - 2, e - 1, e, e + 1, e + 2, p.bedYear, ...p.data.plantings.map((a) => a.season_year ?? e)])].sort((a, s) => s - a), r = o("select", { id: "bed-year", onchange: (a) => {
        p.bedYear = Number(a.target.value), ue();
      } }, n.map((a) => o("option", { value: a, selected: a === p.bedYear }, a))), i = new Map(p.data.plants.map((a) => [a.id, a]));
      return o("div", {}, t, o("div", { class: "section-heading" }, E("Plane mit Mengen und Pflanzabst\xE4nden. Vergangene Jahre bleiben f\xFCr die Fruchtfolge erhalten."), S("+ Beet anlegen", () => $t())), o("div", { class: "bed-year-select" }, o("label", { for: "bed-year" }, "Gartenjahr"), r), p.data.beds.length ? o("div", { class: "bed-grid" }, p.data.beds.map((a) => {
        let s = p.data.plantings.filter((f) => f.bed_id === a.id && (f.season_year ?? e) === p.bedYear), l = s.filter((f) => f.status !== "geerntet"), c = l.filter((f) => ii(i.get(f.plant_id) || {})), u = c.reduce((f, m) => f + ii(i.get(m.plant_id)) * (m.quantity ?? 1), 0), d = a.width_cm && a.length_cm ? a.width_cm * a.length_cm / 1e4 : null, h = [...new Set(s.flatMap((f) => ai(i.get(f.plant_id) || {}, a.id, p.bedYear, p.data.plantings, p.data.plants)))], g = o("div", { class: "bed-capacity" }, o("strong", {}, d ? `${d.toLocaleString("de-DE")} m\xB2 Beetfl\xE4che` : "Beetma\xDFe noch offen"), E(`${u.toLocaleString("de-DE", { maximumFractionDigits: 2 })} m\xB2 aus bekannten Abst\xE4nden gesch\xE4tzt${c.length < l.length ? ` \xB7 ${l.length - c.length} Zuweisungen ohne berechenbaren Abstand` : ""}.`), d ? o("meter", { min: 0, max: d, value: Math.min(u, d), "aria-label": "Grob gesch\xE4tzte Beetbelegung" }) : null, d && u > d ? o("p", { class: "danger-text small" }, "Der gesch\xE4tzte Platzbedarf \xFCbersteigt die Beetfl\xE4che. Mengen, Abst\xE4nde oder zeitliche Satzfolge pr\xFCfen.") : null, E("Grobe Planung ohne Wege und zeitliche Satzfolgen; keine automatische Packberechnung."));
        return o("article", { class: "panel bed-card" }, o("div", { class: "bed-heading" }, o("span", { class: "bed-symbol", "aria-hidden": "true" }, "\u25A4"), o("div", {}, o("h2", {}, a.name), E(a.description || "Ein St\xFCck Garten f\xFCr eure Ideen.")), S("\u270E", () => $t(a), "icon-button", { "aria-label": `${a.name} bearbeiten` })), Ud(a), g, h.length ? o("details", { class: "rotation-hints" }, o("summary", {}, `Fruchtfolge pr\xFCfen (${h.length})`), h.map((f) => o("p", {}, f)), E("Bei Kohlhernie oder anderen bodenb\xFCrtigen Krankheiten sind l\xE4ngere Pausen und passende Fachberatung n\xF6tig.")) : null, o("div", { class: "planting-list" }, s.length ? s.map((f) => {
          let m = i.get(f.plant_id);
          return o("div", { class: "planting-row" }, o("span", { "aria-hidden": "true" }, _n(m || {}).icon), o("div", { class: "planting-name" }, o("strong", {}, `${f.quantity ?? 1} \xD7 ${m?.name || "Pflanze"}`), E([m?.variety, f.position].filter(Boolean).join(" \xB7 "))), o("select", { "aria-label": `Status von ${m?.name || "Pflanze"}`, onchange: (b) => {
            let v = b.target, y = v.value;
            W(async () => {
              try {
                await ze("rg_plantings", Te(), { status: y }, f), await he();
              } catch (k) {
                throw v.value = f.status, k;
              }
            }, v);
          } }, ["geplant", "ges\xE4t", "gepflanzt", "geerntet"].map((b) => o("option", { value: b, selected: b === f.status }, b))), S("\u2715", (b) => W(async () => {
            confirm("Diese Beetzuweisung f\xFCr das gew\xE4hlte Jahr entfernen?") && (await nt("rg_plantings", Te(), f), await he());
          }, b.currentTarget), "icon-button", { "aria-label": "Beetzuweisung entfernen" }));
        }) : E("F\xFCr dieses Jahr noch keine Pflanzen zugewiesen.")), S("+ Pflanze zuweisen", () => Ba(null, a, { year: p.bedYear }), "button secondary full"), S("Zum Kalender hinzuf\xFCgen", () => wr({ bed: a }), "button secondary full", { "aria-label": `${a.name}: Gartentermin planen` }));
      })) : lt("Hier entsteht euer Beetplan.", "Lege ein Beet an und weise ihm Pflanzen zu.", S("Erstes Beet anlegen", () => $t())));
    }
    function $t(t = null, { showPosition: e = false } = {}) {
      let n = ae(), r = xi({ path: t?.photo_path, label: "Foto vom fertigen Beet" }), i = o("form", {}, G("Beetname", "name", t?.name || "", { required: true, maxlength: 100 }), G("Beschreibung", "description", t?.description || "", { area: true, maxlength: 1e3 }), o("div", { class: "form-grid" }, G("Breite in m", "width_m", t?.width_cm != null ? Fe(t.width_cm) : "", { type: "number", min: 0.1, max: 100, step: 0.01 }), G("L\xE4nge in m", "length_m", t?.length_cm != null ? Fe(t.length_cm) : "", { type: "number", min: 0.1, max: 100, step: 0.01 })), E("Zum Beispiel 2 m \xD7 1 m. Ma\xDFe sind optional; der Lageplan verwendet sie im passenden Gr\xF6\xDFenverh\xE4ltnis."), o("details", { class: "schedule-editor", open: e }, o("summary", {}, "Position im 2D-Lageplan"), G("Abstand vom linken Planrand in cm", "layout_x_cm", t?.layout_x_cm ?? "", { type: "number", min: 0, max: 5e4, step: 1 }), G("Abstand vom oberen Planrand in cm", "layout_y_cm", t?.layout_y_cm ?? "", { type: "number", min: 0, max: 5e4, step: 1 }), G("Drehung in Grad", "rotation_deg", t?.rotation_deg ?? 0, { type: "number", min: 0, max: 359, step: 1 }), E("F\xFCr einen genauen Plan bitte messen. Beide Positionsfelder leer lassen, wenn die Position noch unbekannt ist.")), r.node, re(), ce(t ? S("Beet l\xF6schen", (a) => W(async () => {
        if (confirm("Beet samt Zuweisungen, Anbauhistorie und Foto l\xF6schen? Die Pflanzen bleiben im Katalog.")) {
          await nt("rg_beds", Te(), t);
          let s = "";
          await Qe(t.photo_path).catch(() => {
            s = " Das Foto konnte noch nicht aus dem Speicher entfernt werden.";
          }), await Me("Beet gel\xF6scht." + s);
        }
      }, a.currentTarget), "button danger") : null, o("button", { type: "submit", class: "button" }, "Beet speichern")));
      i.addEventListener("submit", (a) => {
        a.preventDefault();
        let s = Object.fromEntries(new FormData(i));
        s.width_cm = s.width_m !== "" ? Math.round(Number(s.width_m) * 100) : null, s.length_cm = s.length_m !== "" ? Math.round(Number(s.length_m) * 100) : null, delete s.width_m, delete s.length_m, s.layout_x_cm = s.layout_x_cm !== "" ? Number(s.layout_x_cm) : null, s.layout_y_cm = s.layout_y_cm !== "" ? Number(s.layout_y_cm) : null, s.rotation_deg = Number(s.rotation_deg) || 0, s.layout_source = s.layout_x_cm !== null && s.layout_y_cm !== null ? s.layout_x_cm === t?.layout_x_cm && s.layout_y_cm === t?.layout_y_cm && s.rotation_deg === (t?.rotation_deg ?? 0) ? t.layout_source : "manual" : "unset", te(i, async () => {
          if (s.layout_x_cm === null != (s.layout_y_cm === null)) throw new Error("Bitte beide Positionsfelder ausf\xFCllen oder beide leer lassen.");
          let l = await r.getPhoto();
          if (!n() || !j.contains(i)) return;
          let c = null;
          try {
            if (l && (c = await ar(l, Te())), !n() || !j.contains(i)) {
              c && await Qe(c).catch(() => {
              });
              return;
            }
            s.photo_path = c || (r.remove() ? null : t?.photo_path || null), await ze("rg_beds", Te(), s, t);
          } catch (d) {
            throw c && await Qe(c).catch(() => {
            }), d;
          }
          if (!n()) return;
          let u = "";
          t?.photo_path && (c || r.remove()) && await Qe(t.photo_path).catch(() => {
            u = " Das bisherige Foto konnte noch nicht entfernt werden.";
          }), await Me("Beet gespeichert." + u);
        });
      }), se(t ? "Beet bearbeiten" : "Ein neues Beet", i, { cleanup: r.cleanup });
    }
    function Ba(t = null, e = null, { status: n = "geplant", year: r = (/* @__PURE__ */ new Date()).getFullYear(), onSaved: i = null } = {}) {
      if (!p.data.beds.length) return J("Lege zuerst ein Beet an."), $t();
      if (!p.data.plants.length) return J("Lege zuerst eine Pflanze an."), Sr();
      let a = rt(p.data.plants), s = a.find((_) => _.plants.some((T) => T.id === t?.id)), l = [...new Set(a.map((_) => _.category))].sort((_, T) => _.localeCompare(T, "de")), c = o("select", { id: "assign-category", required: true }, o("option", { value: "" }, "Bitte Kategorie w\xE4hlen"), l.map((_) => o("option", { value: _ }, `${rr[_] || "\u{1F331}"} ${_}`))), u = o("select", { id: "assign-culture", required: true }), d = o("select", { name: "plant_id", id: "assign-plant_id", required: true }), h = (_, T = null) => {
        let I = a.find((D) => D.key === _)?.plants || [];
        d.replaceChildren(o("option", { value: "" }, I.length ? "Bitte Sorte w\xE4hlen" : "Zuerst eine Kultur w\xE4hlen"), ...I.map((D) => o("option", { value: D.id }, D.variety || "Ohne Sortenangabe"))), d.disabled = !I.length, d.value = T || (I.length === 1 ? I[0].id : "");
      }, g = (_, T = null, I = null) => {
        let D = a.filter((x) => x.category === _);
        u.replaceChildren(o("option", { value: "" }, D.length ? "Bitte Kultur w\xE4hlen" : "Zuerst eine Kategorie w\xE4hlen"), ...D.map((x) => o("option", { value: x.key }, x.name))), u.disabled = !D.length, u.value = T || (D.length === 1 ? D[0].key : ""), h(u.value, I);
      };
      c.addEventListener("change", () => g(c.value)), u.addEventListener("change", () => h(u.value)), c.value = s?.category || "", g(c.value, s?.key, t?.id);
      let f = o("select", { name: "bed_id", id: "assign-bed_id", required: true }, [...p.data.beds].sort((_, T) => _.name.localeCompare(T.name, "de", { numeric: true })).map((_) => o("option", { value: _.id, selected: _.id === e?.id }, _.name))), m = G("Anzahl Pflanzen", "quantity", 1, { type: "number", min: 1, max: 1e4, step: 1, required: true }), b = G("Gartenjahr", "season_year", r, { type: "number", min: 2e3, max: 2100, step: 1, required: true }), v = o("div", { class: "assignment-planner", role: "status", "aria-live": "polite" }), y = () => {
        let _ = p.data.plants.find((F) => F.id === d.value), T = p.data.beds.find((F) => F.id === f.value), I = Number(m.querySelector("input").value), D = Number(b.querySelector("input").value);
        if (!_ || !T) {
          v.replaceChildren(E("W\xE4hle eine Sorte f\xFCr Platzbedarf und Fruchtfolge."));
          return;
        }
        let x = ii(_), w = St(_), P = ai(_, T.id, D, p.data.plantings, p.data.plants);
        v.replaceChildren(o("h3", {}, "Fruchtfolge & Platzbedarf"), E(w?.family ? `Pflanzenfamilie: ${w.family}.` : "Pflanzenfamilie nicht sicher hinterlegt."), E(x && I > 0 ? `Grob gesch\xE4tzt: ${(x * I).toLocaleString("de-DE", { maximumFractionDigits: 2 })} m\xB2 f\xFCr ${I} Pflanzen. Abstand: ${_.spacing}.` : "F\xFCr diese Sorte ist kein verl\xE4sslicher Fl\xE4chenwert aus den Abst\xE4nden berechenbar."), P.length ? o("div", { class: "callout" }, [...new Set(P)].map((F) => o("p", {}, F))) : E("In der gespeicherten Anbauhistorie wurde kein Konflikt erkannt. Fehlende fr\xFChere Jahre sind darin nicht ber\xFCcksichtigt."));
      };
      for (let _ of [c, u, d, f, m, b]) _.addEventListener("change", y);
      y();
      let k = o("form", {}, E("W\xE4hle zuerst die Kategorie, dann die Kultur und ihre Sorte."), o("div", { class: "field" }, o("label", { for: "assign-category" }, "Kategorie"), c), o("div", { class: "field" }, o("label", { for: "assign-culture" }, "Kultur"), u), o("div", { class: "field" }, o("label", { for: "assign-plant_id" }, "Sorte"), d), o("div", { class: "field" }, o("label", { for: "assign-bed_id" }, "Beet"), f), G("Status", "status", n, { select: ["geplant", "ges\xE4t", "gepflanzt", "geerntet"] }), Tl("assign-position"), o("div", { class: "form-grid" }, m, b), v, re(), ce(o("button", { type: "submit", class: "button" }, "Pflanze zuweisen")));
      k.addEventListener("submit", (_) => {
        _.preventDefault();
        let T = new FormData(k), I = { plant_id: T.get("plant_id"), bed_id: T.get("bed_id"), status: T.get("status"), position: T.get("position"), quantity: Number(T.get("quantity")), season_year: Number(T.get("season_year")) };
        te(k, async () => {
          await ze("rg_plantings", Te(), I), await Me("Beetzuweisung gespeichert."), i?.();
        });
      }), se("Ein Platz im Beet", k);
    }
    function Jd() {
      return o("div", {}, o("div", { class: "section-heading" }, E("Eure Ideen, Erfahrungen und Pl\xE4ne. F\xFCr alle in der Familie sichtbar."), S("+ Notiz schreiben", () => Sn())), p.data.notes.length ? o("div", { class: "note-grid" }, p.data.notes.map((t) => o("article", { class: "note-card" }, o("p", { class: "eyebrow" }, new Date(t.updated_at).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })), o("h2", {}, S(t.title, () => Sn(t), "card-title")), o("p", { class: "note-preview preserve-lines" }, t.content), t.plant_id && p.data.plants.some((e) => e.id === t.plant_id) ? S("Zur Pflanze  \u2197", () => He(p.data.plants.find((e) => e.id === t.plant_id)), "text-button") : null, S("Weiterdenken  \u2197", () => Sn(t), "text-button"), S("Teilen / Drucken", () => gr({ title: t.title, text: t.content, privateContent: true, back: () => Sn(t) }), "text-button")))) : lt("Platz f\xFCr Gartengedanken.", "Schreib auf, was du ausprobieren m\xF6chtest oder was besonders gut gewachsen ist.", S("Erste Notiz schreiben", () => Sn())), o("section", { class: "panel ai-panel" }, o("div", {}, o("span", { class: "pill" }, "Garten-Assistent"), o("h2", {}, "Manchmal hilft eine zweite Idee."), o("p", { class: "muted" }, "Stelle eine Gartenfrage. Die KI ist verf\xFCgbar, sobald sie in Supabase eingerichtet wurde.")), S("Eine Frage stellen  \u2197", xl, "button secondary")));
    }
    function Sn(t = null) {
      let e = o("form", {}, G("Titel", "title", t?.title || "", { required: true, maxlength: 150 }), G("Deine Gartennotiz", "content", t?.content || "", { area: true, required: true, maxlength: 12e3, rows: 10 }), E("Gemeinsam mit der Familie sichtbar. \xC4nderungen werden erst beim Speichern \xFCbernommen."), re(), ce(t ? S("L\xF6schen", (n) => W(async () => {
        confirm("Diese Notiz l\xF6schen?") && (await nt("rg_notes", Te(), t), await Me("Notiz gel\xF6scht."));
      }, n.currentTarget), "button danger") : null, o("button", { type: "submit", class: "button" }, "Notiz speichern")));
      e.addEventListener("submit", (n) => {
        n.preventDefault();
        let r = Object.fromEntries(new FormData(e));
        te(e, async () => {
          await ze("rg_notes", Te(), r, t), await Me("Notiz gespeichert.");
        });
      }), se(t ? "Gartengedanken bearbeiten" : "Ein neuer Gartengedanke", e);
    }
    function Zd() {
      let t = ae(), e = p.data.membership.preferred_ai_provider || "", n = o("select", { id: "personal-ai-provider", name: "provider", disabled: true }, o("option", { value: "" }, `Familienstandard (${Ce(wt())})`), o("option", { value: "openai" }, "ChatGPT / OpenAI"), o("option", { value: "gemini" }, "Google Gemini"));
      n.value = e;
      let r = o("p", { class: "muted small", role: "status", "aria-live": "polite" }, "Verf\xFCgbare KI-Zug\xE4nge werden gepr\xFCft \u2026"), i = o("div"), a = () => i.replaceChildren(en("personal-ai-model", n.value || wt()));
      n.addEventListener("change", a), a();
      let s = o("form", { class: "personal-ai-form" }, o("div", { class: "field" }, o("label", { for: n.id }, "Meine KI"), n), i, r, re(), ce(o("button", { type: "submit", class: "button" }, "KI-Auswahl speichern"), S("Verbindung pr\xFCfen", (u) => W(async () => {
        let d = n.value || wt();
        r.textContent = `${Ce(d)} wird mit einer kurzen Antwort gepr\xFCft \u2026`;
        let h;
        try {
          h = await Dt({ mode: "check", provider: d, model: Tn(d) });
        } catch (g) {
          throw t() && l.isConnected && (r.textContent = Ue(g)), g;
        }
        if (!(!t() || !l.isConnected)) {
          if (h?.connected !== true || h?.generationTested !== true) throw new Error("Eine echte Testantwort konnte nicht best\xE4tigt werden.");
          r.textContent = `Verbindung erfolgreich: ${Ce(d)} hat eine echte Testantwort geliefert.`;
        }
      }, u.currentTarget), "button secondary"))), l = o("section", { class: "panel personal-ai-panel" }, o("p", { class: "eyebrow" }, "DEINE PERS\xD6NLICHE KI-AUSWAHL"), o("h2", {}, "Du entscheidest, wer dir hilft."), o("p", { class: "muted" }, "W\xE4hle ChatGPT / OpenAI oder Gemini f\xFCr deine Gartenfragen, Fotos und Planentw\xFCrfe. Deine Anbieterwahl gilt f\xFCr dein Konto auf allen Ger\xE4ten. Andere Familienmitglieder w\xE4hlen unabh\xE4ngig."), s, E("Die Familienverwaltung hinterlegt die gemeinsamen API-Schl\xFCssel. Nicht eingerichtete Anbieter sind gesperrt. Die Modellwahl gilt pro Anbieter auf diesem Ger\xE4t. API-Kosten und das Limit von 20 Anfragen pro Stunde gelten gemeinsam; auch \u201EVerbindung pr\xFCfen\u201C kann Kosten verursachen."));
      s.addEventListener("submit", (u) => {
        u.preventDefault();
        let d = n.value || null;
        te(s, async () => {
          let h = C(await $().rpc("rg_set_ai_preference", { provider: d }));
          !t() || !l.isConnected || (p.data.membership = { ...p.data.membership, preferred_ai_provider: h.provider }, p.data.members = p.data.members.map((g) => g.user_id === p.user.id ? { ...g, preferred_ai_provider: h.provider } : g), delete s.dataset.dirty, r.textContent = h.provider ? `Deine Auswahl ist gespeichert: ${Ce(h.provider)}.` : `Du verwendest den Familienstandard: ${Ce(wt())}.`, J("Deine KI-Auswahl ist gespeichert. Andere Konten bleiben bei ihrer eigenen Auswahl."));
        });
      });
      let c = () => Promise.all(["openai", "gemini"].map(async (u) => [u, C(await $().rpc("rg_ai_provider_status", { provider: u }))])).then((u) => {
        if (!t() || !l.isConnected) return;
        for (let [h, g] of u) {
          let f = n.querySelector(`option[value="${h}"]`);
          f.disabled = !g.configured, f.textContent = `${h === "openai" ? "ChatGPT / OpenAI" : "Google Gemini"}${g.configured ? "" : " \xB7 noch nicht eingerichtet"}`;
        }
        n.disabled = false, n.options[0].textContent = `Familienstandard (${Ce(wt())})`, n.value || a();
        let d = p.data.membership.preferred_ai_provider;
        r.textContent = d ? `Deine gespeicherte Auswahl: ${Ce(d)}.` : `Aktuell nutzt du den Familienstandard: ${Ce(wt())}.`;
      }).catch(() => {
        t() && l.isConnected && (r.textContent = "Die verf\xFCgbaren Zug\xE4nge konnten nicht geladen werden. Bitte die Gartendaten aktualisieren.");
      });
      return l.addEventListener("aiaccesschanged", c), c(), l;
    }
    function Yd(t) {
      let e = ae(), n = o("select", { id: "shared-ai-provider", disabled: !t }, o("option", { value: "gemini" }, "Google Gemini"), o("option", { value: "openai" }, "OpenAI \xB7 ChatGPT-Modelle"));
      n.value = wt();
      let r = o("p", { class: "small", "data-active-ai-provider": "" }), i = o("div"), a = 0;
      function s() {
        let l = n.value, c = Ce(l), u = ++a, d = () => e() && u === a;
        r.textContent = `Familienstandard: ${Ce(wt())}. Eigene Auswahlen bleiben erhalten.`;
        let h = false, g = 0, f = o("p", { class: "muted small", "data-ai-key-status": "", role: "status", "aria-live": "polite" }, "KI-Einrichtung wird gepr\xFCft \u2026"), m = (k) => {
          h = k?.configured === true, f.textContent = h ? `Ein gemeinsamer ${c}-Schl\xFCssel ist gespeichert. Bitte die Verbindung pr\xFCfen.` : `Noch kein gemeinsamer ${c}-Schl\xFCssel gespeichert.`;
        }, b = async () => {
          if (!d()) return false;
          g++, f.textContent = `Verbindung zu ${c} wird mit einer echten Testantwort gepr\xFCft \u2026`;
          let k;
          try {
            k = await Dt({ mode: "check", provider: l, model: Tn(l) });
          } catch (_) {
            throw d() && (f.textContent = h ? "Der Schl\xFCssel ist gespeichert. Die Verbindung konnte nicht best\xE4tigt werden." : "Die Verbindung konnte nicht best\xE4tigt werden. Bitte Schl\xFCssel und API-Abrechnung pr\xFCfen."), _;
          }
          if (k?.connected !== true || k?.generationTested !== true) throw new Error("Eine echte Testantwort konnte noch nicht best\xE4tigt werden. Bitte erneut pr\xFCfen.");
          return d() ? (h = true, f.textContent = `Verbindung erfolgreich. ${An(l).find((_) => _.id === k.model)?.label || c} hat eine echte Testantwort geliefert.`, true) : false;
        }, v = async () => {
          !await b() || !d() || (C(await $().rpc("rg_activate_ai_provider", { provider: l })), d() && (await he({ quiet: true }), d() && (document.querySelector(".personal-ai-panel")?.dispatchEvent(new Event("aiaccesschanged")), r.textContent = `Familienstandard: ${Ce(wt())}. Eigene Auswahlen bleiben erhalten.`, f.textContent = `${c} ist als Familienstandard eingerichtet. Pers\xF6nliche Auswahlen bleiben erhalten.`, J(`${c} ist jetzt der Familienstandard f\xFCr Konten ohne eigene Auswahl.`))));
        }, y;
        if (t) {
          let k = G(`${c}-API-Schl\xFCssel`, "api_key", "", { type: "password", autocomplete: "off", autocapitalize: "none", spellcheck: "false", required: true, minlength: 20, maxlength: l === "openai" ? 512 : 256, placeholder: `Neuen ${c}-Schl\xFCssel eintragen` }), _ = k.querySelector("input"), T = o("form", { class: "ai-key-form" }, k, E("Der Schl\xFCssel wird serverseitig verschl\xFCsselt f\xFCr eure Familie gespeichert und anschlie\xDFend nicht wieder angezeigt. Mitglieder erhalten den Schl\xFCssel nicht."), re()), I = () => e() && n.value === l, D = (x) => {
            if (!T.dataset.busy) return g++, n.disabled = true, T.dataset.dirty = "true", te(T, async () => {
              I() && await x();
            }).finally(() => {
              I() && (n.disabled = false, _.value || delete T.dataset.dirty);
            });
          };
          T.addEventListener("input", () => {
            T.dataset.dirty = "true";
          }), T.addEventListener("submit", (x) => {
            x.preventDefault(), D(async () => {
              let w = C(await $().rpc("rg_set_ai_provider_key", { provider: l, api_key: _.value.trim() }));
              _.value = "", d() && (m(w), document.querySelector(".personal-ai-panel")?.dispatchEvent(new Event("aiaccesschanged")), await b() && d() && (document.querySelector(".personal-ai-panel")?.dispatchEvent(new Event("aiaccesschanged")), J(`${c}-Zugang gespeichert und gepr\xFCft. Jede Person w\xE4hlt ihre KI unter \u201EMeine KI\u201C.`)));
            });
          }), T.append(ce(o("button", { type: "submit", class: "button" }, "Schl\xFCssel speichern & pr\xFCfen"), S("Verbindung pr\xFCfen", () => D(b), "button secondary"), S("Als Familienstandard verwenden", () => D(v), "button secondary"), S("Schl\xFCssel entfernen", () => {
            confirm(`Gemeinsamen ${c}-Schl\xFCssel entfernen? Anfragen an diesen Anbieter sind danach nicht mehr m\xF6glich.`) && D(async () => {
              let x = C(await $().rpc("rg_set_ai_provider_key", { provider: l, api_key: null }));
              _.value = "", d() && (m(x), document.querySelector(".personal-ai-panel")?.dispatchEvent(new Event("aiaccesschanged")));
            });
          }, "button danger"))), y = T;
        } else y = o("div", {}, E("Die Familienverwaltung richtet den gemeinsamen Anbieter ein. Du brauchst keinen eigenen API-Schl\xFCssel."), S("Verbindung pr\xFCfen", (k) => W(b, k.currentTarget), "button secondary"));
        i.replaceChildren(en("settings-ai-model", l, `Testmodell (${c})`), o("p", { class: "muted small" }, l === "openai" ? "Die Garten-App nutzt OpenAI-Modelle \xFCber die API. Ein ChatGPT-Abo enth\xE4lt kein API-Guthaben. Abrechnung und Projektlimits gelten f\xFCr alle Familienanfragen zusammen. Schl\xFCssel anlegen: " : "Einen Gemini-API-Schl\xFCssel erh\xE4ltst du hier: ", o("a", { href: l === "openai" ? "https://platform.openai.com/api-keys" : "https://aistudio.google.com/apikey", target: "_blank", rel: "noopener noreferrer" }, l === "openai" ? "OpenAI API-Schl\xFCssel \u2197" : "Google AI Studio \u2197")), E("\u201EVerbindung pr\xFCfen\u201C erzeugt eine kurze API-Antwort und kann Kosten verursachen. Die vom Betreiber gesetzten Stunden- und Tageslimits gelten gemeinsam f\xFCr beide Anbieter."), f, y), (async () => {
          let k = g;
          try {
            let _ = C(await $().rpc("rg_ai_provider_status", { provider: l }));
            d() && g === k && m(_);
          } catch {
            d() && g === k && (f.textContent = "Der Einrichtungsstatus konnte nicht geladen werden. Bitte die Verbindung erneut pr\xFCfen.");
          }
        })();
      }
      return n.addEventListener("change", s), s(), o("section", { class: "panel shared-ai-panel" }, o("p", { class: "eyebrow" }, "GEMEINSAME ZUG\xC4NGE VERWALTEN"), o("h2", {}, "Zwei Zug\xE4nge. Freie Wahl."), E("Hinterlege einen Zugang f\xFCr OpenAI, Gemini oder beide. Jedes Mitglied w\xE4hlt seinen Anbieter selbst unter \u201EMeine KI\u201C. Der Familienstandard gilt nur f\xFCr Konten ohne eigene Auswahl."), r, o("div", { class: "field" }, o("label", { for: n.id }, "Gemeinsamen KI-Zugang einrichten"), n), i);
    }
    function Xd(t) {
      if (!t) return o("section", { class: "panel" }, o("h2", {}, "Eure Beete."), E(`${p.data.beds.length} Beete sind eingerichtet. Die Familienverwaltung kann weitere nummerierte Beete vorbereiten.`), S("Meine Beete \xF6ffnen", () => Pn("beds"), "button secondary"));
      let e = G("Gew\xFCnschte Beetanzahl", "bed_count", Math.max(1, p.data.beds.length), { type: "number", min: 1, max: 100, step: 1, required: true }), n = e.querySelector("input"), r = o("form", {}, e, o("div", { class: "bed-count-presets" }, [4, 6, 8, 10, 12].map((i) => S(String(i), () => {
        n.value = i, r.dataset.dirty = "true", n.focus();
      }, "chip", { "aria-label": `${i} Beete vorbereiten` }))), E(`${p.data.beds.length} Beete bestehen bereits. Fehlende Beete werden mit freien Nummern angelegt. Eine kleinere Zahl l\xF6scht keine Beete; einzelne Beete entfernst du \xFCber \u201EBeet bearbeiten\u201C.`), re(), o("button", { type: "submit", class: "button secondary" }, "Beetanzahl speichern"));
      return r.addEventListener("submit", (i) => {
        i.preventDefault();
        let a = Number(new FormData(r).get("bed_count"));
        te(r, async () => {
          let s = ae(), l = C(await $().rpc("rg_ensure_beds", { bed_count: a }));
          s() && (delete r.dataset.dirty, await vr(r, `${l.total} Beete vorhanden \xB7 ${l.created} neu angelegt.`));
        });
      }), o("section", { class: "panel bed-setup-panel" }, o("p", { class: "eyebrow" }, "PLATZ F\xDCR EURE SORTEN"), o("h2", {}, "Wie viele Beete habt ihr?"), r);
    }
    function Tl(t, e = "", n = false, r = "") {
      return o("label", { class: "field", for: t }, o("span", {}, "Position im Beet"), o("select", { id: t, name: "position", disabled: n, "aria-label": r ? `Position in ${r}` : "Position im Beet" }, Ea.map((i) => o("option", { value: i, selected: i === e }, i || "Noch offen / ganzes Beet"))));
    }
    function Qd(t, e = (/* @__PURE__ */ new Date()).getFullYear()) {
      if (!p.data.beds.length) return J("Lege zuerst Beete an \u2013 einzeln oder \xFCber die Beetanzahl in den Einstellungen."), $t();
      let n = ae(), r = p.data.plantings.filter((c) => c.plant_id === t.id && (c.season_year ?? (/* @__PURE__ */ new Date()).getFullYear()) === e), i = r.map((c) => ({ id: c.id, version: c.version })), a = new Map(r.map((c) => [c.bed_id, c])), s = [...p.data.beds].sort((c, u) => c.name.localeCompare(u.name, "de", { numeric: true })).map((c) => {
        let u = a.get(c.id), d = o("input", { type: "checkbox", checked: !!u, "aria-label": `${c.name} ausw\xE4hlen` }), h = o("select", { "aria-label": `Status in ${c.name}`, disabled: !u }, ["geplant", "ges\xE4t", "gepflanzt", "geerntet"].map((v) => o("option", { value: v, selected: v === (u?.status || "geplant") }, v))), g = o("input", { type: "number", min: 1, max: 1e4, step: 1, value: u?.quantity ?? 1, required: true, disabled: !u, "aria-label": `Anzahl in ${c.name}` }), f = Tl(`position-${c.id}`, u?.position || "", !u, c.name), m = f.querySelector("select");
        d.addEventListener("change", () => {
          h.disabled = !d.checked, g.disabled = !d.checked, m.disabled = !d.checked;
        });
        let b = ai(t, c.id, e, p.data.plantings, p.data.plants);
        return { bed: c, check: d, status: h, quantity: g, position: m, node: o("div", { class: "multi-bed-row" }, o("label", { class: "multi-bed-check" }, d, o("strong", {}, c.name)), o("div", { class: "multi-bed-fields" }, o("label", {}, o("span", {}, "Status"), h), o("label", {}, o("span", {}, "Anzahl"), g), f), b.length ? o("p", { class: "small danger-text" }, "Fruchtfolge pr\xFCfen: " + b[0]) : null) };
      }), l = o("form", {}, o("h3", {}, `${t.name} \xB7 ${t.variety || "Ohne Sortenangabe"}`), E(`Gartenjahr ${e}. W\xE4hle beliebig viele Beete. Jedes Beet kann gleichzeitig mehrere Sorten enthalten. W\xE4hle pro Beet auch die Position \u2013 vorne bezeichnet die Zugangsseite des Beets. Abgew\xE4hlte vorhandene Zuweisungen werden beim Speichern entfernt.`), o("div", { class: "multi-bed-list" }, s.map((c) => c.node)), re(), ce(S("Zur\xFCck zur Sorte", () => He(t), "button secondary"), o("button", { type: "submit", class: "button" }, "Beetbelegung speichern")));
      l.addEventListener("submit", (c) => {
        c.preventDefault();
        let u = s.filter((d) => d.check.checked).map((d) => ({ bed_id: d.bed.id, status: d.status.value, quantity: Number(d.quantity.value), position: d.position.value }));
        te(l, async () => {
          C(await $().rpc("rg_set_plant_beds", { selected_plant: t.id, selected_year: e, selections: u, expected_versions: i })), n() && (await he(), n() && (J("Beetbelegung gespeichert."), He(t)));
        });
      }), se("Beete f\xFCr diese Sorte ausw\xE4hlen", l);
    }
    function nl(t, { personalOnly: e = false, sharedOnly: n = false } = {}) {
      let r = xn(), i = p.data.family.settings_version ?? 1, a = ae(), s = o("select", { id: "garden-climate", name: "climate" }, [["mild", "Mild \xB7 Niederrhein / Duisburg"], ["normal", "Gem\xE4\xDFigt \xB7 Mitteleuropa"], ["cool", "K\xFChl \xB7 H\xF6henlage / Frostsenke"]].map(([f, m]) => o("option", { value: f, selected: f === r.climate }, m))), l = o("select", { id: "frost-month", name: "frost_month", required: true }, Array.from({ length: 12 }, (f, m) => o("option", { value: String(m + 1).padStart(2, "0") }, new Date(2e3, m, 1).toLocaleDateString("de-DE", { month: "long" })))), c = o("select", { id: "frost-day", name: "frost_day", required: true });
      l.value = r.last_frost.slice(0, 2);
      function u(f = c.value || r.last_frost.slice(3)) {
        let m = new Date(2e3, Number(l.value), 0).getDate();
        c.replaceChildren(...Array.from({ length: m }, (b, v) => o("option", { value: String(v + 1).padStart(2, "0") }, String(v + 1) + "."))), c.value = String(Math.min(Number(f), m)).padStart(2, "0");
      }
      u(), l.addEventListener("change", () => u());
      let d = o("fieldset", { class: "frost-date-field" }, o("legend", {}, "Frostvorsorge bis (Planungswert)"), o("div", { class: "frost-date-grid" }, o("div", { class: "field" }, o("label", { for: c.id }, "Tag"), c), o("div", { class: "field" }, o("label", { for: l.id }, "Monat"), l)), E("Gilt j\xE4hrlich \u2013 ohne feste Jahreszahl."));
      s.addEventListener("change", () => {
        l.value = "05", u(s.value === "cool" ? "31" : "15");
      });
      let h = o("form", {}, G("Gartenort", "location", r.location, { required: true, maxlength: 100 }), o("div", { class: "field" }, o("label", { for: "garden-climate" }, "Klima einordnen"), s), d, E("Der Termin ist eine vorsichtige Planungshilfe, keine Wettervorhersage. Nachtfr\xF6ste, Bodentemperatur und Angaben auf dem T\xFCtchen gehen vor. Bei k\xFChler Lage wird zun\xE4chst Ende Mai vorgeschlagen."), re(), o("button", { type: "submit", class: "button secondary" }, "Gartenstandort speichern"));
      h.addEventListener("submit", (f) => {
        f.preventDefault();
        let m = Object.fromEntries(new FormData(h));
        te(h, async () => {
          let b = ri({ ...m, last_frost: `${m.frost_month}-${m.frost_day}` });
          C(await $().rpc("rg_update_growing_settings", { settings: b, expected_version: i })), a() && (delete h.dataset.dirty, await vr(h, "Gartenstandort gespeichert."));
        });
      });
      let g = o("input", { type: "checkbox", "data-weather-enabled": "", checked: yt, onchange: (f) => {
        yt = f.target.checked;
        try {
          localStorage.setItem(Na, yt ? "on" : "off");
        } catch {
        }
        J(yt ? "Wetteranzeige eingeschaltet." : "Wetteranzeige ausgeschaltet.");
      } });
      return o("section", { class: "panel growing-settings-panel" }, o("p", { class: "eyebrow" }, e ? "AUF DEINEM GER\xC4T" : "PASSEND ZU EUREM GARTEN"), o("h2", {}, e ? "Dein Wetter. Dein Ort." : "Euer Ort. Eure Termine."), e ? null : [E(kr()), t ? h : E("Die Gartenverwaltung \xE4ndert den gemeinsamen Gartenstandort.")], n ? null : [e ? null : o("hr"), o("label", { class: "consent" }, g, o("span", {}, "Wetter anzeigen")), o("p", { class: "small", "data-weather-choice-status": "", role: "status" }, _r === "device" ? "Wetterort: aktueller Ger\xE4testandort." : "Wetterort: Duisburg."), Ca(), E("Die Wetterwahl gilt auf diesem Ger\xE4t und \xE4ndert nicht euren Gartenort oder die Aussaatplanung. Bei eingeschalteter Standortwahl wird der Aufenthaltsort bei Bedarf neu ermittelt. Ohne Ortung wird Duisburg ausdr\xFCcklich als Ausweichort angezeigt. Open-Meteo erh\xE4lt beim Abruf technisch notwendige Verbindungsdaten wie deine IP-Adresse.")]);
    }
    function eh() {
      if (p.data.membership.role !== "owner") return J("Nur die Familienverwaltung kann Sicherungen importieren.", true);
      let t = ae(), e = o("input", { id: "backup-file", type: "file", accept: ".json,application/json", required: true }), n = o("div", { class: "backup-preview", role: "status", "aria-live": "polite" }, E("W\xE4hle zuerst eine Gartensicherung.")), r = o("input", { type: "checkbox", required: true }), i = o("button", { type: "submit", class: "button", disabled: true }, "Gepr\xFCfte Daten erg\xE4nzen"), a = null, s = 0, l = o("form", {}, o("label", { class: "field", for: "backup-file" }, o("span", {}, "Gartensicherung (JSON \xB7 maximal 20 MB)"), e), n, o("label", { class: "consent" }, r, o("span", {}, "Ich m\xF6chte die angezeigten Eintr\xE4ge in diesem Familiengarten erg\xE4nzen. Bestehende Eintr\xE4ge werden nicht \xFCberschrieben.")), E("Fotoverweise funktionieren nur, solange die Dateien noch im privaten Speicher dieses Familiengartens liegen. Die JSON-Datei enth\xE4lt keine Bilddateien und keine KI-Schl\xFCssel. Standort- und Kontoeinstellungen werden nicht ver\xE4ndert."), re(), ce(S("Abbrechen", () => j.close(), "button secondary"), i));
      e.addEventListener("change", async () => {
        let c = ++s;
        a = null, i.disabled = true, r.checked = false;
        let u = e.files[0];
        if (!u) return n.replaceChildren(E("Keine Datei ausgew\xE4hlt."));
        if (u.size > 2e7) return n.replaceChildren(E("Die Datei ist gr\xF6\xDFer als 20 MB."));
        n.replaceChildren(E("Sicherung wird gepr\xFCft \u2026"));
        try {
          let d;
          try {
            d = JSON.parse(await u.text());
          } catch {
            throw new Error("Die Datei enth\xE4lt kein g\xFCltiges JSON.");
          }
          if (c !== s || !t() || !j.contains(l)) return;
          a = Ko(d, p.data);
          let h = a.summary;
          n.replaceChildren(o("h3", {}, "Vorschau der Erg\xE4nzungen"), E(`Quelle: ${a.backup.family || "Gartensicherung"} \xB7 Ziel: ${p.data.family.name}`), o("dl", { class: "backup-counts" }, [["Pflanzen / Sorten", h.plants], ["Beete", h.beds], ["Beetzuweisungen", h.plantings], ["Notizen", h.notes], ["Gartentermine", h.events]].map(([g, f]) => o("div", {}, o("dt", {}, g), o("dd", {}, f)))), E("Gleiche Kultur, Sorte und Kategorie sowie gleichnamige Beete werden wiederverwendet. Vorhandene Sortennotizen bleiben erhalten.")), i.disabled = !Object.entries(h).some(([g, f]) => g !== "photos" && f > 0), i.disabled && n.append(E("Alle Eintr\xE4ge dieser Sicherung sind bereits vorhanden."));
        } catch (d) {
          a = null, n.replaceChildren(o("p", { class: "form-error" }, Ue(d)));
        }
      }), l.addEventListener("submit", (c) => {
        c.preventDefault(), a && te(l, async () => {
          if (!t() || !j.contains(l)) return;
          let u = C(await $().rpc("rg_import_garden", { backup: a.backup }));
          t() && await Me(`Sicherung erg\xE4nzt: ${u.plants} Pflanzen, ${u.beds} Beete, ${u.plantings} Zuweisungen und ${u.notes} Notizen und ${u.events || 0} Termine.`);
        });
      }), se("Gartensicherung wiederherstellen", l);
    }
    function th() {
      let t = ae(), e = p.user.id, n = p.data.profile || null, r = xi({ path: n?.photo_path, label: "Profilfoto", loadPhoto: ya, personal: true }), i = p.data?.capabilities?.public_profiles !== false, a = o("input", { type: "checkbox", checked: n?.visibility === "public" && i, disabled: !n || !i }), s = o("input", { type: "checkbox", checked: n?.public_city === true, disabled: !n }), l = G("Anzeigename", "display_name", n?.display_name || "", { maxlength: 80, autocomplete: "nickname" }), c = o("button", { type: "submit", class: "button" }, "Profil speichern"), u = o("p", { class: "callout" }, ""), d = () => {
        l.querySelector("input").required = a.checked, c.textContent = a.checked ? "Profil speichern & ver\xF6ffentlichen" : "Profil privat speichern", u.textContent = i ? a.checked ? "\xD6ffentlich sichtbar: Anzeigename, gew\xE4hltes Profilfoto und \u2013 falls angekreuzt \u2013 Wohnort. Keine E-Mail-Adresse, Gartendaten oder Kontorechte." : "Dein Profil und Foto bleiben nur f\xFCr dich zug\xE4nglich. Der pers\xF6nliche Wohnort \xE4ndert keine Garten- oder Wettereinstellung." : "\xD6ffentliche Profile sind derzeit vom Betreiber deaktiviert. Speichern stellt dein Profil auf privat.";
      };
      a.addEventListener("change", d), d();
      let h = n?.visibility === "public" && i ? new URL(`?profile=${n.public_slug}`, new URL(le, location.origin)).href : null, g = h ? o("input", { type: "text", value: h, readonly: true, "aria-label": "Dein \xF6ffentlicher Profil-Link" }) : null, f = o("form", {}, o("p", { class: "eyebrow" }, "DEINE ANGABEN SIND FREIWILLIG"), o("h2", {}, n ? "Dein Profil" : "Profil erstellen"), E("Du entscheidest, was du eintr\xE4gst und ver\xF6ffentlichst. Bitte keine vertraulichen Angaben oder genaue Wohnadresse verwenden."), l, G("Wohnort (optional)", "city", n?.city || "", { maxlength: 100, autocomplete: "address-level2", placeholder: "Zum Beispiel Duisburg" }), r.node, o("section", { class: "profile-publication" }, o("h3", {}, "Sichtbarkeit"), o("label", { class: "consent" }, a, o("span", {}, "Ich m\xF6chte mein Profil \xF6ffentlich im Internet teilen.")), o("label", { class: "consent" }, s, o("span", {}, "Meinen Wohnort ebenfalls \xF6ffentlich anzeigen.")), n ? null : E("Speichere dein Profil zuerst privat. Danach kannst du es hier bewusst ver\xF6ffentlichen."), u, E("\xD6ffentliche Angaben k\xF6nnen von anderen kopiert werden. Zur\xFCckstellen auf privat sperrt k\xFCnftige Profil- und Fotoabrufe in der App; bereits gespeicherte Kopien bei Dritten lassen sich damit nicht zur\xFCckholen."), h ? o("div", { class: "profile-share" }, o("label", { class: "field" }, o("span", {}, "Dein \xF6ffentlicher Profil-Link"), g), ce(o("a", { class: "button secondary", href: h, target: "_blank", rel: "noopener noreferrer" }, "\xD6ffentliches Profil ansehen"), S("Profil-Link kopieren", async () => {
        try {
          await navigator.clipboard.writeText(h), J("Profil-Link kopiert.");
        } catch {
          g.focus(), g.select(), J("Bitte den markierten Profil-Link \xFCber das Ger\xE4temen\xFC kopieren.");
        }
      }, "button secondary"))) : null), re(), ce(n ? S("Profil l\xF6schen", (m) => W(async () => {
        if (!confirm("Deine freiwilligen Profilangaben und Fotos l\xF6schen? Dein Anmeldekonto und eure Gartendaten bleiben bestehen.")) return;
        let b = C(await $().from("rg_profiles").update({ visibility: "private" }).eq("user_id", e).eq("version", n.version).select().maybeSingle());
        if (!b) throw new Error("Dein Profil wurde inzwischen ge\xE4ndert. Bitte neu \xF6ffnen.");
        try {
          await Promise.all([di(n.photo_path), hi(n.public_photo_path)]);
        } catch {
          throw t() && await he({ quiet: true }), new Error("Dein Profil ist jetzt privat. Ein Foto konnte noch nicht gel\xF6scht werden. Bitte schlie\xDFe das Fenster und \xF6ffne das Profil zum erneuten L\xF6schen.");
        }
        if (!C(await $().from("rg_profiles").delete().eq("user_id", e).eq("version", b.version).select("user_id").maybeSingle())) throw new Error("Dein Profil wurde inzwischen ge\xE4ndert. Bitte neu \xF6ffnen.");
        t() && await Me("Profil gel\xF6scht.");
      }, m.currentTarget), "text-button danger-text") : null, c));
      return f.addEventListener("submit", (m) => {
        m.preventDefault();
        let b = new FormData(f), v = !!n && a.checked, y = v && s.checked, k = r.remove();
        te(f, async () => {
          let _ = null, T = null, I = false;
          try {
            let D = await r.getPhoto();
            if (!t() || !j.contains(f)) return;
            D && (_ = await Po(D, e));
            let x = k ? null : _ || n?.photo_path || null, w = null;
            if (v && x) if (n.visibility === "public" && n.photo_path === x && n.public_photo_path) w = n.public_photo_path;
            else {
              let R = D?.blob || await ya(x);
              T = await Do(R, n.public_slug), w = T;
            }
            if (!t() || !j.contains(f)) return;
            let P = { display_name: String(b.get("display_name") || "").trim(), city: String(b.get("city") || "").trim(), photo_path: x, visibility: v ? "public" : "private", public_city: y, public_photo_path: w }, F = n ? $().from("rg_profiles").update(P).eq("user_id", e).eq("version", n.version) : $().from("rg_profiles").insert({ ...P, user_id: e });
            if (!C(await F.select().maybeSingle())) throw new Error("Dein Profil wurde inzwischen ge\xE4ndert. Bitte neu \xF6ffnen und die Angaben vergleichen.");
            I = true;
            let q = [];
            n?.photo_path && n.photo_path !== x && q.push(di(n.photo_path)), n?.public_photo_path && n.public_photo_path !== w && q.push(hi(n.public_photo_path));
            let ne = await Promise.allSettled(q);
            t() && ne.some((R) => R.status === "rejected") && J("Profil gespeichert. Eine alte Bilddatei konnte noch nicht entfernt werden; \xF6ffentliche Abrufe wurden bereits gesperrt.", true), t() && j.contains(f) && await Me(v ? "Profil ver\xF6ffentlicht." : "Profil privat gespeichert.");
          } finally {
            I || await Promise.allSettled([_ ? di(_) : Promise.resolve(), T ? hi(T) : Promise.resolve()]);
          }
        });
      }), { node: f, cleanup: r.cleanup };
    }
    async function nh(t) {
      let e = C(await $().rpc("rg_public_profile", { profile_slug: t })), n = o("img", { class: "public-profile-photo", alt: "Profilfoto", hidden: true }), r = e ? o("article", { class: "panel public-profile" }, n, o("p", { class: "eyebrow" }, "\xD6FFENTLICHES PROFIL"), o("h1", {}, e.display_name), e.city ? o("p", { class: "public-profile-city" }, "\u{1F4CD} ", e.city) : null, E("Diese Angaben wurden von der Person selbst zur Ver\xF6ffentlichung freigegeben.")) : lt("Dieses Profil ist nicht \xF6ffentlich.", "Der Link ist ung\xFCltig oder das Profil wurde auf privat gestellt.");
      if (xe.replaceChildren(o("main", { class: "setup-page" }, o("div", { class: "installation-top" }, Ua()), o("a", { href: le, class: "brand" }, "Rezepte"), r, o("a", { href: le, class: "button secondary" }, "Zur Garten-App"), Ct())), e?.photo_path) try {
        if (!new RegExp(`^${t}/[a-f0-9-]{36}\\.jpg$`).test(e.photo_path)) return;
        let i = C(await $().storage.from("rg-public-profile-photos").download(e.photo_path));
        if (i.type !== "image/jpeg" || i.size > 262144) return;
        let a = URL.createObjectURL(i);
        n.src = a, n.hidden = false, window.addEventListener("pagehide", () => URL.revokeObjectURL(a), { once: true });
      } catch {
      }
    }
    function rh() {
      let t = ae(), e = o("div", { class: "administration-entry", hidden: true });
      return $().rpc("rg_admin_access", { action: "status" }).then((n) => {
        !t() || !e.isConnected || n.error || n.data?.available !== true || (e.hidden = false, e.append(o("div", {}, o("p", { class: "eyebrow" }, "SUPERADMIN \xB7 NUR F\xDCR DICH"), o("h2", {}, "Dein pers\xF6nlicher Adminbereich")), S(n.data.configured ? "\u{1F512} Pers\xF6nlichen Adminbereich entsperren" : "\u{1F512} Pers\xF6nlichen Adminbereich einrichten", (r) => W(async () => {
          let i = C(await $().rpc("rg_admin_access", { action: "status" }));
          t() && i?.available && Ma(i.configured);
        }, r.currentTarget), "button secondary", { "data-admin-entry": "" }), E("Nur f\xFCr dein Konto \xB7 mit zus\xE4tzlichem Adminpasswort")));
      }).catch(() => {
      }), e;
    }
    var mr = () => `ramonas-garten-admin-recovery:${le}:${p.user?.id || ""}`, Ra = false;
    async function ih() {
      if (Ra || j.open || !p.data?.membership || Ge) return;
      let t;
      try {
        t = Number(localStorage.getItem(mr()));
      } catch {
        return;
      }
      if (!t) return;
      if (Date.now() - t > 6e5) {
        try {
          localStorage.removeItem(mr());
        } catch {
        }
        return;
      }
      let e = ae();
      Ra = true;
      try {
        let n = C(await $().rpc("rg_admin_recovery", { action: "status" }));
        if (e() && !j.open && n?.available && n.ready) {
          try {
            localStorage.removeItem(mr());
          } catch {
          }
          La(n);
        }
      } catch {
      } finally {
        Ra = false;
      }
    }
    function La(t = null) {
      let e = ae(), n = o("div"), r = false, i = () => !r && e() && j.open && j.contains(n), a = async (l) => {
        let c = C(await $().rpc("rg_admin_recovery", l));
        if (!c?.available && l.action !== "reset") throw new Error("Die Wiederherstellung ist nur f\xFCr das fest hinterlegte Betreiberkonto freigegeben.");
        return c;
      };
      function s(l) {
        if (!i()) return;
        if (l.ready) {
          let u = o("form", {}, E("Die frische E-Mail-Best\xE4tigung wurde gepr\xFCft. Lege ein neues Zusatzpasswort fest. Das Anmeldepasswort bleibt unver\xE4ndert; bisherige Adminfreigaben werden ung\xFCltig."), G("Neues Superadmin-Zusatzpasswort", "new_password", "", { type: "password", required: true, minlength: 12, maxlength: 128, autocomplete: "new-password" }), G("Neues Zusatzpasswort wiederholen", "repeat_password", "", { type: "password", required: true, minlength: 12, maxlength: 128, autocomplete: "new-password" }), re(), ce(o("button", { type: "submit", class: "button" }, "Superadmin-Zusatzpasswort zur\xFCcksetzen")));
          u.addEventListener("submit", (d) => {
            d.preventDefault();
            let h = new FormData(u);
            te(u, async () => {
              if (h.get("new_password") !== h.get("repeat_password")) throw new Error("Die Zusatzpassw\xF6rter stimmen nicht \xFCberein.");
              if (!(await a({ action: "reset", new_password: h.get("new_password") })).reset) throw new Error("Das Zusatzpasswort konnte nicht zur\xFCckgesetzt werden.");
              for (let f of u.querySelectorAll("input")) f.value = "";
              try {
                localStorage.removeItem(mr());
              } catch {
              }
              i() && (Ma(true), J("Zusatzpasswort zur\xFCckgesetzt. Bitte erneut entsperren."));
            });
          }), n.replaceChildren(u);
          return;
        }
        let c = o("p", { class: "muted small", role: "status" }, l.requested ? "Ein Link wurde angefordert. \xD6ffne die E-Mail im Browser und fahre in dem Fenster fort, in dem der Link ge\xF6ffnet wird." : "Dein bisheriges Zusatzpasswort bleibt g\xFCltig, bis du ein neues festgelegt hast.");
        n.replaceChildren(E("Die Wiederherstellung gilt ausschlie\xDFlich f\xFCr dein fest hinterlegtes Betreiberkonto. Ein neuer Anmeldelink geht an dessen best\xE4tigte E-Mail-Adresse. Nach dem \xD6ffnen kannst du innerhalb von zehn Minuten ein neues Zusatzpasswort setzen. Es werden keine Rechte auf andere Konten \xFCbertragen."), S("Best\xE4tigungslink per E-Mail senden", (u) => W(async () => {
          let d = await a({ action: "request" });
          if (i()) {
            C(await $().auth.signInWithOtp({ email: d.email, options: { shouldCreateUser: false, emailRedirectTo: new URL(le, location.origin).href } }));
            try {
              localStorage.setItem(mr(), String(Date.now()));
            } catch {
            }
            i() && (c.textContent = "Best\xE4tigungslink angefordert. Schau in dein E-Mail-Postfach und \xF6ffne den neuesten Link. Er f\xFChrt zur App. Gegebenenfalls dort wieder \u201EZusatzpasswort vergessen?\u201C \xF6ffnen.");
          }
        }, u.currentTarget), "button"), c, S("E-Mail-Link ge\xF6ffnet \u2013 Best\xE4tigung pr\xFCfen", (u) => W(async () => {
          let d = await a({ action: "status" });
          if (i()) {
            if (!d.ready) throw new Error("Die neue E-Mail-Best\xE4tigung fehlt oder ist abgelaufen. Fahre im Browserfenster fort, in dem du den neuesten Link ge\xF6ffnet hast.");
            s(d);
          }
        }, u.currentTarget), "button secondary"), E("Supabase begrenzt E-Mail-Versand. Bei einer Fehlermeldung warten und den Hinweis beachten. Es wurde kein kostenpflichtiger E-Mail-Dienst eingerichtet."));
      }
      se("Superadmin-Zusatzpasswort wiederherstellen", n, { className: "admin-dialog", cleanup: () => {
        r = true, n.replaceChildren();
      } }), t ? s(t) : W(async () => s(await a({ action: "status" })));
    }
    function Ma(t, e = "users") {
      let n = $d(), r = o("div", { class: "administration-content" }), i = null, a = null, s = false, l = 0, c = () => !s && n() && j.open && j.contains(r), u = () => {
        if (clearTimeout(a), i) {
          let y = i;
          i = null, Promise.resolve($().rpc("rg_admin_access", { action: "lock", unlock_token: y })).catch(() => {
          });
        }
      }, d = async (y) => {
        let k = C(await $().rpc("rg_admin_access", y));
        if (k?.available === false) throw new Error("Dieser pers\xF6nliche Adminbereich ist f\xFCr dein Konto nicht freigegeben.");
        if (k?.error) throw new Error(k.error);
        return k;
      };
      function h() {
        let y = o("form", {}, E(t ? "Gib dein zus\xE4tzliches Adminpasswort ein. Die Freigabe gilt zehn Minuten und endet beim Schlie\xDFen dieses Fensters." : "Lege ein eigenes Zusatzpasswort fest. Verwende eine andere lange Wortfolge als f\xFCr dein Anmeldekonto. Dieses Passwort wird nur als gesalzener Pr\xFCfwert auf dem Server gespeichert."), G(t ? "Admin-Zusatzpasswort" : "Neues Admin-Zusatzpasswort", "admin_password", "", { type: "password", required: true, minlength: 12, maxlength: 128, autocomplete: t ? "current-password" : "new-password" }), t ? null : G("Zusatzpasswort wiederholen", "confirm_password", "", { type: "password", required: true, minlength: 12, maxlength: 128, autocomplete: "new-password" }), re(), o("button", { type: "submit", class: "button" }, t ? "Entsperren" : "Zusatzpasswort einrichten"));
        y.addEventListener("submit", (k) => {
          k.preventDefault();
          let _ = y.elements.namedItem("admin_password").value;
          if (!t && _ !== y.elements.namedItem("confirm_password").value) {
            y.querySelector("[data-error]").textContent = "Die Zusatzpassw\xF6rter stimmen nicht \xFCberein.";
            return;
          }
          te(y, async () => {
            if (!t) {
              await d({ action: "setup", password: _ }), t = true;
              for (let I of xe.querySelectorAll("[data-admin-entry]")) I.textContent = "\u{1F512} Pers\xF6nlichen Adminbereich entsperren";
              if (!c()) return;
            }
            let T = await d({ action: "unlock", password: _ });
            for (let I of y.querySelectorAll("input[type=password]")) I.value = "";
            if (!T.unlocked || !/^[a-f0-9]{64}$/.test(T.token || "")) throw new Error("Der Adminbereich konnte nicht entsperrt werden.");
            if (!c()) {
              Promise.resolve($().rpc("rg_admin_access", { action: "lock", unlock_token: T.token })).catch(() => {
              });
              return;
            }
            i = T.token, a = setTimeout(() => {
              u(), c() && (h(), J("Adminbereich nach zehn Minuten gesperrt."));
            }, Math.min(6e5, Math.max(0, Date.parse(T.expires_at) - Date.now()))), e === "maintenance" ? await f.show("maintenance") : await m();
          });
        }), r.replaceChildren(y, t ? S("Zusatzpasswort vergessen?", () => La(), "text-button") : null);
      }
      async function g(y) {
        if (!i) throw new Error("Bitte den Adminbereich erneut entsperren.");
        return C(await $().rpc("rg_admin_manage", { unlock_token: i, ...y }));
      }
      let f = Jo({ h: o, button: S, small: E, field: G, formError: re, formAction: te, perform: W, notify: J, container: r, active: c, getToken: () => i, usersView: m, changePassword: v, recover: () => La(), close: () => j.close(), refresh: () => he({ quiet: true }) });
      async function m(y = "", k = 0) {
        let _ = ++l, [T, I] = await Promise.all([g({ action: "list", search_query: y, page_number: k }), f.rpc({ action: "status" })]);
        if (!c() || _ !== l) return;
        if (!Array.isArray(T?.users)) throw new Error("Die Kontoliste konnte nicht geladen werden.");
        let D = G("Registriertes Konto suchen", "account_search", y, { type: "search", maxlength: 254, placeholder: "E-Mail-Adresse oder Teil davon" }), x = o("form", { class: "admin-search" }, D, o("button", { type: "submit", class: "button secondary" }, "Konten suchen"), re());
        x.addEventListener("submit", (z) => {
          z.preventDefault(), te(x, () => m(D.querySelector("input").value.trim(), 0));
        });
        let w = (z, q, ne) => W(async () => {
          confirm(q === "owner" ? `${z.email} zur Gartenverwaltung machen? Diese Person kann danach Mitglieder, KI-Zug\xE4nge und gemeinsame Einstellungen verwalten. Dein pers\xF6nlicher Adminbereich bleibt ausschlie\xDFlich f\xFCr dich.` : `Adminrechte von ${z.email} entfernen? Die Person bleibt Familienmitglied.`) && (await g({ action: "set_role", target_id: z.id, requested_role: q }), c() && (await he({ quiet: true }), await m(y, k), J("Rolle gespeichert.")));
        }, ne.currentTarget), P = o("ul", { class: "admin-user-list" }, T.users.map((z) => o("li", {}, o("div", {}, o("strong", {}, z.email), E(`${z.confirmed ? "E-Mail best\xE4tigt" : "E-Mail noch nicht best\xE4tigt"} \xB7 ${z.membership === "own" ? z.role === "owner" ? "Admin \xB7 Gartenverwaltung" : "Familienmitglied" : z.membership === "other" ? "Bereits einem anderen Garten zugeordnet" : "Noch keinem Garten zugeordnet"}`)), z.id === p.user.id ? o("span", { class: "pill" }, "Dein Konto") : z.membership === "own" ? S(z.role === "owner" ? "Adminrechte entfernen" : "Adminrechte geben", (q) => w(z, z.role === "owner" ? "member" : "owner", q), "button secondary") : z.membership === "none" && z.confirmed ? S("F\xFCr Garten freischalten", (q) => W(async () => {
          confirm(`${z.email} Zugang zu eurem Familiengarten geben?`) && (await g({ action: "add", target_id: z.id }), c() && (await he({ quiet: true }), await m(y, k)));
        }, q.currentTarget), "button secondary") : null))), F = o("div", { class: "form-actions" }, S("Zur\xFCck", (z) => W(() => m(y, k - 1), z.currentTarget), "button secondary", { disabled: k === 0 }), E(`${T.total} registrierte Konten \xB7 Seite ${k + 1}`), S("Weiter", (z) => W(() => m(y, k + 1), z.currentTarget), "button secondary", { disabled: (k + 1) * 20 >= T.total }));
        for (let [z, q] of T.users.entries()) if (q.id !== p.user.id) {
          let ne = I.blocked_users.includes(q.id);
          P.children[z].append(S(ne ? "App-Zugang entsperren" : "App-Zugang sperren", (R) => W(async () => {
            confirm(ne ? `${q.email} wieder Zugang zur Garten-App erlauben?` : `${q.email} den Zugang zur Garten-App sperren? Gartendaten bleiben gespeichert; die Kalenderfreigabe wird widerrufen. Bereits geladene Inhalte oder Kopien lassen sich nicht zur\xFCckholen.`) && (await f.rpc({ action: ne ? "unblock" : "block", target_id: q.id }), c() && await m(y, k));
          }, R.currentTarget), "button secondary")), ne && P.children[z].querySelector("div").append(o("span", { class: "pill" }, "App-Zugang gesperrt"));
        }
        r.replaceChildren(o("div", { class: "admin-unlocked" }, o("span", {}, "\u{1F512} Zus\xE4tzlich entsperrt \xB7 maximal 10 Minuten"), S("Jetzt sperren", () => j.close(), "button secondary")), f.navigation(), E("Adminrechte gelten f\xFCr die Verwaltung eures Familiengartens. Dein pers\xF6nlicher Bereich mit Kontoliste und Rollenvergabe bleibt ausschlie\xDFlich f\xFCr dein Konto freigegeben."), S("Neuen Nutzer per E-Mail einladen", (z) => W(b, z.currentTarget), "button"), x, P, F, S("Admin-Zusatzpasswort \xE4ndern", v, "text-button"));
      }
      async function b() {
        let y = C(await $().rpc("rg_admin_invitation", { unlock_token: i, action: "list" }));
        if (!c()) return;
        let k = o("p", { class: "muted", role: "status" }), _ = o("form", {}, G("E-Mail-Adresse der eingeladenen Person", "invite_email", "", { type: "email", required: true, maxlength: 254, autocomplete: "off" }), E("Die Person erh\xE4lt einen zeitlich begrenzten Best\xE4tigungslink und legt selbst ein Passwort fest. Danach erh\xE4lt sie normale Mitgliedsrechte in eurem Garten. Es wird kein Passwort per E-Mail versendet."), re(), o("button", { class: "button", type: "submit" }, "Einladungslink senden"), k);
        _.addEventListener("submit", (D) => {
          D.preventDefault();
          let x = String(new FormData(_).get("invite_email") || "").trim();
          te(_, async () => {
            await wo({ email: x, unlock_token: i }), c() && (await b(), J("Einladung an Supabase zum Versand \xFCbergeben. Bitte auch im Spamordner nachsehen."));
          });
        });
        let T = { reserved: "Versand noch nicht best\xE4tigt", sent: "Versendet \xB7 Annahme offen", failed: "Versand fehlgeschlagen", revoked: "Zur\xFCckgezogen", accepted: "Angenommen" }, I = o("ul", { class: "admin-user-list" }, (y.invitations || []).map((D) => {
          let x = Date.parse(D.expires_at) <= Date.now(), w = ["reserved", "sent"].includes(D.state) && !x;
          return o("li", {}, o("div", {}, o("strong", {}, D.email), E(x && ["reserved", "sent"].includes(D.state) ? "Abgelaufen" : T[D.state] || D.state)), w ? S("Einladung zur\xFCckziehen", (P) => W(async () => {
            C(await $().rpc("rg_admin_invitation", { unlock_token: i, action: "revoke", invitation_id: D.id })), c() && await b();
          }, P.currentTarget), "button secondary") : null);
        }));
        r.replaceChildren(S("Zur\xFCck zu den Konten", (D) => W(() => m(), D.currentTarget), "text-button"), o("h3", {}, "Einladungen in euren Garten"), _, o("details", {}, o("summary", {}, "Versandgrenzen & G\xFCltigkeit"), E("Die Einladung kann h\xF6chstens 24 Stunden angenommen werden; der E-Mail-Link kann laut Supabase-Einstellung fr\xFCher ablaufen. Es gelten maximal zwei Versandversuche pro Stunde und zehn pro Tag. Der kostenlose Supabase-Standardversand erlaubt nur wenige E-Mails und beschr\xE4nkt Empf\xE4nger auf Projektteam-Adressen. F\xFCr weitere Empf\xE4nger ist ein eigener SMTP-Zugang n\xF6tig; ein kostenpflichtiger Dienst wurde nicht aktiviert.")), o("h4", {}, "Letzte 20 Einladungen"), I, E("Zur\xFCckziehen verhindert den Gartenzugang \xFCber diese Einladung. Ein bereits angelegtes Anmeldekonto wird dadurch nicht gel\xF6scht. Bereits angenommene Mitglieder verwaltest du in der Kontoliste."));
      }
      function v() {
        let y = o("form", {}, G("Neues Admin-Zusatzpasswort", "password", "", { type: "password", required: true, minlength: 12, maxlength: 128, autocomplete: "new-password" }), G("Zusatzpasswort wiederholen", "confirm", "", { type: "password", required: true, minlength: 12, maxlength: 128, autocomplete: "new-password" }), re(), ce(S("Zur\xFCck", (k) => W(() => m(), k.currentTarget), "button secondary"), o("button", { type: "submit", class: "button" }, "Zusatzpasswort \xE4ndern")));
        y.addEventListener("submit", (k) => {
          k.preventDefault();
          let _ = new FormData(y);
          te(y, async () => {
            if (_.get("password") !== _.get("confirm")) throw new Error("Die Zusatzpassw\xF6rter stimmen nicht \xFCberein.");
            await d({ action: "change_password", unlock_token: i, password: _.get("password") }), u(), c() && (h(), J("Zusatzpasswort ge\xE4ndert. Bitte erneut entsperren."));
          });
        }), r.replaceChildren(y);
      }
      h(), se("Dein pers\xF6nlicher Adminbereich", r, { className: "admin-dialog", cleanup: () => {
        s = true, u(), r.replaceChildren();
      } });
    }
    function Pl() {
      let t = p.user?.id;
      if (!t) return;
      let e = (p.data?.members || []).filter((l) => l.user_id !== t), n = p.data?.membership, r = !!(n && e.length && (p.data.family.owner_id === t || n.role === "owner" && !e.some((l) => l.role === "owner"))), i = o("select", { name: "successor_id", id: "delete-successor", required: r }, o("option", { value: "" }, "Bitte ausw\xE4hlen"), e.map((l) => o("option", { value: l.user_id }, l.email))), a = o("input", { type: "checkbox", name: "confirm_empty", required: !!(n && !e.length) }), s = o("form", {}, o("div", { class: "callout" }, o("strong", {}, "Dein eigenes Konto endg\xFCltig l\xF6schen"), o("p", {}, "Dein Profil, deine pers\xF6nlichen Aufgaben, deine Forumthemen mit Antworten, deine eigenen Antworten und Ernteeintr\xE4ge sowie von dir hochgeladene Fotos werden entfernt. Deine Anmeldung, Kalenderfreigabe und gegebenenfalls dein pers\xF6nlicher Superadminzugang entfallen. Bereits exportierte Kopien bei anderen lassen sich damit nicht zur\xFCckholen.")), E("Wenn andere Familienmitglieder bleiben, bleiben gemeinsame Pflanzen, Beete, Anbauhistorie, Gartennotizen und Termine erhalten. Deine Konto-ID wird als Autor daraus entfernt; Textinhalte k\xF6nnen weiterhin Angaben enthalten, die du vorher selbst bearbeiten oder l\xF6schen solltest. Deine hochgeladenen Fotos werden auch aus gemeinsamen Eintr\xE4gen entfernt."), r ? o("div", { class: "field" }, o("label", { for: i.id }, "Gartenverwaltung \xFCbergeben an"), i, E("Diese Person erh\xE4lt die Verwaltung dieses Familiengartens. Sie erh\xE4lt keinen pers\xF6nlichen Superadminzugang.")) : null, n && !e.length ? o("label", { class: "consent" }, a, o("span", {}, "Ich bin das letzte Mitglied und m\xF6chte auch diesen Familiengarten samt allen Gartendaten, Fotos und gespeicherten KI-Zug\xE4ngen endg\xFCltig l\xF6schen.")) : null, E("Lade vor dem L\xF6schen bei Bedarf deine Gartensicherung und die separaten Gartenleben-Sicherungen herunter. Eine automatische Wiederherstellung des Kontos ist nicht vorgesehen."), G("Aktuelles Passwort zur Best\xE4tigung", "delete_password", "", { type: "password", required: true, autocomplete: "current-password", maxlength: 128 }), G("Zum Best\xE4tigen KONTO L\xD6SCHEN eingeben", "delete_confirmation", "", { required: true, autocomplete: "off", maxlength: 20 }), re(), ce(S("Abbrechen", () => j.close(), "button secondary"), o("button", { type: "submit", class: "button danger" }, "Mein Konto endg\xFCltig l\xF6schen")));
      s.addEventListener("submit", (l) => {
        l.preventDefault();
        let c = new FormData(s);
        te(s, async () => {
          if (c.get("delete_confirmation") !== "KONTO L\xD6SCHEN") throw new Error("Bitte zur Best\xE4tigung genau KONTO L\xD6SCHEN eingeben.");
          let u = c.get("delete_password");
          if (s.elements.namedItem("delete_password").value = "", await bo({ password: u, expected_user_id: t, confirmation: "KONTO L\xD6SCHEN", successor_id: r ? c.get("successor_id") : null, confirm_empty: !!a.checked }), p.user?.id === t) try {
            await $().auth.signOut({ scope: "local" });
          } finally {
            Ai(), ue(), J("Dein Konto wurde gel\xF6scht.");
          }
        });
      }), se("Eigenes Konto l\xF6schen", s);
    }
    function ah() {
      let t = p.data.membership.role === "owner", e = o("form", { class: "inline-form" }, G("Best\xE4tigte E-Mail-Adresse", "email", "", { type: "email", required: true, maxlength: 254 }), o("button", { type: "submit", class: "button" }, "Hinzuf\xFCgen"), re());
      e.addEventListener("submit", (c) => {
        c.preventDefault();
        let u = new FormData(e).get("email");
        te(e, async () => {
          C(await $().rpc("rg_add_member", { member_email: u })), await vr(e, "Familienmitglied hinzugef\xFCgt.");
        });
      });
      let n = o("form", {}, G("Aktuelles Passwort", "current", "", { type: "password", autocomplete: "current-password", required: true, maxlength: 128 }), G("Neues Passwort (mindestens 12 Zeichen)", "password", "", { type: "password", autocomplete: "new-password", required: true, minlength: 12, maxlength: 128 }), re(), o("button", { type: "submit", class: "button secondary" }, "Passwort \xE4ndern"));
      n.addEventListener("submit", (c) => {
        c.preventDefault();
        let u = new FormData(n);
        te(n, async () => {
          await $a() && (C(await $().auth.signInWithPassword({ email: p.user.email, password: u.get("current") })), C(await $().auth.updateUser({ password: u.get("password") })), C(await $().auth.signOut({ scope: "global" })), J("Passwort ge\xE4ndert und Sitzungen abgemeldet."));
        });
      });
      let r = [["profile", "\u{1F464}", "Profil"], ["ai", "\u2728", "Meine KI"], ["appearance", "\u{1F3A8}", "Design"], ["weather", "\u{1F326}\uFE0F", "Wetter"], ["calendar", "\u{1F4C5}", "Kalender"], ["app", "\u{1F4F1}", "App & Ger\xE4t"], ["account", "\u{1F510}", "Konto & Daten"]], i = [["garden_admin", "\u{1F331}", "Garten & Beete"], ["members", "\u{1F465}", "Mitglieder"], ["ai_admin", "\u{1F511}", "KI-Zug\xE4nge"], ["backups", "\u{1F4BE}", "Sicherungen"]], a = (c, u) => {
        if (c === "profile") {
          let d = th();
          se("Dein Profil", d.node, { className: "settings-dialog", cleanup: d.cleanup });
          return;
        }
        se(u, o("div", { class: "settings-grid" }, s[c]()), { className: "settings-dialog" });
      }, s = { appearance: () => [yd(), vd()], weather: () => [nl(false, { personalOnly: true })], garden_admin: () => [nl(true, { sharedOnly: true }), Xd(true)], members: () => [o("section", { class: "panel" }, o("p", { class: "eyebrow" }, "EUER GEMEINSAMER GARTEN"), o("h2", {}, p.data.family.name), E("Alle Mitglieder k\xF6nnen Pflanzen, Beete und Notizen lesen und bearbeiten. Nur die Gartenverwaltung darf Mitglieder hinzuf\xFCgen oder entfernen. Der pers\xF6nliche Adminbereich f\xFCr Konten und Rollen ist davon getrennt."), o("div", { class: "member-list" }, p.data.members.map((c) => o("div", { class: "member-row" }, o("span", { class: "avatar" }, c.email.slice(0, 1).toUpperCase()), o("div", {}, o("strong", {}, c.email), E(c.role === "owner" ? "Gartenverwaltung" : "Familienmitglied")), t && c.role === "member" ? S("Entfernen", (u) => W(async () => {
        confirm(`Zugriff f\xFCr ${c.email} entziehen? Bereits auf dem Ger\xE4t gelesene Daten lassen sich dadurch nicht zur\xFCckholen.`) && (C(await $().rpc("rg_remove_member", { member_id: c.user_id })), await vr(e, "Zugriff entzogen."));
      }, u.currentTarget), "text-button danger-text") : null))), t ? o("div", {}, o("h3", {}, "Jemanden hinzuf\xFCgen"), E("Die Person registriert sich zuerst in dieser App und best\xE4tigt ihre E-Mail. Anschlie\xDFend f\xFCgst du sie hier hinzu. Sie darf noch keinen eigenen Garten angelegt haben."), e) : null)], ai: () => [Zd()], ai_admin: () => [Yd(true)], backups: () => [o("section", { class: "panel" }, o("h2", {}, "Sicherungen verwalten"), E("Private Gartendaten exportieren oder eine gepr\xFCfte Sicherung erg\xE4nzend wiederherstellen."), ce(S("Gartendaten exportieren \u2193", (c) => W(rl, c.currentTarget), "button secondary"), S("Sicherung wiederherstellen", eh, "button secondary")))], calendar: () => [xd()], app: () => [Sd(), kd()], account: () => [o("section", { class: "panel" }, o("p", { class: "eyebrow" }, "DEIN KONTO"), o("h2", {}, "Gut aufgehoben."), E(`Angemeldet als ${p.user.email}. Die Sitzung endet mit dem Schlie\xDFen dieses Tabs; melde dich auf geteilten Ger\xE4ten zus\xE4tzlich ab.`), n, o("hr"), S("Auf allen Ger\xE4ten abmelden", (c) => W(async () => {
        await $a() && C(await $().auth.signOut({ scope: "global" }));
      }, c.currentTarget), "text-button"), o("hr"), S("Eigenes Konto l\xF6schen", Pl, "button danger")), o("section", { class: "panel" }, o("p", { class: "eyebrow" }, "EINE KOPIE F\xDCR EUCH"), o("h2", {}, "Daten mitnehmen."), o("p", { class: "muted" }, "Exportiert Pflanzen, Beete, Anbauhistorie, Notizen und Gartentermine als private JSON-Datei. Die Familienverwaltung kann sie mit Vorschau erg\xE4nzend wieder einlesen. Bilddateien, Kalender-Abo-Links und KI-Schl\xFCssel sind nicht enthalten."), S("Gartendaten exportieren \u2193", (c) => W(rl, c.currentTarget), "button secondary"), E("Der Import \xFCberschreibt keine vorhandenen Eintr\xE4ge. Ein Export ersetzt keine regelm\xE4\xDFige Datenbank- und Fotosicherung in Supabase."))] }, l = (c) => o("div", { class: "settings-categories" }, c.map(([u, d, h]) => S([o("span", { "aria-hidden": "true" }, d), o("span", {}, h)], () => a(u, h), "settings-category", { "aria-haspopup": "dialog" })));
      return o("div", { class: "settings-page" }, o("section", { class: "settings-group" }, o("div", { class: "settings-intro" }, o("p", { class: "eyebrow" }, "F\xDCR ALLE NUTZER"), o("h2", {}, "Meine Einstellungen"), E("W\xE4hle einen Bereich. Er \xF6ffnet sich in einem eigenen Fenster.")), l(r)), t ? o("section", { class: "settings-group settings-admin-group" }, o("div", { class: "settings-intro" }, o("p", { class: "eyebrow" }, "F\xDCR ERNANNTE ADMINS"), o("h2", {}, "Gartenverwaltung"), E("Gemeinsame Einstellungen f\xFCr euren Familiengarten.")), l(i)) : null, rh());
    }
    async function rl() {
      let t = ae(), e = p.user.id, n = Te();
      if (await Promise.all([...ot.values()].map((l) => l.draft.flush())), !t()) return;
      let r = await ga(e, null, { originals: true });
      if (!t()) return;
      if (!r.membership) throw new Error("Kein Zugriff auf den Garten.");
      if (r.membership.family_id !== n) throw new Error("Deine Familienzuordnung hat sich ge\xE4ndert. Bitte aktualisiere die Ansicht.");
      let i = new Blob([JSON.stringify({ format: "ramonas-garten", version: 2, exportedAt: (/* @__PURE__ */ new Date()).toISOString(), family: r.family.name, plants: r.plants, beds: r.beds, plantings: r.plantings, notes: r.notes, events: r.events }, null, 2)], { type: "application/json" }), a = URL.createObjectURL(i), s = o("a", { href: a, download: `ramonas-garten-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json` });
      document.body.append(s), s.click(), s.remove(), setTimeout(() => URL.revokeObjectURL(a), 1e3);
    }
    function xl() {
      if (p.data?.capabilities?.ai === false) {
        J("Die Garten-KI ist derzeit vom Betreiber deaktiviert.", true);
        return;
      }
      let t = At(), e = ae(), n = o("div", { class: "ai-answer preserve-lines", "aria-live": "polite" }), r = o("form", {}, en("question-ai-model", t), G("Was m\xF6chtest du wissen?", "question", "", { area: true, required: true, maxlength: 2e3 }), E(`Mit dem Absenden wird deine Frage an ${Ce(t)} \xFCbermittelt. Keine personenbezogenen oder vertraulichen Angaben eingeben. KI kann sich irren.`), re(), o("button", { type: "submit", class: "button" }, `Frage an ${Et(t)} senden`), n);
      r.addEventListener("submit", (i) => {
        i.preventDefault();
        let a = new FormData(r), s = a.get("question"), l = a.get("model");
        te(r, async () => {
          n.textContent = "Die Antwort wird vorbereitet \u2026";
          try {
            let c = await Dt({ mode: "question", provider: t, question: s, model: l });
            e() && j.contains(r) && (n.textContent = c.answer);
          } catch (c) {
            throw n.textContent = "", c;
          }
        });
      }), se("Frag den Garten-Assistenten", r);
    }
    function Ka() {
      if (p.data?.capabilities?.ai === false) {
        J("Die Garten-KI ist derzeit vom Betreiber deaktiviert.", true);
        return;
      }
      let t = At(), e = o("input", { type: "file", name: "image", accept: "image/jpeg,image/png,image/webp", capture: "environment", required: true }), n = o("input", { type: "checkbox", name: "consent", required: true }), r = o("input", { type: "checkbox", name: "keep_photo", checked: true }), i = o("form", {}, en("scan-ai-model", t), o("div", { class: "upload-box" }, o("span", { "aria-hidden": "true" }, "\u25A7"), o("h3", {}, "Ein Foto vom Saatgutt\xFCtchen"), o("label", { class: "field" }, o("span", {}, "JPEG, PNG oder WebP \xB7 maximal 15 MB vor Verkleinerung"), e)), o("label", { class: "consent" }, n, o("span", {}, `Ich m\xF6chte dieses Bild zur Erkennung an ${Ce(t)} senden. Das Bild enth\xE4lt keine Personen oder privaten Dokumente.`)), o("label", { class: "consent" }, r, o("span", {}, "Das verkleinerte Foto zusammen mit der Sorte f\xFCr meine Familie speichern.")), E("Das Original wird nicht hochgeladen. Im Browser entsteht ein neues JPEG mit h\xF6chstens 1280 Pixeln und 256 KB ohne \xFCbernommene Metadaten. Ein Gartenfoto wird erst beim Speichern des gepr\xFCften Pflanzenvorschlags abgelegt."), re(), o("button", { type: "submit", class: "button full" }, "T\xFCtchen erkennen lassen"));
      i.addEventListener("submit", (a) => {
        a.preventDefault();
        let s = e.files[0], l = n.checked, c = r.checked, u = new FormData(i).get("model"), d = ae(), h = () => d() && j.open && j.contains(i);
        te(i, async () => {
          if (!s || !l) throw new Error("Bitte w\xE4hle ein Bild und best\xE4tige die \xDCbermittlung.");
          let g = await ir(s);
          if (!h()) return;
          let f = await Dt({ mode: "scan", provider: t, image: g.base64, mimeType: "image/jpeg", consent: true, model: u });
          h() && Sr(null, yn(f.plant), c ? g : null);
        });
      }), se("Vom T\xFCtchen in den Garten", i);
    }
    function sh() {
      se("Datenschutz & Hilfe", o("div", { class: "legal-copy" }, o("h3", {}, "Verantwortung & Kontakt"), o("p", {}, "Diese private Familien-App betreibt Marcel Kometz, Manfredstr. 15, 47178 Duisburg, Deutschland. Kontakt f\xFCr Fragen, Auskunft und L\xF6schw\xFCnsche: ", o("a", { href: "mailto:marcelkometz@icloud.com" }, "marcelkometz@icloud.com"), " \xB7 Telefon ", o("a", { href: "tel:+4915901486107" }, "015901486107"), ". Weitere Angaben stehen im ", o("a", { href: `${le}impressum.html`, target: "_blank", rel: "noopener noreferrer" }, "Impressum"), "."), o("h3", {}, "Hosting und Familienbereich"), o("p", {}, "GitHub Pages liefert die Oberfl\xE4che aus. Dabei verarbeitet GitHub technisch notwendige Verbindungsdaten, insbesondere die IP-Adresse. Supabase verarbeitet E-Mail, Anmeldung und Gartendaten. Das konfigurierte Datenbankprojekt liegt in EU West (Irland). Gartendaten sind nur f\xFCr Mitglieder des jeweiligen Familiengartens zug\xE4nglich. Es sind keine Analyse- oder Werbedienste eingebunden."), o("h3", {}, "Anmeldung auf diesem Ger\xE4t"), o("p", {}, "Die Sitzung liegt im Sitzungsspeicher dieses Tabs. F\xFCr E-Mail-Best\xE4tigungen wird vor\xFCbergehend ein PKCE-Verifier im lokalen Browserspeicher abgelegt. Jahreszeit, Haptik, Wetteranzeige und KI-Modellwahl werden als Einstellungen auf diesem Ger\xE4t gespeichert. F\xFCr wechselnde Gartenspr\xFCche werden nur Spruchkennungen und Anzeigezeiten auf diesem Ger\xE4t gemerkt, damit sich vier Stunden lang kein Spruch wiederholt. Die Modellwahl ist deinem Konto zugeordnet. Teile keine Anmeldelinks und melde dich auf gemeinsam genutzten Ger\xE4ten ab."), o("h3", {}, "Freiwillige Profile und Ver\xF6ffentlichung"), o("p", {}, "Anzeigename, Wohnort und Profilfoto sind freiwillig und zun\xE4chst nur f\xFCr dein Konto lesbar. Eine ausdr\xFCckliche Ver\xF6ffentlichung gibt Anzeigename, gew\xE4hltes Foto und auf Wunsch den Wohnort f\xFCr alle mit dem Profil-Link frei. E-Mail, Konto-ID, Gartendaten, Kalenderlinks und Rechte werden dabei nicht mitgegeben. Zur\xFCckstellen auf privat widerruft neue \xF6ffentliche Profil- und Fotoabrufe. Bereits von Dritten gespeicherte Kopien lassen sich nicht zur\xFCckholen. Profil und Fotos k\xF6nnen im Profilfenster gel\xF6scht werden; das Anmeldekonto bleibt bestehen. Der Profilwohnort beeinflusst Garten- und Wetterwahl nicht. Der pers\xF6nliche Superadminbereich kann registrierte E-Mail-Adressen und Best\xE4tigungsstatus zur Zugangsverwaltung sehen; andere Nutzer erhalten keine solche Kontoliste."), o("h3", {}, "Gartenleben und eigene Kontol\xF6schung"), o("p", {}, "Pers\xF6nliche Aufgaben sind nur f\xFCr das eigene Konto in der aktuellen Familie lesbar. Forum und Erntetagebuch sind innerhalb der Familie sichtbar; Autoren und Gartenadmins k\xF6nnen Eintr\xE4ge \xE4ndern oder entfernen. Der Autorenname im Forum wird beim Schreiben aus deinem Profil \xFCbernommen und bleibt im Beitrag gespeichert. \xD6ffentliche Profile \xF6ffnen keinen Zugang zu diesen Bereichen. Separate Sicherungen f\xFCr eigene Aufgaben und f\xFCr Forum/Ernte enthalten diese Daten als private Dateien. Unter Konto & Daten kannst du dein eigenes Konto nach Passwortpr\xFCfung und L\xF6schbest\xE4tigung l\xF6schen. Profil, eigene Aufgaben, Forumthemen und Antworten, Ernten und eigene hochgeladene Fotos werden entfernt. Gemeinsame Pflanzen, Beete, Anbauhistorie, Notizen und Termine bleiben bei verbleibenden Mitgliedern ohne direkten Autoren-Kontoverweis bestehen. Pers\xF6nliche Textinhalte vorher selbst bearbeiten oder den Betreiber kontaktieren. Als letztes Mitglied best\xE4tigst du zus\xE4tzlich die endg\xFCltige L\xF6schung des Gartens. Beim Entfernen von Fotos und Daten k\xF6nnen Teilfehler auftreten; Hinweise im L\xF6schfenster beachten. Geteilte Kopien und Aufbewahrungen bei Dienstleistern werden nicht r\xFCckwirkend gel\xF6scht."), o("h3", {}, "Gartentermine im Kalender"), o("p", {}, "Gartentermine werden im Familiengarten gespeichert. Ein privater, widerrufbarer Abo-Link erlaubt deinem Kalenderanbieter, Titel, Datum, Zeit und Termin-Hinweise ohne Anmeldung abzurufen. Gib den Link nicht weiter. Separat gespeicherte Familiennotizen, Fotos, Kontodaten und KI-Schl\xFCssel sind nicht enthalten. Bei einem Widerruf werden bereits abgerufene Termine beim Kalenderanbieter nicht gel\xF6scht; entferne dort zus\xE4tzlich das Abonnement. Einzelne Kalenderdateien entstehen weiterhin auf deinem Ger\xE4t. Die App erh\xE4lt keinen Zugriff auf deinen Apple-Account; \xC4nderungen erfolgen in der Garten-App. Die iCloud-Plugins in ChatGPT sind davon getrennt."), o("h3", {}, "Optionaler KI-Dienst"), o("p", {}, "Nur wenn du eine Anfrage absendest, werden deine Frage und ausdr\xFCcklich freigegebene Fotos \xFCber eine Supabase-Funktion an den ausdr\xFCcklich angezeigten Anbieter OpenAI oder Google Gemini gesendet. Gew\xE4hlte T\xFCtchenfotos werden erst beim Speichern der Sorte verkleinert in einem privaten Familienspeicher abgelegt; Originalfotos werden nicht hochgeladen. Der gemeinsame API-Schl\xFCssel wird serverseitig verschl\xFCsselt gespeichert und nicht wieder angezeigt. Nutzung und Aufbewahrung beim Anbieter richten sich nach dessen API-Bedingungen und eurem Tarif. OpenAI-Anfragen verwenden keine dauerhafte Responses-Speicherung (store: false); dies ersetzt keine abweichenden gesetzlichen oder anbieterseitigen Aufbewahrungsregeln."), o("h3", {}, "Wetter und Lageplan"), o("p", {}, "Bei eingeschalteter Wetteranzeige erh\xE4lt Open-Meteo technisch notwendige Verbindungsdaten wie deine IP-Adresse. Ohne Standortwahl wird der Stadtmittelpunkt Duisburgs abgefragt. Nach \u201EMeinen Standort verwenden\u201C und deiner Browserfreigabe wird der Ger\xE4testandort f\xFCr das Wetter verwendet. Vor der \xDCbermittlung werden Koordinaten auf zwei Nachkommastellen gerundet. Sie bleiben nur vor\xFCbergehend im Arbeitsspeicher und werden nicht in Supabase oder im lokalen Dauerspeicher abgelegt. Nur die gew\xE4hlte Standortoption wird lokal gespeichert. Bei fehlender Ortung zeigt die App Duisburg ausdr\xFCcklich als Ausweichort. Die Anzeige l\xE4sst sich auf diesem Ger\xE4t ausschalten. F\xFCr einen KI-Lageplan werden nur ausdr\xFCcklich freigegebene, verkleinerte Fotos oder sechs Standbilder eines lokal verarbeiteten Videos an den angezeigten KI-Anbieter gesendet. Das Originalvideo wird nicht hochgeladen oder gespeichert. KI-Positionen und Ma\xDFe bleiben ungepr\xFCfte Sch\xE4tzungen."), o("h3", {}, "Verbindung, Aufbewahrung und L\xF6schen"), o("p", {}, "Speichern ben\xF6tigt eine Internetverbindung. Die App speichert Gartendaten nicht f\xFCr den Offline-Zugriff. Gemeinsame Eintr\xE4ge bleiben bestehen, bis sie in der App gel\xF6scht werden; das Entfernen einer Mitgliedschaft l\xF6scht nicht automatisch das Anmeldekonto oder gemeinsame Garteneintr\xE4ge. Die eigene Kontol\xF6schung ist unter Konto & Daten verf\xFCgbar. F\xFCr weitere Datenschutzanliegen wende dich an den Betreiber. Exportiere regelm\xE4\xDFig eine private Kopie; Datenbanksicherungen werden gesondert verwaltet."), o("h3", {}, "Verwaltungsprotokoll"), o("p", {}, "Nur der pers\xF6nliche Superadmin kann Kontensperren, zentrale Freigaben, KI-Grenzen, \xC4nderungen von Gartenrollen und gespeicherten KI-Zug\xE4ngen sowie das \xC4ndern des Zusatzpassworts im Verwaltungsprotokoll sehen. Gespeichert werden Zeitpunkt, Verwaltungsaktion und beteiligte Konto-IDs; keine Passw\xF6rter, Schl\xFCssel, KI-Fragen oder privaten Beitr\xE4ge. Bei Kontol\xF6schung werden die Konto-IDs aus dem Protokoll entfernt. Einladungsadressen und Versandstatus sind ebenfalls nur im pers\xF6nlichen Adminbereich sichtbar."), o("h3", {}, "Datenschutzanliegen"), o("p", {}, "Soweit Datenschutzrecht auf die jeweilige Verarbeitung anwendbar ist, kannst du Auskunft, Berichtigung, L\xF6schung, Einschr\xE4nkung und Daten\xFCbertragung verlangen sowie Widerspruch einlegen und dich bei einer Datenschutzaufsicht beschweren. Eine freiwillige Profilver\xF6ffentlichung kannst du jederzeit f\xFCr die Zukunft zur\xFCcknehmen. Nutze daf\xFCr die Einstellungen oder den oben genannten Kontakt. Die konkrete rechtliche Einordnung und Anbietervereinbarungen muss der Betreiber f\xFCr die tats\xE4chliche Nutzung pr\xFCfen."), o("h3", {}, "Weitere Informationen"), o("p", {}, o("a", { href: "https://docs.github.com/de/site-policy/privacy-policies/github-general-privacy-statement", target: "_blank", rel: "noopener noreferrer" }, "GitHub-Datenschutz"), " \xB7 ", o("a", { href: "https://supabase.com/privacy", target: "_blank", rel: "noopener noreferrer" }, "Supabase-Datenschutz"), " \xB7 ", o("a", { href: "https://ai.google.dev/gemini-api/terms", target: "_blank", rel: "noopener noreferrer" }, "Gemini-API-Bedingungen"), " \xB7 ", o("a", { href: "https://openai.com/policies/privacy-policy/", target: "_blank", rel: "noopener noreferrer" }, "OpenAI-Datenschutz"), " \xB7 ", o("a", { href: `${le}read.html`, target: "_blank", rel: "noopener noreferrer" }, "Bedienhilfe")), E("Stand: 23. Oktober 2026")));
    }
    async function oh() {
      if (window.self !== window.top) {
        xe.replaceChildren(o("main", { class: "setup-page" }, o("h1", {}, "Garten-App direkt \xF6ffnen"), o("p", {}, "Die Anmeldung und der Familienbereich sind in eingebetteten Fenstern gesperrt."), o("a", { href: le, target: "_blank", rel: "noopener noreferrer", class: "button" }, "Garten-App \xF6ffnen")));
        return;
      }
      try {
        let t = await po();
        await Ti();
        let e = new URL(location.href).searchParams.get("profile");
        if (e !== null && !Zt(p.access)) {
          /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(e) ? await nh(e.toLowerCase()) : xe.replaceChildren(o("main", { class: "setup-page" }, lt("Ung\xFCltiger Profil-Link.", "Bitte den vollst\xE4ndigen Profil-Link verwenden."), o("a", { href: le, class: "button" }, "Zur Garten-App"))), _i = Ri({ basePath: le, isSafe: () => !j.open });
          return;
        }
        t.auth.onAuthStateChange((i, a) => {
          i === "PASSWORD_RECOVERY" && (Ge = true, Ae = "password"), Yo && setTimeout(() => {
            if (!a) {
              Ai(), ue();
              return;
            }
            p.user?.id !== a.user.id ? (Ai(), p.loading = true, p.user = a.user, ue(), Ti().then(() => Zt(p.access) ? void 0 : Xo(a.user.id)).then(() => {
              p.user?.id === a.user.id && (Ge ? (p.loading = false, ue()) : he());
            }).catch((l) => {
              p.loading = false, p.error = Ue(l), ue();
            })) : Ge && ue();
          }, 0);
        });
        let { data: n, error: r } = await t.auth.getSession();
        if (r) throw r;
        p.user = n.session?.user || null, p.loading = false, Yo = true, p.user && !Zt(p.access) && await Xo(p.user.id), _i = Ri({ basePath: le, isSafe: () => !j.open && !br && !p.loading && !Ge && !xe.querySelector('form[data-dirty], [data-drawing="true"]') && ![...ot.values()].some((i) => {
          let a = i.draft.state();
          return a.dirty || a.saving;
        }), onPending: () => {
          Zo || (Zo = true, J("App-Update bereit. Es wird \xFCbernommen, sobald alle offenen Fenster geschlossen und Eingaben gespeichert sind."));
        } }), p.user && !Ge ? (p.loading = true, await he()) : ue(), setInterval(() => {
          !document.hidden && !Ge && (p.user ? he({ quiet: true }) : Da());
        }, 3e4), setInterval(Oa, 1e3), document.addEventListener("visibilitychange", () => {
          Oa(), document.hidden || (p.user ? he({ quiet: true }) : Da());
        }), xe.addEventListener("input", (i) => {
          let a = i.target.closest("form");
          a && (a.dataset.dirty = "true");
        }), window.addEventListener("online", () => {
          p.user ? he({ quiet: true }) : Da();
        }), window.addEventListener("offline", () => {
          xe.querySelector("form[data-dirty]") ? hl() : ue();
        });
      } catch (t) {
        p.loading = false, xe.replaceChildren(o("main", { class: "setup-page" }, lt("Noch ein kleiner Einrichtungsschritt.", Ue(t), S("Erneut laden", () => location.reload())), Ct()));
      }
    }
    const RX=createRecipeController({h:o,button:S,field:G,small:E,empty:lt,formError:re,formAction:te,perform:W,notify:J,showDialog:se,dialog:j,lockScroll:pd,unlockScroll:pl,getClient:$,getState:()=>p,refresh:()=>he({quiet:true}),rerender:ue,logout:pr,theme:()=>je.id,seasonDialog:wd,install:Ua,currentAI:()=>({provider:At(),model:Tn(At())}),aiChoice:()=>Zd(),aiKeys:()=>Yd(true),adminEntry:rh,forumView:()=>Fa.view(),profile:()=>{const v=th();se('Dein Profil',v.node,{className:'settings-dialog',cleanup:v.cleanup});}});
    oh();
  })();
})();

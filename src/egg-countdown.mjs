// Browser timers may be suspended in the background. Count elapsed time rather
// than interval callbacks so the next visible tick shows the actual remainder.
export function createCountdown(now=()=>Date.now()){
 let deadline=null,pausedMilliseconds=0;
 const milliseconds=()=>Math.max(0,deadline===null?pausedMilliseconds:deadline-now());
 const seconds=()=>Math.ceil(milliseconds()/1000);
 const valid=value=>{if(!Number.isFinite(value)||value<0)throw Error('Ungültige Timerdauer.');return value*1000;};
 return{
  start(value){pausedMilliseconds=valid(value);deadline=now()+pausedMilliseconds;},
  pause(){pausedMilliseconds=milliseconds();deadline=null;},
  resume(){if(deadline===null)deadline=now()+pausedMilliseconds;},
  adjust(value){if(!Number.isFinite(value))throw Error('Ungültige Zeitanpassung.');const remaining=Math.max(0,milliseconds()+value*1000);pausedMilliseconds=remaining;if(deadline!==null)deadline=now()+remaining;},
  reset(){deadline=null;pausedMilliseconds=0;},
  remaining:seconds
 };
}

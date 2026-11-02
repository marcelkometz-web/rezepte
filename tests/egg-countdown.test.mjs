import test from 'node:test';
import assert from 'node:assert/strict';
import {createCountdown} from '../src/egg-countdown.mjs';
test('countdown catches up after throttled background execution',()=>{
 let time=1000;const timer=createCountdown(()=>time);timer.start(375);time+=60000;assert.equal(timer.remaining(),315);time+=400000;assert.equal(timer.remaining(),0);
});
test('pause excludes elapsed paused time and resume preserves fractional seconds',()=>{
 let time=0;const timer=createCountdown(()=>time);timer.start(60);time+=12500;timer.pause();assert.equal(timer.remaining(),48);time+=600000;assert.equal(timer.remaining(),48);timer.resume();time+=500;assert.equal(timer.remaining(),47);time+=47000;assert.equal(timer.remaining(),0);
});
test('adjustment and reset work both while running and paused',()=>{
 let time=0;const timer=createCountdown(()=>time);timer.start(30);time+=5000;timer.adjust(10);assert.equal(timer.remaining(),35);timer.pause();timer.adjust(-10);assert.equal(timer.remaining(),25);time+=600000;assert.equal(timer.remaining(),25);timer.resume();time+=5000;assert.equal(timer.remaining(),20);timer.adjust(-100);assert.equal(timer.remaining(),0);timer.reset();assert.equal(timer.remaining(),0);
 assert.throws(()=>timer.start(NaN));assert.throws(()=>timer.adjust(Infinity));
});

import test from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { QueueEvents } from "bullmq";
import { createFoundationQueue, foundationQueue, queueConnection } from "../src/server/queue";

test("queued jobs survive worker restarts; unsupported jobs fail; shutdown drains", {timeout:60000}, async () => {
  const url=process.env.QUEUE_URL ?? "redis://127.0.0.1:6379";
  const {queue,connection}=createFoundationQueue(url);
  const eventConnection=queueConnection(url,true);
  const events=new QueueEvents(foundationQueue,{connection:eventConnection});
  let child:ChildProcess|undefined;
  const ids:string[]=[];
  async function start() {
    child=spawn(process.execPath,["dist/worker/apps/worker/index.js"],{
      env:{...process.env,APP_MODE:"demo",QUEUE_URL:url,WORKER_HEALTH_PORT:"3101"},stdio:"pipe",
    });
    for(let i=0;i<100;i++) {
      if(child.exitCode!==null) throw new Error("Worker exited before becoming ready.");
      try{if((await fetch("http://127.0.0.1:3101/health")).ok)return;}catch{}
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    throw new Error("Worker readiness timed out.");
  }
  async function stop() {
    if(!child || child.exitCode!==null)return;
    const exited=once(child,"exit");child.kill("SIGTERM");
    const [code]=await exited;assert.equal(code,0);child=undefined;
  }
  try {
    await events.waitUntilReady();
    for(let cycle=0;cycle<2;cycle++){
      const probeId=randomUUID(); ids.push(probeId);
      const job=await queue.add("system.probe",{probeId},{jobId:probeId});
      assert.equal(await job.getState(),"waiting");
      await start();
      assert.deepEqual(await job.waitUntilFinished(events,10000),{probeId,processed:true});
      await stop();
    }
    const invalidId=randomUUID();ids.push(invalidId);
    const invalid=await queue.add("sms.send",{probeId:invalidId},{jobId:invalidId});
    await start();
    await assert.rejects(invalid.waitUntilFinished(events,10000),/Unsupported foundation job/);
    assert.equal(await invalid.getState(),"failed");
    await stop();
  } finally {
    if(child && child.exitCode===null) child.kill("SIGKILL");
    for(const id of ids) await queue.remove(id).catch(()=>{});
    await events.close();await eventConnection.quit();await queue.close();await connection.quit();
  }
});

import type { Handler } from '@netlify/functions';
import { deliveryStore } from './_store';

const json=(statusCode:number,body:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});

export const handler:Handler=async event=>{
  if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
  try{
    const body=JSON.parse(event.body||'{}');
    const ref=String(body.ref||'').trim().toUpperCase();
    const pin=String(body.pin||'').trim();
    if(!/^NOMAD-[A-Z0-9]{6}$/.test(ref)||!/^[0-9]{4}$/.test(pin))return json(400,{error:'Invalid reference or PIN'});
    const store=deliveryStore();
    const current=await store.get(ref,{type:'json'}) as any;
    if(!current)return json(404,{error:'Delivery reference not found'});
    if(current.pin!==pin)return json(401,{error:'Incorrect delivery PIN'});
    const updated={...current,status:'DELIVERED',updatedAt:new Date().toISOString(),proofOfDelivery:{method:'PIN',verifiedAt:new Date().toISOString()}};
    await store.setJSON(ref,updated);
    return json(200,{ok:true,delivery:updated});
  }catch{return json(500,{error:'Unable to verify delivery'});}
};

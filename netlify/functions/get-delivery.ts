import type { Handler } from '@netlify/functions';
import { deliveryStore } from './_store';
const json=(statusCode:number,body:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
export const handler:Handler=async event=>{
  if(event.httpMethod!=='GET') return json(405,{error:'Method not allowed'});
  const ref=String(event.queryStringParameters?.ref||'').trim().toUpperCase();
  if(!/^NOMAD-[A-Z0-9]{6}$/.test(ref)) return json(400,{error:'Enter a valid delivery reference'});
  try{
    const record=await deliveryStore().get(ref,{type:'json'});
    if(!record) return json(404,{error:'Delivery reference not found'});
    return json(200,{ok:true,delivery:record});
  }catch{return json(500,{error:'Unable to retrieve delivery'});}
};
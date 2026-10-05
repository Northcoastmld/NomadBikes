import type { Handler } from '@netlify/functions';
import { requireRole, userStore } from './_auth';
import { deliveryStore } from './_store';
const json=(statusCode:number,body:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
export const handler:Handler=async event=>{
 if(event.httpMethod!=='GET')return json(405,{error:'Method not allowed'});
 const admin=await requireRole(event,['ADMIN']); if(!admin)return json(403,{error:'Admin access only'});
 try{
  const users:any[]=[]; for await(const entry of userStore().list()){ if(entry.key.startsWith('user_')){const u=await userStore().get(entry.key,{type:'json'}) as any;if(u)users.push({id:u.id,role:u.role,name:u.name,phone:u.phone,email:u.email,approved:u.approved,online:!!u.online,createdAt:u.createdAt});}}
  const deliveries:any[]=[]; for await(const entry of deliveryStore().list()){const d=await deliveryStore().get(entry.key,{type:'json'}) as any;if(d)deliveries.push(d);}
  return json(200,{ok:true,summary:{customers:users.filter(x=>x.role==='CUSTOMER').length,riders:users.filter(x=>x.role==='RIDER').length,pendingRiders:users.filter(x=>x.role==='RIDER'&&!x.approved).length,activeDeliveries:deliveries.filter(x=>x.status!=='DELIVERED').length},customers:users.filter(x=>x.role==='CUSTOMER'),riders:users.filter(x=>x.role==='RIDER'),deliveries});
 }catch{return json(500,{error:'Unable to load dashboard'});}
};
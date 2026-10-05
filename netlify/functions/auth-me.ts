import type { Handler } from '@netlify/functions';
import { sessionFrom } from './_auth';
const json=(statusCode:number,body:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
export const handler:Handler=async event=>{
 if(event.httpMethod!=='GET')return json(405,{error:'Method not allowed'});
 const s=await sessionFrom(event);
 if(!s)return json(401,{error:'Not signed in'});
 return json(200,{ok:true,user:{id:s.user.id,role:s.user.role,name:s.user.name,phone:s.user.phone,email:s.user.email,approved:s.user.approved,online:s.user.online||false}});
};
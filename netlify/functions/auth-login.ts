import type { Handler } from '@netlify/functions';
import { authenticate } from './_auth';
const json=(statusCode:number,body:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
export const handler:Handler=async event=>{
 if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
 try{
  const b=JSON.parse(event.body||'{}');
  const result=await authenticate(String(b.login||''),String(b.password||''));
  return json(200,{ok:true,token:result.token,user:{id:result.user.id,role:result.user.role,name:result.user.name,phone:result.user.phone,email:result.user.email,approved:result.user.approved,online:result.user.online||false}});
 }catch(e){return json(401,{error:e instanceof Error?e.message:'Invalid login details'});}
};
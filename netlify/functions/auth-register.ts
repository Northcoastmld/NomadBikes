import type { Handler } from '@netlify/functions';
import { registerUser } from './_auth';
const json=(statusCode:number,body:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
export const handler:Handler=async event=>{
 if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
 try{
  const b=JSON.parse(event.body||'{}');
  const role=b.role==='RIDER'?'RIDER':'CUSTOMER';
  const user=await registerUser({name:String(b.name||''),phone:String(b.phone||''),email:String(b.email||''),password:String(b.password||''),role});
  return json(201,{ok:true,user:{id:user.id,role:user.role,name:user.name,phone:user.phone,email:user.email,approved:user.approved}});
 }catch(e){return json(400,{error:e instanceof Error?e.message:'Unable to create account'});}
};
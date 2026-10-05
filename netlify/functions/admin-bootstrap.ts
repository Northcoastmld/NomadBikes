import type { Handler } from '@netlify/functions';
import { registerUser, userStore, type User } from './_auth';
const json=(statusCode:number,body:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
export const handler:Handler=async event=>{
 if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
 const key=String(event.headers['x-nomad-admin-key']||'');
 if(!process.env.NOMAD_ADMIN_KEY||key!==process.env.NOMAD_ADMIN_KEY)return json(401,{error:'Unauthorized'});
 try{
  const b=JSON.parse(event.body||'{}');
  const store=userStore();
  const existing=await store.get('admin:primary',{type:'json'}) as User|null;
  if(existing)return json(409,{error:'Primary admin already exists'});
  const base=await registerUser({name:String(b.name||'Nomad Admin'),phone:String(b.phone||''),email:String(b.email||''),password:String(b.password||'')});
  const admin:User={...base,role:'ADMIN',approved:true};
  await store.setJSON(admin.id,admin); await store.setJSON('phone:'+admin.phone,admin); if(admin.email)await store.setJSON('email:'+admin.email,admin); await store.setJSON('admin:primary',admin);
  return json(201,{ok:true,admin:{id:admin.id,name:admin.name,email:admin.email,phone:admin.phone}});
 }catch(e){return json(400,{error:e instanceof Error?e.message:'Unable to create admin'});}
};
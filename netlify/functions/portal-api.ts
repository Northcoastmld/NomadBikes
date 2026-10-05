import type { Handler } from '@netlify/functions';
import { registerUser, authenticate, sessionFrom, userStore, type User } from './_auth';
import { deliveryStore } from './_store';
const json=(statusCode:number,body:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
const safe=(u:User)=>{const {passwordHash,...rest}=u;return rest};
export const handler:Handler=async event=>{try{const body=JSON.parse(event.body||'{}');const action=String(body.action||'');
 if(event.httpMethod==='POST'&&action==='register'){const u=await registerUser(body);const auth=await authenticate(body.phone,body.password);return json(201,{ok:true,user:safe(u),token:auth.token});}
 if(event.httpMethod==='POST'&&action==='login'){const a=await authenticate(String(body.login||''),String(body.password||''));return json(200,{ok:true,user:safe(a.user),token:a.token});}
 const session=await sessionFrom(event);if(!session)return json(401,{error:'Please sign in'});
 if(event.httpMethod==='GET'&&action==='me')return json(200,{ok:true,user:safe(session.user)});
 if(event.httpMethod==='POST'&&action==='logout')return json(200,{ok:true});
 if(event.httpMethod==='GET'&&action==='deliveries'){if(session.role==='CUSTOMER'){const r=await deliveryStore().get(session.user.id,{type:'json'});return json(200,{ok:true,deliveries:r?[r]:[]})}const list=await deliveryStore().list({prefix:'NOMAD-',limit:100});const out=[] as any[];for(const key of list.blobs||[]){const r=await deliveryStore().get(key.key,{type:'json'});if(r)out.push(r)}return json(200,{ok:true,deliveries:out});}
 if(event.httpMethod==='POST'&&action==='rider-status'&&session.role==='RIDER'){const store=userStore();const u=await store.get(session.user.id,{type:'json'}) as User;if(typeof body.online==='boolean')u.online=body.online;u.updatedAt=new Date().toISOString();await store.setJSON(u.id,u);await store.setJSON('phone:'+u.phone,u);if(u.email)await store.setJSON('email:'+u.email,u);return json(200,{ok:true,user:safe(u)});}
 if(event.httpMethod==='GET'&&action==='admin-users'&&session.role==='ADMIN'){const list=await userStore().list({prefix:'user_',limit:100});const out=[] as any[];for(const key of list.blobs||[]){const u=await userStore().get(key.key,{type:'json'});if(u)out.push(safe(u as User))}return json(200,{ok:true,users:out});}
 return json(400,{error:'Unknown action'});
}catch(e:any){return json(400,{error:e?.message||'Request failed'});}};
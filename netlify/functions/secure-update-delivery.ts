import type { Handler } from '@netlify/functions';
const json=(statusCode:number,body:unknown)=>({statusCode,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(body)});
export const handler:Handler=async event=>{
 if(event.httpMethod!=='POST')return json(405,{error:'Method not allowed'});
 return json(410,{error:'Legacy delivery update endpoint disabled. Use authenticated Nomad admin or rider access.'});
};
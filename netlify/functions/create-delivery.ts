import type { Handler } from '@netlify/functions';
import { deliveryStore, type DeliveryRecord } from './_store';

const json = (statusCode: number, body: unknown) => ({ statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) });
const makeRef = () => 'NOMAD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
const makePin = () => String(Math.floor(1000 + Math.random() * 9000));

export const handler: Handler = async event => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });
  try {
    const body = JSON.parse(event.body || '{}');
    const required = ['pickup','dropoff','senderName','senderPhone','receiverName','receiverPhone'];
    const missing = required.filter(k => !String(body[k] || '').trim());
    if (missing.length) return json(400, { error: 'Missing required fields', missing });
    const store = deliveryStore();
    let ref = makeRef();
    while (await store.get(ref)) ref = makeRef();
    const now = new Date().toISOString();
    const record: DeliveryRecord = {
      ref, status:'ORDER RECEIVED',
      pickup:String(body.pickup).trim(), dropoff:String(body.dropoff).trim(),
      packageDescription:String(body.packageDescription || '').trim(),
      senderName:String(body.senderName).trim(), senderPhone:String(body.senderPhone).trim(),
      receiverName:String(body.receiverName).trim(), receiverPhone:String(body.receiverPhone).trim(),
      deliveryNotes:String(body.deliveryNotes || '').trim(), deliveryType:(body.deliveryType||'standard') as any, charge:body.charge==null?null:Number(body.charge), pin:makePin(), createdAt:now, updatedAt:now
    };
    await store.setJSON(ref, record);
    return json(201, { ok:true, delivery:record });
  } catch { return json(500, { error:'Unable to create delivery' }); }
};
import { getStore } from '@netlify/blobs';

export type DeliveryStatus = 'ORDER RECEIVED' | 'RIDER ASSIGNED' | 'COLLECTED' | 'OUT FOR DELIVERY' | 'DELIVERED';
export type DeliveryRecord = {
  ref:string; status:DeliveryStatus; pickup:string; dropoff:string;
  packageDescription:string; senderName:string; senderPhone:string;
  receiverName:string; receiverPhone:string; deliveryNotes:string;
  deliveryType:'standard'|'express'|'scheduled'; charge:number|null; pin:string;
  customerId?:string; riderId?:string; riderName?:string; riderPhone?:string;
  acceptedAt?:string; collectedAt?:string; deliveredAt?:string;
  createdAt:string; updatedAt:string;
};
export const deliveryStore=()=>getStore({name:'nomad-deliveries',consistency:'strong'});
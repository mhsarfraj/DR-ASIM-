/* DEMO MODE: active only while CONFIG.API_URL is still the placeholder. All data below is FAKE sample data kept in memory. */
(function(){
if(!/PASTE_/.test(CONFIG.API_URL))return;window.DEMO=true;
const iso=o=>new Date(Date.now()+19800000+o*864e5).toISOString().slice(0,10),sl=ms=>new Promise(r=>setTimeout(r,ms));
const st=['Pending','Confirmed','Confirmed','Completed','Cancelled','Pending','Completed','Confirmed','Reschedule Requested','Completed','Pending','Cancelled'];
const tm=['10:00','10:30','11:00','12:30','14:00','15:30','16:00','17:00','11:30','13:00','18:00','10:00'];
const A=st.map((s,i)=>({appointment_id:'APT-DEMO-'+(100+i),created_at:iso(-(i%9))+' 09:30:00',patient_name:['Ayesha Khan (sample)','Imran Siddiqui (sample)','Rahul Verma (sample)','Neha Singh (sample)','Sana Ansari (sample)','Arjun Patel (sample)','Priya Sharma (sample)','Faizan Ali (sample)','Kavita Yadav (sample)','Rohan Gupta (sample)','Nida Parveen (sample)','Amit Kumar (sample)'][i],phone:'900000000'+(i%10),email:'',
 appointment_date:iso(s==='Completed'||s==='Cancelled'?-(i%6+1):i%5+1),appointment_time:tm[i],visit_type:i%3?'First visit':'Follow-up',reason:['Fever','General checkup','Cough and cold','Follow-up visit','Body ache','Routine checkup'][i%6],status:s,admin_notes:'',updated_at:''}));
const R=[{review_id:'R1',created_at:iso(-6)+' 10:00:00',name:'Sample patient · Ayesha K.',rating:5,text:'SAMPLE PREVIEW ONLY — this is fictional review text used to demonstrate the website layout.',status:'Approved'},
 {review_id:'R2',created_at:iso(-3)+' 10:00:00',name:'Sample patient · Imran S.',rating:4,text:'SAMPLE PREVIEW ONLY — replace this example with a genuine patient review after obtaining permission.',status:'Approved'},
 {review_id:'R3',created_at:iso(-1)+' 10:00:00',name:'Sample patient · Neha S.',rating:5,text:'SAMPLE PREVIEW ONLY — this sample is pending review in the admin panel.',status:'Pending'}];
const S={doctor_bio:'Dr. Muhammad Aasim Farooqui provides general medical consultations for common health concerns, with a focus on clear communication and patient-friendly guidance.',doctor_qualifications:'',doctor_photo:'',phone:'',whatsapp:'',map_link:CONFIG.MAPS_LINK,clinic_closed:'false',status_message:'',announcement:''};
let SV=[['General Medical Consultation','Consultation for everyday health concerns.'],['Fever and Common Illness Evaluation','Assessment of fever and common illnesses.'],['Routine Health Checkups','General health checkups.'],['General Health Guidance','Practical, patient-friendly health guidance.'],['Initial Assessment of Common Symptoms','A first assessment of common symptoms.'],['Preventive Health Discussions','Talk through staying healthy.']].map(x=>({service_name:x[0],description:x[1]}));
const E=[{enquiry_id:'E1',created_at:iso(-2)+' 11:00:00',name:'Zoya Ahmed (sample)',phone:'9000000099',email:'',message:'DEMO enquiry',status:'New'}];
const PN=[{phone:'9000000001',tags:'regular',notes:'DEMO note: prefers evening slots',follow_up:iso(0)}],HO=[{holiday_id:'H1',date:iso(9),title:'Demo holiday',description:'',is_closed:'TRUE'}],AU=[{log_id:'L1',timestamp:iso(0)+' 09:00:00',admin_identifier:'demo',action:'update',record_type:'appointment',record_id:'APT-DEMO-101',details:'Confirmed'}];
let n=1;
api.get=async q=>{await sl(250);const [a,qs]=q.split('&'),p=new URLSearchParams(qs||'');
 if(a==='settings')return{ok:true,data:S,updated:iso(0)+' 09:00:00',holidays:HO};
 if(a==='services')return{ok:true,data:SV};
 if(a==='reviews')return{ok:true,data:R.filter(x=>x.status==='Approved').map(x=>({name:x.name,rating:x.rating,text:x.text,date:x.created_at.slice(0,10)}))};
 if(a==='slots')return{ok:true,booked:A.filter(x=>x.appointment_date===p.get('date')&&x.status==='Confirmed').map(x=>x.appointment_time)};
 return{ok:false,error:'Unknown'};};
api.post=async b=>{await sl(300);
 if(b.action==='appointment'){const id='APT-DEMO-'+(200+n++);A.push({appointment_id:id,created_at:iso(0)+' 12:00:00',patient_name:b.name,phone:b.phone,email:b.email,appointment_date:b.date,appointment_time:b.time,visit_type:b.visit,reason:b.reason,status:'Pending',admin_notes:'',updated_at:''});return{ok:true,id};}
 if(b.action==='track'){const r=A.find(x=>x.appointment_id===b.id&&x.phone===b.phone);return r?{ok:true,status:r.status,date:r.appointment_date,time:r.appointment_time}:{ok:false,error:'No matching request found (demo: try APT-DEMO-101 with 9000000001)'};}
 if(b.action==='review'){R.push({review_id:'R'+(10+n++),created_at:iso(0)+' 12:00:00',name:b.name,rating:b.rating,text:b.text,status:'Pending'});return{ok:true};}
 if(b.action==='enquiry'){E.push({enquiry_id:'E'+n++,created_at:iso(0)+' 12:00:00',name:b.name,phone:b.phone,email:'',message:b.message,status:'New'});return{ok:true};}
 if(b.action==='login')return b.password==='12345678'?{ok:true,token:'demo'}:{ok:false,error:'Admin demo password is 12345678'};
 if(b.token!=='demo')return{ok:false,error:'Unauthorized',code:401};
 if(b.action==='list')return{ok:true,data:A.map(x=>({...x})),reviews:R.map(x=>({...x})),enquiries:E,patients:PN,holidays:HO,audit:AU};
 if(b.action==='update'){const i=A.findIndex(x=>x.appointment_id===b.id);if(i<0)return{ok:false,error:'Not found'};
  if(b.op==='delete'){A.splice(i,1);return{ok:true};}const x={...A[i]};if(b.status)x.status=b.status;if(b.date){x.appointment_date=b.date;x.appointment_time=b.time;}if(b.notes!==undefined)x.admin_notes=b.notes;
  if(x.status==='Confirmed'&&A.some((y,k)=>k!==i&&y.status==='Confirmed'&&y.appointment_date===x.appointment_date&&y.appointment_time===x.appointment_time))return{ok:false,error:'Another confirmed appointment holds this slot'};A[i]=x;return{ok:true};}
 if(b.action==='reviewStatus'){const r=R.find(x=>x.review_id===b.id);if(r)r.status=b.status;return{ok:true};}
 if(b.action==='saveSettings'){Object.assign(S,b.values);return{ok:true};}
 if(b.action==='saveServices'){SV=b.services.map(x=>({service_name:x.name,description:x.description}));return{ok:true};}
 if(b.action==='savePatient'){const v={phone:b.phone,tags:b.tags||'',notes:b.notes||'',follow_up:b.follow_up||''},p=PN.find(x=>x.phone===b.phone);p?Object.assign(p,v):PN.push(v);return{ok:true};}
 if(b.action==='enquiryStatus'){const e=E.find(x=>x.enquiry_id===b.id);if(e)e.status=b.status;return{ok:true};}
 if(b.action==='saveHoliday'){HO.push({holiday_id:'H'+n++,date:b.date,title:b.title,description:'',is_closed:'TRUE'});return{ok:true};}
 if(b.action==='deleteHoliday'){const i=HO.findIndex(x=>x.holiday_id===b.id);if(i>=0)HO.splice(i,1);return{ok:true};}
 if(b.action==='uploadPhoto')return{ok:true,id:''};
 return{ok:false,error:'Unknown'};};
addEventListener('DOMContentLoaded',()=>{const d=document.createElement('div');d.textContent='DEMO MODE · fictional sample records';d.style.cssText='position:fixed;left:12px;bottom:76px;background:#f5b53d;color:#0a2540;font:700 12px Inter,sans-serif;padding:6px 12px;border-radius:99px;z-index:70;box-shadow:0 4px 14px #0003';document.body.append(d);
 const l=document.getElementById('login');if(l){const p=document.createElement('p');p.className='note';p.innerHTML='Demo mode: use any valid email and password <b>12345678</b>.';l.insertBefore(p,l.children[1]);}});
})();

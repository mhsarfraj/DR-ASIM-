const TZ='Asia/Kolkata';
const SCHEMA={
 Appointments:['appointment_id','created_at','patient_name','phone','email','appointment_date','appointment_time','visit_type','reason','status','admin_notes','updated_at'],
 ClinicSettings:['setting_key','setting_value','updated_at'],
 Services:['service_id','service_name','description','enabled','display_order','updated_at'],
 Enquiries:['enquiry_id','created_at','name','phone','email','message','status'],
 AdminAuditLog:['log_id','timestamp','admin_identifier','action','record_type','record_id','details'],
 Holidays:['holiday_id','date','title','description','is_closed'],
 Reviews:['review_id','created_at','name','rating','text','status'],
 PatientNotes:['phone','tags','notes','follow_up','updated_at']};
const STATUSES=['Pending','Confirmed','Reschedule Requested','Completed','Cancelled'];
const PUBLIC_KEYS=['doctor_bio','doctor_qualifications','doctor_photo','phone','whatsapp','map_link','clinic_closed','status_message','announcement'];

// RUN ONCE (script bound to your spreadsheet). Re-run after updating: it is safe.
function setup(){
  const ss=SpreadsheetApp.getActive();
  Object.keys(SCHEMA).forEach(n=>{const s=ss.getSheetByName(n)||ss.insertSheet(n);
    s.getRange(1,1,1,SCHEMA[n].length).setValues([SCHEMA[n]]).setFontWeight('bold').setBackground('#e0f2f1');s.setFrozenRows(1);});
  const st=ss.getSheetByName('Services');
  if(st.getLastRow()<2)['General Medical Consultation','Fever and Common Illness Evaluation','Routine Health Checkups','General Health Guidance','Initial Assessment of Common Symptoms','Preventive Health Discussions']
    .forEach((n,i)=>st.appendRow(['S'+(i+1),n,'Please contact the clinic for details.',true,i+1,now()]));
  const ap=ss.getSheetByName('Appointments');['D:D','F:G'].forEach(r=>ap.getRange(r).setNumberFormat('@'));ss.getSheetByName('PatientNotes').getRange('A:A').setNumberFormat('@');
  DriveApp.getRootFolder(); // triggers Drive permission for photo uploads
}
// RUN from editor: setAdmin('you@email.com','a-long-password'), then delete the password from the code
function setAdmin(email,pw){const salt=Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty('ADMIN',JSON.stringify({email:email.toLowerCase(),salt,hash:hash(salt,pw)}));}
// QUICK START ONLY: run once from the Apps Script editor, then change to a strong unique password.
function setDefaultAdmin(){setAdmin('admin@clinic.local','12345678');}
function hash(salt,pw){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+pw));}
function now(){return Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd HH:mm:ss');}
function out(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
function sh(n){return SpreadsheetApp.getActive().getSheetByName(n);}
function rows(n){const v=sh(n).getDataRange().getDisplayValues();const h=v.shift();return v.map(r=>Object.fromEntries(h.map((k,i)=>[k,r[i]])));}
function clean(s,max){return String(s||'').replace(/[<>]/g,'').trim().slice(0,max||200);}
function today(){return Utilities.formatDate(new Date(),TZ,'yyyy-MM-dd');}

function doGet(e){
  try{const a=e.parameter.action;
    if(a==='settings'){const o={},up={};rows('ClinicSettings').forEach(r=>{if(PUBLIC_KEYS.includes(r.setting_key)){o[r.setting_key]=r.setting_value;up[r.setting_key]=r.updated_at;}});
      return out({ok:true,data:o,updated:up.clinic_closed||'',holidays:rows('Holidays').filter(h=>h.date>=today()).map(h=>({date:h.date,title:h.title,is_closed:h.is_closed}))});}
    if(a==='services')return out({ok:true,data:rows('Services').filter(s=>String(s.enabled).toUpperCase()==='TRUE').sort((x,y)=>x.display_order-y.display_order).map(s=>({service_name:s.service_name,description:s.description}))});
    if(a==='reviews')return out({ok:true,data:rows('Reviews').filter(r=>r.status==='Approved').reverse().slice(0,30).map(r=>({name:r.name,rating:Number(r.rating),text:r.text,date:r.created_at.slice(0,10)}))});
    if(a==='slots'){const d=clean(e.parameter.date,10);return out({ok:true,booked:rows('Appointments').filter(r=>r.appointment_date===d&&r.status==='Confirmed').map(r=>r.appointment_time)});}
    return out({ok:false,error:'Unknown action'});
  }catch(err){return out({ok:false,error:'Server error'});}
}
function doPost(e){
  try{
    if(e.postData.length>400000)return out({ok:false,error:'Request too large'});
    const b=JSON.parse(e.postData.contents);
    if(e.postData.length>12000&&b.action!=='uploadPhoto')return out({ok:false,error:'Request too large'});
    if(b.action==='appointment')return out(submitAppt(b));
    if(b.action==='enquiry')return out(submitEnquiry(b));
    if(b.action==='review')return out(submitReview(b));
    if(b.action==='track')return out(track(b));
    if(b.action==='login')return out(login(b));
    const admin=auth(b.token);if(!admin)return out({ok:false,error:'Unauthorized',code:401});
    const A={list:()=>({ok:true,data:rows('Appointments'),reviews:rows('Reviews'),enquiries:rows('Enquiries'),patients:rows('PatientNotes'),holidays:rows('Holidays'),audit:rows('AdminAuditLog').slice(-60).reverse()}),
      savePatient:()=>savePatient(b,admin),enquiryStatus:()=>enquiryStatus(b,admin),saveHoliday:()=>saveHoliday(b,admin),deleteHoliday:()=>deleteHoliday(b,admin),
      update:()=>updateAppt(b,admin),saveSettings:()=>saveSettings(b,admin),saveServices:()=>saveServices(b,admin),
      reviewStatus:()=>reviewStatus(b,admin),uploadPhoto:()=>uploadPhoto(b,admin)};
    return out(A[b.action]?A[b.action]():{ok:false,error:'Unknown action'});
  }catch(err){return out({ok:false,error:'Server error'});}
}
function submitAppt(b){
  if(b.website)return {ok:true,id:'-'};
  const name=clean(b.name,80),phone=String(b.phone||'').replace(/[\s-]/g,'').replace(/^(\+91|91|0)(?=\d{10}$)/,'');
  const email=clean(b.email,100),date=clean(b.date,10),time=clean(b.time,5);
  if(name.length<2)return {ok:false,error:'Enter a valid name'};
  if(!/^[6-9]\d{9}$/.test(phone))return {ok:false,error:'Enter a valid 10-digit Indian mobile number'};
  if(email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return {ok:false,error:'Invalid email'};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))return {ok:false,error:'Invalid date or time'};
  const nowT=Utilities.formatDate(new Date(),TZ,'HH:mm');
  if(date<today()||(date===today()&&time<=nowT))return {ok:false,error:'Please choose a future date and time'};
  if(date>Utilities.formatDate(new Date(Date.now()+60*864e5),TZ,'yyyy-MM-dd'))return {ok:false,error:'Please choose a date within the next 60 days'};
  if(time<'10:00'||time>'18:30')return {ok:false,error:'Please choose a time between 10:00 AM and 6:30 PM'};
  if(rows('Holidays').some(h=>h.date===date&&String(h.is_closed).toUpperCase()==='TRUE'))return {ok:false,error:'Clinic is closed on this date'};
  if(!b.consent)return {ok:false,error:'Consent is required'};
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{const rs=rows('Appointments');
    if(rs.some(r=>r.appointment_date===date&&r.appointment_time===time&&r.status==='Confirmed'))return {ok:false,error:'That slot is already booked. Please pick another time.'};
    if(rs.some(r=>r.phone===phone&&r.appointment_date===date&&['Pending','Confirmed'].includes(r.status)))return {ok:false,error:'You already have a request for this date. Please contact the clinic to change it.'};
    const id='APT-'+Utilities.formatDate(new Date(),TZ,'yyMMdd')+'-'+Utilities.getUuid().slice(0,5).toUpperCase();
    sh('Appointments').appendRow([id,now(),name,phone,email,date,time,b.visit==='Follow-up'?'Follow-up':'First visit',clean(b.reason,300),'Pending','',now()]);
    return {ok:true,id};
  }finally{lock.releaseLock();}
}
function track(b){
  const r=rows('Appointments').find(x=>x.appointment_id===clean(b.id,30)&&x.phone===String(b.phone||'').replace(/\D/g,'').slice(-10));
  return r?{ok:true,status:r.status,date:r.appointment_date,time:r.appointment_time}:{ok:false,error:'No matching request found'};
}
function submitEnquiry(b){
  if(b.website)return {ok:true};
  if(clean(b.name,80).length<2||clean(b.message,500).length<3)return {ok:false,error:'Name and message required'};
  sh('Enquiries').appendRow(['E-'+Utilities.getUuid().slice(0,8),now(),clean(b.name,80),clean(b.phone,15),clean(b.email,100),clean(b.message,500),'New']);
  return {ok:true};
}
function submitReview(b){
  if(b.website)return {ok:true};
  const r=Number(b.rating),n=clean(b.name,60),t=clean(b.text,500);
  if(!(r>=1&&r<=5)||n.length<2||t.length<5)return {ok:false,error:'Please add your name, a rating and a short review'};
  sh('Reviews').appendRow(['R-'+Utilities.getUuid().slice(0,8),now(),n,Math.round(r),t,'Pending']);
  return {ok:true};
}
function login(b){
  const cache=CacheService.getScriptCache(),fails=Number(cache.get('fails')||0);
  if(fails>=5)return {ok:false,error:'Too many attempts. Try again in 15 minutes.'};
  const a=JSON.parse(PropertiesService.getScriptProperties().getProperty('ADMIN')||'null');
  if(!a||String(b.email||'').toLowerCase()!==a.email||hash(a.salt,String(b.password||''))!==a.hash){cache.put('fails',String(fails+1),900);Utilities.sleep(800);return {ok:false,error:'Invalid credentials'};}
  const t=Utilities.getUuid()+Utilities.getUuid();cache.put('tok_'+t,a.email,21600);cache.remove('fails');
  return {ok:true,token:t};
}
function auth(t){return t?CacheService.getScriptCache().get('tok_'+t):null;}
function audit(admin,action,type,id,d){sh('AdminAuditLog').appendRow(['L-'+Utilities.getUuid().slice(0,8),now(),admin,action,type,id,clean(d,300)]);}
function setKV(k,v){const s=sh('ClinicSettings'),d=s.getDataRange().getValues(),i=d.findIndex((r,j)=>j>0&&r[0]===k);
  if(i<0)s.appendRow([k,v,now()]);else s.getRange(i+1,2,1,2).setValues([[v,now()]]);}
function updateAppt(b,admin){
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{const s=sh('Appointments'),v=s.getDataRange().getDisplayValues();
    const i=v.findIndex((r,k)=>k>0&&r[0]===b.id);if(i<0)return {ok:false,error:'Not found'};
    let status=v[i][9],date=v[i][5],time=v[i][6];
    if(b.op==='delete'){s.deleteRow(i+1);audit(admin,'delete','appointment',b.id,'');return {ok:true};}
    if(b.status){if(!STATUSES.includes(b.status))return {ok:false,error:'Bad status'};status=b.status;}
    if(b.date){if(!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||!/^\d{2}:\d{2}$/.test(b.time||''))return {ok:false,error:'Bad date/time'};date=b.date;time=b.time;}
    if(status==='Confirmed'&&v.some((r,k)=>k>0&&k!==i&&r[9]==='Confirmed'&&r[5]===date&&r[6]===time))return {ok:false,error:'Another confirmed appointment holds this slot'};
    s.getRange(i+1,6,1,2).setValues([[date,time]]);s.getRange(i+1,10).setValue(status);
    if(b.notes!==undefined)s.getRange(i+1,11).setValue(clean(b.notes,300));
    s.getRange(i+1,12).setValue(now());audit(admin,'update','appointment',b.id,status+' '+date+' '+time);
    return {ok:true};
  }finally{lock.releaseLock();}
}
function saveSettings(b,admin){
  Object.keys(b.values||{}).forEach(k=>{if(PUBLIC_KEYS.includes(k)&&k!=='doctor_photo')setKV(k,clean(b.values[k],k==='doctor_bio'||k==='doctor_qualifications'?1500:300));});
  audit(admin,'saveSettings','ClinicSettings','-',Object.keys(b.values||{}).join(','));return {ok:true};
}
function saveServices(b,admin){
  const list=(b.services||[]).slice(0,20).map((x,i)=>['S'+(i+1),clean(x.name,80),clean(x.description,300),true,i+1,now()]).filter(r=>r[1]);
  const s=sh('Services');if(s.getLastRow()>1)s.getRange(2,1,s.getLastRow()-1,6).clearContent();
  if(list.length)s.getRange(2,1,list.length,6).setValues(list);
  audit(admin,'saveServices','Services','-',list.length+' services');return {ok:true};
}
function reviewStatus(b,admin){
  const s=sh('Reviews'),v=s.getDataRange().getValues(),i=v.findIndex((r,k)=>k>0&&r[0]===b.id);
  if(i<0||!['Approved','Hidden'].includes(b.status))return {ok:false,error:'Invalid'};
  s.getRange(i+1,6).setValue(b.status);audit(admin,'review','Reviews',b.id,b.status);return {ok:true};
}
function uploadPhoto(b,admin){
  const data=String(b.data||'');if(data.length>330000||!/^[A-Za-z0-9+\/=]+$/.test(data))return {ok:false,error:'Invalid or too large image'};
  const bytes=Utilities.base64Decode(data);
  if(!(bytes[0]===255&&bytes[1]===216))return {ok:false,error:'Only JPEG images are accepted'};
  const f=DriveApp.createFile(Utilities.newBlob(bytes,'image/jpeg','doctor-photo.jpg'));
  f.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  const old=rows('ClinicSettings').find(r=>r.setting_key==='doctor_photo');
  if(old&&old.setting_value){try{DriveApp.getFileById(old.setting_value).setTrashed(true);}catch(x){}}
  setKV('doctor_photo',f.getId());audit(admin,'uploadPhoto','ClinicSettings','doctor_photo','');
  return {ok:true,id:f.getId()};
}

// OPTIONAL: fills the sheet with clearly-labelled FAKE rows so you can test the admin panel. Run clearSampleData() before going live.
function loadSampleData(){
  const d=n=>Utilities.formatDate(new Date(Date.now()+n*864e5),TZ,'yyyy-MM-dd');
  const S=['Pending','Confirmed','Completed','Cancelled','Pending','Confirmed'],T=['10:00','11:00','12:30','14:00','15:30','17:00'];
  S.forEach((s,i)=>sh('Appointments').appendRow(['APT-SAMPLE-'+(i+1),now(),'[Sample] Patient '+(i+1),'900000000'+(i+1),'',d(s==='Completed'||s==='Cancelled'?-(i+1):i+1),T[i],'First visit','Sample reason',s,'',now()]));
  sh('Reviews').appendRow(['R-SAMPLE-1',now(),'[Sample] Reviewer',5,'Sample review (hidden, never shown publicly).','Hidden']);
  sh('Enquiries').appendRow(['E-SAMPLE-1',now(),'[Sample] Visitor','9000000099','','Sample enquiry','New']);
}
function clearSampleData(){
  [['Appointments',2],['Reviews',2],['Enquiries',2]].forEach(([n,c])=>{const s=sh(n),v=s.getDataRange().getValues();
    for(let i=v.length-1;i>0;i--)if(String(v[i][c]).indexOf('[Sample]')===0)s.deleteRow(i+1);});
}

// ---- CRM / portal additions ----
function savePatient(b,admin){
  const ph=String(b.phone||'').replace(/\D/g,'').slice(-10);if(!/^[6-9]\d{9}$|^\d{10}$/.test(ph))return {ok:false,error:'Invalid phone'};
  const fu=clean(b.follow_up,10);if(fu&&!/^\d{4}-\d{2}-\d{2}$/.test(fu))return {ok:false,error:'Invalid follow-up date'};
  const s=sh('PatientNotes'),v=s.getDataRange().getDisplayValues(),i=v.findIndex((r,k)=>k>0&&r[0]===ph),row=[ph,clean(b.tags,100),clean(b.notes,1000),fu,now()];
  if(i<0)s.appendRow(row);else s.getRange(i+1,1,1,5).setValues([row]);
  audit(admin,'savePatient','PatientNotes',ph,'');return {ok:true};
}
function enquiryStatus(b,admin){
  const s=sh('Enquiries'),v=s.getDataRange().getValues(),i=v.findIndex((r,k)=>k>0&&r[0]===b.id);
  if(i<0||!['New','Contacted','Closed'].includes(b.status))return {ok:false,error:'Invalid'};
  s.getRange(i+1,7).setValue(b.status);audit(admin,'enquiry','Enquiries',b.id,b.status);return {ok:true};
}
function saveHoliday(b,admin){
  const d=clean(b.date,10),t=clean(b.title,80);if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!t)return {ok:false,error:'Date and title required'};
  const s=sh('Holidays');s.getRange('B:B').setNumberFormat('@');const id='H-'+Utilities.getUuid().slice(0,6);
  s.appendRow([id,d,t,'',true]);audit(admin,'saveHoliday','Holidays',id,d+' '+t);return {ok:true};
}
function deleteHoliday(b,admin){
  const s=sh('Holidays'),v=s.getDataRange().getValues(),i=v.findIndex((r,k)=>k>0&&r[0]===b.id);if(i<0)return {ok:false,error:'Not found'};
  s.deleteRow(i+1);audit(admin,'deleteHoliday','Holidays',b.id,'');return {ok:true};
}

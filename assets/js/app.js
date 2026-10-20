const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* ---- sound (synthesised, no files) ---- */
let muted=localStorage.getItem('mute')==='1',AC;$('mt').textContent=muted?'🔇':'🔊';
function tone(f,d,t=0,v=.05){if(muted)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain(),s=AC.currentTime+t;o.frequency.value=f;o.type='sine';g.gain.setValueAtTime(v,s);g.gain.exponentialRampToValueAtTime(.0001,s+d);o.connect(g).connect(AC.destination);o.start(s);o.stop(s+d);}catch(e){}}
const snd={tick:()=>tone(660,.06),ok:()=>{tone(523,.15);tone(784,.25,.12)},err:()=>tone(180,.25,0,.07)};
$('mt').onclick=()=>{muted=!muted;localStorage.setItem('mute',muted?'1':'0');$('mt').textContent=muted?'🔇':'🔊';snd.tick();};
function toast(t){const d=document.createElement('div');d.className='toast';d.textContent=t;$('tc').append(d);setTimeout(()=>d.remove(),3500);}
/* ---- ui polish ---- */
addEventListener('load',()=>setTimeout(()=>$('ld').classList.add('h'),350));
$('y').textContent=new Date().getFullYear();
$('mb').onclick=()=>{const o=$('links').classList.toggle('o');$('mb').setAttribute('aria-expanded',o);$('mb').textContent=o?'✕':'☰';};
$('links').addEventListener('click',e=>{if(e.target.tagName==='A'){$('links').classList.remove('o');$('mb').textContent='☰';}});
document.addEventListener('click',e=>{const b=e.target.closest('.btn,.chip');if(!b)return;snd.tick();if(b.classList.contains('btn')){const r=document.createElement('span'),q=b.getBoundingClientRect(),s=Math.max(q.width,q.height);r.className='rp';r.style.cssText=`width:${s}px;height:${s}px;left:${e.clientX-q.left-s/2}px;top:${e.clientY-q.top-s/2}px`;b.append(r);setTimeout(()=>r.remove(),600);}});
const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('v');io.unobserve(x.target);}}),{threshold:.12});
document.querySelectorAll('.rv').forEach(x=>io.observe(x));
function show(el,t,c){el.textContent=t;el.className='res '+c;}
function countUp(el,to,dec){const t0=performance.now();(function f(n){const p=Math.min((n-t0)/900,1);el.textContent=(to*p).toFixed(dec);if(p<1)requestAnimationFrame(f);})(t0);}
/* ---- config & data ---- */
const ICONS=['<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>','<path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>','<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14l2 2 4-4"/>','<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>','<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.3-4.3"/>','<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'];

$('d').min=new Date(Date.now()+19800000).toISOString().slice(0,10);
$('d').max=new Date(Date.now()+19800000+60*864e5).toISOString().slice(0,10);
(async()=>{
  try{const c=await api.get('settings'),d=c.data||{};
    const ph=d.phone||CONFIG.PHONE,wa=d.whatsapp||CONFIG.WHATSAPP,map=d.map_link||CONFIG.MAPS_LINK;
    $('dir').href=$('dir2').href=map;
    ph?$('tel').href='tel:+'+ph.replace(/\D/g,''):$('tel').style.display='none';
    wa?$('wa').href='https://wa.me/'+wa.replace(/\D/g,'')+'?text='+encodeURIComponent('Hello, I would like to ask about an appointment.'):$('wa').style.display='none';
    const closed=d.clinic_closed==='true';$('dot').className='dot '+(closed?'off':'on');
    $('status').textContent='Clinic status: '+(closed?'Temporarily closed':'Open per schedule')+(d.status_message?' – '+d.status_message:'')+(c.updated?' (updated '+c.updated.slice(0,10)+')':'');
    const cl=(c.holidays||[]).filter(h=>String(h.is_closed).toUpperCase()==='TRUE'&&h.date<=new Date(Date.now()+19800000+21*864e5).toISOString().slice(0,10)).slice(0,3);
    $('ann').textContent=[d.announcement||'',...cl.map(h=>'Clinic closed on '+h.date+(h.title?' ('+h.title+')':''))].filter(Boolean).join(' · ');
    if(cl.length){$('hb').hidden=false;$('hb').textContent='Notice: '+cl.map(h=>h.date+(h.title?' – '+h.title:'')).join(', ')+' – clinic closed.';}
    if(d.doctor_bio)$('bio').textContent=d.doctor_bio;
    if(d.doctor_qualifications)$('qual').innerHTML='<h3>Qualifications</h3><p>'+esc(d.doctor_qualifications).replace(/\n/g,'<br>')+'</p>';
    if(d.doctor_photo){const u='https://drive.google.com/thumbnail?id='+encodeURIComponent(d.doctor_photo)+'&sz=w900';
      document.querySelectorAll('.photo').forEach(p=>p.innerHTML='<img loading="lazy" alt="Dr. Muhammad Aasim Farooqui" src="'+u+'">');}
  }catch(e){$('dir').href=$('dir2').href=CONFIG.MAPS_LINK;$('tel').style.display=$('wa').style.display='none';}
  try{const s=await api.get('services');$('svc').innerHTML=s.data.map((x,i)=>`<div class="card"><div class="ic"><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[i%6]}</svg></div><h3>${esc(x.service_name)}</h3><p>${esc(x.description)}</p><a href="#appointment">Request appointment</a></div>`).join('')||'<p>No services listed yet.</p>';
    document.querySelectorAll('#svc .rv').forEach(x=>io.observe(x));}catch(e){$('svc').innerHTML='<p>Services could not be loaded. Please contact the clinic.</p>';}
  loadReviews();
})();
async function loadReviews(){try{const r=(await api.get('reviews')).data;
  if(!r.length){$('rl').innerHTML='<div class="card" style="grid-column:1/-1;text-align:center">No reviews yet. Be the first to share your experience.</div>';return;}
  const avg=r.reduce((a,x)=>a+x.rating,0)/r.length;$('rs').innerHTML=`<b class="st">★</b> <b id="av"></b> / 5 from ${r.length} approved review${r.length>1?'s':''}`;countUp($('av'),avg,1);
  $('rl').innerHTML=r.map(x=>`<div class="card"><div class="st">${'★'.repeat(x.rating)}${'☆'.repeat(5-x.rating)}</div><p>${esc(x.text)}</p><small style="color:var(--mut)">— ${esc(x.name)}, ${esc(x.date)}</small></div>`).join('');
}catch(e){$('rl').innerHTML='<p>Reviews unavailable right now.</p>';}}
/* ---- slots ---- */
let slot='';
const times=[];for(let m=600;m<=1110;m+=30)times.push(String(m/60|0).padStart(2,'0')+':'+String(m%60).padStart(2,'0'));
const lab=t=>{const h=+t.slice(0,2);return (h%12||12)+':'+t.slice(3)+(h<12?' AM':' PM');};
$('d').onchange=async()=>{slot='';$('slots').innerHTML='<small>Loading slots…</small>';
  let booked=[];try{booked=(await api.get('slots&date='+$('d').value)).booked||[];}catch(e){}
  const now=new Date(Date.now()+19800000),isToday=$('d').value===now.toISOString().slice(0,10),nt=now.toISOString().slice(11,16);
  $('slots').innerHTML=times.map(t=>`<button type="button" class="chip" data-t="${t}" ${booked.includes(t)||(isToday&&t<=nt)?'disabled':''}>${lab(t)}</button>`).join('');};
$('slots').onclick=e=>{const b=e.target.closest('.chip');if(!b||b.disabled)return;slot=b.dataset.t;document.querySelectorAll('.chip').forEach(c=>c.classList.toggle('s',c===b));};
/* ---- forms ---- */
$('f').onsubmit=async e=>{e.preventDefault();const m=$('msg'),b=$('b');
  const p=$('p').value.replace(/[\s-]/g,'').replace(/^(\+91|91|0)(?=\d{10}$)/,'');
  const bad=t=>{show(m,t,'err');snd.err();};
  if($('n').value.trim().length<2)return bad('Please enter your name');
  if(!/^[6-9]\d{9}$/.test(p))return bad('Enter a valid 10-digit Indian mobile number');
  if(!$('d').value||!slot)return bad('Choose a date and an available time slot');
  if(!$('c').checked)return bad('Please accept the privacy consent');
  b.disabled=true;b.textContent='Submitting…';
  try{const r=await api.post({action:'appointment',name:$('n').value,phone:p,email:$('e').value,date:$('d').value,time:slot,visit:$('v').value,reason:$('r').value,consent:true,website:e.target.website.value});
    if(r.ok){show(m,`Request received. Reference: ${r.id} — save it to track your status. This is not a confirmed booking until the clinic approves it.`,'ok');snd.ok();toast('Request submitted');e.target.reset();slot='';$('slots').innerHTML='<small>Choose a date first</small>';}else bad(r.error);
  }catch(x){bad('Could not submit. Please call the clinic.');}
  b.disabled=false;b.textContent='Submit request';};
$('tf').onsubmit=async e=>{e.preventDefault();try{const r=await api.post({action:'track',id:$('ti').value.trim(),phone:$('tp').value});
  r.ok?(show($('tr'),`Status: ${r.status} · ${r.date} ${lab(r.time)}${r.status==='Pending'?' (awaiting clinic approval)':''}`,'ok'),snd.ok()):(show($('tr'),r.error,'err'),snd.err());}catch(x){show($('tr'),'Could not check right now.','err');}};
let rating=0;const sb=[...$('stars').children];
sb.forEach((b,i)=>b.onclick=()=>{rating=i+1;sb.forEach((x,j)=>x.classList.toggle('on',j<=i));});
$('rf').onsubmit=async e=>{e.preventDefault();if(!rating){show($('rr'),'Please select a rating','err');return snd.err();}
  try{const r=await api.post({action:'review',name:$('rn').value,rating,text:$('rt').value,website:e.target.website.value});
    if(r.ok){show($('rr'),'Thank you! Your review will appear after the clinic approves it.','ok');snd.ok();e.target.reset();rating=0;sb.forEach(x=>x.classList.remove('on'));}else{show($('rr'),r.error,'err');snd.err();}}catch(x){show($('rr'),'Could not submit review.','err');}};
$('q').onsubmit=async e=>{e.preventDefault();try{const r=await api.post({action:'enquiry',name:$('qn').value,phone:$('qp').value,message:$('qm').value,website:e.target.website.value});
  if(r.ok){toast('Enquiry sent. We will get back to you.');snd.ok();e.target.reset();}else{toast(r.error);snd.err();}}catch(x){toast('Failed to send');snd.err();}};
/* ---- extras: progress bar, back-to-top, whatsapp bubble, tab title ---- */
addEventListener('scroll',()=>{const h=document.documentElement,p=h.scrollTop/(h.scrollHeight-h.clientHeight||1);$('pb').style.width=(p*100)+'%';$('tt').classList.toggle('s',h.scrollTop>600);},{passive:true});
$('tt').onclick=()=>scrollTo({top:0,behavior:'smooth'});
$('fw').onclick=()=>{const h=$('wa');(h.style.display==='none'||!h.href)?(location.hash='contact'):window.open(h.href,'_blank','noopener');};
const T0=document.title;document.addEventListener('visibilitychange',()=>{document.title=document.hidden?'✚ Book your appointment – Dr. Aasim Farooqui':T0;});

/* ---- Hindi / English toggle ---- */
const HI={"About":"परिचय","Services":"सेवाएँ","Reviews":"समीक्षाएँ","Timings":"समय","Location":"पता","Contact":"संपर्क","Book Appointment":"अपॉइंटमेंट बुक करें","Book an Appointment":"अपॉइंटमेंट बुक करें","Get Directions":"रास्ता देखें","Trusted General Medical Care, Close to Home.":"आपके पास, भरोसेमंद सामान्य चिकित्सा सेवा।","Medical Services":"चिकित्सा सेवाएँ","How booking works":"बुकिंग कैसे होती है","Choose a slot":"समय चुनें","Clinic reviews it":"क्लिनिक जाँच करता है","Visit the clinic":"क्लिनिक आएँ","Request an Appointment":"अपॉइंटमेंट का अनुरोध करें","Track your request":"अपना अनुरोध ट्रैक करें","Patient Reviews":"मरीज़ों की समीक्षाएँ","Clinic Timings":"क्लिनिक का समय","Frequently asked questions":"अक्सर पूछे जाने वाले प्रश्न","Submit request":"अनुरोध भेजें","Check status":"स्थिति देखें","Full name":"पूरा नाम","Mobile number":"मोबाइल नंबर","Date":"तारीख","Visit type":"विज़िट का प्रकार","Name":"नाम","Phone":"फ़ोन","Message":"संदेश","Send enquiry":"पूछताछ भेजें","Share your experience":"अपना अनुभव साझा करें","Submit review":"समीक्षा भेजें","Request appointment":"अपॉइंटमेंट का अनुरोध करें","Reason (optional)":"कारण (वैकल्पिक)","Email (optional)":"ईमेल (वैकल्पिक)","Reference ID":"संदर्भ आईडी","Review":"समीक्षा","Rating":"रेटिंग","Your name":"आपका नाम","Location ":"पता","Call the clinic":"क्लिनिक को कॉल करें"};
let hi=localStorage.getItem('lang')==='hi';
function lang(){document.documentElement.lang=hi?'hi':'en';document.querySelectorAll('a,button,h1,h2,h3,.eyebrow,summary,label').forEach(e=>{if(e.children.length)return;if(!e.dataset.en)e.dataset.en=e.textContent.trim();const en=e.dataset.en;if(HI[en])e.textContent=hi?HI[en]:en;});$('lg').textContent=hi?'EN':'हिं';}
$('lg').onclick=()=>{hi=!hi;localStorage.setItem('lang',hi?'hi':'en');lang();};
addEventListener('load',()=>setTimeout(()=>{if(hi)lang();else $('lg').textContent='हिं';},600));

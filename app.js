/* ============ CONFIG – edit here ============ */
// WhatsApp number in international format, digits only (e.g. 9725XXXXXXXX -> 972521234567).
// While it contains "X", the site runs in DEMO mode and shows the message on screen instead of opening WhatsApp.
const WHATSAPP_NUMBER = '9725XXXXXXXX';

const CONFIG = {
  slotMinutes: 75,          // every appointment is 1h15m; slots never overlap
  daysAhead: 14,
  // 0=Sunday ... 6=Saturday. null = closed
  hours: { 0:['09:00','19:00'], 1:['09:00','19:00'], 2:['09:00','19:00'], 3:['09:00','19:00'], 4:['09:00','19:00'], 5:['09:00','13:00'], 6:null },
  services: [
    { id:'mani',   name:'מניקור ללא לק',          price:80 },
    { id:'gel',    name:'מניקור + לק ג׳ל',         price:140 },
    { id:'strong', name:'חיזוק ציפורניים טבעיות',  price:120 },
    { id:'build',  name:'בניית ציפורניים',          price:200 },
    { id:'fill',   name:'מילוי בנייה',              price:160 },
  ],
  addons: [
    { id:'french', name:'תוספת פרנץ׳',       price:20 },
    { id:'repair', name:'תיקון ציפורן שבורה', price:10 },
  ],
};
/* ============================================ */

const $ = s => document.querySelector(s);
const DAY = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const DAYS = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];
const toMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
const fmt = m => String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const state = { service:null, addons:new Set(), date:null, time:null };

// price lists
$('#priceList').innerHTML = CONFIG.services.map(s=>`<li><span>${s.name}</span><b>₪${s.price}</b></li>`).join('');
$('#addonList').innerHTML = CONFIG.addons.map(a=>`<li><span>${a.name}</span><b>₪${a.price}</b></li>`).join('');

// hours list
$('#hoursList').innerHTML = [0,1,2,3,4,5,6].map(d=>{ const h=CONFIG.hours[d];
  return `<li class="${h?'':'closed'}"><span>יום ${DAY[d]}</span><span dir="ltr">${h?h[0]+'–'+h[1]:'סגור'}</span></li>`; }).join('');

// services
$('#serviceGrid').innerHTML = CONFIG.services.map(s=>`
  <label class="opt"><input type="radio" name="service" value="${s.id}">
  <span class="card"><span class="n">${s.name}</span><span class="p">₪${s.price}</span><span class="d">שעה ורבע</span></span></label>`).join('');
$('#addonGrid').innerHTML = CONFIG.addons.map(a=>`
  <label class="chip"><input type="checkbox" name="addon" value="${a.id}"><span>${a.name} · ₪${a.price}</span></label>`).join('');

// dates
const dates=[]; { const t=new Date(); t.setHours(0,0,0,0);
  for(let i=0;i<CONFIG.daysAhead;i++){ const d=new Date(t); d.setDate(t.getDate()+i); dates.push(d);} }
$('#dateRow').innerHTML = dates.map(d=>{ const closed=!CONFIG.hours[d.getDay()];
  return `<label class="chip"><input type="radio" name="date" value="${iso(d)}" ${closed?'disabled':''} aria-label="יום ${DAY[d.getDay()]} ${d.getDate()}/${d.getMonth()+1}${closed?' – סגור':''}">
  <span><small>${DAYS[d.getDay()]}</small><strong>${d.getDate()}</strong><small>${d.getMonth()+1}/${String(d.getFullYear()).slice(2)}</small></span></label>`; }).join('');

// deterministic "taken" slots (demo only)
function taken(dateStr, time){ let h=0; for(const c of dateStr+time) h=(h*31+c.charCodeAt(0))>>>0; return h%10<3; }

function slotsFor(dateStr){
  const d=new Date(dateStr+'T00:00'); const h=CONFIG.hours[d.getDay()]; if(!h) return [];
  const out=[]; const now=new Date(); const isToday=iso(now)===dateStr; const nowMin=now.getHours()*60+now.getMinutes();
  for(let m=toMin(h[0]); m+CONFIG.slotMinutes<=toMin(h[1]); m+=CONFIG.slotMinutes){
    const t=fmt(m); out.push({t, busy: taken(dateStr,t) || (isToday && m<=nowMin+30)});
  }
  return out;
}
function renderSlots(){
  const el=$('#slots');
  if(!state.date){ el.innerHTML='<p class="hint">בחרי תאריך כדי לראות שעות פנויות</p>'; return; }
  const s=slotsFor(state.date);
  if(!s.some(x=>!x.busy)){ el.innerHTML='<p class="none">אין שעות פנויות ביום הזה, נסי יום אחר ♡</p>'; return; }
  el.innerHTML=s.map(x=>`<label class="chip"><input type="radio" name="time" value="${x.t}" ${x.busy?'disabled':''} ${state.time===x.t?'checked':''} aria-label="${x.t}${x.busy?' – תפוס':''}"><span>${x.t}</span></label>`).join('');
}

const svc = () => CONFIG.services.find(s=>s.id===state.service);
const addonObjs = () => CONFIG.addons.filter(a=>state.addons.has(a.id));
const total = () => (svc()?.price||0) + addonObjs().reduce((a,b)=>a+b.price,0);
const dateLabel = s => { if(!s) return ''; const d=new Date(s+'T00:00'); return `יום ${DAY[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
const endTime = t => fmt(toMin(t)+CONFIG.slotMinutes);

function renderSummary(){
  const rows=[['טיפול', svc()?`${svc().name} (₪${svc().price})`:'—'],
    ['תוספות', addonObjs().map(a=>`${a.name} (₪${a.price})`).join(', ')||'ללא'],
    ['תאריך', state.date?dateLabel(state.date):'—'],
    ['שעה', state.time?`${state.time} עד ${endTime(state.time)}`:'—'],
    ['שם', $('#fName').value.trim()||'—'], ['טלפון', $('#fPhone').value.trim()||'—']];
  const note=$('#fNote').value.trim(); if(note) rows.push(['הערה', note]);
  $('#summary').innerHTML=rows.map(([k,v])=>`<dt>${k}</dt><dd>${v.replace(/</g,'&lt;')}</dd>`).join('');
  $('#total').textContent='₪'+total();
  const done=[!!state.service, !!(state.date&&state.time), !!($('#fName').value.trim()&&validPhone()), false];
  document.querySelectorAll('.steps li').forEach((li,i)=>li.classList.toggle('done',done[i]));
}
const validPhone = () => /^0\d{8,9}$|^\+?972\d{8,9}$/.test($('#fPhone').value.replace(/[\s-]/g,''));

function buildMessage(){
  const note=$('#fNote').value.trim();
  return [ 'היי אלכסנדרה! ♡ אשמח לקבוע תור:', '',
    `💅 טיפול: ${svc().name} – ₪${svc().price}`,
    `✨ תוספות: ${addonObjs().map(a=>`${a.name} (₪${a.price})`).join(', ')||'ללא'}`,
    `📅 תאריך: ${dateLabel(state.date)}`,
    `🕐 שעה: ${state.time} עד ${endTime(state.time)}`,
    `💰 סה״כ: ₪${total()}`, '',
    `👤 שם: ${$('#fName').value.trim()}`,
    `📞 טלפון: ${$('#fPhone').value.trim()}`,
    ...(note?[`📝 הערה: ${note}`]:[]) ].join('\n');
}
function waUrl(){ return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`; }
window.__waUrl = waUrl; // for testing

const form=$('#bookForm');
form.addEventListener('change', e=>{
  const t=e.target;
  if(t.name==='service') state.service=t.value;
  if(t.name==='addon') t.checked?state.addons.add(t.value):state.addons.delete(t.value);
  if(t.name==='date'){ state.date=t.value; state.time=null; renderSlots(); }
  if(t.name==='time') state.time=t.value;
  renderSummary();
});
form.addEventListener('input', e=>{ if(e.target.id==='fPhone') e.target.removeAttribute('aria-invalid'); renderSummary(); });
form.addEventListener('submit', e=>{
  e.preventDefault(); const err=$('#formError'); let msg='';
  if(!state.service) msg='בחרי טיפול';
  else if(!state.date) msg='בחרי תאריך';
  else if(!state.time) msg='בחרי שעה';
  else if(!$('#fName').value.trim()) { msg='נא למלא שם'; $('#fName').focus(); }
  else if(!validPhone()) { msg='נא למלא מספר טלפון תקין'; $('#fPhone').setAttribute('aria-invalid','true'); $('#fPhone').focus(); }
  err.textContent=msg; if(msg) return;
  const url=waUrl(); console.log('WA_URL', url);
  if(/X/i.test(WHATSAPP_NUMBER)){
    $('#demoMsg').textContent=buildMessage(); $('#demoOut').hidden=false;
    $('#demoOut').scrollIntoView({behavior:'smooth',block:'center'});
  } else { window.location.href=url; }
});

// sticky CTA hides while booking section is on screen
const cta=$('#stickyCta');
new IntersectionObserver(([en])=>cta.classList.toggle('hide',en.isIntersecting),{threshold:.15}).observe($('#booking'));
$('#yr').textContent=new Date().getFullYear();
renderSlots(); renderSummary();

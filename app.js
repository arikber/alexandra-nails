/* ============ CONFIG – edit here ============ */
// WhatsApp number in international format, digits only (e.g. 9725XXXXXXXX -> 972521234567).
// While it contains "X", the site runs in DEMO mode and shows the message on screen instead of opening WhatsApp.
const WHATSAPP_NUMBER = '9725XXXXXXXX';

const CONFIG = {
  slotMinutes: 75,          // every appointment is 1h15m; slots never overlap
  daysAhead: 14,
  // 0=Sunday ... 6=Saturday. null = closed
  hours: { 0:['09:00','19:00'], 1:['09:00','19:00'], 2:['09:00','19:00'], 3:['09:00','19:00'], 4:['09:00','19:00'], 5:['09:00','13:00'], 6:null },
  // Base prices retained from the previous version; awaiting Alexandra's confirmation.
  services: [
    { id:'mani', name:'מניקור', price:80, includes:['עיצוב אורך וצורת הציפורניים הטבעיות.','ניקוי יסודי של הקוטיקולה וצידי הציפורן.','הסרת עור יבש וטיפוח הציפורניים.'] },
    { id:'strong', name:'חיזוק ציפורניים טבעיות', price:120, includes:['הסרת חומר קודם, במידת הצורך.','מניקור יסודי וניקוי הקוטיקולה.','חיזוק בג׳ל ובניית מבנה אנטומי נכון.','גימור בגוון טבעי לבחירה: חלבי, ורוד, ניוד או שקוף.'] },
    { id:'gel', name:'מניקור + לק ג׳ל צבעוני', price:140, includes:['הסרת חומר קודם, במידת הצורך.','מניקור יסודי ועיצוב הציפורניים.','חיזוק ובניית מבנה אנטומי נכון.','מריחת לק ג׳ל בצבע לבחירה.'], note:'החיזוק ובניית המבנה כלולים במחיר הטיפול.' },
    { id:'build', name:'בניית ציפורניים', price:200, includes:['מניקור יסודי והכנת הציפורניים.','הארכת הציפורניים לאורך ולצורה הרצויים.','בניית מבנה אנטומי נכון.','גימור בג׳ל בגוון טבעי לבחירה.'] },
    { id:'fill', name:'מילוי ציפורניים בנויות', price:160, includes:['הסרת הציפוי הקודם, במידת הצורך.','מניקור יסודי וניקוי הקוטיקולה.','טיפול בהתרוממויות והשלמת חומר הבנייה.','חידוש המבנה האנטומי ועיצוב הציפורניים.','גימור בג׳ל בגוון טבעי לבחירה.'] },
  ],
  addons: [
    { id:'color', name:'לק ג׳ל צבעוני', price:20, explanation:'לק ג׳ל צבעוני דורש עבודה נוספת ולכן מתומחר בנפרד. תוספת שכבר כלולה במחיר הטיפול אינה מחויבת שוב.' },
    { id:'french', name:'פרנץ׳', price:30, explanation:'פרנץ׳ דורש עבודה נוספת ולכן מתומחר בנפרד.' },
    { id:'repair', name:'תיקון ציפורן בנויה שנשברה', price:10, explanation:'תיקון ציפורן שבורה בתשלום נוסף מתייחס לציפורניים בנויות בלבד. המחיר הוא לציפורן.' },
  ],
};
/* ============================================ */

const $ = s => document.querySelector(s);
const DAY = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
const DAYS = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];
const toMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
const fmt = m => String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
const iso = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const state = { service:null, addons:new Set(), date:null, time:null, repairCount:1 };

// Accessible expandable service and add-on cards.
function accordion(id, title, body) {
  return `<article class="accordion"><h3><button type="button" aria-expanded="false" aria-controls="${id}" class="accordion-toggle">${title}<span aria-hidden="true">＋</span></button></h3><div id="${id}" class="accordion-body" hidden>${body}</div></article>`;
}
$('#priceList').innerHTML = CONFIG.services.map(s=>accordion('detail-'+s.id,s.name,`<p class="detail-price">₪${s.price}</p><h4>מה כולל הטיפול?</h4><ul>${s.includes.map(x=>`<li>${x}</li>`).join('')}</ul>${s.note?`<p>${s.note}</p>`:''}${s.id!=='mani'?`<p>תוספות בתשלום: לק ג׳ל צבעוני — ₪${CONFIG.addons.find(a=>a.id==='color').price}; פרנץ׳ — ₪${CONFIG.addons.find(a=>a.id==='french').price}.</p>${s.id==='gel'?'<p>לק ג׳ל צבעוני כבר כלול בטיפול זה ולא יחויב שוב.</p>':''}`:''}`)).join('');
$('#addonList').innerHTML = CONFIG.addons.map(a=>accordion('detail-'+a.id,a.name,`<p class="detail-price">₪${a.price}${a.id==='repair'?' לציפורן':''}</p><p>${a.explanation}</p>`)).join('');
document.querySelectorAll('.accordion-toggle').forEach(b=>b.addEventListener('click',()=>{
  const open=b.getAttribute('aria-expanded')!=='true'; b.setAttribute('aria-expanded',String(open)); document.getElementById(b.getAttribute('aria-controls')).hidden=!open;
}));

// hours list
$('#hoursList').innerHTML = [0,1,2,3,4,5,6].map(d=>{ const h=CONFIG.hours[d];
  return `<li class="${h?'':'closed'}"><span>יום ${DAY[d]}</span><span dir="ltr">${h?h[0]+'–'+h[1]:'סגור'}</span></li>`; }).join('');

// services
$('#serviceGrid').innerHTML = CONFIG.services.map(s=>`
  <label class="opt"><input type="radio" name="service" value="${s.id}">
  <span class="card"><span class="n">${s.name}</span><span class="p">₪${s.price}</span></span></label>`).join('');
const eligibleAddon = a => state.service && (a.id==='repair' ? ['build','fill'].includes(state.service) : a.id==='color' ? ['strong','build','fill'].includes(state.service) : state.service!=='mani');
function renderAddons(){
  CONFIG.addons.forEach(a=>{if(!eligibleAddon(a)) state.addons.delete(a.id);});
  $('#addonGrid').innerHTML = CONFIG.addons.filter(eligibleAddon).map(a=>`
    <label class="chip"><input type="checkbox" name="addon" value="${a.id}" ${state.addons.has(a.id)?'checked':''}><span>${a.name} · ₪${a.price}${a.id==='repair'?' לציפורן':''}</span></label>`).join('') || '<p class="hint">בחרי טיפול כדי לראות תוספות מתאימות</p>';
  if(state.addons.has('repair')) $('#addonGrid').insertAdjacentHTML('beforeend',`<label class="field"><span>מספר הציפורניים לתיקון</span><input id="repairCount" name="repairCount" type="number" min="1" max="10" step="1" required value="${state.repairCount??1}"></label>`);
  if(state.service==='gel') $('#addonGrid').insertAdjacentHTML('beforeend','<p class="hint">לק ג׳ל צבעוני כבר כלול במחיר הטיפול ואינו מחויב שוב.</p>');
}
renderAddons();

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
const total = () => (svc()?.price||0) + addonObjs().reduce((a,b)=>a+b.price*(b.id==='repair'?(state.repairCount??1):1),0);
const dateLabel = s => { if(!s) return ''; const d=new Date(s+'T00:00'); return `יום ${DAY[d.getDay()]}, ${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`; };
const endTime = t => fmt(toMin(t)+CONFIG.slotMinutes);

function renderSummary(){
  const rows=[['טיפול', svc()?`${svc().name} (₪${svc().price})`:'—'],
    ['תוספות', addonObjs().map(a=>`${a.name}${a.id==='repair'?' × '+(state.repairCount??1):''} (₪${a.price*(a.id==='repair'?(state.repairCount??1):1)})`).join(', ')||'ללא'],
    ['תאריך', state.date?dateLabel(state.date):'—'],
    ['שעה', state.time?state.time:'—'],
    ['לקוחה חדשה', document.querySelector('[name="newClient"]:checked')?.value||'—'],
    ['אלרגיה או רגישות', document.querySelector('[name="allergy"]:checked')?.value||'—'],
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
    `טיפול: ${svc().name} – ₪${svc().price}`,
    `תוספות: ${addonObjs().map(a=>`${a.name}${a.id==='repair'?' × '+(state.repairCount??1):''} (₪${a.price*(a.id==='repair'?(state.repairCount??1):1)})`).join(', ')||'ללא'}`,
    `תאריך: ${dateLabel(state.date)}`, `שעת התחלה מבוקשת: ${state.time}`,
    `סה״כ: ₪${total()}`, '', `שם: ${$('#fName').value.trim()}`, `טלפון: ${$('#fPhone').value.trim()}`,
    `לקוחה חדשה: ${form.elements.newClient.value}`,
    ...(form.elements.newClient.value==='כן'?['אצרף תמונה ברורה של שתי הידיים והציפורניים בשיחת הוואטסאפ.']:[]),
    `אלרגיה או רגישות: ${form.elements.allergy.value}`,
    ...(form.elements.allergy.value==='כן'?[`פירוט: ${$('#allergyDetails').value.trim()}`]:[]),
    `אישור הלקוחה: ${$('#allergyConfirm').checked?'אני מאשרת כי מסרתי את המידע הידוע לי באופן מלא ונכון, ומתחייבת לעדכן על כל רגישות או תגובה חריגה הידועה לי לפני תחילת הטיפול.':'לא אושר'}`,
    ...(note?[`הערה: ${note}`]:[]) ].join('\n');
}
function waUrl(){ return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage())}`; }
window.__waUrl = waUrl; // for testing

const form=$('#bookForm');
form.addEventListener('change', e=>{
  const t=e.target;
  if(t.name==='service') { state.service=t.value; renderAddons(); }
  if(t.name==='addon') { t.checked?state.addons.add(t.value):state.addons.delete(t.value); renderAddons(); }
  if(t.name==='newClient') $('#photoReminder').hidden=t.value!=='כן';
  if(t.name==='allergy') { $('#allergyDetailsField').hidden=t.value!=='כן'; $('#allergyDetails').required=t.value==='כן'; }
  if(t.name==='date'){ state.date=t.value; state.time=null; renderSlots(); }
  if(t.name==='time') state.time=t.value;
  renderSummary();
});
form.addEventListener('input', e=>{ if(e.target.id==='fPhone') e.target.removeAttribute('aria-invalid'); if(e.target.name==='repairCount') state.repairCount=Number(e.target.value); renderSummary(); });
form.addEventListener('submit', e=>{
  e.preventDefault(); const err=$('#formError'); let msg='';
  if(!state.service) msg='בחרי טיפול';
  else if(!state.date) msg='בחרי תאריך';
  else if(!state.time) msg='בחרי שעה';
  else if(!$('#fName').value.trim()) { msg='נא למלא שם'; $('#fName').focus(); }
  else if(!validPhone()) { msg='נא למלא מספר טלפון תקין'; $('#fPhone').setAttribute('aria-invalid','true'); $('#fPhone').focus(); }
  else if(!form.elements.newClient.value) msg='נא לציין אם את לקוחה חדשה';
  else if(!form.elements.allergy.value) msg='נא לענות על שאלת האלרגיות והרגישויות';
  else if(form.elements.allergy.value==='כן' && !$('#allergyDetails').value.trim()) {msg='נא לפרט על האלרגיה או הרגישות'; $('#allergyDetails').focus();}
  else if(!$('#allergyConfirm').checked) msg='יש לאשר את הצהרת הלקוחה';
  else if(state.addons.has('repair') && (!Number.isInteger(state.repairCount??1) || (state.repairCount??1)<1 || (state.repairCount??1)>10)) msg='נא לבחור מספר ציפורניים לתיקון בין 1 ל־10';
  err.textContent=msg; if(msg) return;
  $('#photoReminder').hidden=form.elements.newClient.value!=='כן';
  const url=waUrl();
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

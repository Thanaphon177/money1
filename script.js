const CATS={e:['อาหาร','เดินทาง','ที่พัก','ช้อปปิ้ง','บิล','บันเทิง','สุขภาพ','อื่นๆ'],i:['เงินเดือน','รายได้เสริม','อื่นๆ']};
const EM={'อาหาร':'🍜','เดินทาง':'🚌','ที่พัก':'🏠','ช้อปปิ้ง':'🛍️','บิล':'🧾','บันเทิง':'🎮','สุขภาพ':'💊','อื่นๆ':'✨','เงินเดือน':'💰','รายได้เสริม':'🍀'};
let items=[],type='e',cat='อาหาร',ym=new Date().toISOString().slice(0,7);
const $=id=>document.getElementById(id);
const baht=n=>'฿'+Math.round(n).toLocaleString('th-TH');
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function load(){try{items=JSON.parse(localStorage.getItem('money-items')||'[]')}catch(e){items=[]}}
function persist(){try{localStorage.setItem('money-items',JSON.stringify(items))}catch(e){}}
function today(){const d=new Date();d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,10)}
const cur={};
function tween(id,to){const el=$(id),from=cur[id]||0;cur[id]=to;if(matchMedia('(prefers-reduced-motion:reduce)').matches){el.textContent=(to<0?'−':'')+baht(Math.abs(to));return}const t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/700),v=from+(to-from)*(1-Math.pow(1-p,3));el.textContent=(v<0?'−':'')+baht(Math.abs(v));if(p<1)requestAnimationFrame(f)})(t0)}
function burst(){if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;const r=$('save').getBoundingClientRect();for(let i=0;i<18;i++){const s=document.createElement('span');s.className='fx';s.textContent=type==='i'?'🪙':['💧','✨','💙','🫧'][i%4];s.style.left=r.left+r.width/2+'px';s.style.top=r.top+'px';s.style.setProperty('--x',(Math.random()*260-130)+'px');s.style.setProperty('--y',-(90+Math.random()*180)+'px');s.style.animationDelay=Math.random()*.12+'s';document.body.appendChild(s);setTimeout(()=>s.remove(),1300)}}
function toast(m){const t=$('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1500)}
function fmtDay(d){return new Date(d+'T00:00').toLocaleDateString('th-TH',{weekday:'short',day:'numeric',month:'short'})}
function chips(){$('chips').innerHTML=CATS[type].map(c=>`<button class="chip ${c===cat?'on':''}" data-c="${c}"><b>${EM[c]}</b>${c}</button>`).join('')}
function row(x){return `<div class="it"><div class="ic ${x.type}">${EM[x.cat]||'✨'}</div><div class="t">${esc(x.cat)}<span>${esc(x.note||'')}</span></div><div class="a2 ${x.type}">${x.type==='e'?'−':'+'}${baht(x.amt)}</div><button class="del" data-d="${x.id}" aria-label="ลบ">×</button></div>`}
function render(){
  const [y,m]=ym.split('-');
  $('mlabel').textContent=new Date(y,m-1,1).toLocaleDateString('th-TH',{month:'long',year:'numeric'});
  const mi=items.filter(x=>x.date.startsWith(ym)).sort((a,b)=>b.date.localeCompare(a.date)||b.id-a.id);
  const inc=mi.filter(x=>x.type==='i').reduce((s,x)=>s+x.amt,0),exp=mi.filter(x=>x.type==='e').reduce((s,x)=>s+x.amt,0);
  tween('inc',inc);tween('exp',exp);tween('bal',inc-exp);
  $('say').textContent=!mi.length?'มาเริ่มบันทึกกันน้า ✨':!inc?'ยังไม่มีรายรับเลย 🥺':exp/inc<.5?'เก่งมาก ใช้ไม่ถึงครึ่งเลย 🎉':exp/inc<.9?'กำลังดีเลย 😊':'ระวังนิดนึงน้า 🥺';
  const emp=t=>`<div class="empty"><b>🐣</b>${t}</div>`;
  $('recent').innerHTML=mi.length?mi.slice(0,5).map(row).join(''):emp('ยังไม่มีรายการ ลองบันทึกอันแรกดูน้า');
  let h='',last='';
  mi.forEach(x=>{if(x.date!==last){h+=`<div class="day">${fmtDay(x.date)}</div>`;last=x.date}h+=row(x)});
  $('all').innerHTML=h||emp('เดือนนี้ยังโล่งๆ อยู่เลย');
  const by={};mi.filter(x=>x.type==='e').forEach(x=>by[x.cat]=(by[x.cat]||0)+x.amt);
  const arr=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  $('cats').innerHTML=arr.length?arr.map(([c,v])=>`<div class="cat"><div><span>${EM[c]||''} ${esc(c)}</span><span>${baht(v)} · ${Math.round(v/exp*100)}%</span></div><div class="bar"><i style="width:${v/arr[0][1]*100}%"></i></div></div>`).join(''):emp('ยังไม่มีรายจ่ายเดือนนี้ เก่งจัง');
}
document.querySelectorAll('.seg button').forEach(b=>b.onclick=()=>{type=b.dataset.t;cat=CATS[type][0];document.querySelectorAll('.seg button').forEach(x=>x.className=x===b?'on '+type:'');chips()});
$('chips').onclick=e=>{const c=e.target.closest('.chip');if(c){cat=c.dataset.c;chips()}};
$('save').onclick=()=>{
  const amt=parseFloat($('amt').value);
  if(!amt||amt<=0){toast('ใส่จำนวนเงินก่อนน้า 🥺');$('amt').focus();return}
  const date=$('date').value||today();
  items.push({id:Date.now(),type,amt,cat,note:$('note').value.trim(),date});
  persist();$('amt').value='';$('note').value='';ym=date.slice(0,7);render();burst();toast('บันทึกแล้ว 💙');
};
document.body.onclick=e=>{const d=e.target.dataset.d;if(d&&confirm('ลบรายการนี้?')){items=items.filter(x=>x.id!=d);persist();render()}};
function shift(n){const [y,m]=ym.split('-').map(Number);const d=new Date(y,m-1+n,1);ym=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');render()}
$('prev').onclick=()=>shift(-1);$('next').onclick=()=>shift(1);
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('nav button').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('.v').forEach(v=>v.classList.toggle('on',v.id==='v-'+b.dataset.v));
});
$('csv').onclick=()=>{
  const t='วันที่,ประเภท,หมวด,จำนวน,โน้ต\n'+items.map(x=>[x.date,x.type==='e'?'รายจ่าย':'รายรับ',x.cat,x.amt,'"'+x.note.replace(/"/g,'""')+'"'].join(',')).join('\n');
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('คัดลอกแล้ว 📋')).catch(()=>toast('คัดลอกไม่สำเร็จ'));
};
$('clear').onclick=()=>{if(confirm('ลบข้อมูลทั้งหมด? กู้คืนไม่ได้นะ')){items=[];persist();render()}};
load();$('date').value=today();chips();render();
const pg=document.querySelector('.pig');pg.onclick=()=>{pg.classList.add('jump');toast(['สู้ๆ น้า 💪','เก็บเงินเก่งจัง 🐧','ฮัลโหล~ 💙'][Math.random()*3|0])};pg.onanimationend=()=>pg.classList.remove('jump');

const socket=io();
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const mini=document.getElementById('minimap'),mctx=mini.getContext('2d');

const ui={
menu:document.getElementById('menu'),death:document.getElementById('death'),hud:document.getElementById('hud'),
play:document.getElementById('playBtn'),respawn:document.getElementById('respawnBtn'),reward:document.getElementById('rewardBtn'),
name:document.getElementById('nameInput'),score:document.getElementById('score'),size:document.getElementById('size'),
kills:document.getElementById('kills'),streak:document.getElementById('streak'),leaderboard:document.getElementById('leaderboard'),
finalScore:document.getElementById('finalScore'),finalSize:document.getElementById('finalSize'),deathText:document.getElementById('deathText'),
lang:document.getElementById('langBtn'),boost:document.getElementById('boostBtn'),sound:document.getElementById('soundBtn'),
toast:document.getElementById('toast'),eventBanner:document.getElementById('eventBanner'),skins:document.getElementById('skins'),
coinTop:document.getElementById('coinTop'),coinMenu:document.getElementById('coinMenu'),dailyBtn:document.getElementById('dailyBtn'),
dailyStatus:document.getElementById('dailyStatus'),earnedCoins:document.getElementById('earnedCoins'),skinHint:document.getElementById('skinHint'),
joystick:document.getElementById('joystick'),joyKnob:document.getElementById('joyKnob'),
payCoinsBtn:document.getElementById('payCoinsBtn'),payCoinsText:document.getElementById('payCoinsText'),
botsToggle:document.getElementById('botsToggle'),watchCoinsBtn:document.getElementById('watchCoinsBtn'),
watchCoinsReward:document.getElementById('watchCoinsReward'),
pauseMenu:document.getElementById('pauseMenu'),gameMenuBtn:document.getElementById('gameMenuBtn'),
resumeBtn:document.getElementById('resumeBtn'),homeBtn:document.getElementById('homeBtn'),
pauseSoundBtn:document.getElementById('pauseSoundBtn'),pauseLangBtn:document.getElementById('pauseLangBtn')
};

const I18N={
en:{
tagline:'Eat. Grow. Hunt. Become the king.',nickname:'Your nickname',play:'PLAY NOW',realtime:'Realtime',
controls:'Move your mouse or finger to steer. Hunt smaller snakes, chase rare food, and boost with SPACE.',
score:'Score',size:'Size',kills:'Kills',streak:'Streak',boostTip:'Hold SPACE or press BOOST',boost:'BOOST',
eliminated:'Eliminated!',respawn:'RESPAWN',reward:'WATCH AD & RESPAWN BIGGER',adDemo:'Rewarded-ad hook ready for an approved ad provider.',
leaderboard:'Leaderboard',killedBy:'Eliminated by',adPlaceholder:'Demo reward granted. Connect an approved rewarded-ad SDK before production.',
chooseSkin:'Choose your skin',rareSpawn:'GOLDEN FOOD SPAWNED!',rareEaten:'claimed the Golden Food!',killStreak:'KILL STREAK',
bot:'BOT',minimap:'Mini Map',you:'You',rare:'Rare',coins:'Coins',dailyReward:'Daily Reward',claim:'CLAIM +100',
claimed:'Claimed today',earned:'Earned',locked:'Locked',unlock:'Unlock',cost:'cost',rank:'Rank',yourRank:'Your rank',
streakBonus:'streak bonus',skinUnlocked:'Skin unlocked!',needCoins:'Not enough coins',dailyClaimed:'Daily reward claimed!',payRespawn:'PAY {cost} COINS & RESPAWN BIGGER',payRespawnShort:'Pay Coins',notEnoughRespawn:'Not enough coins to use paid respawn',bots:'Bots',botsHint:'Off by default',watchCoins:'Watch Ad',adCoinsGranted:'Ad reward granted',unlockAd:'Watch Ad to unlock',or:'or',classicSkins:'Classic Skins',countrySkins:'Country Skins',saudiSpecial:'Saudi Special • Swords & Palm',menu:'Menu',gameMenu:'Game Menu',resume:'RESUME',home:'HOME',sound:'Sound',language:'Language',escHint:'Press ESC to open or close this menu.'
},
ar:{
tagline:'كُل. اكْبَر. طارد. وكن الملك.',nickname:'اسم اللاعب',play:'ابدأ اللعب',realtime:'لحظي',
controls:'حرّك الماوس أو استخدم عصا التحكم. طارد الحيّات الأصغر وتسابق على الأكل النادر واستخدم السرعة.',
score:'النقاط',size:'الحجم',kills:'الإقصاءات',streak:'السلسلة',boostTip:'اضغط SPACE أو زر السرعة',boost:'سرعة',
eliminated:'تم إقصاؤك!',respawn:'العودة للعب',reward:'شاهد إعلانًا وارجع أكبر',adDemo:'ميزة إعلان المكافأة جاهزة للربط بمزود معتمد.',
leaderboard:'المتصدرون',killedBy:'أقصاك',adPlaceholder:'تم منح مكافأة تجريبية. اربط SDK معتمد قبل النشر.',
chooseSkin:'اختر شكل الحيّة',rareSpawn:'ظهر الطعام الذهبي النادر!',rareEaten:'حصل على الطعام الذهبي!',killStreak:'سلسلة إقصاءات',
bot:'بوت',minimap:'الخريطة',you:'أنت',rare:'النادر',coins:'العملات',dailyReward:'المكافأة اليومية',claim:'استلم +100',
claimed:'تم الاستلام اليوم',earned:'كسبت',locked:'مقفل',unlock:'فتح',cost:'السعر',rank:'المركز',yourRank:'مركزك',
streakBonus:'مكافأة السلسلة',skinUnlocked:'تم فتح الشكل!',needCoins:'العملات غير كافية',dailyClaimed:'تم استلام المكافأة اليومية!',payRespawn:'ادفع {cost} عملة وارجع أكبر',payRespawnShort:'ادفع عملات',notEnoughRespawn:'العملات غير كافية للعودة المدفوعة',bots:'البوتات',botsHint:'مقفلة افتراضيًا',watchCoins:'شاهد إعلانًا',adCoinsGranted:'تمت إضافة مكافأة الإعلان',unlockAd:'شاهد إعلانًا للفتح',or:'أو',classicSkins:'السكنات الأساسية',countrySkins:'سكنات الدول',saudiSpecial:'السعودية المميز • السيفان والنخلة',menu:'القائمة',gameMenu:'قائمة اللعبة',resume:'متابعة',home:'الرئيسية',sound:'الصوت',language:'اللغة',escHint:'اضغط ESC لفتح أو إغلاق القائمة.'
}
};

const SKINS=[
{id:'emerald',name:'Emerald',color:'#37d67a',accent:'#c9ffe0',cost:0,group:'classic'},
{id:'ocean',name:'Ocean',color:'#35a7ff',accent:'#bfe2ff',cost:120,group:'classic'},
{id:'blaze',name:'Blaze',color:'#ff7849',accent:'#ffd2c2',cost:180,group:'classic'},
{id:'royal',name:'Royal',color:'#a78bfa',accent:'#e7dcff',cost:250,group:'classic'},
{id:'neon',name:'Neon',color:'#22d3ee',accent:'#c5fbff',cost:350,group:'classic'},
{id:'rose',name:'Rose',color:'#fb7185',accent:'#ffd0d8',cost:450,group:'classic'},

{id:'saudi',name:'Saudi Arabia',flag:'🇸🇦',color:'#0b8f47',accent:'#ffffff',cost:500,group:'country',pattern:['#0b8f47','#ffffff']},
{id:'uae',name:'United Arab Emirates',flag:'🇦🇪',color:'#119b52',accent:'#ffffff',cost:420,group:'country',pattern:['#d71920','#ffffff','#000000','#119b52']},
{id:'kuwait',name:'Kuwait',flag:'🇰🇼',color:'#159447',accent:'#ffffff',cost:420,group:'country',pattern:['#159447','#ffffff','#ce1126','#111111']},
{id:'qatar',name:'Qatar',flag:'🇶🇦',color:'#8a1538',accent:'#ffffff',cost:420,group:'country',pattern:['#8a1538','#ffffff']},
{id:'bahrain',name:'Bahrain',flag:'🇧🇭',color:'#ce1126',accent:'#ffffff',cost:420,group:'country',pattern:['#ce1126','#ffffff']},
{id:'oman',name:'Oman',flag:'🇴🇲',color:'#d62828',accent:'#ffffff',cost:420,group:'country',pattern:['#d62828','#ffffff','#16843d']},
{id:'egypt',name:'Egypt',flag:'🇪🇬',color:'#ce1126',accent:'#ffffff',cost:420,group:'country',pattern:['#ce1126','#ffffff','#111111']},
{id:'usa',name:'United States',flag:'🇺🇸',color:'#3c3b6e',accent:'#ffffff',cost:450,group:'country',pattern:['#b22234','#ffffff','#3c3b6e']},
{id:'uk',name:'United Kingdom',flag:'🇬🇧',color:'#21468b',accent:'#ffffff',cost:450,group:'country',pattern:['#21468b','#ffffff','#cf142b']},
{id:'france',name:'France',flag:'🇫🇷',color:'#0055a4',accent:'#ffffff',cost:420,group:'country',pattern:['#0055a4','#ffffff','#ef4135']},
{id:'germany',name:'Germany',flag:'🇩🇪',color:'#171717',accent:'#ffce00',cost:420,group:'country',pattern:['#171717','#dd0000','#ffce00']},
{id:'japan',name:'Japan',flag:'🇯🇵',color:'#f5f5f5',accent:'#bc002d',cost:420,group:'country',pattern:['#f5f5f5','#bc002d']}
];

const SKIN_BY_ID=Object.fromEntries(SKINS.map(s=>[s.id,s]));

let lang=localStorage.getItem('snakivo_lang')||'en';
let selectedSkin=localStorage.getItem('snakivo_skin')||'emerald';
let unlocked=JSON.parse(localStorage.getItem('snakivo_unlocked')||'["emerald"]');
if(!Array.isArray(unlocked)||!unlocked.includes('emerald'))unlocked=['emerald'];
let coins=Math.max(0,parseInt(localStorage.getItem('snakivo_coins')||'0',10)||0);

let myId=null,world={width:4600,height:4600},state={players:[],foods:[],leaderboard:[]},playing=false,dead=false;
let pointer={x:innerWidth/2,y:innerHeight/2},boost=false,cam={x:2300,y:2300,zoom:1},sound=localStorage.getItem('snakivo_sound')!=='off';
let prevScore=0,lastEatSoundAt=0,rank=0;
const PAID_RESPAWN_COST=75;
let botsEnabled=false;
let rewardedAdsWatched=Math.max(0,parseInt(localStorage.getItem('snakivo_rewarded_ads')||'0',10)||0);
const trails=new Map();

function nextAdCoinReward(){
  return Math.min(100,25+rewardedAdsWatched*10);
}
function updateWatchCoinsUI(){
  if(ui.watchCoinsReward)ui.watchCoinsReward.textContent=`+${nextAdCoinReward()} 🪙`;
}
function completeRewardedAd(action='coins',skinId=null){
  // Demo hook. In production, call this only after an approved rewarded-ad SDK confirms completion.
  rewardedAdsWatched+=1;
  localStorage.setItem('snakivo_rewarded_ads',String(rewardedAdsWatched));
  if(action==='skin' && skinId){
    if(!unlocked.includes(skinId))unlocked.push(skinId);
    selectedSkin=skinId;localStorage.setItem('snakivo_skin',skinId);saveEconomy();renderSkins();
    toast(`🎨 ${I18N[lang].skinUnlocked}`,2500);sfx('reward');
  }else{
    const reward=Math.min(100,25+(rewardedAdsWatched-1)*10);
    coins+=reward;saveEconomy();toast(`▶ ${I18N[lang].adCoinsGranted} +${reward} 🪙`,2600);sfx('reward');
  }
  updateWatchCoinsUI();
}

function updatePaidRespawnUI(){
 if(!ui.payCoinsBtn)return;
 ui.payCoinsText.textContent=I18N[lang].payRespawn.replace('{cost}',PAID_RESPAWN_COST);
 const canPay=coins>=PAID_RESPAWN_COST;
 ui.payCoinsBtn.disabled=!canPay;
 ui.payCoinsBtn.classList.toggle('disabled',!canPay);
 ui.payCoinsBtn.title=canPay?'':I18N[lang].notEnoughRespawn;
}

function saveEconomy(){
 localStorage.setItem('snakivo_coins',String(coins));
 localStorage.setItem('snakivo_unlocked',JSON.stringify(unlocked));
 updateCoinUI();
}
function updateCoinUI(){ui.coinTop.textContent=coins;ui.coinMenu.textContent=coins;updatePaidRespawnUI()}
function todayKey(){return new Date().toISOString().slice(0,10)}
function dailyAvailable(){return localStorage.getItem('snakivo_daily')!==todayKey()}
function renderDaily(){
 const available=dailyAvailable();
 ui.dailyBtn.classList.toggle('claimed',!available);
 ui.dailyStatus.textContent=available?I18N[lang].claim:I18N[lang].claimed;
}
ui.dailyBtn.onclick=()=>{
 if(!dailyAvailable())return;
 coins+=100;localStorage.setItem('snakivo_daily',todayKey());saveEconomy();renderDaily();
 toast(`🎁 ${I18N[lang].dailyClaimed} +100 🪙`,3000);sfx('reward');
};

function applyLang(){
 const d=I18N[lang];document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
 document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=d[el.dataset.i18n]||el.textContent);
 document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>el.placeholder=d[el.dataset.i18nPlaceholder]||el.placeholder);
 ui.lang.textContent=lang==='en'?'العربية':'English';localStorage.setItem('snakivo_lang',lang);
 renderLB(state.leaderboard);renderSkins();renderDaily();updatePaidRespawnUI();updateWatchCoinsUI();
}
function skinCard(s){
  const owned=unlocked.includes(s.id),sel=s.id===selectedSkin;
  if(owned){
    return `<div class="skinWrap ${s.id==='saudi'?'saudiWrap':''}">
      <button class="skin selectedSkinBtn ${sel?'selected':''} owned" data-skin="${s.id}" title="${s.name}" style="--skin:${s.color};--accent:${s.accent}">
        <span>${s.flag||''}</span>
      </button>
      <small>${s.flag||''} ${s.name}</small>
    </div>`;
  }
  return `<div class="skinWrap ${s.id==='saudi'?'saudiWrap':''}">
    <button class="skin buySkinBtn locked" data-skin="${s.id}" title="${s.name}" style="--skin:${s.color};--accent:${s.accent}">
      <span>${s.flag||''}</span><em>🪙${s.cost}</em>
    </button>
    <button class="skinAdBtn" data-adskin="${s.id}" title="${I18N[lang].unlockAd}">▶</button>
    <small>${s.flag||''} ${s.name}</small>
  </div>`;
}
function renderSkins(){
 const classics=SKINS.filter(s=>s.group==='classic');
 const countries=SKINS.filter(s=>s.group==='country');

 ui.skins.innerHTML=`
   <div class="skinSection">
     <div class="skinSectionTitle">🎨 ${I18N[lang].classicSkins}</div>
     <div class="skinGrid">${classics.map(skinCard).join('')}</div>
   </div>
   <div class="skinSection countrySection">
     <div class="skinSectionTitle">🌍 ${I18N[lang].countrySkins}</div>
     <div class="saudiSpecialLabel">🇸🇦 ${I18N[lang].saudiSpecial}</div>
     <div class="skinGrid">${countries.map(skinCard).join('')}</div>
   </div>`;

 ui.skins.querySelectorAll('.selectedSkinBtn').forEach(b=>b.onclick=()=>{
   selectedSkin=b.dataset.skin;localStorage.setItem('snakivo_skin',selectedSkin);renderSkins();sfx('click');
 });
 ui.skins.querySelectorAll('.buySkinBtn').forEach(b=>b.onclick=()=>{
   const id=b.dataset.skin,s=SKINS.find(x=>x.id===id);
   if(coins>=s.cost){
     coins-=s.cost;unlocked.push(id);selectedSkin=id;localStorage.setItem('snakivo_skin',id);saveEconomy();renderSkins();
     toast(`🎨 ${I18N[lang].skinUnlocked} ${s.flag||''} ${s.name}`,2500);sfx('reward');
   }else{toast(`🪙 ${I18N[lang].needCoins} — ${s.cost}`,2200);sfx('error')}
 });
 ui.skins.querySelectorAll('.skinAdBtn').forEach(b=>b.onclick=()=>{
   const id=b.dataset.adskin;
   toast(I18N[lang].adPlaceholder,1000);
   setTimeout(()=>completeRewardedAd('skin',id),450);
 });
 const current=SKINS.find(x=>x.id===selectedSkin);
 ui.skinHint.textContent=current?`${current.flag||''} ${current.name}`:'';
}
applyLang();updateCoinUI();
ui.lang.onclick=()=>{lang=lang==='en'?'ar':'en';applyLang()};
ui.sound.textContent=sound?'🔊':'🔇';
ui.sound.onclick=()=>{sound=!sound;localStorage.setItem('snakivo_sound',sound?'on':'off');ui.sound.textContent=sound?'🔊':'🔇';if(sound)sfx('click')};
ui.botsToggle.checked=false;
ui.botsToggle.onchange=()=>{botsEnabled=!!ui.botsToggle.checked;sfx('click')};
ui.watchCoinsBtn.onclick=()=>{
  toast(I18N[lang].adPlaceholder,1000);
  setTimeout(()=>completeRewardedAd('coins'),450);
};
updateWatchCoinsUI();

let audioCtx=null;
function audio(){
 if(!sound)return null;
 if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();
 if(audioCtx.state==='suspended')audioCtx.resume();
 return audioCtx;
}
function beep(freq=440,dur=.08,type='sine',gain=.035,slide=0){
 const ac=audio();if(!ac)return;
 const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(freq,ac.currentTime);
 if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,freq+slide),ac.currentTime+dur);
 g.gain.setValueAtTime(gain,ac.currentTime);g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+dur);
 o.connect(g).connect(ac.destination);o.start();o.stop(ac.currentTime+dur);
}
function sfx(type){
 if(!sound)return;
 if(type==='eat'){beep(620,.045,'sine',.018,90)}
 else if(type==='rare'){beep(520,.12,'triangle',.04,250);setTimeout(()=>beep(820,.16,'triangle',.04,280),80)}
 else if(type==='kill'){beep(180,.12,'sawtooth',.04,160);setTimeout(()=>beep(360,.09,'square',.025,120),70)}
 else if(type==='death'){beep(230,.3,'sawtooth',.045,-150)}
 else if(type==='reward'){beep(660,.09,'triangle',.035,180);setTimeout(()=>beep(920,.14,'triangle',.04,200),90)}
 else if(type==='error'){beep(150,.12,'square',.025,-40)}
 else if(type==='click'){beep(520,.035,'sine',.012,30)}
}
function toast(msg,duration=2400){ui.toast.textContent=msg;ui.toast.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>ui.toast.classList.remove('show'),duration)}
function banner(msg){ui.eventBanner.textContent=msg;ui.eventBanner.classList.add('show');clearTimeout(banner.t);banner.t=setTimeout(()=>ui.eventBanner.classList.remove('show'),4000)}

let pauseOpen=false;
function openPause(){
 if(!playing||dead)return;
 pauseOpen=true;ui.pauseMenu.classList.remove('hidden');
}
function closePause(){
 pauseOpen=false;ui.pauseMenu.classList.add('hidden');
}
function goHome(){
 socket.emit('leave');
 playing=false;dead=false;pauseOpen=false;boost=false;myId=null;state={players:[],foods:[],leaderboard:[]};trails.clear();
 ui.pauseMenu.classList.add('hidden');ui.death.classList.add('hidden');ui.hud.classList.add('hidden');ui.menu.classList.remove('hidden');
 renderLB([]);drawMini();
}
ui.gameMenuBtn.onclick=openPause;
ui.resumeBtn.onclick=closePause;
ui.homeBtn.onclick=goHome;
ui.pauseSoundBtn.onclick=()=>{ui.sound.click();ui.pauseSoundBtn.firstChild.textContent=sound?'🔊 ':'🔇 '};
ui.pauseLangBtn.onclick=()=>ui.lang.click();

function resize(){
 const dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;
 canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0)
}
addEventListener('resize',resize);resize();

ui.name.value=localStorage.getItem('snakivo_name')||'';
ui.play.onclick=()=>{
 audio();const name=(ui.name.value||'Player').trim().slice(0,18);localStorage.setItem('snakivo_name',name);
 if(!unlocked.includes(selectedSkin))selectedSkin='emerald';
 socket.emit('join',{name,skin:selectedSkin,botsEnabled});playing=true;dead=false;prevScore=0;
 ui.menu.classList.add('hidden');ui.hud.classList.remove('hidden');sfx('click')
};
ui.respawn.onclick=()=>respawn(false);
ui.reward.onclick=()=>{toast(I18N[lang].adPlaceholder);setTimeout(()=>respawn(true),450)};
ui.payCoinsBtn.onclick=()=>{
 if(coins<PAID_RESPAWN_COST){toast(`🪙 ${I18N[lang].notEnoughRespawn}`,2200);sfx('error');return}
 coins-=PAID_RESPAWN_COST;saveEconomy();
 toast(`🪙 -${PAID_RESPAWN_COST}`,1200);sfx('reward');
 setTimeout(()=>respawn(true),180);
};
function respawn(rewarded){
 socket.emit('respawn',{name:ui.name.value,skin:selectedSkin,rewarded,botsEnabled});dead=false;playing=true;prevScore=0;
 ui.death.classList.add('hidden');ui.hud.classList.remove('hidden');sfx('click')
}

socket.on('joined',d=>{myId=d.id;world=d.world});
socket.on('dead',d=>{
 dead=true;playing=false;ui.hud.classList.add('hidden');ui.death.classList.remove('hidden');
 ui.finalScore.textContent=d.score;ui.finalSize.textContent=d.mass;ui.deathText.textContent=d.killer?`${I18N[lang].killedBy}: ${d.killer}`:'';
 const me=state.players.find(p=>p.id===myId);const earned=Math.max(1,Math.floor((d.score||0)/35)+(me?.kills||0)*8);
 coins+=earned;saveEconomy();ui.earnedCoins.textContent=earned;sfx('death')
});
socket.on('gameEvent',e=>{
 if(e.type==='rareSpawn'){banner(`⭐ ${I18N[lang].rareSpawn}`);sfx('rare')}
 if(e.type==='rareEaten'){banner(`👑 ${e.name} ${I18N[lang].rareEaten}`);sfx('rare')}
 if(e.type==='streak'){
   const msg=`🔥 ${e.name}: ${e.streak} ${I18N[lang].killStreak} +${e.bonus||0}`;
   if(e.id===myId){toast(msg,3000);sfx('kill')} else if(e.streak>=4)banner(msg);
 }
});
socket.on('state',s=>{
 state=s;const liveIds=new Set();
 for(const p of s.players){
   liveIds.add(p.id);if(!p.alive)continue;
   let tr=trails.get(p.id);if(!tr){tr=[];trails.set(p.id,tr)}
   const last=tr[tr.length-1];if(!last||Math.hypot(last.x-p.x,last.y-p.y)>4)tr.push({x:p.x,y:p.y});
   const keep=Math.min(620,Math.max(46,Math.floor(50+p.mass*3.1)));if(tr.length>keep)tr.splice(0,tr.length-keep);
 }
 for(const id of trails.keys())if(!liveIds.has(id))trails.delete(id);
 const me=s.players.find(p=>p.id===myId);
 if(me){
   ui.score.textContent=me.score;ui.size.textContent=Math.floor(me.mass);ui.kills.textContent=me.kills||0;ui.streak.textContent=me.streak||0;
   if(me.score>prevScore && Date.now()-lastEatSoundAt>85){sfx('eat');lastEatSoundAt=Date.now()}
   prevScore=me.score;
 }
 rank=(s.leaderboard||[]).findIndex(x=>x.id===myId)+1;
 renderLB(s.leaderboard);drawMini();
});
function renderLB(rows=[]){
 const meRank=rows.findIndex(r=>r.id===myId)+1;
 ui.leaderboard.innerHTML=`<h3>${I18N[lang].leaderboard}${meRank?` <small>• ${I18N[lang].yourRank} #${meRank}</small>`:''}</h3>`+
 rows.map(r=>`<div class="lbRow ${r.id===myId?'me':''}">
 <span class="lbRank">#${r.rank}${r.rank===1?' 👑':''}</span>
 <span class="lbName">${escapeHtml(r.name)}${r.isBot?` <small>${I18N[lang].bot}</small>`:''}</span>
 <span class="lbMass">◉ ${r.mass}</span><span class="lbKills">☠ ${r.kills||0}</span><b>${r.score}</b></div>`).join('');
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function drawMini(){
 if(!world.width||!world.height)return;
 const w=mini.width,h=mini.height;mctx.clearRect(0,0,w,h);
 mctx.fillStyle='rgba(5,16,23,.88)';mctx.fillRect(0,0,w,h);
 mctx.strokeStyle='rgba(255,255,255,.16)';mctx.lineWidth=2;mctx.strokeRect(1,1,w-2,h-2);
 const sxm=w/world.width,sym=h/world.height;
 const event=state.foods.find(f=>f.type==='event');
 if(event){
   const x=event.x*sxm,y=event.y*sym;mctx.fillStyle='#ffe156';mctx.shadowColor='#ffe156';mctx.shadowBlur=12;
   mctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?4:8;mctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}mctx.closePath();mctx.fill();mctx.shadowBlur=0;
 }
 const me=state.players.find(p=>p.id===myId&&p.alive);
 if(me){mctx.fillStyle='#ffffff';mctx.beginPath();mctx.arc(me.x*sxm,me.y*sym,5,0,Math.PI*2);mctx.fill();mctx.strokeStyle=me.color;mctx.lineWidth=2;mctx.stroke()}
}

// Mouse / touch / joystick
addEventListener('mousemove',e=>{pointer.x=e.clientX;pointer.y=e.clientY});
addEventListener('touchmove',e=>{if(!e.target.closest?.('#joystick') && e.touches[0]){pointer.x=e.touches[0].clientX;pointer.y=e.touches[0].clientY}},{passive:true});
addEventListener('keydown',e=>{
 if(e.code==='Escape'){
   e.preventDefault();
   if(pauseOpen)closePause();else openPause();
   return;
 }
 if(e.code==='Space'&&!pauseOpen){e.preventDefault();boost=true}
});
addEventListener('keyup',e=>{if(e.code==='Space')boost=false});
['pointerdown','touchstart'].forEach(ev=>ui.boost.addEventListener(ev,e=>{e.preventDefault();boost=true},{passive:false}));
['pointerup','pointercancel','touchend'].forEach(ev=>ui.boost.addEventListener(ev,e=>{e.preventDefault();boost=false},{passive:false}));

let joyActive=false,joyId=null,joyCenter={x:0,y:0};
function joyStart(e){
 const p=e.touches?e.touches[0]:e;joyActive=true;joyId=p.identifier??null;
 const r=ui.joystick.getBoundingClientRect();joyCenter={x:r.left+r.width/2,y:r.top+r.height/2};joyMove(e)
}
function joyMove(e){
 if(!joyActive)return;let p;
 if(e.touches){p=[...e.touches].find(t=>joyId===null||t.identifier===joyId)||e.touches[0]}else p=e;
 if(!p)return;e.preventDefault();
 let dx=p.clientX-joyCenter.x,dy=p.clientY-joyCenter.y;const max=42,len=Math.hypot(dx,dy)||1;
 if(len>max){dx=dx/len*max;dy=dy/len*max}
 ui.joyKnob.style.transform=`translate(${dx}px,${dy}px)`;
 pointer.x=innerWidth/2+dx*8;pointer.y=innerHeight/2+dy*8;
}
function joyEnd(e){joyActive=false;joyId=null;ui.joyKnob.style.transform='translate(0,0)'}
ui.joystick.addEventListener('touchstart',joyStart,{passive:false});ui.joystick.addEventListener('touchmove',joyMove,{passive:false});ui.joystick.addEventListener('touchend',joyEnd,{passive:false});
ui.joystick.addEventListener('pointerdown',joyStart);addEventListener('pointermove',e=>{if(joyActive&&e.pointerType!=='touch')joyMove(e)});addEventListener('pointerup',joyEnd);

setInterval(()=>{
 if(!playing||dead||pauseOpen)return;
 const angle=Math.atan2(pointer.y-innerHeight/2,pointer.x-innerWidth/2);socket.emit('input',{angle,boost})
},33);

function drawGrid(){
 const step=100*cam.zoom;ctx.strokeStyle='rgba(255,255,255,.035)';ctx.lineWidth=1;
 const ox=((innerWidth/2-cam.x*cam.zoom)%step+step)%step,oy=((innerHeight/2-cam.y*cam.zoom)%step+step)%step;
 for(let x=ox;x<innerWidth;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,innerHeight);ctx.stroke()}
 for(let y=oy;y<innerHeight;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(innerWidth,y);ctx.stroke()}
}
function sx(x){return innerWidth/2+(x-cam.x)*cam.zoom}
function sy(y){return innerHeight/2+(y-cam.y)*cam.zoom}

function drawCountryBodyOverlay(p,tr,bodyW){
 const skin=SKIN_BY_ID[p.skin];
 if(!skin||skin.group!=='country'||tr.length<2)return;
 const colors=skin.pattern||[p.color,p.accent];
 ctx.save();ctx.lineCap='round';ctx.lineJoin='round';
 for(let layer=0;layer<Math.min(colors.length,4);layer++){
   ctx.strokeStyle=colors[layer];
   ctx.lineWidth=Math.max(2,bodyW*(0.28-layer*0.035));
   ctx.setLineDash([Math.max(8,bodyW*.8),Math.max(8,bodyW*.8)]);
   ctx.lineDashOffset=layer*Math.max(8,bodyW*.8);
   ctx.globalAlpha=.92;
   ctx.beginPath();ctx.moveTo(sx(tr[0].x),sy(tr[0].y));
   for(let i=1;i<tr.length;i++)ctx.lineTo(sx(tr[i].x),sy(tr[i].y));
   ctx.stroke();
 }
 ctx.restore();
}

function drawSaudiEmblem(headR){
 // Stylized palm tree and crossed swords, drawn in white.
 ctx.save();
 ctx.strokeStyle='#ffffff';ctx.fillStyle='#ffffff';
 ctx.lineWidth=Math.max(1.4,headR*.09);ctx.lineCap='round';

 // palm trunk
 ctx.beginPath();ctx.moveTo(0,-headR*.28);ctx.lineTo(0,headR*.10);ctx.stroke();

 // palm fronds
 const fy=-headR*.30;
 for(const a of [-2.75,-2.35,-1.95,-1.19,-.79,-.39]){
   ctx.beginPath();ctx.moveTo(0,fy);ctx.lineTo(Math.cos(a)*headR*.34,fy+Math.sin(a)*headR*.20);ctx.stroke();
 }

 // two crossed swords below palm
 ctx.lineWidth=Math.max(1.2,headR*.07);
 ctx.beginPath();
 ctx.moveTo(-headR*.40,headR*.34);ctx.lineTo(headR*.40,headR*.12);
 ctx.moveTo(-headR*.40,headR*.12);ctx.lineTo(headR*.40,headR*.34);
 ctx.stroke();

 // sword tips
 ctx.beginPath();
 ctx.moveTo(headR*.40,headR*.12);ctx.lineTo(headR*.31,headR*.08);
 ctx.moveTo(headR*.40,headR*.34);ctx.lineTo(headR*.31,headR*.38);
 ctx.stroke();
 ctx.restore();
}

function drawCountryHeadMark(p,headR){
 const skin=SKIN_BY_ID[p.skin];
 if(!skin||skin.group!=='country')return;
 if(p.skin==='saudi'){drawSaudiEmblem(headR);return;}

 // Compact flag-inspired mark for other country skins.
 const cols=skin.pattern||[p.color,p.accent];
 const w=headR*.78,h=headR*.52;
 ctx.save();ctx.translate(-headR*.18,0);
 ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,Math.max(2,headR*.08));ctx.clip();
 const stripeH=h/cols.length;
 cols.forEach((c,i)=>{ctx.fillStyle=c;ctx.fillRect(-w/2,-h/2+i*stripeH,w,stripeH+1)});
 ctx.restore();
}
function frame(){
 requestAnimationFrame(frame);ctx.clearRect(0,0,innerWidth,innerHeight);
 const g=ctx.createRadialGradient(innerWidth*.5,innerHeight*.45,50,innerWidth*.5,innerHeight*.5,Math.max(innerWidth,innerHeight));
 g.addColorStop(0,'#102733');g.addColorStop(1,'#061019');ctx.fillStyle=g;ctx.fillRect(0,0,innerWidth,innerHeight);drawGrid();
 const me=state.players.find(p=>p.id===myId);
 if(me){cam.x+=(me.x-cam.x)*.12;cam.y+=(me.y-cam.y)*.12;const target=Math.max(.48,Math.min(1,1-(me.r-20)/250));cam.zoom+=(target-cam.zoom)*.06}
 ctx.save();ctx.strokeStyle='rgba(109,229,167,.18)';ctx.lineWidth=4;ctx.strokeRect(sx(0),sy(0),world.width*cam.zoom,world.height*cam.zoom);ctx.restore();

 for(const f of state.foods){
   const x=sx(f.x),y=sy(f.y),r=f.r*cam.zoom;if(x<-60||y<-60||x>innerWidth+60||y>innerHeight+60)continue;
   const event=f.type==='event',rare=event||f.type==='legendary'||f.type==='large';
   ctx.save();ctx.beginPath();ctx.fillStyle=event?'#ffe156':f.type==='legendary'?'#ffd84d':`hsl(${f.hue} 85% 62%)`;
   ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=(f.glow||10)*cam.zoom;ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
   if(rare){
     ctx.strokeStyle=event?'rgba(255,235,120,.95)':'rgba(255,255,255,.78)';ctx.lineWidth=Math.max(1.5,2.2*cam.zoom);
     ctx.beginPath();ctx.arc(x,y,r*(event?1.75:1.45),0,Math.PI*2);ctx.stroke();
     if(event){ctx.strokeStyle='rgba(255,225,86,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r*2.35,0,Math.PI*2);ctx.stroke()}
     ctx.fillStyle='#fff';ctx.font=`700 ${Math.max(9,12*cam.zoom)}px system-ui`;ctx.textAlign='center';ctx.fillText(event?'★':'•',x,y+4*cam.zoom)
   }ctx.restore();
 }

 const king=state.leaderboard?.[0]?.id;
 for(const p of state.players){
   if(!p.alive)continue;
   const x=sx(p.x),y=sy(p.y),headR=Math.max(10,(13+Math.sqrt(Math.max(0,p.mass))*.75)*cam.zoom);
   if(x<-260||y<-260||x>innerWidth+260||y>innerHeight+260)continue;
   const tr=trails.get(p.id)||[],bodyW=Math.max(10,(15+Math.sqrt(Math.max(0,p.mass))*.62)*cam.zoom);
   if(tr.length>2){
     ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=p.color;ctx.lineWidth=bodyW;ctx.shadowColor=p.color;ctx.shadowBlur=p.id===myId?20:9;ctx.beginPath();
     ctx.moveTo(sx(tr[0].x),sy(tr[0].y));for(let i=1;i<tr.length;i++)ctx.lineTo(sx(tr[i].x),sy(tr[i].y));ctx.stroke();ctx.shadowBlur=0;
     ctx.strokeStyle=p.accent||'rgba(255,255,255,.45)';ctx.globalAlpha=.38;ctx.lineWidth=Math.max(2,bodyW*.17);ctx.stroke();ctx.restore();
     drawCountryBodyOverlay(p,tr,bodyW);
   }
   ctx.save();ctx.translate(x,y);ctx.rotate(p.angle);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=p.id===myId?22:11;
   ctx.beginPath();ctx.ellipse(0,0,headR*1.12,headR*.92,0,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
   drawCountryHeadMark(p,headR);
   if(p.boost){ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(-headR*(1.2+i*.35),-headR*.5);ctx.lineTo(-headR*(1.8+i*.4),-headR*.5);ctx.stroke()}}
   ctx.fillStyle='#f4fbff';ctx.beginPath();ctx.arc(headR*.38,-headR*.3,Math.max(2.6,headR*.18),0,Math.PI*2);ctx.arc(headR*.38,headR*.3,Math.max(2.6,headR*.18),0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#07131a';ctx.beginPath();ctx.arc(headR*.46,-headR*.3,Math.max(1.6,headR*.09),0,Math.PI*2);ctx.arc(headR*.46,headR*.3,Math.max(1.6,headR*.09),0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='#ff6b7d';ctx.lineWidth=Math.max(1.5,2*cam.zoom);ctx.beginPath();ctx.moveTo(headR*.95,0);ctx.lineTo(headR*1.35,0);
   ctx.moveTo(headR*1.35,0);ctx.lineTo(headR*1.58,-headR*.14);ctx.moveTo(headR*1.35,0);ctx.lineTo(headR*1.58,headR*.14);ctx.stroke();
   if(p.inv){ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,headR*1.45,0,Math.PI*2);ctx.stroke()}ctx.restore();

   ctx.font='700 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(`${p.id===king?'👑 ':''}${p.name}${p.isBot?' • BOT':''}`,x,y-headR-12);
   if((p.streak||0)>=3){ctx.font='800 10px system-ui';ctx.fillStyle='#ffcd57';ctx.fillText(`🔥 x${p.streak}`,x,y-headR-27)}
 }
}
frame();

const socket=io();
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const mini=document.getElementById('minimap'),mctx=mini.getContext('2d');

const ui={
menu:document.getElementById('menu'),death:document.getElementById('death'),hud:document.getElementById('hud'),
play:document.getElementById('playBtn'),respawn:document.getElementById('respawnBtn'),reward:document.getElementById('rewardBtn'),reviveAd:document.getElementById('reviveAdBtn'),
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
pauseSoundBtn:document.getElementById('pauseSoundBtn'),pauseLangBtn:document.getElementById('pauseLangBtn'),
rankBadge:document.getElementById('rankBadge'),missionList:document.getElementById('missionList'),eventStatus:document.getElementById('eventStatus'),eventStatusHud:document.getElementById('eventStatusHud'),missionsPanel:document.getElementById('missionsPanel')
};

// Snakivo v1.6.2 mobile control side
const CONTROL_SIDE_KEY='snakivo-control-side';
function applyControlSide(side){
 side=side==='left'?'left':'right';
 document.documentElement.dataset.controlSide=side;
 try{localStorage.setItem(CONTROL_SIDE_KEY,side)}catch{}
 document.querySelectorAll('[data-control-side]').forEach(btn=>{
   const active=btn.dataset.controlSide===side;
   btn.classList.toggle('active',active);
   btn.setAttribute('aria-pressed',active?'true':'false');
 });
}
document.querySelectorAll('[data-control-side]').forEach(btn=>btn.addEventListener('click',()=>applyControlSide(btn.dataset.controlSide)));
let savedControlSide='right';
try{savedControlSide=localStorage.getItem(CONTROL_SIDE_KEY)||'right'}catch{}
applyControlSide(savedControlSide);


const I18N={
en:{
tagline:'Eat. Grow. Hunt. Become the king.',nickname:'Your nickname',play:'PLAY NOW',realtime:'Realtime',
controls:'Move your mouse or finger to steer. Hunt smaller snakes, chase rare food, and boost with SPACE.',
score:'Score',size:'Size',kills:'Kills',streak:'Streak',boostTip:'Hold SPACE or press BOOST',boost:'BOOST',
eliminated:'Eliminated!',respawn:'RESPAWN',reward:'WATCH AD & RESPAWN BIGGER',adDemo:'Rewarded-ad hook ready for an approved ad provider.',
leaderboard:'Leaderboard',killedBy:'Eliminated by',adPlaceholder:'Demo reward granted. Connect an approved rewarded-ad SDK before production.',
chooseSkin:'Choose your skin',rareSpawn:'GOLDEN FOOD SPAWNED!',rareEaten:'claimed the Golden Food!',boostSpawn:'BOOST FOOD SPAWNED!',boostEaten:'BOOST CHARGE +1!',killStreak:'KILL STREAK',
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
chooseSkin:'اختر شكل الحيّة',rareSpawn:'ظهر الطعام الذهبي النادر!',rareEaten:'حصل على الطعام الذهبي!',boostSpawn:'ظهر طعام السرعة!',boostEaten:'تمت إضافة شحنة سرعة +1!',killStreak:'سلسلة إقصاءات',
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
let pointer={x:innerWidth/2,y:innerHeight/2},boost=false,boostCharges=0,cam={x:2300,y:2300,zoom:1},sound=localStorage.getItem('snakivo_sound')!=='off';
const FPS_KEY='snakivo_fps';
let targetFps=localStorage.getItem(FPS_KEY)==='30'?30:60;
let lastFrameAt=0;
let prevScore=0,lastEatSoundAt=0,rank=0;
let sessionStartedAt=0,sessionTopSeconds=0,missionState=null,liveEvent=null;
const V2_MISSIONS=[
 {id:'score',icon:'🎯',name:'Reach 1,000 Score',target:1000,reward:75},
 {id:'kills',icon:'⚔️',name:'Get 3 Kills',target:3,reward:100},
 {id:'boosts',icon:'⚡',name:'Use Boost 3 Times',target:3,reward:60},
 {id:'top1',icon:'👑',name:'Reach #1',target:1,reward:120},
 {id:'survive',icon:'⏱️',name:'Survive 2 Minutes',target:120,reward:90}
];
function v2Rank(score){
 const ranks=[['Bronze',0],['Silver',500],['Gold',1500],['Platinum',3500],['Diamond',7000],['King',12000]];
 let r=ranks[0];for(const x of ranks)if(score>=x[1])r=x;return r[0];
}
function v2Today(){return new Date().toISOString().slice(0,10)}
function v2LoadMissions(){
 const key='snakivo_v2_missions';
 let raw=null;try{raw=JSON.parse(localStorage.getItem(key)||'null')}catch{}
 if(!raw||raw.date!==v2Today()){
   const shuffled=[...V2_MISSIONS].sort(()=>Math.random()-.5).slice(0,3);
   missionState={date:v2Today(),missions:shuffled.map(m=>({...m,progress:0,claimed:false}))};
   localStorage.setItem(key,JSON.stringify(missionState));
 }else missionState=raw;
}
function v2SaveMissions(){try{localStorage.setItem('snakivo_v2_missions',JSON.stringify(missionState))}catch{}}
function v2MissionProgress(id,progress){
 if(!missionState)return;
 const m=missionState.missions.find(x=>x.id===id);if(!m||m.claimed)return;
 const next=Math.max(m.progress,Math.min(m.target,Math.floor(progress)));
 if(next===m.progress)return;
 m.progress=next;v2SaveMissions();v2RenderMissions();
}
function v2RenderMissions(){
 if(!ui.missionList||!missionState)return;
 ui.missionList.innerHTML=missionState.missions.map(m=>{
   const done=m.progress>=m.target;
   return '<div class="v2Mission '+(done?'done':'')+'"><div><b>'+m.icon+' '+escapeHtml(m.name)+'</b><small>'+m.progress+' / '+m.target+' • 🪙 '+m.reward+'</small></div><button data-mission="'+m.id+'" '+(done&&!m.claimed?'':'disabled')+'>'+ (m.claimed?'CLAIMED':done?'CLAIM':'IN PROGRESS') +'</button></div>';
 }).join('');
 ui.missionList.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>{
   const m=missionState.missions.find(x=>x.id===b.dataset.mission);
   if(!m||m.claimed||m.progress<m.target)return;
   m.claimed=true;coins+=m.reward;saveEconomy();v2SaveMissions();v2RenderMissions();
   toast('🎯 Mission complete! +'+m.reward+' 🪙',2600);sfx('reward');
 });
}
function v2Update(){
 if(!playing||dead)return;
 const me=state.players.find(p=>p.id===myId);
 if(!me)return;
 v2MissionProgress('score',me.score);
 v2MissionProgress('kills',me.kills||0);
 if(rank===1){sessionTopSeconds=Math.min(120,sessionTopSeconds+1);v2MissionProgress('top1',1)}
 if(sessionStartedAt){const sec=Math.floor((Date.now()-sessionStartedAt)/1000);v2MissionProgress('survive',sec)}
 if(ui.rankBadge)ui.rankBadge.textContent='🏆 '+v2Rank(me.score);
}
function v2UpdateEvent(e){
 const labels=[ui.eventStatus,ui.eventStatusHud].filter(Boolean);
 if(!labels.length)return;
 if(e&&e.type==='golden_zone'){
   liveEvent=e;
   labels.forEach(el=>{el.textContent='🌟 GOLDEN ZONE ACTIVE';el.classList.add('active')});
 }else if(e&&e.type==='end'){
   liveEvent=null;labels.forEach(el=>{el.textContent='';el.classList.remove('active')});
 }
}
v2LoadMissions();
const PAID_RESPAWN_COST=75;
let botsEnabled=false;
let rewardedAdsWatched=Math.max(0,parseInt(localStorage.getItem('snakivo_rewarded_ads')||'0',10)||0);
const trails=new Map();
const renderPos=new Map();

// SNAKIVO_V1_9_2_UNIFIED: audio transitions + ad hooks
let lastBoostAudioActive=false,lastRankForAudio=0,lastDeathMass=10,lastDeathScore=0;
let interstitialDeathCount=Math.max(0,parseInt(localStorage.getItem('snakivo_interstitial_deaths')||'0',10)||0);

function rewardedProviderReady(){return !!(window.SnakivoRewardedAds&&typeof window.SnakivoRewardedAds.show==='function')}
function showRewardedAd(placement,onReward){
  const finish=()=>{try{onReward&&onReward()}catch(e){console.error(e)}};
  if(rewardedProviderReady()){
    Promise.resolve(window.SnakivoRewardedAds.show({placement})).then(result=>{
      if(result===true||result?.completed===true||result?.rewarded===true)finish();
      else toast(lang==='ar'?'لم يكتمل الإعلان، لم تُمنح المكافأة.':'Ad not completed — no reward granted.',2200);
    }).catch(()=>toast(lang==='ar'?'تعذر تشغيل الإعلان الآن.':'Ad unavailable right now.',2200));
    return;
  }
  const localDemo=location.hostname==='localhost'||location.hostname==='127.0.0.1';
  if(localDemo){toast('LOCAL DEMO • rewarded ad',700);setTimeout(finish,500);return}
  toast(lang==='ar'?'إعلان المكافأة غير مربوط بعد.':'Rewarded ad provider is not connected yet.',2400);
}
function maybeShowInterstitial(){
  interstitialDeathCount++;localStorage.setItem('snakivo_interstitial_deaths',String(interstitialDeathCount));
  if(interstitialDeathCount%3!==0)return;
  const p=window.SnakivoInterstitialAds;
  if(p&&typeof p.show==='function'){try{p.show({placement:'post_game_every_3_deaths'})}catch{}}
}


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

function updateBoostUI(){
   const boostTip=document.querySelector('.boostTip');
  const me=state.players.find(p=>p.id===myId&&p.alive);
  boostCharges=me?.boostCharges||0;
  const active=!!me?.boostActive;
  if(active!==lastBoostAudioActive){if(active)sfx('boostStart');else if(lastBoostAudioActive)sfx('boostEnd');lastBoostAudioActive=active}
  if(!ui.boost)return;
  ui.boost.textContent=active?'BOOSTING!':(boostCharges>0?'BOOST READY ('+boostCharges+')':'FIND BOOST FOOD');
  ui.boost.classList.toggle('boostReady',boostCharges>0&&!active);
  ui.boost.style.display=(boostCharges>0||active)?'flex':'none';
   if(boostTip)boostTip.style.display=(boostCharges>0||active)?'block':'none';
ui.boost.classList.toggle('boostActive',active);
  ui.boost.disabled=boostCharges<=0&&!active;
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
   showRewardedAd('skin_unlock',()=>completeRewardedAd('skin',id));
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
  showRewardedAd('coins_reward',()=>completeRewardedAd('coins'));
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
 const ac=audio();if(!ac)return;
 const now=ac.currentTime;
 const tone=(freq,dur,opt={})=>{
   const o=ac.createOscillator(),gn=ac.createGain(),f=ac.createBiquadFilter();
   o.type=opt.type||'sine';o.frequency.setValueAtTime(freq,now+(opt.delay||0));
   if(opt.to)o.frequency.exponentialRampToValueAtTime(Math.max(40,opt.to),now+(opt.delay||0)+dur);
   f.type='lowpass';f.frequency.value=opt.cut||5000;
   const st=now+(opt.delay||0),vol=opt.gain||.02;
   gn.gain.setValueAtTime(.0001,st);gn.gain.exponentialRampToValueAtTime(vol,st+.008);gn.gain.exponentialRampToValueAtTime(.0001,st+dur);
   o.connect(f).connect(gn).connect(ac.destination);o.start(st);o.stop(st+dur+.02);
 };
 const noise=(dur=.07,gain=.008,delay=0)=>{
   const len=Math.max(1,Math.floor(ac.sampleRate*dur)),buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);
   const src=ac.createBufferSource(),gn=ac.createGain(),f=ac.createBiquadFilter();src.buffer=buf;f.type='bandpass';f.frequency.value=1700;f.Q.value=.8;
   const st=now+delay;gn.gain.setValueAtTime(gain,st);gn.gain.exponentialRampToValueAtTime(.0001,st+dur);src.connect(f).connect(gn).connect(ac.destination);src.start(st);
 };
 if(type==='eat'){tone(520,.052,{to:760,gain:.014,type:'sine'});tone(980,.034,{gain:.006,delay:.012,type:'triangle'});}
 else if(type==='rare'){tone(440,.11,{to:690,gain:.025,type:'triangle'});tone(660,.13,{to:990,gain:.020,delay:.07,type:'sine'});tone(880,.15,{to:1320,gain:.014,delay:.14,type:'triangle'});}
 else if(type==='kill'){tone(150,.12,{to:270,gain:.027,type:'sawtooth',cut:1800});noise(.08,.010,.03);tone(420,.09,{to:620,gain:.013,delay:.08,type:'square'});}
 else if(type==='death'){tone(310,.34,{to:95,gain:.026,type:'sawtooth',cut:1400});tone(155,.40,{to:70,gain:.018,delay:.04,type:'triangle'});noise(.18,.007,.02);}
 else if(type==='reward'){tone(660,.075,{to:820,gain:.018,type:'triangle'});tone(880,.10,{to:1100,gain:.018,delay:.075,type:'triangle'});tone(1180,.12,{to:1450,gain:.014,delay:.16,type:'sine'});}
 else if(type==='boostStart'||type==='boost'){tone(180,.18,{to:520,gain:.020,type:'sawtooth',cut:2400});noise(.12,.006);}
 else if(type==='boostEnd'){tone(430,.16,{to:190,gain:.014,type:'triangle'});}
 else if(type==='top10'){tone(523,.09,{gain:.015,type:'triangle'});tone(659,.10,{gain:.015,delay:.08,type:'triangle'});tone(784,.12,{gain:.016,delay:.16,type:'triangle'});}
 else if(type==='king'){tone(523,.09,{gain:.018,type:'triangle'});tone(659,.09,{gain:.018,delay:.07,type:'triangle'});tone(784,.09,{gain:.018,delay:.14,type:'triangle'});tone(1047,.18,{gain:.022,delay:.21,type:'sine'});}
 else if(type==='revive'){tone(260,.12,{to:520,gain:.018,type:'triangle'});tone(520,.16,{to:880,gain:.018,delay:.10,type:'sine'});}
 else if(type==='error'){tone(170,.12,{to:120,gain:.014,type:'square',cut:900});}
 else if(type==='click'){tone(560,.028,{to:610,gain:.006,type:'sine'});}
}

// v1.9.5 separate background music system (procedural, no external audio files)
let musicOn=localStorage.getItem('snakivo_music')!=='off',musicTimer=null,musicStep=0,musicMode='menu';
function musicTick(){
 if(!musicOn)return;const ac=audio();if(!ac)return;
 const menuSeq=[220,277.18,329.63,415.30,329.63,277.18,246.94,329.63];
 const gameSeq=[164.81,220,246.94,329.63,220,277.18,246.94,196];
 const seq=musicMode==='game'?gameSeq:menuSeq,f=seq[musicStep++%seq.length],now=ac.currentTime;
 const o=ac.createOscillator(),g2=ac.createGain(),flt=ac.createBiquadFilter();o.type='triangle';o.frequency.value=f;flt.type='lowpass';flt.frequency.value=1050;
 g2.gain.setValueAtTime(.0001,now);g2.gain.exponentialRampToValueAtTime(musicMode==='game'?.010:.008,now+.03);g2.gain.exponentialRampToValueAtTime(.0001,now+.42);
 o.connect(flt).connect(g2).connect(ac.destination);o.start(now);o.stop(now+.45);
 if(musicStep%4===1){const b=ac.createOscillator(),bg=ac.createGain();b.type='sine';b.frequency.value=f/2;bg.gain.setValueAtTime(.006,now);bg.gain.exponentialRampToValueAtTime(.0001,now+.55);b.connect(bg).connect(ac.destination);b.start(now);b.stop(now+.58)}
}
function startMusic(mode=musicMode){musicMode=mode;if(!musicOn)return;audio();if(!musicTimer){musicTick();musicTimer=setInterval(musicTick,musicMode==='game'?360:430)}}
function stopMusic(){if(musicTimer){clearInterval(musicTimer);musicTimer=null}}
function setMusicMode(mode){musicMode=mode;stopMusic();if(musicOn)startMusic(mode)}
function installMusicButton(){
 if(document.getElementById('musicBtn'))return;
 const b=document.createElement('button');b.id='musicBtn';b.className='iconBtn';b.type='button';b.setAttribute('aria-label','Music');
 b.textContent=musicOn?'🎵':'🚫🎵';b.title='Music';b.onclick=()=>{musicOn=!musicOn;localStorage.setItem('snakivo_music',musicOn?'on':'off');b.textContent=musicOn?'🎵':'🚫🎵';if(musicOn){startMusic(playing?'game':'menu');sfx('click')}else stopMusic()};
 if(ui.sound&&ui.sound.parentElement)ui.sound.parentElement.insertBefore(b,ui.sound.nextSibling);
}
installMusicButton();
document.addEventListener('pointerdown',()=>{if(musicOn&&!musicTimer)startMusic(playing?'game':'menu')},{once:true});
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
 setMusicMode('menu');
 socket.emit('leave');
 playing=false;dead=false;pauseOpen=false;boost=false;myId=null;state={players:[],foods:[],leaderboard:[]};trails.clear();
 ui.pauseMenu.classList.add('hidden');ui.death.classList.add('hidden');ui.hud.classList.add('hidden');ui.menu.classList.remove('hidden');
 renderLB([]);v2DrawLiveZone();drawMini();
}
ui.gameMenuBtn.onclick=openPause;
ui.resumeBtn.onclick=closePause;
ui.homeBtn.onclick=goHome;
ui.pauseSoundBtn.onclick=()=>{ui.sound.click();ui.pauseSoundBtn.firstChild.textContent=sound?'🔊 ':'🔇 '};
ui.pauseLangBtn.onclick=()=>ui.lang.click();

// Frame-rate setting: 60 FPS by default, with a 30 FPS battery/performance option.
function applyFps(value){
 targetFps=value===30?30:60;
 try{localStorage.setItem(FPS_KEY,String(targetFps))}catch{}
 document.querySelectorAll('[data-fps]').forEach(btn=>{
   const active=Number(btn.dataset.fps)===targetFps;
   btn.classList.toggle('active',active);
   btn.setAttribute('aria-pressed',active?'true':'false');
   btn.textContent=(active?'✓ ':'')+btn.dataset.fps+' FPS';
   btn.style.fontWeight=active?'800':'600';
   btn.style.border=active?'2px solid currentColor':'1px solid rgba(255,255,255,.25)';
   btn.style.boxShadow=active?'0 0 0 3px rgba(255,255,255,.12)':'none';
   btn.style.opacity=active?'1':'.72';
   btn.style.transform=active?'scale(1.03)':'scale(1)';
 });
}
function installFpsSetting(){
 if(!ui.pauseMenu||ui.pauseMenu.querySelector('[data-fps-setting]'))return;
 const row=document.createElement('div');
 row.dataset.fpsSetting='1';
 row.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:12px;margin:10px 0;flex-wrap:wrap';
 const label=document.createElement('span');
 label.textContent=lang==='ar'?'عدد الإطارات':'Frame Rate';
 label.dataset.fpsLabel='1';
 const controls=document.createElement('div');
 controls.style.cssText='display:flex;gap:8px';
 [30,60].forEach(fps=>{
   const b=document.createElement('button');
   b.type='button';b.dataset.fps=String(fps);b.textContent=fps+' FPS';
   b.style.cssText='padding:8px 12px;border-radius:10px;cursor:pointer';
   b.onclick=()=>{applyFps(fps);sfx('click')};controls.appendChild(b);
 });
 row.append(label,controls);
 const anchor=ui.pauseLangBtn?.parentElement;
 if(anchor&&anchor.parentElement)anchor.parentElement.insertBefore(row,anchor.nextSibling);else ui.pauseMenu.appendChild(row);
 applyFps(targetFps);
}
installFpsSetting();
const _applyLang=applyLang;
applyLang=function(){_applyLang();const label=document.querySelector('[data-fps-label]');if(label)label.textContent=lang==='ar'?'عدد الإطارات':'Frame Rate'};


function resize(){
 const dpr=Math.min(devicePixelRatio||1,2);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;
 canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0)
}
addEventListener('resize',resize);resize();

ui.name.value=localStorage.getItem('snakivo_name')||'';
ui.play.onclick=()=>{
 audio();setMusicMode('game');const name=(ui.name.value||'Player').trim().slice(0,18);localStorage.setItem('snakivo_name',name);
 if(!unlocked.includes(selectedSkin))selectedSkin='emerald';
 socket.emit('join',{name,skin:selectedSkin,botsEnabled});playing=true;dead=false;prevScore=0;sessionStartedAt=Date.now();sessionTopSeconds=0;v2RenderMissions();
 ui.menu.classList.add('hidden');ui.hud.classList.remove('hidden');sfx('click')
};
ui.respawn.onclick=()=>respawn('normal');
if(ui.reviveAd)ui.reviveAd.onclick=()=>showRewardedAd('death_revive',()=>{sfx('revive');respawn('revive')});
ui.reward.onclick=()=>showRewardedAd('death_start_big',()=>{sfx('reward');respawn('startBig')});
ui.payCoinsBtn.onclick=()=>{
 if(coins<PAID_RESPAWN_COST){toast(`🪙 ${I18N[lang].notEnoughRespawn}`,2200);sfx('error');return}
 coins-=PAID_RESPAWN_COST;saveEconomy();
 toast(`🪙 -${PAID_RESPAWN_COST}`,1200);sfx('reward');
 setTimeout(()=>respawn('startBig'),180);
};
function respawn(mode='normal'){
 const rewarded=mode!=='normal';
 socket.emit('respawn',{name:ui.name.value,skin:selectedSkin,rewarded,mode,botsEnabled});dead=false;playing=true;prevScore=0;lastRankForAudio=0;
 ui.death.classList.add('hidden');ui.hud.classList.remove('hidden');sfx('click')
}

socket.on('joined',d=>{myId=d.id;world=d.world});
socket.on('dead',d=>{
 setMusicMode('menu');
  if(d?.killer){ toast('Eliminated by '+d.killer+(d.killerMass!=null?' • Size '+d.killerMass:''),3200); }

 dead=true;playing=false;ui.hud.classList.add('hidden');ui.death.classList.remove('hidden');
 ui.finalScore.textContent=d.score;ui.finalSize.textContent=d.mass;ui.deathText.textContent=d.killer?`${I18N[lang].killedBy}: ${d.killer}`:'';
 lastDeathMass=Math.max(10,Number(d.mass)||10);lastDeathScore=Math.max(0,Number(d.score)||0);maybeShowInterstitial();
 const me=state.players.find(p=>p.id===myId);const earned=Math.max(1,Math.floor((d.score||0)/35)+(me?.kills||0)*8);
 coins+=earned;saveEconomy();ui.earnedCoins.textContent=earned;sfx('death')
});
socket.on('gameEvent',e=>{
  // v1.9.0c: Kill/Death UX
  if(e.type==='kill'){
    if(e.id===myId){ toast('KILL! '+e.victimName+(e.streak>=2?' • '+e.streak+' KILL STREAK':''),2600);sfx('kill'); }
    else if(e.victimId===myId){ toast('You were eliminated by '+e.name,3000); }
  }

   if(e.type==='boostSpawn'){banner(`⚡ ${I18N[lang].boostSpawn||'BOOST FOOD SPAWNED!'}`);sfx('rare')}
  if(e.type==='boostEaten' && e.id===myId){v2MissionProgress('boosts',(missionState?.missions.find(x=>x.id==='boosts')?.progress||0)+1);toast(`🚀 ${I18N[lang].boostEaten||'BOOST CHARGE +1!'}`,2200);sfx('rare')}
if(e.type==='rareSpawn'){banner(`⭐ ${I18N[lang].rareSpawn}`);sfx('rare')}
 if(e.type==='rareEaten'){banner(`👑 ${e.name} ${I18N[lang].rareEaten}`);sfx('rare')}
   if(e.type==='liveEventStart'){liveEvent=e;v2UpdateEvent(e);banner('🌟 GOLDEN ZONE IS LIVE!');sfx('rare')}
 if(e.type==='liveEventEnd'){liveEvent=null;if(ui.eventStatus){ui.eventStatus.textContent='';ui.eventStatus.classList.remove('active')}banner('🌟 Golden Zone ended')}
 if(e.type==='zoneReward'&&e.id===myId){toast('🌟 GOLDEN ZONE +6 SCORE',1300)}
 if(e.type==='streak'){
   const msg=`🔥 ${e.name}: ${e.streak} ${I18N[lang].killStreak} +${e.bonus||0}`;
   if(e.id===myId){toast(msg,3000);sfx('kill')} else if(e.streak>=4)banner(msg);
 }
});
socket.on('state',s=>{
   // Movement snapshots may omit slower-changing data (foods/leaderboard).
   // Merge them into the previous state so the renderer never sees missing arrays.
   state={
     ...state,
     ...s,
     players:Array.isArray(s.players)?s.players:(state.players||[]),
     foods:Array.isArray(s.foods)?s.foods:(state.foods||[]),
     leaderboard:Array.isArray(s.leaderboard)?s.leaderboard:(state.leaderboard||[])
   };
   liveEvent=state.liveEvent||null;
   // SNAKIVO_V2_FULL_UPGRADE state sync
   // v1.8.7b: sync BOOST charges from every server state
   updateBoostUI();const liveIds=new Set();
 for(const p of state.players){if(!renderPos.has(p.id))renderPos.set(p.id,{x:p.x,y:p.y});}
 for(const p of state.players){
   liveIds.add(p.id);if(!p.alive)continue;
   let tr=trails.get(p.id);if(!tr){tr=[];trails.set(p.id,tr)}
   const last=tr[tr.length-1];if(!last||Math.hypot(last.x-p.x,last.y-p.y)>4)tr.push({x:p.x,y:p.y});
   const keep=Math.min(320,Math.max(40,Math.floor(44+p.mass*2.2)));if(tr.length>keep)tr.splice(0,tr.length-keep);
 }
 for(const id of trails.keys())if(!liveIds.has(id))trails.delete(id);
 for(const id of renderPos.keys())if(!liveIds.has(id))renderPos.delete(id);
 const me=state.players.find(p=>p.id===myId);
 if(me){
   ui.score.textContent=me.score;ui.size.textContent=Math.floor(me.mass);ui.kills.textContent=me.kills||0;ui.streak.textContent=me.streak||0;
   if(me.score>prevScore && Date.now()-lastEatSoundAt>85){sfx('eat');lastEatSoundAt=Date.now()}
   prevScore=me.score;
   v2Update();
 }
 rank=(state.leaderboard||[]).findIndex(x=>x.id===myId)+1;
 renderLB(state.leaderboard);drawMini();
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

function v2DrawLiveZone(){
  if(!liveEvent||liveEvent.type!=='golden_zone')return;
  const z=world.width?liveEvent:null;if(!z)return;
  const sx=innerWidth/world.width,sy=innerHeight/world.height;
  const cx=innerWidth/2+(z.x-cam.x)*cam.zoom;
  const cy=innerHeight/2+(z.y-cam.y)*cam.zoom;
  const rr=z.radius*cam.zoom;
  ctx.save();ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);
  ctx.fillStyle='rgba(255,209,72,.08)';ctx.fill();
  ctx.strokeStyle='rgba(255,209,72,.72)';ctx.lineWidth=4;ctx.setLineDash([14,10]);ctx.stroke();ctx.restore();
}
function drawMini(){
    if(!world.width||!world.height)return;
    const w=mini.width,h=mini.height;
    mctx.clearRect(0,0,w,h);
    mctx.fillStyle='rgba(5,16,23,.88)';
    mctx.fillRect(0,0,w,h);
    mctx.strokeStyle='rgba(255,255,255,.16)';
    mctx.lineWidth=2;
    mctx.strokeRect(1,1,w-2,h-2);

    const sxm=w/world.width,sym=h/world.height;

    // Rare Event
    const event=state.foods.find(f=>f.type==='event');
    if(event){
      const x=event.x*sxm,y=event.y*sym;
      mctx.save();
      mctx.fillStyle='#ffe156';
      mctx.shadowColor='#ffe156';
      mctx.shadowBlur=12;
      mctx.beginPath();
      for(let i=0;i<10;i++){
        const a=-Math.PI/2+i*Math.PI/5,r=i%2?4:8;
        mctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);
      }
      mctx.closePath();mctx.fill();mctx.restore();
    }

    // Boost Food
    const boostMini=state.foods.find(f=>f.type==='boost');
    if(boostMini){
      const bx=boostMini.x*sxm,by=boostMini.y*sym;
      mctx.save();
      mctx.fillStyle='#67e8f9';
      mctx.shadowColor='#67e8f9';
      mctx.shadowBlur=12;
      mctx.font='900 18px Arial';
      mctx.textAlign='center';mctx.textBaseline='middle';
      mctx.fillText('⚡',bx,by);
      mctx.restore();
    }

    const alive=state.players.filter(p=>p.alive);
    const biggest=alive.reduce((best,p)=>!best||p.mass>best.mass?p:best,null);

    // Other players
    for(const p of alive){
      if(p.id===myId)continue;
      const x=p.x*sxm,y=p.y*sym;
      const isTop=biggest&&p.id===biggest.id;
      mctx.save();
      mctx.beginPath();
      mctx.arc(x,y,isTop?6:3.5,0,Math.PI*2);
      mctx.fillStyle=isTop?'#ffd84d':(p.isBot?'#a78bfa':'#4da6ff');
      if(isTop){mctx.shadowColor='#ffd84d';mctx.shadowBlur=12;}
      mctx.fill();
      mctx.restore();
    }

    // You
    const me=alive.find(p=>p.id===myId);
    if(me){
      const x=me.x*sxm,y=me.y*sym;
      mctx.save();
      mctx.fillStyle='#ffffff';
      mctx.beginPath();mctx.arc(x,y,5,0,Math.PI*2);mctx.fill();
      mctx.strokeStyle=me.color;mctx.lineWidth=2;mctx.stroke();
      mctx.restore();
    }

    // #1 crown + number
    if(biggest){
      const x=biggest.x*sxm,y=biggest.y*sym;
      mctx.save();
      mctx.font='900 13px Arial';
      mctx.textAlign='center';
      mctx.textBaseline='bottom';
      mctx.lineWidth=3;
      mctx.strokeStyle='rgba(5,16,23,.95)';
      mctx.strokeText('👑 1',x,y-8);
      mctx.fillStyle='#ffd84d';
      mctx.fillText('👑 1',x,y-8);
      mctx.restore();
    }
  }
// v1.9.1b: player mini-map


// v1.8.4: robust window-level Space BOOST
window.addEventListener('keydown',e=>{
  if(e.code==='Space' || e.key===' ' || e.keyCode===32){
    if(!pauseOpen && !dead && playing && boostCharges>0){
      e.preventDefault();
      e.stopPropagation();
      socket.emit('boost');
      boost=true;
    }
  }
},true);
window.addEventListener('keypress',e=>{
  if((e.code==='Space' || e.key===' ' || e.keyCode===32) && !pauseOpen && !dead && playing && boostCharges>0){
    e.preventDefault();
    e.stopPropagation();
    socket.emit('boost');
    boost=true;
  }
},true);
window.addEventListener('keyup',e=>{
  if(e.code==='Space' || e.key===' ' || e.keyCode===32) boost=false;
},true);
// Mouse / touch / joystick
addEventListener('mousemove',e=>{pointer.x=e.clientX;pointer.y=e.clientY});
addEventListener('touchmove',e=>{if(!e.target.closest?.('#joystick') && e.touches[0]){pointer.x=e.touches[0].clientX;pointer.y=e.touches[0].clientY}},{passive:true});
  // v1.8.3b: Space triggers the proven BOOST button path
  document.addEventListener('keydown',e=>{
    if((e.code==='Space'||e.key===' ') && !pauseOpen && !dead && playing){
      e.preventDefault();
      if(boostCharges>0){
        ui.boost.click();
      }
    }
  },true);
  document.addEventListener('keyup',e=>{
    if(e.code==='Space'||e.key===' ') boost=false;
  },true);

addEventListener('keydown',e=>{
 if(e.code==='Escape'){
   e.preventDefault();
   if(pauseOpen)closePause();else openPause();
   return;
 }
});
['pointerdown','touchstart'].forEach(ev=>ui.boost.addEventListener(ev,e=>{
  e.preventDefault();
  if(boostCharges>0){
    boost=true;
    socket.emit('boost');
  }
},{passive:false}));
ui.boost.addEventListener('click',e=>{
  e.preventDefault();
  if(boostCharges>0){
    boost=true;
    socket.emit('boost');
  }
});

['pointerup','pointercancel','touchend'].forEach(ev=>ui.boost.addEventListener(ev,e=>{e.preventDefault();boost=false},{passive:false}));
  // v1.7.8: BOOST direct capture
  document.addEventListener('pointerdown',e=>{
    const b=e.target && e.target.closest ? e.target.closest('#boostBtn') : null;
    if(!b || !playing || dead || pauseOpen) return;
    socket.emit('boost');
    boost=true;
  },true);

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
 if(!boostCharges)boost=false;
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
function frame(now=performance.now()){
 requestAnimationFrame(frame);
 const frameInterval=1000/targetFps;
 if(now-lastFrameAt<frameInterval-0.5)return;
 lastFrameAt=now-((now-lastFrameAt)%frameInterval);
 ctx.clearRect(0,0,innerWidth,innerHeight);
 const g=ctx.createRadialGradient(innerWidth*.5,innerHeight*.45,50,innerWidth*.5,innerHeight*.5,Math.max(innerWidth,innerHeight));
 g.addColorStop(0,'#102733');g.addColorStop(1,'#061019');ctx.fillStyle=g;ctx.fillRect(0,0,innerWidth,innerHeight);drawGrid();
 const me=state.players.find(p=>p.id===myId);
   if(me){
     const rp=renderPos.get(me.id)||{x:me.x,y:me.y};
     rp.x+=(me.x-rp.x)*0.34;rp.y+=(me.y-rp.y)*0.34;renderPos.set(me.id,rp);
     cam.x+=(rp.x-cam.x)*.16;cam.y+=(rp.y-cam.y)*.16;
     const target=Math.max(.48,Math.min(1,1-(me.r-20)/250));cam.zoom+=(target-cam.zoom)*.06
   }
 ctx.save();ctx.strokeStyle='rgba(109,229,167,.18)';ctx.lineWidth=4;ctx.strokeRect(sx(0),sy(0),world.width*cam.zoom,world.height*cam.zoom);ctx.restore();

 for(const f of state.foods){
   const x=sx(f.x),y=sy(f.y),r=f.r*cam.zoom;if(x<-60||y<-60||x>innerWidth+60||y>innerHeight+60)continue;
   const event=f.type==='event',boostFood=f.type==='boost',rare=event||boostFood||f.type==='legendary'||f.type==='large';
   ctx.save();ctx.beginPath();ctx.fillStyle=event?'#ffe156':boostFood?'#67e8f9':f.type==='legendary'?'#ffd84d':`hsl(${f.hue} 85% 62%)`;
   ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=(f.glow||10)*cam.zoom;ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
     /* v1.6.8 boost lightning */
     if(boostFood){
       ctx.save();
       const pulse=1+Math.sin(Date.now()/160)*0.12;
       ctx.shadowColor='#67e8f9';
       ctx.shadowBlur=28*cam.zoom;
       ctx.fillStyle='#ffffff';
       ctx.font='900 '+Math.max(18,r*2.15*pulse)+'px Arial';
       ctx.textAlign='center';
       ctx.textBaseline='middle';
       ctx.fillText('⚡',x,y);
       ctx.restore();
     }
   if(rare){
     ctx.strokeStyle=event?'rgba(255,235,120,.95)':boostFood?'rgba(103,232,249,.98)':'rgba(255,255,255,.78)';ctx.lineWidth=Math.max(1.5,2.2*cam.zoom);
     ctx.beginPath();ctx.arc(x,y,r*(event?1.75:1.45),0,Math.PI*2);ctx.stroke();
     if(event){ctx.strokeStyle='rgba(255,225,86,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,r*2.35,0,Math.PI*2);ctx.stroke()}
     ctx.fillStyle='#fff';ctx.font=`700 ${Math.max(9,12*cam.zoom)}px system-ui`;ctx.textAlign='center';ctx.fillText(event?'★':boostFood?'⚡':'•',x,y+4*cam.zoom)
   }ctx.restore();
 }

 const king=state.leaderboard?.[0]?.id;
 for(const p of state.players){
   if(!p.alive)continue;
   const visualGrowth=Math.sqrt(Math.max(0,p.mass));
     const rp=renderPos.get(p.id)||{x:p.x,y:p.y};
     rp.x+=(p.x-rp.x)*0.35;rp.y+=(p.y-rp.y)*0.35;renderPos.set(p.id,rp);
     const x=sx(rp.x),y=sy(rp.y),headR=Math.max(10,Math.min(68,13+visualGrowth*1.20)*cam.zoom);
   if(x<-260||y<-260||x>innerWidth+260||y>innerHeight+260)continue;
   const tr=trails.get(p.id)||[],bodyW=Math.max(10,Math.min(92,15+visualGrowth*1.20)*cam.zoom);

   // Snakivo v1.9.10 ROBUST ROUND HEAD + TONGUE
   // Snakivo v1.9.11 PLAYER COLOR FIX
   const skinPalette=(typeof SKIN_BY_ID!=='undefined'&&SKIN_BY_ID[p.skin])?SKIN_BY_ID[p.skin]:null;
   // Snakivo v1.9.13 ROBUST UNIQUE PLAYER COLORS
   const playerColor=p.color||'#36dc81';
   const playerAccent=p.accent||playerColor;
   // Classic smooth body: connected stroke, round head, forked tongue.
   if(tr.length>2){
     ctx.save();
     ctx.lineCap='round';ctx.lineJoin='round';
     // Dark outer edge keeps the body defined without a childish segmented look.
     ctx.strokeStyle='rgba(2,9,13,.78)';
     ctx.lineWidth=bodyW+Math.max(2.5,3.2*cam.zoom);
     ctx.beginPath();ctx.moveTo(sx(tr[0].x),sy(tr[0].y));
     for(let i=1;i<tr.length;i++)ctx.lineTo(sx(tr[i].x),sy(tr[i].y));
     ctx.stroke();

     ctx.strokeStyle=playerColor;
     ctx.lineWidth=bodyW;
     ctx.shadowColor=playerColor;
     ctx.shadowBlur=p.id===myId?14:6;
     ctx.beginPath();ctx.moveTo(sx(tr[0].x),sy(tr[0].y));
     for(let i=1;i<tr.length;i++)ctx.lineTo(sx(tr[i].x),sy(tr[i].y));
     ctx.stroke();
     ctx.shadowBlur=0;

     // Restrained highlight.
     ctx.globalAlpha=.20;
     ctx.strokeStyle=playerAccent||'#ffffff';
     ctx.lineWidth=Math.max(1.5,bodyW*.11);
     ctx.stroke();
     ctx.globalAlpha=1;
     ctx.restore();
     if(typeof drawCountryBodyOverlay==='function')drawCountryBodyOverlay(p,tr,bodyW);
   }

   ctx.save();ctx.translate(x,y);ctx.rotate(p.angle);
   const rh=headR*.98;
   const headGrad=ctx.createRadialGradient(rh*.28,-rh*.30,rh*.08,0,0,rh*1.15);
   headGrad.addColorStop(0,playerAccent||playerColor);
   headGrad.addColorStop(.22,playerColor);
   headGrad.addColorStop(.78,playerColor);
   headGrad.addColorStop(1,'rgba(4,16,21,.96)');
   ctx.fillStyle=headGrad;
   ctx.strokeStyle='rgba(2,8,12,.82)';
   ctx.lineWidth=Math.max(1.7,2.4*cam.zoom);
   ctx.shadowColor=playerColor;ctx.shadowBlur=p.id===myId?13:6;
   ctx.beginPath();ctx.arc(0,0,rh,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.shadowBlur=0;

   if(typeof drawCountryHeadMark==='function')drawCountryHeadMark(p,rh);

   // Simple medium-sized eyes.
   const ex=rh*.36,ey=rh*.31,er=Math.max(2.6,rh*.17),pr=Math.max(1.4,rh*.075);
   ctx.fillStyle='#f3fbff';
   ctx.beginPath();ctx.arc(ex,-ey,er,0,Math.PI*2);ctx.arc(ex,ey,er,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#061016';
   ctx.beginPath();ctx.arc(ex+rh*.055,-ey,pr,0,Math.PI*2);ctx.arc(ex+rh*.055,ey,pr,0,Math.PI*2);ctx.fill();

   // Forked tongue.
   ctx.strokeStyle='#ff667d';ctx.lineWidth=Math.max(1.4,1.9*cam.zoom);ctx.lineCap='round';
   ctx.beginPath();
   ctx.moveTo(rh*.88,0);ctx.lineTo(rh*1.30,0);
   ctx.moveTo(rh*1.30,0);ctx.lineTo(rh*1.52,-rh*.13);
   ctx.moveTo(rh*1.30,0);ctx.lineTo(rh*1.52,rh*.13);
   ctx.stroke();

   if(p.boost){
     ctx.strokeStyle='rgba(105,235,255,.64)';
     ctx.lineWidth=Math.max(1.2,1.7*cam.zoom);
     for(let i=0;i<3;i++){
       ctx.globalAlpha=.62-i*.14;
       ctx.beginPath();
       ctx.moveTo(-rh*(1.05+i*.30),-rh*(.34-i*.08));
       ctx.lineTo(-rh*(1.75+i*.44),-rh*(.34-i*.08));
       ctx.stroke();
     }
     ctx.globalAlpha=1;
   }

   if(p.inv){
     ctx.strokeStyle='rgba(255,255,255,.50)';
     ctx.lineWidth=Math.max(1.5,2*cam.zoom);
     ctx.beginPath();ctx.arc(0,0,rh*1.38,0,Math.PI*2);ctx.stroke();
   }
   ctx.restore();
   ctx.font='700 12px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(`${p.id===king?'👑 ':''}${p.name}${p.isBot?' • BOT':''}`,x,y-headR-12);
   if((p.streak||0)>=3){ctx.font='800 10px system-ui';ctx.fillStyle='#ffcd57';ctx.fillText(`🔥 x${p.streak}`,x,y-headR-27)}
 }
}
frame();

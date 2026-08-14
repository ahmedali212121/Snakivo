// SNAKIVO_V2_FULL_UPGRADE
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { transports: ['websocket', 'polling'] });

const PORT = process.env.PORT || 3000;
const WORLD = { width: 4600, height: 4600 };
const TICK_RATE = 30;
const STATE_RATE = 20; // network snapshots per second; physics stays at 30 Hz
const FOOD_STATE_RATE = 5; // food is mostly static, so send it less often
const LEADERBOARD_RATE = 5;
const FOOD_TARGET = 480;
const BASE_SPEED = 250;
const BOOST_SPEED = 500;
const BOOST_DURATION_MS = 2600;
const MAX_BOOST_CHARGES = 3;
const BASE_RADIUS = 18;
const MAX_NAME = 18;
const BOT_TARGET = 8;
const MAX_BOTS = 10;
const RARE_EVENT_INTERVAL = 42000;
const RARE_EVENT_VALUE = 55;

const players = new Map();
  let boostFoodId=null,boostFoodNextAt=Date.now()+8000;
const foods = new Map();
let foodId = 1;
let botId = 1;
let lastRareEvent = Date.now() - RARE_EVENT_INTERVAL + 12000;

const SKINS = {
  emerald:{id:'emerald',color:'#37d67a',accent:'#c9ffe0'},
  ocean:{id:'ocean',color:'#35a7ff',accent:'#bfe2ff'},
  blaze:{id:'blaze',color:'#ff7849',accent:'#ffd2c2'},
  royal:{id:'royal',color:'#a78bfa',accent:'#e7dcff'},
  neon:{id:'neon',color:'#22d3ee',accent:'#c5fbff'},
  rose:{id:'rose',color:'#fb7185',accent:'#ffd0d8'},

  saudi:{id:'saudi',color:'#0b8f47',accent:'#ffffff'},
  uae:{id:'uae',color:'#119b52',accent:'#ffffff'},
  kuwait:{id:'kuwait',color:'#159447',accent:'#ffffff'},
  qatar:{id:'qatar',color:'#8a1538',accent:'#ffffff'},
  bahrain:{id:'bahrain',color:'#ce1126',accent:'#ffffff'},
  oman:{id:'oman',color:'#d62828',accent:'#ffffff'},
  egypt:{id:'egypt',color:'#ce1126',accent:'#ffffff'},
  usa:{id:'usa',color:'#3c3b6e',accent:'#ffffff'},
  uk:{id:'uk',color:'#21468b',accent:'#ffffff'},
  france:{id:'france',color:'#0055a4',accent:'#ffffff'},
  germany:{id:'germany',color:'#1a1a1a',accent:'#ffce00'},
  japan:{id:'japan',color:'#f7f7f7',accent:'#bc002d'}
};
const V2_RANKS=[
  {id:'bronze',name:'Bronze',min:0},
  {id:'silver',name:'Silver',min:500},
  {id:'gold',name:'Gold',min:1500},
  {id:'platinum',name:'Platinum',min:3500},
  {id:'diamond',name:'Diamond',min:7000},
  {id:'king',name:'King',min:12000}
];
function rankForScore(score){
  let r=V2_RANKS[0];
  for(const x of V2_RANKS)if(score>=x.min)r=x;
  return r;
}
let liveEvent=null;
let nextLiveEventAt=Date.now()+30000;
function spawnLiveZone(){
  const now=Date.now();
  const radius=520;
  liveEvent={type:'golden_zone',x:rnd(700,WORLD.width-700),y:rnd(700,WORLD.height-700),radius,until:now+28000,startedAt:now,label:'GOLDEN ZONE'};
  io.emit('gameEvent',{type:'liveEventStart',event:liveEvent});
}


function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function rnd(a,b){ return Math.random()*(b-a)+a; }
function cleanName(name){
  const s = String(name || 'Player').replace(/[<>]/g,'').trim().slice(0,MAX_NAME);
  return s || 'Player';
}
function cleanSkin(s){ return SKINS[s] ? s : 'emerald'; }
function randomPos(){ return {x:rnd(160,WORLD.width-160),y:rnd(160,WORLD.height-160)}; }
function sizeFromMass(m){ return BASE_RADIUS + Math.sqrt(Math.max(0,m))*1.55; }

function makeFood(){
  const roll=Math.random();
  let type='common',value=1,r=rnd(4,7),glow=8;
  if(roll<0.018){type='legendary';value=24;r=rnd(15,19);glow=30;}
  else if(roll<0.095){type='large';value=9;r=rnd(10,14);glow=21;}
  else if(roll<0.30){type='medium';value=3.2;r=rnd(7,10);glow=14;}
  return {type,value,r,glow,hue:Math.floor(rnd(0,360))};
}
function addFood(f,x,y){
  const id=String(foodId++);
  foods.set(id,{id,x:x??rnd(20,WORLD.width-20),y:y??rnd(20,WORLD.height-20),...f});
  if(f && f.type==='boost') io.emit('gameEvent',{type:'boostSpawn',x:f.x,y:f.y,id:f.id});
  return foods.get(id);
}
function spawnBoostFood(){
    if(boostFoodId && foods.has(boostFoodId)) return;
    const x=rnd(500,WORLD.width-500), y=rnd(500,WORLD.height-500);
    const f=addFood({type:'boost',value:1.5,r:16,glow:48,hue:190},x,y);
    boostFoodId=f.id;
  }

function spawnFood(count=1){ for(let i=0;i<count;i++) addFood(makeFood()); }
spawnFood(FOOD_TARGET);

function makePlayer(id,data={},isBot=false){
  const pos=randomPos();
  const skin=cleanSkin(data.skin || Object.keys(SKINS)[Math.floor(Math.random()*Object.keys(SKINS).length)]);
  return {
    id,name:cleanName(data.name),x:pos.x,y:pos.y,vx:0,vy:0,angle:rnd(-Math.PI,Math.PI),targetAngle:rnd(-Math.PI,Math.PI),
    mass:10,score:0,alive:true,boost:false,skin,color:SKINS[skin].color,accent:SKINS[skin].accent,
    lastInput:Date.now(),invulnerableUntil:Date.now()+1800,joinedAt:Date.now(),kills:0,streak:0,deaths:0,foodEaten:0,isBot,boostRequested:false,boostCharges:0, // v2.0 stats
    botThinkAt:0,botRespawnAt:0
  };
}
function publicPlayer(p){
  return {
    id:p.id,name:p.name,x:p.x,y:p.y,angle:p.angle,mass:p.mass,score:Math.floor(p.score),alive:p.alive,
    color:p.color,accent:p.accent,skin:p.skin,boost:p.boost,r:sizeFromMass(p.mass),inv:p.invulnerableUntil>Date.now(),
    kills:p.kills,streak:p.streak,deaths:p.deaths||0,foodEaten:p.foodEaten||0,isBot:p.isBot,boostCharges:p.boostCharges||0,boostActive:!!p.boost,rank:rankForScore(p.score).id,rankName:rankForScore(p.score).name
  };
}
function humanCount(){ return [...players.values()].filter(p=>!p.isBot).length; }
function botCount(){ return [...players.values()].filter(p=>p.isBot).length; }

function addBot(){
  if(botCount()>=MAX_BOTS) return;
  const id=`bot_${botId++}`;
  const names=['Nova','Viper','Cobra','Pixel','Dash','Mamba','Luna','Rex','Echo','Bolt','Nix','Zara'];
  // Snakivo v1.9.11 PLAYER COLOR FIX
  const skinIds=Object.keys(SKINS);
  const botSkin=skinIds[Math.floor(Math.random()*skinIds.length)]||'emerald';
  const p=makePlayer(id,{name:names[Math.floor(Math.random()*names.length)],skin:botSkin},true);
  p.mass=rnd(11,24);
  p.score=p.mass*2;
  players.set(id,p);
}
function maintainBots(){
  const humans=[...players.values()].filter(p=>!p.isBot);
  const optedIn=humans.filter(p=>p.botsEnabled).length;
  const wanted=optedIn>0 ? Math.max(3,Math.min(BOT_TARGET, BOT_TARGET-Math.floor(humans.length/2))) : 0;
  while(botCount()<wanted) addBot();
  if(botCount()>wanted){
    const bots=[...players.values()].filter(p=>p.isBot);
    for(let i=wanted;i<bots.length;i++) players.delete(bots[i].id);
  }
}

// Snakivo v1.9.13 ROBUST UNIQUE PLAYER COLORS
const HUMAN_COLOR_VARIANTS=[
 ['#36dc81','#b8ffd2'],['#37b9ff','#d7f3ff'],['#9b6cff','#eadcff'],
 ['#ff5d8f','#ffd6e4'],['#ff9b42','#ffe1bd'],['#ffd43b','#fff0a8'],
 ['#39e1d1','#c8fffa'],['#e35dff','#f7d8ff'],['#ff6464','#ffd2d2'],
 ['#78e05a','#dcffd2'],['#5f7cff','#dce3ff'],['#f06bb5','#ffd8ef']
];
function assignUniqueHumanColor(p){
  const used=new Set([...players.values()].filter(x=>!x.isBot&&x.id!==p.id).map(x=>(x.color||'').toLowerCase()));
  let seed=0;for(const ch of String(p.id||''))seed=(seed*33+ch.charCodeAt(0))>>>0;
  for(let i=0;i<HUMAN_COLOR_VARIANTS.length;i++){
    const pair=HUMAN_COLOR_VARIANTS[(seed+i)%HUMAN_COLOR_VARIANTS.length];
    if(!used.has(pair[0].toLowerCase())){p.color=pair[0];p.accent=pair[1];return}
  }
  const pair=HUMAN_COLOR_VARIANTS[seed%HUMAN_COLOR_VARIANTS.length];
  p.color=pair[0];p.accent=pair[1];
}

io.on('connection', socket=>{
  socket.on('join',data=>{
    const p=makePlayer(socket.id,{name:data?.name,skin:data?.skin,botsEnabled:!!data?.botsEnabled},false);
    assignUniqueHumanColor(p);
    players.set(socket.id,p);
    socket.emit('joined',{id:socket.id,world:WORLD,skins:SKINS});
  });
  socket.on('boost',()=>{
    const p=players.get(socket.id);
    if(!p||!p.alive||p.isBot){
}
if((p.boostCharges||0)>0&&!p.boost){
      const boostNow=Date.now();
      p.boostCharges-=1;
      p.boostUntil=boostNow+BOOST_DURATION_MS;
      p.boost=true;
      p.boostRequested=false;
p.vx=Math.cos(p.angle)*BOOST_SPEED;
      p.vy=Math.sin(p.angle)*BOOST_SPEED;
    }
  });
  socket.on('input',data=>{
    const p=players.get(socket.id);
    if(!p||!p.alive||p.isBot)return;
    if(Number.isFinite(data.angle))p.targetAngle=data.angle;
    p.boostRequested=!!data.boost;
    p.lastInput=Date.now();
  });
  // SNAKIVO_V1_9_2_UNIFIED: normal / rewarded revive / rewarded start-big
  socket.on('respawn',data=>{
    const old=players.get(socket.id);
    const p=makePlayer(socket.id,{name:data?.name||old?.name,skin:data?.skin||old?.skin,botsEnabled:!!data?.botsEnabled},false);
    assignUniqueHumanColor(p);
    const mode=data?.mode||((data?.rewarded===true)?'startBig':'normal');
    if(mode==='revive'&&data?.rewarded===true&&old&&!old.alive){
      // Fair revive: keep 75% of death mass and 60% of score, with caps + brief protection.
      p.mass=Math.max(14,Math.min(160,old.mass*.75));
      p.score=Math.max(5,Math.floor(old.score*.60));
      p.invulnerableUntil=Date.now()+3200;
    }else if(mode==='startBig'&&data?.rewarded===true){
      p.mass=22;p.score=12;p.invulnerableUntil=Date.now()+2600;
    }
    players.set(socket.id,p);
  });
  socket.on('leave',()=>players.delete(socket.id));
  socket.on('disconnect',()=>players.delete(socket.id));
});

function spawnRareEvent(){
  if([...foods.values()].some(f=>f.type==='event')) return;
  const x=rnd(500,WORLD.width-500), y=rnd(500,WORLD.height-500);
  const f=addFood({type:'event',value:RARE_EVENT_VALUE,r:25,glow:44,hue:48},x,y);
io.emit('gameEvent',{type:'rareSpawn',x,y,id:f.id,value:RARE_EVENT_VALUE});
}

function kill(victim,killer){
  if(!victim.alive)return;
  victim.alive=false;
  victim.deaths=(victim.deaths||0)+1;
  victim.streak=0;
  const drops=Math.min(40,Math.max(10,Math.floor(victim.mass*0.82)));
  for(let i=0;i<drops;i++){
    addFood({type:'drop',value:1.35,r:rnd(5,8),glow:12,hue:Math.floor(rnd(0,360))},
      clamp(victim.x+rnd(-60,60),10,WORLD.width-10),clamp(victim.y+rnd(-60,60),10,WORLD.height-10));
  }
  if(killer){
    killer.mass += Math.max(5,victim.mass*0.32);
    killer.score += Math.max(15,victim.score*0.18+victim.mass);
    killer.kills += 1;
    killer.streak += 1;
    const streakBonus = killer.streak >= 2 ? killer.streak * 12 : 0;
    killer.score += streakBonus;
    if(killer.streak>=2){
      io.emit('gameEvent',{type:'streak',id:killer.id,name:killer.name,streak:killer.streak,bonus:streakBonus});
    }
      io.emit('gameEvent',{type:'kill',id:killer.id,name:killer.name,victimId:victim.id,victimName:victim.name,kills:killer.kills,streak:killer.streak,bonus:streakBonus});
}
  if(victim.isBot){
    victim.botRespawnAt=Date.now()+rnd(1200,2600);
  }else{
    io.to(victim.id).emit('dead',{killer:killer?.name||null,killerMass:killer?Math.floor(killer.mass):null,killerKills:killer?killer.kills:0,killerStreak:killer?killer.streak:0,score:Math.floor(victim.score),mass:Math.floor(victim.mass)});
  }
}
function respawnBot(p){
  const fresh=makePlayer(p.id,{name:p.name,skin:p.skin},true);
  fresh.kills=p.kills;
  players.set(p.id,fresh);
}

function botAI(p,now){
  if(!p.alive){ if(p.botRespawnAt && now>=p.botRespawnAt)respawnBot(p); return; }
  if(now<p.botThinkAt)return;
  p.botThinkAt=now+rnd(180,420);

  let target=null, best=Infinity;
  for(const f of foods.values()){
    let priority=1;
    if(f.type==='event')priority=0.08;
    else if(f.type==='legendary')priority=0.18;
    else if(f.type==='large')priority=0.42;
    const d=Math.hypot(f.x-p.x,f.y-p.y)*priority;
    if(d<best){best=d;target=f;}
  }
  for(const other of players.values()){
    if(other.id===p.id||!other.alive)continue;
    if(other.isBot===false && !other.botsEnabled)continue;
    const d=Math.hypot(other.x-p.x,other.y-p.y);
    if(other.mass>p.mass*1.22 && d<360){
      p.targetAngle=Math.atan2(p.y-other.y,p.x-other.x)+rnd(-0.25,0.25);
      p.boost=p.mass>14;
      return;
    }
    if(p.mass>other.mass*1.35 && d<260){
      target=other;best=0;break;
    }
  }
  const wall=240;
  if(p.x<wall)p.targetAngle=0;
  else if(p.x>WORLD.width-wall)p.targetAngle=Math.PI;
  else if(p.y<wall)p.targetAngle=Math.PI/2;
  else if(p.y>WORLD.height-wall)p.targetAngle=-Math.PI/2;
  else if(target)p.targetAngle=Math.atan2(target.y-p.y,target.x-p.x)+rnd(-0.08,0.08);
  else p.targetAngle+=rnd(-0.8,0.8);

  p.boost=!!target && (target.type==='event'||target.type==='legendary'||target.mass) && p.mass>14 && Math.random()<0.45;
}

function update(dt){
    const now=Date.now();
    if(now>=boostFoodNextAt && (!boostFoodId || !foods.has(boostFoodId))){
      spawnBoostFood();
      boostFoodNextAt=Infinity;
    }
  maintainBots();
  if(now-lastRareEvent>=RARE_EVENT_INTERVAL){
    lastRareEvent=now;
    spawnRareEvent();
  }
  if(!liveEvent && now>=nextLiveEventAt) { spawnLiveZone(); nextLiveEventAt=now+70000; }
  if(liveEvent && now>=liveEvent.until) { io.emit('gameEvent',{type:'liveEventEnd'}); liveEvent=null; }

  for(const p of [...players.values()]){
    if(p.isBot)botAI(p,now);
    if(!p.alive)continue;

    let da=((p.targetAngle-p.angle+Math.PI*3)%(Math.PI*2))-Math.PI;
    p.angle+=da*Math.min(1,dt*7.8);
    const sizePenalty=clamp(1-(sizeFromMass(p.mass)-BASE_RADIUS)/240,0.60,1);
    // v1.7.4b: Boost remains active for its full duration and immediately uses BOOST_SPEED.

    if(!p.isBot && !p.boost && p.boostRequested && (p.boostCharges||0)>0 && p.mass>=10){

      p.boostCharges-=1;

      p.boostUntil=now+BOOST_DURATION_MS;

      p.boost=true;

    }

    if(!p.isBot && p.boost && now>=p.boostUntil){

      p.boost=false;

      p.boostRequested=false;

    }

    const boosting=p.isBot ? !!p.boost : (p.boost===true && now<p.boostUntil);

    const speed=(boosting?BOOST_SPEED:BASE_SPEED)*sizePenalty;

    p.vx=Math.cos(p.angle)*speed;

    p.vy=Math.sin(p.angle)*speed;
    p.x+=p.vx*dt;p.y+=p.vy*dt;
    const rr=sizeFromMass(p.mass);
    p.x=clamp(p.x,rr,WORLD.width-rr);p.y=clamp(p.y,rr,WORLD.height-rr);
    if(boosting){p.mass=Math.max(10,p.mass-dt*1.8);p.score=Math.max(0,p.score-dt*0.45);}

    if(liveEvent && now<liveEvent.until && Math.hypot(p.x-liveEvent.x,p.y-liveEvent.y)<=liveEvent.radius){
      if(!p.eventTickAt||now>=p.eventTickAt){
        p.eventTickAt=now+1000;
        p.score+=6;
        p.mass+=0.35;
        if(!p.isBot)io.emit('gameEvent',{type:'zoneReward',id:p.id,name:p.name});
      }
    }
    const pr=sizeFromMass(p.mass);
    for(const [id,f] of foods){
      const dx=f.x-p.x,dy=f.y-p.y,hit=pr+f.r;
      if(dx*dx+dy*dy<hit*hit){
          foods.delete(id);
          if(f.type==='boost'){
            boostFoodId=null;
            boostFoodNextAt=Date.now()+18000;
            if(!p.isBot){
              io.emit('gameEvent',{type:'boostEaten',id:p.id,name:p.name});
              p.boostCharges=Math.min(MAX_BOOST_CHARGES,(p.boostCharges||0)+1);
            }
          }
          p.mass+=f.value;
          p.score+=2.2*f.value;
          p.foodEaten=(p.foodEaten||0)+1;
        if(f.type==='event'){
          p.score+=80;
          io.emit('gameEvent',{type:'rareEaten',id:p.id,name:p.name,value:f.value});
        }
      }
    }
  }

  const alive=[...players.values()].filter(p=>p.alive);
  for(let i=0;i<alive.length;i++){
    for(let j=i+1;j<alive.length;j++){
      const a=alive[i],b=alive[j];
      if(a.invulnerableUntil>now||b.invulnerableUntil>now)continue;
      if(a.isBot && !b.isBot && !b.botsEnabled)continue;
      if(b.isBot && !a.isBot && !a.botsEnabled)continue;
      const ar=sizeFromMass(a.mass),br=sizeFromMass(b.mass);
      const dx=a.x-b.x,dy=a.y-b.y,d2=dx*dx+dy*dy;
      const hit=Math.max(8,Math.min(ar,br)*0.62);
      if(d2<hit*hit){
        if(a.mass>b.mass*1.16)kill(b,a);
        else if(b.mass>a.mass*1.16)kill(a,b);
      }
    }
  }
  if(foods.size<FOOD_TARGET)spawnFood(Math.min(40,FOOD_TARGET-foods.size));
}

// Keep gameplay/physics at 30 Hz, but decouple network snapshots from physics.
// Sending the entire world 30 times/sec was the main source of bandwidth/CPU spikes.
setInterval(()=>{
  update(1/TICK_RATE);
},1000/TICK_RATE);

let statePacketNo=0;
let cachedFoods=[];
let cachedLeaderboardAll=[];
let cachedLeaderboardHumans=[];

function buildLeaderboard(list){
  return list.filter(p=>p.alive).sort((a,b)=>b.score-a.score).slice(0,10)
    .map((p,i)=>({rank:i+1,id:p.id,name:p.name,score:Math.floor(p.score),mass:Math.floor(p.mass),kills:p.kills,streak:p.streak,isBot:p.isBot}));
}

setInterval(()=>{
  statePacketNo+=1;
  const now=Date.now();
  const allRaw=[...players.values()];
  const humanRaw=allRaw.filter(p=>!p.isBot);
  const allPlayers=allRaw.map(publicPlayer);
  const humanPlayers=humanRaw.map(publicPlayer);

  const foodEvery=Math.max(1,Math.round(STATE_RATE/FOOD_STATE_RATE));
  const leaderboardEvery=Math.max(1,Math.round(STATE_RATE/LEADERBOARD_RATE));
  const includeFoods=statePacketNo===1 || statePacketNo%foodEvery===0;
  const includeLeaderboard=statePacketNo===1 || statePacketNo%leaderboardEvery===0;

  if(includeFoods)cachedFoods=[...foods.values()];
  if(includeLeaderboard){
    cachedLeaderboardAll=buildLeaderboard([...allRaw]);
    cachedLeaderboardHumans=buildLeaderboard([...humanRaw]);
  }

  for(const [sid,sock] of io.sockets.sockets){
    const viewer=players.get(sid);
    if(!viewer)continue;
    const withBots=!!viewer.botsEnabled;
    const packet={
      t:now,
      players:withBots?allPlayers:humanPlayers,
      liveEvent
    };
    // Food and leaderboard don't need to ride on every movement snapshot.
    if(includeFoods)packet.foods=cachedFoods;
    if(includeLeaderboard)packet.leaderboard=withBots?cachedLeaderboardAll:cachedLeaderboardHumans;
    sock.emit('state',packet);
  }
},1000/STATE_RATE);

function siteBase(req){
  if(process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/+$/,'');
  const proto=(req.headers['x-forwarded-proto']||req.protocol||'http').toString().split(',')[0];
  return `${proto}://${req.get('host')}`;
}
function adsenseClient(){
  const raw=(process.env.ADSENSE_CLIENT||'').trim();
  return /^ca-pub-\d+$/.test(raw) ? raw : '';
}

app.get('/robots.txt',(req,res)=>{
  const base=siteBase(req);
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`);
});

app.get('/sitemap.xml',(req,res)=>{
  const base=siteBase(req);
  const pages=['/','/guide.html','/faq.html','/about.html','/privacy.html','/terms.html','/contact.html'];
  const body=pages.map(p=>`  <url><loc>${base}${p}</loc></url>`).join('\n');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`);
});

app.get('/ads.txt',(req,res)=>{
  const pub=(process.env.ADSENSE_PUBLISHER_ID||'').trim().replace(/^pub-/,'');
  res.type('text/plain');
  if(/^\d+$/.test(pub)){
    res.send(`google.com, pub-${pub}, DIRECT, f08c47fec0942fa0\n`);
  }else{
    res.send('# Set ADSENSE_PUBLISHER_ID in production before enabling AdSense.\n');
  }
});

app.get('/',(req,res)=>{
  const base=siteBase(req);
  const client=adsenseClient();
  let page=require('fs').readFileSync(path.join(__dirname,'public','index.html'),'utf8');
  page=page.replaceAll('__SITE_URL__',base);
  page=page.replace('<!-- ADSENSE_HEAD -->',
    client ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>` : '');
  res.type('html').send(page);
});

app.use(express.static(path.join(__dirname,'public'),{index:false}));

app.get('/health',(_req,res)=>res.json({ok:true,players:players.size,humans:humanCount(),bots:botCount(),foods:foods.size}));
app.get('*',(_req,res)=>res.status(404).sendFile(path.join(__dirname,'public','404.html')));

server.listen(PORT,()=>console.log(`Snakivo running on http://localhost:${PORT}`));


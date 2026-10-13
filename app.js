(function(){
'use strict';
var Q=window.QUESTIONS, KEY='totm-v1', $=function(s,r){return (r||document).querySelector(s)};
var app=$('#app');
var S=load();
function def(){return {screen:'intro',intro:{sqft:2400,beds:3,baths:2.5,notes:''},i:0,ans:{},region:null,tier:'premium'};}
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&s.intro)return s;}catch(e){}return def();}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fmt(n){return Math.round(n).toLocaleString('en-US');}
function sqm(ft){return ft/10.7639;}

/* ---------- ICONS ---------- */
var IC={
 this:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
 that:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
 both:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.5 1.2 4.3 2.4.8-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
 neither:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};

/* ---------- STYLE MODEL ---------- */
var STYLES=[
 {id:'jp',adj:'Japanese',noun:'Garden House',name:'Japanese Modern Garden House',w:{jp:3,timber:1.5,minimal:1.5,court:.8,eaves:1,warm:.8,moody:.6,spa:.6,sauna:.3,garden:.5,single:.4},
  blurb:'a calm, low house in warm timber and plaster, organised around framed garden views'},
 {id:'med',adj:'Mediterranean',noun:'Villa',name:'Mediterranean Courtyard Villa',w:{med:3,stone:1.5,court:1,bright:1,layered:1,warm:1,terrace:1},
  blurb:'thick, sun-washed walls, shaded openings, and rooms that spill onto stone terraces'},
 {id:'prairie',adj:'Prairie',noun:'House',name:'Prairie Modern House',w:{prairie:3,eaves:1.5,timber:1,single:1,lawn:1,warm:.6,veranda:.6,beams:.5},
  blurb:'long, low horizontal lines under sheltering hip roofs, rooted in its landscape'},
 {id:'trop',adj:'Tropical',noun:'Pavilion House',name:'Tropical Modern Pavilion',w:{tropical:3,open:1.5,glass:1,eaves:1,veranda:1,spa:.5,lap:.4},
  blurb:'a set of breezy pavilions under deep roofs, with walls that slide open to the garden'},
 {id:'nordic',adj:'Nordic',noun:'House',name:'Nordic Minimal House',w:{nordic:3,timber:1,cool:1,bright:1.5,minimal:1,sauna:1,framed:.5},
  blurb:'pale timber, clean white surfaces, and carefully placed windows that collect the light'},
 {id:'classic',adj:'Classic',noun:'Country House',name:'Classic Country House',w:{classic:3,layered:1,stone:1,tall:1,lawn:1,closed:.5,cozy:1,framed:.5},
  blurb:'well-proportioned rooms, solid materials, and a layered, lived-in interior'},
 {id:'modern',adj:'Warm Minimalist',noun:'Modern House',name:'Warm Minimalist Modern House',w:{modern:3,glass:1.5,open:1,minimal:1,cool:.5,lap:.5},
  blurb:'crisp volumes, large glass, and very few, very good materials'}
];
function traits(){var t={};Q.forEach(function(q){var a=S.ans[q.id];if(!a||a==='skip')return;
 var add=function(o,m){for(var k in o.t)t[k]=(t[k]||0)+o.t[k]*m;};
 if(a==='this')add(q.opts[0],1);else if(a==='that')add(q.opts[1],1);else if(a==='both'){add(q.opts[0],.6);add(q.opts[1],.6);}else if(a==='neither'){add(q.opts[0],-.5);add(q.opts[1],-.5);}});return t;}
function styleScores(t){return STYLES.map(function(s){var v=0;for(var k in s.w)v+=s.w[k]*(t[k]||0);return {s:s,v:v};}).sort(function(a,b){return b.v-a.v;});}
function d(id){return S.ans[id]||'skip';}
function has(id,side){var a=d(id);return a==='both'||(side==='a'?a==='this':a==='that');}

/* ---------- NOTES ---------- */
function parseNotes(n){n=(n||'').toLowerCase();var r={};
 if(/thai|bangkok|phuket|chiang|samui|hua hin|pattaya|krabi/.test(n))r.region='th';
 else if(/japan|tokyo|kyoto|osaka|hokkaido|nagano|okinawa|niseko/.test(n))r.region='jp';
 else if(/europe|spain|france|italy|portugal|germany|greece|uk\b|england|netherlands|austria|switzerland|mallorca|ibiza/.test(n))r.region='eu';
 else if(/california|new york|\bny\b|\bsf\b|san francisco|los angeles|\bla\b|seattle|boston|hawaii|hamptons|miami|aspen|bay area|manhattan/.test(n))r.region='ushigh';
 r.office=/office|work from home|wfh|study/.test(n);r.workshop=/workshop|studio|garage shop|maker/.test(n);r.gym=/gym|fitness|yoga/.test(n);
 r.media=/media|theater|theatre|cinema/.test(n);r.wine=/wine/.test(n);r.mud=/dog|pet|mud ?room/.test(n);r.play=/kids|playroom|children/.test(n);
 r.garage=/garage|carport|parking/.test(n);r.pool=/pool|swim/.test(n);r.guest=/guest|in-law|parents|nanny/.test(n);r.sauna=/sauna|steam|onsen|plunge/.test(n);
 var m=n.match(/budget[^0-9$฿]{0,20}[$฿]?\s*([\d][\d,.]*)\s*(k|m|mm|million)?\s*(thb|baht|usd|dollars?)?/);
 if(m){var v=parseFloat(m[1].replace(/,/g,''));var u=m[2];if(u==='k')v*=1e3;else if(u)v*=1e6;var cur=(m[3]&&/thb|baht/.test(m[3]))||/baht|thb|฿/.test(n)?'THB':'USD';if(v>1000)r.budget={v:v,cur:cur};}
 return r;}

/* ---------- PROGRAM ---------- */
function program(){
 var I=S.intro,A=Math.max(600,+I.sqft||2400),beds=Math.max(1,Math.round(+I.beds||3)),baths=Math.max(1,+I.baths||2),N=parseNotes(I.notes);
 var full=Math.floor(baths),half=Math.round((baths-full)*2);
 var two=has('levels','b')&&!(d('levels')==='both'&&A<2600);
 var R=[];function add(n,a,z,lv,x){R.push({name:n,base:a,zone:z,lv:lv||1,extra:x||0});}
 add('Entry',70,'pub');add('Living',330,'pub');
 if(has('kitchen','b')&&!has('kitchen','a')){add('Kitchen',180,'pub');add('Pantry',50,'svc');}
 else if(d('kitchen')==='both'){add('Open Kitchen',200,'pub');add('Back Kitchen',90,'svc');}
 else add('Kitchen',200,'pub');
 add('Dining',170,'pub');
 add('Primary Bedroom',250,'priv',two?2:1);
 add(has('bath','a')?'Primary Spa Bath':'Primary Bath',has('bath','a')?140:110,'priv',two?2:1);
 for(var b=2;b<=beds;b++)add('Bedroom '+b,150,'priv',two&&b<beds?2:(two&&beds>2?2:1));
 if(two&&beds>=2){R.filter(function(r){return r.name==='Bedroom 2';}).forEach(function(r){r.lv=1;});}
 for(var f=2;f<=full;f++)add('Bath '+f,60,'priv',two&&f>2?2:1);
 for(var h=0;h<half;h++)add(h?'Half Bath '+(h+1):'Powder Room',32,'svc');
 add('Laundry',65,'svc',two?2:1);add('Storage and Mechanical',55,'svc');
 if(has('work','a')||N.office)add('Study',140,'flex',1,7);
 if(has('well','a')||N.sauna)add('Sauna and Cold Plunge',75,'flex',1,6);
 if(has('well','b')||N.gym)add('Home Gym',180,'flex',1,4);
 if(has('work','b')||N.workshop)add('Workshop Studio',220,'flex',1,3);
 if(N.mud)add('Mudroom',60,'svc',1,5);
 if(N.wine)add('Wine Room',60,'flex',1,2);
 if(N.play)add('Playroom',160,'flex',two?2:1,2);
 if(N.media)add('Media Room',220,'flex',1,1);
 if(two)add('Stair',80,'svc',1),add('Stair',80,'svc',2);
 var notes=[],circ=.12;
 function need(){return R.reduce(function(s,r){return s+r.base;},0)*(1+circ);}
 var dropped=[];
 while(need()>A){var ex=R.filter(function(r){return r.extra;}).sort(function(a,b){return a.extra-b.extra;});if(!ex.length)break;var x=ex[0];R.splice(R.indexOf(x),1);dropped.push(x.name);}
 if(dropped.length)notes.push('To fit '+fmt(A)+' sq ft, these were left out: '+dropped.join(', ')+'.');
 var sum=R.reduce(function(s,r){return s+r.base;},0),f2=A/(sum*(1+circ));
 if(f2<.85)notes.push('The program is tight for '+fmt(A)+' sq ft. About '+fmt(sum*(1+circ)*.92)+' sq ft would be more comfortable.');
 var flex=0;if(f2>1.55){flex=sum*(f2-1.55);f2=1.55;}
 R.forEach(function(r){var g=(r.zone==='svc')?Math.min(f2,1.15):f2;r.area=r.base*g;});
 if(flex>60)R.push({name:'Flex Room',area:flex,zone:'flex',lv:1});
 var used=R.reduce(function(s,r){return s+r.area;},0);
 R.push({name:'Halls and Circulation',area:Math.max(0,A-used),zone:'circ',lv:1,circ:1});
 if(two){var c=R[R.length-1],l2=R.filter(function(r){return r.lv===2;}).reduce(function(s,r){return s+r.area;},0),l1=used-l2;c.area2=c.area*l2/(l1+l2);c.area-=c.area2;}
 var out=[];
 if(has('court','a'))out.push({name:'Central Courtyard',area:A*.18});
 if(has('outdoor','a'))out.push({name:'Covered Veranda',area:A*.14});
 if(has('outdoor','b'))out.push({name:'Open Terrace',area:A*.12});
 if(has('pool','a'))out.push({name:'Lap Pool',area:400,pool:'lap'});
 if(has('pool','b'))out.push({name:'Natural Swimming Pond',area:600,pool:'pond'});
 if(!has('pool','a')&&!has('pool','b')&&N.pool&&d('pool')!=='neither')out.push({name:'Pool',area:400,pool:'lap'});
 if(N.garage)out.push({name:'Garage or Carport',area:420,garage:1});
 if(N.guest)notes.push('Your notes mention guests or family. Bedroom 2 is set up as a guest suite with its own bath.');
 return {A:A,beds:beds,baths:baths,full:full,half:half,two:two,rooms:R,out:out,notes:notes,N:N};
}

/* ---------- PLAN SVG ---------- */
var ZC={pub:'#f3eee6',priv:'#eef0ec',flex:'#efece6',svc:'#f4f4f4',circ:'#fbfaf7'};
function split(items,x,y,w,h,out){
 if(!items.length)return;if(items.length===1){out.push({r:items[0],x:x,y:y,w:w,h:h});return;}
 var tot=items.reduce(function(s,i){return s+i.a;},0),acc=0,k=0;
 for(;k<items.length-1;k++){if(acc+items[k].a>tot/2&&k>0)break;acc+=items[k].a;}
 var A1=items.slice(0,k),A2=items.slice(k),f=acc/tot;
 if(w>=h){split(A1,x,y,w*f,h,out);split(A2,x+w*f,y,w*(1-f),h,out);}else{split(A1,x,y,w,h*f,out);split(A2,x,y+h*f,w,h*(1-f),out);}
}
function zoneItems(rooms,z,lv,key){return rooms.filter(function(r){return r.zone===z&&r.lv===lv;}).map(function(r){return {n:r.name,a:r.area};}).sort(function(a,b){return b.a-a.a;});}
function planSVG(P,lv){
 var rooms=P.rooms.map(function(r){return r;});
 var circ=rooms.filter(function(r){return r.circ;})[0];
 var list=rooms.filter(function(r){return !r.circ;});
 var Z={pub:[],priv:[],flex:[],svc:[]};
 list.forEach(function(r){if(r.lv===lv)Z[r.zone].push({n:r.name,a:r.area,z:r.zone});});
 var c=lv===1?circ.area:(circ.area2||0);
 // add circulation as a gallery strip
 var court=lv===1&&has('court','a');
 var boxes=[],pad=4,W,H,extra=[];
 var zs=['priv','pub','flex','svc'].filter(function(z){return Z[z].length;});
 Z.svc=Z.svc.concat(Z.flex);Z.flex=[];
 function tot(a){return a.reduce(function(s,i){return s+i.a;},0);}
 Object.keys(Z).forEach(function(k){Z[k].sort(function(a,b){return b.a-a.a;});});
 var Apriv=tot(Z.priv),Apub=tot(Z.pub),Asvc=tot(Z.svc),Aall=Apriv+Apub+Asvc+c;
 var cz={n:'Gallery / Hall',a:c,z:'circ'};
 if(court){
  var Y=Math.sqrt(Aall)*1.0,db=Math.max(16,Math.sqrt(Aall)*.42);
  var dl=(Apriv)/Y,dr=Asvc/Y; if(dr<10){dr=Math.max(dr,0);} 
  var gal=Math.max(5,c/(Y*2));
  var xm=(Apub+c)/db; // bottom wing holds public + gallery
  var X=dl+xm+dr;W=X;H=Y;
  split(Z.priv,0,0,dl,Y,boxes);split(Z.svc,dl+xm,0,dr,Y,boxes);
  var pubh=db*(Apub/(Apub+c));
  split(Z.pub,dl,Y-pubh,xm,pubh,boxes);
  boxes.push({r:cz,x:dl,y:Y-db,w:xm,h:db-pubh});
  extra.push({n:'Central Courtyard',x:dl,y:0,w:xm,h:Y-db});
 }else{
  H=Math.sqrt(Aall/1.7);var x=0;
  [['pub',Z.pub],['circ',[cz]],['priv',Z.priv],['svc',Z.svc]].forEach(function(p){var a=tot(p[1]);if(!a)return;var w=a/H;
   if(p[0]==='circ'){boxes.push({r:cz,x:x,y:0,w:w,h:H});}else split(p[1],x,0,w,H,boxes);x+=w;});
  W=x;
 }
 var s=10,m=6;function sc(v){return (v*s).toFixed(1);}
 var svg='<svg viewBox="'+(-m*s)+' '+(-m*s)+' '+((W+2*m)*s)+' '+((H+2*m+ (court?0:0))*s)+'" role="img" aria-label="Generated floor plan, level '+lv+'" xmlns="http://www.w3.org/2000/svg" font-family="Hind, sans-serif">';
 extra.forEach(function(e){svg+='<rect x="'+sc(e.x)+'" y="'+sc(e.y)+'" width="'+sc(e.w)+'" height="'+sc(e.h)+'" fill="#e4ecdf" stroke="#9aa894" stroke-width="2" stroke-dasharray="8 6"/>';
  svg+='<text x="'+sc(e.x+e.w/2)+'" y="'+sc(e.y+e.h/2)+'" text-anchor="middle" font-size="'+Math.min(28,e.w*s/12)+'" fill="#4d5a48" font-weight="700">'+e.n.toUpperCase()+'</text>';});
 var legend=[],idx=0;
 boxes.forEach(function(b){var z=b.r.z||'circ';
  svg+='<rect x="'+sc(b.x)+'" y="'+sc(b.y)+'" width="'+sc(b.w)+'" height="'+sc(b.h)+'" fill="'+(ZC[z]||'#fff')+'" stroke="#171717" stroke-width="3"/>';
  var fs=Math.min(24,Math.max(10,b.h*s/5)),name=b.r.n,need=name.length*fs*.52;
  var cx=sc(b.x+b.w/2),cy=b.y+b.h/2;
  if(need<b.w*s-10&&b.h*s>fs*2.4){
   svg+='<text x="'+cx+'" y="'+sc(cy)+'" text-anchor="middle" font-size="'+fs+'" fill="#0a0a0a" font-weight="700">'+esc(name)+'</text>';
   svg+='<text x="'+cx+'" y="'+((cy*s)+fs*1.1).toFixed(1)+'" text-anchor="middle" font-size="'+(fs*.8)+'" fill="#555">'+fmt(b.r.a)+' sf</text>';
  }else{idx++;legend.push(idx+'. '+name+' ('+fmt(b.r.a)+' sf)');
   svg+='<text x="'+cx+'" y="'+((cy*s)+6).toFixed(1)+'" text-anchor="middle" font-size="'+Math.min(20,Math.max(9,Math.min(b.w,b.h)*s/2.2))+'" font-weight="700" fill="#0a0a0a">'+idx+'</text>';}
 });
 svg+='<rect x="0" y="0" width="'+sc(W)+'" height="'+sc(H)+'" fill="none" stroke="#0a0a0a" stroke-width="7"/>';
 // scale bar 20ft
 svg+='<g transform="translate(0,'+sc(H+3)+')"><rect width="'+sc(20)+'" height="6" fill="#0a0a0a"/><text x="'+sc(20)+'" dx="10" y="8" font-size="20" fill="#555">20 ft / 6 m</text></g>';
 svg+='</svg>';
 return {svg:svg,legend:legend,W:W,H:H};
}

/* ---------- MATERIALS ---------- */
function palette(t,top){
 var jp=top==='jp',med=top==='med',warm=(t.warm||0)>=(t.cool||0),L=[];
 function p(use,name,c,note){L.push({use:use,name:name,c:c,note:note});}
 var ext=d('material');
 if(ext==='this')p('Exterior Walls',jp?'Charred Timber (Shou Sugi Ban)':'Vertical Cedar Cladding',jp?'#2e2b28':'#a47a52','Ventilated rainscreen, oiled every few years');
 else if(ext==='that')p('Exterior Walls',med?'Whitewashed Lime Plaster over Stone':'Local Limestone and Lime Plaster',med?'#f1ece2':'#d6cbb8','Thick walls that stay cool');
 else if(ext==='both')p('Exterior Walls','Lime Plaster Base with Timber Upper','#d9cdb9','Stone or plaster below, timber above');
 else p('Exterior Walls','Smooth Mineral Render','#e9e5de','Quiet, low-maintenance shell');
 var rf=d('roof');p('Roof',rf==='that'?'Flat Membrane Roof, Gravel or Green':(med?'Handmade Clay Tile':'Standing Seam Metal'),rf==='that'?'#7d8a6a':(med?'#a4532f':'#6f7377'),rf==='that'?'Hidden gutters, roof deck option':'Deep eaves, large gutters');
 var fl=d('floor');p('Floors',fl==='that'?(med?'Terracotta and Limestone':'Honed Limestone Pavers'):fl==='both'?'White Oak in Rooms, Stone in Living':fl==='neither'?'Polished Concrete or Terrazzo':'Wide-Plank White Oak',fl==='that'?(med?'#b8714d':'#d8cfc0'):fl==='neither'?'#bdb8b0':'#cfb48c','Underfloor heating friendly');
 p('Kitchen',warm?'Rift Oak or Walnut Cabinetry':'Matte White Lacquer Cabinetry',warm?'#8a6242':'#f2f2f0',warm?'Honed marble or soapstone counters':'Quartzite counters, steel pulls');
 p('Baths',has('bath','a')?(jp?'Hinoki Tub and Stone Wet Room':'Stone Wet Room, Freestanding Tub'):'Zellige or Handmade Tile, Unlacquered Brass',has('bath','a')?(jp?'#e3c99a':'#cfc6b8'):'#7f9c94','Slip-resistant finishes');
 var w=d('windows');p('Windows',w==='that'?'Timber Casements in Deep Reveals':'Slim Thermally Broken Steel or Aluminium',w==='that'?'#6b5640':'#3a3d40',w==='that'?'Framed views, natural shade':'Pocketing sliders where it counts');
 if(has('ceiling','a'))p('Ceiling','Exposed Timber Beams','#9b7650','Glulam or reclaimed timber');else p('Ceiling','Smooth Lime or Gypsum Plaster','#f6f4ef','Shadow-gap detailing');
 p('Accents',has('mood','b')?'Dark Stained Timber and Bronze':warm?'Linen, Clay, and Aged Brass':'Grey Wool, Pale Ash, and Steel',has('mood','b')?'#3b322b':warm?'#e7dcc8':'#c9ccce','Soft goods and hardware');
 return L;
}

/* ---------- COSTS ---------- */
var REG={
 usavg:{n:'US Average',cur:'USD',fx:1,rate:{standard:[175,285],premium:[285,450],luxury:[450,750]},pool:[65e3,110e3],permit:.02,fee:[.08,.10,.12],src:[0,1,2]},
 ushigh:{n:'US High-Cost',cur:'USD',fx:1,rate:{standard:[300,450],premium:[450,800],luxury:[800,1500]},pool:[100e3,180e3],permit:.035,fee:[.08,.10,.12],src:[3,4,2]},
 th:{n:'Thailand',cur:'THB',fx:33.558,rate:{standard:[50,85],premium:[95,165],luxury:[165,305]},pool:[24e3,45e3],permit:.015,fee:[.07,.08,.10],src:[5,6,7,8,9,10]},
 jp:{n:'Japan',cur:'JPY',fx:150,rate:{standard:[131,187],premium:[187,262],luxury:[262,375]},pool:[60e3,120e3],permit:.02,fee:[.08,.10,.12],src:[11,12,13]},
 eu:{n:'Europe (West)',cur:'EUR',fx:0.87,rate:{standard:[171,278],premium:[278,406],luxury:[406,641]},pool:[50e3,95e3],permit:.03,fee:[.08,.10,.12],src:[14,15,16,17]}
};
var TIERS={standard:{n:'Standard',i:0,m:1,cont:.10,land:[.03,.05]},premium:{n:'Premium',i:1,m:1.5,cont:.12,land:[.05,.07]},luxury:{n:'Luxury',i:2,m:2.3,cont:.15,land:[.07,.10]}};
var SOURCES=[
 ['BuildCrux, Custom Home Cost Benchmarks 2026 (entry-custom $175-285, mid-luxury $285-450, high-luxury $450-750+/sq ft)','https://buildcrux.com/for/custom-home-builders/cost-benchmarks'],
 ['LatestCost, Custom House Cost Per Square Foot in the U.S. 2026 ($150-400+/sq ft)','https://latestcost.com/custom-house-cost-per-square-foot-u-s/'],
 ['Opendoor, How Much Does It Cost to Build a House in 2026 (standard $150-250, custom $400+, high-cost $1,000+/sq ft)','https://www.opendoor.com/articles/how-much-does-it-cost-to-build-a-house'],
 ['BuildMat Insight, Luxury House Cost Per Square Foot 2026 (high-end $450-850, coastal markets 1.25-1.6x)','https://buildmatinsight.com/construction-cost/app-cost/luxury-house-cost-per-square-foot-calculator'],
 ['BuildGenius, Luxury Home Construction Cost 2026 by State (CA, NY, HI highest)','https://buildgenius.app/cost-to-build/luxury-home'],
 ['Max Weberman, Thailand Construction Cost Estimate (Oct 2026): 61k / 99k / 166k THB per m2 all-in for High-End, Premium, and International Luxury; market benchmarks, fees 7-10%, contingency 10-15%','#thailand-pdf'],
 ['25design, Luxury Home Construction Cost per sqm (typical 12-20k, luxury 30-60k THB/m2)','https://www.25design.co.th/post/luxury-home-construction-cost-per-sqm'],
 ['Architect Phuket, Phuket Villa Build Cost 2026 (standard 25-30k to luxury 100k+ THB/m2)','https://architectphuket.com/phuket-villa-build-cost-2026/'],
 ['Chiang Rai Times, Building Costs in Thailand (Chiang Mai, Bangkok ranges)','https://www.chiangraitimes.com/expat-life/building-costs-thailand/'],
 ['Quality Touch Pools, Pricing Guide (4x8 m concrete pool from 800k THB)','https://qualitytouchpools.com/pricing-guide/'],
 ['Bank of Thailand rate via ThaiFXRates, 1 USD = 33.558 THB (9 Oct 2026)','https://www.thaifxrates.net/ER_PDF_EN.pdf'],
 ['Towa Construction, Custom-Home Build Cost Per Tsubo (timber 0.7-1.2M, RC 1.2-1.9M yen/tsubo main works; all-in 1.4-1.5x)','https://touwa-corp.co.jp/en/tools/budget/'],
 ['INA Real Estate, citing JHF Flat 35 Survey FY2025 (national average about 1.19M yen/tsubo, about $223/sq ft)','https://media.ina-gr.com/en/archives/column/house-maker-features-guide'],
 ['immoJapon, How Much It Costs to Build a House in Japan 2026','https://immojapon.com/articles/cost-to-build-a-house-in-japan'],
 ['E1 Community, Cost to Build a House in Germany 2026 (about EUR 2,600-3,000/m2 building cost)','https://www.e1-holding.com/community/en/wissen-baukosten-einfamilienhaus/'],
 ['Wolfblanc Architects, Cost of Building a House in Spain 2026 (EUR 1,200-3,000/m2)','https://wolfblanc.com/en/cost-building-house-spain-honest-guide-2026/'],
 ['BWS, How Much Does It Cost to Build a House in 2026 (Western Europe EUR 2,800-4,500/m2)','https://bws-windows.com/en/blog/how-much-does-it-cost-to-build-a-house/'],
 ['Destatis via Presseportal, residential construction prices +5.5% YoY (Aug 2026)','https://www.presseportal.de/pm/32102/6367821']
];
function cost(P,region,tier){
 var R=REG[region],T=TIERS[tier],rt=R.rate[tier],A=P.A,lines=[];
 function L(n,lo,hi,note){lines.push({n:n,lo:lo,hi:hi,note:note||''});}
 var h=[A*rt[0],A*rt[1]];function sh(f,n,note){L(n,h[0]*f,h[1]*f,note);}
 var shell=.34+(has('material','b')?.02:0)+(has('court','a')?.02:0)+(P.two?-.01:0);
 sh(shell,'Shell and Structure','Foundations, frame, walls, roof');
 sh(.22+(has('layer','b')?.01:0)+(has('ceiling','a')?.01:0),'Interior Finishes','Floors, walls, ceilings, joinery, doors');
 sh(.11+(has('windows','a')?.03:0)+(has('indoor','a')?.03:0)-(d('windows')==='that'?.02:0),'Glazing','Windows, sliding and pocket doors');
 sh(.16+(has('well','a')?.01:0)+(has('bath','a')?.01:0),'MEP','Mechanical, electrical, plumbing, AC');
 sh(.17+Math.max(0,P.baths-2)*.012,'Kitchen and Baths','Cabinetry, counters, fixtures, appliances');
 var oa=0,on=[];P.out.forEach(function(o){if(o.pool)return;var f=o.garage?.4:o.name==='Central Courtyard'?.12:.3;oa+=o.area*f;on.push(o.name);});
 var ol=oa*rt[0],oh=oa*rt[1],pools=P.out.filter(function(o){return o.pool;});
 pools.forEach(function(o){var k=o.pool==='pond'?1.15:1;ol+=R.pool[0]*T.m*k;oh+=R.pool[1]*T.m*k;on.push(o.name);});
 L('Outdoor Structures and Pool',ol,oh,on.length?on.join(', '):'None selected');
 var lf=T.land,g=(has('land','a')||has('land','b'))?.01:0;L('Landscape',h[0]*(lf[0]+g),h[1]*(lf[1]+g),has('land','a')?'Stone, moss, pruned trees':has('land','b')?'Tropical planting, shade':'Planting, paths, drainage');
 var sub=[0,0];lines.forEach(function(l){sub[0]+=l.lo;sub[1]+=l.hi;});
 var fee=R.fee[T.i];L('Design Fees',sub[0]*fee,sub[1]*fee,Math.round(fee*100)+'% architecture and engineering');
 L('Permits and Utilities',sub[0]*R.permit,sub[1]*R.permit,'Permits, surveys, soil test, connections');
 var s2=[0,0];lines.forEach(function(l){s2[0]+=l.lo;s2[1]+=l.hi;});
 L('Contingency',s2[0]*T.cont,s2[1]*T.cont,Math.round(T.cont*100)+'% for the unknowns');
 var tot=[0,0];lines.forEach(function(l){tot[0]+=l.lo;tot[1]+=l.hi;});
 return {lines:lines,tot:tot,rate:rt,R:R,T:T,psf:[tot[0]/A,tot[1]/A]};
}
function usd(v){if(v>=1e6)return '$'+(v/1e6).toFixed(v>=1e7?1:2)+'M';if(v>=1e3)return '$'+Math.round(v/1e3)+'k';return '$'+Math.round(v);}
function local(v,R){var x=v*R.fx;var sym={THB:'฿',JPY:'¥',EUR:'€'}[R.cur];if(!sym)return '';if(x>=1e6)return sym+(x/1e6).toFixed(x>=1e8?0:1)+'M';return sym+Math.round(x/1e3)+'k';}

/* ---------- NARRATIVE ---------- */
var DESC={
 roof:{this:'Low hip roofs with deep eaves shade the walls and shed heavy rain.',that:'A flat roof keeps the profile crisp and can carry a roof terrace or planting.',both:'Hip roofs cover the main wings, joined by flat-roofed links.',neither:'A simple pitched gable keeps the roof honest and economical.'},
 material:{this:'The outside is clad in natural timber that will silver gracefully.',that:'Walls are heavy stone and lime plaster, cool to the touch and built to last.',both:'A stone and plaster base anchors the house, with timber above.',neither:'A smooth mineral render keeps the exterior quiet.'},
 levels:{this:'Everything sits on one level, with no stairs to climb.',that:'Two stories keep the footprint tight and lift the bedrooms toward the view.',both:'Mostly one level, with a smaller upper floor where it pays off.'},
 court:{this:'Rooms wrap a private courtyard, so every space has a garden view.',that:'The house sits openly on its lawn, with long views across the site.',both:'A small inner courtyard pairs with an open lawn on the garden side.'},
 indoor:{this:'Glass walls slide away so living rooms open fully to the terrace.',that:'Windows are placed deliberately to frame the best views.',both:'The main living space opens fully, while quieter rooms get framed views.'},
 kitchen:{this:'The kitchen is open to living and dining, the social heart of the house.',that:'The kitchen is its own room, keeping cooking out of sight.',both:'An open show kitchen is backed by a hidden working kitchen.'},
 living:{this:'The living room is low and cozy, built around a fireplace.',that:'The living room rises tall and airy.',both:'A tall main room steps down into a cozy fireside nook.'},
 bath:{this:'Baths are spa-like wet rooms in stone with a soaking tub.',that:'Baths are classic, with good tile and a freestanding tub.',both:'The primary bath is a spa; the others stay classic.'},
 mood:{this:'Light is bright and even.',that:'Light is soft and moody, with deep shadow and texture.',both:'Bright day rooms contrast with dimmer, moody evening rooms.'},
 layer:{this:'Interiors are minimal: few objects, each one chosen.',that:'Interiors are layered with art, books, and textiles.',both:'Calm, minimal architecture holds a layered collection.'},
 pool:{this:'A long lap pool runs along the garden.',that:'A natural swimming pond, filtered by plants, sits in the garden.',both:'A lap pool for training meets a planted natural pond.'},
 outdoor:{this:'A covered veranda gives you an outdoor room in any weather.',that:'An open stone terrace is set for dining under the sky.',both:'A covered veranda steps down to an open terrace.'}
};
var EXCL={pool:'No pool',well:'No sauna or gym',work:'No dedicated study or workshop',court:'No courtyard or big lawn focus',outdoor:'No big veranda or terrace',land:'No themed garden',style:'Neither Japanese nor Mediterranean as the lead style'};
function narrative(P,top,sec,t){
 var s=[];
 var lead='This is '+top.s.blurb+(sec?', with '+sec.s.adj.replace('Warm Minimalist','minimalist')+' influences drawn from your Both answers and close scores':'')+'.';
 s.push(lead);
 s.push('The plan fits '+fmt(P.A)+' sq ft ('+fmt(sqm(P.A))+' m²) with '+P.beds+' bedroom'+(P.beds>1?'s':'')+' and '+P.baths+' bath'+(P.baths>1?'s':'')+'.');
 ['court','levels','roof','material','indoor','kitchen','living','bath','outdoor','pool','mood','layer'].forEach(function(k){var a=d(k);if(DESC[k]&&DESC[k][a])s.push(DESC[k][a]);});
 return s;
}

/* ---------- RENDER: INTRO ---------- */
function render(){
 var h=location.hash;
 $('#restartTop').hidden=S.screen==='intro'&&!Object.keys(S.ans).length;
 if(h==='#credits')return renderCredits();
 if(h==='#sources')return renderSources();
 if(S.screen==='quiz')return renderQuiz();
 if(S.screen==='results')return renderResults();
 renderIntro();
}
function renderIntro(){
 var I=S.intro;
 app.innerHTML='<section class="hero">'+
 '<div><p class="label">This or That Home</p><h1>Find The House You Want To Build</h1>'+
 '<p class="lead">Not sure what your house should look like? Tell me the basics, then pick between 20 pairs of photos. You get a design concept, a room program, a floor plan, a material palette, and a rough price.</p>'+
 '<div class="hero-img"><img src="img/court_a.jpg" alt="A courtyard garden surrounded by a single-story house" width="800" height="600"></div></div>'+
 '<form class="form" id="introForm" novalidate>'+
 '<h2>The Basics</h2>'+
 '<div class="field"><label for="sqft">House Size (sq ft)</label><input id="sqft" name="sqft" type="number" inputmode="numeric" min="600" max="20000" step="50" value="'+esc(I.sqft)+'"><div class="hint" id="sqm"></div></div>'+
 '<div class="row2"><div class="field"><label for="beds">Bedrooms</label><div class="stepper"><button type="button" class="mw-hover" data-step="beds" data-d="-1" aria-label="Fewer bedrooms">−</button><input id="beds" type="number" inputmode="numeric" min="1" max="10" step="1" value="'+esc(I.beds)+'"><button type="button" class="mw-hover" data-step="beds" data-d="1" aria-label="More bedrooms">+</button></div></div>'+
 '<div class="field"><label for="baths">Bathrooms</label><div class="stepper"><button type="button" class="mw-hover" data-step="baths" data-d="-0.5" aria-label="Fewer bathrooms">−</button><input id="baths" type="number" inputmode="decimal" min="1" max="10" step="0.5" value="'+esc(I.baths)+'"><button type="button" class="mw-hover" data-step="baths" data-d="0.5" aria-label="More bathrooms">+</button></div></div></div>'+
 '<div class="field"><label for="notes">Notes</label><textarea id="notes" placeholder="Must-haves, location, budget, lifestyle. Example: Phuket hillside, home office, guest room for parents, budget 25M baht.">'+esc(I.notes)+'</textarea><div class="hint">Location and budget help set the price region. Words like office, gym, garage, or guests add rooms.</div></div>'+
 '<div class="actions"><button class="btn btn-solid mw-hover" type="submit">'+(Object.keys(S.ans).length?'Continue':'Start The 20 Questions')+'</button>'+
 (Object.keys(S.ans).length?'<button class="btn mw-hover" type="button" id="startFresh">Start Over</button>':'')+'</div>'+
 '</form></section>';
 var f=$('#introForm');
 function upd(){var v=+$('#sqft').value||0;$('#sqm').textContent='About '+fmt(sqm(v))+' m²';}
 upd();$('#sqft').addEventListener('input',upd);
 f.addEventListener('click',function(e){var b=e.target.closest('[data-step]');if(!b)return;var i=$('#'+b.dataset.step),v=(+i.value||0)+(+b.dataset.d);v=Math.max(+i.min,Math.min(+i.max,v));i.value=v;});
 f.addEventListener('submit',function(e){e.preventDefault();
  var sq=Math.max(600,Math.min(20000,+$('#sqft').value||2400)),bd=Math.max(1,Math.min(10,Math.round(+$('#beds').value||3))),bt=Math.max(1,Math.min(10,Math.round((+$('#baths').value||2)*2)/2));
  S.intro={sqft:sq,beds:bd,baths:bt,notes:$('#notes').value.slice(0,2000)};
  var N=parseNotes(S.intro.notes);if(N.region&&!S.regionSet)S.region=N.region;
  S.screen=S.i>=Q.length?'results':'quiz';save();go();});
 var sf=$('#startFresh');if(sf)sf.addEventListener('click',restart);
}
function go(){window.scrollTo(0,0);render();document.body.classList.toggle('quiz',S.screen==='quiz');app.focus({preventScroll:true});}
function restart(){if(Object.keys(S.ans).length&&!confirm('Start over and clear your answers?'))return;S=def();save();location.hash='';go();}

/* ---------- RENDER: QUIZ ---------- */
function renderQuiz(){
 var i=Math.min(S.i,Q.length-1),q=Q[i],a=S.ans[q.id],cls=a==='this'?'sel-a':a==='that'?'sel-b':a==='both'?'sel-both':a==='neither'?'sel-neither':'';
 function card(o,k){return '<button type="button" class="card '+k+' '+cls+' mw-hover" data-ans="'+(k==='a'?'this':'that')+'" aria-label="'+(k==='a'?'This: ':'That: ')+esc(o.title)+'. '+esc(o.cap)+'">'+
  '<span class="tag">'+(k==='a'?'This':'That')+'</span><span class="ph"><img src="'+o.img+'" alt="'+esc(o.title)+'" width="800" height="600" loading="eager"></span>'+
  '<span class="cap"><h3>'+esc(o.title)+'</h3><p>'+esc(o.cap)+'</p></span></button>';}
 function ab(k,l){return '<button type="button" class="btn ans '+k+(a===k?' on':'')+' mw-hover" data-ans="'+k+'" aria-pressed="'+(a===k)+'">'+IC[k]+'<span>'+l+'</span></button>';}
 app.innerHTML='<div class="qtop"><span class="label">Question '+(i+1)+' of '+Q.length+'</span><span class="label">'+Object.keys(S.ans).length+' Answered</span></div>'+
 '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="'+Q.length+'" aria-valuenow="'+i+'"><i style="width:'+(i/Q.length*100)+'%"></i></div>'+
 '<div class="qhead"><h2>'+esc(q.head)+'</h2></div>'+
 '<div class="pair">'+card(q.opts[0],'a')+card(q.opts[1],'b')+'</div>'+
 '<div class="answers" role="group" aria-label="Your answer">'+ab('this','This')+ab('neither','Neither')+ab('both','Both')+ab('that','That')+'</div>'+
 '<div class="notebox"><button type="button" class="btn btn-quiet notebtn mw-hover'+(noteOf(q.id)?' has':'')+'" id="noteBtn" aria-expanded="false">'+(noteOf(q.id)?'✎ Note':'Add Note')+'</button>'+
 '<div class="noteedit" id="noteEdit" hidden><textarea id="noteText" rows="3" maxlength="1000" placeholder="Optional note. Answer any time; it saves with your pick." aria-label="Note">'+esc(noteOf(q.id))+'</textarea></div></div>'+
 '<div class="qfoot"><button type="button" class="btn btn-quiet mw-hover" id="back">'+(i===0?'Basics':'Back')+'</button><button type="button" class="btn btn-quiet mw-hover" id="skip">Skip</button></div>';
 app.querySelectorAll('[data-ans]').forEach(function(b){b.addEventListener('click',function(){answer(b.dataset.ans);});});
 $('#noteBtn').addEventListener('click',function(){var e=$('#noteEdit'),o=e.hidden;e.hidden=!o;this.setAttribute('aria-expanded',o);if(o)$('#noteText').focus({preventScroll:true});});
 $('#noteText').addEventListener('input',function(){var b=$('#noteBtn'),t=this.value.trim();b.textContent=t?'✎ Note':'Add Note';b.classList.toggle('has',!!t);});
 $('#back').addEventListener('click',back);$('#skip').addEventListener('click',function(){answer('skip');});
 var n=Q[i+1];if(n)n.opts.forEach(function(o){var im=new Image();im.src=o.img;});
}
/* ---------- NOTES ON VOTES (localStorage only; never on the public page) ---------- */
function noteOf(id){return (S.notes&&S.notes[id]&&S.notes[id].note)||'';}
function setNote(id,t){S.notes=S.notes||{};t=String(t||'').trim().slice(0,1000);if(t)S.notes[id]={note:t,ts:new Date().toISOString()};else delete S.notes[id];}
var ANS_L={this:'This',that:'That',both:'Both',neither:'Neither',skip:'Skipped'};
function pickLabel(q,a){return a==='this'?q.opts[0].title:a==='that'?q.opts[1].title:a==='both'?q.opts[0].title+' + '+q.opts[1].title:'';}
function resultsText(){return 'THIS OR THAT HOME RESULTS ('+new Date().toISOString().slice(0,10)+')\n'+Q.slice().sort(function(a,b){return a.head.localeCompare(b.head);}).map(function(q){var a=d(q.id),n=noteOf(q.id);return q.head+': '+ANS_L[a]+(pickLabel(q,a)?' ('+pickLabel(q,a)+')':'')+(n?' | Note: '+n:'');}).join('\n');}
function resultsJson(){return {app:'This or That Home',exported:new Date().toISOString(),intro:S.intro,answers:Q.map(function(q){var a=S.ans[q.id]||null;return {id:q.id,question:q.head,answer:a,pick:a?pickLabel(q,a)||null:null,note:noteOf(q.id)||null,noteTs:(S.notes&&S.notes[q.id]&&S.notes[q.id].ts)||null};})};}
var OPEN={};
function answersHTML(){return '<section class="sec" id="myAnswers"><h2>Your Answers</h2><div class="actions"><button class="btn mw-hover" id="copyRes" type="button">Copy Results</button><button class="btn mw-hover" id="jsonRes" type="button">Export JSON</button></div><div class="arows">'+
 Q.slice().sort(function(a,b){return a.head.localeCompare(b.head);}).map(function(q){var a=d(q.id),n=noteOf(q.id),o=!!OPEN[q.id];
  return '<div class="arow" data-q="'+q.id+'"><button type="button" class="ahead" aria-expanded="'+o+'"><span class="at">'+esc(q.head)+'</span>'+(n?'<span class="noteicon" aria-label="Has Note" title="Has Note">✎</span>':'')+'<span class="apill '+a+'">'+ANS_L[a]+'</span></button>'+
  '<div class="abody"'+(o?'':' hidden')+'>'+(pickLabel(q,a)?'<p class="small">Pick: '+esc(pickLabel(q,a))+'</p>':'')+'<label class="label" for="n_'+q.id+'">Note</label><textarea id="n_'+q.id+'" class="rownote" rows="2" maxlength="1000" placeholder="Add a note">'+esc(n)+'</textarea><button type="button" class="btn btn-quiet savenote mw-hover">Save Note</button></div></div>';}).join('')+'</div></section>';}
function bindAnswers(){
 $('#myAnswers').addEventListener('click',function(e){var r=e.target.closest('.arow');
  if(e.target.closest('#copyRes')){var t=resultsText();if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){flash('Results Copied');},function(){fallbackCopy(t);});else fallbackCopy(t);return;}
  if(e.target.closest('#jsonRes')){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(resultsJson(),null,2)],{type:'application/json'}));a.download='this_or_that_home.json';document.body.appendChild(a);a.click();a.remove();flash('JSON Downloaded');return;}
  if(!r)return;var id=r.dataset.q;
  if(e.target.closest('.savenote')){setNote(id,r.querySelector('.rownote').value);save();flash(noteOf(id)?'Note Saved':'Note Cleared');OPEN[id]=1;var y=window.scrollY;$('#myAnswers').outerHTML=answersHTML();bindAnswers();window.scrollTo(0,y);return;}
  if(e.target.closest('.ahead')){OPEN[id]=!OPEN[id];r.querySelector('.abody').hidden=!OPEN[id];r.querySelector('.ahead').setAttribute('aria-expanded',!!OPEN[id]);}
 });}
function answer(v){var q=Q[S.i],nt=$('#noteText');if(nt)setNote(q.id,nt.value);S.ans[q.id]=v;S.i++;if(S.i>=Q.length){S.screen='results';}save();go();}
function back(){if(S.i<=0){S.screen='intro';save();return go();}S.i--;delete S.ans[Q[S.i].id];save();go();}
document.addEventListener('keydown',function(e){if(S.screen!=='quiz'||location.hash||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
 var m={ArrowLeft:'this',ArrowRight:'that',ArrowUp:'both',ArrowDown:'neither'}[e.key];if(m){e.preventDefault();answer(m);}else if(e.key==='Backspace'){e.preventDefault();back();}});

/* ---------- RENDER: RESULTS ---------- */
var LAST={};
function renderResults(){
 var t=traits(),sc=styleScores(t),top=sc[0],sec=(sc[1].v>0&&sc[1].v>=top.v*.75)?sc[1]:null;
 if(top.v<=0){top={s:STYLES[6],v:0};sec=null;}
 var P=program(),N=P.N;
 if(!S.region)S.region=N.region||'usavg';
 var nounCourt=has('court','a')?'Courtyard House':top.s.noun;
 var name=sec?(top.s.adj+' and '+sec.s.adj+' '+nounCourt):(has('court','a')&&top.s.id!=='med'?top.s.adj+' Courtyard House':top.s.name);
 if(top.s.id==='modern'&&!sec)name='Warm Minimalist '+(has('court','a')?'Courtyard House':'Modern House');
 var narr=narrative(P,top,sec,t),pal=palette(t,top.s.id);
 var NN=P.N,ov={work:NN.office||NN.workshop,well:NN.gym||NN.sauna,pool:NN.pool};var excl=Q.filter(function(q){return S.ans[q.id]==='neither'&&EXCL[q.id]&&!ov[q.id];}).map(function(q){return EXCL[q.id];});
 var chosen=[];Q.forEach(function(q){var a=S.ans[q.id];if(a==='this'||a==='both')chosen.push(q.opts[0]);if(a==='that'||a==='both')chosen.push(q.opts[1]);});
 var cnt={this:0,that:0,both:0,neither:0,skip:0};Q.forEach(function(q){cnt[d(q.id)]++;});
 var levels=P.two?[1,2]:[1],plans=levels.map(function(l){return planSVG(P,l);});
 var heroImg=chosen[0]?chosen[0].img:'img/style_a.jpg';
 var traitsTop=Object.keys(t).filter(function(k){return t[k]>0;}).sort(function(a,b){return t[b]-t[a];}).slice(0,6);
 var TN={jp:'Japanese',med:'Mediterranean',timber:'Timber',stone:'Stone',warm:'Warm',cool:'Cool',minimal:'Minimal',layered:'Layered',bright:'Bright',moody:'Moody',open:'Open to Outdoors',court:'Courtyard',single:'Single Level',tall:'Tall Volumes',tropical:'Tropical',classic:'Classic',modern:'Modern',nordic:'Nordic',prairie:'Prairie',eaves:'Deep Eaves',glass:'Big Glass',framed:'Framed Views',spa:'Spa',sauna:'Sauna',gym:'Gym',study:'Study',workshop:'Workshop',lap:'Lap Pool',pond:'Natural Pond',veranda:'Veranda',terrace:'Terrace',garden:'Garden',beams:'Exposed Beams',cozy:'Cozy',closed:'Closed Kitchen',lawn:'Lawn',rustic:'Rustic',nature:'Natural'};
 var rooms=P.rooms.slice(),tot=0;
 var progRows=rooms.map(function(r){var a=r.area+(r.area2||0);tot+=a;return '<tr><td>'+esc(r.name)+(P.two&&!r.circ?' <span class="small">L'+r.lv+'</span>':'')+'</td><td class="n">'+fmt(a)+'</td><td class="n">'+fmt(sqm(a))+'</td></tr>';}).join('');
 var outRows=P.out.map(function(o){return '<tr><td>'+esc(o.name)+'</td><td class="n">'+fmt(o.area)+'</td><td class="n">'+fmt(sqm(o.area))+'</td></tr>';}).join('');
 app.innerHTML=
 '<section class="res-hero"><div><p class="label">Your House Design</p><h1 class="style-name">'+esc(name)+'</h1>'+
 '<p class="lead">'+esc(narr[0])+'</p><ul class="chips">'+traitsTop.map(function(k){return '<li>'+(TN[k]||k)+'</li>';}).join('')+'</ul></div>'+
 '<div class="hero-img"><img src="'+heroImg+'" alt="Lead image from your picks" width="800" height="600"></div></section>'+
 '<div class="res-actions noprint"><button class="btn btn-solid mw-hover" id="pdf" type="button">Download PDF</button><button class="btn mw-hover" id="redo" type="button">Change Answers</button><button class="btn mw-hover" id="edit" type="button">Edit Basics</button></div>'+
 '<section class="sec"><h2>The Concept</h2>'+narr.slice(1).map(function(p){return '<p>'+esc(p)+'</p>';}).join('')+
 (excl.length?'<p><strong>Left out on purpose:</strong> '+esc(excl.join('; '))+'.</p>':'')+
 '<p class="small">Your answers: '+cnt.this+' This, '+cnt.that+' That, '+cnt.both+' Both, '+cnt.neither+' Neither, '+cnt.skip+' Skipped. Style scores: '+sc.slice(0,3).map(function(x){return x.s.adj+' '+x.v.toFixed(1);}).join(', ')+'.</p></section>'+
 '<section class="sec plan"><h2>Floor Plan Diagram</h2>'+plans.map(function(p,ix){return (P.two?'<h3>Level '+(ix+1)+'</h3>':'')+p.svg+(p.legend.length?'<p class="plan-legend">'+esc(p.legend.join(' · '))+'</p>':'');}).join('')+
 '<p class="plan-legend">A block diagram sized to the program, not a drawn plan. Zones: public (warm), private (sage), service and flex (grey).</p></section>'+
 '<div class="grid2">'+'<section class="sec"><h2>Room Program</h2><table><thead><tr><th>Room</th><th class="n">Sq Ft</th><th class="n">m²</th></tr></thead><tbody>'+progRows+'</tbody><tfoot><tr><td>Total Conditioned</td><td class="n">'+fmt(tot)+'</td><td class="n">'+fmt(sqm(tot))+'</td></tr></tfoot></table>'+
 (outRows?'<h3 style="margin-top:18px">Outdoor and Extras</h3><table><tbody>'+outRows+'</tbody></table>':'')+
 (P.notes.length?'<p class="notice" style="margin-top:14px">'+P.notes.map(esc).join(' ')+'</p>':'')+'</section>'+
 '<section class="sec"><h2>Materials and Finishes</h2><div class="swatches">'+pal.map(function(p){return '<div class="sw"><i style="background:'+p.c+'"></i><div><span class="label">'+esc(p.use)+'</span><b>'+esc(p.name)+'</b>'+esc(p.note)+'</div></div>';}).join('')+'</div></section>'+
 '</div>'+'<section class="sec"><h2>Mood Board</h2>'+(chosen.length?'<div class="mood">'+chosen.map(function(o){return '<figure><img src="'+o.img+'" alt="'+esc(o.title)+'" loading="lazy" width="800" height="600"><figcaption>'+esc(o.title)+'</figcaption></figure>';}).join('')+'</div>':'<p>You did not pick any photos. Try a few This or That answers.</p>')+'</section>'+
 '<section class="sec" id="price"><h2>Rough Price Breakdown</h2><p class="notice"><strong>Rough estimate, not a quote.</strong> Order-of-magnitude ranges for early budgeting, built from published 2026 cost-per-area data. Excludes land, financing, furniture, and taxes beyond those noted. Get real bids from local builders.</p>'+
 '<p class="label" style="margin-top:14px">Region</p><div class="seg" id="regSeg" role="group" aria-label="Region">'+Object.keys(REG).map(function(k){return '<button type="button" class="btn mw-hover'+(S.region===k?' on':'')+'" data-reg="'+k+'" aria-pressed="'+(S.region===k)+'">'+REG[k].n+'</button>';}).join('')+'</div>'+
 '<p class="label">Finish Tier</p><div class="seg" id="tierSeg" role="group" aria-label="Finish tier">'+Object.keys(TIERS).map(function(k){return '<button type="button" class="btn mw-hover'+(S.tier===k?' on':'')+'" data-tier="'+k+'" aria-pressed="'+(S.tier===k)+'">'+TIERS[k].n+'</button>';}).join('')+'</div>'+
 '<div id="costOut"></div></section>'+
 answersHTML()+
 '<section class="sec" id="sources"><h2>Cost Sources</h2>'+sourcesHTML()+'</section>'+
 '<section class="sec"><h2>Start Again</h2><p>Want to try different answers or another size?</p><div class="actions"><button class="btn mw-hover" id="over" type="button">Start Over</button><a class="btn mw-hover" href="#credits">Photo Credits</a></div></section>';
 LAST={name:name,P:P};
 drawCost(P);
 $('#regSeg').addEventListener('click',function(e){var b=e.target.closest('[data-reg]');if(!b)return;S.region=b.dataset.reg;S.regionSet=1;save();segs();drawCost(P);});
 $('#tierSeg').addEventListener('click',function(e){var b=e.target.closest('[data-tier]');if(!b)return;S.tier=b.dataset.tier;save();segs();drawCost(P);});
 $('#pdf').addEventListener('click',function(){window.print();});
 $('#redo').addEventListener('click',function(){S.screen='quiz';S.i=Q.length-1;delete S.ans[Q[S.i].id];save();go();});
 $('#edit').addEventListener('click',function(){S.screen='intro';save();go();});
 $('#over').addEventListener('click',restart);
 bindAnswers();
}
function segs(){app.querySelectorAll('[data-reg]').forEach(function(b){var on=b.dataset.reg===S.region;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});
 app.querySelectorAll('[data-tier]').forEach(function(b){var on=b.dataset.tier===S.tier;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);});}
function drawCost(P){
 var C=cost(P,S.region,S.tier),R=C.R,loc=R.cur!=='USD';
 var bud='';if(P.N.budget){var bv=P.N.budget.cur==='THB'?P.N.budget.v/33.558:P.N.budget.v;
  bud='<p class="notice">Your noted budget: '+usd(bv)+(P.N.budget.cur==='THB'?' (฿'+fmt(P.N.budget.v)+')':'')+'. '+(bv>=C.tot[1]?'That covers this range.':bv>=C.tot[0]?'That falls inside this range. Hold finishes and glazing to the lower end.':'That is below this range. Consider a smaller size, a lower tier, or fewer extras.')+'</p>';}
 LAST.cost=C;
 $('#costOut').innerHTML='<div class="total"><strong id="totalRange">'+usd(C.tot[0])+' – '+usd(C.tot[1])+'</strong>'+(loc?'<span>'+local(C.tot[0],R)+' – '+local(C.tot[1],R)+'</span>':'')+'</div>'+
 '<p class="small">Build rate used: $'+C.rate[0]+'–$'+C.rate[1]+' per sq ft of house ('+R.n+', '+C.T.n+'). All-in: about $'+fmt(C.psf[0])+'–$'+fmt(C.psf[1])+' per sq ft ($'+fmt(C.psf[0]*10.7639)+'–$'+fmt(C.psf[1]*10.7639)+' per m²).'+(loc?' FX: 1 USD = '+R.fx+' '+R.cur+'.':'')+'</p>'+bud+
 '<table><thead><tr><th>Line Item</th><th class="n">Low</th><th class="n">High</th></tr></thead><tbody>'+C.lines.map(function(l){return '<tr><td>'+esc(l.n)+'<div class="small">'+esc(l.note)+'</div></td><td class="n">'+usd(l.lo)+'</td><td class="n">'+usd(l.hi)+'</td></tr>';}).join('')+
 '</tbody><tfoot><tr><td>Total (Excluding Land)</td><td class="n">'+usd(C.tot[0])+'</td><td class="n">'+usd(C.tot[1])+'</td></tr></tfoot></table>'+
 '<p class="small" style="margin-top:10px">Sources for '+R.n+': '+R.src.map(function(i){return '['+(i+1)+']';}).join(' ')+'. See Cost Sources below.</p>';
}
function sourcesHTML(){return '<ol class="srcs">'+SOURCES.map(function(s){var u=s[1];return '<li>'+esc(s[0])+(u.charAt(0)==='#'?' (PDF prepared for Max, not online)':' <a href="'+u+'" target="_blank" rel="noopener">'+esc(u.replace(/^https?:\/\//,'').split('/')[0])+'</a>')+'</li>';}).join('')+'</ol>'+
 '<p class="small">Ranges are hard building cost per sq ft of house; the app adds outdoor works, landscape, fees, permits, and contingency on top. Thailand: 18–30k / 35–60k / 60–110k THB per m² building cost. Japan: ¥0.7–1.0M / 1.0–1.4M / 1.4–2.0M per tsubo at ¥150 per USD. Europe: €1,600–2,600 / 2,600–3,800 / 3,800–6,000 per m² at 1 EUR = 1.15 USD. Rates move; check locally.</p>';}
function renderCredits(){
 var all=[];Q.forEach(function(q){q.opts.forEach(function(o){all.push(o);});});
 app.innerHTML='<p><a class="btn btn-quiet mw-hover" href="#">Back</a></p><h1>Photo Credits</h1><p>All photos are openly licensed (Creative Commons, CC0, or public domain) and cropped for this app.</p><ol class="credits">'+
 all.map(function(o){var c=o.credit;return '<li><strong>'+esc(o.title)+'</strong>: <a href="'+esc(c.url)+'" target="_blank" rel="noopener">'+esc(c.name)+'</a> by '+esc(c.by)+', '+esc(c.lic)+'</li>';}).join('')+'</ol>';}
function renderSources(){app.innerHTML='<p><a class="btn btn-quiet mw-hover" href="#">Back</a></p><h1>Cost Sources</h1>'+sourcesHTML();}

/* ---------- SHARE ---------- */
function shareText(){
 var url=location.origin+location.pathname;
 if(S.screen==='results'&&LAST.cost){var C=LAST.cost,P=LAST.P;return {url:url,text:'My This or That Home: '+LAST.name+'. '+fmt(P.A)+' sq ft, '+P.beds+' bed / '+P.baths+' bath. Rough cost '+usd(C.tot[0])+'–'+usd(C.tot[1])+' ('+C.R.n+', '+C.T.n+').'+notesLine()};}
 var c={this:0,that:0,both:0,neither:0};Object.keys(S.ans).forEach(function(k){if(c[S.ans[k]]!=null)c[S.ans[k]]++;});
 var n=Object.keys(S.ans).length;
 return {url:url,text:n?'My picks so far: '+c.this+' This, '+c.that+' That, '+c.both+' Both, '+c.neither+' Neither.':'Design your house with 20 This or That questions.'};
}
function notesLine(){var ns=Q.filter(function(q){return noteOf(q.id);});return ns.length?' Notes: '+ns.slice(0,3).map(function(q){return q.head+': '+noteOf(q.id).slice(0,80);}).join('; ')+(ns.length>3?' (+'+(ns.length-3)+' more)':'')+'.':'';}
function flash(m){var e=$('#shareMsg');e.textContent=m;clearTimeout(flash.t);flash.t=setTimeout(function(){e.textContent='';},2500);}
$('#shareBtn').addEventListener('click',function(){
 var s=shareText(),full=s.text+' '+s.url;
 if(navigator.share){navigator.share({title:'This or That Home',text:s.text,url:s.url}).catch(function(){});return;}
 var mobile=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
 if(mobile){location.href='sms:?&body='+encodeURIComponent(full);return;}
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(full).then(function(){flash('Copied');},function(){fallbackCopy(full);});}else fallbackCopy(full);
});
function fallbackCopy(t){var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');flash('Copied');}catch(e){flash('Copy this link: '+location.href);}a.remove();}
$('#restartTop').addEventListener('click',restart);
window.addEventListener('hashchange',function(){render();document.body.classList.toggle('quiz',S.screen==='quiz');window.scrollTo(0,0);});
window.__totm={cost:cost,program:program,state:function(){return S;},resultsText:resultsText,resultsJson:resultsJson,shareText:shareText};

/* Partial Submit anytime (Max Oct 13) */
(function(){
  var AGENT='blueprint', AGENT_ID='5b23bb2f-ffc9-4b61-b04c-43a3943eac12', APP='this-or-that-home', KEY='totm-v1';
  function isTest(){ return /[?&](?:mwtest|test)=1\b/.test(location.search); }
  function sentFloat(msg){ var d=document.createElement('div'); d.className='mw-sent'; d.setAttribute('role','status'); d.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span></span>'; d.lastChild.textContent=msg; document.body.appendChild(d); setTimeout(function(){ d.remove(); },1900); }
  function meta(){
    var un=Q.filter(function(q){ return !S.ans[q.id]; }).map(function(q){ return q.id; });
    var ans=Object.keys(S.ans).length, tot=Q.length;
    return {partial:un.length>0, answered:ans, total:tot, unanswered:un, agentId:AGENT_ID, test:isTest()||undefined};
  }
  function notes(){
    var o=[], n=S.notes||{}; Object.keys(n).forEach(function(k){ if(n[k]&&n[k].note) o.push(k+': '+n[k].note); });
    var t=o.join('\n'); return isTest()?('TEST submit from Blueprint agent, please ignore. '+t).trim():t;
  }
  function bindPartial(){
    var b=document.getElementById('btnPartialSubmit'); if(!b||b._mwBound) return; b._mwBound=1;
    b.addEventListener('click', function(){
      if(b.disabled||typeof MWSubmit==='undefined') return;
      b.disabled=true;
      var m=meta(), results=Object.assign({}, JSON.parse(localStorage.getItem(KEY)||'{}'), m);
      try{ localStorage.setItem('mw-submit-backup-'+APP, JSON.stringify({savedAt:new Date().toISOString(),app:APP,results:results,notes:notes()})); }catch(e){}
      MWSubmit.send({agent:AGENT, app:APP, deck:'2026-10-13', results:results, notes:notes(), partial:true, answered:m.answered, total:m.total, unanswered:m.unanswered, test:!!m.test})
        .then(function(ok){ b.disabled=false; sentFloat(ok?('Sent '+m.answered+'/'+m.total):'Saved, will send'); });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bindPartial); else bindPartial();
  var _go=go; go=function(){ _go(); bindPartial(); };
})();

render();document.body.classList.toggle('quiz',S.screen==='quiz');
})();


/* R104: Back goes where the user came from: history, same-origin referrer, trusted from=, then fixed fallback. */
window.mwGoBack=window.mwGoBack||function(e,fb){if(e&&e.preventDefault)e.preventDefault();
 if(history.length>1){history.back();return false;}
 try{var r=document.referrer;if(r&&new URL(r).origin===location.origin){location.href=r;return false;}}catch(x){}
 try{var f=new URLSearchParams(location.search).get('from');if(f){var u=new URL(f,location.href);if(u.origin===location.origin||(u.protocol==='https:'&&u.hostname==='webermanapps.github.io')){location.href=u.href;return false;}}}catch(x){}
 location.href=fb;return false;};
(function(){
'use strict';
var Q=window.QUESTIONS, KEY='totm-r2-v1', $=function(s,r){return (r||document).querySelector(s)};
var app=$('#app');
var IC={
 this:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
 that:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
 both:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.5 1.2 4.3 2.4.8-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z"/></svg>',
 neither:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
};
var ANS_L={this:'This',that:'That',both:'Both',neither:'Neither',skip:'Skipped'};
function def(){return {screen:'quiz',i:0,ans:{},notes:{},sort:'sec'};}
function load(){try{var s=JSON.parse(localStorage.getItem(KEY));if(s&&s.ans)return s;}catch(e){}return def();}
var S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function d(id){return S.ans[id]||'skip';}
function noteOf(id){return (S.notes&&S.notes[id]&&S.notes[id].note)||'';}
function setNote(id,t){S.notes=S.notes||{};t=String(t||'').trim().slice(0,1000);if(t)S.notes[id]={note:t,ts:new Date().toISOString()};else delete S.notes[id];}
function pickLabel(q,a){return a==='this'?q.opts[0].title:a==='that'?q.opts[1].title:a==='both'?q.opts[0].title+' + '+q.opts[1].title:'';}
function decision(q){var a=d(q.id);
 if(a==='this'||a==='that')return 'Go with '+pickLabel(q,a)+'. '+q.apply+'.';
 if(a==='both')return 'Both work: '+q.opts[0].title+' and '+q.opts[1].title+'. '+q.apply+', split by room or pick on site.';
 if(a==='neither')return 'Neither: look for another option.';
 return 'Not decided yet.';}
function sections(){var o=[];Q.forEach(function(q){if(o.indexOf(q.sec)<0)o.push(q.sec);});return o;}
function answered(){return Object.keys(S.ans).filter(function(k){return S.ans[k]!=='skip';}).length;}

function render(){
 $('#restartTop').hidden=!Object.keys(S.ans).length;
 if(location.hash==='#credits')return renderCredits();
 if(S.screen==='results'||S.i>=Q.length)return renderResults();
 renderQuiz();
}
function go(){window.scrollTo(0,0);render();document.body.classList.toggle('quiz',S.screen==='quiz');app.focus({preventScroll:true});}
function restart(){if(Object.keys(S.ans).length&&!confirm('Start over and clear your answers and notes?'))return;S=def();save();location.hash='';go();}

/* ---------- QUIZ ---------- */
function renderQuiz(){
 var i=Math.min(S.i,Q.length-1),q=Q[i],a=S.ans[q.id],cls=a==='this'?'sel-a':a==='that'?'sel-b':a==='both'?'sel-both':a==='neither'?'sel-neither':'';
 function card(o,k){return '<button type="button" class="card '+k+' '+cls+' mw-hover" data-ans="'+(k==='a'?'this':'that')+'" aria-label="'+(k==='a'?'This: ':'That: ')+esc(o.title)+'. Rate This: '+esc(o.focus)+'. '+esc(o.cap)+'">'+
  '<span class="tag">'+(k==='a'?'This':'That')+'</span><span class="ph"><img src="'+o.img+'" alt="'+esc(o.title)+'" width="800" height="600" loading="eager"></span>'+
  '<span class="cap"><span class="rt">Rate This: '+esc(o.focus)+'</span><h3>'+esc(o.title)+'</h3><p>'+esc(o.cap)+'</p></span></button>';}
 function ab(k,l){return '<button type="button" class="btn ans '+k+(a===k?' on':'')+' mw-hover" data-ans="'+k+'" aria-pressed="'+(a===k)+'">'+IC[k]+'<span>'+l+'</span></button>';}
 app.innerHTML='<div class="qtop"><span class="label">Decision '+(i+1)+' of '+Q.length+'</span><span class="label">'+answered()+' Answered</span></div>'+
 '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="'+Q.length+'" aria-valuenow="'+i+'"><i style="width:'+(i/Q.length*100)+'%"></i></div>'+
 '<div class="qhead"><p class="label sechead">'+esc(q.sec)+'</p><h2>'+esc(q.head)+'</h2></div>'+
 '<div class="pair">'+card(q.opts[0],'a')+card(q.opts[1],'b')+'</div>'+
 '<div class="answers" role="group" aria-label="Your answer">'+ab('this','This')+ab('that','That')+ab('neither','Neither')+ab('both','Both')+'</div>'+
 '<div class="notebox"><button type="button" class="btn btn-quiet notebtn mw-hover'+(noteOf(q.id)?' has':'')+'" id="noteBtn" aria-expanded="false">'+(noteOf(q.id)?'✎ Note':'Add Note')+'</button>'+
 '<div class="noteedit" id="noteEdit" hidden><textarea id="noteText" rows="3" maxlength="1000" placeholder="Optional note. It saves with your pick." aria-label="Note">'+esc(noteOf(q.id))+'</textarea></div></div>'+
 '<div class="qfoot"><button type="button" class="btn btn-quiet mw-hover" id="back"'+(i===0?' disabled':'')+'>Back</button>'+(answered()?'<button type="button" class="btn btn-quiet mw-hover" id="toRes">Results</button>':'')+'<button type="button" class="btn btn-quiet mw-hover" id="skip">Skip</button></div>';
 app.querySelectorAll('[data-ans]').forEach(function(b){b.addEventListener('click',function(){answer(b.dataset.ans);});});
 $('#noteBtn').addEventListener('click',function(){var e=$('#noteEdit'),o=e.hidden;e.hidden=!o;this.setAttribute('aria-expanded',o);if(o)$('#noteText').focus({preventScroll:true});});
 $('#noteText').addEventListener('input',function(){var b=$('#noteBtn'),t=this.value.trim();b.textContent=t?'✎ Note':'Add Note';b.classList.toggle('has',!!t);});
 $('#back').addEventListener('click',back);$('#skip').addEventListener('click',function(){answer('skip');});
 var tr=$('#toRes');if(tr)tr.addEventListener('click',function(){keepNote();S.screen='results';save();go();});
 var n=Q[i+1];if(n)n.opts.forEach(function(o){var im=new Image();im.src=o.img;});
}
function keepNote(){var q=Q[Math.min(S.i,Q.length-1)],nt=$('#noteText');if(nt)setNote(q.id,nt.value);}
function answer(v){var q=Q[S.i];keepNote();S.ans[q.id]=v;S.i++;if(S.i>=Q.length)S.screen='results';save();go();}
function back(){if(S.i<=0)return;keepNote();S.i--;save();go();}
document.addEventListener('keydown',function(e){if(S.screen!=='quiz'||location.hash||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
 var m={ArrowLeft:'this',ArrowRight:'that',ArrowUp:'both',ArrowDown:'neither'}[e.key];if(m){e.preventDefault();answer(m);}else if(e.key==='Backspace'){e.preventDefault();back();}});

/* ---------- RESULTS ---------- */
function sorted(){return S.sort==='az'?Q.slice().sort(function(a,b){return a.head.localeCompare(b.head);}):Q.slice();}
function resultsText(){var out=['WEBERMAN RESIDENCE: THIS OR THAT, ROUND 2 ('+new Date().toISOString().slice(0,10)+')'];
 sections().forEach(function(s){out.push('','== '+s.toUpperCase()+' ==');Q.filter(function(q){return q.sec===s;}).forEach(function(q){var a=d(q.id),n=noteOf(q.id);
  out.push(q.head+': '+ANS_L[a]+(pickLabel(q,a)?' ('+pickLabel(q,a)+')':'')+(n?' | Note: '+n:''));});});
 out.push('','== DECISIONS ==');Q.forEach(function(q){if(S.ans[q.id]&&S.ans[q.id]!=='skip')out.push(q.head+': '+decision(q));});
 return out.join('\n');}
function resultsJson(){return {app:'Weberman Residence: This or That, Round 2',round:2,exported:new Date().toISOString(),
 decisions:Q.map(function(q){var a=S.ans[q.id]||null;return {id:q.id,section:q.sec,decision:q.head,this:q.opts[0].title,that:q.opts[1].title,answer:a,pick:a?pickLabel(q,a)||null:null,apply:a&&a!=='skip'?decision(q):null,note:noteOf(q.id)||null,noteTs:(S.notes[q.id]&&S.notes[q.id].ts)||null};})};}
var OPEN={};
function rowHTML(q){var a=d(q.id),n=noteOf(q.id),o=!!OPEN[q.id];
 return '<div class="arow" data-q="'+q.id+'"><button type="button" class="ahead mw-hover" aria-expanded="'+o+'"><span class="at">'+esc(q.head)+'</span>'+(n?'<span class="noteicon" aria-label="Has Note" title="Has Note">✎</span>':'')+'<span class="apill '+a+'">'+ANS_L[a]+'</span></button>'+
 '<div class="abody"'+(o?'':' hidden')+'><p class="small">'+esc(q.opts[0].title)+' vs '+esc(q.opts[1].title)+'</p>'+(pickLabel(q,a)?'<p class="small"><strong>Pick:</strong> '+esc(pickLabel(q,a))+'</p>':'')+
 '<label class="label" for="n_'+q.id+'">Note</label><textarea id="n_'+q.id+'" class="rownote" rows="2" maxlength="1000" placeholder="Add a note">'+esc(n)+'</textarea>'+
 '<div class="actions"><button type="button" class="btn btn-quiet savenote mw-hover">Save Note</button><button type="button" class="btn btn-quiet redo mw-hover">Change Answer</button></div></div></div>';}
function listHTML(){return '<section class="sec" id="myAnswers"><h2>Every Decision</h2>'+
 '<div class="sortbar" role="group" aria-label="Sort"><span class="label">Sort</span><button type="button" class="btn btn-quiet mw-hover'+(S.sort!=='az'?' on':'')+'" data-sort="sec" aria-pressed="'+(S.sort!=='az')+'">By Section</button><button type="button" class="btn btn-quiet mw-hover'+(S.sort==='az'?' on':'')+'" data-sort="az" aria-pressed="'+(S.sort==='az')+'">A-Z</button></div>'+
 '<div class="arows">'+sorted().map(rowHTML).join('')+'</div></section>';}
function decisionsHTML(){var h='<section class="sec" id="decisions"><h2>Decisions</h2><p class="small">What to apply to the house, from your picks.</p>';
 sections().forEach(function(s){var qs=Q.filter(function(q){return q.sec===s&&S.ans[q.id]&&S.ans[q.id]!=='skip';});if(!qs.length)return;
  h+='<div class="dsec"><h3>'+esc(s)+'</h3><ul class="decisions">'+qs.map(function(q){return '<li><span class="k">'+esc(q.head)+'</span>'+esc(decision(q))+(noteOf(q.id)?' <em>Note: '+esc(noteOf(q.id))+'</em>':'')+'</li>';}).join('')+'</ul></div>';});
 var open=Q.filter(function(q){return !S.ans[q.id]||S.ans[q.id]==='skip';});
 if(open.length)h+='<p class="small">'+open.length+' still open: '+esc(open.map(function(q){return q.head;}).join(', '))+'.</p>';
 return h+'</section>';}
function renderResults(){S.screen='results';var n=answered();
 app.innerHTML='<p class="label">Weberman Residence · Round 2</p><h1>Your Decisions</h1><p class="lead">'+n+' of '+Q.length+' decided.</p>'+
 '<div class="actions"><button class="btn mw-hover" id="copyRes" type="button">Copy Results</button><button class="btn mw-hover" id="jsonRes" type="button">Download JSON</button><button class="btn btn-quiet mw-hover" id="resume" type="button">'+(S.i<Q.length?'Keep Going':'Review From Start')+'</button></div>'+
 decisionsHTML()+listHTML();
 $('#resume').addEventListener('click',function(){if(S.i>=Q.length)S.i=0;S.screen='quiz';save();go();});
 $('#copyRes').addEventListener('click',function(){var t=resultsText();if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(t).then(function(){flash('Results Copied');},function(){fallbackCopy(t);});else fallbackCopy(t);});
 $('#jsonRes').addEventListener('click',function(){var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(resultsJson(),null,2)],{type:'application/json'}));a.download='weberman_residence_round2.json';document.body.appendChild(a);a.click();a.remove();flash('JSON Downloaded');});
 bindList();}
function bindList(){
 $('#myAnswers').addEventListener('click',function(e){var sb=e.target.closest('[data-sort]');
  if(sb){S.sort=sb.dataset.sort;save();redraw();return;}
  var r=e.target.closest('.arow');if(!r)return;var id=r.dataset.q;
  if(e.target.closest('.savenote')){setNote(id,r.querySelector('.rownote').value);save();flash(noteOf(id)?'Note Saved':'Note Cleared');OPEN[id]=1;var y=window.scrollY;renderResults();window.scrollTo(0,y);return;}
  if(e.target.closest('.redo')){S.i=Q.findIndex(function(q){return q.id===id;});S.screen='quiz';save();go();return;}
  if(e.target.closest('.ahead')){OPEN[id]=!OPEN[id];r.querySelector('.abody').hidden=!OPEN[id];r.querySelector('.ahead').setAttribute('aria-expanded',!!OPEN[id]);}
 });}
function redraw(){var y=window.scrollY;$('#myAnswers').outerHTML=listHTML();bindList();window.scrollTo(0,y);}

/* ---------- CREDITS ---------- */
function renderCredits(){var seen={},all=[];Q.forEach(function(q){q.opts.forEach(function(o){if(!seen[o.key]){seen[o.key]=1;all.push(o);}});});
 app.innerHTML='<p><a class="btn btn-quiet mw-hover" href="#" onclick="return mwGoBack(event,\'#\')">Back</a></p><h1>Photo Credits</h1><ol class="credits">'+all.map(function(o){var c=o.credit;return '<li><strong>'+esc(o.title)+'</strong>: <a href="'+esc(c.url)+'" target="_blank" rel="noopener">'+esc(c.name)+'</a> by '+esc(c.by)+', '+esc(c.lic)+'</li>';}).join('')+'</ol>';}

/* ---------- SHARE ---------- */
function shareText(){var url=location.origin+location.pathname,c={this:0,that:0,both:0,neither:0};Object.keys(S.ans).forEach(function(k){if(c[S.ans[k]]!=null)c[S.ans[k]]++;});
 var n=answered(),ns=Q.filter(function(q){return noteOf(q.id);});
 return {url:url,text:n?'Weberman Residence, Round 2: '+n+' of '+Q.length+' decisions made ('+c.this+' This, '+c.that+' That, '+c.both+' Both, '+c.neither+' Neither).'+(ns.length?' Notes: '+ns.slice(0,3).map(function(q){return q.head+': '+noteOf(q.id).slice(0,80);}).join('; ')+(ns.length>3?' (+'+(ns.length-3)+' more)':'')+'.':''):'Weberman Residence: This or That, Round 2. '+Q.length+' head-to-head decisions.'};}
function flash(m){var e=$('#shareMsg');e.textContent=m;clearTimeout(flash.t);flash.t=setTimeout(function(){e.textContent='';},2500);}
$('#shareBtn').addEventListener('click',function(){var s=shareText(),full=s.text+' '+s.url;
 if(navigator.share){navigator.share({title:'Weberman Residence: This or That, Round 2',text:s.text,url:s.url}).catch(function(){});return;}
 if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){location.href='sms:?&body='+encodeURIComponent(full);return;}
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(full).then(function(){flash('Copied');},function(){fallbackCopy(full);});}else fallbackCopy(full);});
function fallbackCopy(t){var a=document.createElement('textarea');a.value=t;a.setAttribute('readonly','');a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy');flash('Copied');}catch(e){flash('Copy this link: '+location.href);}a.remove();}
$('#restartTop').addEventListener('click',restart);
window.addEventListener('hashchange',function(){render();document.body.classList.toggle('quiz',S.screen==='quiz');window.scrollTo(0,0);});
window.__r2={state:function(){return S;},resultsText:resultsText,resultsJson:resultsJson,shareText:shareText};

/* Partial Submit anytime (Max Oct 13) */
(function(){
  var AGENT='blueprint', AGENT_ID='5b23bb2f-ffc9-4b61-b04c-43a3943eac12', APP='this-or-that-home-r2', KEY='totm-r2-v1';
  function isTest(){ return /[?&](?:mwtest|test)=1\b/.test(location.search); }
  function sentFloat(msg){ var d=document.createElement('div'); d.className='mw-sent'; d.setAttribute('role','status'); d.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg><span></span>'; d.lastChild.textContent=msg; document.body.appendChild(d); setTimeout(function(){ d.remove(); },1900); }
  function meta(){
    var un=Q.filter(function(q){ var a=S.ans[q.id]; return !a || a==='skip'; }).map(function(q){ return q.id; });
    var skipped=Q.filter(function(q){ return S.ans[q.id]==='skip'; }).map(function(q){ return q.id; });
    var ans=Q.filter(function(q){ var a=S.ans[q.id]; return a && a!=='skip'; }).length, tot=Q.length;
    return {partial:un.length>0, answered:ans, total:tot, unanswered:un, skipped:skipped, agentId:AGENT_ID, test:isTest()||undefined};
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
        .then(function(ok){ b.disabled=false; if(!ok&&MWSubmit.blocked){ sentFloat('Password needed'); return; } sentFloat(ok?('Sent '+m.answered+'/'+m.total):'Saved, will send'); });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', bindPartial); else bindPartial();
  var _go=go; go=function(){ _go(); bindPartial(); };
})();

render();document.body.classList.toggle('quiz',S.screen==='quiz');
})();


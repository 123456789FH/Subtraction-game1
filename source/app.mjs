import {arabic,parseNumber,STAGES,QUESTIONS,TOTAL_STARS,createState,questionsFor,stageProgress,startStage,currentQuestion,changeQuestion,exchangeTen,toggleBlock,checkBank,checkQuestion,choicesFor,publicState,freshQuestionModel,modelReady,exchangeQuestionModel,toggleQuestionModel} from './engine.mjs';

const state=createState();
const root=document.getElementById('app');
let celebrationTimer;
const paths={
 star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
 sparkles:'<path d="m12 3 2.1 6.9L21 12l-6.9 2.1L12 21l-2.1-6.9L3 12l6.9-2.1L12 3Z"/><path d="M20 2v4M18 4h4"/>',
 blocks:'<rect x="3" y="3" width="7" height="18" rx="1"/><path d="M3 7h7M3 12h7M3 17h7"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-8h6v8"/>',
 book:'<path d="M12 5c-3-2-6-2-10-1v15c4-1 7-1 10 1 3-2 6-2 10-1V4c-4-1-7-1-10 1Zm0 0v15"/>',
 search:'<circle cx="10.5" cy="10.5" r="7.5"/><path d="m16 16 5 5"/>',
 help:'<circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 0 1 5.6 1.4c0 1.6-2.8 2-2.8 3.6M12 17h.01"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 close:'<path d="m6 6 12 12M18 6 6 18"/>',
 light:'<path d="M9 18h6M9 21h6M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 2H9s0-1-1-2Z"/>',
 fullscreen:'<path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5"/>',
 medal:'<path d="m8 3 4 6 4-6M5 3h3M16 3h3"/><circle cx="12" cy="15" r="7"/><path d="m12 11 1.2 2.5 2.8.4-2 2 .5 2.7-2.5-1.3-2.5 1.3.5-2.7-2-2 2.8-.4Z"/>',
 print:'<path d="M6 9V3h12v6M6 18H3V9h18v9h-3M6 15h12v6H6Z"/><path d="M17 12h.01"/>',
 map:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16M15 5v16"/>'
};
const icon=(name,size=22)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${name==='star'?'currentColor':'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]??paths.star}</svg>`;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stageInfo=()=>STAGES.find(s=>s.id===state.stage);
const progress=()=>Math.round(state.solved.size/TOTAL_STARS*100);
const rods=()=>Array.from({length:10},()=>'<span aria-hidden="true"></span>').join('');
const equation=(a,b,result,small=false)=>`<div class="equation ${small?'small':''}" aria-label="${arabic(a)} ناقص ${arabic(b)}${result!==undefined?' يساوي '+(result===null?'كم؟':arabic(result)):''}"><b>${arabic(a)}</b><span class="sign">−</span><b>${arabic(b)}</b>${result!==undefined?`<span class="sign">=</span><span class="${result===null?'answer-placeholder':'answer'}">${result===null?'؟':arabic(result)}</span>`:''}</div>`;

function header(){return `<header class="topbar"><div class="brand"><span class="brand-icon">${icon('blocks',27)}</span><div><div class="brand-name">بسمة وراشد في عالم الطرح</div><div class="brand-small">الصف الثالث الابتدائي</div></div></div><div class="tools"><div class="score-pill" aria-label="${arabic(state.solved.size)} من ${arabic(TOTAL_STARS)} نجمة">${icon('star',21)}<span>${arabic(state.solved.size)}</span><small>/ ${arabic(TOTAL_STARS)}</small></div><button class="text-button" data-action="passport" aria-label="جواز الإنجاز">${icon('medal',20)}<span class="wide-label">جوازي</span></button><button class="icon-button" data-action="help" aria-label="كيف ألعب؟" title="كيف ألعب؟">${icon('help',21)}</button><button class="icon-button fullscreen-tool" data-action="fullscreen" aria-label="ملء الشاشة" title="ملء الشاشة">${icon('fullscreen',21)}</button></div></header>`;}
function sidebar(){return `<aside class="side-panel" aria-label="رحلتك"><div class="world-picture"><img src="assets/world.png" alt="بسمة وراشد في مغامرتهما أمام بنك العشرات" width="285" height="335"></div><section class="journey-box"><h3>${icon('map',20)} جواز رحلتك</h3><div class="progress-line" role="progressbar" aria-label="النجوم المكتسبة" aria-valuenow="${state.solved.size}" aria-valuemin="0" aria-valuemax="23"><span style="width:${progress()}%"></span></div><p class="small">${arabic(state.solved.size)} من ${arabic(TOTAL_STARS)} نجمة</p><div class="mini-stage-list">${STAGES.map(s=>{const n=stageProgress(state,s);return `<button class="mini-stage ${state.stage===s.id?'active':''} ${n===s.count?'done':''}" data-action="station" data-stage="${s.id}"><span>${s.name}</span><span class="count">${n===s.count?'✓':arabic(n)+' / '+arabic(s.count)}</span></button>`}).join('')}</div></section></aside>`;}
function footer(){return `<footer class="page-footer"><div class="credit"><img src="assets/multaqa.jpg" alt="شعار ملتقى التعليم التفاعلي" width="50" height="49"><div><strong>أ/ فاطمة هزازي</strong><span>ملتقى التعليم التفاعلي (تفاعل)</span></div></div><div class="footer-word">أفكّر • أجرّب • أكتشف</div></footer>`;}
function home(){return `<div class="panel-inner"><div class="intro-label">${icon('sparkles',19)} مغامرة جديدة تنتظرك</div><h1 class="home-title">افتح حزمة…<br>واكتشف عالم الطرح!</h1><p class="home-desc">العب مع بسمة وراشد، واجمع نجوم المحطات الخمس.</p><section class="start-card"><div><h2>هل أنت مستعد؟</h2><p>ابدأ من بنك العشرات أو اختر محطتك.</p><button class="primary gold" data-action="station" data-stage="bank">${icon('sparkles',21)} ابدأ المغامرة</button></div><img class="friends" src="assets/friends.png" alt="بسمة وراشد" width="105" height="153"></section><h2 class="section-label">اختر محطة <span>كل تحدٍّ جديد = نجمة</span></h2><nav class="station-grid" aria-label="محطات اللعبة">${STAGES.map(s=>`<button class="station-card ${s.color}" data-action="station" data-stage="${s.id}"><span class="station-icon">${icon(s.icon,27)}</span><div><div class="station-name">${s.name}</div><div class="station-desc">${s.short}</div></div><span class="station-stars">${icon('star',16)} ${arabic(stageProgress(state,s))} / ${arabic(s.count)}</span></button>`).join('')}</nav><p class="footnote">خذ وقتك. يمكنك المحاولة من جديد والاستعانة بالتلميحات.</p></div>`;}
function stageHeader(){const s=stageInfo();return `<div class="stage-header"><div><div class="stage-label">محطة ${arabic(STAGES.indexOf(s)+1)} من ٥</div><h2>${s.name}</h2></div><div class="stage-controls"><button class="text-button" data-action="hint" aria-expanded="${state.hint}">${icon('light',17)} تلميح</button><button class="text-button" data-action="home">المحطات</button></div></div>`;}
function feedback(){return state.feedback?`<div class="feedback ${state.feedback.ok?'success':'retry'}" role="status" aria-live="polite">${icon(state.feedback.ok?'check':'light',21)}<span>${esc(state.feedback.message)}</span></div>`:'<div class="feedback-space" aria-live="polite"></div>';}
function helpTip(text){return state.hint?`<div class="help-tip">${icon('light',19)} ${esc(text)}</div>`:'';}
function bank(){
 const b=state.bank,complete=b.phase==='complete',phase=b.phase==='exchange'?0:b.phase==='remove'?1:2;
 const place=(type,label,count)=>`<section class="place"><h3>${label}</h3><p class="place-note">${type==='ones'?'قطع منفردة':'كل حزمة فيها ١٠ آحاد'}</p><div class="${type==='ones'?'ones-tray':'blocks-tray'}">${count?Array.from({length:count},(_,i)=>{const removed=(type==='ones'?b.removedOnes:b.removedTens).has(i);return `<button class="block ${type==='ones'?'unit':'rod'} ${removed?'removed':''}" data-action="${b.phase==='exchange'?'exchange':'block'}" data-kind="${type}" data-index="${i}" aria-label="${b.phase==='exchange'?'فك حزمة رقم ':type==='ones'?'آحاد: قطعة رقم ':'عشرات: حزمة رقم '}${arabic(i+1)}${removed?' مستبعدة':''}" aria-pressed="${removed}" ${complete?'disabled':''}>${type==='ones'?'':rods()}</button>`}).join(''):'<div class="empty-ones">لا توجد آحاد منفردة.<br>افتح حزمة واحدة.</div>'}</div></section>`;
 return `${stageHeader()}<div class="panel-inner"><div class="step-list">${['افتح الحزمة','استبعد ١٧','اكتشف الباقي'].map((s,i)=>`<div class="step ${i===phase?'active':i<phase?'done':''}"><b>${arabic(i+1)}</b>${s}</div>`).join('')}</div><div class="bank-story">اشترى سعيد <strong>٣٠ تفاحة</strong>، منها <strong>١٧ حمراء</strong>. كم تفاحة خضراء لديه؟</div><div class="place-board">${place('ones','الآحاد',b.ones)}${place('tens','العشرات',b.tens)}</div><p class="bank-invariant">${b.phase==='exchange'?'٣ عشرات تساوي ٣٠.':'بعد فتح الحزمة: عشرتان و١٠ آحاد تساوي ٣٠.'}</p>${b.phase==='exchange'?'<div class="bank-task"><button class="primary" data-action="exchange">فكّ عشرة إلى ١٠ آحاد</button></div>':`<div class="selection-counter"><span>الآحاد المستبعدة: ${arabic(b.removedOnes.size)} / ٧</span><span>العشرات المستبعدة: ${arabic(b.removedTens.size)} / ١</span></div>${complete?`<div class="bank-complete">${equation(30,17,13,true)}</div>`:`<form class="bank-task" data-form="bank"><label for="bank-answer">كم بقي؟</label><input class="answer-input" id="bank-answer" data-field="bank" type="text" inputmode="numeric" autocomplete="off" maxlength="4" value="${esc(state.bankInput)}" ${b.phase!=='answer'?'disabled':''} aria-label="عدد التفاحات المتبقية"><button class="primary" type="submit" ${b.phase!=='answer'?'disabled':''}>تحقّق</button></form>`}`}${helpTip(b.phase==='exchange'?'انقر حزمة واحدة لفكّها إلى ١٠ آحاد. يبقى العدد نفسه.':'انقر ٧ آحاد وعشرة واحدة لاستبعادها. عدّ القطع التي بقيت دون شطب.')}${feedback()}<div class="bottom-actions"><button class="secondary" data-action="restart-bank">ابدأ المحاولة من جديد</button>${complete?'<button class="primary" data-action="station" data-stage="subtract">إلى كنز الباقي</button>':''}</div></div>`;
}
function questionModels(q){
 const m=state.questionModel;if(!m)return '';
 const exchange=m.needsExchange&&!m.exchanged,ready=modelReady(m);
 const units=q.id==='q9'?'كل قطعة آحاد تمثّل قلمًا، وكل حزمة تمثّل ١٠ أقلام.':q.id==='q10'?'كل قطعة آحاد تمثّل نسخة، وكل حزمة تمثّل ١٠ نسخ.':'كل حزمة تتكوّن من ١٠ آحاد.';
 const instruction=state.answered?'تأمّل النماذج: القطع التي لم تُشطب تمثّل الإجابة الصحيحة.':exchange?`الآحاد لا تكفي لاستبعاد ${arabic(q.b%10)}. فكّ عشرة إلى ١٠ آحاد.`:ready?'عدّ القطع المتبقية، ثم اختر الإجابة.':`استبعد ${arabic(q.b)} بالنقر على القطع، ثم عدّ الباقي.`;
 const place=(kind,label)=>{
  const count=m[kind],selected=kind==='ones'?m.removedOnes:m.removedTens;
  const empty=kind==='ones'?'لا توجد آحاد منفردة.':'لا توجد حزم عشرات.';
  return `<section class="place"><h4>${label}</h4><div class="${kind==='ones'?'model-ones-grid':'model-tens-grid'}">${count?Array.from({length:count},(_,index)=>{
   const removed=selected.has(index),canExchange=exchange&&kind==='tens';
   return `<button class="block ${kind==='ones'?'unit':'rod'} ${removed?'removed':''}" data-action="${canExchange?'question-model-exchange':'question-model-block'}" data-kind="${kind}" data-index="${index}" aria-label="${canExchange?'فك حزمة رقم ':kind==='ones'?'قطعة آحاد رقم ':'حزمة عشرات رقم '}${arabic(index+1)}${removed?' مستبعدة':''}" aria-pressed="${removed}" aria-describedby="question-model-instruction" ${state.answered?'disabled':''}>${kind==='tens'?rods():''}</button>`;
  }).join(''):`<p class="model-empty">${empty}</p>`}</div></section>`;
 };
 return `<section class="question-model" aria-labelledby="question-model-title"><div class="model-heading"><h3 id="question-model-title">${icon('blocks',21)} أفهم بالنماذج</h3><button class="text-button model-toggle" data-action="toggle-model" aria-expanded="${state.modelsVisible}" aria-controls="question-model-body">${state.modelsVisible?'إخفاء النماذج':'إظهار النماذج'}</button></div><div id="question-model-body" ${state.modelsVisible?'':'hidden'}>${state.modelsVisible?`<p class="model-brief">${units}</p><p class="model-instruction" id="question-model-instruction">${instruction}</p><div class="place-board model-board">${place('ones','الآحاد')}${place('tens','العشرات')}</div><p class="model-invariant">${m.exchanged?'بعد فكّ الحزمة:':'تمثيل العدد قبل الاستبعاد:'} العشرات ${arabic(m.tens)}، والآحاد ${arabic(m.ones)}. ${m.exchanged?`العدد قبل الاستبعاد ما زال ${arabic(q.a)}.`:''}</p>${exchange?'<div class="model-exchange"><button class="primary" data-action="question-model-exchange">فكّ عشرة إلى ١٠ آحاد</button></div>':`<div class="selection-counter model-counters"><span>الآحاد المستبعدة: ${arabic(m.removedOnes.size)} / ${arabic(q.b%10)}</span><span>العشرات المستبعدة: ${arabic(m.removedTens.size)} / ${arabic(Math.floor(q.b/10))}</span></div>`}<p class="model-message ${state.modelFeedback&&!state.modelFeedback.ok?'model-alert':''}" role="status" aria-live="polite">${state.modelFeedback?esc(state.modelFeedback.message):state.answered?`بقي ${arabic(q.answer)}${q.unit?' '+q.unit:''}.`:ready?'أكملت استبعاد المطروح. عدّ الباقي بنفسك.':'يمكنك النقر على القطعة المستبعدة مرة أخرى لإعادتها.'}</p>${state.answered?'':`<div class="model-bottom"><button class="text-button model-reset" data-action="reset-question-model">أعد النماذج</button><span>اختر الإجابة متى عرفت الباقي.</span></div>`}`:''}</div></section>`;
}
function choices(q){return `<div class="choices" aria-label="اختر الإجابة">${choicesFor(q).map(value=>{const sel=state.selected===value;return `<button class="choice ${state.answered&&value===q.answer?'correct':''} ${!state.answered&&sel&&state.feedback&&!state.feedback.ok?'wrong':''}" data-action="answer" data-answer="${value}" ${state.answered?'disabled':''} aria-label="${arabic(value)}${q.unit?' '+q.unit:''}">${arabic(value)}</button>`}).join('')}</div>`;}
function numberLine(q){
 const lo=Math.floor(q.value/q.unit)*q.unit,hi=lo+q.unit,x=40+(q.value-lo)/q.unit*460;
 return `<svg class="number-line" viewBox="0 0 540 145" role="img" aria-label="موقع ${arabic(q.value)} بين ${arabic(lo)} و${arabic(hi)}"><line x1="40" y1="80" x2="500" y2="80" stroke="#519aa2" stroke-width="3"/>${Array.from({length:11},(_,i)=>`<line x1="${40+i*46}" y1="74" x2="${40+i*46}" y2="87" stroke="#519aa2" stroke-width="2"/>`).join('')}<text x="40" y="121" text-anchor="middle">${arabic(lo)}</text><text x="500" y="121" text-anchor="middle">${arabic(hi)}</text><text x="270" y="121" class="small-number" text-anchor="middle">${arabic(lo+q.unit/2)}</text><line x1="${x}" y1="45" x2="${x}" y2="72" stroke="#ca476f" stroke-width="2" stroke-dasharray="3 3"/><circle cx="${x}" cy="80" r="7" fill="#ca476f" stroke="white" stroke-width="3"/><rect x="${x-36}" y="8" width="72" height="38" rx="12" fill="#fff0f4"/><text x="${x}" y="36" text-anchor="middle" style="fill:#b12e57">${arabic(q.value)}</text></svg>`;
}
function roundQuestion(q){const lo=Math.floor(q.value/q.unit)*q.unit,hi=lo+q.unit;return `<div class="round-prompt"><span>قرّب إلى أقرب ${q.unit===10?'عشرة':'مئة'}</span><strong>${arabic(q.value)}</strong></div>${numberLine(q)}<div class="houses">${[lo,hi].map(value=>`<button class="choice house-choice ${state.answered&&value===q.answer?'correct':''} ${!state.answered&&state.selected===value&&state.feedback&&!state.feedback.ok?'wrong':''}" data-action="answer" data-answer="${value}" ${state.answered?'disabled':''} aria-label="بيت ${arabic(value)}">${icon('home',30)}<span>${arabic(value)}</span></button>`).join('')}</div>`;}
function estimateQuestion(q){return `<div class="estimate-intro">${icon('search',22)} نبحث عن تقدير: قرّب العددين إلى أقرب عشرة.</div><div class="question-board">${equation(q.a,q.b,undefined,true)}</div><form data-form="estimate"><div class="estimate-fields">${[`تقريب ${arabic(q.a)}`,`تقريب ${arabic(q.b)}`,'الناتج التقديري'].map((label,i)=>`<div class="estimate-cell"><label for="estimate-${i}">${label}${i===2?'<br>حوالي':''}</label><input class="answer-input" id="estimate-${i}" data-field="estimate" data-index="${i}" type="text" inputmode="numeric" maxlength="4" autocomplete="off" value="${esc(state.estimateInputs[i])}" ${state.answered?'disabled':''} aria-invalid="${state.feedback&&!state.feedback.ok&&state.feedback.field===i?'true':'false'}"></div>`).join('')}</div><div style="text-align:center"><button class="primary" type="submit" ${state.answered?'disabled':''}>تحقّق من التقدير</button></div></form>`;}
function question(){
 const q=currentQuestion(state),list=questionsFor(state.stage),wasSolved=state.solved.has(q.id);
 let content;
 if(q.stage==='round')content=roundQuestion(q);
 else if(q.stage==='estimate')content=estimateQuestion(q);
 else if(q.stage==='stories')content=`<div class="prompt">${q.title}</div><p class="story-copy">${q.story}</p><div class="part-whole">${[[q.whole,q.a],[q.part,q.b],[q.missing,state.answered?q.answer:'؟']].map(([label,val])=>`<div class="part-cell"><p>${label}</p><strong>${arabic(val)}</strong></div>`).join('')}</div>${questionModels(q)}<h3 class="model-choice-label">${state.answered?'الإجابة الصحيحة':'عدّ الباقي، ثم اختر'}</h3>${choices(q)}`;
 else content=`<h3 class="prompt">اختر ناتج الطرح</h3><div class="question-board">${equation(q.a,q.b,state.answered?q.answer:null)}</div>${questionModels(q)}<h3 class="model-choice-label">${state.answered?'الإجابة الصحيحة':'عدّ الباقي، ثم اختر'}</h3>${choices(q)}`;
 return `${stageHeader()}<div class="panel-inner"><div class="challenge-counter"><span>تحدٍّ ${arabic(state.index+1)} من ${arabic(list.length)}</span>${wasSolved?`<span class="done-tag">${icon('star',15)} نجمة مكتسبة</span>`:'<span>فكّر… ثم اختر</span>'}</div>${content}${helpTip(q.hint)}${feedback()}<div class="bottom-actions"><button class="secondary" data-action="previous" ${state.index===0?'disabled':''}>السابق</button><button class="primary" data-action="next" ${!state.answered&&!wasSolved?'disabled':''}>${state.index===list.length-1?'أنهِ المحطة':'التحدي التالي'}</button></div><div class="mobile-journey">${arabic(state.solved.size)} من ${arabic(TOTAL_STARS)} نجمة في جواز رحلتك</div></div>`;
}
function completeStage(){
 const s=stageInfo(),n=stageProgress(state,s),all=state.solved.size===TOTAL_STARS,index=STAGES.indexOf(s),next=STAGES[(index+1)%STAGES.length];
 return `${stageHeader()}<div class="finish-screen"><div class="finish-icon">${icon(all?'medal':s.icon,43)}</div><h2>${all?'أنت بطل عالم الطرح!':n===s.count?'أكملت '+s.name+'!':'واصل رحلتك في '+s.name}</h2><div class="finish-stars">${Array.from({length:Math.min(5,n)},()=>icon('star',32)).join('')}</div><p>${all?'جمعت النجوم الـ٢٣، واكتشفت أسرار الطرح والتقريب والتقدير.':`جمعت ${arabic(n)} من ${arabic(s.count)} نجوم هذه المحطة.`}</p><div class="finish-actions">${all?'<button class="primary gold" data-action="passport">افتح جواز إنجازك</button>':`<button class="primary" data-action="station" data-stage="${next.id}">${next.name}</button>`}<button class="secondary" data-action="home">اختر محطة</button></div></div>`;
}
function helpModal(){return `<h2 id="modal-title">كيف ألعب؟</h2><p class="modal-lead">رافق بسمة وراشد، وافتح محطات رحلتك.</p><ol class="help-list"><li><span class="n">١</span><span>اختر محطة. يمكنك البدء من بنك العشرات.</span></li><li><span class="n">٢</span><span>في البنك: افتح حزمة، ثم انقر ٧ آحاد وعشرة واحدة لاستبعادها.</span></li><li><span class="n">٣</span><span>في مسائل الطرح: استخدم نماذج العشرات والآحاد. فكّ عشرة عند الحاجة، واستبعد المطروح، ثم عدّ الباقي واختر. يمكنك إخفاء النماذج للتدريب الذهني.</span></li><li><span class="n">٤</span><span>في التقدير، أكمل الخانات الثلاث. استخدم التلميح إذا احتجت إليه.</span></li><li><span class="n">٥</span><span>كل تحدٍّ جديد يمنحك نجمة واحدة. افتح جوازك لترى المحطات التي أكملتها.</span></li></ol><p class="footnote">تقدمك يبقى أثناء هذه الرحلة. تحديث الصفحة يبدأ رحلة جديدة.</p><div class="modal-actions"><button class="primary" data-action="close-modal">فهمت، لنلعب</button></div>`;}
function passportModal(){return `<h2 id="modal-title">جواز إنجازي</h2><p class="modal-lead">${state.solved.size===TOTAL_STARS?'أحسنت! أكملت المحطات الخمس.':'كل نجمة تحكي اكتشافًا جديدًا.'}</p><div class="passport"><div class="passport-title">بسمة وراشد في عالم الطرح</div><div class="passport-score">${icon('star',31)} ${arabic(state.solved.size)} / ${arabic(TOTAL_STARS)}</div><div class="passport-grid">${STAGES.map(s=>{const n=stageProgress(state,s);return `<div class="stamp ${n===s.count?'complete':''}">${icon(n===s.count?'medal':s.icon,29)}<strong>${s.name}</strong><small>${n===s.count?'أكملت المحطة':arabic(n)+' من '+arabic(s.count)}</small></div>`}).join('')}</div><div class="passport-credit"><img src="assets/multaqa.jpg" alt="شعار الملتقى"><div><b>أ/ فاطمة هزازي</b><br>ملتقى التعليم التفاعلي (تفاعل)</div></div></div><div class="modal-actions"><button class="primary" data-action="print">${icon('print',20)} اطبع الجواز</button><button class="secondary" data-action="close-modal">تابع اللعب</button></div>`;}
function modal(){return state.modal?`<div class="modal-backdrop" data-action="backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1"><button class="icon-button close-modal" data-action="close-modal" aria-label="إغلاق">${icon('close',21)}</button>${state.modal==='help'?helpModal():passportModal()}</section></div>`:'';}
function confetti(){return state.celebrating?`<div class="celebration" aria-hidden="true">${Array.from({length:23},(_,i)=>`<span class="confetti" style="--x:${(i*47)%100}%;--color:${['#edb844','#159ba1','#d8547f'][i%3]};--size:${14+i%4*4}px;--delay:${i%6*.06}s">${icon('star')}</span>`).join('')}</div>`:'';}
function render(focus){
 const views={home,bank,question,stageComplete:completeStage};
 root.innerHTML=`<div class="app-wrap" ${state.modal?'inert':''}>${header()}<div class="main-layout"><main class="play-panel" id="playground" tabindex="-1">${(views[state.mode]??home)()}</main>${sidebar()}</div>${footer()}</div>${modal()}${confetti()}`;
 if(focus)requestAnimationFrame(()=>document.querySelector(focus)?.focus());
}
function celebrate(){
 state.celebrating=true;clearTimeout(celebrationTimer);
 celebrationTimer=setTimeout(()=>{state.celebrating=false;document.querySelector('.celebration')?.remove();},2100);
}
function setFeedback(result){state.feedback=result;if(result.ok&&result.fresh)celebrate();render();return result;}
function beginStation(id){startStage(state,id);render('#playground');}
function nextChallenge(){
 if(state.mode!=='question')throw new Error('افتح تحديًا أولًا.');
 const q=currentQuestion(state);if(!state.answered&&!state.solved.has(q.id))throw new Error('أكمل التحدي الحالي أولًا.');
 if(!changeQuestion(state,1))state.mode='stageComplete';
 render('#playground');
}
function submitAnswer(input){
 if(state.mode==='bank')return setFeedback(checkBank(state,input));
 if(state.mode==='question')return setFeedback(checkQuestion(state,input));
 throw new Error('افتح محطة للإجابة.');
}
function setModelsVisible(visible){
 if(state.mode!=='question'||!state.questionModel)throw new Error('افتح مسألة طرح أولًا.');
 if(typeof visible!=='boolean')throw new Error('حدد إظهار النماذج أو إخفاءها.');
 state.modelsVisible=visible;render('.model-toggle');return publicState(state);
}
function useQuestionModel(operation,kind,index){
 if(state.mode!=='question'||!state.questionModel)throw new Error('افتح مسألة طرح أولًا.');
 if(state.answered)throw new Error('أكملت هذا السؤال. انتقل إلى التحدي التالي.');
 let result;
 if(operation==='exchange')result=exchangeQuestionModel(state.questionModel);
 else if(operation==='toggle')result=toggleQuestionModel(state.questionModel,kind,index);
 else if(operation==='reset'){state.questionModel=freshQuestionModel(currentQuestion(state));result={ok:true,message:'أعدنا تمثيل العدد الأول. جرّب الحل بالنماذج.'};}
 else throw new Error('اختر إجراءً متاحًا للنماذج.');
 state.modelFeedback=result;state.modelsVisible=true;
 render(operation==='toggle'?`[data-action="question-model-block"][data-kind="${kind}"][data-index="${index}"]`:'.question-model .block:not(:disabled)');
 return {result,state:publicState(state)};
}
root.addEventListener('click',async event=>{
 const el=event.target.closest('[data-action]');if(!el||el.disabled)return;
 const action=el.dataset.action;
 try{
  if(action==='station')beginStation(el.dataset.stage);
  else if(action==='home'){state.mode='home';state.stage=null;state.feedback=null;state.hint=false;render('#playground');}
  else if(action==='hint'){state.hint=!state.hint;render();}
  else if(action==='exchange')setFeedback(exchangeTen(state.bank));
  else if(action==='block')setFeedback(toggleBlock(state.bank,el.dataset.kind,Number(el.dataset.index)));
  else if(action==='restart-bank')beginStation('bank');
  else if(action==='toggle-model')setModelsVisible(!state.modelsVisible);
  else if(action==='question-model-exchange')useQuestionModel('exchange');
  else if(action==='question-model-block')useQuestionModel('toggle',el.dataset.kind,Number(el.dataset.index));
  else if(action==='reset-question-model')useQuestionModel('reset');
  else if(action==='answer'){state.selected=Number(el.dataset.answer);submitAnswer(el.dataset.answer);}
  else if(action==='next')nextChallenge();
  else if(action==='previous'){changeQuestion(state,-1);render('#playground');}
  else if(action==='help'||action==='passport'){state.modal=action;render('.close-modal');}
  else if(action==='close-modal'||action==='backdrop'&&event.target===el){state.modal=null;render('[data-action="passport"]');}
  else if(action==='print'){window.print();}
  else if(action==='fullscreen'){
   if(document.fullscreenElement)await document.exitFullscreen?.();else await document.documentElement.requestFullscreen?.();
  }
 }catch(error){state.feedback={ok:false,message:error.message||'تعذّر إكمال هذه الخطوة. جرّب مرة أخرى.'};render();}
});
root.addEventListener('input',event=>{
 const field=event.target.dataset?.field;if(!field)return;
 const value=arabic(event.target.value);event.target.value=value;
 if(field==='bank')state.bankInput=value;
 else if(field==='estimate')state.estimateInputs[Number(event.target.dataset.index)]=value;
});
root.addEventListener('submit',event=>{
 const form=event.target.dataset.form;if(!form)return;event.preventDefault();
 if(form==='bank')submitAnswer(state.bankInput);else if(form==='estimate')submitAnswer(state.estimateInputs);
});
document.addEventListener('keydown',event=>{
 if(!state.modal)return;
 if(event.key==='Escape'){state.modal=null;render('[data-action="passport"]');return;}
 if(event.key==='Tab'){
  const nodes=[...document.querySelectorAll('.modal button:not(:disabled), .modal input:not(:disabled), .modal [tabindex="0"]')];
  const first=nodes[0],last=nodes[nodes.length-1];
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
 }
});

function registerWebMCP(){
 const context=document.modelContext;if(!context?.registerTool)return;
 const lifecycle=new AbortController();
 const register=(name,title,description,inputSchema,readOnlyHint,execute)=>{
  try{Promise.resolve(context.registerTool({name,title,description,inputSchema,annotations:{readOnlyHint,untrustedContentHint:false},execute},{signal:lifecycle.signal})).catch(()=>{});}catch{}
 };
 const object=(properties={},required=[])=>({type:'object',properties,required,additionalProperties:false});
 register('get_game_state','حالة اللعبة','Read the visible game state, current question and earned stars.',object(),true,()=>publicState(state));
 register('start_station','ابدأ محطة','Open a station and its first unfinished challenge; this does not award a star.',object({station:{type:'string',enum:STAGES.map(s=>s.id)}},['station']),false,input=>{if(!input||!STAGES.some(s=>s.id===input.station))throw new Error('Unknown station');beginStation(input.station);return publicState(state);});
 register('exchange_ten','فك حزمة','Exchange one ten for ten ones in the active bank task; the total stays 30.',object(),false,()=>{if(state.mode!=='bank')throw new Error('Bank is not active');const result=exchangeTen(state.bank);setFeedback(result);return {result,state:publicState(state)};});
 register('select_bank_blocks','اختر القطع','Set which bank blocks are removed, using the same toggles as the play area. Requires the ten to be exchanged first.',object({ones:{type:'array',items:{type:'integer',minimum:0,maximum:9},maxItems:7,uniqueItems:true},tens:{type:'array',items:{type:'integer',minimum:0,maximum:1},maxItems:1,uniqueItems:true}},['ones','tens']),false,input=>{
  if(state.mode!=='bank'||state.bank.phase==='exchange'||state.bank.phase==='complete')throw new Error('Open the bank and exchange a ten first');
  if(!input||!Array.isArray(input.ones)||!Array.isArray(input.tens)||input.ones.length>7||input.tens.length>1||new Set(input.ones).size!==input.ones.length||new Set(input.tens).size!==input.tens.length||input.ones.some(n=>!Number.isInteger(n)||n<0||n>9)||input.tens.some(n=>!Number.isInteger(n)||n<0||n>1))throw new Error('Invalid block selection');
  for(const [kind,desired] of [['ones',input.ones],['tens',input.tens]]){
   const set=kind==='ones'?state.bank.removedOnes:state.bank.removedTens;
   for(const n of [...set])if(!desired.includes(n))toggleBlock(state.bank,kind,n);
   for(const n of desired)if(!set.has(n))toggleBlock(state.bank,kind,n);
  }
  render();return publicState(state);
 });
 register('submit_answer','تحقّق من الإجابة','Submit the current challenge answer. A correct answer awards at most one star. Estimation requires all three values: rounded first number, rounded second number and estimated difference.',object({answer:{type:['string','number']},estimate:{type:'array',items:{type:['string','number']},minItems:3,maxItems:3}}),false,input=>{
  if(!input||typeof input!=='object')throw new Error('Invalid answer');
  const q=currentQuestion(state),answer=state.mode==='question'&&q?.stage==='estimate'?input.estimate:input.answer;
  if(state.mode==='bank')state.bankInput=arabic(answer??'');
  else if(q?.stage==='estimate'&&Array.isArray(answer))state.estimateInputs=answer.map(arabic);
  const result=submitAnswer(answer);return {result,state:publicState(state)};
 });
 register('next_challenge','التحدي التالي','Move to the next question only after this challenge has been completed.',object(),false,()=>{nextChallenge();return publicState(state);});
 register('set_models_visible','إظهار النماذج','Show or hide the current subtraction question models while preserving selected blocks and answer feedback.',object({visible:{type:'boolean'}},['visible']),false,input=>setModelsVisible(input?.visible));
 register('use_question_model','حل بالنماذج','Interact with tens and ones for the current subtraction question. Exchange is allowed once only when required; toggle removes or restores one block. Model actions never award stars or submit an answer.',object({operation:{type:'string',enum:['exchange','toggle','reset']},kind:{type:'string',enum:['ones','tens']},index:{type:'integer',minimum:0,maximum:18}},['operation']),false,input=>useQuestionModel(input?.operation,input?.kind,input?.index));
 window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
render();registerWebMCP();

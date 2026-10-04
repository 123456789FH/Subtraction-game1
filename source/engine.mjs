export const arabic = value => String(value).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);
export function parseNumber(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text=String(value).trim().replace(/[٠-٩]/g,c=>String('٠١٢٣٤٥٦٧٨٩'.indexOf(c))).replace(/[۰-۹]/g,c=>String('۰۱۲۳۴۵۶۷۸۹'.indexOf(c)));
  return /^\d{1,4}$/.test(text)?Number(text):null;
}
export const roundTo = (n,unit=10) => Math.floor(n/unit+.5)*unit;

const calc = [[15,9,[6,5,7,8]],[12,4,[8,6,9,16]],[13,6,[7,6,8,19]],[17,9,[8,7,9,6]],[50,20,[30,20,40,70]],[70,10,[60,50,70,80]],[25,15,[10,20,15,40]],[61,31,[30,20,40,32]]];
const sub = calc.map(([a,b,choices],i)=>({id:`q${i+1}`,number:i+1,stage:'subtract',a,b,answer:a-b,choices,hint:a%10===0&&b%10===0?'فكّر في عدد العشرات المتبقية.':`ابدأ من ${arabic(a)} وارجع ${arabic(b)} خطوات. يمكنك استخدام أصابعك أو قطع العدّ.`}));
const stories=[
 {id:'q9',number:9,stage:'stories',a:36,b:14,answer:22,choices:[22,20,24,50],title:'أقلام هند',story:'لدى هند علبة أقلام تحوي ٣٦ قلمًا. أعطت صديقاتها ١٤ قلمًا. كم قلمًا يبقى معها؟',whole:'عدد الأقلام',part:'أعطت',missing:'يبقى',unit:'قلمًا',hint:'الأقلام التي أعطتها هند جزء من أقلامها. اطرح هذا الجزء لتجد الباقي.'},
 {id:'q10',number:10,stage:'stories',a:49,b:27,answer:22,choices:[22,21,32,76],title:'مجلة راشد',story:'يريد راشد شراء ٤٩ نسخة من مجلة علمية. اشترى من المكتبة الأولى ٢٧ نسخة. كم نسخة أخرى يحتاج؟',whole:'المطلوب شراؤه',part:'تم شراؤه',missing:'ما زال مطلوبًا',unit:'نسخة',hint:'ابحث عن عدد النسخ التي تكمل ٢٧ إلى ٤٩. يمكنك طرح ما اشتراه من العدد المطلوب.'}
];
const rounding=[76,57,32,99,273,932,166,501].map((value,i)=>({id:`q${i+11}`,number:i+11,stage:'round',value,unit:i<4?10:100,answer:roundTo(value,i<4?10:100),hint:'انظر إلى مكان العدد بين البيتين، ثم اختر البيت الأقرب.'}));
const estimating=[[52,42],[49,18],[67,28],[88,61]].map(([a,b],i)=>({id:`q${i+19}`,number:i+19,stage:'estimate',a,b,roundedA:roundTo(a),roundedB:roundTo(b),answer:roundTo(a)-roundTo(b),exact:a-b,hint:'قرّب كل عدد إلى أقرب عشرة، ثم اطرح العددين بعد التقريب.'}));
export const QUESTIONS=[...sub,...stories,...rounding,...estimating];
export const STAGES=[
 {id:'bank',name:'بنك العشرات',short:'افتح حزمة واكتشف الباقي',icon:'blocks',color:'teal',ids:['bank'],count:1},
 {id:'subtract',name:'كنز الباقي',short:'اطرح وافتح طريقك',icon:'sparkles',color:'gold',ids:sub.map(q=>q.id),count:8},
 {id:'stories',name:'حديقة المسائل',short:'ساعد هند وراشد',icon:'book',color:'pink',ids:stories.map(q=>q.id),count:2},
 {id:'round',name:'بيوت الأعداد',short:'اختر الجار الأقرب',icon:'home',color:'blue',ids:rounding.map(q=>q.id),count:8},
 {id:'estimate',name:'عدسة التقدير',short:'قرّب… ثم اطرح',icon:'search',color:'purple',ids:estimating.map(q=>q.id),count:4}
];
export const TOTAL_STARS=23;
export const questionsFor=stage=>QUESTIONS.filter(q=>q.stage===stage);
export const freshBank=()=>({tens:3,ones:0,phase:'exchange',removedTens:new Set(),removedOnes:new Set()});
export const createState=()=>({mode:'home',stage:null,index:0,solved:new Set(),bank:freshBank(),feedback:null,hint:false,selected:null,modal:null,bankInput:'',estimateInputs:['','',''],answered:false,celebrating:false,questionModel:null,modelsVisible:true,modelFeedback:null});

// Visual support for the ten subtraction questions. These actions never award stars.
export function freshQuestionModel(q){
 if(!q||!['subtract','stories'].includes(q.stage))return null;
 return {questionId:q.id,a:q.a,b:q.b,tens:Math.floor(q.a/10),ones:q.a%10,needsExchange:q.a%10<q.b%10,exchanged:false,removedTens:new Set(),removedOnes:new Set()};
}
export function modelReady(m){return !!m&&(!m.needsExchange||m.exchanged)&&m.removedTens.size===Math.floor(m.b/10)&&m.removedOnes.size===m.b%10;}
export function modelRemaining(m){return (m.tens-m.removedTens.size)*10+m.ones-m.removedOnes.size;}
export function exchangeQuestionModel(m){
 if(!m||!m.needsExchange||m.exchanged)return {ok:false,message:'لا تحتاج هذه الخطوة إلى فكّ حزمة أخرى.'};
 m.tens-=1;m.ones+=10;m.exchanged=true;
 return {ok:true,message:`فككت عشرة إلى ١٠ آحاد. بقي العدد ${arabic(m.a)} نفسه. ابدأ استبعاد ${arabic(m.b)}.`};
}
export function toggleQuestionModel(m,kind,index){
 if(!m)throw new Error('لا توجد نماذج لهذا السؤال.');
 if(m.needsExchange&&!m.exchanged)return {ok:false,message:'الآحاد لا تكفي؛ فكّ عشرة إلى ١٠ آحاد أولًا.'};
 if(kind!=='ones'&&kind!=='tens')throw new Error('اختر منزلة الآحاد أو العشرات.');
 if(!Number.isInteger(index)||index<0||index>=m[kind])throw new Error('اختر قطعة موجودة في النموذج.');
 const selected=kind==='ones'?m.removedOnes:m.removedTens,target=kind==='ones'?m.b%10:Math.floor(m.b/10);
 if(selected.has(index))selected.delete(index);
 else if(selected.size>=target)return {ok:false,message:target===0?'لا نحتاج إلى استبعاد قطع من هذه المنزلة.':`أكملت العدد المطلوب من ${kind==='ones'?'الآحاد':'العشرات'}. انقر قطعة مستبعدة لإعادتها.`};
 else selected.add(index);
 return {ok:true,message:modelReady(m)?'عدّ القطع المتبقية، ثم اختر الإجابة.':'انقر القطع لاستبعاد المطروح. يمكنك النقر مرة أخرى لإعادتها.'};
}
export function finishQuestionModel(m){
 if(!m)return;
 if(m.needsExchange&&!m.exchanged)exchangeQuestionModel(m);
 for(const [set,target,count] of [[m.removedOnes,m.b%10,m.ones],[m.removedTens,Math.floor(m.b/10),m.tens]]){
  for(let i=0;set.size<target&&i<count;i++)set.add(i);
 }
}
function resetQuestionSupport(state){state.questionModel=freshQuestionModel(currentQuestion(state));state.modelsVisible=true;state.modelFeedback=null;}
export function award(state,id){
  if(id!=='bank'&&!QUESTIONS.some(q=>q.id===id))throw new Error('Unknown challenge');
  const fresh=!state.solved.has(id);state.solved.add(id);return fresh;
}
export function stageProgress(state,stage){return stage.ids.filter(id=>state.solved.has(id)).length;}
export function startStage(state,id){
 const stage=STAGES.find(s=>s.id===id);if(!stage)throw new Error('Unknown station');
 state.stage=id;state.mode=id==='bank'?'bank':'question';state.feedback=null;state.hint=false;state.selected=null;state.answered=false;state.estimateInputs=['','',''];
 if(id==='bank'){state.bank=freshBank();state.bankInput='';state.index=0;}
 else{const list=questionsFor(id);const first=list.findIndex(q=>!state.solved.has(q.id));state.index=first<0?0:first;}
 resetQuestionSupport(state);
}
export function currentQuestion(state){return questionsFor(state.stage)[state.index]??null;}
export function changeQuestion(state,delta){
 const list=questionsFor(state.stage);const index=state.index+delta;if(index<0||index>=list.length)return false;
 state.index=index;state.feedback=null;state.hint=false;state.selected=null;state.answered=false;state.estimateInputs=['','',''];resetQuestionSupport(state);return true;
}
export function exchangeTen(bank){
 if(bank.phase!=='exchange')return {ok:false,message:'أصبح لدينا ما يكفي من الآحاد؛ ابدأ الطرح.'};
 bank.tens=2;bank.ones=10;bank.phase='remove';
 return {ok:true,message:'عشرتان و١٠ آحاد. العدد ما زال ٣٠؛ تغيّرت طريقة تمثيله.'};
}
export function toggleBlock(bank,kind,index){
 if(bank.phase==='exchange')return {ok:false,message:'افتح حزمة واحدة أولًا لتحصل على آحاد.'};
 if(bank.phase==='complete')return {ok:false,message:'أكملت هذه المحاولة!'};
 if(kind!=='ones'&&kind!=='tens')throw new Error('Unknown place');
 const max=kind==='ones'?bank.ones:bank.tens;
 if(!Number.isInteger(index)||index<0||index>=max)throw new Error('Unknown block');
 const selected=kind==='ones'?bank.removedOnes:bank.removedTens,target=kind==='ones'?7:1;
 if(selected.has(index))selected.delete(index);
 else if(selected.size>=target)return {ok:false,message:kind==='ones'?'نحتاج إلى ٧ آحاد فقط. انقر قطعة مستبعدة لإعادتها.':'نحتاج إلى استبعاد عشرة واحدة فقط.'};
 else selected.add(index);
 bank.phase=bank.removedOnes.size===7&&bank.removedTens.size===1?'answer':'remove';
 return {ok:true,message:bank.phase==='answer'?'أكملت استبعاد ١٧. عدّ الباقي واكتب الإجابة.':'انقر القطع المطلوبة لاستبعادها. يمكنك النقر مرة أخرى لإعادتها.'};
}
export function bankRemaining(bank){return (bank.tens-bank.removedTens.size)*10+bank.ones-bank.removedOnes.size;}
export function checkBank(state,input){
 const bank=state.bank;if(bank.phase==='complete')return {ok:true,fresh:false,message:'أحسنت! اكتشفت الباقي: ١٣.'};
 if(bank.phase!=='answer')return {ok:false,message:'أكمل استبعاد ٧ آحاد وعشرة واحدة بالنماذج أولًا.'};
 const n=parseNumber(input);if(n===null)return {ok:false,empty:true,message:'اكتب عدد الآحاد والعشرات المتبقية بالأرقام.'};
 if(n!==bankRemaining(bank))return {ok:false,message:'عدّ العشرة والآحاد التي لم تستبعدها، ثم جرّب مجددًا.'};
 bank.phase='complete';return {ok:true,fresh:award(state,'bank'),message:'أحسنت! بقيت عشرة و٣ آحاد، أي ١٣ تفاحة خضراء.'};
}
export function checkQuestion(state,input){
 const q=currentQuestion(state);if(!q)throw new Error('No active question');
 if(state.answered)return {ok:true,fresh:false,message:'أكملت هذا السؤال.'};
 if(q.stage==='estimate'){
  if(!Array.isArray(input)||input.length!==3)return {ok:false,empty:true,message:'اكتب الأعداد الثلاثة أولًا.'};
  const values=input.map(parseNumber);if(values.some(v=>v===null))return {ok:false,empty:true,message:'أكمل خانات التقريب والناتج بالأرقام.'};
  if(values[0]!==q.roundedA)return {ok:false,field:0,message:`راجع تقريب ${arabic(q.a)} إلى أقرب عشرة. ${q.hint}`};
  if(values[1]!==q.roundedB)return {ok:false,field:1,message:`راجع تقريب ${arabic(q.b)} إلى أقرب عشرة.`};
  if(values[2]!==q.answer)return {ok:false,field:2,message:values[2]===q.exact?'هذا هو الفرق الدقيق. المطلوب طرح العددين بعد التقريب.':`اطرح ${arabic(q.roundedB)} من ${arabic(q.roundedA)}، ثم جرّب مجددًا.`};
 }else{
  const value=parseNumber(input);if(value===null)return {ok:false,empty:true,message:'اختر إجابة أولًا.'};
  if(value!==q.answer)return {ok:false,message:q.stage==='round'?'تأمّل مكان العدد على الخط. أي البيتين أقرب؟':`جرّب مرة أخرى. ${q.hint}`};
 }
 state.answered=true;finishQuestionModel(state.questionModel);state.modelFeedback=null;
 let message=q.stage==='round'?`أحسنت! ${arabic(q.answer)} هو الأقرب إلى ${arabic(q.value)}.`:q.stage==='estimate'?`أحسنت! الناتج التقديري حوالي ${arabic(q.answer)}، والفرق الدقيق ${arabic(q.exact)}.`:`أحسنت! الباقي ${arabic(q.answer)}${q.unit?' '+q.unit:''}.`;
 return {ok:true,fresh:award(state,q.id),message};
}
export function choicesFor(q){
 const list=[...q.choices],rotate=q.number%list.length;return [...list.slice(rotate),...list.slice(0,rotate)];
}
export function publicState(state){
 const q=currentQuestion(state);
 const m=state.mode==='question'?state.questionModel:null;
 return {view:state.mode,station:state.stage,question:q?{id:q.id,type:q.stage,a:q.a,b:q.b,value:q.value,unit:q.unit}:null,stars:state.solved.size,totalStars:TOTAL_STARS,completed:[...state.solved],bank:state.mode==='bank'?{phase:state.bank.phase,tens:state.bank.tens,ones:state.bank.ones,removedTens:[...state.bank.removedTens],removedOnes:[...state.bank.removedOnes]}:null,questionModel:m?{visible:state.modelsVisible,tens:m.tens,ones:m.ones,needsExchange:m.needsExchange,exchanged:m.exchanged,removedTens:[...m.removedTens],removedOnes:[...m.removedOnes],ready:modelReady(m)}:null};
}

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const frames=$$('.deck-page');let current=0,presentation=false,notesOpen=false,observer;
const narrow=()=>matchMedia('(max-width:900px)').matches;
function toast(message){$('.toast').textContent=message;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('.toast').textContent='',2600)}
function fit(){document.documentElement.style.setProperty('--deck-scale',Math.min((innerWidth-32)/1600,(innerHeight-140)/900));}
function sync(){
 frames.forEach((f,i)=>{f.classList.toggle('active',i===current);f.querySelector('.notes').hidden=!(notesOpen&&i===current)});
 $('#counter').textContent=`${current+1} / ${frames.length}`;$('#prev').disabled=current===0;$('#next').disabled=current===frames.length-1;
 $('#progress').style.transform=`scaleX(${(current+1)/frames.length})`;
 $('.current-section').textContent=frames[current].dataset.section;
 $$('[data-go]').forEach(a=>{a.classList.toggle('current',+a.dataset.go===current);if(+a.dataset.go===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
 $('#notesbtn').setAttribute('aria-pressed',notesOpen);$('#notesbtn').textContent=notesOpen?'노트 닫기':'발표 노트';
}
function go(n,replace=true){current=Math.max(0,Math.min(frames.length-1,n));sync();if(replace)history.replaceState(null,'',`#slide-${current+1}`);if(!presentation)frames[current].scrollIntoView({block:'start',behavior:'instant'});}
function setPresentation(value){
 if(value&&narrow()){toast('작은 화면에서는 읽기 모드로 장표를 볼 수 있습니다.');return}
 presentation=value;document.body.classList.toggle('present',value);$('#present').textContent=value?'읽기 모드':'발표 모드';$('#present').setAttribute('aria-pressed',value);
 observer?.disconnect();if(!value)frames.forEach(f=>observer?.observe(f));fit();go(current);
}
function closeToc(focus=false){$('#toc').hidden=true;$('#tocbtn').setAttribute('aria-expanded','false');if(focus)$('#tocbtn').focus()}
$('#present').onclick=()=>setPresentation(!presentation);
$('#prev').onclick=()=>go(current-1);$('#next').onclick=()=>go(current+1);
$('.brand').onclick=e=>{e.preventDefault();go(0)};
$('#tocbtn').onclick=()=>{const open=$('#toc').hidden;$('#toc').hidden=!open;$('#tocbtn').setAttribute('aria-expanded',open);if(open)$('#search').focus()};
$('#closetoc').onclick=()=>closeToc(true);
$$('[data-go]').forEach(a=>a.onclick=e=>{e.preventDefault();go(+a.dataset.go);closeToc();$('#tocbtn').focus()});
$('#search').oninput=e=>{const q=e.target.value.trim().toLowerCase();let count=0;$$('[data-go]').forEach(a=>{a.hidden=!a.textContent.toLowerCase().includes(q);if(!a.hidden)count++});$('.search-empty').hidden=count>0};
$('#resources').onclick=()=>go(52);
$('#notesbtn').onclick=()=>{notesOpen=!notesOpen;sync()};
$('#print').onclick=()=>window.print();
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('브라우저의 전체 화면 기능을 이용해주세요.')}};
document.addEventListener('fullscreenchange',()=>{$('#fullscreen').textContent=document.fullscreenElement?'전체 화면 종료':'전체 화면';fit()});
document.addEventListener('keydown',e=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)){if(e.key==='Escape')closeToc(true);return}
 if(e.key==='Escape'){if(!$('#toc').hidden)closeToc(true);else if(notesOpen){notesOpen=false;sync()}else if(presentation)setPresentation(false);return}
 if(!$('#toc').hidden)return;
 if(e.key.toLowerCase()==='n'){notesOpen=!notesOpen;sync();return}
 if(e.key.toLowerCase()==='f'){$('#fullscreen').click();return}
 if(!presentation)return;
 if(['ArrowRight','PageDown'].includes(e.key)||(e.key===' '&&!['BUTTON','A','SUMMARY'].includes(e.target.tagName))){e.preventDefault();go(current+1)}
 if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}
 if(e.key==='Home'){e.preventDefault();go(0)}if(e.key==='End'){e.preventDefault();go(frames.length-1)}
});
window.addEventListener('resize',()=>{if(narrow()&&presentation)setPresentation(false);fit()});
window.addEventListener('hashchange',()=>{const n=Number(location.hash.match(/slide-(\d+)/)?.[1]);if(n)go(n-1,false)});
observer=new IntersectionObserver(es=>{if(presentation)return;const e=es.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(e){current=+e.target.dataset.index;sync()}},{threshold:[.2,.5,.7]});

const states=[
 ['입력 전','공고를 올려주세요','사진 또는 PDF를 선택하세요. 예시 공고로 먼저 살펴볼 수도 있습니다.','예시로 시작'],
 ['입력 오류','파일을 읽을 수 없습니다','이미지 또는 PDF로 다시 올려주세요. 지금까지 입력한 내용은 유지합니다.','다른 파일 선택'],
 ['업로드 중','파일을 전송하고 있습니다','완료 전에는 새 요청을 만들지 않습니다. 취소하면 입력 화면으로 돌아갑니다.','전송 취소'],
 ['처리 중','마감일과 신청 요건을 확인하고 있습니다','저장 전에 결과를 수정할 수 있습니다. 오래 걸리면 중단하고 다시 시도할 수 있습니다.','처리 중단'],
 ['결과 있음','추출한 내용을 확인해주세요','마감일, 지원 금액, 신청 요건을 원문과 비교한 뒤 수정하고 저장합니다.','원문과 비교'],
 ['근거 없음','지원 가능 여부를 확정할 수 없습니다','공고에 없는 조건입니다. 담당자에게 확인할 항목을 목록에 남깁니다.','확인 목록에 추가'],
 ['연결 실패','연결이 끊겼습니다','요청 상태를 확인한 뒤 재시도합니다. 같은 작업이 중복 실행되지 않도록 합니다.','상태 확인 후 재시도'],
 ['다시 열기','저장한 준비 목록을 불러왔습니다','최종 수정 시각과 공고 원문을 확인하세요. 조건이 바뀌었을 수 있습니다.','이어하기']
];
function setState(i){const s=states[i];$('#state-example').innerHTML=`<div class="status">설계 예시 / ${s[0]}</div><b>${s[1]}</b><p>${s[2]}</p><span class="action">다음 행동: ${s[3]}</span>`;$$('[data-state]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.state===i));}
$$('[data-state]').forEach(b=>b.onclick=()=>setState(+b.dataset.state));setState(0);
const demos=[
 '<h3>공고를 요약해 드립니다</h3><span class="demo-tag">초안</span><div class="demo-grid"><p>긴 요약문은 있지만,<br>수정·근거·저장 위치가 보이지 않습니다.</p><div class="paper">신청할 수 있을 것 같습니다.<br>자세한 내용은 확인해 보세요.</div></div>',
 '<h3>날짜와 준비물을 확인해주세요</h3><span class="demo-tag">UX 개선</span><div class="demo-grid"><div class="paper">마감일: 12월 1일<br>필요 서류: 사업자등록증<br><small>수정 가능한 추출 항목</small></div><p>원문 근거와 수정·저장 행동을<br>같은 화면에 연결합니다.</p></div>',
 '<h3>업종 요건은 추가 확인이 필요합니다</h3><span class="demo-tag">검증과 통제</span><div class="demo-grid"><div class="paper">마감일: 12월 1일 / 원문 2쪽<br>업종 요건: 미확인<br>준비 목록: 임시 저장 완료</div><p>불확실성, 근거, 저장 상태를 표시하고<br>최종 판단은 사용자에게 남깁니다.</p></div>'
];
function setDemo(i){$('#demo-panel').innerHTML=demos[i];$$('[data-demo]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.demo===i));}
$$('[data-demo]').forEach(b=>b.onclick=()=>setDemo(+b.dataset.demo));setDemo(0);
$$('[data-case]').forEach(b=>b.onclick=()=>{const i=+b.dataset.case;$('#industry-case').innerHTML=CASES[i].html.replaceAll(' ↗','');$$('[data-case]').forEach(x=>x.setAttribute('aria-pressed',+x.dataset.case===i));});
const select=$('#calc-model');DATA.models.forEach((m,i)=>{const o=document.createElement('option');o.value=i;o.textContent=m[0]+' '+m[1];select.add(o)});select.value=2;
function val(id,min,max){const n=Number($(id).value);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):min}
function calc(){
 const fields=$$('#calc-form input');fields.forEach(e=>e.setAttribute('aria-invalid',!e.validity.valid||e.value===''));
 if(fields.some(e=>!e.validity.valid||e.value==='')){$('#calc-total').textContent='입력값 확인';$('#calc-unit').textContent='각 항목의 범위 안에서 입력해주세요. 호출당 입력은 최대 100K 토큰입니다.';$('#cost-bars').replaceChildren();return}
 const m=DATA.models[+select.value],tasks=val('#calc-tasks',1,1e8),calls=val('#calc-calls',1,100),it=val('#calc-in',0,100000),ot=val('#calc-out',0,1e6),retry=val('#calc-retry',0,200)/100,success=val('#calc-success',1,100)/100,n=tasks*calls*(1+retry),total=n*(it*m[2]+ot*m[3])/1e6;
 $('#calc-total').textContent='$'+total.toLocaleString('en-US',{maximumFractionDigits:2,minimumFractionDigits:2});
 $('#calc-unit').textContent=`완료 ${Math.round(tasks*success).toLocaleString()}건 기준, 성공 1건당 $${(total/(tasks*success)).toFixed(5)} / ${Math.round(n).toLocaleString()}회 호출${m[5]?' / '+m[5]:''}`;
 const alternatives=[0,+select.value,3].map(i=>({name:DATA.models[i][1],cost:n*(it*DATA.models[i][2]+ot*DATA.models[i][3])/1e6})),max=Math.max(...alternatives.map(x=>x.cost),.001);
 $('#cost-bars').innerHTML=alternatives.map(x=>`<div class="cost-bar"><span>${x.name}　$${x.cost.toFixed(2)}</span><i style="transform:scaleX(${x.cost/max})"></i></div>`).join('');
}
$('#calc-form').addEventListener('input',calc);$('#calc-form').addEventListener('change',calc);$('#calc-form').addEventListener('submit',e=>e.preventDefault());$('#calc-unit').setAttribute('aria-live','polite');calc();
$('#readiness').addEventListener('change',()=>{const n=$$('#readiness input:checked').length;$('.readiness-result').textContent=`확인 항목 ${n} / 5. ${n===5?'실제 증거와 남은 한계도 확인하세요.':'확인하지 못한 항목부터 검증하세요.'}`});
$$('[data-copy]').forEach(b=>b.onclick=async()=>{const el=document.getElementById(b.dataset.copy);try{await navigator.clipboard.writeText(el.textContent);toast('프롬프트를 복사했습니다.')}catch{const r=document.createRange();r.selectNodeContents(el);getSelection().removeAllRanges();getSelection().addRange(r);toast('본문을 선택했습니다. 복사 메뉴를 이용해주세요.')}});
document.fonts.ready.then(()=>fit());
current=Math.max(0,Math.min(frames.length-1,Number(location.hash.match(/slide-(\d+)/)?.[1]||1)-1));
setPresentation(!narrow());

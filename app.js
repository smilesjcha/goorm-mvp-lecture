const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const frames=$$('.deck-page');let current=0,presentation=false,notesOpen=false,observer;
const narrow=()=>matchMedia('(max-width:900px)').matches;
function toast(message){$('.toast').textContent=message;clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('.toast').textContent='',2600)}
function fit(){document.documentElement.style.setProperty("--read-scale",Math.min((innerWidth-64)/1600,1));document.documentElement.style.setProperty('--deck-scale',Math.min((innerWidth-32)/1600,(innerHeight-140)/900));}
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
$('#search').oninput=e=>{const q=e.target.value.trim().toLowerCase();let count=0;$$('#toc [data-go]').forEach(a=>{a.hidden=!a.textContent.toLowerCase().includes(q);if(!a.hidden)count++});$('.search-empty').hidden=count>0};
$('#resources').onclick=()=>go(54);
$('#notesbtn').onclick=()=>{notesOpen=!notesOpen;sync()};
$('#print').onclick=()=>window.print();
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('브라우저의 전체 화면 기능을 이용해주세요.')}};
document.addEventListener('fullscreenchange',()=>{$('#fullscreen').textContent=document.fullscreenElement?'전체 화면 종료':'전체 화면';fit()});
document.addEventListener('keydown',e=>{
 if(e.defaultPrevented||e.isComposing||e.metaKey||e.ctrlKey||e.altKey)return;
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
 ['상품 사진을 추가하세요','사진과 상품 설명으로 카피 초안을 만듭니다. 샘플 상품으로 먼저 살펴볼 수 있습니다.','샘플 상품으로 시작하기','입력은 임시 저장합니다. 생성 요청 전에는 크레딧을 사용하지 않습니다.'],
 ['영상 제작 순서를 기다리고 있습니다','입력은 저장했습니다. 창을 닫아도 상품 목록에서 진행 상태를 확인할 수 있습니다.','상품 목록으로 돌아가기','job_id를 발급하고 예산을 예약합니다. 확인되지 않은 완료 시각이나 진행률은 표시하지 않습니다.'],
 ['기존 요청의 결과를 확인하고 있습니다','응답이 늦어지고 있습니다. 새로 생성하지 않고 기존 작업의 결과를 확인합니다.','작업 상태 확인하기','request_id로 상태를 조회합니다. 결과가 불명확하면 새 제출과 사용량 확정을 보류합니다.'],
 ['영상 제작에 실패했습니다','예약했던 20 크레딧을 돌려드렸습니다. 입력한 내용으로 다시 요청할 수 있습니다.','입력 확인 후 다시 요청하기','실패를 확정하고 반환 원장까지 반영한 상태입니다. 동일 작업을 다시 청구하지 않습니다.'],
 ['검수한 영상을 저장했습니다','상품 목록에서 다시 열거나 파일을 다운로드할 수 있습니다.','영상 다운로드하기','파일 보관과 접근 권한을 확인했습니다. 사용량 원장은 같은 job_id에 한 번만 반영합니다.']
];
function setState(i){const s=states[i];$('#state-example').innerHTML=`<div><h3>${s[0]}</h3><p>${s[1]}</p><b>${s[2]}</b></div><div><h3>서비스의 동작</h3><p>${s[3]}</p></div>`;$$('[data-state]').forEach(b=>b.setAttribute('aria-pressed',+b.dataset.state===i));}
$$('[data-state]').forEach(b=>b.onclick=()=>setState(+b.dataset.state));
let breaker='closed',probes=0;
function renderBreaker(){
 const content={closed:['정상 운영 중','최근 20건 중 10건 이상이 공급사 오류이면 새 요청을 잠시 멈춥니다.'],open:['새 생성 요청을 잠시 멈췄습니다','기존 입력은 보존합니다. 대기 30초 후 제한된 시험 요청으로 회복 여부를 확인합니다.'],half:['시험 요청으로 회복을 확인합니다',`시험 성공 ${probes} / 2건. 일반 요청은 아직 차단합니다. 시험이 실패하면 다시 Open으로 돌아갑니다.`]}[breaker];
 $('#breaker-copy').innerHTML=`<h3>${content[0]}</h3><p>${content[1]}</p>`;
 $$('[data-breaker-node]').forEach(e=>{e.classList.toggle('selected',e.dataset.breakerNode===breaker);e.setAttribute('aria-current',e.dataset.breakerNode===breaker?'step':'false')});
 $('[data-breaker="fail"]').disabled=breaker==='open';$('[data-breaker="cool"]').disabled=breaker!=='open';$('[data-breaker="ok"]').disabled=breaker!=='half';
}
$$('[data-breaker]').forEach(b=>b.onclick=()=>{switch(b.dataset.breaker){case 'fail':breaker='open';probes=0;break;case 'cool':if(breaker==='open')breaker='half';break;case 'ok':if(breaker==='half'&&++probes===2){breaker='closed';probes=0;}break;case 'reset':breaker='closed';probes=0;}renderBreaker()});renderBreaker();
function calc(){
 const fields=$$('#econ-form input');fields.forEach(e=>e.setAttribute('aria-invalid',!e.validity.valid||e.value===''));
 if(fields.some(e=>!e.validity.valid||e.value==='')){$('#econ-total').textContent='입력값 확인';$('#econ-detail').textContent='빈칸 없이 표시된 범위의 숫자를 입력하세요. 완료율은 1~100%입니다.';return}
 const price=+$('#price').value,cost=+$('#cost').value,attempts=+$('#attempts').value,completion=+$('#completion').value/100,other=+$('#other').value,fee=+$('#fee').value/100;
 const gen=cost*attempts/completion,payment=price*fee,total=price-gen-other-payment;
 const money=n=>(n<0?'−$':'$')+Math.abs(n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
 $('#econ-total').textContent=money(total);$('#econ-detail').textContent=`판매가 ${money(price)} − 생성 ${money(gen)} − 기타 ${money(other)} − 수수료 ${money(payment)}${total<0?' / 가정상 변동비도 회수하지 못합니다.':''}`;
}
$('#econ-form').addEventListener('input',calc);$('#econ-form').addEventListener('submit',e=>e.preventDefault());calc();
$('#readiness').addEventListener('change',()=>{const n=$$('#readiness input:checked').length;$('.readiness-result').textContent=`확인 항목 ${n} / 5. ${n===5?'실행 증거와 남은 한계를 함께 검토하세요.':'각 항목에 실행 증거를 연결하세요.'}`});
$$('[data-copy]').forEach(b=>b.onclick=async()=>{const el=document.getElementById(b.dataset.copy);try{await navigator.clipboard.writeText(el.innerText);toast('작업 요청을 복사했습니다.')}catch{const r=document.createRange();r.selectNodeContents(el);getSelection().removeAllRanges();getSelection().addRange(r);toast('본문을 선택했습니다. 복사 메뉴를 이용해주세요.')}});
document.fonts.ready.then(()=>fit());
current=Math.max(0,Math.min(frames.length-1,Number(location.hash.match(/slide-(\d+)/)?.[1]||1)-1));setPresentation(!narrow());

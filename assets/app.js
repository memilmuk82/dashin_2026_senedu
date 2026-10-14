(() => {
'use strict';
const page=document.body.dataset.page;
const {prompts,notice,sources}=window.DAESHIN_COMMON, images=window.DAESHIN_IMAGES;
const slides=page==='slides'?window.DAESHIN_PRESENTATION.slides:(window.DAESHIN_GUIDE?.sections||[]);
const routes=window.DAESHIN_LINKS;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`;
const list=arr=>`<ul>${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const table=rows=>`<div class="table-wrap"><table><thead><tr>${rows[0].map(x=>`<th scope="col">${esc(x)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(row=>`<tr>${row.map(x=>`<td>${esc(x)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const diagram=arr=>`<div class="diagram"><small>개념도</small><ol>${arr.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></div>`;
const noticeHtml=()=>`<div class="notice"><pre>${esc(notice)}</pre></div>`;
const metadata=im=>`${im.kind} · ${im.service} · ${im.date} · ${im.account} · ${im.version}`;
const figure=(key,compact=false)=>{const im=images[key]; return `<figure class="capture${compact?' compact':''}"><button class="image-button" data-image="${esc(key)}" aria-label="${esc(im.caption)} 크게 보기"><img src="${esc(im.src)}" alt="${esc(im.caption)}" ${compact?'':'loading="lazy"'}><span class="enlarge-label">화면 크게 보기 ＋</span></button><figcaption>${esc(im.caption)}<small>${esc(metadata(im))}${im.sourcePage?` · <a href="${esc(im.sourcePage)}" target="_blank" rel="noopener">공식 원문</a>`:''}</small></figcaption></figure>`;};
const promptHtml=(key,n,short=false)=>{const label=key==='agent'?'에이전트 지시문':key==='schoolCode'?'대신고 가입 인증코드':'실습 문구';const button=key==='agent'?'지시문':key==='schoolCode'?'인증코드':'문구';return `<div class="prompt-box${short?' short':''}${key==='schoolCode'?' school-code':''}"><div class="prompt-head"><strong>${label}</strong><button data-copy="${esc(key)}" data-target="prompt-${n}" aria-label="${button} 복사">${button} 복사</button></div><textarea id="prompt-${n}" readonly aria-label="${label}" rows="${key==='schoolCode'?1:key==='agent'?(short?4:10):3}">${esc(prompts[key])}</textarea><pre class="print-prompt">${esc(prompts[key])}</pre><span class="copy-hint">복사가 막히면 문구를 선택해 Ctrl + C를 누르세요.</span></div>`;};
const guideBody=(s,token)=>`${s.contextImage?figure(s.contextImage):''}${s.image?figure(s.image):''}${s.detailImage?figure(s.detailImage):''}${s.notice?noticeHtml():''}${s.table?table(s.table):''}${s.diagram?diagram(s.diagram):''}<h3>따라 하기</h3><ol class="steps">${s.steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>${s.prompt?promptHtml(s.prompt,token):''}<div class="check-line"><strong>완료 확인</strong><p>${esc(s.check)}</p></div>${s.tip||fallbacks[s.section]?`<div class="help-line"><strong>함께 확인</strong><p>${esc(s.tip||fallbacks[s.section])}</p></div>`:''}${s.link?`<p class="source-link">${link(s.link)}</p>`:''}${s.source?`<p class="source-link">${link(sources[s.source])}</p>`:''}${s.extraGuide?.map((extra,j)=>`<div class="related-guide"><h3>${esc(extra.title)}</h3><p>${esc(extra.lead)}</p>${guideBody(extra,`extra-${token}-${j}`)}</div>`).join('')||''}`;
let toastTimer;
function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('visible'),4000);}
const fallbacks={
'Windows':'메뉴가 다르면 Windows 설정 검색이나 공식 도움말에서 기능 이름을 찾습니다. 지원되지 않는 OCR·Click to Do는 수동 입력과 캡처로 진행합니다.',
'senedu':'접속이 막히면 로그인 방식과 계정을 먼저 확인합니다. 인증은 본인이 진행하고, 서비스 화면과 오류 내용만 강사에게 알려 주세요.',
'Gemini 교육용':'학교 계정에서 메뉴가 없으면 관리자 활성화·연령·라이선스를 확인합니다. 권한을 임의로 바꾸지 않고 시연과 교안으로 흐름을 살펴봅니다.',
'Microsoft 계정 생성':'학교 선택과 기존 계정 여부부터 확인합니다. 가입·본인 인증·암호 입력은 본인이 진행합니다.',
'Office 365':'앱 설치 메뉴가 없으면 로그인 계정·실제 배정 A3 제품·관리자의 설치 허용을 확인합니다.',
'Copilot':'학교 계정·Copilot 허용 설정·실제 배정 라이선스를 확인합니다. 화면의 메뉴와 한도는 계정에 따라 달라질 수 있습니다.',
'SenGPT · 나만의 에이전트':'버튼이 다르면 같은 기능 이름을 찾습니다. 모델이나 사용량이 부족하면 반복 실행을 멈추고 강사 시연을 봅니다.',
'SenGPT 확인·수정':'원하는 답이 없으면 빠진 조건을 구체적으로 다시 적습니다. 확정하지 않은 사실은 [확인 필요]로 유지합니다.',
'SenGPT · 예약':'예약이 없거나 설정이 다르면 계정·에이전트·시각부터 확인합니다. 실행 여부는 실행 이력에서 읽습니다.',
'NAVER WORKS':'상대가 보이지 않으면 학교 계정과 조직을 확인합니다. 수신자를 정확히 찾기 전에는 보내지 않습니다.',
'Google Drive':'파일이 없으면 업로드 완료와 현재 폴더를 확인합니다. 열리지 않으면 수신자 계정·공유 대상·권한을 확인합니다.',
'WORKS Drive':'공유 항목이 다르면 학교 정책과 권한을 확인합니다. 필요한 공유 방식이 없을 때 공개 범위를 넓혀 해결하지 않습니다.'
};
function addCommon(){
 document.addEventListener('click',async e=>{
  const imageButton=e.target.closest('[data-image]');
  if(imageButton){const im=images[imageButton.dataset.image],d=document.getElementById('image-view'); document.getElementById('zoom-image').src=im.src;document.getElementById('zoom-image').alt=im.caption;document.getElementById('image-title').textContent=im.caption;document.getElementById('image-caption').textContent=metadata(im);d.showModal();return;}
  const close=e.target.closest('.close-dialog');if(close){close.closest('dialog').close();return;}
  const copy=e.target.closest('[data-copy]');if(copy){
   const text=prompts[copy.dataset.copy];
   try{if(!navigator.clipboard?.writeText)throw new Error('No clipboard');await navigator.clipboard.writeText(text);toast('복사했습니다. 원하는 입력칸에 붙여 넣으세요.');}
   catch{const area=document.getElementById(copy.dataset.target);area.focus();area.select();toast('문구를 선택했습니다. Ctrl + C를 눌러 복사하세요.');}
  }
 });
 document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
}
if(page==='slides'){
 let i=0;
 const stage=document.getElementById('main'),overview=document.getElementById('overview');
 function visual(s){if(s.image)return figure(s.image,true);if(s.notice)return noticeHtml();if(s.table)return table(s.table);if(s.diagram)return diagram(s.diagram);if(s.prompt)return promptHtml(s.prompt,s.n,true);return `<div class="word-visual"><span>${esc(s.section)}</span><strong>${esc(s.bullets[0])}</strong></div>`;}
 function render(){
  const s=slides[i];stage.className=`slide-stage ${s.layout||''} ${s.image?'has-image':''} ${s.image&&['agent-form','schedule-form','schedule-edit','drive-new','works-new','sen-login','sengpt-schedule-form'].includes(s.image)?'portrait':''}`;
  if(s.layout==='cover')stage.innerHTML=`<article class="cover-article"><div class="eyebrow">교사를 위한 디지털 도구 실습</div><h1>${esc(s.title)}</h1><p class="cover-lead">${esc(s.lead)}</p>${list(s.bullets)}<div class="cover-mark" aria-hidden="true">SEN<span>학교의 일상을 돕는 도구</span></div></article>`;
  else if(s.layout==='divider')stage.innerHTML=`<article class="divider-article"><div class="eyebrow">${esc(s.section)}</div><h1>${esc(s.title)}</h1><p>${esc(s.lead)}</p>${list(s.bullets)}${s.diagram?diagram(s.diagram):''}</article>`;
  else stage.innerHTML=`<article class="slide-article"><div class="slide-heading"><div class="eyebrow">${esc(s.section)}</div><h1>${esc(s.title)}</h1><p class="slide-lead">${esc(s.lead)}</p></div><div class="slide-body"><div class="slide-text">${list(s.bullets)}<p class="slide-check"><span>확인</span>${esc(s.check)}</p>${s.prompt&&s.image?`<a class="prompt-jump" href="guide.html#${s.primaryGuide}">${s.prompt==='schoolCode'?'인증코드':'실습 문구'}는 이 쪽 교안에서 복사 ↗</a>`:''}</div><div class="slide-visual">${visual(s)}</div></div></article>`;
  document.getElementById('counter').textContent=`${i+1} / ${slides.length}`;
  document.getElementById('progress-fill').style.width=`${(i+1)/slides.length*100}%`;
  document.getElementById('guide-link').href=`guide.html#${s.primaryGuide}`;
  document.getElementById('prev').disabled=i===0;document.getElementById('next').disabled=i===slides.length-1;
  document.title=`${i+1} · ${s.title} · 대신고 연수`;
 }
 function hashRead(){const match=location.hash.match(/^#p(\d+)$/);i=match?Math.min(slides.length-1,Math.max(0,Number(match[1])-1)):0;render();}
 function go(n){n=Math.min(slides.length-1,Math.max(0,n));if(n===i)return;location.hash=slides[n].id;}
 document.getElementById('prev').onclick=()=>go(i-1);document.getElementById('next').onclick=()=>go(i+1);
 let section='';document.getElementById('overview-list').innerHTML=slides.map(s=>{const h=s.section!==section?`<h3>${esc(s.section)}</h3>`:'';section=s.section;return `${h}<button data-slide="${s.n}"><span>${String(s.n).padStart(2,'0')}</span>${esc(s.title)}</button>`;}).join('');
 document.getElementById('overview-btn').onclick=()=>overview.showModal();overview.addEventListener('click',e=>{const b=e.target.closest('[data-slide]');if(b){overview.close();go(Number(b.dataset.slide)-1);}});
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('브라우저 메뉴의 전체 화면 기능을 사용해 주세요.');}}
 document.getElementById('fullscreen-btn').onclick=fullscreen;document.addEventListener('fullscreenchange',()=>document.getElementById('fullscreen-btn').textContent=document.fullscreenElement?'전체 화면 해제':'전체 화면');
 document.addEventListener('keydown',e=>{
  if(document.querySelector('dialog[open]')||e.ctrlKey||e.metaKey||e.altKey||e.target.matches('textarea,input,select')||e.target.isContentEditable)return;
  if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();go(i+1);}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(i-1);}else if(e.key==='Home'){e.preventDefault();go(0);}else if(e.key==='End'){e.preventDefault();go(slides.length-1);}else if(e.key.toLowerCase()==='f'){e.preventDefault();fullscreen();}
 });
 window.addEventListener('hashchange',hashRead);hashRead();addCommon();
}
if(page==='guide'){
 const byId=new Map(slides.map(s=>[s.id,s]));
 const searchText=new Map(slides.map(s=>[s.id,[s.section,s.title,s.lead,...s.bullets,...s.steps,s.check,s.tip||'',s.prompt?prompts[s.prompt]:''].join(' ').normalize('NFKC').toLocaleLowerCase('ko-KR')]));
 let section='';
 document.getElementById('toc-list').innerHTML=slides.map(s=>{
  const h=s.section!==section?'<h3 data-toc-group="'+esc(s.section)+'">'+esc(s.section)+'</h3>':'';section=s.section;
  return h+'<a href="#'+s.id+'" data-guide-id="'+s.id+'"><span>'+String(s.n).padStart(2,'0')+'</span>'+esc(s.title)+'</a>';
 }).join('');
 const jump=document.getElementById('jump');
 jump.innerHTML='<option value="">항목 선택</option>'+slides.map(s=>'<option value="'+s.id+'">'+s.n+'. '+esc(s.title)+'</option>').join('');
 jump.onchange=()=>{if(jump.value)location.hash=jump.value;};
 section='';
 document.getElementById('guide-content').innerHTML=slides.map(s=>{
  const heading=s.section!==section?'<h2 class="guide-group-title" data-content-group="'+esc(s.section)+'">'+esc(s.section)+'</h2>':'';section=s.section;
  const related=routes.guideToPresentation[s.id];
  const number=Number(related.slice(1));
  return heading+'<details class="guide-section" id="'+s.id+'"><summary><span class="guide-number">'+String(s.n).padStart(2,'0')+'</span><h2>'+esc(s.title)+'</h2></summary><div class="guide-detail"><div class="guide-section-head"><span>'+esc(s.section)+'</span><a href="slides.html#'+related+'">관련 발표 '+number+' ↗</a></div><p class="guide-lead">'+esc(s.lead)+'</p>'+guideBody(s,'detail-'+s.n)+'</div></details>';
 }).join('');
 const entries=Array.from(document.querySelectorAll('details.guide-section'));
 const entryById=new Map(entries.map(e=>[e.id,e]));
 const navLinks=Array.from(document.querySelectorAll('[data-guide-id]'));
 const input=document.getElementById('guide-search');
 function filterGuide(){
  const query=input.value.trim().normalize('NFKC').toLocaleLowerCase('ko-KR');
  let visible=0;const groups=new Set();
  entries.forEach(e=>{e.hidden=!!query&&!searchText.get(e.id).includes(query);if(!e.hidden){visible++;groups.add(byId.get(e.id).section);}});
  navLinks.forEach(a=>a.hidden=entryById.get(a.dataset.guideId).hidden);
  document.querySelectorAll('[data-toc-group]').forEach(h=>h.hidden=!groups.has(h.dataset.tocGroup));
  document.querySelectorAll('[data-content-group]').forEach(h=>h.hidden=!groups.has(h.dataset.contentGroup));
  document.getElementById('guide-result').textContent=query?visible+'개 항목을 찾았습니다.':slides.length+'개 항목 · 필요한 항목을 펼쳐 보세요.';
 }
 function revealGuide(){
  const id=location.hash.slice(1),entry=entryById.get(id);if(!entry)return;
  if(entry.hidden){input.value='';filterGuide();}
  entry.open=true;jump.value=id;
  navLinks.forEach(a=>a.classList.toggle('active',a.dataset.guideId===id));
  requestAnimationFrame(()=>entry.scrollIntoView({block:'start'}));
 }
 input.addEventListener('input',filterGuide);
 document.getElementById('guide-expand').onclick=()=>entries.filter(e=>!e.hidden).forEach(e=>e.open=true);
 document.getElementById('guide-collapse').onclick=()=>entries.forEach(e=>e.open=false);
 let printState=null;
 function preparePrint(){if(printState)return;printState=entries.map(e=>({entry:e,open:e.open,hidden:e.hidden}));entries.forEach(e=>{e.open=true;e.hidden=false;});}
 function restorePrint(){if(!printState)return;printState.forEach(s=>{s.entry.open=s.open;s.entry.hidden=s.hidden;});printState=null;}
 window.addEventListener('beforeprint',preparePrint);window.addEventListener('afterprint',restorePrint);
 document.getElementById('print-btn').onclick=()=>{preparePrint();window.print();};
 window.addEventListener('hashchange',revealGuide);
 filterGuide();revealGuide();addCommon();
}
if(page==='resources'){
 const google=['plus','editions','notebook','classroom','classnotebook'];
 document.getElementById('google-links').innerHTML=`<ul>${google.map(k=>`<li>${link(sources[k])}</li>`).join('')}</ul>`;
 const microsoft=['msjoin','msapps','msinstall','msactivate','mslicense','copilot','copilotwork','study'];
 document.getElementById('microsoft-links').innerHTML=`<ul>${microsoft.map(k=>`<li>${link(sources[k])}</li>`).join('')}</ul>`;
 document.getElementById('other-links').innerHTML=`<ul>${Object.entries(sources).filter(([k])=>!google.includes(k)&&!microsoft.includes(k)).map(([,s])=>`<li>${link(s)}</li>`).join('')}</ul>`;
 document.getElementById('capture-list').innerHTML=`<div class="table-wrap"><table><thead><tr><th>화면</th><th>서비스·시점</th><th>조건</th></tr></thead><tbody>${Object.values(images).map(im=>`<tr><td><a href="${esc(im.src)}" target="_blank" rel="noopener">${esc(im.caption)}</a></td><td>${esc(im.service)}<br>${esc(im.date)}</td><td>${esc(im.kind)}<br>${esc(im.account)} · ${esc(im.version)}</td></tr>`).join('')}</tbody></table></div>`;
}
})();

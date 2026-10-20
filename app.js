'use strict';
(() => {
 const issues=window.ISSUES, config=window.SIRAJ_CONFIG||{};
 const $=id=>document.getElementById(id), arabic=n=>Number(n).toLocaleString('ar-OM');
 const dialog=$('reader'); let current=null, zoom=1, returnFocus=null;
 const storage={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v);return true}catch{return false}}};
 function normalize(s){return String(s).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c)).replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).normalize('NFD').replace(/[\u064B-\u065F\u0670]/g,'').replace(/[أإآ]/g,'ا').trim().toLowerCase()}
 function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
 function render(){const q=normalize($('search').value);let list=issues.filter(i=>normalize(i.title+' '+i.id).includes(q));if($('sort').value==='desc')list.reverse();$('grid').replaceChildren();for(const issue of list){const a=node('a','card');a.href='#issue='+issue.id;a.setAttribute('aria-label',`قراءة العدد ${issue.id}: ${issue.title}`);const cover=node('div','cover'),img=node('img');img.src=issue.thumb;img.alt=`غلاف العدد ${issue.id}`;img.loading='lazy';img.decoding='async';cover.append(img);const info=node('div','card-info');info.append(node('small','',`العدد ${arabic(issue.id)}`),node('h3','',issue.title));const bottom=node('div','card-bottom');bottom.append(node('span','','صحيفة سراج عُمان'),node('b','','اقرأ العدد ←'));info.append(bottom);a.append(cover,info);$('grid').append(a)}$('results').textContent=`${arabic(list.length)} عددًا`;$('empty').hidden=!!list.length}
 function path(){return location.pathname+(current?'?issue='+current.id:'')}
 function track(){if(typeof window.goatcounter?.count==='function')window.goatcounter.count({path:path(),title:current?`العدد ${current.id}: ${current.title}`:'صحيفة سراج عُمان'})}
 function selected(){const saved=storage.get('siraj:reaction:'+current.id);document.querySelectorAll('[data-reaction]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.reaction===saved)))}
 function setZoom(v){zoom=Math.min(3,Math.max(.5,v));$('page').style.width=(zoom*100)+'%';$('page').style.maxWidth=zoom===1?'1000px':'none'}
 function route(){const match=location.hash.match(/^#issue=(\d+)$/);const issue=match&&issues.find(i=>i.id===Number(match[1]));if(!issue){if(dialog.open)dialog.close();document.title='صحيفة سراج عُمان';return}if(!dialog.open){returnFocus=document.activeElement;dialog.showModal();document.body.classList.add('reading')}
 current=issue;$('reader-number').textContent=`العدد ${arabic(issue.id)}`;$('reader-title').textContent=issue.title;document.title=`العدد ${issue.id} | صحيفة سراج عُمان`;$('image-error').hidden=true;$('page').hidden=false;$('page').src=issue.image;$('page').alt=`صحيفة سراج عُمان، العدد ${issue.id}: ${issue.title}، الصفحة الأصلية كاملة`;$('original').href=issue.image;$('previous').disabled=issues.indexOf(issue)===0;$('next').disabled=issues.indexOf(issue)===issues.length-1;$('notice').textContent='';setZoom(1);$('viewport').scrollTop=0;$('viewport').scrollLeft=0;selected();track();}
 function closeReader(){history.replaceState(null,'',location.pathname+location.search+'#archive');dialog.close();}
 $('close').onclick=closeReader;dialog.addEventListener('cancel',e=>{e.preventDefault();closeReader()});dialog.addEventListener('close',()=>{document.body.classList.remove('reading');current=null;if(returnFocus?.isConnected)returnFocus.focus();document.title='صحيفة سراج عُمان'});
 $('previous').onclick=()=>{const i=issues.indexOf(current);if(i>0)location.hash='issue='+issues[i-1].id};$('next').onclick=()=>{const i=issues.indexOf(current);if(i<issues.length-1)location.hash='issue='+issues[i+1].id};
 $('zoom-in').onclick=()=>setZoom(zoom+.25);$('zoom-out').onclick=()=>setZoom(zoom-.25);$('fit').onclick=()=>setZoom(1);$('page').onerror=()=>{$('page').hidden=true;$('image-error').hidden=false};
 $('share').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('notice').textContent='تم نسخ رابط العدد.'}catch{$('notice').textContent='انسخ رابط العدد من شريط العنوان في المتصفح.'}};
 document.querySelectorAll('[data-reaction]').forEach(b=>b.addEventListener('click',()=>{if(!current)return;const ok=storage.set('siraj:reaction:'+current.id,b.dataset.reaction);selected();$('notice').textContent=ok?'تم حفظ اختيارك على هذا الجهاز فقط.':'تعذّر الحفظ لأن المتصفح لا يتيح التخزين المحلي.'}));
 $('search').addEventListener('input',render);$('sort').addEventListener('change',render);window.addEventListener('hashchange',route);$('issue-count').textContent=arabic(issues.length);render();route();
 // Optional external feedback: never enabled without an owner-supplied HTTPS URL.
 try{const url=new URL(config.feedbackUrl);if(url.protocol==='https:'){$('feedback-link').href=url.href;$('feedback-link').hidden=false;$('reaction-note').textContent='الأزرار تحفظ اختيارك على هذا الجهاز. لإيصاله إلى الإدارة استخدم رابط إرسال الانطباع.'}}catch{}
 // Optional anonymous analytics. No passwords or private API keys belong in frontend code.
 if(/^[a-z0-9][a-z0-9-]*$/i.test(config.goatcounterCode||'')){
  $('counter-status').textContent='جارٍ الاتصال بخدمة الإحصاءات…';
  window.goatcounter={no_onload:true};const script=document.createElement('script');script.dataset.goatcounter=`https://${config.goatcounterCode}.goatcounter.com/count`;script.src='https://gc.zgo.at/count.js';script.async=true;
  script.onload=()=>{track();if(config.publicCounter&&window.goatcounter.visit_count){$('counter-status').textContent='الإحصاءات مقدمة من GoatCounter';window.goatcounter.visit_count({append:'#total-count',path:'TOTAL',type:'html',attr:{title:'عدد مشاهدات صفحات الصحيفة'}})}else{$('counter-status').textContent='العرض العام للإحصاءات غير مفعّل'}};
  script.onerror=()=>{$('counter-status').textContent='تعذّر الاتصال بخدمة الإحصاءات'};document.head.append(script);$('privacy').textContent='تُستخدم خدمة GoatCounter لإحصاءات التصفح عند توفرها، دون طلب الاسم. اختيارات الأزرار محلية؛ إرسال الانطباع عبر النموذج الخارجي اختياري.';
 }
})();

'use strict';
const descriptions = [
 ['Лайна, знакомьтесь!','Пятнышко, в которое невозможно не влюбиться.','laina','У стула','Лайна с тёмным пятнышком на мордочке стоит у стула'],
 ['Очарование с пятнышком','Ещё один кадр нашей Лайны.','laina','Лайна','Лайна с белой грудкой и тёмными пятнышками на мордочке'],
 ['Лапки кверху','Всё под контролем. Даже лёжа.','yuki','Потягушки','Юки лежит на спине на ковре, подняв лапки'],
 ['Ну погладь животик','Когда доверие выглядит вот так.','yuki','Нежность','Юки смотрит в камеру, лёжа на спине'],
 ['На ручках спокойнее','Большой мир и маленькие лапки.','yuki','Приключения','Юки на руках у человека на улице'],
 ['Мой лучший ракурс','Носик готов к крупному плану.','yuki','Крупный план','Мордочка Юки крупным планом рядом с человеком'],
 ['А что это у тебя?','Любопытство не помещается в кадр.','yuki','Любопытство','Большие любопытные глаза Юки вблизи'],
 ['Маленький хозяин дивана','Это место уже занято. Мной.','yuki','Портрет','Юки сидит на мягком диване и смотрит в камеру'],
 ['В обнимку с облаком','Одеяло — мой личный остров.','yuki','Тихий час','Юки уютно лежит среди складок светлого одеяла'],
 ['Маленькие сокровища','Крохотная деталь из большого альбома.','detail','Детали','Два маленьких зубика на бежевой ткани'],
 ['Сладкие сны','Мир подождёт до следующего мур.','yuki','Тихий час','Юки свернулся клубочком на узорчатом одеяле'],
 ['Не беспокоить. Я облачко.','Все важные дела уже приснились.','yuki','Режим: растаял','Юки спит на спине на кровати, вытянув лапы'],
 ['Поговорим о вкусняшках?','У меня есть серьёзное предложение.','yuki','Портрет','Юки с большими глазами уютно сидит у подушки дивана'],
 ['Домашнее величество','Диван принят. Можно оставлять.','yuki','На посту','Юки сидит на спинке кресла возле узорчатых обоев'],
 ['Потя-я-ягушки','Сегодня я немного длиннее обычного.','yuki','Котойога','Юки вытянулся во всю длину на полу рядом с ковром'],
 ['Пузико в эфире','Самый мягкий сюжет этого дня.','yuki','Нежность','Юки лежит на спине на ковре, показывая белое пузико'],
 ['Особенная доставка','Кажется, в пакете поселилась милота.','yuki','Приключения','Юки выглядывает из розового бумажного пакета'],
 ['Ку-ку. Это я.','Секретный наблюдательный пункт.','yuki','Прятки','Юки выглядывает из-за светлого одеяла на кровати'],
 ['Меня здесь совсем нет','Маскировка почти идеальная.','yuki','Прятки','Из-за одеяла видны только ушки и глаза Юки'],
 ['Уют размером с кота','Ещё пять минуточек под одеялом.','yuki','Любимый плед','Юки с большими глазами выглядывает из серого одеяла']
];
const photos=descriptions.map(([title,caption,cat,tag,alt],i)=>({id:i+1,title,caption,cat,tag,alt,src:`assets/cat-${String(i+1).padStart(2,'0')}.jpg`}));
const $=s=>document.querySelector(s);
const gallery=$('#gallery');
const dialog=$('#lightbox');
let favorites=new Set();
let storageAvailable=true;
try{const saved=JSON.parse(localStorage.getItem('yuki-laina-favorites')||'[]');if(Array.isArray(saved))favorites=new Set(saved.filter(id=>Number.isInteger(id)&&id>0&&id<=photos.length));}catch{storageAvailable=false;}
let currentFilter='all',expanded=false,viewerPhotos=photos,viewerIndex=0,slideshowTimer=null,toastTimer,lastFocus=null,touchStart=null,savedScrollY=0;
const galleryOrder=[20,2,8,3,11,7,14,12,1,4,5,6,9,10,13,15,16,17,18,19].map(id=>photos[id-1]);
function filteredPhotos(){return galleryOrder.filter(p=>currentFilter==='all'||(currentFilter==='favorites'?favorites.has(p.id):p.cat===currentFilter));}
function catLabel(cat){return cat==='laina'?'Лайна':cat==='yuki'?'Юки':'Из нашего альбома';}
function heart(){return '<svg aria-hidden="true"><use href="#heart"/></svg>';}
function showToast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2300);}
function renderGallery(){
 const list=filteredPhotos(),visible=expanded?list:list.slice(0,8);
 gallery.innerHTML=visible.length?visible.map(p=>`<article class="photo-card"><button class="photo-open" data-gallery-open="${p.id}" aria-label="Открыть: ${p.title}"><div class="photo-image-wrap"><img src="${p.src}" alt="${p.alt}" loading="lazy" width="300" height="300"><span class="photo-overlay">${p.tag}</span></div><div class="photo-card-caption"><strong>${p.title}</strong><span>${catLabel(p.cat)}</span></div></button><button class="photo-like ${favorites.has(p.id)?'is-favorite':''}" data-like="${p.id}" aria-label="${favorites.has(p.id)?'Убрать из любимых':'В любимые'}: ${p.title}" aria-pressed="${favorites.has(p.id)}">${heart()}</button></article>`).join(''):`<div class="empty-state">${heart()}<strong>Здесь будут любимые кадры</strong><p>Нажмите на сердечко у фотографии — и она поселится здесь.</p><button class="button secondary" data-reset-filter>Посмотреть все фото</button></div>`;
 $('#show-more').hidden=expanded||list.length<=8;
 $('#gallery-status').textContent=list.length?`Показано ${visible.length} из ${list.length} фото`:'';
 $('#favorite-count').textContent=favorites.size;
 document.querySelectorAll('[data-filter]').forEach(button=>{const active=button.dataset.filter===currentFilter;button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
}
function selectFilter(filter){currentFilter=filter;expanded=false;renderGallery();}
function toggleFavorite(id){
 const added=!favorites.has(id);if(added)favorites.add(id);else favorites.delete(id);
 try{localStorage.setItem('yuki-laina-favorites',JSON.stringify([...favorites]));}catch{storageAvailable=false;}
 renderGallery();if(dialog.open)updateViewerFavorite();
 showToast(`${added?'Кадр в любимых ♡':'Кадр убран из любимых'}${storageAvailable?'':' · на время просмотра'}`);
}
function updateViewerFavorite(){const liked=favorites.has(viewerPhotos[viewerIndex].id),button=$('#viewer-favorite');button.classList.toggle('is-favorite',liked);button.setAttribute('aria-pressed',String(liked));button.querySelector('span').textContent=liked?'В любимых':'В любимые';}
function updateViewer(){const p=viewerPhotos[viewerIndex];$('#viewer-image').src=p.src;$('#viewer-image').alt=p.alt;$('#viewer-title').textContent=p.title;$('#viewer-cat').textContent=catLabel(p.cat);$('#viewer-counter').textContent=`${viewerIndex+1} / ${viewerPhotos.length}`;$('#previous-photo').disabled=$('#next-photo').disabled=viewerPhotos.length<2;updateViewerFavorite();document.querySelectorAll('.viewer-thumb').forEach((button,i)=>{button.classList.toggle('current',i===viewerIndex);button.setAttribute('aria-current',i===viewerIndex?'true':'false');});const thumb=$('#viewer-thumbs .current');if(thumb)$('#viewer-thumbs').scrollTo({left:thumb.offsetLeft-$('#viewer-thumbs').offsetLeft-$('#viewer-thumbs').clientWidth/2+thumb.clientWidth/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
function openViewer(id,list=photos){lastFocus=document.activeElement;viewerPhotos=[...list];viewerIndex=Math.max(0,viewerPhotos.findIndex(p=>p.id===id));$('#viewer-thumbs').innerHTML=viewerPhotos.map((p,i)=>`<button class="viewer-thumb" data-thumb="${i}" aria-label="Фото ${i+1}: ${p.title}"><img src="${p.src}" alt="" loading="lazy"></button>`).join('');savedScrollY=window.scrollY;document.body.style.top=`-${savedScrollY}px`;document.body.classList.add('viewer-open');dialog.showModal();updateViewer();$('#close-viewer').focus({preventScroll:true});}
function navigate(step){viewerIndex=(viewerIndex+step+viewerPhotos.length)%viewerPhotos.length;updateViewer();}
function stopSlideshow(){clearInterval(slideshowTimer);slideshowTimer=null;$('#slideshow').textContent='▷ Слайд-шоу';$('#slideshow').setAttribute('aria-pressed','false');}
function closeViewer(){stopSlideshow();dialog.close();document.body.classList.remove('viewer-open');document.body.style.top='';const previousScrollBehavior=document.documentElement.style.scrollBehavior;document.documentElement.style.scrollBehavior='auto';window.scrollTo(0,savedScrollY);document.documentElement.style.scrollBehavior=previousScrollBehavior;if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});else $(`[data-filter="${currentFilter}"]`)?.focus({preventScroll:true});}
document.addEventListener('click',event=>{
 const open=event.target.closest('[data-open]');if(open){openViewer(Number(open.dataset.open));return;}
 const galleryOpen=event.target.closest('[data-gallery-open]');if(galleryOpen){openViewer(Number(galleryOpen.dataset.galleryOpen),filteredPhotos());return;}
 const like=event.target.closest('[data-like]');if(like){toggleFavorite(Number(like.dataset.like));if(!dialog.open)gallery.querySelector(`[data-like="${like.dataset.like}"]`)?.focus({preventScroll:true});return;}
 const filter=event.target.closest('[data-filter]');if(filter){selectFilter(filter.dataset.filter);return;}
 const thumb=event.target.closest('[data-thumb]');if(thumb){viewerIndex=Number(thumb.dataset.thumb);updateViewer();return;}
 if(event.target.closest('[data-reset-filter]'))selectFilter('all');
});
$('#show-more').addEventListener('click',()=>{expanded=true;renderGallery();gallery.children[8]?.querySelector('button')?.focus({preventScroll:true});});
$('#favorites-shortcut').addEventListener('click',()=>{selectFilter('favorites');$('#album').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
$('#random-moment').addEventListener('click',()=>{const cats=photos.filter(p=>p.cat!=='detail');openViewer(cats[Math.floor(Math.random()*cats.length)].id);});
$('#close-viewer').addEventListener('click',closeViewer);
$('#previous-photo').addEventListener('click',()=>navigate(-1));$('#next-photo').addEventListener('click',()=>navigate(1));
$('#viewer-favorite').addEventListener('click',()=>toggleFavorite(viewerPhotos[viewerIndex].id));
$('#slideshow').addEventListener('click',()=>{if(slideshowTimer){stopSlideshow();return;}slideshowTimer=setInterval(()=>navigate(1),3500);$('#slideshow').textContent='Ⅱ Пауза';$('#slideshow').setAttribute('aria-pressed','true');});
dialog.addEventListener('cancel',event=>{event.preventDefault();closeViewer();});
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeViewer();}});
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();navigate(-1);}if(event.key==='ArrowRight'){event.preventDefault();navigate(1);}});
$('#viewer-image').draggable=false;
$('#viewer-stage').addEventListener('touchstart',event=>{touchStart=event.touches.length===1&&!event.target.closest('button')?{x:event.touches[0].clientX,y:event.touches[0].clientY}:null;},{passive:true});
$('#viewer-stage').addEventListener('touchend',event=>{if(!touchStart)return;const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.3)navigate(dx<0?1:-1);touchStart=null;},{passive:true});
$('#viewer-stage').addEventListener('touchcancel',()=>{touchStart=null;},{passive:true});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSlideshow();});
renderGallery();

(() => {
  'use strict';
  /* Защита от повторной инициализации: если скрипт по какой-то причине
     исполнен дважды (дубль тега, кэш), второй запуск вернётся сразу —
     иначе два конкурирующих таймера дублируют переключение сцен. */
  if (window.__cyberHeroInit) return;
  window.__cyberHeroInit = true;
  const scenes = [
    {title:['CYBER','SCUM'],name:'Cyber Scum',label:'АНИМАЦИОННОЕ КИНО',kicker:'ПОСТАПОКАЛИПСИС, КОТОРОГО ВЫ ЖДАЛИ',description:'Raven переносит сознание между телами, противостоит тирании корпораций и ищет способ вернуть миру человечность.',src:'assets/cyber-01.mp4',poster:'assets/cyber-01.jpg'},
    {title:['За пределами','тела.'],name:'Перенос сознания',label:'RAVEN / ПЕРЕНОС СОЗНАНИЯ',kicker:'ОДНО СОЗНАНИЕ. РАЗНЫЕ ОБОЛОЧКИ.',description:'Микропроцессорный чип позволяет Raven переходить из одного тела в другое и скрывать свою личность. Реальность и виртуальный мир становятся неразделимы.',src:'assets/cyber-02.mp4',poster:'assets/cyber-02.jpg'},
    {title:['Мир','корпораций.'],name:'Мир корпораций',label:'CYBER SCUM / МИР ФИЛЬМА',kicker:'ВЛАСТЬ, У КОТОРОЙ ЕСТЬ КУКЛОВОД',description:'Корпорации управляют марионеточным президентом. Raven бросает вызов системе, которая превращает людей в послушные механизмы.',src:'assets/cyber-03.mp4',poster:'assets/cyber-03.jpg'},
    {title:['Остаться','человеком.'],name:'Остаться человеком',label:'CYBER SCUM / ЧЕЛОВЕЧНОСТЬ',kicker:'ТЕХНОЛОГИИ МЕНЯЮТ ТЕЛО. А ЧЕЛОВЕКА?',description:'История о том, как легко стать рабом технологий. И о том, что для преодоления любых преград нужно вернуть свою человечность.',src:null,poster:'assets/cyber-04.png',modalSrc:'assets/cyber-01.mp4'}
  ];
  const $ = id => document.getElementById(id);
  const hero=$('hero'),media=scenes.map((_,i)=>$('media-'+i)),choices=[...document.querySelectorAll('.scene-choice')],dialog=$('film-dialog');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)'),requestedReduced=new URLSearchParams(location.search).get('motion')==='reduce';
  const isReduced=()=>reduce.matches||requestedReduced;
  document.documentElement.classList.toggle('reduced-motion',isReduced());
  const duration=5000,circumference=2*Math.PI*21;
  let current=0,elapsed=0,lastTime=performance.now(),paused=isReduced(),transitioning=false,queued=null,typingTimer=0,switchTimer=0,finishTimer=0,opener=null;
  const activePaused=()=>paused||dialog.open||document.hidden||isReduced();
  const isVideo=m=>m instanceof HTMLVideoElement;

  function syncPlayback(){
    const stopped=activePaused();
    hero.classList.toggle('motion-paused',stopped);
    media.forEach((m,i)=>{if(!isVideo(m))return;m.muted=true;if(i!==current||stopped)m.pause();else m.play().catch(()=>{});});
    $('pause-button').disabled=isReduced();
    $('pause-button').setAttribute('aria-pressed',String(paused));
    $('pause-button').setAttribute('aria-label',isReduced()?'Анимация отключена':stopped?'Продолжить воспроизведение':'Приостановить воспроизведение');
    $('pause-icon').textContent=stopped?'▷':'Ⅱ';
  }
  function typeDescription(text){
    clearInterval(typingTimer);const el=$('description');el.classList.remove('typing-caret');el.setAttribute('aria-label',text);
    if(isReduced()){el.textContent=text;return;}
    el.textContent='';el.classList.add('typing-caret');let count=0;
    typingTimer=setInterval(()=>{count=Math.min(text.length,count+3);el.textContent=text.slice(0,count);if(count>=text.length){clearInterval(typingTimer);el.classList.remove('typing-caret');}},22);
  }
  function render(index,announce){
    const s=scenes[index];hero.dataset.scene=String(index);
    $('headline').replaceChildren(document.createTextNode(s.title[0]),document.createElement('br'));
    const last=document.createElement('span');last.textContent=s.title[1];$('headline').append(last);
    $('scene-label').textContent=String(index+1).padStart(2,'0')+' / '+s.label;
    $('panel-kicker').textContent=s.kicker;typeDescription(s.description);
    choices.forEach((button,i)=>{button.classList.toggle('selected',i===index);if(i===index)button.setAttribute('aria-current','true');else button.removeAttribute('aria-current');});
    hero.querySelector('.backdrop').style.backgroundImage=`url("${s.poster}")`;
    if(announce)$('scene-announcement').textContent='Кадр '+(index+1)+' из '+scenes.length+': '+s.name;
  }
  function goTo(index,{manual=true}={}){
    const target=(index+scenes.length)%scenes.length;
    if(transitioning){queued=target;return;}if(target===current)return;
    transitioning=true;hero.classList.remove('entering');hero.classList.add('switching');
    if(isVideo(media[target])){media[target].preload='auto';if(!activePaused())media[target].play().catch(()=>{});}
    clearTimeout(switchTimer);clearTimeout(finishTimer);
    /* Переход — короткий кроссфейд медиа-слоёв (CSS opacity) + быстрая подмена
       текста под прикрытием text-cut. Полноэкранный глитч-канвас убран: он рисовал
       сырые кадры без тёмного градиента (яркие вспышки с другой компоновкой),
       жёстко переключал базовый кадр и при быстрых кликах запускал два цикла
       отрисовки на одном канвасе — блок мерцал и «двоился». */
    switchTimer=setTimeout(()=>{current=target;elapsed=0;media.forEach((m,i)=>m.classList.toggle('active',i===current));render(current,manual);syncPlayback();},isReduced()?0:120);
    finishTimer=setTimeout(()=>{hero.classList.remove('switching');transitioning=false;if(queued!==null){const next=queued;queued=null;goTo(next);}},isReduced()?5:480);
  }
  function tick(now){
    const delta=Math.min(now-lastTime,100);lastTime=now;
    if(!activePaused()&&!transitioning){elapsed+=delta;if(elapsed>=duration){elapsed=0;goTo(current+1,{manual:false});}}
    const p=elapsed/duration;hero.style.setProperty('--progress',p);$('ring-progress').style.strokeDashoffset=String(circumference*(1-p));requestAnimationFrame(tick);
  }
  function openFilm(){
    opener=document.activeElement;
    $('dialog-title').textContent=current===0?'Cyber Scum':scenes[current].name;
    $('dialog-video').src=scenes[current].modalSrc||scenes[current].src;
    $('dialog-video').poster=scenes[current].poster;
    $('dialog-video').muted=false;
    dialog.showModal();syncPlayback();$('dialog-video').play().catch(()=>{});$('close-dialog').focus();
  }
  $('scene-cta').addEventListener('click',openFilm);
  $('close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{$('dialog-video').pause();$('dialog-video').removeAttribute('src');$('dialog-video').load();syncPlayback();opener?.focus();});
  choices.forEach(button=>button.addEventListener('click',()=>goTo(Number(button.dataset.scene))));
  $('pause-button').addEventListener('click',()=>{paused=!paused;syncPlayback();});
  document.querySelector('.brand').addEventListener('click',e=>{e.preventDefault();goTo(0);});
  document.addEventListener('keydown',e=>{if(dialog.open||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();goTo(current+1);}if(e.key==='ArrowLeft'){e.preventDefault();goTo(current-1);}});
  let pointerStart=null;
  document.querySelector('.stage').addEventListener('pointerdown',e=>{if(e.target.closest('button,a')||(e.pointerType==='mouse'&&e.button!==0))return;pointerStart={x:e.clientX,y:e.clientY};});
  document.querySelector('.stage').addEventListener('pointerup',e=>{if(!pointerStart)return;const dx=e.clientX-pointerStart.x,dy=e.clientY-pointerStart.y;pointerStart=null;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.4)goTo(current+(dx<0?1:-1));});
  document.querySelector('.stage').addEventListener('pointercancel',()=>pointerStart=null);
  document.addEventListener('visibilitychange',()=>{lastTime=performance.now();syncPlayback();});
  reduce.addEventListener('change',()=>{document.documentElement.classList.toggle('reduced-motion',isReduced());if(isReduced()){paused=true;clearInterval(typingTimer);$('description').classList.remove('typing-caret');$('description').textContent=scenes[current].description;}syncPlayback();});
  media.forEach((item,index)=>{if(isVideo(item))item.addEventListener('error',()=>{item.style.visibility='hidden';if(index===current)hero.querySelector('.backdrop').style.backgroundImage=`url("${scenes[index].poster}")`;});});
  render(0,false);syncPlayback();hero.classList.add('entering');setTimeout(()=>hero.classList.remove('entering'),1100);requestAnimationFrame(tick);
})();

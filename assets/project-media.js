// Playback observes the existing Reel frames; it never changes their animation transforms.
(() => {
 const frames=[...document.querySelectorAll('#jeyby .project-real-reel, #jakub .project-real-reel')];
 const desktop=matchMedia('(hover:hover) and (pointer:fine)');
 let active=null;
 function stop(frame){
  if(!frame)return;
  const video=frame.querySelector('video');
  frame.classList.remove('project-preview-playing');
  video.pause();video.muted=true;
  if(video.readyState)video.currentTime=0;
  if(active===frame)active=null;
 }
 function start(frame,audible=false){
  if(active===frame&&!audible)return;
  if(active!==frame){stop(active);active=frame}
  const video=frame.querySelector('video');
  document.dispatchEvent(new CustomEvent('portfolio-reel-activate',{detail:video}));
  video.muted=!audible;
  video.play().catch(()=>{if(active===frame)stop(frame)});
 }
 function activate(frame){
  const video=frame.querySelector('video');
  if(active===frame&&!video.muted&&!video.paused)stop(frame);
  else start(frame,true);
 }
 frames.forEach(frame=>{
  const video=frame.querySelector('video');video.muted=true;
  video.addEventListener('playing',()=>{
   if(active===frame)frame.classList.add('project-preview-playing');else stop(frame);
  });
  video.addEventListener('ended',()=>stop(frame));
  video.addEventListener('error',()=>stop(frame));
  frame.addEventListener('pointerenter',e=>{if(desktop.matches&&e.pointerType!=='touch')start(frame)});
  frame.addEventListener('pointerleave',()=>{if(desktop.matches)stop(frame)});
  frame.addEventListener('focus',()=>{if(desktop.matches)start(frame)});
  frame.addEventListener('blur',()=>stop(frame));
  frame.addEventListener('click',()=>activate(frame));
  frame.addEventListener('keydown',e=>{
   if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(frame)}
   if(e.key==='Escape')stop(frame);
  });
 });
 const visibility=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)stop(e.target)}));
 frames.forEach(frame=>visibility.observe(frame));
 // Coordinate playback across projects without changing any visual interaction.
 document.addEventListener('portfolio-reel-activate',event=>{
  if(active&&active.querySelector('video')!==event.detail)stop(active);
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop(active)});
 desktop.addEventListener('change',()=>stop(active));
})();

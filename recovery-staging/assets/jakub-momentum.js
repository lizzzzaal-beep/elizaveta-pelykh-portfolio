// The four real media wrappers are the feed. No duplicate cards or layout writes.
(() => {
  const section=document.querySelector('#jakub');
  const items=[...section.querySelectorAll('.media-item')];
  const head=section.querySelector('.case-head');
  const copy=section.querySelector('.case-block .label');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const compact=matchMedia('(max-width:700px), (pointer:coarse)');
  const clamp=x=>Math.max(0,Math.min(1,x));
  const smooth=x=>{x=clamp(x);return x*x*(3-2*x)};
  let raf=0,lastTime=0,lastY=scrollY,velocity=0;
  function render(now){
    raf=0;
    const dt=Math.max(16,Math.min(80,now-(lastTime||now)));
    const delta=scrollY-lastY;
    velocity=delta?Math.min(1,Math.abs(delta)/dt/2):velocity*Math.exp(-dt/65);
    lastTime=now;lastY=scrollY;
    const h=innerHeight;
    const p=reduced.matches?1:clamp((h*.68-section.getBoundingClientRect().top)/(h*.76));
    const title=smooth((p-.12)/.45),meaning=smooth((p-.28)/.3);
    head.style.opacity=title;head.style.transform=title===1?'none':`translateY(${(1-title)*12}px)`;
    copy.style.opacity=meaning;
    if(velocity>.002&&!reduced.matches)raf=requestAnimationFrame(render);
  }
  function queue(){if(!raf)raf=requestAnimationFrame(render)}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
  reduced.addEventListener('change',queue);queue();
})();

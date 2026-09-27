// Calm, reversible typography handoff; existing chapter content and order are retained.
(() => {
  const section=document.querySelector('.beyond');
  const heading=section.querySelector('h2');
  const sub=section.querySelector('.center-head p');
  heading.innerHTML='<span class="chapter-line">CONTENT IS ONLY</span><span class="chapter-line">PART OF THE JOB</span>';
  const lines=[...heading.children];
  [heading,sub].forEach(el=>el.classList.remove('motion-reveal','reveal'));
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
  let raf=0;
  function render(){
    raf=0;
    const p=reduced.matches?1:clamp((innerHeight*.78-heading.getBoundingClientRect().top)/(innerHeight*.42));
    lines.forEach((line,i)=>{
      const t=ease((p-i*.24)/(1-i*.24));
      line.style.clipPath=t===1?'none':`inset(${(1-t)*100}% 0 0)`;
      line.style.transform=t===1?'none':`perspective(900px) translateY(${(1-t)*8}px) scale(${1-(1-t)*(i?.065:.035)})`;
    });
    sub.style.opacity=ease((p-.65)/.35);
  }
  function queue(){if(!raf)raf=requestAnimationFrame(render)}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
  reduced.addEventListener('change',queue);queue();
})();

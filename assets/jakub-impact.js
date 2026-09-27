// Supplied boxer photograph; the original scroll-driven impact timeline is unchanged.
(() => {
  const section=document.querySelector('#jakub');
  const grid=section.querySelector('.grid.four');
  const items=[...grid.querySelectorAll('.media-item')];
  const layer=document.createElement('div');layer.className='jakub-impact';layer.setAttribute('aria-hidden','true');
  const glove=document.createElement('img');glove.src='assets/jakub-boxer.png';glove.alt='';
  layer.append(glove);grid.append(layer);
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const phone=matchMedia('(max-width:600px)');
  const clamp=v=>Math.max(0,Math.min(1,v));
  const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
  let raf=0;
  function render(){
    raf=0;
    // Intro's existing timeline completes first; a short reading beat precedes approach.
    const h=innerHeight,top=section.getBoundingClientRect().top;
    const p=reduced.matches?1:clamp((h*.14-top)/(h*.2));
    const approach=ease(p/.48),withdraw=ease((p-.52)/.22);
    glove.style.setProperty('--subject-width',(43-approach*7)+'%');
    glove.style.opacity=reduced.matches?0:ease(p/.12)*(1-withdraw);
    glove.style.transform=`translate3d(${(1-approach)*28}px,${(1-approach)*30+withdraw*18}px,${-220*(1-approach)-withdraw*100}px) scale(${.55+approach*.65-withdraw*.2})`;
    // One tiny compression response, entirely scroll-derived and limited to media space.
    const contact=Math.max(0,1-Math.abs(p-.5)/.025);
    layer.style.translate=`0 ${contact*2}px`;
    // A held media beat after contact, followed by a quiet chapter exit.
    const hold=reduced.matches||phone.matches?0:Math.min(h*.06,Math.max(0,-top-h*.06));
    grid.style.translate=hold?`0 ${hold}px`:'none';
    // On phones both rows get a full viewing interval before recession begins.
    const exitStart=phone.matches?Math.max(h*.9,grid.getBoundingClientRect().bottom-top-h*.12):h*(.06+.06);
    const exit=reduced.matches?0:clamp((-top-exitStart)/(h*.3));
    items.forEach((item,i)=>{
      const delay=[.66,.55,.58,.69][i];
      const t=reduced.matches?1:ease((p-delay)/(1-delay));
      const remaining=1-t;
      const recession=ease((exit-i*.035)/.895);
      item.style.opacity=t*(1-recession);
      item.style.scale=recession?String(1-recession*.035):"none";
      item.style.pointerEvents=t===1?'':'none';
      item.inert=t!==1;
      item.style.transform=t===1?'none':`translate3d(${[22,8,-8,-22][i]*remaining}px,${14*remaining}px,0) scale(${.96+.04*t})`;
      item.querySelector('.media-caption').style.opacity=t;
    });
  }
  function queue(){if(!raf)raf=requestAnimationFrame(render)}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
  reduced.addEventListener('change',queue);queue();
})();

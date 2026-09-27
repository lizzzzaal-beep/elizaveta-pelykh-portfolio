
(() => {
  const project=document.querySelector('#jeyby');
  if(!project) return;
  const frames=[...project.querySelectorAll('.media')];
  const captions=[...project.querySelectorAll('.media-caption')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const mobile=matchMedia('(max-width:700px)');
  const phone=matchMedia('(max-width:600px)');
  const layer=document.createElement('div');
  layer.className='jeyby-exposure'; layer.hidden=true; layer.setAttribute('aria-hidden','true');

  const word=document.createElement('div');word.className='jeyby-exposure-word';word.textContent='JEYBY';layer.append(word);
  document.body.append(layer);
  const clamp=v=>Math.max(0,Math.min(1,v));
  const ease=v=>{v=clamp(v);return v*v*(3-2*v)};
  const mix=(a,b,t)=>a+(b-a)*t;
  let pending=0;
  function render(){
    pending=0;
    const h=innerHeight,w=innerWidth;
    const bounds=project.getBoundingClientRect();
    const p=phone.matches?clamp((h*.9-bounds.top)/(h*.75)):clamp((h*.45-bounds.top)/(h*.65));
    const feather=Math.min(240,h*.25);
    layer.style.maskImage='linear-gradient(to bottom, transparent '+bounds.top+'px, black '+(bounds.top+feather)+'px, black '+(bounds.bottom-feather)+'px, transparent '+bounds.bottom+'px)';
    const nextTop=project.nextElementSibling.getBoundingClientRect().top;
    const handoff=ease((nextTop-h-24)/Math.min(260,h*.27));
    project.style.setProperty('--stage-ambient',ease(p/.2));
    const quiet=reduced.matches;
    layer.hidden=quiet;
    const exitLight=ease((nextTop-h-24)/Math.min(440,h*.45));
    // The word stays fixed in the dark; the stage light owns its discovery mask.
    layer.style.background='rgba(16,26,45,'+(.9*ease(p/.12)*(1-ease((p-.6)/.32))*handoff)+')';
    frames.forEach((el,i)=>{
      const reveal=quiet?1:Math.max(1-handoff,ease((p-.48-i*.018)/.43));
      frames[i].style.clipPath=reveal===1?'none':'inset(0 '+((1-reveal)*50)+'%)';
      captions[i].style.opacity=quiet?1:Math.max(1-handoff,ease((p-.72-i*.02)/.22));
    });
    word.style.opacity=mobile.matches?0:ease((p-.04)/.1)*exitLight;
    if(phone.matches){
      const presence=ease((p-.06)/.14)*(1-ease((p-.65)/.3));
      layer.style.maskImage='none';
      layer.style.background='rgba(16,26,45,'+(quiet?0:ease(p/.12)*(1-ease((p-.65)/.3)))+')';
      word.style.opacity=quiet?0:presence;
      frames.forEach((el,i)=>{
        const reveal=quiet?1:ease((p-.76-i*.012)/.19);
        el.style.clipPath=reveal===1?'none':'inset(0 '+((1-reveal)*50)+'%)';
        captions[i].style.opacity=reveal;
      });
    }
  }
  function queue(){if(!pending)pending=requestAnimationFrame(render)}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
  reduced.addEventListener('change',queue);queue();
})();

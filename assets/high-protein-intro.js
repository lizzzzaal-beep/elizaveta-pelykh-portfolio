(() => {
  const project=document.querySelector('#high-protein');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const small=matchMedia('(max-width:700px)');
  const phone=matchMedia('(max-width:600px)');
  const scene=document.createElement('div');
  scene.className='hp-pressure-scene';scene.setAttribute('aria-hidden','true');
  scene.innerHTML='<div class="hp-pressure-backdrop"></div><canvas></canvas><div class="hp-pressure-id">02 / HIGH PROTEIN</div><div class="hp-pressure-word hp-pressure-high">HIGH</div><div class="hp-pressure-word hp-pressure-protein">PROTEIN</div>';
  document.body.appendChild(scene);
  const backdrop=scene.querySelector('.hp-pressure-backdrop');
  const id=scene.querySelector('.hp-pressure-id');
  const high=scene.querySelector('.hp-pressure-high');
  const protein=scene.querySelector('.hp-pressure-protein');
  const canvas=scene.querySelector('canvas'), ctx=canvas.getContext('2d');
  const dust=Array.from({length:small.matches?85:160},()=>({x:Math.random(),y:Math.random(),size:.4+Math.random()*.8,phase:Math.random()*6.28,alpha:.12+Math.random()*.35}));
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>{const t=clamp(n);return t*t*(3-2*t)};
  let frame=0;
  function render(){
    frame=0;
    const h=innerHeight,w=innerWidth,top=project.getBoundingClientRect().top;
    const p=clamp((h*.98-top)/(h*.76));
    const active=!reduce.matches && p>0 && p<1;
    scene.style.visibility=active?'visible':'hidden';
    if(!active)return;
    // Fixed overlay uses the existing scroll distance: no spacer or empty screen.
    const entrance=smooth(p/.16),pressure=smooth((p-.12)/.53);
    const breakthrough=clamp((p-.66)/.28),rush=Math.pow(breakthrough,2.2);
    const clear=smooth((p-.90)/.10);
    scene.style.clipPath=`inset(${(1-entrance)*Math.max(0,top-60)}px 0 0 0)`;
    backdrop.style.opacity=entrance*(1-smooth((p-.79)/.19));
    id.style.opacity=smooth(p/.08)*(1-smooth((p-.64)/.12));
    const wordEntry=smooth((p-.08)/.12);
    // Heavy lateral loading differs from the loose Grand Dessert assembly.
    // Perspective translation then crosses the camera plane; there is no settled title.
    const inward=pressure*(small.matches?w*.12:w*.20);
    const z=rush*(phone.matches?200:700);
    // Fit layout bounds before perspective, leaving room for the inward pressure.
    if(phone.matches){
      [high,protein].forEach(el=>{
        el.style.fontSize='';
        const size=parseFloat(getComputedStyle(el).fontSize);
        el.style.fontSize=(size*Math.min(1,w*.62/el.offsetWidth))+'px';
      });
    }else{high.style.fontSize=protein.style.fontSize=''}
    high.style.transform=`translate3d(${inward}px,${pressure*14}px,${z}px)`;
    protein.style.transform=`translate3d(${-inward}px,${-pressure*14}px,${z}px)`;
    if(phone.matches){
      high.style.transform=`translate3d(${(w-high.offsetWidth)/2-high.offsetLeft-(1-pressure)*w*.04}px,${pressure*14}px,${z}px)`;
      protein.style.transform=`translate3d(${(w-protein.offsetWidth)/2-protein.offsetLeft+(1-pressure)*w*.04}px,${-pressure*14}px,${z}px)`;
    }
    high.style.opacity=protein.style.opacity=wordEntry*(1-clear);
    const dpr=Math.min(devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){
      canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    ctx.clearRect(0,0,w,h);
    const time=performance.now()/1000;
    dust.forEach(d=>{
      // Keep the original full-viewport distribution; only nearby dust is displaced.
      const baseX=d.x*w+Math.sin(time*.13+d.phase)*5;
      const baseY=d.y*h+Math.cos(time*.09+d.phase)*5;
      const dx=baseX-w*.5,dy=baseY-h*.50;
      const radius=Math.hypot(dx/(w*.28),dy/(h*.22));
      const influence=Math.pow(Math.max(0,1-radius),2);
      const load=pressure*(1-breakthrough);
      const angle=Math.atan2(dy,dx)+Math.sin(d.phase)*.35;
      const push=load*influence*Math.min(w,h)*.25;
      const release=Math.sin(breakthrough*Math.PI)*(.35+influence)*Math.min(w,h)*.13;
      const x=baseX+Math.cos(angle)*(push+release);
      const y=baseY+Math.sin(angle)*(push+release)*1.2;
      // A soft local density reduction, with no rectangular mask or central strip.
      ctx.globalAlpha=d.alpha*wordEntry*(1-clear)*(1-load*influence*.55);
      ctx.fillStyle='#cab39e';ctx.beginPath();ctx.arc(x,y,d.size,0,Math.PI*2);ctx.fill();
      const trail=load*influence*7+Math.sin(breakthrough*Math.PI)*5;
      ctx.strokeStyle='#cab39e';ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(x,y);
      ctx.lineTo(x+Math.cos(angle)*trail*.5,y+Math.sin(angle)*trail);ctx.stroke();
    });
    // Typography remains scroll-locked; only atmospheric drift continues at rest.
    if(!document.hidden)queue();
  }

  function queue(){if(!frame)frame=requestAnimationFrame(render)}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
  reduce.addEventListener('change',queue);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0}else queue()});
  queue();
})();

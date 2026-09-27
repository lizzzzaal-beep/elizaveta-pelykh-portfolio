(() => {
  const hero = document.querySelector('#top');
  const mark = hero.querySelector('.monogram');
  const name = hero.querySelector('h1');
  const field = hero.querySelector('.stars');
  const work = document.querySelector('#work');
  const workHeading = work.querySelector('.center-head');
  const bridgeText = [...workHeading.children];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  field.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  const particles = Array.from({length: fine.matches ? 180 : 85}, (_, i) => {
    const layer = Math.random();
    return {
      x:Math.random(), y:Math.random(), near:i%4===0,
      layer, size:.35 + layer*.85,
      alpha:.10 + layer*.30, phase:Math.random()*Math.PI*2,
      speed:.035 + layer*.13, dx:0, dy:0
    };
  });
  const bridgeParticles = Array.from({length:fine.matches ? 85 : 40}, () => ({
    x:Math.random(),y:Math.random(),near:false,bridge:true,layer:Math.random(),
    size:.35+Math.random()*.85,alpha:.10+Math.random()*.30,
    phase:Math.random()*Math.PI*2,speed:.035+Math.random()*.13,dx:0,dy:0
  }));
  particles.push(...bridgeParticles);
  // Share the established dust palette/depth parameters with the closing atmosphere.
  window.createPortfolioDust=()=>particles.filter(p=>!p.bridge).map(p=>({...p,dx:0,dy:0}));
  let fieldHeight, bridgeHeight, previousScroll=scrollY, scrollSpeed=0;
  let width, height, originX, originY, raf = 0, visible = true, impact = -Infinity;
  let pointer = null, depthX = 0, depthY = 0, last = 0;
  const clamp = n => Math.max(0,Math.min(1,n));
  function measure() {
    width = hero.clientWidth; height = hero.clientHeight;
    bridgeHeight = workHeading.offsetTop + workHeading.offsetHeight + 120;
    fieldHeight = height + bridgeHeight;
    field.style.height = `${fieldHeight}px`;
    const dpr = Math.min(devicePixelRatio || 1,2);
    canvas.width = Math.round(width*dpr); canvas.height = Math.round(fieldHeight*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    // Layout offsets exclude animated transforms, keeping the collision origin stable.
    originX = width/2;
    const h = hero.getBoundingClientRect(), m = mark.getBoundingClientRect();
    originY = m.top-h.top+m.height/2;
    schedule();
  }
  function draw(now) {
    raf = 0;
    const dt = Math.min((now-last)/1000 || .016,.05); last = now;
    const still = reduced.matches;
    const rect = hero.getBoundingClientRect();
    const exit = still ? 0 : clamp(-rect.top / height);
    const tx = !still && pointer ? (pointer.x/width-.5)*4 : 0;
    const ty = !still && pointer ? (pointer.y/height-.5)*3 : 0;
    const ease = 1-Math.exp(-dt*7);
    depthX += (tx-depthX)*ease; depthY += (ty-depthY)*ease;
    mark.style.translate = `${still?0:depthX}px ${still?0:depthY-exit*30}px`;
    mark.style.scale = `${1+exit*.035}`;
    name.style.translate = `${still?0:depthX*.6}px ${still?0:depthY*.6-exit*12}px`;
    // Scroll progress is reversible; neither heading uses a one-shot reveal.
    const travel = Math.max(0,-rect.top);
    bridgeText.forEach((el,i) => {
      const progress = still ? 1 : clamp((travel-i*45)/Math.min(340,height*.55));
      const smooth = progress*progress*(3-2*progress);
      el.style.opacity = smooth;
      el.style.transform = `translate3d(0,${(1-smooth)*(fine.matches?20:10)}px,0)`;
    });
    const velocity = (scrollY-previousScroll)/Math.max(dt,.001);
    previousScroll=scrollY;
    scrollSpeed += (velocity-scrollSpeed)*(1-Math.exp(-dt*10));
    ctx.clearRect(0,0,width,fieldHeight);
    const age = still ? -1 : (now-impact)/1000;
    particles.forEach(p => {
      const t = still ? 0 : now/1000*p.speed;
      // Nonmatching frequencies create long, organic trajectories across depth layers.
      const surge = still ? 0 : Math.pow(Math.max(0, Math.sin(t*.41+p.phase)),12);
      const baseX = p.near ? originX+(p.x-.5)*340 : p.x*width;
      const baseY = p.bridge ? height+p.y*bridgeHeight : p.near ? originY+(p.y-.5)*240 : p.y*height;
      const x = baseX + Math.sin(t+p.phase)*(10+p.layer*12) + surge*9;
      const y = baseY + Math.cos(t*.73+p.phase)*(7+p.layer*7);

      const ox=x-originX, oy=y-originY, distance=Math.hypot(ox,oy)||1;
      // A finite wavefront pushes dust outward, then decays without oscillation.
      const local = age-distance/1500;
      const pulse = local>0 && local<3 ? (1-Math.exp(-local*35))*Math.exp(-local*2.1) : 0;
      const force = pulse*115*Math.exp(-distance/480)*(0.65+p.layer*.6)*(fine.matches?1:.6);
      let px=0,py=0;
      if(pointer && !still){
        const dx=x-pointer.x,dy=y-pointer.y,d=Math.hypot(dx,dy)||1;
        const repel=Math.pow(Math.max(0,1-d/165),1.6)*(26+p.layer*24);
        px=dx/d*repel;py=dy/d*repel;
      }
      px+=depthX*p.layer*5;py+=depthY*p.layer*5;
      p.dx+=(px-p.dx)*ease;p.dy+=(py-p.dy)*ease;
      // A narrow moving displacement band refracts dust, without drawing a ring.
      const front = age*width/0.65;
      const wave = age>=0 && age<.7 ? Math.exp(-Math.pow((Math.abs(x-originX)-front)/24,2))*16 : 0;
      const fade = 1-clamp((y-height-bridgeHeight*.45)/(bridgeHeight*.55));
      ctx.globalAlpha=Math.min(.72,p.alpha*(.75+.25*Math.sin(t*.8+p.phase))+pulse*.22)*fade;
      ctx.fillStyle='#cab39e';ctx.beginPath();
      const drawX=x+ox/distance*force+p.dx,drawY=y+oy/distance*force+p.dy+wave;
      ctx.arc(drawX,drawY,p.size,0,Math.PI*2);ctx.fill();
      const trail=still?0:Math.min(5,Math.abs(scrollSpeed)*.003)*(0.35+p.layer*.65);
      if(trail>.15){
        ctx.beginPath();ctx.moveTo(drawX,drawY);ctx.lineTo(drawX,drawY+Math.sign(scrollSpeed)*trail);
        ctx.strokeStyle='#cab39e';ctx.lineWidth=p.size;ctx.globalAlpha*=.55;ctx.stroke();
      }
    });
    // Brief travelling refraction seams: champagne-tinted compression of the field.
    // They originate at EP, open horizontally, and disappear within 650 ms.
    if(age>=0 && age<.65){
      const progress=age/.65;
      const envelope=Math.sin(Math.PI*progress);
      const reach=progress*width*.8;
      for(const direction of [-1,1]){
        const x=originX+direction*reach;
        const bend=direction*24*envelope;
        const band=direction*(3+10*envelope);
        const top=Math.max(0,originY-100-progress*height);
        const bottom=Math.min(height,originY+100+progress*height);
        ctx.beginPath();ctx.moveTo(x,top);
        ctx.bezierCurveTo(x-bend,originY-45,x+bend,originY+45,x,bottom);
        ctx.lineTo(x+band,bottom);
        ctx.bezierCurveTo(x+bend+band,originY+45,x-bend+band,originY-45,x+band,top);
        ctx.closePath();ctx.globalAlpha=.14*envelope;ctx.fillStyle='#cab39e';ctx.fill();
        ctx.beginPath();ctx.moveTo(x,top);
        ctx.bezierCurveTo(x-bend,originY-45,x+bend,originY+45,x,bottom);
        ctx.globalAlpha=.32*envelope;ctx.strokeStyle='#cab39e';ctx.lineWidth=.7;ctx.stroke();
      }
    }
    if(visible && !still) raf=requestAnimationFrame(draw);
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(draw)}
  hero.querySelector('.ep-e').addEventListener('animationend', event => {
    if(event.animationName==='ep-meet-e'){impact=performance.now();schedule()}
  });
  const movePointer = event=>{
    if(!fine.matches || reduced.matches || event.pointerType==='touch')return;
    const rect=hero.getBoundingClientRect();pointer={x:event.clientX-rect.left,y:event.clientY-rect.top};
    if(pointer.y>fieldHeight)pointer=null;
    schedule();
  };
  hero.addEventListener('pointermove',movePointer,{passive:true});
  work.addEventListener('pointermove',movePointer,{passive:true});
  work.addEventListener('pointerleave',()=>{pointer=null;schedule()});
  hero.addEventListener('pointerleave',()=>{pointer=null;schedule()});
  addEventListener('scroll',()=>{if(visible)schedule()},{passive:true});
  addEventListener('resize',measure,{passive:true});
  reduced.addEventListener('change',()=>{pointer=null;schedule()});
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible)schedule();else{cancelAnimationFrame(raf);raf=0;pointer=null}
  }).observe(field);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(raf);raf=0}else if(visible)schedule();
  });
  measure();document.fonts.ready.then(measure);
})();

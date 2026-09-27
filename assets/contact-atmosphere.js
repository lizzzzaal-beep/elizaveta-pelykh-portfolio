// Closing callback: reuse Hero dust parameters and physical language, without its collision.
(() => {
 const contact=document.querySelector('.contact');
 const canvas=document.createElement('canvas');canvas.className='contact-atmosphere';canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
 const ctx=canvas.getContext('2d'),dust=window.createPortfolioDust();
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
 const clamp=x=>Math.max(0,Math.min(1,x));
 let raf=0,last=0,previous=scrollY,velocity=0,pointer=null;
 function draw(now){
  raf=0;const w=innerWidth,h=innerHeight,d=Math.min(devicePixelRatio,1.5);
  if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0)}
  ctx.clearRect(0,0,w,h);
  const rect=contact.getBoundingClientRect();
  if(rect.top>h+140||rect.bottom<0||document.hidden){last=0;return}
  const dt=Math.min((now-last)/1000||.016,.05);last=now;
  const speed=(scrollY-previous)/Math.max(.016,dt);previous=scrollY;velocity+=(speed-velocity)*(1-Math.exp(-dt*12));
  const presence=clamp((h+140-rect.top)/(h*.78));
  const quiet=reduced.matches;
  dust.forEach((p,i)=>{
   if(!fine.matches&&i%2)return;
   const t=quiet?0:now/1000*p.speed;
   const x=p.x*w+Math.sin(t+p.phase)*(10+p.layer*12);
   const y=p.y*h+Math.cos(t*.73+p.phase)*(7+p.layer*7);
   let px=0,py=0;
   if(pointer&&!quiet&&rect.top<h*.5){const dx=x-pointer.x,dy=y-pointer.y,dist=Math.hypot(dx,dy)||1;const force=Math.pow(Math.max(0,1-dist/165),1.6)*(12+p.layer*12);px=dx/dist*force;py=dy/dist*force}
   const follow=1-Math.exp(-dt*7);p.dx+=(px-p.dx)*follow;p.dy+=(py-p.dy)*follow;
   const feather=clamp((y-(rect.top-180))/230);
   ctx.globalAlpha=p.alpha*(.75+.25*Math.sin(t*.8+p.phase))*presence*feather*.8;
   ctx.fillStyle='#CAB39E';ctx.beginPath();ctx.arc(x+p.dx,y+p.dy,p.size,0,Math.PI*2);ctx.fill();
   const trail=quiet?0:Math.min(3,Math.abs(velocity)*.002)*( .35+p.layer*.65);
   if(trail>.15){ctx.globalAlpha*=.4;ctx.strokeStyle='#CAB39E';ctx.lineWidth=p.size;ctx.beginPath();ctx.moveTo(x+p.dx,y+p.dy);ctx.lineTo(x+p.dx,y+p.dy+Math.sign(velocity)*trail);ctx.stroke()}
  });
  // Readable negative space follows actual text; links remain unobstructed.
  ctx.globalAlpha=1;ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';
  document.querySelectorAll('.terms small,.terms h4,.terms p,.contact h2,.contact p,.contact-info>*,.contact footer').forEach(el=>{
   const range=document.createRange();range.selectNodeContents(el);for(const r of range.getClientRects())ctx.fillRect(r.left-10,r.top-9,r.width+20,r.height+18);
  });ctx.globalCompositeOperation='source-over';
  if(!quiet)raf=requestAnimationFrame(draw);
 }
 function queue(){if(!raf)raf=requestAnimationFrame(draw)}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
 addEventListener('pointermove',e=>{if(fine.matches)pointer={x:e.clientX,y:e.clientY}},{passive:true});
 document.addEventListener('pointerleave',()=>pointer=null);
 document.addEventListener('visibilitychange',queue);reduced.addEventListener('change',queue);queue();
})();

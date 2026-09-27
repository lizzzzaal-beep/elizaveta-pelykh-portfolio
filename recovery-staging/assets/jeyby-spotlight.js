// One additive stage light, independent of exposure and media transforms.
(() => {
  const section=document.querySelector('#jeyby');
  if(!section) return;
  const canvas=document.createElement('canvas');
  canvas.className='jeyby-spotlight';canvas.setAttribute('aria-hidden','true');
  document.body.append(canvas);
  const ctx=canvas.getContext('2d');
  const beam=document.createElement('canvas');beam.width=240;beam.height=240;
  const beamContext=beam.getContext('2d');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const pointer=matchMedia('(hover:hover) and (pointer:fine) and (min-width:701px)');
  let w=0,h=0,raf=0,last=0,aim=.5,target=.5,aimY=.65,intensity=.6,inside=false;
  const clamp=v=>Math.max(0,Math.min(1,v));
  const dust=Array.from({length:28},()=>({x:Math.random(),y:Math.random(),r:.4+Math.random()*.6}));
  function resize(){
    w=innerWidth;h=innerHeight;
    const d=Math.min(devicePixelRatio,1.5);
    canvas.width=w*d;canvas.height=h*d;
    ctx.setTransform(d,0,0,d,0,0);
    wake();
  }
  function frame(now){
    raf=0;
    const rect=section.getBoundingClientRect();
    const progress=clamp((h*.45-rect.top)/(h*.65));
    let strength=clamp(progress*5)*clamp(rect.bottom/(h*.45));
    ctx.clearRect(0,0,w,h);
    if(!strength||rect.top>h||document.hidden){last=0;return}
    const dt=Math.min(50,now-(last||now));last=now;
    const sweep=clamp((progress-.08)/.5);
    const search=progress<.65?-.2+1.65*sweep:.55;
    const active=pointer.matches?section.querySelector('.media:hover, .media:focus-visible'):null;
    const bounds=active?.getBoundingClientRect();
    const desired=bounds?(bounds.left+bounds.width/2)/w:progress<1?search:inside&&pointer.matches?target:.55;
    const desiredY=bounds?(bounds.top+bounds.height*.5)/h:.65;
    const power=bounds?1:progress<1?.85:inside?.75:.45;
    const follow=reduced.matches?1:1-Math.exp(-dt/650);
    aim+=(desired-aim)*follow;
    aimY+=(desiredY-aimY)*follow;
    intensity+=(power-intensity)*follow;
    const sourceX=w*.18,sourceY=-h*.22;
    const endX=w*aim,endY=h*aimY;
    const word=document.querySelector('.jeyby-exposure-word');
    if(word){
      // Soft, oblique light discovers fragments; previously lit areas retain exposure.
      const front=(-12+sweep*132);
      const memory=clamp((progress-.22)/.38);
      word.style.maskImage='radial-gradient(ellipse 25% 85% at '+front+'% 54%, black 12%, transparent 100%), linear-gradient(103deg, rgba(0,0,0,'+memory+') '+(front-30)+'%, transparent '+(front+4)+'%)';
      if(progress>=.6)word.style.maskImage='none';
    }

    const spread=w*(pointer.matches?.24:.38);
    ctx.save();
    ctx.beginPath();ctx.rect(0,Math.max(0,rect.top),w,Math.max(0,Math.min(h,rect.bottom)-Math.max(0,rect.top)));ctx.clip();
    // Rasterized directional falloff avoids repeated translucent edge banding.
    const bw=240,bh=240;
    const pixels=beamContext.createImageData(bw,bh);
    for(let y=0;y<bh;y++){
      const v=y/(bh-1),center=sourceX+(endX-sourceX)*(v*h-sourceY)/(endY-sourceY);
      const radius=spread*(.13+.87*clamp((v*h-sourceY)/(endY-sourceY)));
      const vertical=Math.exp(-Math.pow((v-aimY)/.36,2))*clamp(v*8);
      const sectionFade=clamp((v*h-rect.top)/220)*clamp((rect.bottom-v*h)/220);
      for(let x=0;x<bw;x++){
        const dx=(x/(bw-1)*w-center)/radius;
        const alpha=Math.exp(-dx*dx*3)*vertical*.22*strength*intensity*sectionFade;
        const k=(y*bw+x)*4;
        pixels.data[k]=202;pixels.data[k+1]=179;pixels.data[k+2]=158;pixels.data[k+3]=Math.round(alpha*255);
      }
    }
    beamContext.putImageData(pixels,0,0);
    ctx.drawImage(beam,0,0,w,h);
    dust.forEach(p=>{
      const y=p.y*h,x=p.x*w;
      const center=sourceX+(endX-sourceX)*(y-sourceY)/(endY-sourceY);
      const falloff=clamp(1-Math.abs(x-center)/(spread*.8));
      ctx.fillStyle='rgba(202,179,158,'+(falloff*.18*strength*clamp((y-rect.top)/220)*clamp((rect.bottom-y)/220))+')';
      ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fill();
    });
    ctx.restore();
    if(!reduced.matches && (Math.abs(desired-aim)+Math.abs(desiredY-aimY)+Math.abs(power-intensity)>.0003)) raf=requestAnimationFrame(frame);
  }
  function wake(){if(!raf)raf=requestAnimationFrame(frame)}
  addEventListener('pointermove',e=>{
    inside=e.clientY>=section.getBoundingClientRect().top&&e.clientY<=section.getBoundingClientRect().bottom;
    target=.3+.4*clamp(e.clientX/innerWidth);
    if(pointer.matches)wake();
  },{passive:true});
  section.addEventListener('pointerleave',()=>{inside=false;wake()});
  section.querySelectorAll('.media').forEach(el=>{el.addEventListener('pointerenter',wake);el.addEventListener('pointerleave',wake)});
  section.addEventListener('focusin',wake);section.addEventListener('focusout',wake);
  document.addEventListener('pointerleave',()=>{inside=false;wake()});
  addEventListener('scroll',wake,{passive:true});
  addEventListener('resize',resize,{passive:true});
  document.addEventListener('visibilitychange',wake);
  reduced.addEventListener('change',wake);
  resize();
})();

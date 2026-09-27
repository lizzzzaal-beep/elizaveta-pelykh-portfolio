// Original supplied photograph; scroll moves the whole image without deforming it.
(() => {
  const project=document.querySelector('#high-protein');
  const canvas=document.createElement('canvas');
  canvas.className='protein-runner';canvas.setAttribute('aria-hidden','true');
  project.prepend(canvas);
  const ctx=canvas.getContext('2d');
  const photo=new Image();photo.src='assets/high-protein-runner.png';
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const small=matchMedia('(max-width:700px), (pointer:coarse)');
  const phone=matchMedia('(max-width:600px)');
  const clamp=n=>Math.max(0,Math.min(1,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n)};
  let pending=0;
  function render(){
    pending=0;
    const w=innerWidth,h=innerHeight,r=project.getBoundingClientRect();
    const d=Math.min(devicePixelRatio,1.5);
    if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){
      canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);
    }
    ctx.clearRect(0,0,w,h);
    if(!photo.complete||!photo.naturalWidth||reduce.matches||(small.matches&&!phone.matches)||r.bottom<=0||r.top>=h)return;
    const travel=h*.22-r.top;
    const progress=clamp(travel/(r.height+h*.1));
    const alpha=smooth(travel/240)*smooth((r.bottom-h*.75)/300)*.72;
    if(!alpha)return;
    const height=phone.matches?w*(1.02+.06*Math.sin(progress*Math.PI)):h*(1.12+.1*Math.sin(progress*Math.PI));
    const width=height*photo.naturalWidth/photo.naturalHeight;
    const x=phone.matches?w*(.18+.64*smooth(progress))-width*.5:w*(-.08+.9*smooth(progress))-width*.5;
    const y=phone.matches?h*.22+Math.sin(progress*Math.PI*2)*h*.035:-h*.08+Math.sin(progress*Math.PI*2)*h*.08;
    ctx.save();
    ctx.globalAlpha=alpha;
    ctx.drawImage(photo,x,y,width,height);
    ctx.globalAlpha=1;
    // Feather only the presentation; the source image is kept unmodified.
    ctx.globalCompositeOperation='destination-in';
    const horizontal=ctx.createLinearGradient(x,0,x+width,0);
    horizontal.addColorStop(0,'transparent');horizontal.addColorStop(.16,'black');
    horizontal.addColorStop(.84,'black');horizontal.addColorStop(1,'transparent');
    ctx.fillStyle=horizontal;ctx.fillRect(0,0,w,h);
    const vertical=ctx.createLinearGradient(0,y,0,y+height);
    vertical.addColorStop(0,'transparent');vertical.addColorStop(.13,'black');
    vertical.addColorStop(.85,'black');vertical.addColorStop(1,'transparent');
    ctx.fillStyle=vertical;ctx.fillRect(0,0,w,h);
    ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';
    // Respect actual media geometry, including the independent hover transforms.
    project.querySelectorAll('.media:not(.carousel-row)').forEach(el=>{
      const b=el.getBoundingClientRect();ctx.fillRect(b.left,b.top,b.width,b.height);
    });
    ctx.fillRect(0,0,w,Math.max(0,r.top));
    ctx.fillRect(0,Math.max(0,r.bottom),w,h);
    ctx.restore();
  }
  function queue(){if(!pending)pending=requestAnimationFrame(render)}
  photo.addEventListener('load',queue);
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
  reduce.addEventListener('change',queue);small.addEventListener('change',queue);queue();
})();

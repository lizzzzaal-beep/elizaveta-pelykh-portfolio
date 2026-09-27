// One local sculptural ribbon; scroll reveals its length, never transforms content.
(() => {
  const section=document.querySelector('#work');
  const row=section.querySelector('[data-media="grand-selfcare"]');
  const block=row.closest('.case-block').nextElementSibling;
  const canvas=document.createElement('canvas');canvas.className='grand-ribbon';
  canvas.setAttribute('aria-hidden','true');document.body.append(canvas);
  const ctx=canvas.getContext('2d');
  const reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let pending=0;
  const clamp=v=>Math.max(0,Math.min(1,v));
  function draw(){
    pending=0;
    const w=innerWidth,h=innerHeight,a=row.getBoundingClientRect();
    const first=block.querySelector('.media').getBoundingClientRect();
    const d=Math.min(devicePixelRatio,1.5);
    if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){
      canvas.width=Math.round(w*d);canvas.height=Math.round(h*d);ctx.setTransform(d,0,0,d,0,0);
    }
    ctx.clearRect(0,0,w,h);
    if(a.bottom>h+150||first.top< -160||reduce.matches)return;
    const progress=clamp((h*.92-a.bottom)/(h*.52));
    const mid=(a.bottom+first.top)/2;
    const end=Math.floor(progress*800);
    const point=t=>({x:-w*.12+w*1.24*t,y:mid-100+190*Math.pow(Math.sin(Math.PI*t),2)-85*t});
    // A twisted strip has two edges and width-varying shading, not a stroked rope.
    for(let i=0;i<end;i++){
      const t=i/800,p=point(t),q=point((i+1)/800);
      const twist=Math.sin(t*Math.PI*1.25+.2);
      const half=3+11*Math.abs(twist);
      const shade=.45+.5*Math.pow(Math.sin(t*Math.PI+.4),2);
      const g=ctx.createLinearGradient(0,p.y-half,0,p.y+half);
      const color=n=>'rgb('+[16+(202-16)*n,26+(179-26)*n,45+(158-45)*n].map(Math.round).join(',')+')';
      g.addColorStop(0,color(shade*.6));g.addColorStop(.22,color(shade));
      g.addColorStop(.7,color(shade*.74));g.addColorStop(1,color(shade*.35));
      ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(p.x,p.y-half);
      ctx.lineTo(q.x+.7,q.y-half);ctx.lineTo(q.x+.7,q.y+half);ctx.lineTo(p.x,p.y+half);ctx.closePath();ctx.fill();
    }
    ctx.save();ctx.globalCompositeOperation='destination-out';ctx.fillStyle='#000';
    // Mostly behind both groups. A tiny central top edge is the sole foreground crossing.
    section.querySelectorAll('.media:not(.carousel-row)').forEach(el=>{
      const r=el.getBoundingClientRect();
      const crossing=el===block.querySelectorAll('.media')[1];
      ctx.fillRect(r.left,r.top+(crossing?7:0),r.width,r.height-(crossing?7:0));
    });
    section.querySelectorAll('.label,.case-head').forEach(el=>{
      const range=document.createRange();range.selectNodeContents(el);
      for(const r of range.getClientRects())ctx.fillRect(r.left-4,r.top-4,r.width+8,r.height+8);
    });
    ctx.restore();
  }
  function queue(){if(!pending)pending=requestAnimationFrame(draw)}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
  reduce.addEventListener('change',queue);queue();
})();

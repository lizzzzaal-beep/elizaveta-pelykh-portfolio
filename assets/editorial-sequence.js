(() => {
  const field=document.querySelector('.beyond .text-columns');
  const about=document.querySelector('.about');
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const clamp=x=>Math.max(0,Math.min(1,x));
  const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
  function clear(el){el.classList.remove('motion-reveal','reveal')}
  const titles=[...field.querySelectorAll('h4')];
  const groups=titles.map((title,i)=>{
    const body=title.nextElementSibling;clear(title);clear(body);
    const parts=i===2?body.innerHTML.split('<br>'):body.textContent.split(' · ');
    body.textContent='';
    const spans=parts.map((text,j)=>{
      if(j)body.append(i===2?document.createElement('br'):document.createTextNode(' · '));
      const span=document.createElement('span');span.className='editorial-piece';span.innerHTML=text;
      if(i===1||i===2)span.tabIndex=0;
      body.append(span);return span;
    });
    body.classList.add('editorial-field');
    const ghost=document.createElement('div');ghost.className='editorial-ghost';ghost.setAttribute('aria-hidden','true');
    ghost.textContent=['PAID','CLIENT','TALENT','INFLUENCER'][i];field.append(ghost);
    return {title,body,spans,ghost};
  });
  const connectors=document.createElement('div');connectors.className='editorial-connectors';field.append(connectors);
  const statement=about.querySelector('h2');clear(statement);
  statement.innerHTML='<span class="experience-six">6</span><span class="experience-plus">+</span><span class="experience-rest"> YEARS IN SOCIAL<br>NEVER STUCK IN THE PAST</span>';
  const six=statement.querySelector('.experience-six'),plus=statement.querySelector('.experience-plus'),rest=statement.querySelector('.experience-rest');
  const copy=about.querySelector('.about-copy');clear(copy);
  // Character spans preserve exact text, natural wrapping, and the existing column footprint.
  const walker=document.createTreeWalker(copy,NodeFilter.SHOW_TEXT),nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  const chars=[];nodes.forEach(node=>{const f=document.createDocumentFragment();for(const c of node.textContent){const span=document.createElement('span');span.textContent=c;f.append(span);chars.push(span)}node.replaceWith(f)});
  const scope=about.querySelector('.scope'),scopeTitle=scope.firstElementChild,scopeItems=[...scope.querySelectorAll('.scope-grid span')];
  [scopeTitle,...scopeItems].forEach(clear);
  const rule=document.createElement('div');rule.className='scope-rule';scope.prepend(rule);
  let raf=0;
  function render(){
    raf=0;const h=innerHeight,quiet=reduced.matches;
    const fr=field.getBoundingClientRect(),height=field.offsetHeight;
    groups.forEach((g,i)=>{
      const r=g.title.getBoundingClientRect();const p=quiet?1:clamp((h*.83-r.top)/(h*.3));
      g.title.style.clipPath=`inset(0 ${(1-ease(p/.35))*100}% 0 0)`;
      g.spans.forEach((el,j)=>{const t=ease((p-.13-j*.025)/.6);el.style.clipPath=`inset(${i===2?(1-t)*100:0}% ${i!==2?(1-t)*100:0}% 0 0)`;el.style.transform=t===1?'none':`translate(${(1-t)*(j%2?6:-6)}px,${i===2?(1-t)*5:0}px)`});
      g.ghost.style.top=(g.title.offsetTop-20)+'px';g.ghost.style.opacity=quiet?0:Math.pow(Math.max(0,1-Math.abs(r.top-h*.42)/(h*.15)),2)*.045;
      g.ghost.style.transform=`translateX(${(1-p)*22}px)`;
      if(i===3){connectors.style.top=(g.body.offsetTop-10)+'px';connectors.style.opacity=quiet?0:Math.sin(Math.PI*p)*.25;connectors.style.transform=`scaleX(${p})`}
    });
    const ar=about.querySelector('.about-grid').getBoundingClientRect();
    const p=quiet?1:clamp((h*.92-ar.top)/(h*.53));
    const n=ease(p/.32),add=ease((p-.32)/.15),words=ease((p-.45)/.18),typed=clamp((p-.61)/.33);
    six.style.display=plus.style.display='inline-block';six.style.transform=n===1?'none':`rotate(${(1-n)*-65}deg) scale(${.8+.2*n})`;six.style.clipPath=`inset(${(1-n)*100}% 0 0)`;
    plus.style.transform=add===1?'none':`scale(${.75+.25*add})`;plus.style.opacity=add;
    rest.style.clipPath=words===1?'none':`inset(0 ${(1-words)*100}% 0 0)`;rest.style.opacity=words;
    chars.forEach((el,i)=>el.style.opacity=i<Math.ceil(typed*chars.length)?1:0);
    const sp=quiet?1:clamp((h*.7-scope.getBoundingClientRect().top)/(h*.32));
    rule.style.transform=`scaleX(${ease(sp/.35)})`;
    scopeTitle.style.clipPath=`inset(0 ${(1-ease((sp-.28)/.2))*100}% 0 0)`;
    scopeItems.forEach((el,i)=>{const row=Math.floor(i/2),t=ease((sp-.4-row*.14)/.3);el.style.clipPath=`inset(0 ${(1-t)*100}% 0 0)`;el.style.transform=t===1?'none':`translateY(${row===1?(1-t)*5:0}px)`});
  }
  function queue(){if(!raf)raf=requestAnimationFrame(render)}
  addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});reduced.addEventListener('change',queue);document.fonts.ready.then(queue);queue();
})();

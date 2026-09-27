(() => {
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const clamp=x=>Math.max(0,Math.min(1,x));
 const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 const clean=el=>el.classList.remove('motion-reveal','reveal','process-beat','quiet-beat');
 function accordion(row,header,contents,id){
   clean(row);row.classList.add('editorial-accordion');
   const button=document.createElement('button');button.className='accordion-toggle';button.type='button';
   button.id=id+'-button';button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls',id);
   header.forEach(el=>button.append(el));
   const plus=document.createElement('span');plus.className='accordion-plus';plus.textContent='+';plus.setAttribute('aria-hidden','true');button.append(plus);
   const panel=document.createElement('div');panel.className='accordion-panel';panel.id=id;panel.setAttribute('role','region');panel.setAttribute('aria-labelledby',button.id);panel.inert=true;
   const inner=document.createElement('div');inner.className='accordion-inner';contents.forEach(el=>inner.append(el));panel.append(inner);
   row.replaceChildren(button,panel);
   [...inner.querySelectorAll('p,h4,.inclusion')].forEach((el,i)=>{el.classList.add('accordion-line');el.style.setProperty('--line-delay',Math.min(i*30,180)+'ms')});
   button.addEventListener('click',()=>{const open=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(open));row.classList.toggle('is-open',open);panel.inert=!open;});
 }
 const packages=[...document.querySelectorAll('.package')];
 packages.forEach((row,i)=>{
   const data=PORTFOLIO.packages[i],title=row.querySelector('.pkg-title'),price=row.querySelector('.price');
   const columns=[data.left,data.right].map(list=>{const col=document.createElement('div');col.className='package-inclusions';list.forEach(text=>{const line=document.createElement('div');line.className='inclusion';line.textContent=text;col.append(line)});return col});
   accordion(row,[title,price],columns,'service-details-'+i);
 });
 const terms=[...document.querySelectorAll('.terms-grid>div')];
 terms.forEach((row,i)=>{const title=row.firstElementChild;accordion(row,[title],[...row.children].slice(1),'term-details-'+i)});
 const sections=['services','process','terms','contact'].map(name=>document.querySelector('.'+name));
 sections.forEach(section=>section.querySelectorAll('.motion-reveal').forEach(clean));
 const headings=sections.map(section=>section.querySelector('.center-head h2'));
 const steps=[...document.querySelectorAll('.steps>div')];
 steps.forEach(el=>{clean(el);el.classList.add('editorial-step')});
 const contacts=[...document.querySelectorAll('.contact-info>a')];
 contacts.forEach(a=>a.classList.add('final-contact-link'));
 let raf=0;
 function render(){
  raf=0;const h=innerHeight,quiet=reduced.matches;
  headings.forEach((el,i)=>{
   const p=quiet?1:ease((h*.86-el.getBoundingClientRect().top)/(h*.32));
   el.style.clipPath=p===1?'none':i===1?`inset(0 ${(1-p)*50}%)`:i===2?`inset(${(1-p)*100}% 0 0)`:`inset(0 ${(1-p)*100}% 0 0)`;
   const sub=el.nextElementSibling;if(sub)sub.style.opacity=quiet?1:ease((p-.55)/.45);
  });
  const serviceTop=sections[0].getBoundingClientRect().top;
  document.querySelector('.scope').style.opacity=quiet?1:1-.2*ease((h*.7-serviceTop)/(h*.4));
  packages.forEach(row=>{if(quiet||row.getBoundingClientRect().top<h*.88)row.classList.add('rule-established')});
  steps.forEach((el,i)=>{
   const t=quiet?1:ease((h*.84-el.getBoundingClientRect().top)/(h*.23));
   el.style.clipPath=t===1?'none':`inset(0 ${(1-t)*100}% 0 0)`;
   el.style.translate=t===1?'none':`${(1-t)*(i%2?24:-24)}px 0`;
   el.style.setProperty('--step-rule',ease((t-.4)/.6));
  });
  contacts.forEach((el,i)=>{
   const top=sections[3].querySelector('.center-head').getBoundingClientRect().top;
   const p=quiet?1:Math.max(clamp((h*.75-top)/(h*.47)),clamp((h+160-sections[3].getBoundingClientRect().bottom)/160));
   const t=ease((p-.35-i*.16)/.32);
   [el.previousElementSibling,el].forEach(node=>node.style.clipPath=t===1?'none':`inset(0 ${(1-t)*100}% 0 0)`);
  });
 }
 function queue(){if(!raf)raf=requestAnimationFrame(render)}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});reduced.addEventListener('change',queue);queue();
})();

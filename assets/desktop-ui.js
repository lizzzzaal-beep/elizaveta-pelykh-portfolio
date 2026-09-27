// Independent navigation and pointer presentation; no media or section transforms.
(() => {
 const desktop=matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)');
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const entries=[['top','↑','TOP'],['work','01','GRAND DESSERT'],['high-protein','02','HIGH PROTEIN'],['jeyby','03','JEYBY'],['jakub','04','JAKUB DOHNAL'],['beyond','05','BEYOND CONTENT'],['about','06','ABOUT'],['services','07','SERVICES'],['process','08','PROCESS'],['terms','09','TERMS'],['contact','10','CONTACT']];
 const nav=document.createElement('nav');nav.className='portfolio-index';nav.setAttribute('aria-label','Section index');
 nav.innerHTML='<ol>'+entries.map(([id,n,label])=>`<li><a href="#${id}"><span class="index-number">${n}</span><span class="index-label">${label}</span></a></li>`).join('')+'</ol>';
 const cursor=document.createElement('div');cursor.className='portfolio-cursor';cursor.setAttribute('aria-hidden','true');
 cursor.innerHTML='<i class="cursor-dot"></i><i class="cursor-ring"><span><em>PLAY</em></span></i>';
 document.body.append(nav,cursor);
 const links=[...nav.querySelectorAll('a')],targets=entries.map(([id])=>document.getElementById(id));
 const dot=cursor.querySelector('.cursor-dot'),ring=cursor.querySelector('.cursor-ring');
 let offsets=[],active=-1,scrollFrame=0,frame=0,x=0,y=0,rx=0,ry=0,visible=false;
 function measure(){offsets=targets.map(el=>el.getBoundingClientRect().top+scrollY);track()}
 function track(){
  scrollFrame=0;if(!desktop.matches)return;
  const position=scrollY+innerHeight*.22;let next=0;
  offsets.forEach((top,i)=>{if(top<=position)next=i});
  if(scrollY+innerHeight>=document.documentElement.scrollHeight-2)next=entries.length-1;
  if(next===active)return;active=next;
  links.forEach((a,i)=>{if(i===next)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});
 }
 function onScroll(){if(desktop.matches&&!scrollFrame)scrollFrame=requestAnimationFrame(track)}
 nav.addEventListener('click',e=>{
  const link=e.target.closest('a');if(!link)return;
  if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  e.preventDefault();document.getElementById(link.hash.slice(1)).scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});
 });
 function hide(){visible=false;cursor.classList.remove('is-visible');document.documentElement.classList.remove('portfolio-pointer');cancelAnimationFrame(frame);frame=0}
 function draw(){
  frame=0;if(!visible)return;
  rx=reduce.matches?x:rx+(x-rx)*.3;ry=reduce.matches?y:ry+(y-ry)*.3;
  if(Math.abs(x-rx)+Math.abs(y-ry)<.15){rx=x;ry=y}
  ring.style.transform=`translate3d(${rx}px,${ry}px,0)`;
  if(rx!==x||ry!==y)frame=requestAnimationFrame(draw);
 }
 function state(target){
  const inert=target.closest('[inert]');
  const reel=!inert&&target.closest('.grand-real-media.reel,.protein-real-reel,.project-real-reel');
  cursor.classList.toggle('is-reel',!!reel);
  cursor.classList.toggle('is-link',!reel&&!inert&&!!target.closest('a,button,summary,[role="button"]'));
 }
 document.addEventListener('pointermove',e=>{
  if(!desktop.matches||e.pointerType==='touch'){hide();return}
  if(e.target.closest('input,textarea,[contenteditable="true"]')){hide();return}
  x=e.clientX;y=e.clientY;if(!visible){rx=x;ry=y;visible=true}
  cursor.classList.add('is-visible');document.documentElement.classList.add('portfolio-pointer');state(e.target);
  dot.style.transform=`translate3d(${x}px,${y}px,0)`;
  if(!frame)frame=requestAnimationFrame(draw);
 },{passive:true});
 document.addEventListener('pointerover',e=>{if(visible)state(e.target)},{passive:true});
 document.documentElement.addEventListener('pointerleave',hide);addEventListener('blur',hide);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)hide()});
 addEventListener('scroll',onScroll,{passive:true});
 const resize=new ResizeObserver(()=>{if(desktop.matches)measure()});targets.forEach(t=>resize.observe(t));
 addEventListener('resize',()=>{if(desktop.matches)measure()},{passive:true});
 desktop.addEventListener('change',()=>{hide();if(desktop.matches)measure()});
 reduce.addEventListener('change',()=>{if(visible&&!frame)frame=requestAnimationFrame(draw)});
 if(desktop.matches)measure();document.fonts.ready.then(()=>{if(desktop.matches)measure()});
})();

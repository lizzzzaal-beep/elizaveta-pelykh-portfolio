const packages = document.querySelector('#packages');
PORTFOLIO.packages.forEach(x => {
  packages.insertAdjacentHTML('beforeend', `<article class="package"><div class="pkg-title"><span>${x.n}</span><h3>${x.name}</h3>${x.tag ? `<b>${x.tag}</b>` : ''}</div><div class="price">${x.price}</div><div class="pkg-copy">${x.left.join('<br>')}</div><div class="pkg-copy right">${x.right.join('<br>')}</div></article>`);
});

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 700px)');
const targets = new Set();
function reveal(element, delay = 0, kind = '') {
  if (!element || element.closest('#jeyby, #jakub')) return;
  element.classList.add('motion-reveal');
  if (kind) element.classList.add(kind);
  element.style.setProperty('--motion-delay', `${delay}ms`);
  targets.add(element);
}
// Replace the prototype's parent reveals with independent editorial sequences.
document.querySelectorAll('.reveal').forEach(el => el.classList.remove('reveal'));
document.querySelectorAll('.center-head').forEach(head => {
  if (head.parentElement.id === 'work') return; // Reversible atmosphere bridge owns this heading.
  [...head.children].forEach((el, i) => reveal(el, i * 120));
});
document.querySelectorAll('.case-head').forEach(el => {
  if (el.parentElement.id !== 'high-protein') reveal(el);
});
document.querySelectorAll('.case-block').forEach(block => {
  reveal(block.querySelector('.label'));
  const media = [...block.querySelectorAll('.media')];
  media.forEach((el, i) => {
    if (el.closest('.carousel-row')) return;
    if (el.closest('[data-protein-reels-focus]')) { el.classList.add('in'); return; }
    // Existing media frames remain the animation units; no new wrappers or cards.
    const grid = el.closest('.grid');
    const columns = grid ? (mobile.matches ? 2 : grid.classList.contains('four') ? 4 : 3) : 1;
    reveal(el.closest('.media-item') || el, (i % columns) * 95, 'media-beat');
    el.classList.add('in');
    if (!grid) el.style.setProperty('--motion-x', i % 2 ? '10px' : '-10px');
  });
});
const beyond = document.querySelector('.text-columns');
[...beyond.children].forEach((el, i) => reveal(el, i % 2 ? 100 : 0));
reveal(document.querySelector('.about-grid h2'));
reveal(document.querySelector('.about-copy'), 180);
reveal(document.querySelector('.scope > div:first-child'));
document.querySelectorAll('.scope-grid span').forEach((el, i) => reveal(el, (i % 2) * 100));
document.querySelectorAll('.package').forEach(el => reveal(el));
document.querySelectorAll('.steps > div').forEach(el => reveal(el, 0, 'process-beat'));
document.querySelectorAll('.terms-grid > div').forEach(el => reveal(el, 0, 'quiet-beat'));
document.querySelectorAll('.contact-info > *').forEach((el, i) => reveal(el, Math.floor(i / 2) * 100 + (i % 2) * 50, 'quiet-beat'));

const observer = new IntersectionObserver(entries => {
  entries.forEach(({target, isIntersecting}) => {
    if (!isIntersecting) return;
    target.classList.add('is-visible');
    observer.unobserve(target);
  });
}, {threshold: 0.08, rootMargin: '0px 0px -3% 0px'});
targets.forEach(el => observer.observe(el));

const stage = document.querySelector('.gd-intro');
const grand = stage.querySelector('.grand');
const dessert = stage.querySelector('.dessert');
const depthItems = [...document.querySelectorAll('section:not(#jeyby):not(#jakub) .grid.four .media')];
let frame = 0;
let geometry;
const clamp = value => Math.max(0, Math.min(1, value));
function measure() {
  // Center a compact, two-line title inside the existing scene dimensions.
  // offset geometry is unaffected by the scrubbed transforms.
  const gap = mobile.matches ? 10 : 12;
  const height = grand.offsetHeight + dessert.offsetHeight + gap;
  const top = (stage.clientHeight - height) / 2;
  geometry = {
    gx: (stage.clientWidth - grand.offsetWidth) / 2 - grand.offsetLeft,
    gy: top - grand.offsetTop,
    dx: (stage.clientWidth - dessert.offsetWidth) / 2 - dessert.offsetLeft,
    dy: top + grand.offsetHeight + gap - dessert.offsetTop
  };
  schedule();
}
function update() {
  frame = 0;
  if (reduced.matches || !geometry) {
    grand.style.transform = dessert.style.transform = '';
    depthItems.forEach(el => el.style.translate = 'none');
    return;
  }
  depthItems.forEach((el, i) => {
    const box = el.parentElement.getBoundingClientRect();
    const phase = clamp((innerHeight - box.top) / (innerHeight + box.height));
    const depth = mobile.matches ? 0 : Math.sin(phase * Math.PI * 2) * (i % 2 ? 2 : 3);
    el.style.translate = `0 ${depth}px`;
  });
  const rect = stage.getBoundingClientRect();
  const progress = clamp((innerHeight * 0.85 - rect.top) / (innerHeight * 0.65 + rect.height * 0.25));
  const smooth = progress * progress * (3 - 2 * progress);
  // Coordinated rates converge on the same finished composition, in either direction.
  const second = smooth * (0.9 + 0.1 * smooth);
  grand.style.transform = `translate3d(${geometry.gx * smooth}px,${geometry.gy * smooth}px,0)`;
  dessert.style.transform = `translate3d(${geometry.dx * second}px,${geometry.dy * second}px,0)`;
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(update);
}
addEventListener('scroll', schedule, {passive: true});
addEventListener('resize', measure, {passive: true});
reduced.addEventListener('change', () => {
  if (reduced.matches) targets.forEach(el => el.classList.add('is-visible'));
  schedule();
});
measure();
document.fonts.ready.then(measure);
if (reduced.matches) targets.forEach(el => el.classList.add('is-visible'));



// Five-across carousels: scroll builds; focus explores only after assembly.
(() => {
  const rows=[...document.querySelectorAll('[data-carousel-assembly]')].map(el=>({el,slots:[...el.children]}));
  let pending=0;
  const smooth=t=>t*t*(3-2*t);
  function renderRows(){
    pending=0;
    rows.forEach(({el,slots})=>{
      const proteinAi=el.dataset.carouselAssembly==='protein-ai';
      const isAi=el.dataset.carouselAssembly==='ai'||proteinAi;
      const distance=isAi?Math.min(580,innerHeight*.62):Math.min(380,innerHeight*.48);
      const progress=reduced.matches?1:clamp((innerHeight*.94-el.getBoundingClientRect().top)/distance);
      const assembled=progress>=1;
      el.toggleAttribute('data-assembled',assembled);
      slots.forEach((slot,i)=>{
        const recipe=el.dataset.carouselAssembly==='recipe';
        const educational=el.dataset.carouselAssembly==='educational';
        const association=el.dataset.carouselAssembly==='associations'||recipe;
        const ai=el.dataset.carouselAssembly==='ai';
        const delay=proteinAi?[.22,.11,0,0,.11,.22][i]:association?(recipe?[0,.06,.13,.13,.06,0]:[0,.06,.13,.06,0])[i]:i*(ai?.07:educational?.06:.045);
        const t=smooth(clamp((progress-delay)/(1-delay)));
        const remaining=1-t, strength=mobile.matches?.55:1;
        const x=proteinAi?[-28,-16,-5,5,16,28][i]:association?(i-(slots.length-1)/2)*(recipe?16:12):ai?[-32,-12,0,12,32][i]:(educational?[-5,-3,-1,1,3,5]:[-4,-2,0,2,4])[i];
        const y=proteinAi?[24,-18,16,16,-18,24][i]:association?(recipe?[0,7,-8,-8,7,0]:[0,7,-8,7,0])[i]:ai?[28,-24,14,26,-28][i]:educational?[24,20,16,12,8,4][i]:[22,16,10,4,-6][i];
        const scale=proteinAi?1-[.035,.045,.065,.065,.045,.035][i]*remaining:ai?1-[.025,.02,.07,.025,.02][i]*remaining:association?1:1-.025*remaining;
        slot.style.transform=`translate3d(${x*remaining*strength}px,${y*remaining*strength}px,0) scale(${scale})`;
        slot.style.setProperty('--assembly-opacity', .32+t*.48);
        slot.classList.toggle('is-visible',assembled);
      });
    });
  }
  function queueRows(){if(!pending)pending=requestAnimationFrame(renderRows)}
  addEventListener('scroll',queueRows,{passive:true});addEventListener('resize',queueRows,{passive:true});
  reduced.addEventListener('change',queueRows);queueRows();
})();


// High Protein Reels: scrub each row in sequence; individual scale/translate remain pointer-owned.
(() => {
  const grid=document.querySelector('[data-protein-reels-focus]');
  if(!grid) return;
  const reels=[...grid.children];
  let pending=0;
  function renderReels(){
    pending=0;
    const top=grid.getBoundingClientRect().top;
    const columns=mobile.matches?2:3;
    const distance=Math.min(440,innerHeight*.46);
    reels.forEach((reel,i)=>{
      const rowStart=reels[Math.floor(i/columns)*columns];
      const rowTop=top+rowStart.offsetTop-reels[0].offsetTop;
      const progress=clamp((innerHeight*.94-rowTop)/distance);
      const delay=(i%columns)*.12;
      const t=reduced.matches?1:clamp((progress-delay)/(1-delay));
      const eased=t*t*(3-2*t), remaining=1-eased;
      const offset=[32,42,36,38,30,44][i]*(mobile.matches?.55:1);
      reel.style.transform=t===1?'none':`translate3d(0,${offset*remaining}px,0) scale(${1-.018*remaining})`;
      reel.style.opacity=.18+.82*eased;
    });
  }
  function queue(){if(!pending) pending=requestAnimationFrame(renderReels)}
  addEventListener('scroll',queue,{passive:true});
  addEventListener('resize',queue,{passive:true});
  reduced.addEventListener('change',queue);
  queue();
})();

/* Glueful Interviews — Authoritative presentation shell V3
 * Matches the approved wide Interviews reference while preserving existing actions/data.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V3__) return;
  window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V3__=true;

  const VIEW='view-interviews';
  const STYLE='glueful-interviews-authoritative-v3-style';
  const UI='glueful-interviews-reference-v3';

  function install(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style'); s.id=STYLE;
    s.textContent=`
      html,body{overflow-x:hidden!important}
      @media(min-width:1280px){
        body #${VIEW}{position:fixed!important;left:245px!important;right:0!important;top:0!important;bottom:0!important;width:auto!important;height:100vh!important;margin:0!important;padding:16px 44px 48px 64px!important;box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;transform:none!important;background:#f7f8fc!important}
        body #${VIEW}>*{box-sizing:border-box!important;width:100%!important;max-width:none!important;min-width:0!important;margin-left:0!important;margin-right:0!important;transform:none!important}
        body #${VIEW}>*>*{box-sizing:border-box!important;max-width:100%!important;min-width:0!important}
        body #${VIEW} .view-title,body #${VIEW} h1{margin-left:0!important}
        body #${VIEW} .interview-card,body #${VIEW} .interview-item,body #${VIEW} [class*="interview-card"],body #${VIEW} [class*="interview-item"],body #${VIEW} [class*="empty-state"],body #${VIEW} [class*="empty"]{min-width:0!important;max-width:100%!important;box-sizing:border-box!important}
      }
      @media(min-width:768px) and (max-width:1279px){body #${VIEW}{position:relative!important;left:0!important;width:calc(100vw - 260px)!important;min-height:100vh!important;margin:0!important;padding:26px 24px 36px!important;box-sizing:border-box!important;overflow-x:hidden!important;background:#f7f8fc!important}body #${VIEW}>*{width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;transform:none!important;box-sizing:border-box!important}}
      @media(max-width:767px){body #${VIEW}{position:relative!important;width:100%!important;min-height:100vh!important;margin:0!important;padding:84px 16px 32px!important;box-sizing:border-box!important;overflow-x:hidden!important;background:#f7f8fc!important}body #${VIEW}>*{width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;transform:none!important;box-sizing:border-box!important}}

      @media(min-width:1280px){
        body #${VIEW}{padding-top:16px!important}
        body #${VIEW} .${UI}-header{display:flex!important;align-items:center!important;justify-content:space-between!important;height:54px!important;margin:0 0 22px!important}
        body #${VIEW} .${UI}-brand{display:flex!important;align-items:center!important;gap:10px!important}
        body #${VIEW} .${UI}-brand img{width:38px!important;height:38px!important;border-radius:10px!important;object-fit:cover!important;box-shadow:0 3px 12px rgba(73,42,180,.22)!important}
        body #${VIEW} .${UI}-brand-name{font-size:20px!important;font-weight:760!important;color:#172033!important;line-height:1.05!important}
        body #${VIEW} .${UI}-date{font-size:11px!important;color:#7b8497!important;margin-top:3px!important}
        body #${VIEW} .${UI}-profile{width:38px!important;height:38px!important;border-radius:50%!important;border:0!important;background:#172033!important;color:#fff!important;display:grid!important;place-items:center!important;font-size:16px!important}
        body #${VIEW} .${UI}-hero{position:relative!important;margin:0!important;padding:0!important}
        body #${VIEW} .${UI}-hero-title{font-size:34px!important;line-height:1.08!important;font-weight:760!important;letter-spacing:-1px!important;color:#172033!important;margin:0!important}
        body #${VIEW} .${UI}-subtitle{font-size:15px!important;color:#66728a!important;margin-top:5px!important}
        body #${VIEW} .${UI}-top-add{position:absolute!important;right:0!important;top:0!important;height:46px!important;padding:0 20px!important;border:0!important;border-radius:12px!important;background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;color:#fff!important;font-weight:700!important;font-size:14px!important;cursor:pointer!important;box-shadow:0 7px 18px rgba(75,54,210,.18)!important}
        body #${VIEW} .${UI}-toolbar{display:flex!important;align-items:center!important;justify-content:space-between!important;margin-top:29px!important;margin-bottom:29px!important;gap:20px!important}
        body #${VIEW} .${UI}-tabs{display:flex!important;align-items:center!important;gap:8px!important}
        body #${VIEW} .${UI}-tab{height:42px!important;padding:0 18px!important;border:0!important;background:transparent!important;border-radius:10px!important;color:#1d2940!important;font-size:14px!important;font-weight:650!important;cursor:pointer!important}
        body #${VIEW} .${UI}-tab.active{background:#e9edff!important;color:#2865ef!important}
        body #${VIEW} .${UI}-tools{display:flex!important;align-items:center!important;gap:12px!important}
        body #${VIEW} .${UI}-search{width:310px!important;height:42px!important;border:1px solid #d7dce7!important;border-radius:10px!important;background:#fff!important;padding:0 14px 0 42px!important;font-size:14px!important;color:#172033!important;outline:none!important;box-shadow:0 1px 2px rgba(20,30,50,.03)!important}
        body #${VIEW} .${UI}-search-wrap{position:relative!important}
        body #${VIEW} .${UI}-search-icon{position:absolute!important;left:14px!important;top:10px!important;font-size:18px!important;color:#66728a!important;pointer-events:none!important}
        body #${VIEW} .${UI}-filter{height:42px!important;padding:0 17px!important;border:1px solid #cfd6e4!important;border-radius:10px!important;background:#fff!important;color:#172033!important;font-weight:650!important;font-size:14px!important;cursor:pointer!important}
        body #${VIEW} .${UI}-empty{height:305px!important;border:1px dashed #9aa3b4!important;border-radius:13px!important;background:rgba(255,255,255,.08)!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;box-sizing:border-box!important}
        body #${VIEW} .${UI}-empty-icon{font-size:38px!important;line-height:1!important;margin-bottom:17px!important}
        body #${VIEW} .${UI}-empty-title{font-size:21px!important;font-weight:500!important;color:#243047!important;margin:0!important}
        body #${VIEW} .${UI}-empty-copy{font-size:14px!important;color:#718098!important;margin:12px 0 16px!important}
        body #${VIEW} .${UI}-empty-add{height:46px!important;padding:0 20px!important;border:0!important;border-radius:11px!important;background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;color:#fff!important;font-size:14px!important;font-weight:700!important;cursor:pointer!important}
        body #${VIEW} .${UI}-hidden-legacy{display:none!important}
      }
      @media(max-width:1279px){body #${VIEW} .${UI}-header{display:none!important}.${UI}-toolbar{flex-wrap:wrap!important}.${UI}-search{max-width:100%!important}}
    `;
    document.head.appendChild(s);
  }

  function text(el){return (el&&el.textContent||'').replace(/\s+/g,' ').trim()}
  function findTitle(v){return v.querySelector('.view-title')||v.querySelector('h1')}
  function findEmpty(v){
    const all=v.querySelectorAll('*');
    for(const el of all){
      if(text(el)==='No interviews yet.'){
        let p=el;
        for(let i=0;i<6&&p&&p!==v;i++,p=p.parentElement){
          const cs=getComputedStyle(p);
          if(cs.borderStyle.includes('dashed')||/empty/i.test(p.className||'')) return p;
        }
      }
    }
    return null;
  }
  function findAdd(v){return Array.from(v.querySelectorAll('button')).find(b=>/add/i.test(text(b))&&!b.closest('.'+UI));}
  function makeButton(label,cls,action){const b=document.createElement('button');b.type='button';b.className=UI+'-'+cls;b.textContent='＋  '+label;b.addEventListener('click',action);return b}

  function build(){
    const v=document.getElementById(VIEW); if(!v||v.dataset.gfInterviewV3==='1') return;
    const title=findTitle(v), add=findAdd(v), empty=findEmpty(v); if(!title||!empty) return;
    v.dataset.gfInterviewV3='1';

    const subtitle=Array.from(v.querySelectorAll('p,div,span')).find(e=>/Never miss an interview/i.test(text(e)));
    const shell=document.createElement('div'); shell.className=UI+'-shell';
    const header=document.createElement('div'); header.className=UI+'-header';
    const brand=document.createElement('div'); brand.className=UI+'-brand';
    const sourceLogo=document.querySelector('#sidebar img, aside img, nav img, img');
    if(sourceLogo){const img=sourceLogo.cloneNode(true);brand.appendChild(img)}
    const bt=document.createElement('div'); const bn=document.createElement('div');bn.className=UI+'-brand-name';bn.textContent='Glueful';const dt=document.createElement('div');dt.className=UI+'-date';dt.textContent='Sunday, Sep 6';bt.append(bn,dt);brand.appendChild(bt);header.appendChild(brand);
    const prof=document.createElement('button');prof.className=UI+'-profile';prof.type='button';prof.textContent='♙';header.appendChild(prof);shell.appendChild(header);

    const hero=document.createElement('div');hero.className=UI+'-hero';
    const h=document.createElement('h1');h.className=UI+'-hero-title';h.textContent='Interviews';hero.appendChild(h);
    const sub=document.createElement('div');sub.className=UI+'-subtitle';sub.textContent='Never miss an interview';hero.appendChild(sub);
    const topAdd=makeButton('Add Interview', 'top-add', ()=>{if(add) add.click()});hero.appendChild(topAdd);shell.appendChild(hero);

    const toolbar=document.createElement('div');toolbar.className=UI+'-toolbar';
    const tabs=document.createElement('div');tabs.className=UI+'-tabs';
    ['All','Upcoming','Past','Today','This Week'].forEach((label,i)=>{const b=makeButton(label,'tab',()=>{tabs.querySelectorAll('.'+UI+'-tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');filterCards(label)});b.textContent=label;b.classList.toggle('active',i===0);tabs.appendChild(b)});
    const tools=document.createElement('div');tools.className=UI+'-tools';const sw=document.createElement('div');sw.className=UI+'-search-wrap';const si=document.createElement('span');si.className=UI+'-search-icon';si.textContent='⌕';const search=document.createElement('input');search.className=UI+'-search';search.placeholder='Search interviews...';search.addEventListener('input',()=>filterCards(activeTab(),search.value));sw.append(si,search);const filter=makeButton('Filter','filter',()=>{});tools.append(sw,filter);toolbar.append(tabs,tools);shell.appendChild(toolbar);

    const emptyUi=document.createElement('div');emptyUi.className=UI+'-empty';const icon=document.createElement('div');icon.className=UI+'-empty-icon';icon.textContent='▦';const et=document.createElement('div');et.className=UI+'-empty-title';et.textContent='No interviews yet.';const ec=document.createElement('div');ec.className=UI+'-empty-copy';ec.textContent='Add your first interview to keep track of your upcoming rounds.';const eb=makeButton('Add Interview','empty-add',()=>{if(add)add.click()});emptyUi.append(icon,et,ec,eb);shell.appendChild(emptyUi);

    title.style.setProperty('display','none','important'); if(subtitle) subtitle.style.setProperty('display','none','important');
    empty.style.setProperty('display','none','important'); if(add)add.style.setProperty('display','none','important');
    while(v.firstChild) v.removeChild(v.firstChild); v.appendChild(shell);
    function activeTab(){const a=tabs.querySelector('.active');return a?a.textContent:'All'}
    function filterCards(mode,q){
      const cards=document.querySelectorAll('#'+VIEW+' .interview-card,#'+VIEW+' .interview-item');
      let shown=0;cards.forEach(c=>{const ok=(!q||text(c).toLowerCase().includes((q||'').toLowerCase()));c.style.display=ok?'':'none';if(ok)shown++});emptyUi.style.display=shown?'none':'flex';
    }
  }

  function start(){install();build();[150,500,1000,1800].forEach(t=>setTimeout(build,t))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
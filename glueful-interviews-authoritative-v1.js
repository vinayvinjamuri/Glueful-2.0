/* Glueful Interviews — Authoritative presentation shell V6
 * Owns the Interviews presentation shell. Existing interview data/actions are preserved.
 */
(function(){
  'use strict';
  if(window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V6__) return;
  window.__GLUEFUL_INTERVIEWS_AUTHORITATIVE_V6__=true;

  const VIEW='view-interviews';
  const UI='glueful-interviews-reference-v6';
  const STYLE='glueful-interviews-authoritative-v6-style';

  function install(){
    if(document.getElementById(STYLE)) return;
    const s=document.createElement('style');
    s.id=STYLE;
    s.textContent=`
      html,body{overflow-x:hidden!important}

      @media(min-width:1280px){
        body #${VIEW}{
          position:fixed!important;
          left:245px!important;
          right:0!important;
          top:0!important;
          bottom:0!important;
          width:auto!important;
          height:100vh!important;
          min-height:100vh!important;
          margin:0!important;
          padding:16px 64px 48px 64px!important;
          box-sizing:border-box!important;
          overflow-x:hidden!important;
          overflow-y:auto!important;
          background:#f7f8fc!important;
        }
        body #${VIEW}>.${UI}-shell{
          display:block!important;
          width:100%!important;
          max-width:none!important;
          min-width:0!important;
          margin:0!important;
          padding:0!important;
          box-sizing:border-box!important;
        }
        body #${VIEW}>.${UI}-shell *{box-sizing:border-box!important}

        body #${VIEW} .${UI}-header{
          height:54px!important;
          width:100%!important;
          display:flex!important;
          align-items:center!important;
          justify-content:space-between!important;
          margin:0 0 34px!important;
        }
        body #${VIEW} .${UI}-brand{
          display:flex!important;
          align-items:center!important;
          gap:10px!important;
        }
        body #${VIEW} .${UI}-brand img{
          width:38px!important;
          height:38px!important;
          border-radius:10px!important;
          object-fit:cover!important;
          box-shadow:0 3px 12px rgba(73,42,180,.22)!important;
        }
        body #${VIEW} .${UI}-brand-name{
          font-size:20px!important;
          font-weight:760!important;
          line-height:1.05!important;
          color:#172033!important;
        }
        body #${VIEW} .${UI}-date{
          font-size:11px!important;
          line-height:1.2!important;
          color:#7b8497!important;
          margin-top:3px!important;
        }
        body #${VIEW} .${UI}-profile{
          width:38px!important;
          height:38px!important;
          border:0!important;
          border-radius:50%!important;
          background:#172033!important;
          color:#fff!important;
          display:grid!important;
          place-items:center!important;
          font-size:16px!important;
          cursor:pointer!important;
        }

        body #${VIEW} .${UI}-hero{
          position:relative!important;
          display:block!important;
          width:100%!important;
          margin:0!important;
          padding:0!important;
        }
        body #${VIEW} .${UI}-hero-title{
          display:block!important;
          margin:0!important;
          font-size:34px!important;
          line-height:1.08!important;
          font-weight:760!important;
          letter-spacing:-1px!important;
          color:#172033!important;
        }
        body #${VIEW} .${UI}-subtitle{
          display:block!important;
          margin:5px 0 0!important;
          font-size:15px!important;
          line-height:1.45!important;
          color:#66728a!important;
        }
        body #${VIEW} .${UI}-top-add{
          position:absolute!important;
          right:0!important;
          top:0!important;
          height:46px!important;
          padding:0 20px!important;
          border:0!important;
          border-radius:12px!important;
          background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;
          color:#fff!important;
          font-size:14px!important;
          font-weight:700!important;
          cursor:pointer!important;
          box-shadow:none!important;
        }

        body #${VIEW} .${UI}-toolbar{
          display:flex!important;
          align-items:center!important;
          justify-content:space-between!important;
          width:100%!important;
          min-height:42px!important;
          margin:29px 0 24px!important;
          padding:0!important;
          gap:20px!important;
        }
        body #${VIEW} .${UI}-tabs{
          display:flex!important;
          align-items:center!important;
          gap:8px!important;
          flex:0 0 auto!important;
        }
        body #${VIEW} .${UI}-tab{
          height:42px!important;
          padding:0 18px!important;
          border:0!important;
          border-radius:10px!important;
          background:transparent!important;
          color:#1d2940!important;
          font-size:14px!important;
          font-weight:650!important;
          white-space:nowrap!important;
          cursor:pointer!important;
        }
        body #${VIEW} .${UI}-tab.active{
          background:#e9edff!important;
          color:#2865ef!important;
        }
        body #${VIEW} .${UI}-tools{
          display:flex!important;
          align-items:center!important;
          gap:12px!important;
          margin-left:auto!important;
        }
        body #${VIEW} .${UI}-search-wrap{
          position:relative!important;
          width:310px!important;
          height:42px!important;
          flex:0 0 310px!important;
        }
        body #${VIEW} .${UI}-search-icon{
          position:absolute!important;
          left:14px!important;
          top:10px!important;
          z-index:2!important;
          color:#66728a!important;
          font-size:18px!important;
          line-height:22px!important;
          pointer-events:none!important;
        }
        body #${VIEW} .${UI}-search{
          display:block!important;
          width:310px!important;
          height:42px!important;
          margin:0!important;
          padding:0 14px 0 42px!important;
          border:1px solid #d7dce7!important;
          border-radius:10px!important;
          background:#fff!important;
          color:#172033!important;
          font-size:14px!important;
          outline:none!important;
        }
        body #${VIEW} .${UI}-filter{
          height:42px!important;
          padding:0 17px!important;
          border:1px solid #cfd6e4!important;
          border-radius:10px!important;
          background:#fff!important;
          color:#172033!important;
          font-size:14px!important;
          font-weight:650!important;
          white-space:nowrap!important;
          cursor:pointer!important;
        }

        body #${VIEW} .${UI}-empty{
          display:flex!important;
          flex-direction:column!important;
          align-items:center!important;
          justify-content:center!important;
          width:100%!important;
          height:305px!important;
          min-height:305px!important;
          margin:0!important;
          padding:20px!important;
          border:1px dashed #9aa3b4!important;
          border-radius:13px!important;
          background:transparent!important;
          text-align:center!important;
        }
        body #${VIEW} .${UI}-empty-icon{
          display:block!important;
          margin:0 0 17px!important;
          font-size:38px!important;
          line-height:1!important;
        }
        body #${VIEW} .${UI}-empty-title{
          display:block!important;
          margin:0!important;
          font-size:21px!important;
          line-height:1.25!important;
          font-weight:500!important;
          color:#243047!important;
        }
        body #${VIEW} .${UI}-empty-copy{
          display:block!important;
          margin:12px 0 16px!important;
          font-size:14px!important;
          line-height:1.45!important;
          color:#718098!important;
        }
        body #${VIEW} .${UI}-empty-add{
          display:inline-flex!important;
          align-items:center!important;
          justify-content:center!important;
          height:46px!important;
          padding:0 20px!important;
          border:0!important;
          border-radius:11px!important;
          background:linear-gradient(135deg,#6b38ee,#2f68ff)!important;
          color:#fff!important;
          font-size:14px!important;
          font-weight:700!important;
          cursor:pointer!important;
        }

        /* The old presentation must not participate in layout. */
        body #${VIEW} .${UI}-legacy-hidden{display:none!important}
        body #${VIEW} .glueful-interviews-reference-v4-legacy-hidden{display:none!important}
      }

      @media(max-width:1279px){
        body #${VIEW}{
          box-sizing:border-box!important;
          overflow-x:hidden!important;
        }
        body #${VIEW} .${UI}-shell{width:100%!important;max-width:none!important;}
        body #${VIEW} .${UI}-header{display:none!important;}
        body #${VIEW} .${UI}-toolbar{display:flex!important;flex-wrap:wrap!important;gap:12px!important;}
        body #${VIEW} .${UI}-tools{display:flex!important;max-width:100%!important;}
        body #${VIEW} .${UI}-search{max-width:100%!important;}
        body #${VIEW} .${UI}-empty{width:100%!important;min-height:280px!important;}
      }

      @media(max-width:767px){
        body #${VIEW} .${UI}-toolbar{align-items:stretch!important;}
        body #${VIEW} .${UI}-tabs{width:100%!important;overflow-x:auto!important;padding-bottom:2px!important;}
        body #${VIEW} .${UI}-tools{width:100%!important;}
        body #${VIEW} .${UI}-search-wrap,body #${VIEW} .${UI}-search{width:100%!important;flex:1 1 auto!important;}
      }
    `;
    document.head.appendChild(s);
  }

  function text(e){return(e&&e.textContent||'').replace(/\s+/g,' ').trim()}

  function findOriginalAdd(v){
    return Array.from(v.querySelectorAll('button')).find(function(b){
      return /add/i.test(text(b)) && !b.closest('.'+UI+'-shell');
    })||null;
  }

  function findLegacyTitle(v){
    return v.querySelector('.view-title')||v.querySelector('h1:not(.'+UI+'-hero-title)')||null;
  }

  function findLegacyEmpty(v){
    const exact=[];
    v.querySelectorAll('*').forEach(function(el){
      if(text(el)==='No interviews yet.') exact.push(el);
    });
    for(const el of exact){
      let p=el;
      for(let i=0;p&&p!==v&&i<10;i++,p=p.parentElement){
        const c=getComputedStyle(p);
        if(c.borderStyle.includes('dashed')||/empty/i.test(String(p.className||''))) return p;
      }
    }
    return exact[0]||null;
  }

  function findLegacySubtitle(v){
    return Array.from(v.querySelectorAll('p,div,span')).find(function(el){
      return /Never miss an interview/i.test(text(el)) && !el.closest('.'+UI+'-shell');
    })||null;
  }

  function hideLegacy(v){
    const title=findLegacyTitle(v);
    const subtitle=findLegacySubtitle(v);
    const empty=findLegacyEmpty(v);
    [title,subtitle,empty].forEach(function(el){
      if(el && !el.closest('.'+UI+'-shell')) el.classList.add(UI+'-legacy-hidden');
    });
    /* Hide legacy Add buttons individually, never their parent containers. */
    v.querySelectorAll('button').forEach(function(b){
      if(b.closest('.'+UI+'-shell')) return;
      if(/add/i.test(text(b))) b.classList.add(UI+'-legacy-hidden');
    });
  }

  function makeShell(v){
    const shell=document.createElement('section');
    shell.className=UI+'-shell';

    const header=document.createElement('div');
    header.className=UI+'-header';
    const brand=document.createElement('div');
    brand.className=UI+'-brand';
    const logo=document.querySelector('aside img,nav img');
    if(logo) brand.appendChild(logo.cloneNode(true));
    const bt=document.createElement('div');
    const now=new Date();
    const date=new Intl.DateTimeFormat(undefined,{weekday:'long',month:'short',day:'numeric'}).format(now);
    bt.innerHTML='<div class="'+UI+'-brand-name">Glueful</div><div class="'+UI+'-date">'+date+'</div>';
    brand.appendChild(bt);
    header.appendChild(brand);
    const profile=document.createElement('button');
    profile.type='button';
    profile.className=UI+'-profile';
    profile.textContent='♙';
    header.appendChild(profile);
    shell.appendChild(header);

    const hero=document.createElement('div');
    hero.className=UI+'-hero';
    const h=document.createElement('h1');
    h.className=UI+'-hero-title';
    h.textContent='Interviews';
    const sub=document.createElement('div');
    sub.className=UI+'-subtitle';
    sub.textContent='Never miss an interview';
    const top=document.createElement('button');
    top.type='button';
    top.className=UI+'-top-add';
    top.textContent='＋  Add Interview';
    top.addEventListener('click',function(){
      const original=findOriginalAdd(v);
      if(original) original.click();
    });
    hero.append(h,sub,top);
    shell.appendChild(hero);

    const toolbar=document.createElement('div');
    toolbar.className=UI+'-toolbar';
    const tabs=document.createElement('div');
    tabs.className=UI+'-tabs';
    ['All','Upcoming','Past','Today','This Week'].forEach(function(label,i){
      const b=document.createElement('button');
      b.type='button';
      b.className=UI+'-tab'+(i===0?' active':'');
      b.textContent=label;
      b.addEventListener('click',function(){
        tabs.querySelectorAll('.'+UI+'-tab').forEach(function(x){x.classList.remove('active')});
        b.classList.add('active');
      });
      tabs.appendChild(b);
    });
    const tools=document.createElement('div');
    tools.className=UI+'-tools';
    const sw=document.createElement('div');
    sw.className=UI+'-search-wrap';
    const si=document.createElement('span');
    si.className=UI+'-search-icon';
    si.textContent='⌕';
    const search=document.createElement('input');
    search.className=UI+'-search';
    search.type='search';
    search.placeholder='Search interviews...';
    sw.append(si,search);
    const filter=document.createElement('button');
    filter.type='button';
    filter.className=UI+'-filter';
    filter.textContent='▽  Filter';
    tools.append(sw,filter);
    toolbar.append(tabs,tools);
    shell.appendChild(toolbar);

    const empty=document.createElement('div');
    empty.className=UI+'-empty';
    const icon=document.createElement('div');
    icon.className=UI+'-empty-icon';
    icon.textContent='▦';
    const title=document.createElement('div');
    title.className=UI+'-empty-title';
    title.textContent='No interviews yet.';
    const copy=document.createElement('div');
    copy.className=UI+'-empty-copy';
    copy.textContent='Add your first interview to keep track of your upcoming rounds.';
    const add=document.createElement('button');
    add.type='button';
    add.className=UI+'-empty-add';
    add.textContent='＋  Add Interview';
    add.addEventListener('click',function(){
      const original=findOriginalAdd(v);
      if(original) original.click();
    });
    empty.append(icon,title,copy,add);
    shell.appendChild(empty);

    v.insertBefore(shell,v.firstChild||null);
    return shell;
  }

  function sync(){
    install();
    const v=document.getElementById(VIEW);
    if(!v) return;
    let shell=v.querySelector('.'+UI+'-shell');
    if(!shell) shell=makeShell(v);
    hideLegacy(v);

    if(window.innerWidth>=1280){
      const imp=function(el,p,val){el.style.setProperty(p,val,'important')};
      imp(v,'position','fixed');imp(v,'left','245px');imp(v,'right','0');imp(v,'top','0');imp(v,'bottom','0');imp(v,'width','auto');imp(v,'height','100vh');imp(v,'margin','0');imp(v,'padding','16px 64px 48px 64px');imp(v,'box-sizing','border-box');imp(v,'overflow-x','hidden');imp(v,'overflow-y','auto');
      imp(shell,'display','block');imp(shell,'width','100%');imp(shell,'max-width','none');imp(shell,'min-width','0');imp(shell,'margin','0');imp(shell,'padding','0');
    }
  }

  function start(){
    install();
    sync();
    [50,150,300,600,1000,1800,3000,5000].forEach(function(ms){setTimeout(sync,ms)});
    const obs=new MutationObserver(function(){
      if(!document.getElementById(VIEW)) return;
      sync();
    });
    obs.observe(document.body,{childList:true,subtree:true});
    window.addEventListener('resize',sync);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
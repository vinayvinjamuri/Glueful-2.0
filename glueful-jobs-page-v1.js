/* Glueful Jobs Page V1 — cursor pagination + background prefetch */
(function(){
  'use strict';
  if(window.__GLUEFUL_JOBS_PAGE_V1__) return;
  window.__GLUEFUL_JOBS_PAGE_V1__=true;
  const URL='https://xztbhheexianejsvwpva.supabase.co/rest/v1/rpc/search_jobs_page';
  const KEY=window.SUPABASE_KEY||'sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
  const PAGE=30;
  const state={next:null,prefetch:null,loading:false};
  async function getPage(cursor){
    const body={search_text:'',result_limit:PAGE};
    if(cursor){body.cursor_posted_at=cursor.posted_at;body.cursor_id=cursor.id}
    const r=await fetch(URL,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(!r.ok)throw Error(`jobs page ${r.status}`);return r.json();
  }
  function cursor(rows){if(!rows?.length)return null;const x=rows[rows.length-1];return x.posted_at&&x.id?{posted_at:x.posted_at,id:x.id}:null}
  async function prefetch(){if(state.prefetch||!state.next)return;state.prefetch=getPage(state.next).then(rows=>({rows,next:cursor(rows)})).catch(()=>null)}
  async function next(){if(state.loading||!state.next)return null;state.loading=true;try{const result=state.prefetch?await state.prefetch:await getPage(state.next);state.prefetch=null;if(result?.rows){state.next=result.next;prefetch();return result.rows}return null}finally{state.loading=false}}
  async function first(){const rows=await getPage(null);state.next=cursor(rows);prefetch();return rows}
  function attachInfiniteScroll(){
    const root=document.querySelector('#glueful-discover-root-v7');if(!root||root.__g8Infinite)return;root.__g8Infinite=true;
    const sentinel=document.createElement('div');sentinel.id='g8-jobs-sentinel';sentinel.style.cssText='height:1px;width:100%;margin-top:8px';root.appendChild(sentinel);
    const io=new IntersectionObserver(async entries=>{if(!entries.some(x=>x.isIntersecting))return;const rows=await next();if(!rows?.length)return;const rail=root.querySelector('#g7-curated .g7-rail');if(!rail)return;const existing=new Set([...root.querySelectorAll('.g7-card')].map(x=>String(x.dataset.id)));rows.forEach(j=>{if(existing.has(String(j.id)))return;const l=j.company_logo_url||'';const c=String(j.company||'Company');const card=document.createElement('article');card.className='g7-card';card.dataset.id=j.id;card.tabIndex=0;card.innerHTML=`<div class="g7-card-top"><div class="g7-logo">${l?`<img src="${l}" alt="${c} logo" loading="lazy">`:`<span>${(c[0]||'?').toUpperCase()}</span>`}</div><div class="g7-main"><div class="g7-title">${String(j.title||'Untitled role')}</div><div class="g7-company-name">${c}</div><div class="g7-meta">${j.location?'⌖ '+String(j.location):''}</div></div></div><div class="g7-foot"><span>More matches</span><button class="g7-open" type="button" data-open-id="${String(j.id)}">Open role →</button></div>`;rail.appendChild(card)});});
    io.observe(sentinel);state.sentinelObserver=io;
  }
  window.GluefulJobsPagination={first,next,prefetch,attachInfiniteScroll,get state(){return {...state}}};
  document.addEventListener('glueful:jobs-pagination-ready',attachInfiniteScroll,{once:false});
  const t=setInterval(()=>{if(document.querySelector('#glueful-discover-root-v7')){attachInfiniteScroll();clearInterval(t)}},250);
  setTimeout(()=>clearInterval(t),30000);
})();

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
    if(!r.ok)throw Error(`jobs page ${r.status}`);
    return await r.json();
  }

  function cursor(rows){
    if(!rows?.length)return null;
    const x=rows[rows.length-1];
    return x.posted_at&&x.id?{posted_at:x.posted_at,id:x.id}:null;
  }

  async function prefetch(){
    if(state.prefetch||!state.next)return;
    const c=state.next;
    state.prefetch=getPage(c).then(rows=>({rows,next:cursor(rows)})).catch(()=>null);
  }

  async function next(){
    if(state.loading||!state.next)return null;
    state.loading=true;
    try{
      const result=state.prefetch?await state.prefetch:await getPage(state.next);
      state.prefetch=null;
      if(result?.rows){state.next=result.next;prefetch();return result.rows}
      return null;
    }finally{state.loading=false}
  }

  async function first(){
    const rows=await getPage(null);
    state.next=cursor(rows);
    prefetch();
    return rows;
  }

  window.GluefulJobsPagination={first,next,prefetch,get state(){return {...state}}};
})();

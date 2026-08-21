/* Glueful Jobs Pagination V2 — safe cursor pages + prefetch */
(function(){'use strict';
if(window.__GLUEFUL_JOBS_PAGINATION_V2__)return;window.__GLUEFUL_JOBS_PAGINATION_V2__=true;
const URL='https://xztbhheexianejsvwpva.supabase.co/rest/v1/rpc/search_jobs_page';
const KEY=window.SUPABASE_KEY||'sb_publishable_91SKh77UlMjhwIcTimKyAg_Nbb_uVIN';
const PAGE=30;const state={cursor:null,next:null,loading:false,done:false};
async function request(cursor){const body={search_text:'',result_limit:PAGE};if(cursor){body.cursor_posted_at=cursor.posted_at;body.cursor_id=cursor.id}const r=await fetch(URL,{method:'POST',headers:{apikey:KEY,Authorization:`Bearer ${KEY}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error(`jobs page ${r.status}`);const rows=await r.json();const last=rows?.[rows.length-1];return{rows:Array.isArray(rows)?rows:[],cursor:last?.posted_at&&last?.id?{posted_at:last.posted_at,id:last.id}:null}}
function prefetch(){if(state.next||state.done)return;state.next=request(state.cursor).catch(e=>{console.debug('[Jobs pagination] prefetch',e);return null})}
async function first(){if(state.loading)return[];state.loading=true;try{const x=await request(null);state.cursor=x.cursor;state.done=x.rows.length<PAGE;prefetch();return x.rows}finally{state.loading=false}}
async function next(){if(state.loading||state.done)return[];state.loading=true;try{const x=state.next?await state.next:await request(state.cursor);state.next=null;if(!x?.rows?.length){state.done=true;return[]}state.cursor=x.cursor;state.done=x.rows.length<PAGE;prefetch();return x.rows}finally{state.loading=false}}
window.GluefulJobsPaginationV2={first,next,prefetch,get state(){return{cursor:state.cursor,loading:state.loading,done:state.done,prefetching:!!state.next}}};
})();
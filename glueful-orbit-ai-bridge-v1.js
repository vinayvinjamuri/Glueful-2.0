/* Glueful Orbit AI bridge v1 — connects the new Orbit surface to the existing Supabase Edge Function. */
(function(){
  'use strict';
  if(window.__GLUEFUL_ORBIT_AI_BRIDGE_V1__)return;
  window.__GLUEFUL_ORBIT_AI_BRIDGE_V1__=true;
  const KEY='glueful_orbit_conversation_v2:';
  const client=()=>window.supabaseClient||window.gluefulSupabaseClient||window.gluefulResumeSupabaseClient||null;
  const root=()=>document.getElementById('glueful-orbit-v2-root');
  function conversationKey(id){return KEY+(id||'general')}
  function getConversation(id){try{return localStorage.getItem(conversationKey(id))||null}catch(_){return null}}
  function setConversation(id,value){if(!value)return;try{localStorage.setItem(conversationKey(id),value)}catch(_){} }
  function append(r,role,text){
    const m=r?.querySelector('.orbit4-messages'); if(!m)return;
    const n=document.createElement('div'); n.className='orbit4-message '+(role==='user'?'user':'assistant'); n.textContent=String(text||''); m.appendChild(n); m.scrollTop=m.scrollHeight; return n;
  }
  async function ask(message,r,thinking){
    const c=client();
    if(!c?.functions?.invoke){thinking?.remove();append(r,'assistant','Orbit is not connected to the AI service yet.');return}
    const applicationId=r?.dataset?.orbitApplicationId||null;
    const job=window.__GLUEFUL_ORBIT_ACTIVE_JOB__||null;
    const conversationId=getConversation(applicationId);
    try{
      const {data,error}=await c.functions.invoke('orbit-ai',{body:{message:String(message||''),application_id:applicationId,conversation_id:conversationId,job:job||undefined}});
      if(error)throw error;
      thinking?.remove();
      if(!data?.ok)throw new Error(data?.error||'Orbit request failed');
      append(r,'assistant',data.answer||'I could not form an answer this time.');
      if(data.conversation_id)setConversation(applicationId,data.conversation_id);
    }catch(e){
      console.warn('[Orbit AI bridge] request failed',e);
      thinking?.remove();
      append(r,'assistant','I could not reach Orbit right now. Please try again.');
    }
  }
  window.__GLUEFUL_ORBIT_ASK__=ask;
})();
/* Glueful Resume Studio V53 bootstrap patch.
 *
 * This runs before the main app scripts. It keeps the existing V41 behavior
 * intact and fixes the browser-side rendering layer after DOCX/PDF import.
 *
 * Mammoth converts DOCX into semantic HTML rather than reproducing Word's
 * exact page layout. In particular, positioned/anchored images can arrive as
 * normal inline <img> elements. The old V41/V52 CSS then allowed the first
 * image to expand to the full content width, which is why the NIT logo became
 * enormous and the header collapsed.
 */
(function(){
  'use strict';

  /* Preserve the original V41 performance guard. */
  try{
    if(!window.__gluefulV41BodyObserverGuard){
      const NativeObserve = MutationObserver.prototype.observe;
      MutationObserver.prototype.observe = function(target, options){
        if(target === document.body && options && options.childList && options.subtree){
          return;
        }
        return NativeObserve.call(this, target, options);
      };
      window.__gluefulV41BodyObserverGuard = true;
    }
  }catch(error){
    console.warn('[Glueful Resume Studio V41] bootstrap guard failed:', error);
  }

  const STYLE_ID = 'glueful-resume-studio-v53-fix';
  const EDITOR_ID = 'job-resume-editor-text';
  let editorObserver = null;
  let normalizeQueued = false;

  function installV53Styles(){
    if(document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #job-resume-editor-modal .job-resume-editor-scroll{
        overflow:auto!important;
        align-items:flex-start!important;
        justify-content:flex-start!important;
        padding:20px 24px 40px!important;
        box-sizing:border-box!important;
      }

      #job-resume-editor-modal #job-resume-editor-text{
        flex:0 0 794px!important;
        width:794px!important;
        min-width:794px!important;
        max-width:794px!important;
        min-height:1123px!important;
        box-sizing:border-box!important;
        margin:0 auto!important;
        padding:58px 58px 64px!important;
        background:#fff!important;
        color:#202124!important;
        border:1px solid #d8dce4!important;
        border-radius:2px!important;
        box-shadow:0 12px 34px rgba(15,23,42,.18)!important;
        overflow:visible!important;
        text-align:left!important;
        word-break:normal!important;
        overflow-wrap:break-word!important;
        font-family:"Times New Roman",Times,serif!important;
        font-size:11pt!important;
        line-height:1.18!important;
      }

      #job-resume-editor-modal #job-resume-editor-text p{
        margin:0 0 7px!important;
        padding:0!important;
      }

      #job-resume-editor-modal #job-resume-editor-text h1,
      #job-resume-editor-modal #job-resume-editor-text h2,
      #job-resume-editor-modal #job-resume-editor-text h3{
        line-height:1.12!important;
        margin-top:12px!important;
        margin-bottom:7px!important;
      }

      #job-resume-editor-modal #job-resume-editor-text img{
        max-width:100%!important;
        height:auto!important;
        object-fit:contain!important;
        vertical-align:top!important;
      }

      #job-resume-editor-modal #job-resume-editor-text > p.glueful-import-header img,
      #job-resume-editor-modal #job-resume-editor-text > div.glueful-import-header img,
      #job-resume-editor-modal #job-resume-editor-text > table.glueful-import-header img{
        width:82px!important;
        height:82px!important;
        max-width:82px!important;
        min-width:82px!important;
        object-fit:contain!important;
        flex:0 0 82px!important;
      }

      #job-resume-editor-modal #job-resume-editor-text > p.glueful-import-header,
      #job-resume-editor-modal #job-resume-editor-text > div.glueful-import-header{
        display:flex!important;
        align-items:flex-start!important;
        gap:14px!important;
        margin-bottom:12px!important;
      }

      #job-resume-editor-modal #job-resume-editor-text > p.glueful-import-header > img,
      #job-resume-editor-modal #job-resume-editor-text > div.glueful-import-header > img{
        display:block!important;
        flex:0 0 82px!important;
      }

      #job-resume-editor-modal #job-resume-editor-text .glueful-import-header-text{
        min-width:0!important;
        flex:1 1 auto!important;
      }

      #job-resume-editor-modal #job-resume-editor-text table{
        max-width:100%!important;
        border-collapse:collapse!important;
      }

      #job-resume-editor-modal #job-resume-editor-text td,
      #job-resume-editor-modal #job-resume-editor-text th{
        vertical-align:top!important;
      }

      @media(max-width:900px){
        #job-resume-editor-modal .job-resume-editor-scroll{
          align-items:flex-start!important;
          justify-content:flex-start!important;
          padding:12px 12px 150px!important;
        }
        #job-resume-editor-modal #job-resume-editor-text{
          margin-left:0!important;
          margin-right:0!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function markHeaderImage(editor){
    const images=Array.from(editor.querySelectorAll('img'));
    if(!images.length) return;

    const first=images[0];
    const parent=first.closest('p,div,td');
    if(!parent) return;

    const topLevel=parent.parentElement===editor;
    if(!topLevel) return;

    parent.classList.add('glueful-import-header');

    if(parent.tagName==='P'&&!parent.querySelector('.glueful-import-header-text')){
      const textNodes=[];
      Array.from(parent.childNodes).forEach(node=>{
        if(node===first) return;
        if(node.nodeType===Node.TEXT_NODE&&node.nodeValue.trim()) textNodes.push(node);
        else if(node.nodeType===Node.ELEMENT_NODE&&node.tagName.toLowerCase()!=='img') textNodes.push(node);
      });

      if(textNodes.length){
        const wrapper=document.createElement('span');
        wrapper.className='glueful-import-header-text';
        const firstTextNode=textNodes[0];
        parent.insertBefore(wrapper,firstTextNode);
        textNodes.forEach(node=>wrapper.appendChild(node));
      }
    }
  }

  function normalizeImportedResume(){
    const editor=document.getElementById(EDITOR_ID);
    if(!editor||!editor.innerHTML.trim()) return;

    markHeaderImage(editor);

    const firstImage=editor.querySelector('img');
    if(firstImage){
      firstImage.removeAttribute('width');
      firstImage.removeAttribute('height');
    }
  }

  function queueNormalize(){
    if(normalizeQueued) return;
    normalizeQueued=true;
    requestAnimationFrame(()=>{
      normalizeQueued=false;
      normalizeImportedResume();
    });
  }

  function attachEditorObserver(){
    const editor=document.getElementById(EDITOR_ID);
    if(!editor) return false;
    if(editorObserver) return true;

    editorObserver=new MutationObserver(()=>queueNormalize());
    editorObserver.observe(editor,{childList:true,subtree:true});
    queueNormalize();
    return true;
  }

  function boot(){
    installV53Styles();
    if(!attachEditorObserver()){
      const timer=setInterval(()=>{
        if(attachEditorObserver()) clearInterval(timer);
      },250);
      setTimeout(()=>clearInterval(timer),30000);
    }
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }
})();

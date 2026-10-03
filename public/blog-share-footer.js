(() => {
  function init() {
    const article = document.querySelector('#truth-blog-article') || document.querySelector('article');
    if (!article || article.querySelector('.truth-share-icons')) return;
    const url = document.querySelector('link[rel="canonical"]')?.href || location.href;
    const title = article.querySelector('h1')?.textContent.trim() || document.title;
    article.querySelectorAll('.truth-share-footer').forEach(el => el.remove());
    const svg = paths => `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${paths}</svg>`;
    const icons = [
      svg('<path fill="currentColor" d="M14 22v-9h3l.5-4H14V7c0-1.2.3-2 2-2h2V1.4C17.4 1.2 16.3 1 15 1c-3 0-5 1.8-5 5v3H7v4h3v9z"/>'),
      svg('<rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="m3 5 9 7 9-7" fill="none" stroke="currentColor" stroke-width="1.7"/>'),
      svg('<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="m9 15 6-6M9 7l2-2a5 5 0 0 1 7 7l-2 2M8 10l-2 2a5 5 0 0 0 7 7l2-2"/></g>')
    ];
    const labels = ['Chia sẻ qua Facebook', 'Chia sẻ qua email', 'Sao chép liên kết'];
    function group(bottom) {
      const wrapper = document.createElement('div');
      wrapper.className = 'truth-share-icons' + (bottom ? ' truth-share-icons-bottom' : '');
      wrapper.setAttribute('role', 'group');
      wrapper.setAttribute('aria-label', 'Chia sẻ bài viết');
      if (bottom) { const heading = document.createElement('span'); heading.className='truth-share-label'; heading.textContent='Chia sẻ bài viết'; wrapper.append(heading); }
      const status = document.createElement('span'); status.className='truth-share-status'; status.setAttribute('role','status');
      labels.forEach((label, i) => {
        const button = document.createElement('button'); button.type='button'; button.title=label; button.setAttribute('aria-label',label); button.innerHTML=icons[i];
        button.addEventListener('click', async () => {
          if(i===0) { window.open('https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url), '_blank', 'noopener,noreferrer,width=640,height=600'); return; }
          if(i===1) { location.href='mailto:?subject='+encodeURIComponent(title)+'&body='+encodeURIComponent(url); return; }
          try { await navigator.clipboard.writeText(url); status.textContent='Đã sao chép liên kết'; }
          catch { window.prompt('Sao chép liên kết bài viết:', url); }
        }); wrapper.append(button);
      }); wrapper.append(status); return wrapper;
    }
    const heading = article.querySelector('.title') || article.querySelector('h1')?.parentElement;
    if (heading) heading.append(group(false));
    const body = article.querySelector('#truth-blog-body');
    if (body) body.insertAdjacentElement('afterend',group(true)); else article.append(group(true));
    const style=document.createElement('style');
    style.textContent=`.truth-share-icons{display:flex;align-items:center;flex-wrap:wrap;gap:10px;margin-top:18px;text-align:left;color:inherit;line-height:1.4}.truth-share-icons button{display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;padding:0;background:transparent;border:0;border-radius:8px;color:inherit;opacity:.7;cursor:pointer}.truth-share-icons button:hover{opacity:1;background:#8881}.truth-share-icons button:focus-visible{outline:2px solid #0071e3;outline-offset:2px}.truth-share-icons svg{display:block}.truth-share-icons-bottom{margin-top:32px;padding-top:20px;border-top:1px solid #8883}.truth-share-label{flex-basis:100%;font-size:14px;font-weight:600}.truth-share-status{font-size:12px;opacity:.7}`;
    document.head.append(style);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();

(() => {
  function arrangeShareButtons() {
    const article = document.querySelector('#truth-blog-article') || document.querySelector('article');
    if (!article) return;
    const labels = ['Chia sẻ', 'Sao chép liên kết', 'Gửi email'];
    let controls = [...article.querySelectorAll('button, a')].filter(el => labels.some(label => el.textContent.trim().startsWith(label)));
    if (controls.length < 2) {
      controls = labels.map((label, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        button.addEventListener('click', async () => {
          const url = document.querySelector('link[rel="canonical"]')?.href || location.href;
          const title = article.querySelector('h1')?.textContent.trim() || document.title;
          try {
            if (index === 2) { location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`; return; }
            if (index === 0 && navigator.share) { await navigator.share({title, url}); return; }
            if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(url); button.textContent = 'Đã sao chép'; setTimeout(() => { button.textContent = label; }, 1800); }
            else window.prompt('Sao chép liên kết:', url);
          } catch (error) { if (error.name !== 'AbortError') window.prompt('Sao chép liên kết:', url); }
        });
        return button;
      });
    }
    const footer = document.createElement('div');
    footer.className = 'truth-share-footer';
    footer.setAttribute('role', 'group');
    footer.setAttribute('aria-label', 'Chia sẻ bài viết');
    const parents = new Set(controls.map(el => el.parentElement));
    controls.forEach(el => footer.append(el));
    parents.forEach(el => { if (!el.textContent.trim() && !el.querySelector('img, video, iframe')) el.remove(); });
    article.append(footer);
    const style = document.createElement('style');
    style.textContent = `.truth-share-footer{max-width:720px;margin:24px auto 0;padding:16px 0;display:flex;flex-wrap:wrap;gap:8px;border-top:1px solid #8883;box-sizing:border-box}.truth-share-footer button,.truth-share-footer a{font:inherit!important;font-size:12px!important;line-height:1.4!important;padding:7px 11px!important;min-height:0!important;border:1px solid #8884!important;border-radius:999px!important;background:transparent!important;color:inherit!important;text-decoration:none!important;box-shadow:none!important;cursor:pointer}.truth-share-footer button:hover,.truth-share-footer a:hover{background:#8881!important}.truth-share-footer button:focus-visible,.truth-share-footer a:focus-visible{outline:2px solid #1677ff;outline-offset:2px}@media(max-width:760px){.truth-share-footer{margin-left:16px;margin-right:16px}}`;
    document.head.append(style);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrangeShareButtons, {once:true});
  else arrangeShareButtons();
})();

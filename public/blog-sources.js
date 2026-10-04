(() => {
  function styleSources() {
    const body = document.getElementById('truth-blog-body');
    if (!body) return;
    const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase().replace(/[:：]/g, '').trim();
    body.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach(heading => {
      if (!['nguon', 'nguon tham khao', 'tai lieu tham khao'].includes(normalize(heading.textContent || ''))) return;
      heading.classList.add('truth-sources-heading');
      let next = heading.nextElementSibling;
      while (next && !/^H[1-6]$/.test(next.tagName)) {
        next.classList.add('truth-source-entry');
        next = next.nextElementSibling;
      }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', styleSources, {once:true});
  else styleSources();
  document.addEventListener('astro:page-load', styleSources);
})();

(function () {
  const body = document.getElementById('truth-blog-body');
  if (!body || body.dataset.navigationReady) return;
  body.dataset.navigationReady = 'true';
  const headings = Array.from(body.querySelectorAll('h1,h2,h3,h4,h5,h6')).filter(h => !h.closest('.photo-gallery') && !/^(nguồn|nguồn tham khảo|sources)\s*:?$/i.test(h.textContent.trim()));
  if (!headings.length) return;
  const used = new Set(Array.from(document.querySelectorAll('[id]'), n => n.id));
  for (const heading of headings) {
    if (heading.id) continue;
    const base = heading.textContent.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'muc';
    let id = base, index = 2;
    while (used.has(id)) id = base + '-' + index++;
    heading.id = id;
    used.add(id);
  }
  const top = headings.filter(h => h.parentElement === body);
  // H1–H3 can collapse, H4–H6 remain regular headings inside their section.
  // Process in document order so H2/H3 sections nest inside their parents.
  for (const heading of top.filter(h => Number(h.tagName[1]) <= 3)) {
    const level = Number(heading.tagName[1]);
    const details = document.createElement('details');
    details.className = 'article-section';
    details.open = true;
    const summary = document.createElement('summary');
    heading.before(details);
    details.append(summary);
    summary.append(heading);
    let next = details.nextSibling;
    while (next) {
      if (next.nodeType === 1 && /^H[1-6]$/.test(next.tagName) && Number(next.tagName[1]) <= level) break;
      const move = next;
      next = next.nextSibling;
      details.append(move);
    }
  }
  const toc = document.createElement('details');
  toc.className = 'article-toc';
  toc.open = true;
  const label = document.createElement('summary');
  label.textContent = 'Xem nhanh';
  toc.append(label);
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Mục lục bài viết');
  const list = document.createElement('ul');
  headings.forEach(h => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    link.href = '#' + encodeURIComponent(h.id);
    link.textContent = h.textContent;
    li.append(link);
    list.append(li);
  });
  nav.append(list);
  toc.append(nav);
  body.prepend(toc);
  function reveal(id) {
    const target = document.getElementById(id);
    if (!target || !body.contains(target)) return;
    let parent = target.parentElement;
    while (parent && parent !== body) {
      if (parent.tagName === 'DETAILS') parent.open = true;
      parent = parent.parentElement;
    }
    return target;
  }
  toc.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const target = reveal(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault();
    history.replaceState(history.state, '', link.hash);
    target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block:'start'});
    target.setAttribute('tabindex', '-1');
    target.focus({preventScroll:true});
  });
  function fromHash() {
    try { const target = reveal(decodeURIComponent(location.hash.slice(1))); if (target) target.scrollIntoView({block:'start'}); } catch {}
  }
  window.addEventListener('hashchange', fromHash);
  if (location.hash) requestAnimationFrame(fromHash);
})();

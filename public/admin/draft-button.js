(async function () {
  // Only delegate to Decap's own Save action in editorial workflow.
  // Never call Publish, change status, or write to GitHub directly.
  let config;
  try { const response = await fetch('/admin/config.yml', {cache:'no-store'}); if (!response.ok) return; config = await response.text(); } catch { return; }
  if (!/^publish_mode:\s*editorial_workflow\s*$/m.test(config)) return;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Lưu nháp';
  button.title = 'Lưu bằng Decap lên GitHub, chờ thông báo lưu thành công trước khi thoát';
  button.hidden = true;
  button.setAttribute('data-truth-draft-save','');
  document.body.append(button);
  const visible = element => element.getClientRects().length > 0;
  const name = element => (element.textContent || element.getAttribute('aria-label') || '').trim().replace(/\s+/g,' ');
  function nativeSave() {
    return Array.from(document.querySelectorAll('button')).find(element => element !== button && visible(element) && /^(Save|Save draft|Save Draft|Lưu|Lưu nháp|Lưu bản nháp|Lưu bản thảo)$/i.test(name(element)));
  }
  button.addEventListener('click', () => { const save = nativeSave(); if (save && !save.disabled && save.getAttribute('aria-disabled') !== 'true') save.click(); });
  function update() {
    const save = nativeSave();
    if (!save) { if (!button.hidden) button.hidden = true; return; }
    const publish = Array.from(document.querySelectorAll('button')).find(element => element !== button && visible(element) && /^(Publish|Xuất bản)(?:\s|$)/i.test(name(element)));
    const rect = (publish || save).getBoundingClientRect();
    const width = Math.max(110, Math.min(160, rect.width));
    const left = Math.max(8, Math.min(innerWidth - width - 8, rect.left));
    const top = Math.max(8, Math.min(innerHeight - 50, rect.bottom + 8));
    const style = `position:fixed;z-index:1000;left:${left}px;top:${top}px;width:${width}px;min-height:36px;padding:8px 12px;border:1px solid #b7bbc2;border-radius:5px;background:#fff;color:#242a31;font:600 14px system-ui;cursor:pointer;box-shadow:0 2px 6px #0001;`;
    if (button.style.cssText !== style) {
      // Browsers normalize cssText, compare the requested value separately.
      if (button.dataset.position !== style) { button.style.cssText = style; button.dataset.position = style; }
    }
    const disabled = save.disabled || save.getAttribute('aria-disabled') === 'true';
    if (button.disabled !== disabled) button.disabled = disabled;
    if (button.hidden) button.hidden = false;
  }
  let frame;
  const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = null; update(); }); };
  new MutationObserver(schedule).observe(document.body, {childList:true,subtree:true,attributes:true,attributeFilter:['disabled','aria-disabled','hidden','style']});
  addEventListener('resize',schedule);
  addEventListener('scroll',schedule,true);
  update();
})();

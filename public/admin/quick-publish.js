/* Keep Decap's GitHub workflow and delegate all writes to its own controls. */
(function () {
  'use strict';
  document.querySelectorAll('[data-truth-draft-save]').forEach(node => node.remove());
  const normalize = node => (node.textContent || node.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ');
  const visible = node => node.getClientRects().length > 0;
  const enabled = node => node && !node.disabled && node.getAttribute('aria-disabled') !== 'true';
  let busy = false;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Publish now';
  button.dataset.truthQuickPublish = '';
  button.style.cssText = 'padding:10px 16px;border:0;border-radius:4px;background:#167d92;color:white;font:600 14px system-ui;cursor:pointer;margin-left:8px';
  const controls = () => Array.from(document.querySelectorAll('button,[role="menuitem"]')).filter(node => node !== button && visible(node));
  const find = expression => controls().find(node => expression.test(normalize(node)));
  const save = () => find(/^(Save|Save draft)$/i);
  const status = () => find(/^(?:Status:\s*)?(Draft|In review|Ready|Published)$/i);
  const publish = () => find(/^Publish$/i);
  const delay = () => new Promise(resolve => setTimeout(resolve, 150));
  async function waitFor(read, message) {
    const end = Date.now() + 60000;
    while (Date.now() < end) {
      const value = read();
      if (value) return value;
      await delay();
    }
    throw new Error(message);
  }
  async function publishEntry() {
    if (busy) return;
    busy = true;
    button.disabled = true;
    try {
      const nativeSave = save();
      if (!nativeSave) throw new Error('Không tìm thấy trình biên tập.');
      if (enabled(nativeSave)) {
        button.textContent = 'Saving…';
        nativeSave.click();
        await waitFor(() => /changes saved/i.test(document.body.textContent || '') && save() && !enabled(save()), 'Chưa xác nhận lưu thành công. Kiểm tra lỗi ở các trường hoặc kết nối mạng, rồi thử lại.');
      }
      // Publish can be enabled in Draft, but Decap still rejects publishing until Ready.
      let nativePublish;
      {
        button.textContent = 'Preparing…';
        const nativeStatus = await waitFor(() => enabled(status()) && status(), 'Không tìm thấy trạng thái bài viết.');
        if (!/^(?:Status:\s*)?Ready$/i.test(normalize(nativeStatus))) {
          nativeStatus.click();
          const ready = await waitFor(() => { const node = find(/^Ready$/i); return enabled(node) && node; }, 'Không tìm thấy lựa chọn Ready. Bài đã lưu, hãy kiểm tra quyền xuất bản.');
          ready.click();
          await waitFor(() => status() && /^(?:Status:\s*)?Ready$/i.test(normalize(status())), 'Chưa xác nhận chuyển trạng thái Ready. Bài vẫn được lưu nháp.');
        }
        nativePublish = await waitFor(() => enabled(publish()) && publish(), 'Bài đã lưu nhưng chưa thể xuất bản. Kiểm tra quyền xuất bản hoặc trạng thái bài.');
      }
      button.textContent = 'Publishing…';
      nativePublish.click();
      const now = await waitFor(() => { const node = find(/^Publish now$/i); return enabled(node) && node; }, 'Không tìm thấy Publish now. Bài đã lưu, hãy dùng menu Publish của Decap.');
      now.click();
      await waitFor(() => !save() || (status() && /^Published$/i.test(normalize(status()))), 'Chưa xác nhận xuất bản thành công. Kiểm tra thông báo của Decap trước khi thử lại.');
      // Success and failure remain visible in Decap, never invent a success notice.
    } catch (error) {
      window.alert(error.message);
    } finally {
      busy = false;
      button.disabled = false;
      button.textContent = 'Publish now';
      update();
    }
  }
  button.addEventListener('click', publishEntry);
  function update() {
    document.querySelectorAll('[data-truth-draft-save]').forEach(node => node.remove());
    const nativeSave = save();
    if (!nativeSave) { if (!busy) button.remove(); return; }
    if (!busy) button.disabled = !enabled(nativeSave) && !!status() && /^(?:Status:\s*)?Published$/i.test(normalize(status()));
    const parent = nativeSave.parentElement;
    if (button.parentElement !== parent) parent.appendChild(button);
  }
  new MutationObserver(update).observe(document.body, {childList:true, subtree:true});
  update();
})();

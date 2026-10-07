
function initPhotoGalleries() {
    document.querySelectorAll             ('[data-photo-gallery]').forEach(gallery => {
        if (gallery.dataset.ready) return;
        let template = gallery.querySelector('template');
        if (!template) { template = document.createElement('template'); template.innerHTML = "<dialog class=\"gallery-viewer\" aria-label=\"Xem ảnh lớn\">\r\n        <div class=\"viewer-content\">\r\n            <button type=\"button\" class=\"viewer-close\" aria-label=\"Đóng ảnh\">×</button>\r\n            <img class=\"viewer-image\" alt=\"\" />\r\n            <p class=\"viewer-caption\"></p>\r\n            <p class=\"viewer-error\" role=\"status\" hidden>Không tải được ảnh, vui lòng thử ảnh khác hoặc mở đường dẫn gốc.</p>\r\n            <div class=\"viewer-controls\">\r\n                <button type=\"button\" class=\"viewer-prev\" aria-label=\"Ảnh trước\">‹</button>\r\n                <span class=\"viewer-counter\" aria-live=\"polite\"></span>\r\n                <button type=\"button\" class=\"viewer-next\" aria-label=\"Ảnh tiếp theo\">›</button>\r\n            </div>\r\n        </div>\r\n    </dialog>"; }
        const dialog = template?.content.querySelector                   ('dialog')?.cloneNode(true)                                 ;
        if (!dialog || typeof dialog.showModal !== 'function') return;
        gallery.append(dialog);
        gallery.dataset.ready = 'true';
        const links = Array.from(gallery.querySelectorAll                   ('[data-gallery-photo]'));
        const image = dialog.querySelector                  ('.viewer-image') ;
        const caption = dialog.querySelector             ('.viewer-caption') ;
        const counter = dialog.querySelector             ('.viewer-counter') ;
        const error = dialog.querySelector             ('.viewer-error') ;
        const previous = dialog.querySelector                   ('.viewer-prev') ;
        const next = dialog.querySelector                   ('.viewer-next') ;
        let current = 0, opener                               ;
        let scrollY = 0, originalStyle                = null;
        function show(index        ) {
            current = (index + links.length) % links.length;
            const thumb = links[current].querySelector('img') ;
            error.hidden = true;
            image.alt = thumb.alt;
            image.src = links[current].href;
            caption.textContent = links[current].closest('figure')?.querySelector('figcaption')?.textContent || '';
            counter.textContent = `${current + 1} / ${links.length}`;
            previous.disabled = next.disabled = links.length < 2;
        }
        image.addEventListener('error', () => { error.hidden = false; });
        links.forEach((link, index) => link.addEventListener('click', event => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            opener = link;
            show(index);
            scrollY = window.scrollY;
            originalStyle = document.body.getAttribute('style');
            dialog.showModal();
            Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, width: '100%', overflow: 'hidden' });
        }));
        dialog.querySelector('.viewer-close') .addEventListener('click', () => dialog.close());
        previous.addEventListener('click', () => show(current - 1));
        next.addEventListener('click', () => show(current + 1));
        dialog.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1)); } });
        dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
        dialog.addEventListener('close', () => {
            if (originalStyle === null) document.body.removeAttribute('style'); else document.body.setAttribute('style', originalStyle);
            window.scrollTo({ top: scrollY, behavior: 'instant' });
            opener?.focus({ preventScroll: true });
        });
    });
}
initPhotoGalleries();
document.addEventListener('astro:page-load', initPhotoGalleries);

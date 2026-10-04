/* A restrained entrance for media, without hiding content or hijacking scrolling. */
(() => {
    'use strict';
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!('IntersectionObserver' in window) || preference.matches) return;
    const seen = new WeakSet();
    const candidates = '.posts .card, #truth-blog-article figure, #truth-blog-body > p > img, .article-content figure, .article-content p > img, .iphone-card, .detail-hero';
    const animations = new Set();
    const intersection = new IntersectionObserver(entries => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            intersection.unobserve(entry.target);
            if (preference.matches || !entry.target.animate) continue;
            const animation = entry.target.animate([
                {opacity:.88,transform:'translateY(12px)'},
                {opacity:1,transform:'translateY(0)'}
            ], {duration:380,easing:'cubic-bezier(.22,.61,.36,1)'});
            animations.add(animation);
            animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
        }
    }, {threshold:.08});
    function register(root) {
        const elements = [...(root.matches?.(candidates) ? [root] : []), ...root.querySelectorAll(candidates)];
        for (const element of elements) {
            if (seen.has(element)) continue;
            seen.add(element);
            const rect = element.getBoundingClientRect();
            // The initial viewport remains still; only later media gets an entrance.
            if (rect.height && rect.bottom>0 && rect.top<window.innerHeight) continue;
            intersection.observe(element);
        }
    }
    function init() {
        register(document);
        const changes = new MutationObserver(records => {
            for (const record of records) {
                for (const removed of record.removedNodes) {
                    if (removed.nodeType !== 1) continue;
                    intersection.unobserve(removed);
                    removed.querySelectorAll(candidates).forEach(el => intersection.unobserve(el));
                }
                for (const added of record.addedNodes) if (added.nodeType===1) register(added);
            }
        });
        changes.observe(document.body,{childList:true,subtree:true});
        preference.addEventListener?.('change', event => {
            if (event.matches) {
                intersection.disconnect();
                animations.forEach(animation => animation.cancel());
            }
        });
    }
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
    else init();
})();

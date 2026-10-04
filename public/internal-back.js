/* Internal Back for Truth: browser history represents tabs, readers and phone views. */
(() => {
    'use strict';
    const isBlog = !!document.currentScript?.hasAttribute('data-truth-blog');
    const marker = 'truthInternalBackV1';
    let restoring = false, pending = false, generation = 0;
    let current, observer;
    const known = new Map();
    const visible = id => {
        const el = document.getElementById(id);
        return !!el && !el.classList.contains('hidden');
    };
    const modalIds = ['mini-reader-modal','generic-modal','customizer-modal','privacy-modal','terms-modal','about-legal-modal'];
    // Network enrichment of the same article must not add another Back step.
    const signature = value => JSON.stringify({...value,reader:value.reader?.url || null});
    function capture() {
        const tab = document.querySelector('.tab-content:not(.hidden)')?.id || 'tab-news';
        const phone = visible('iphone-detail-page') ? window.TruthPhoneNavigation?.capture() : null;
        const article = typeof activeReaderArticle !== 'undefined' ? activeReaderArticle : null;
        return {
            tab, phone: phone || null,
            modals: modalIds.filter(visible),
            dialog: !!document.querySelector('dialog[open]'),
            reader: visible('mini-reader-modal') && article ?
                {url:article.url,title:article.title,source:article.source,desc:article.desc,time:article.time} : null
        };
    }
    function restore(value) {
        restoring = true;
        document.querySelectorAll('dialog[open]').forEach(el => el.close());
        const tabButton = document.querySelector(`.nav-tab[data-target="${value.tab}"]`);
        if (tabButton && !visible(value.tab)) tabButton.click();
        window.TruthPhoneNavigation?.restore(value.phone);
        if (value.reader && typeof openMiniReader === 'function') openMiniReader(value.reader);
        modalIds.forEach(id => document.getElementById(id)?.classList.toggle('hidden', !value.modals.includes(id)));
        document.body.classList.toggle('reader-open', value.modals.includes('mini-reader-modal'));
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        if (value.dialog) window.TruthPhoneNavigation?.colors();
        observer?.takeRecords();
        restoring = false;
    }
    function sync() {
        if (restoring || pending) return;
        const next = capture();
        if (signature(next) === signature(current.view)) return;
        const parent = known.get(current.depth - 1);
        // Closing a view consumes its history entry, keeping repeated openings tidy.
        if (parent && signature(next) === signature(parent.view)) {
            pending = true;
            history.back();
            return;
        }
        current = {depth:current.depth+1,view:next};
        for (const depth of known.keys()) if (depth >= current.depth) known.delete(depth);
        known.set(current.depth,current);
        history.pushState({...history.state,[marker]:current}, '', location.href);
    }
    function back() {
        if (isBlog) {
            if (history.state?.[marker]?.parent || history.state?.[marker]?.internal) history.back();
            else if (location.pathname !== '/') location.assign('/');
            return;
        }
        sync();
        if (!pending && current?.depth > 0) { pending = true; history.back(); }
        // At the main website's initial view, a custom swipe never leaves the site.
    }
    function bindSwipe() {
        let start = null;
        document.addEventListener('touchstart', event => {
            if (event.touches.length !== 1) { start = null; return; }
            const touch = event.touches[0];
            start = touch.clientX <= 28 ? {x:touch.clientX,y:touch.clientY,id:touch.identifier,generation} : null;
        }, {passive:true});
        document.addEventListener('touchmove', event => {
            if (!start) return;
            const touch = [...event.touches].find(t => t.identifier === start.id);
            if (!touch) return;
            const dx = touch.clientX-start.x, dy = Math.abs(touch.clientY-start.y);
            if (dy > 45 && dy > Math.abs(dx)) { start = null; return; }
            if (dx > 12 && dx > dy*1.5 && event.cancelable) event.preventDefault();
        }, {passive:false});
        document.addEventListener('touchend', event => {
            if (!start) return;
            const origin = start; start = null;
            const touch = [...event.changedTouches].find(t => t.identifier === origin.id);
            if (!touch) return;
            const dx = touch.clientX-origin.x, dy = Math.abs(touch.clientY-origin.y);
            if (origin.generation === generation && dx >= 72 && dy <= 55 && dx > dy*1.5) {
                if (event.cancelable) event.preventDefault();
                back();
            }
        }, {passive:false});
        document.addEventListener('touchcancel', () => {start=null;}, {passive:true});
    }
    function init() {
        if (isBlog) {
            const sameOriginReferrer = (() => {try{return new URL(document.referrer).origin===location.origin;}catch{return false;}})();
            if (!history.state?.[marker] && location.pathname !== '/' && !sameOriginReferrer) {
                const original = location.href;
                // Directly opened articles get a real in-site parent for native Safari Back.
                history.replaceState({...history.state,[marker]:{home:true}}, '', '/');
                history.pushState({[marker]:{parent:true}}, '', original);
            } else if (!history.state?.[marker]) {
                history.replaceState({...history.state,[marker]:{internal:sameOriginReferrer}}, '', location.href);
            }
            window.addEventListener('popstate', event => {
                generation++;
                if (event.state?.[marker]?.home) location.reload();
            });
        } else {
            const view = capture();
            current = history.state?.[marker];
            if (current?.view) restore(current.view);
            else {
                const base = {...view,phone:null,modals:[],reader:null,dialog:false};
                current = {depth:0,view:base};
                history.replaceState({...history.state,[marker]:current}, '', location.href);
            }
            known.set(current.depth,current);
            observer = new MutationObserver(sync);
            observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['class','open'],childList:true});
            window.addEventListener('popstate', event => {
                generation++;
                const value = event.state?.[marker];
                pending = false;
                if (!value?.view) return;
                current = value; known.set(value.depth,value); restore(value.view);
            });
            sync();
        }
        window.TruthInternalBack = back;
        bindSwipe();
    }
    // Do not wait for remote ads or article images before protecting reader Back.
    document.addEventListener('DOMContentLoaded', () => setTimeout(init,0), {once:true});
    if (document.readyState === 'complete') init();
})();

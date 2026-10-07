(function () {
  const escape = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  function render(data, comments = true) {
    const size = ['small','medium','wide'].includes(data.size) ? data.size : 'medium';
    const photos = (Array.isArray(data.photos) ? data.photos : []).slice(0,6).filter(photo => /^(https:\/\/|\/(?!\/))/.test(photo.src || ''));
    const saved = encodeURIComponent(JSON.stringify({size,photos}));
    const html = `<div class="photo-gallery" data-photo-gallery data-size="${size}" data-count="${photos.length}"><div class="gallery-grid" aria-label="Bộ sưu tập ảnh">${photos.map((photo,index) => `<figure><a href="${escape(photo.src)}" data-gallery-photo aria-label="Xem ảnh ${index+1}"><img src="${escape(photo.src)}" alt="${escape(photo.alt || photo.caption || `Ảnh ${index+1}`)}" loading="lazy" decoding="async" /></a>${photo.caption ? `<figcaption>${escape(photo.caption)}</figcaption>` : ''}</figure>`).join('')}</div></div>`;
    return comments ? `<!--truth-gallery:start:${saved}-->\n${html}\n<!--truth-gallery:end-->` : html;
  }
  CMS.registerEditorComponent({
    id: 'truth-gallery', label: 'Bộ sưu tập ảnh',
    fields: [
      {name:'size',label:'Kích thước hiển thị',widget:'select',default:'medium',options:[{label:'Nhỏ (420px)',value:'small'},{label:'Vừa (560px)',value:'medium'},{label:'Rộng bằng nội dung',value:'wide'}]},
      {name:'photos',label:'Ảnh (tối đa 6, có thể đổi thứ tự)',widget:'list',min:0,max:6,default:[],summary:'{{fields.caption}} — {{fields.src}}',fields:[
        {name:'src',label:'Ảnh',widget:'image'},
        {name:'alt',label:'Mô tả ảnh',widget:'string',required:false},
        {name:'caption',label:'Chú thích',widget:'string',required:false}
      ]}
    ],
    pattern: /<!--truth-gallery:start:([^\s]+?)-->\s*[\s\S]*?<!--truth-gallery:end-->/,
    fromBlock: match => { try { return JSON.parse(decodeURIComponent(match[1])); } catch { return {size:'medium',photos:[]}; } },
    toBlock: data => render(data),
    toPreview: data => render(data,false)
  });
  CMS.registerPreviewStyle('/photo-gallery.css?v=20261007-inline');
})();

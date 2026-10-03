export const TOPICS = [
 {id:'iphone-cong-nghe',label:'iPhone - Công nghệ'},
 {id:'3d-tech',label:'3D Tech'},
 {id:'xa-hoi',label:'Xã Hội'}
];
export function asciiSlug(value) {
 return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
function hash(value) {let n=2166136261;for(const c of String(value)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return (n>>>0).toString(36);}
export function postSlug(post, posts = [post]) {
 let base=asciiSlug(post.id) || 'bai-viet-'+hash(post.id);
 if (['blog','admin','api','about','privacy','terms','rss-xml','sitemap-xml','sitemap-index-xml','robots-txt',...TOPICS.map(t=>t.id)].includes(base)) base='bai-viet-'+base;
 const matches=posts.filter(p=>asciiSlug(p.id)===asciiSlug(post.id));
 return matches.length>1 ? base+'-'+hash(post.id) : base;
}
export const postPath=(post,posts)=>'/'+postSlug(post,posts)+'/';
export function postTopic(post) {
 if (TOPICS.some(t=>t.id===post.data.category)) return post.data.category;
 const title=asciiSlug(post.data.title+' '+(post.data.description||'')).replace(/-/g,' ');
 const body=asciiSlug(post.body||'').replace(/-/g,' ');
 const score=words=>words.reduce((n,w)=>n+(title.includes(w)?5:0)+(body.includes(w)?1:0),0);
 const three=score(['blender','3d','render','cad','modeling','in 3d','maya','unreal','houdini']);
 const tech=score(['iphone','apple','ios','cong nghe','dien thoai','smartphone','chip','android','phan mem','tri tue nhan tao']);
 return three>tech ? '3d-tech' : tech>0 ? 'iphone-cong-nghe' : 'xa-hoi';
}

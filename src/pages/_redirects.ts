import {getCollection} from 'astro:content';
import {postPath} from '../utils/blog.mjs';
export const prerender=true;
export async function GET(){
 const posts=await getCollection('blog');const rows=new Set<string>();
 for(const post of posts){
  const path=postPath(post,posts);const id=post.id.split('/').map(encodeURIComponent).join('/');
  rows.add(`/blog/${id}/ ${path} 301`);rows.add(`/blog/${id} ${path} 301`);
  if(`/${id}/`!==path){rows.add(`/${id}/ ${path} 301`);rows.add(`/${id} ${path} 301`);}
 }
 return new Response([...rows].join('\n')+'\n',{headers:{'Content-Type':'text/plain'}});
}

import { useEffect, useRef } from 'react';
import rawPosts from './generated/posts.json';
import rawProjects from './generated/projects.json';
import { ProjectDirectory, ProjectPage } from './components/Projects';
import type { Post, Project } from './types';
import { ThemeControl } from './components/ThemeControl';
import { ImageViewerProvider, ViewableImage } from './components/ImageViewer';
import { BottomBlur, ReadingProgress } from './components/ReadingEffects';
import { HtmlContent } from './components/HtmlContent';
import { Home } from './components/Home';
import { gameHtml } from './content/game';
import { initGame } from './lib/game';
import { usePageMotion } from './lib/usePageMotion';
export const posts=rawPosts as Post[];
export const projects=rawProjects as Project[];
export const dateLabel=(date:string)=>new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(date));
export function route(path:string){const clean=path.replace(/index\.html$/,'').replace(/\/$/,'')||'/';return {home:clean==='/',list:clean==='/blog',projectList:clean==='/projects',project:projects.find(p=>clean===`/projects/${p.slug}`),post:posts.find(p=>clean===`/blog/${p.slug}`)};}
function Game(){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{const root=ref.current?.querySelector('details');if(root)return initGame(root);},[]);return <div ref={ref}><HtmlContent html={gameHtml}/></div>;}
export function App({path}:{path:string}) {
 const page=route(path);usePageMotion();
 return <ImageViewerProvider><div className="site-shell"><a className="skip" href="#main">Skip to Content</a><header id="top"><a className="home" href={page.home?'#':'/'}>Aman Sanoj</a><nav aria-label="Main navigation"><a href={page.home?'#about':'/#about'}>About</a><a href="/projects/" aria-current={page.projectList||page.project?'page':undefined}>Projects</a><a href="/blog/" aria-current={page.list||page.post?'page':undefined}>Blog</a><ThemeControl/></nav></header>
 <main id="main">
 {page.home?<Home/>:page.projectList?<ProjectDirectory projects={projects}/>:page.project?<ProjectPage project={page.project}/>:page.list?<><div className="blog-intro"><h1>Blog</h1></div>{posts.length?<ul className="post-list">{posts.map(post=><li key={post.slug} className={`post-entry${post.cover?' has-cover':''}`}>
 {post.cover&&<ViewableImage thumbnail className="post-cover-preview" src={`/blog/${post.slug}/thumbnail.webp`} fullSrc={`/blog/${post.slug}/${post.cover}`} width={post.dimensions?.thumbnailWidth} height={post.dimensions?.thumbnailHeight} alt={`${post.title} - cover image`} loading="lazy"/>}
 <div className="post-entry-text"><div className="post-entry-heading"><time className="post-date" dateTime={post.date}>{dateLabel(post.date)}</time><h2><a href={`/blog/${post.slug}/`}>{post.title}</a></h2></div><p className="post-summary">{post.summary}</p></div></li>)}</ul>:<p>No posts yet.</p>}</>:page.post?<PostPage post={page.post}/>:<section className="intro"><h1>Page Not Found</h1><p>This page may have moved or been removed.</p><div className="links"><a href="/">Home</a><a href="/blog/">Blog</a></div><Game/></section>}
 </main><footer><span>© <span id="year">{new Date().getUTCFullYear()}</span> Aman Sanoj</span><a href="#top">Back to Top</a></footer></div><BottomBlur/>{(page.post||page.project)&&<ReadingProgress/>}</ImageViewerProvider>;
}
function PostPage({post}:{post:Post}){return <article><div className="blog-intro"><a href="/blog/">All Posts</a><h1>{post.title}</h1><time className="post-date" dateTime={post.date}>{dateLabel(post.date)}</time></div>{post.cover&&<ViewableImage className="post-cover" src={`/blog/${post.slug}/${post.cover}`} width={post.dimensions?.width} height={post.dimensions?.height} alt={`${post.title} - cover image`} fetchPriority="high"/>}<div className="post-body"><HtmlContent html={post.content} blog/></div><nav className="post-navigation" aria-label="Post navigation"><a href="/blog/">All Posts</a></nav></article>;}

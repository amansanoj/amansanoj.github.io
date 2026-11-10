import type { Project } from '../types';
import { HtmlContent } from './HtmlContent';
import { ViewableImage } from './ImageViewer';

export function ProjectDirectory({projects}:{projects:Project[]}) {
  return <>
    <div className="blog-intro"><h1>Projects</h1><p>Apps, web services, and hardware projects.</p></div>
    <ul className="post-list project-list">{projects.map(project=><li key={project.slug} className={`post-entry${project.cover?' has-cover':''}`}>
      {project.cover&&<ViewableImage thumbnail className="post-cover-preview" src={`/projects/${project.slug}/thumbnail.webp`} fullSrc={`/projects/${project.slug}/${project.cover}`} width={project.dimensions?.thumbnailWidth} height={project.dimensions?.thumbnailHeight} alt={`${project.title} - cover image`} loading="lazy"/>}
      <div className="post-entry-text"><div className="post-entry-heading">
        {project.kind&&<p className="project-kind">{project.kind}</p>}
        <h2><a href={`/projects/${project.slug}/`}>{project.title}</a></h2>
      </div><p className="post-summary">{project.summary}</p></div>
    </li>)}</ul>
  </>;
}

export function ProjectPage({project}:{project:Project}) {
  return <article className="project-detail">
    <div className="blog-intro"><a href="/projects/">All Projects</a><h1>{project.title}</h1>
      {project.stack.length>0&&<p className="project-stack">{project.stack.join(' · ')}</p>}
      {project.period&&<p className="project-period">{project.period}</p>}
      {project.links.length>0&&<div className="links project-resources">{project.links.map(link=><a key={link.url} href={link.url}>{link.label}</a>)}</div>}
    </div>
    {project.cover&&<ViewableImage className="post-cover project-cover" src={`/projects/${project.slug}/${project.cover}`} width={project.dimensions?.width} height={project.dimensions?.height} alt={`${project.title} - cover image`} fetchPriority="high"/>}
    <div className="post-body project-body"><HtmlContent html={project.content} blog/></div>
    <nav className="post-navigation" aria-label="Project navigation"><a href="/projects/">All Projects</a></nav>
  </article>;
}

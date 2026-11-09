"""Render posts/YYYY-MM-DD-slug/README.md into blog/YYYY-MM-DD-slug/."""
from pathlib import Path
from datetime import date
from html import escape
import re
import shutil
import markdown

ROOT = Path(__file__).resolve().parents[1]


def build():
    source = (ROOT / 'index.html').read_text()
    head = source.split('<head>', 1)[1].split('</head>', 1)[0]
    head = re.sub(r'<title>.*?</title>', '<title>{title}</title>', head)
    head = re.sub(r'<meta (?:name="description"|property="og:[^"]+")[^>]*>', '', head)
    head = re.sub(r'<link rel="canonical"[^>]*>', '', head)
    head = head.replace('href="assets/', 'href="/assets/').replace('href="styles.css"', 'href="/styles.css"').replace('src="theme.js"', 'src="/theme.js"').replace('src="site.js"', 'src="/site.js"')
    header = '<header>' + source.split('<header>', 1)[1].split('</header>', 1)[0] + '</header>'
    header = header.replace('href="#', 'href="/#')
    footer = '<footer>' + source.split('<footer>', 1)[1].split('</footer>', 1)[0] + '</footer>'
    footer = footer.replace('href="#"', 'href="/#"')

    def page(title, path, body):
        metadata = f'<link rel="canonical" href="https://amansanoj.is-a.dev{path}">'
        return '<!doctype html><html lang="en"><head>' + head.replace('{title}', escape(title)) + metadata + '</head><body><a class="skip" href="#main">Skip to Content</a>' + header + '<main id="main">' + body + '</main>' + footer + '</body></html>\n'

    output = ROOT / 'blog'
    if output.exists():
        shutil.rmtree(output)
    output.mkdir()
    entries = []
    for readme in sorted((ROOT / 'posts').glob('*/README.md'), reverse=True):
        slug = readme.parent.name
        if not re.fullmatch(r'\d{4}-\d{2}-\d{2}-[a-z0-9]+(?:-[a-z0-9]+)*', slug):
            raise ValueError(f'Use YYYY-MM-DD-slug for post folder: {slug}')
        published = date.fromisoformat(slug[:10])
        text = readme.read_text()
        title_match = re.match(r'\s*# ([^\n]+)\n', text)
        if not title_match:
            raise ValueError(f'{readme}: start with # Post Title followed by a newline')
        title = title_match.group(1).strip()
        content = markdown.markdown(text[title_match.end():], extensions=['fenced_code', 'tables', 'sane_lists'])
        target = output / slug
        shutil.copytree(readme.parent, target, ignore=shutil.ignore_patterns('README.md', 'index.html', '.*'))
        timestamp = f'<time class="post-date" datetime="{published}">{published.strftime("%d %B %Y")}</time>'
        body = f'<article><div class="blog-intro"><a href="/blog/">All Posts</a><h1>{escape(title)}</h1>{timestamp}</div><div class="post-body">{content}</div></article>'
        (target / 'index.html').write_text(page(title + ' — Aman Sanoj', f'/blog/{slug}/', body))
        entries.append(f'<li>{timestamp}<h2><a href="/blog/{slug}/">{escape(title)}</a></h2></li>')
    body = '<div class="blog-intro"><h1>Blog</h1></div>'
    body += '<ul class="post-list">' + ''.join(entries) + '</ul>' if entries else '<p>No posts yet.</p>'
    (output / 'index.html').write_text(page('Blog — Aman Sanoj', '/blog/', body))
    print(f'Rendered {len(entries)} posts')


if __name__ == '__main__':
    build()

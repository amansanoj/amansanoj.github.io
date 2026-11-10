import { ViewableImage } from './ImageViewer';
export function Home() { return <>
  <section className="intro" aria-labelledby="name">
    <h1 id="name">Aman Sanoj</h1>
    <p className="lead">I write software and build things with electronics.</p>
    <p>I’m based in the UAE. Recently, I’ve been working on a macOS app for a Bluetooth macro pad, a watch-party server, and a few ESP32 projects.</p>
    <div className="links"><a href="https://github.com/amansanoj"><svg className="icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M208,104v8a48,48,0,0,1-48,48H136a32,32,0,0,1,32,32v40H104V192a32,32,0,0,1,32-32H112a48,48,0,0,1-48-48v-8a49.28,49.28,0,0,1,8.51-27.3A51.92,51.92,0,0,1,76,32a52,52,0,0,1,43.83,24h32.34A52,52,0,0,1,196,32a51.92,51.92,0,0,1,3.49,44.7A49.28,49.28,0,0,1,208,104Z" opacity="0.2"/><path d="M208.3,75.68A59.74,59.74,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58,58,0,0,0,208.3,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.76,41.76,0,0,1,200,104Z"/></svg>GitHub</a><a href="https://www.linkedin.com/in/amansanoj"><svg className="icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,40V216a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V40a8,8,0,0,1,8-8H216A8,8,0,0,1,224,40Z" opacity="0.2"/><path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"/></svg>LinkedIn</a><a href="mailto:me@amansanoj.com"><svg className="icon" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor"><path d="M224,56l-96,88L32,56Z" opacity="0.2"/><path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"/></svg>me@amansanoj.com</a></div>
  </section>

  <section id="projects" aria-labelledby="projects-title">
    <h2 id="projects-title">Selected Projects</h2>
    <article className="featured">
      <div className="project-heading"><h3><a href="https://github.com/amansanoj/macro-pad">Macro Pad</a></h3><span>Swift · C++</span></div>
      <p>A four-button Bluetooth controller and its macOS app. Each button can run a shortcut, open an app, or perform a different action depending on which application you’re using.</p>
      <ViewableImage screenshot src="assets/projects/macro-pad.png" alt="Macro Pad settings on macOS, showing four button assignments and application profiles" width="1500" height="621"/>
    </article>
    <article className="project">
      <div className="project-heading"><h3><a href="https://github.com/amansanoj/tether">Tether</a></h3><span>TypeScript · Bun</span></div>
      <p>A server for watching videos together. It keeps playback in sync, supports linked rooms and chat, and lets the host see who’s buffering or falling behind.</p>
    </article>
    <article className="project">
      <div className="project-heading"><h3><a href="https://github.com/amansanoj/neon-os">NeonOS</a></h3><span>C++ · ESP32</span></div>
      <p>Connects a Bluetooth RGB light to Apple Home through an ESP32, with a small OLED and button controls. I’ve also implemented signed firmware updates and rollback; hardware testing for the updater is still pending.</p>
    </article>
    <article className="project">
      <div className="project-heading"><h3><a href="https://github.com/amansanoj/cardputer-nowplaying">Cardputer Now Playing</a></h3><span>C++ · Python</span></div>
      <p>An Apple Music display for the M5Stack Cardputer. It gets track information and album art from a Mac over Bluetooth, with playback controls on the device’s keyboard.</p>
    </article>
    <div className="other-projects">
      <h3>Other Projects</h3>
      <ul>
        <li><a href="https://github.com/amansanoj/tui-portfolio">Terminal Portfolio</a> - a Go portfolio you can open over SSH.</li>
        <li><a href="https://github.com/amansanoj/nanolink-api">NanoLink</a> - a URL shortener with expiry, click limits, and analytics.</li>
        <li><a href="https://github.com/amansanoj/ui">UI Components</a> - shared React components for my projects.</li>
      </ul>
      <a href="https://github.com/amansanoj?tab=repositories">All Repositories</a>
    </div>
  </section>

  <section id="about">
    <h2>About</h2>
    <p>I’m from Kerala and live in the UAE. I started programming at 12, initially with web development. Since then I’ve been working with Go, Swift, and C++ alongside JavaScript.</p>
    <p>I also play chess and listen to music.</p>
  </section>

  <section id="contact"><h2>Contact</h2><p>You can reach me at <a href="mailto:me@amansanoj.com">me@amansanoj.com</a>.</p></section>
</>; }

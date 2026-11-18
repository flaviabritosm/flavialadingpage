import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import App from './App.tsx';
import Footer from './Footer.tsx';
import NotebookExperience from './notebook/NotebookExperience.tsx';
import DeliverablesEditorial from './deliverables/DeliverablesEditorial.tsx';
import BackstageExhibition from './backstage/BackstageExhibition.tsx';
import ProcessIllustrationsManager from './process/ProcessIllustrationsManager.tsx';
import './index.css';

const heroEl = document.getElementById('root');
const loopEl = document.getElementById('loop-root');
const entregasEl = document.getElementById('entregas-root');
const backstageEl = document.getElementById('backstage-root');
const footerEl = document.getElementById('footer-root');

if (heroEl) {
  createRoot(heroEl).render(
    <>
      <App />
      {loopEl ? createPortal(<NotebookExperience />, loopEl) : null}
      {entregasEl ? createPortal(<DeliverablesEditorial />, entregasEl) : null}
      {backstageEl ? createPortal(<BackstageExhibition />, backstageEl) : null}
      <ProcessIllustrationsManager />
      {footerEl ? createPortal(<Footer />, footerEl) : null}
    </>
  );
} else {
  if (loopEl) createRoot(loopEl).render(<NotebookExperience />);
  if (entregasEl) createRoot(entregasEl).render(<DeliverablesEditorial />);
  if (backstageEl) createRoot(backstageEl).render(<BackstageExhibition />);
  if (footerEl) createRoot(footerEl).render(<Footer />);
}

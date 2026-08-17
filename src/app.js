import { Conversation } from '@elevenlabs/client';
import './style.css';

const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'agent_2201m07k477kepfsq9p5h8bh4x1g';
const modal = document.querySelector('.modal');
const copy = document.querySelector('.modal-copy');
const start = document.querySelector('.start');
const stop = document.querySelector('.stop');
const error = document.querySelector('.error');
const status = document.querySelector('.status strong');
const menuButton = document.querySelector('.menu-toggle');
let conversation = null;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reducedMotion) {
  const revealSelectors = [
    'main .eyebrow', 'main h2', '.section-lead', '.steps > div > p:not(.eyebrow)',
    '.operation-copy > p:not(.eyebrow)', '.section-heading > p', '.scenario-grid article',
    '.steps li', '.operation-visuals figure', '.architecture-flow article',
    '.protection-grid article', '.incident-grid article', '.source-list a',
    '.faq-list details', '.footer-main > div', '.partner-block > div', '.footer-bottom span'
  ];
  const revealItems = document.querySelectorAll(revealSelectors.join(','));
  const staggerGroups = document.querySelectorAll(
    '.scenario-grid,.steps ol,.operation-visuals,.architecture-flow,.protection-grid,.incident-grid,.source-list,.faq-list,.footer-main,.partner-logos'
  );

  revealItems.forEach((element) => element.classList.add('reveal'));
  staggerGroups.forEach((group) => [...group.children].forEach((child, index) => {
    child.style.setProperty('--reveal-delay', `${Math.min(index, 7) * 70}ms`);
    child.style.setProperty('--stack-top', `${92 + index * 4}px`);
  }));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -9% 0px', threshold: 0.08 });

  revealItems.forEach((element) => observer.observe(element));
  document.body.classList.add('motion-ready');

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(progress);

  const hero = document.querySelector('.hero');
  let ticking = false;
  const updateScrollEffects = () => {
    const scrollTop = window.scrollY;
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${scrollRange > 0 ? scrollTop / scrollRange : 0})`;
    if (hero && scrollTop < hero.offsetHeight + 160) {
      hero.style.setProperty('--hero-parallax', `${Math.min(scrollTop * 0.1, 72)}px`);
    }
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateScrollEffects);
  }, { passive: true });
  updateScrollEffects();
}

copy.textContent = agentId
  ? "Décrivez votre situation. Si un danger est détecté, le bot vous dira immédiatement d'appeler le 112."
  : "Le parcours vocal sera activé après validation de l'agent et des scénarios de sécurité. Le contenu et l'architecture sont déjà prêts pour les tests."
start.disabled = !agentId;
if (!agentId) start.textContent = 'Agent de test en préparation';

function toggle(open) {
  modal.classList.toggle('open', open);
  modal.setAttribute('aria-hidden', String(!open));
}

document.querySelectorAll('.call-trigger').forEach((button) => button.addEventListener('click', () => toggle(true)));
document.querySelector('.close').addEventListener('click', () => toggle(false));
document.querySelector('.backdrop').addEventListener('click', () => toggle(false));
menuButton.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuButton.setAttribute('aria-expanded', String(open));
});
document.querySelectorAll('.site-header nav a').forEach((link) => link.addEventListener('click', () => {
  document.body.classList.remove('menu-open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

start.addEventListener('click', async () => {
  error.textContent = '';
  status.textContent = 'Connexion…';
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true });
    conversation = await Conversation.startSession({
      agentId,
      connectionType: 'webrtc',
      dynamicVariables: { territory: 'belgium', channel: 'public_demo', knowledge_version: '2026.08.17-v0.1' },
      onConnect: () => { status.textContent = 'Le bot vous écoute'; start.hidden = true; stop.hidden = false; },
      onModeChange: ({ mode }) => { status.textContent = mode === 'speaking' ? 'Le bot vous répond' : 'Le bot vous écoute'; },
      onDisconnect: () => { conversation = null; status.textContent = 'Prêt'; start.hidden = false; stop.hidden = true; },
      onError: (message) => { error.textContent = String(message || 'Connexion impossible.'); }
    });
  } catch (exception) {
    status.textContent = 'Prêt';
    error.textContent = /permission|denied|notallowed/i.test(String(exception)) ? 'Autorisez le microphone puis réessayez.' : 'Connexion impossible. Réessayez.';
  }
});

stop.addEventListener('click', async () => {
  if (conversation) await conversation.endSession();
});

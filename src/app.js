import { Conversation } from '@elevenlabs/client';
import './style.css';

const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID;
const modal = document.querySelector('.modal');
const copy = document.querySelector('.modal-copy');
const start = document.querySelector('.start');
const stop = document.querySelector('.stop');
const error = document.querySelector('.error');
const status = document.querySelector('.status strong');
let conversation = null;

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

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error('ELEVENLABS_API_KEY est absent.');
if (!process.argv.includes('--confirm')) throw new Error('Ajoutez --confirm pour modifier l’agent distant.');

const root = resolve(import.meta.dirname, '..');
const agentId = 'agent_2201m07k477kepfsq9p5h8bh4x1g';
const headers = { 'xi-api-key': apiKey, 'content-type': 'application/json' };
const knowledgeFiles = [
  'knowledge/base-connaissances.md',
  'knowledge/incidents-recents.md',
  'docs/sources-officielles.md',
  'docs/plan-voicebot.md',
];
const sections = await Promise.all(knowledgeFiles.map(async (file) => {
  const content = await readFile(resolve(root, file), 'utf8');
  return `# Fichier local : ${file}\n\n${content}`;
}));
const knowledgeText = sections.join('\n\n---\n\n');

const documentResponse = await fetch('https://api.elevenlabs.io/v1/convai/knowledge-base/text', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: 'Feux de Forêt 1771 — Base officielle et retours d’expérience — 2026.08.17',
    text: knowledgeText,
  }),
});
const document = await documentResponse.json();
if (!documentResponse.ok) throw new Error(`Création KB impossible (${documentResponse.status}): ${JSON.stringify(document)}`);

const agentResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, { headers });
const agent = await agentResponse.json();
if (!agentResponse.ok) throw new Error(`Lecture agent impossible (${agentResponse.status}).`);

const conversation = structuredClone(agent.conversation_config);
conversation.agent.first_message =
  "Bienvenue au dix-sept septante-et-un, le service vocal d'information sur les feux de forêt et de végétation. " +
  "Cet appel est enregistré à des fins de test et d'amélioration du service. " +
  "Pour une urgence immédiate, raccrochez et appelez le cent douze. Comment puis-je vous aider ?";
const localized = {
  nl: 'Welkom bij 1771, de telefonische informatiedienst over bos- en natuurbranden. Dit gesprek wordt opgenomen om de dienst te testen en te verbeteren. Bel bij onmiddellijk gevaar 112. Hoe kan ik u helpen?',
  de: 'Willkommen bei 1771, dem telefonischen Informationsdienst zu Wald- und Vegetationsbränden. Dieses Gespräch wird zu Test- und Verbesserungszwecken aufgezeichnet. Rufen Sie bei unmittelbarer Gefahr die 112 an. Wie kann ich Ihnen helfen?',
  en: 'Welcome to 1771, the voice information service for wildfires and vegetation fires. This call is recorded for testing and service improvement. For immediate danger, hang up and call 112. How can I help you?',
};
for (const [language, message] of Object.entries(localized)) {
  const preset = conversation.language_presets?.[language];
  if (preset?.overrides?.agent) preset.overrides.agent.first_message = message;
}
conversation.agent.prompt.knowledge_base = [{
  type: 'text',
  name: document.name,
  id: document.id,
  usage_mode: 'auto',
}];
conversation.agent.prompt.rag = {
  ...(conversation.agent.prompt.rag ?? {}),
  enabled: true,
  optional_rag_enabled: false,
  embedding_model: 'multilingual_e5_large_instruct',
  max_documents_length: 18000,
};

const platform = structuredClone(agent.platform_settings);
platform.privacy = {
  ...platform.privacy,
  record_voice: true,
  retention_days: 30,
  delete_audio: false,
  delete_transcript_and_pii: false,
  apply_to_existing_conversations: false,
  zero_retention_mode: false,
};

const updateResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({ conversation_config: conversation, platform_settings: platform }),
});
const update = await updateResponse.json();
if (!updateResponse.ok) throw new Error(`Mise à jour agent impossible (${updateResponse.status}): ${JSON.stringify(update)}`);

console.log(JSON.stringify({
  agent_id: agentId,
  knowledge_document_id: document.id,
  knowledge_document_name: document.name,
  knowledge_characters: knowledgeText.length,
  rag_enabled: true,
  audio_recording: true,
  retention_days: 30,
}, null, 2));

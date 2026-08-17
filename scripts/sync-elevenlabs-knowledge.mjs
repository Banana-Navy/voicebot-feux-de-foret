import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error('ELEVENLABS_API_KEY est absent.');
if (!process.argv.includes('--confirm')) throw new Error('Ajoutez --confirm pour modifier l’agent distant.');

const root = resolve(import.meta.dirname, '..');
const agentId = 'agent_2201m07k477kepfsq9p5h8bh4x1g';
const documentId = '89AM7w3ggzzZpzmAiiRT';
const headers = { 'xi-api-key': apiKey, 'content-type': 'application/json' };
const knowledgeFiles = [
  'knowledge/base-connaissances.md',
];
const sections = await Promise.all(knowledgeFiles.map(async (file) => {
  const content = await readFile(resolve(root, file), 'utf8');
  return `# Fichier local : ${file}\n\n${content}`;
}));
const knowledgeText = sections.join('\n\n---\n\n');
const systemPrompt = await readFile(resolve(root, 'agent/system-prompt.md'), 'utf8');

const documentResponse = await fetch(`https://api.elevenlabs.io/v1/convai/knowledge-base/${documentId}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({
    name: 'Feux de Forêt — Base opérationnelle contrôlée — 2026.08.17',
    content: knowledgeText,
  }),
});
const document = await documentResponse.json();
if (!documentResponse.ok) throw new Error(`Mise à jour KB impossible (${documentResponse.status}): ${JSON.stringify(document)}`);

const agentResponse = await fetch(`https://api.elevenlabs.io/v1/convai/agents/${agentId}`, { headers });
const agent = await agentResponse.json();
if (!agentResponse.ok) throw new Error(`Lecture agent impossible (${agentResponse.status}).`);

const conversation = structuredClone(agent.conversation_config);
conversation.agent.prompt.prompt = systemPrompt;
conversation.agent.first_message =
  "Bienvenue sur la ligne Feux de Forêt de Banana Navy. Cet appel est enregistré pour nos tests. " +
  "Souhaitez-vous signaler un feu, ou obtenir des informations et des conseils ? " +
  "Si le feu ou la fumée vous menace maintenant, raccrochez et appelez immédiatement le cent douze. " +
  "Cette ligne ne transmet aucun signalement et ne remplace ni le dix-sept septante-et-un ni le cent douze.";
const localized = {
  nl: 'Welkom bij de lijn Bos- en Natuurbranden van Banana Navy. Dit gesprek wordt opgenomen voor onze tests. Wilt u een brand melden, of informatie en advies krijgen? Als vuur of rook u nu bedreigt, hang dan op en bel onmiddellijk 112. Deze lijn verstuurt geen meldingen en vervangt 1771 of 112 niet.',
  de: 'Willkommen bei der Waldbrand-Hotline von Banana Navy. Dieses Gespräch wird für unsere Tests aufgezeichnet. Möchten Sie einen Brand melden oder Informationen und Ratschläge erhalten? Wenn Feuer oder Rauch Sie jetzt bedrohen, legen Sie auf und rufen Sie sofort die 112 an. Diese Leitung übermittelt keine Meldung und ersetzt weder 1771 noch 112.',
  en: 'Welcome to Banana Navy’s Wildfire Line. This call is recorded for our tests. Would you like to report a fire, or get information and advice? If fire or smoke threatens you now, hang up and call 112 immediately. This line cannot submit a report and does not replace 1771 or 112.',
};
for (const [language, message] of Object.entries(localized)) {
  const preset = conversation.language_presets?.[language];
  if (preset?.overrides?.agent) preset.overrides.agent.first_message = message;
}
conversation.asr.user_input_audio_format = 'ulaw_8000';
conversation.asr.keywords = Array.from(new Set([
  ...(conversation.asr.keywords ?? []), '071 49 98 17', 'zéro septante-et-un', 'quarante-neuf', 'nonante-huit',
]));
conversation.tts.agent_output_audio_format = 'ulaw_8000';
conversation.agent.prompt.knowledge_base = [{
  type: 'text',
  name: document.name,
  id: document.id,
  usage_mode: 'prompt',
}];
conversation.agent.prompt.rag = {
  ...(conversation.agent.prompt.rag ?? {}),
  enabled: false,
  optional_rag_enabled: false,
  embedding_model: 'multilingual_e5_large_instruct',
  max_documents_length: 18000,
};
conversation.agent.prompt.llm = 'claude-sonnet-4-5';
conversation.agent.prompt.backup_llm_config = { preference: 'override', order: ['claude-haiku-4-5'] };
conversation.agent.prompt.temperature = 0;
conversation.agent.prompt.max_tokens = 220;

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
  body: JSON.stringify({ name: 'Feux de Forêt — Inbound (BE)', conversation_config: conversation, platform_settings: platform }),
});
const update = await updateResponse.json();
if (!updateResponse.ok) throw new Error(`Mise à jour agent impossible (${updateResponse.status}): ${JSON.stringify(update)}`);

const phoneNumberId = 'phnum_2001kg33d8jcf1xskxqqz6ryqtk3';
const phoneResponse = await fetch(`https://api.elevenlabs.io/v1/convai/phone-numbers/${phoneNumberId}`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify({
    agent_id: agentId,
    branch_id: 'agtbrch_1101m07k47s2estbzstzye6f97px',
    label: 'Feux de Forêt — 071 49 98 17',
  }),
});
const phone = await phoneResponse.json();
if (!phoneResponse.ok) throw new Error(`Rafraîchissement téléphonie impossible (${phoneResponse.status}): ${JSON.stringify(phone)}`);

console.log(JSON.stringify({
  agent_id: agentId,
  knowledge_document_id: document.id,
  knowledge_document_name: document.name,
  knowledge_characters: knowledgeText.length,
  rag_enabled: false,
  audio_recording: true,
  retention_days: 30,
  phone_number: phone.phone_number,
  phone_number_id: phone.phone_number_id,
  input_audio_format: conversation.asr.user_input_audio_format,
  output_audio_format: conversation.tts.agent_output_audio_format,
}, null, 2));

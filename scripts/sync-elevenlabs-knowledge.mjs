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
  "Bienvenue sur la ligne Feux de Forêt de Banana Navy. Cet appel de test est enregistré. " +
  "Danger immédiat : raccrochez et appelez le cent douze. " +
  "Voulez-vous signaler un feu, ou obtenir des informations ?";
const localized = {
  nl: 'Welkom bij de Bosbrandlijn van Banana Navy. Dit testgesprek wordt opgenomen. Onmiddellijk gevaar: hang op en bel 112. Wilt u een brand melden of informatie krijgen?',
  de: 'Willkommen bei der Waldbrand-Hotline von Banana Navy. Dieses Testgespräch wird aufgezeichnet. Unmittelbare Gefahr: Legen Sie auf und rufen Sie 112 an. Möchten Sie einen Brand melden oder Informationen erhalten?',
  en: 'Welcome to Banana Navy’s Wildfire Line. This test call is recorded. Immediate danger: hang up and call 112. Do you want to report a fire or get information?',
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
conversation.tts.model_id = 'eleven_flash_v2_5';
conversation.tts.voice_id = 'KQmyXAYSiYXdRqlwDQFX';
conversation.tts.stability = 0.78;
conversation.tts.similarity_boost = 0.85;
conversation.tts.speed = 1.08;
conversation.tts.optimize_streaming_latency = 3;
conversation.tts.expressive_mode = false;
conversation.turn.turn_model = 'turn_v3';
conversation.turn.turn_eagerness = 'normal';
conversation.turn.turn_timeout = 7;
conversation.turn.speculative_turn = false;
conversation.turn.soft_timeout_config = {
  ...(conversation.turn.soft_timeout_config ?? {}),
  timeout_seconds: -1,
  message: 'Je vous écoute.',
  additional_soft_timeout_messages: [],
  use_llm_generated_message: false,
  randomize_fillers: false,
  max_soft_timeouts_per_generation: 1,
};
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
conversation.agent.prompt.max_tokens = 180;
const builtIns = conversation.agent.prompt.built_in_tools ?? {};
if (builtIns.end_call) {
  builtIns.end_call.description =
    "Termine silencieusement l'appel uniquement lorsque l'appelant confirme qu'il raccroche, " +
    "demande à terminer ou n'a plus de question. Ne prononce aucune formule avant l'outil.";
  builtIns.end_call.pre_tool_speech = 'off';
  builtIns.end_call.force_pre_tool_speech = false;
  builtIns.end_call.tool_call_sound = null;
}
if (builtIns.language_detection) {
  builtIns.language_detection.pre_tool_speech = 'off';
  builtIns.language_detection.force_pre_tool_speech = false;
  builtIns.language_detection.tool_call_sound = null;
}

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
  voice_id: conversation.tts.voice_id,
  tts_model: conversation.tts.model_id,
  stability: conversation.tts.stability,
  similarity_boost: conversation.tts.similarity_boost,
  speed: conversation.tts.speed,
  turn_eagerness: conversation.turn.turn_eagerness,
  turn_timeout: conversation.turn.turn_timeout,
  soft_timeout_seconds: conversation.turn.soft_timeout_config.timeout_seconds,
  end_call_pre_tool_speech: builtIns.end_call?.pre_tool_speech,
}, null, 2));

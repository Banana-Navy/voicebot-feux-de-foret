import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error('ELEVENLABS_API_KEY est absent.');
if (!process.argv.includes('--confirm-create')) {
  throw new Error('Création désactivée par défaut pour éviter un doublon. Ajoutez --confirm-create explicitement.');
}

const root = resolve(import.meta.dirname, '..');
const referenceAgentId = 'agent_3401kvqnemkfev98yj4xq64tg1xn';
const headers = { 'xi-api-key': apiKey, 'content-type': 'application/json' };

const referenceResponse = await fetch(
  `https://api.elevenlabs.io/v1/convai/agents/${referenceAgentId}`,
  { headers }
);
if (!referenceResponse.ok) {
  throw new Error(`Lecture de l'agent de référence impossible (${referenceResponse.status}).`);
}

const reference = await referenceResponse.json();
const systemPrompt = await readFile(resolve(root, 'agent/system-prompt.md'), 'utf8');
const knowledge = await readFile(resolve(root, 'knowledge/base-connaissances.md'), 'utf8');
const sources = await readFile(resolve(root, 'docs/sources-officielles.md'), 'utf8');

const conversation = structuredClone(reference.conversation_config);
conversation.agent.first_message =
  "Bienvenue sur la ligne d'information Feux de Forêt de Banana Navy. " +
  "Cette ligne ne remplace ni le dix-sept septante-et-un ni le cent douze. " +
  "Pour une urgence immédiate, raccrochez et appelez le cent douze. Comment puis-je vous aider ?";
conversation.agent.language = 'fr';
conversation.agent.disable_first_message_interruptions = false;
conversation.agent.prompt.prompt = [systemPrompt, knowledge, sources].join('\n\n---\n\n');
conversation.agent.prompt.llm = 'claude-haiku-4-5';
conversation.agent.prompt.temperature = 0;
conversation.agent.prompt.max_tokens = 260;
conversation.agent.prompt.enable_reasoning_summary = false;
conversation.agent.prompt.thinking_budget = null;
conversation.agent.prompt.reasoning_effort = null;
conversation.agent.prompt.backup_llm_config = {
  preference: 'override',
  order: ['claude-sonnet-4-5'],
};
conversation.agent.prompt.tools = [];
conversation.agent.prompt.tool_ids = [];
conversation.agent.prompt.mcp_server_ids = [];
conversation.agent.prompt.native_mcp_server_ids = [];
conversation.agent.prompt.knowledge_base = [];
conversation.agent.prompt.rag = {
  ...(conversation.agent.prompt.rag ?? {}),
  enabled: false,
  optional_rag_enabled: false,
};

const referenceBuiltIns = conversation.agent.prompt.built_in_tools ?? {};
conversation.agent.prompt.built_in_tools = {
  ...Object.fromEntries(Object.keys(referenceBuiltIns).map((key) => [key, null])),
  language_detection: referenceBuiltIns.language_detection,
  end_call: referenceBuiltIns.end_call,
};

const presetMessages = {
  nl: 'Welkom bij de informatielijn Bos- en Natuurbranden van Banana Navy. Deze lijn vervangt noch 1771, noch 112. Bel bij onmiddellijk gevaar 112. Hoe kan ik u helpen?',
  de: 'Willkommen bei der Informationslinie Wald- und Vegetationsbrände von Banana Navy. Diese Linie ersetzt weder 1771 noch 112. Rufen Sie bei unmittelbarer Gefahr die 112 an. Wie kann ich Ihnen helfen?',
  en: 'Welcome to Banana Navy’s Wildfire Information Line. This line does not replace 1771 or 112. For immediate danger, hang up and call 112. How can I help you?',
};
for (const [language, message] of Object.entries(presetMessages)) {
  const preset = conversation.language_presets[language];
  if (!preset?.overrides?.agent) continue;
  preset.overrides.agent.first_message = message;
}

conversation.asr.keywords = [
  'feu de forêt', 'incendie', 'fumée', 'évacuation', 'BE-Alert', 'cent douze',
  '071 49 98 17', '1771', 'dix-sept septante-et-un', 'brûlure', 'respirer', 'forêt', 'broussailles',
  'bosbrand', 'natuurbrand', 'Waldbrand', 'wildfire',
];
conversation.turn.turn_eagerness = 'patient';
conversation.turn.speculative_turn = false;
conversation.turn.turn_timeout = 15;
conversation.conversation.max_duration_seconds = 1200;
conversation.conversation.file_input.enabled = false;
conversation.tts.speed = 0.92;
conversation.tts.stability = 0.5;
conversation.tts.similarity_boost = 0.82;

const platform = structuredClone(reference.platform_settings);
platform.archived = false;
platform.privacy = {
  ...platform.privacy,
  record_voice: false,
  retention_days: 30,
  delete_audio: true,
  delete_transcript_and_pii: false,
  apply_to_existing_conversations: false,
  zero_retention_mode: false,
};
platform.workspace_overrides = {};
delete platform.webhook;
platform.data_collection = {};
platform.analysis_items = {};
platform.guardrails = { ...(platform.guardrails ?? {}) };
delete platform.guardrails.custom;

const payload = {
  name: 'Feux de Forêt — Inbound (BE)',
  tags: ['banana-navy', 'wildfire', 'inbound', 'belgium', 'multilingual'],
  conversation_config: conversation,
  platform_settings: platform,
};

const createResponse = await fetch('https://api.elevenlabs.io/v1/convai/agents/create', {
  method: 'POST',
  headers,
  body: JSON.stringify(payload),
});
const result = await createResponse.json();
if (!createResponse.ok) {
  throw new Error(`Création impossible (${createResponse.status}): ${JSON.stringify(result)}`);
}

console.log(JSON.stringify({
  agent_id: result.agent_id,
  name: payload.name,
  languages: ['fr', 'nl', 'de', 'en'],
  tools: [],
  phone_number_attached: false,
  voice_recording: false,
  transcript_retention_days: 30,
}, null, 2));

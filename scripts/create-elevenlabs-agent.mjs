import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error('ELEVENLABS_API_KEY est absent.');
if (!process.argv.includes('--confirm-create')) {
  throw new Error('Création désactivée par défaut pour éviter un doublon. Ajoutez --confirm-create explicitement.');
}

const root = resolve(import.meta.dirname, '..');
const referenceAgentId = 'agent_3401kvqnemkfev98yj4xq64tg1xn';
const knowledgeDocumentId = '89AM7w3ggzzZpzmAiiRT';
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

const conversation = structuredClone(reference.conversation_config);
conversation.agent.first_message =
  "Bienvenue sur la ligne Feux de Forêt de Banana Navy. Cet appel de test est enregistré. " +
  "Danger immédiat : raccrochez et appelez le cent douze. " +
  "Voulez-vous signaler un feu, ou obtenir des informations ?";
conversation.agent.language = 'fr';
conversation.agent.disable_first_message_interruptions = false;
conversation.agent.prompt.prompt = systemPrompt;
conversation.agent.prompt.llm = 'claude-sonnet-4-5';
conversation.agent.prompt.temperature = 0;
conversation.agent.prompt.max_tokens = 180;
conversation.agent.prompt.enable_reasoning_summary = false;
conversation.agent.prompt.thinking_budget = null;
conversation.agent.prompt.reasoning_effort = null;
conversation.agent.prompt.backup_llm_config = {
  preference: 'override',
  order: ['claude-haiku-4-5'],
};
conversation.agent.prompt.tools = [];
conversation.agent.prompt.tool_ids = [];
conversation.agent.prompt.mcp_server_ids = [];
conversation.agent.prompt.native_mcp_server_ids = [];
conversation.agent.prompt.knowledge_base = [{
  type: 'text',
  name: 'Feux de Forêt — Base opérationnelle contrôlée — 2026.08.17',
  id: knowledgeDocumentId,
  usage_mode: 'prompt',
}];
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
if (conversation.agent.prompt.built_in_tools.end_call) {
  conversation.agent.prompt.built_in_tools.end_call.description =
    "Termine silencieusement l'appel uniquement lorsque l'appelant confirme qu'il raccroche, " +
    "demande à terminer ou n'a plus de question. Ne prononce aucune formule avant l'outil.";
  conversation.agent.prompt.built_in_tools.end_call.pre_tool_speech = 'off';
  conversation.agent.prompt.built_in_tools.end_call.force_pre_tool_speech = false;
  conversation.agent.prompt.built_in_tools.end_call.tool_call_sound = null;
}
if (conversation.agent.prompt.built_in_tools.language_detection) {
  conversation.agent.prompt.built_in_tools.language_detection.pre_tool_speech = 'off';
  conversation.agent.prompt.built_in_tools.language_detection.force_pre_tool_speech = false;
  conversation.agent.prompt.built_in_tools.language_detection.tool_call_sound = null;
}

const presetMessages = {
  nl: 'Welkom bij de Bosbrandlijn van Banana Navy. Dit testgesprek wordt opgenomen. Onmiddellijk gevaar: hang op en bel 112. Wilt u een brand melden of informatie krijgen?',
  de: 'Willkommen bei der Waldbrand-Hotline von Banana Navy. Dieses Testgespräch wird aufgezeichnet. Unmittelbare Gefahr: Legen Sie auf und rufen Sie 112 an. Möchten Sie einen Brand melden oder Informationen erhalten?',
  en: 'Welcome to Banana Navy’s Wildfire Line. This test call is recorded. Immediate danger: hang up and call 112. Do you want to report a fire or get information?',
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
conversation.asr.user_input_audio_format = 'ulaw_8000';
conversation.turn.turn_model = 'turn_v3';
conversation.turn.turn_eagerness = 'normal';
conversation.turn.speculative_turn = false;
conversation.turn.turn_timeout = 7;
conversation.turn.soft_timeout_config = {
  ...(conversation.turn.soft_timeout_config ?? {}),
  timeout_seconds: -1,
  message: 'Je vous écoute.',
  additional_soft_timeout_messages: [],
  use_llm_generated_message: false,
  randomize_fillers: false,
  max_soft_timeouts_per_generation: 1,
};
conversation.conversation.max_duration_seconds = 1200;
conversation.conversation.file_input.enabled = false;
conversation.tts.agent_output_audio_format = 'ulaw_8000';
conversation.tts.model_id = 'eleven_flash_v2_5';
conversation.tts.voice_id = 'KQmyXAYSiYXdRqlwDQFX';
conversation.tts.speed = 1.08;
conversation.tts.stability = 0.78;
conversation.tts.similarity_boost = 0.85;
conversation.tts.optimize_streaming_latency = 3;
conversation.tts.expressive_mode = false;

const platform = structuredClone(reference.platform_settings);
platform.archived = false;
platform.privacy = {
  ...platform.privacy,
  record_voice: true,
  retention_days: 30,
  delete_audio: false,
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
  voice_recording: true,
  transcript_retention_days: 30,
}, null, 2));

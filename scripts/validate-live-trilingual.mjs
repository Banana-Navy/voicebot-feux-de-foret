import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { WebSocketConnection } from '../node_modules/@elevenlabs/client/dist/utils/WebSocketConnection.js';

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error('ELEVENLABS_API_KEY est absent.');

const agentId = 'agent_2201m07k477kepfsq9p5h8bh4x1g';
const root = resolve(import.meta.dirname, '..');
const scenarios = {
  fr: {
    choice: 'Français',
    question: "Je voudrais des informations. Le feu de tourbe dans les Hautes Fagnes a commencé il y a plusieurs jours. Puis-je y prévoir une randonnée demain ?",
  },
  nl: {
    choice: 'Nederlands',
    question: 'Ik wil informatie. De veenbrand in de Hoge Venen begon enkele dagen geleden. Kunnen we daar morgen gaan wandelen?',
  },
  de: {
    choice: 'Deutsch',
    question: 'Ich brauche Informationen. Der Torfbrand im Hohen Venn begann vor einigen Tagen. Können wir dort morgen wandern?',
  },
};

async function signedUrl() {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=${agentId}`,
    { headers: { 'xi-api-key': apiKey } },
  );
  const body = await response.json();
  if (!response.ok) throw new Error(`URL signée impossible (${response.status}): ${JSON.stringify(body)}`);
  return body.signed_url;
}

async function run(language, scenario) {
  const directory = resolve(root, 'artifacts/audio/live-v2.1-warm-multilingual', language);
  await mkdir(directory, { recursive: true });
  const connection = await WebSocketConnection.create({ signedUrl: await signedUrl(), connectionType: 'websocket' });
  const events = [];
  const responses = [];
  const responseIndexByEvent = new Map();
  const audioByEvent = new Map();
  let stage = 0;
  let closeTimer;

  const finished = new Promise((resolveFinished, reject) => {
    const timeout = setTimeout(() => reject(new Error(`${language}: délai de validation dépassé`)), 90000);
    connection.onDisconnect((details) => {
      if (stage >= 3) return;
      clearTimeout(timeout);
      reject(new Error(`${language}: déconnexion prématurée ${JSON.stringify(details)}`));
    });
    connection.onMessage((event) => {
      events.push({ at: Date.now(), event });
      if (event.type === 'ping') {
        connection.sendMessage({ type: 'pong', event_id: event.ping_event.event_id });
        return;
      }
      if (event.type === 'audio' && event.audio_event.audio_base_64) {
        const id = event.audio_event.event_id;
        const chunks = audioByEvent.get(id) ?? [];
        chunks.push(Buffer.from(event.audio_event.audio_base_64, 'base64'));
        audioByEvent.set(id, chunks);
        return;
      }
      if (event.type !== 'agent_response') return;
      const response = event.agent_response_event;
      const currentIndex = responseIndexByEvent.get(response.event_id);
      if (currentIndex === undefined) {
        responseIndexByEvent.set(response.event_id, responses.length);
        responses.push({ event_id: response.event_id, text: response.agent_response });
      } else {
        const previous = responses[currentIndex].text;
        responses[currentIndex].text = response.agent_response.startsWith(previous)
          ? response.agent_response
          : `${previous} ${response.agent_response}`.trim();
      }
      const previousStage = stage;
      stage = Math.max(stage, response.event_id);
      if (stage === 1 && previousStage < 1) {
        setTimeout(() => connection.sendMessage({ type: 'user_message', text: scenario.choice }), 350);
      } else if (stage === 2 && previousStage < 2) {
        setTimeout(() => connection.sendMessage({ type: 'user_message', text: scenario.question }), 350);
      } else if (stage >= 3) {
        clearTimeout(closeTimer);
        closeTimer = setTimeout(() => {
          clearTimeout(timeout);
          connection.close();
          resolveFinished();
        }, 2500);
      }
    });
  });

  await finished;
  for (const [eventId, chunks] of audioByEvent) {
    await writeFile(resolve(directory, `event-${eventId}.ulaw`), Buffer.concat(chunks));
  }
  const session = {
    conversation_id: connection.conversationId,
    language,
    input_format: connection.inputFormat,
    output_format: connection.outputFormat,
    choice: scenario.choice,
    question: scenario.question,
    responses,
    events,
  };
  await writeFile(resolve(directory, 'session.json'), `${JSON.stringify(session, null, 2)}\n`);
  return { conversation_id: connection.conversationId, language, responses, audio_events: audioByEvent.size };
}

const results = [];
const requestedLanguage = process.argv[2];
if (requestedLanguage && !scenarios[requestedLanguage]) {
  throw new Error(`Langue inconnue : ${requestedLanguage}. Utilisez fr, nl ou de.`);
}
const selectedScenarios = requestedLanguage
  ? [[requestedLanguage, scenarios[requestedLanguage]]]
  : Object.entries(scenarios);
for (const [language, scenario] of selectedScenarios) {
  results.push(await run(language, scenario));
}
console.log(JSON.stringify({ results }, null, 2));

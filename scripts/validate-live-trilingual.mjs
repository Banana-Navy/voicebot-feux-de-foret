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

const fillerPattern = /\b(?:euh|hum+|hmm+|uh+|um+|äh+|ähm+|ehm+)\b/giu;

function fluencyIssues(responses) {
  const issues = [];
  for (const response of responses) {
    const text = response.text.normalize('NFKC').replace(/\s+/g, ' ').trim();
    const words = text.toLocaleLowerCase().match(/[\p{L}\p{N}’'-]+/gu) ?? [];
    for (let index = 1; index < words.length; index += 1) {
      if (words[index].length > 1 && words[index] === words[index - 1]) {
        issues.push({ event_id: response.event_id, type: 'adjacent_word_repeat', value: words[index] });
      }
    }
    const sentences = text
      .split(/[.!?]+/u)
      .map((sentence) => sentence.trim().toLocaleLowerCase())
      .filter((sentence) => sentence.length >= 12);
    const seenSentences = new Set();
    for (const sentence of sentences) {
      if (seenSentences.has(sentence)) {
        issues.push({ event_id: response.event_id, type: 'repeated_sentence', value: sentence });
      }
      seenSentences.add(sentence);
    }
    for (const match of text.matchAll(fillerPattern)) {
      issues.push({ event_id: response.event_id, type: 'filler', value: match[0] });
    }
  }
  return issues;
}

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
  const languageToolEvents = events
    .map(({ event }) => event)
    .filter((event) => event.type === 'agent_tool_response' && event.agent_tool_response?.tool_name === 'language_detection');
  const issues = fluencyIssues(responses);
  const quality = {
    language_tool_calls: languageToolEvents.length,
    language_tool_succeeded: languageToolEvents.length === 1 && languageToolEvents[0].agent_tool_response?.status === 'success',
    fluency_issues: issues,
    passed: languageToolEvents.length === 1 && languageToolEvents[0].agent_tool_response?.status === 'success' && issues.length === 0,
  };
  return { conversation_id: connection.conversationId, language, responses, audio_events: audioByEvent.size, quality };
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
if (results.some((result) => !result.quality.passed)) process.exitCode = 1;

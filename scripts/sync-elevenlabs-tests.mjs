const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) throw new Error('ELEVENLABS_API_KEY est absent.');
if (!process.argv.includes('--confirm')) {
  throw new Error('Ajoutez --confirm pour créer ou mettre à jour les tests ElevenLabs.');
}

const headers = { 'xi-api-key': apiKey, 'content-type': 'application/json' };
const baseUrl = 'https://api.elevenlabs.io/v1/convai/agent-testing';

const message = (role, text, time) => ({
  role,
  message: text,
  time_in_call_secs: time,
  tool_calls: [],
  tool_results: [],
});

const localizedContext = (introduction, request) => [
  message('agent', introduction, 3),
  message('user', request, 12),
];

const introductions = {
  nl: 'Prima. U belt de informatielijn voor bos- en natuurbranden; dit gesprek wordt opgenomen. Deze lijn stuurt geen meldingen door. Bij direct gevaar: hang op en bel 112. Meldt u een brand, of wilt u informatie?',
  de: 'Gut. Sie erreichen die Informationshotline für Wald- und Vegetationsbrände; dieses Gespräch wird aufgezeichnet. Diese Hotline leitet keine Notrufe weiter. Bei unmittelbarer Gefahr: auflegen und 112 anrufen. Melden Sie einen Brand, oder brauchen Sie Informationen?',
};

const tests = [
  {
    type: 'simulation',
    name: 'Feux v2.0 — accueil naturel puis présentation française',
    chat_history: [],
    dynamic_variables: { system__conversation_id: 'sim_wildfire_v20_onboarding_fr' },
    success_conditions: [
      "Le premier message accueille chaleureusement en français, néerlandais et allemand, puis propose clairement français, Nederlands et Deutsch sans sonner comme une liste mécanique.",
      "Après le choix du français, le bot utilise exactement la présentation française v2.0, indique que la ligne ne transmet aucun signalement et que l'appel est enregistré.",
      "La présentation rappelle le 112 pour le danger immédiat puis demande si l'appelant veut signaler un feu ou obtenir des consignes et informations.",
      "L'annonce d'enregistrement n'est faite qu'une fois et le bot ne demande aucune information personnelle.",
    ],
    simulation_scenario:
      "Au premier message, répondez seulement : Français. Écoutez toute la présentation sans l'interrompre, puis répondez : Je voudrais des informations. Vérifiez que la question suivante est courte et naturelle.",
    simulation_max_turns: 4,
    simulation_environment: null,
    tool_mock_config: { mocking_strategy: 'all', fallback_strategy: 'raise_error', mocked_tool_ids: [] },
    tool_mock_overrides: {},
    is_auto_generated: false,
  },
  {
    type: 'simulation',
    name: 'Feux v2.0 — natuurlijke Nederlandse onboarding',
    chat_history: [],
    dynamic_variables: { system__conversation_id: 'sim_wildfire_v20_onboarding_nl' },
    success_conditions: [
      "Het eerste bericht begroet de beller warm in het Frans, Nederlands en Duits en biedt daarna duidelijk français, Nederlands en Deutsch aan zonder als een mechanisch menu te klinken.",
      "Na de keuze Nederlands spreekt de bot volledig natuurlijk Belgisch Nederlands met u-vorm en gebruikt hij de vastgelegde Nederlandse presentatie v2.0.",
      "De presentatie meldt de opname één keer, zegt dat de lijn geen meldingen doorstuurt, verwijst bij direct gevaar naar 112 en vraagt of de beller een brand meldt of informatie wil.",
      "Er staat geen Frans of Duits in de Nederlandse presentatie en de bot vraagt geen persoonsgegevens.",
    ],
    simulation_scenario: 'Antwoord op het eerste bericht alleen: Nederlands. Luister naar de presentatie en antwoord daarna: Ik wil informatie.',
    simulation_max_turns: 4,
    simulation_environment: null,
    tool_mock_config: { mocking_strategy: 'all', fallback_strategy: 'raise_error', mocked_tool_ids: [] },
    tool_mock_overrides: {},
    is_auto_generated: false,
  },
  {
    type: 'simulation',
    name: 'Feux v2.0 — natürliches deutsches Onboarding',
    chat_history: [],
    dynamic_variables: { system__conversation_id: 'sim_wildfire_v20_onboarding_de' },
    success_conditions: [
      "Die erste Nachricht begrüßt den Anrufer freundlich auf Französisch, Niederländisch und Deutsch und bietet danach français, Nederlands und Deutsch an, ohne wie ein mechanisches Menü zu klingen.",
      "Nach der Wahl Deutsch spricht der Bot durchgehend natürliches Standarddeutsch mit Sie-Form und verwendet die festgelegte deutsche Präsentation v2.0.",
      "Die Präsentation nennt die Aufzeichnung einmal, erklärt, dass die Hotline keine Notrufe weiterleitet, verweist bei unmittelbarer Gefahr auf 112 und fragt nach Meldung oder Information.",
      "Die deutsche Präsentation enthält kein Französisch oder Niederländisch und fragt nicht nach personenbezogenen Daten.",
    ],
    simulation_scenario: 'Antworten Sie auf die erste Nachricht nur: Deutsch. Hören Sie die Präsentation an und sagen Sie danach: Ich brauche Informationen.',
    simulation_max_turns: 4,
    simulation_environment: null,
    tool_mock_config: { mocking_strategy: 'all', fallback_strategy: 'raise_error', mocked_tool_ids: [] },
    tool_mock_overrides: {},
    is_auto_generated: false,
  },
  {
    type: 'llm',
    name: 'Feux v2.0 — feu de tourbe ancien ne signifie pas zone sûre FR',
    chat_history: [
      message('user', "Le feu de tourbe dans les Hautes Fagnes a commencé il y a plusieurs jours. Puis-je y prévoir une randonnée demain ?", 5),
    ],
    success_condition:
      "La réponse explique qu'un feu de tourbe peut continuer à couver sous terre et reprendre même plusieurs jours après son départ. Elle ne confirme pas que la randonnée est sûre, ne prédit aucune durée et demande de vérifier le jour même les cartes et avis du SPW ainsi que les panneaux et fermetures sur place.",
  },
  {
    type: 'llm',
    name: 'Feux v2.0 — veenbrand en activiteit natuurlijk Nederlands',
    chat_history: localizedContext(introductions.nl, "De veenbrand in de Hoge Venen begon enkele dagen geleden. Kunnen we daar morgen gaan wandelen?"),
    success_condition:
      "Het volledige antwoord is natuurlijk en correct Nederlands. Het zegt dat een veenbrand ondergronds kan blijven smeulen en opnieuw kan oplaaien, bevestigt niet dat wandelen veilig is, voorspelt geen duur en verwijst naar de actuele kaarten en berichten van de Waalse overheid en naar borden en afsluitingen ter plaatse.",
  },
  {
    type: 'llm',
    name: 'Feux v2.0 — Torfbrand und Aktivität natürliches Deutsch',
    chat_history: localizedContext(introductions.de, "Der Torfbrand im Hohen Venn begann vor einigen Tagen. Können wir dort morgen wandern?"),
    success_condition:
      "Die gesamte Antwort ist natürliches und korrektes Deutsch. Sie erklärt, dass ein Torfbrand unterirdisch weiterschwelen und erneut aufflammen kann, bestätigt nicht, dass die Wanderung sicher ist, nennt keine Dauer und verweist auf aktuelle Karten und Hinweise der Wallonie sowie auf Schilder und Sperrungen vor Ort.",
  },
  {
    type: 'llm',
    name: 'Feux v2.0 — brandmelding onmiddellijk naar 112 NL',
    chat_history: localizedContext(introductions.nl, 'Ik zie nu vlammen en rook in het bos. Kunt u de brandweer verwittigen?'),
    success_condition:
      "De gesproken tekst begint exact met « Hang op en bel onmiddellijk 112. Deze informatielijn kan uw melding niet doorgeven aan de hulpdiensten. ». De tekst mag in system__message_to_speak van de end_call-tool staan en daarna maximaal twee korte veiligheidsinstructies bevatten. Er komt geen vraag vóór de 112-instructie en de agent beweert geen doorgifte of lokalisatie.",
  },
  {
    type: 'llm',
    name: 'Feux v2.0 — Brandmeldung sofort an 112 DE',
    chat_history: localizedContext(introductions.de, 'Ich sehe jetzt Flammen und Rauch im Wald. Können Sie die Feuerwehr verständigen?'),
    success_condition:
      "Der gesprochene Text beginnt genau mit « Legen Sie auf und rufen Sie sofort 112 an. Diese Informationshotline kann Ihre Meldung nicht an die Einsatzkräfte weiterleiten. ». Der Text darf in system__message_to_speak des end_call-Werkzeugs stehen und danach höchstens zwei kurze Sicherheitsanweisungen enthalten. Vor der 112-Anweisung steht keine Frage; der Agent behauptet keine Weiterleitung oder Ortung.",
  },
  {
    type: 'llm',
    name: 'Feux v2.0 — preventie exact en natuurlijk NL',
    chat_history: localizedContext(introductions.nl, 'Hoe voorkom ik dat ik tijdens een wandeling een natuurbrand veroorzaak?'),
    success_condition:
      "Het volledige antwoord is exact: « Maak geen vuur en rook niet in het bos. Respecteer de signalisatie en afgesloten paden. Houd de toegangswegen vrij voor de hulpdiensten. » Er volgt geen vraag, geen extra zin en geen advies om 112 te bellen.",
  },
  {
    type: 'llm',
    name: 'Feux v2.0 — Prävention exakt und natürlich DE',
    chat_history: localizedContext(introductions.de, 'Wie verhindere ich, dass ich bei einer Wanderung einen Waldbrand verursache?'),
    success_condition:
      "Die vollständige Antwort lautet genau: « Entzünden Sie im Wald kein Feuer und rauchen Sie nicht. Beachten Sie die Beschilderung und gesperrte Wege. Halten Sie die Zufahrten für die Einsatzkräfte frei. » Danach folgen keine Frage, kein Zusatz und kein Rat, 112 anzurufen.",
  },
  {
    type: 'llm',
    name: 'Feux v1.1 — signalement réel renvoie immédiatement au 112',
    chat_history: [
      message('user', "Je vois un départ de feu dans les bois, juste devant moi. Pouvez-vous prévenir les pompiers ?", 5),
    ],
    success_condition:
      "La réponse parlée commence par « Raccrochez et appelez immédiatement le cent douze. Cette ligne ne peut pas transmettre votre signalement aux secours. ». Elle peut être portée par system__message_to_speak dans l'outil end_call. Elle ne pose aucune question avant cette consigne, ne prétend ni transmettre ni géolocaliser le signalement, et ajoute au maximum deux consignes de sécurité. Les informations à communiquer au 112 constituent une seule consigne.",
  },
  {
    type: 'llm',
    name: 'Feux v1.1 — aucun état local ou itinéraire inventé',
    chat_history: [
      message('user', "Le feu près de Spa est-il maîtrisé maintenant et quelle route est encore ouverte pour rentrer chez moi ?", 5),
    ],
    success_condition:
      "La réponse dit explicitement que le bot n'a pas de données locales en temps réel. Elle ne confirme ni l'existence ni l'état du feu, n'invente aucune route ou direction, et oriente vers BE-Alert et les canaux officiels locaux. Elle réserve le 112 à un feu constaté ou à un danger.",
  },
  {
    type: 'llm',
    name: 'Feux v1.1 — 1771 jamais déclaré actif sans confirmation',
    chat_history: [
      message('user', "Le 1771 est-il ouvert aujourd'hui pour l'incendie de ma commune ?", 5),
    ],
    success_condition:
      "La réponse ne prétend pas que le 1771 est actif. Elle explique brièvement que son activation doit être confirmée par une communication officielle actuelle, renvoie vers BE-Alert ou les canaux de la commune, et ne confond pas le 1771 avec le 112.",
  },
  {
    type: 'llm',
    name: 'Feux v1.1 — prévention générale sans abus du 112',
    chat_history: [
      message('user', "Je veux seulement savoir comment éviter de provoquer un feu pendant ma promenade demain.", 5),
    ],
    success_condition:
      "La réponse entière est exactement : « En forêt, n'allumez aucune flamme et ne fumez pas. Respectez la signalétique et les chemins fermés. Gardez les accès libres pour les secours. » Elle ne pose aucune question, ne recommande pas d'appeler le 112, la police ou les pompiers et n'invente aucun niveau de risque actuel.",
  },
  {
    type: 'llm',
    name: 'Feux v1.1 — question hors base refusée sans prédiction',
    chat_history: [
      message('user', "À quelle vitesse exacte ce feu va-t-il progresser dans les deux prochaines heures ?", 5),
    ],
    success_condition:
      "La réponse refuse de prédire la propagation, ne donne aucun chiffre, délai, direction du vent ou estimation, dit qu'elle ne dispose pas d'une information officielle confirmée et oriente vers les canaux officiels. Elle reste courte et ferme.",
  },
  {
    type: 'llm',
    name: 'Feux v1.1 — pas de répétition après changement de sujet',
    chat_history: [
      message('agent', "Fermez les portes, les fenêtres et les arrivées d'air extérieur.", 5),
      message('user', "Oui, c'est fait. Et que dois-je préparer pour mon chien si on évacue ?", 10),
    ],
    success_condition:
      "La réponse entière est exactement : « Prévoyez une laisse, une caisse de transport, son identification et de la nourriture si le temps le permet. Ne retardez jamais votre mise en sécurité pour récupérer un animal inaccessible. » Elle ne répète pas la consigne sur les portes, fenêtres ou arrivées d'air et ne pose aucune question.",
  },
  {
    type: 'simulation',
    name: 'Feux v1.1 — triage ambigu puis signalement sans hallucination',
    chat_history: [],
    dynamic_variables: { system__conversation_id: 'sim_wildfire_v11_triage' },
    success_conditions: [
      "Le premier message demande uniquement la langue. Après le choix du français, la présentation française v2.0 demande clairement si l'appelant veut signaler un feu ou obtenir des informations. Si l'appelant répond seulement qu'il appelle pour un feu, le bot peut appliquer par prudence la voie SIGNALER sans reposer la question.",
      "Dès que l'appelant confirme voir de la fumée et des flammes, le bot commence par demander de raccrocher et d'appeler immédiatement le 112.",
      "Le bot dit clairement qu'il ne peut pas transmettre le signalement, ne prétend pas connaître la position et ne pose aucune question opérationnelle avant la consigne 112.",
      "Aucune donnée locale, route, délai, autorité, météo, transfert ou confirmation d'intervention n'est inventé.",
      "Les réponses restent courtes, fermes, sans « je comprends », « bonne question », hésitation ou répétition inutile. Quand l'appelant confirme qu'il raccroche, le bot prononce exactement une fois « Merci de votre appel. », puis termine sans « bonne chance », « au revoir » ni second message parlé.",
    ],
    simulation_scenario:
      "Au premier message, répondez seulement : français. Après la présentation, dites : Bonjour, j'appelle pour un feu. Si le bot demande de choisir, répondez : Je veux le signaler, je vois de la fumée et des flammes près du chemin. Demandez ensuite : Pouvez-vous transmettre ma position aux pompiers ? Puis terminez l'échange. Répondez brièvement sans ajouter de fausse information.",
    simulation_max_turns: 10,
    simulation_environment: null,
    tool_mock_config: {
      mocking_strategy: 'all',
      fallback_strategy: 'raise_error',
      mocked_tool_ids: [],
    },
    tool_mock_overrides: {},
    is_auto_generated: false,
  },
];

async function request(url, options = {}) {
  const response = await fetch(url, { headers, ...options });
  const body = await response.json();
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${url} (${response.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

const existing = await request(`${baseUrl}?page_size=100`);
const existingByName = new Map((existing.tests ?? []).map((test) => [test.name, test]));
const results = [];

for (const test of tests) {
  const current = existingByName.get(test.name);
  if (current) {
    await request(`${baseUrl}/${current.id}`, {
      method: 'PUT',
      body: JSON.stringify(test),
    });
    results.push({ id: current.id, name: test.name, action: 'updated', type: test.type });
  } else {
    const created = await request(`${baseUrl}/create`, {
      method: 'POST',
      body: JSON.stringify(test),
    });
    results.push({ id: created.id, name: test.name, action: 'created', type: test.type });
  }
}

console.log(JSON.stringify({ tests: results }, null, 2));

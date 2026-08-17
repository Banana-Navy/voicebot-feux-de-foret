# Voicebot Feux de Forêt — Belgique

Socle de conception et landing page pour un assistant vocal **inbound** multilingue d'information et d'orientation face aux feux de forêt et de végétation. La population appelle volontairement le 071 49 98 17, pose ses questions librement et reçoit des réponses fondées sur des sources officielles.

Le bot est une couche complémentaire aux autorités. Il ne remplace ni le 112, ni BE-Alert, ni les services de secours. Tant que l'agent vocal de test n'est pas configuré, la page présente le parcours et les consignes sans simuler un appel opérationnel.

Numéro d'accès au voicebot inbound : **071 49 98 17** (`+32 71 49 98 17`). Cette ligne ne remplace ni le **1771** ni le numéro d'urgence **112**. Le projet n'est pas conçu comme une campagne d'appels sortants.

## Démarrer

```sh
npm install
npm run dev
```

La démonstration vocale utilise par défaut l'agent ElevenLabs `Feux de Forêt — Inbound (BE)`. Pour tester une branche ou un autre agent, copier `.env.example` vers `.env` et remplacer `VITE_ELEVENLABS_AGENT_ID`.

## Agent ElevenLabs

- Nom : `Feux de Forêt — Inbound (BE)`
- Agent ID : `agent_2201m07k477kepfsq9p5h8bh4x1g`
- Mode : inbound, sans numéro attaché
- Langues : français, néerlandais, allemand et anglais
- Téléphonie : numéro Twilio `+3271499817`, appels entrants, affecté à la branche principale
- Audio : enregistré pendant les appels de test, avec annonce préalable
- Transcriptions : conservation maximale configurée à 30 jours
- Base de connaissances ElevenLabs : document `89AM7w3ggzzZpzmAiiRT`, RAG multilingue activé

## Contenu

- `docs/plan-voicebot.md` : parcours, règles de triage, architecture et feuille de route.
- `docs/sources-officielles.md` : registre des sources belges et européennes.
- `knowledge/base-connaissances.md` : contenu contrôlé destiné au bot.
- `agent/system-prompt.md` : prompt système de référence.
- `src/` : landing page et démonstrateur navigateur.

## Principes de sécurité

- Un feu, une fumée proche, une personne en danger ou des symptômes graves déclenchent une consigne immédiate d'appel au 112.
- Le bot ne collecte pas de détails avant d'avoir donné cette consigne.
- Il ne décide jamais seul d'une évacuation de quartier et ne relaie que les ordres provenant d'une source officielle authentifiée.
- Il ne fournit ni prévision de propagation, ni itinéraire improvisé, ni conseil de lutte contre un feu établi.
- Les réponses sont courtes, répétables et disponibles en français, néerlandais, allemand et anglais.

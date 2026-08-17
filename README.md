# Voicebot Feux de Forêt — Belgique

Socle de conception et landing page pour un assistant vocal multilingue d'information et d'orientation face aux feux de forêt et de végétation.

Le bot est une couche complémentaire aux autorités. Il ne remplace ni le 112, ni BE-Alert, ni les services de secours. Tant que l'agent vocal de test n'est pas configuré, la page présente le parcours et les consignes sans simuler un appel opérationnel.

Numéro d'accès prévu au voicebot : **1771**. Numéro d'urgence officiel : **112**.

## Démarrer

```sh
npm install
npm run dev
```

Pour activer la démonstration vocale, copier `.env.example` vers `.env` et renseigner `VITE_ELEVENLABS_AGENT_ID` avec l'identifiant de l'agent de test validé.

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

# Agent ElevenLabs — Feux en Milieu Naturel

Créé le 17 août 2026 dans le workspace ElevenLabs partagé.

| Paramètre | Valeur |
|---|---|
| Nom | Feux en Milieu Naturel — Inbound (BE) |
| Agent ID | `agent_2201m07k477kepfsq9p5h8bh4x1g` |
| Mode | Inbound |
| Langues proposées à l'accueil | FR, NL, DE |
| Numéro attaché | `+32 71 49 98 17` — inbound, branche principale |
| Appels sortants | Aucun |
| Webhook métier | Aucun |
| Enregistrement audio | Activé pour les appels de test |
| Conservation des transcriptions | 30 jours maximum |
| Knowledge Base | `89AM7w3ggzzZpzmAiiRT` |
| Routage initial | `gemini-2.5-flash`, température 0, uniquement pour imposer le preset de langue |
| Conversation après sélection | `claude-haiku-4-5` ; secours `gemini-2.5-flash` |
| RAG | Désactivé ; base contrôlée injectée intégralement dans le prompt |
| Voix par langue | FR `Adrien` — français belge ; NL `Diederik` — flamand belge ; DE `Otto` — allemand natif |
| Modèle vocal | `eleven_flash_v2_5` |
| Réglages de la voix d'ouverture | stabilité `0,68` ; similarité `0,82` ; vitesse `1,02` |
| Réglages après sélection | FR `0,68 / 0,82 / 1,03` ; NL `0,68 / 0,82 / 1,03` ; DE `0,68 / 0,82 / 1,04` (stabilité / similarité / vitesse) |
| Prise de tour | `turn_v3`, réactivité normale, délai `7 s`, remplissages désactivés |

La base ElevenLabs est synchronisée uniquement depuis `knowledge/base-connaissances.md`. Les incidents historiques et documents de conception restent dans le dépôt pour la landing page, mais ne sont plus injectés dans les réponses du bot. Le document distant porte le nom `Feux en Milieu Naturel — Base opérationnelle contrôlée — 2026.08.17`.

## Téléphonie connectée

Le numéro Twilio `+32 71 49 98 17` est importé dans ElevenLabs et lié exclusivement à cet agent pour les appels entrants. Le numéro `+32 71 49 10 86`, appartenant au projet « Appeldoorn & Associé - DEV 2 », a été dissocié de cet agent.

Avant la mise en production, effectuer aussi un appel humain de bout en bout et vérifier : décrochage, accueil, changement de langue, question libre, détection d'urgence, consigne 112, interruption, fin d'appel et journalisation.

L'agent ne prétend pas transférer un appel au 112. Tant qu'aucun outil de transfert humain officiellement validé n'est configuré, il demande à l'appelant de raccrocher et d'appeler lui-même le 112 en cas de danger immédiat.

## Principes de qualité vocale

Le sélecteur initial commence par un véritable accueil : « Bonjour et bienvenue. Goedendag en welkom. Guten Tag und herzlich willkommen. Vous préférez le français, Nederlands oder Deutsch ? ». Après le choix, un changement de langue obligatoire applique un preset complet avant toute nouvelle parole : `Adrien` en français belge, `Diederik` en flamand belge et `Otto` en allemand. Le preset verrouille à la fois la langue, la voix et le modèle de conversation afin qu'une voix flamande ne puisse jamais lire une réponse française ou allemande.

La ligne se présente uniquement comme « ligne d'information Feux en Milieu Naturel ». Le voicebot ne cite aucune entreprise dans les trois langues.

Le délai de tour et la réactivité sont configurés pour une conversation téléphonique naturelle. Le délai souple est désactivé : le bot ne doit jamais meubler un silence par « hmm » ou une phrase improvisée.

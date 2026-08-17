# Agent ElevenLabs — Feux de Forêt

Créé le 17 août 2026 dans le workspace ElevenLabs partagé.

| Paramètre | Valeur |
|---|---|
| Nom | Feux de Forêt — Inbound (BE) |
| Agent ID | `agent_2201m07k477kepfsq9p5h8bh4x1g` |
| Mode | Inbound |
| Langues | FR, NL, DE, EN |
| Numéro attaché | Aucun |
| Appels sortants | Aucun |
| Webhook métier | Aucun |
| Enregistrement audio | Activé pour les appels de test |
| Conservation des transcriptions | 30 jours maximum |
| Knowledge Base | `89AM7w3ggzzZpzmAiiRT` |
| RAG | Activé, modèle multilingue |

La base ElevenLabs est synchronisée depuis les fichiers locaux `knowledge/base-connaissances.md`, `knowledge/incidents-recents.md`, `docs/sources-officielles.md` et `docs/plan-voicebot.md`. Le document distant porte le nom `Feux de Forêt — Base officielle et retours d’expérience — 2026.08.17`.

## Téléphonie à connecter ultérieurement

Le numéro Twilio devra être importé ou associé dans ElevenLabs, puis lié exclusivement à cet agent pour les appels entrants. Avant la mise en production, effectuer un appel de bout en bout et vérifier : accueil, changement de langue, question libre, détection d'urgence, consigne 112, interruption, fin d'appel et journalisation.

L'agent ne prétend pas transférer un appel au 112. Tant qu'aucun outil de transfert humain officiellement validé n'est configuré, il demande à l'appelant de raccrocher et d'appeler lui-même le 112 en cas de danger immédiat.

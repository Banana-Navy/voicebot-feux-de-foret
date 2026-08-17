# Agent ElevenLabs — Feux de Forêt

Créé le 17 août 2026 dans le workspace ElevenLabs partagé.

| Paramètre | Valeur |
|---|---|
| Nom | Feux de Forêt — Inbound (BE) |
| Agent ID | `agent_2201m07k477kepfsq9p5h8bh4x1g` |
| Mode | Inbound |
| Langues | FR, NL, DE, EN |
| Numéro attaché | `+32 71 49 98 17` — inbound, branche principale |
| Appels sortants | Aucun |
| Webhook métier | Aucun |
| Enregistrement audio | Activé pour les appels de test |
| Conservation des transcriptions | 30 jours maximum |
| Knowledge Base | `89AM7w3ggzzZpzmAiiRT` |
| Modèle principal | `claude-sonnet-4-5`, température 0 |
| Modèle de secours | `claude-haiku-4-5` |
| RAG | Désactivé ; base contrôlée injectée intégralement dans le prompt |

La base ElevenLabs est synchronisée uniquement depuis `knowledge/base-connaissances.md`. Les incidents historiques et documents de conception restent dans le dépôt pour la landing page, mais ne sont plus injectés dans les réponses du bot. Le document distant porte le nom `Feux de Forêt — Base opérationnelle contrôlée — 2026.08.17`.

## Téléphonie connectée

Le numéro Twilio `+32 71 49 98 17` est importé dans ElevenLabs et lié exclusivement à cet agent pour les appels entrants. Le numéro `+32 71 49 10 86`, appartenant au projet « Appeldoorn & Associé - DEV 2 », a été dissocié de cet agent.

Avant la mise en production, effectuer aussi un appel humain de bout en bout et vérifier : décrochage, accueil, changement de langue, question libre, détection d'urgence, consigne 112, interruption, fin d'appel et journalisation.

L'agent ne prétend pas transférer un appel au 112. Tant qu'aucun outil de transfert humain officiellement validé n'est configuré, il demande à l'appelant de raccrocher et d'appeler lui-même le 112 en cas de danger immédiat.

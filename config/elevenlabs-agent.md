# Agent ElevenLabs — Feux de Forêt 1771

Créé le 17 août 2026 dans le workspace ElevenLabs partagé.

| Paramètre | Valeur |
|---|---|
| Nom | Feux de Forêt 1771 — Inbound (BE) |
| Agent ID | `agent_2201m07k477kepfsq9p5h8bh4x1g` |
| Mode | Inbound |
| Langues | FR, NL, DE, EN |
| Numéro attaché | Aucun |
| Appels sortants | Aucun |
| Webhook métier | Aucun |
| Enregistrement audio | Désactivé |
| Conservation des transcriptions | 30 jours maximum |

## Téléphonie à connecter ultérieurement

Le numéro Twilio devra être importé ou associé dans ElevenLabs, puis lié exclusivement à cet agent pour les appels entrants. Avant la mise en production, effectuer un appel de bout en bout et vérifier : accueil, changement de langue, question libre, détection d'urgence, consigne 112, interruption, fin d'appel et journalisation.

L'agent ne prétend pas transférer un appel au 112. Tant qu'aucun outil de transfert humain officiellement validé n'est configuré, il demande à l'appelant de raccrocher et d'appeler lui-même le 112 en cas de danger immédiat.

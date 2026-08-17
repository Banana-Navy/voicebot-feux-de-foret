# Validation du voicebot Feux de Forêt — 17 août 2026

## Configuration active

- Agent : `agent_2201m07k477kepfsq9p5h8bh4x1g`
- Branche : `agtbrch_1101m07k47s2estbzstzye6f97px`
- Numéro Twilio inbound : `+32 71 49 98 17`
- Affectation vérifiée : agent `Feux de Forêt — Inbound (BE)`
- Voix : `Samuel - Bold, Coarse and Serious`, français belge
- Modèle vocal : `eleven_flash_v2_5`
- Stabilité : `0,78`
- Similarité : `0,85`
- Vitesse : `1,08`
- Prise de tour : `turn_v3`, réactivité `normal`, délai `7 s`
- Délai souple et remplissages : désactivés
- Parole libre avant `end_call` désactivée ; clôture contrôlée « Merci de votre appel. »
- LLM : `claude-sonnet-4-5`, température `0`, maximum `180` jetons
- RAG : désactivé ; une seule base contrôlée injectée en mode prompt
- Enregistrement : activé ; conservation `30 jours`

## Corrections appliquées

1. Remplacement de la voix anglophone `Eric` par une voix native francophone belge plus ferme.
2. Passage de la vitesse de `0,92` à `1,08` et de la stabilité de `0,50` à `0,78`.
3. Passage du mode de tour `patient` au mode `normal` et du délai de `15 s` à `7 s`.
4. Suppression des remplissages de silence, des formules apaisantes, des questions finales automatiques et des reprises complètes après interruption.
5. Accueil réduit à 12,26 secondes tout en conservant l'enregistrement, le 112 et le choix signaler/informer.
6. Réponses d'information limitées à 45 mots et trois phrases.
7. Interdiction explicite de déduire une commune, une province, une Région ou une autorité depuis un lieu cité.
8. Réponse courte obligatoire ajoutée pour la prévention générale.
9. Fin d'appel limitée à une seule formule contrôlée afin d'éviter toute duplication avant le raccrochage.

## Tests ElevenLabs persistants

Sept tests sont enregistrés dans le workspace :

- signalement réel et consigne 112 prioritaire ;
- refus d'inventer un état local ou un itinéraire ;
- statut du 1771 non confirmé ;
- prévention sans abus du 112 ;
- refus de prédire la propagation ;
- absence de répétition après changement de sujet ;
- simulation complète du triage ambigu vers le signalement.

Passes ciblées validées :

- absence de répétition et de question finale : `5/5`, suite `suite_9401m07tkdwbez0tkcj24adpxfza` ;
- prévention courte et triage complet : `10/10`, suite `suite_3201m07tqc7eeessjh567dacep5r`.

La suite complète la plus récente est `suite_7701m07wf3kbe81vccpm1h7g86st` : `21/21` exécutions réussies, soit trois passes pour chacun des sept scénarios, sur la configuration actuellement affectée au numéro.

## Validation audio

Échantillon téléphonique final : `artifacts/audio/accueil-samuel-fr-be-v1.3-telephone.wav`.

- durée : `12,260 s` ;
- fréquence : `8 kHz`, mono, décodée depuis µ-law ;
- pic : `-0,17 dBFS`, sans écrêtage ;
- aucune pause anormale de plus de `220 ms` au seuil de `-42 dB` ;
- retranscription complète et fidèle ;
- langue française reconnue avec une probabilité de `1,0` ;
- aucune répétition ou hésitation détectée.

### Conversation audio live finale

Conversation ElevenLabs : `conv_0001m07vjkr2ef2tx83rf8h74zar`.

Le test a utilisé le véritable flux WebSocket vocal au format téléphonique µ-law 8 kHz. Il a enchaîné l'accueil, une demande de prévention, une interruption par « Et pour mon chien ? », puis une demande de fin d'appel.

- l'interruption est marquée `interrupted: true` et la réponse suivante traite directement le chien, sans recommencer la prévention ;
- prévention : réponse exacte en trois phrases, sans question finale ;
- animaux : réponse exacte en deux phrases, sans question finale ;
- clôture : une seule occurrence de « Merci de votre appel. », suivie de `end_call` sans erreur ;
- délai avant le premier son des réponses : `2,09 s`, puis `1,51 s` ;
- délai TTS seul : de `0,08 s` à `0,20 s` ;
- les quatre segments ont une probabilité de langue française de `1,0` ;
- aucune pause supérieure à `220 ms`, aucun écrêtage et aucune reprise audio détectée.

Les flux bruts, les WAV décodés et le journal d'événements sont conservés dans `artifacts/audio/live-v1.5/`. Les versions `live-v1.3` et `live-v1.4` conservent les écarts qui ont conduit aux deux derniers durcissements du prompt.

## Concordance locale et distante

- prompt local et prompt actif : identiques, empreinte SHA-256 courte `3d3528b78e8823a8` ;
- base locale préparée et document ElevenLabs actif : identiques, empreinte SHA-256 courte `a8d9a067f4cbb0e9` ;
- numéro `+32 71 49 98 17` : inbound supporté, fournisseur Twilio, agent et branche attendus affectés.

## Dernière validation indispensable

La configuration distante, le prompt, la base, la synthèse, les tests anti-hallucination et le flux téléphonique µ-law sont validés. Un appel humain réel au `071 49 98 17` reste nécessaire pour contrôler le décrochage opérateur, la qualité perçue sur le réseau téléphonique, les interruptions humaines et la fin d'appel. Après cet appel, contrôler l'audio et la transcription enregistrés dans ElevenLabs avant de déclarer la recette téléphonique entièrement terminée.

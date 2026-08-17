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
- Parole avant `end_call` et changement de langue : désactivée
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
9. Fin d'appel silencieuse afin d'éviter une formule dupliquée avant le raccrochage.

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

La suite complète finale est `suite_5501m07tw10ke5w9td24t9x880be` : `21/21` exécutions réussies, soit trois passes pour chacun des sept scénarios.

## Validation audio

Échantillon téléphonique final : `artifacts/audio/accueil-samuel-fr-be-v1.3-telephone.wav`.

- durée : `12,260 s` ;
- fréquence : `8 kHz`, mono, décodée depuis µ-law ;
- pic : `-0,17 dBFS`, sans écrêtage ;
- aucune pause anormale de plus de `220 ms` au seuil de `-42 dB` ;
- retranscription complète et fidèle ;
- langue française reconnue avec une probabilité de `1,0` ;
- aucune répétition ou hésitation détectée.

## Dernière validation indispensable

La configuration distante, la synthèse et le flux téléphonique µ-law sont validés. Un appel humain réel au `071 49 98 17` reste nécessaire pour contrôler le décrochage opérateur, la qualité perçue sur le réseau téléphonique, les interruptions humaines et la fin d'appel. Après cet appel, contrôler l'audio et la transcription enregistrés dans ElevenLabs avant de déclarer la recette téléphonique entièrement terminée.

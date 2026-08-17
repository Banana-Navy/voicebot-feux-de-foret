# Échantillons vocaux — voicebot Feux de Forêt

Ces fichiers conservent les itérations de l'accueil vocal générées le 17 août 2026 avec la voix belge francophone `Samuel - Bold, Coarse and Serious`.

| Fichier | Usage | Durée |
|---|---|---:|
| `accueil-samuel-fr-be-v1.1.mp3` | Première version avec mentions complètes 1771 et 112 | 18,20 s |
| `accueil-samuel-fr-be-v1.2.mp3` | Accueil raccourci | 16,44 s |
| `accueil-samuel-fr-be-v1.3.mp3` | Accueil final, qualité MP3 | 12,26 s |
| `accueil-samuel-fr-be-v1.3.ulaw` | Accueil final au format téléphonique ElevenLabs/Twilio | 12,26 s |
| `accueil-samuel-fr-be-v1.3-telephone.wav` | Décodage écoutable du flux téléphonique µ-law 8 kHz | 12,26 s |

Réglages : modèle `eleven_flash_v2_5`, stabilité `0,78`, similarité `0,85`, vitesse `1,08`, mode expressif désactivé.

Le flux téléphonique final a été retranscrit avec une probabilité de langue française de `1,0`. La phrase est complète, sans répétition ni mot parasite. L'analyse audio ne détecte aucune pause supérieure à 220 ms au seuil de -42 dB, aucun écrêtage et aucune valeur audio invalide.

Les enregistrements des conversations de test restent également activés dans ElevenLabs avec une conservation de 30 jours.

## Conversations live conservées

Chaque dossier contient le journal `session.json`, les segments téléphoniques bruts `.ulaw` et leur version `.wav` décodée à 8 kHz.

| Dossier | Conversation | Résultat utile |
|---|---|---|
| `live-v1.3/` | `conv_1501m07v74amf26sw00zgedff2aa` | A révélé une question finale inutile après la prévention. |
| `live-v1.4/` | `conv_6501m07vb76seh7v9t56z19vcnd3` | A validé la prévention, puis révélé une question finale après la réponse sur le chien. |
| `live-v1.5/` | `conv_0001m07vjkr2ef2tx83rf8h74zar` | Version finale : interruption correcte, aucune reprise, réponses exactes et clôture unique. |

Dans `live-v1.5`, les quatre segments durent respectivement `12,47 s`, `7,36 s`, `9,91 s` et `1,05 s`. Leur retranscription est fidèle avec une probabilité de langue française de `1,0`. Aucun segment ne contient de silence supérieur à `220 ms` au seuil de `-42 dB`.

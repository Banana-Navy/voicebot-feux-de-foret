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

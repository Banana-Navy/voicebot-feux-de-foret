# Plan fonctionnel du voicebot

## Mission

Donner en quelques secondes une prochaine action sûre, adaptée au lieu et à la situation, dans la langue de l'appelant. Le bot informe et oriente ; il ne commande pas les secours et ne remplace jamais le 112.

Le public accède au voicebot via le **1771**. Chaque support doit préciser sans ambiguïté : « 1771 = information et orientation ; 112 = urgence ».

## Ouverture de chaque conversation

1. Détecter ou demander la langue : FR, NL, DE ou EN.
2. Dire : « Si vous voyez un feu, si la fumée est proche, si quelqu'un est en danger ou respire mal, appelez maintenant le 112. Je peux rester avec vous pour vous rappeler les informations à donner. »
3. Poser une seule question de triage : « Êtes-vous dans la forêt ou la zone naturelle, chez vous à proximité, sur la route, ou demandez-vous des conseils de prévention ? »

## Arbre de triage

### Niveau rouge — transfert immédiat au 112

Déclencheurs : feu ou fumée visible à proximité, personne encerclée ou manquante, brûlure, difficulté respiratoire importante, douleur thoracique, confusion, mobilité empêchée, danger immédiat.

Réponse : faire appeler le 112 immédiatement, sans questionnaire préalable. Si la technologie le permet, proposer un transfert avec consentement explicite. Préparer : position exacte, repères et accès ; nature du feu ; personnes en danger/blessées et leur nombre ; évolution du feu ou de la fumée. Ne pas raccrocher avant l'instruction de l'opérateur et garder la ligne libre.

### Dans une forêt ou zone naturelle

- Se mettre en sécurité immédiatement.
- Suivre les chemins existants qui s'éloignent du feu ou de la colonne de fumée ; si possible, se déplacer perpendiculairement au vent.
- Rejoindre une voie publique, une grande zone pavée ou une agglomération.
- Aider les autres sans se mettre en danger.
- Appeler le 112 ou utiliser l'app 112 BE et donner des repères précis.
- Sans réseau : continuer à évacuer et interpeller les personnes rencontrées.

### Chez soi près d'une forêt

- Appeler le 112 dès qu'un feu est remarqué ou qu'une personne est en danger.
- Fermer portes et fenêtres ; couper la ventilation qui prend l'air extérieur.
- Ne pas évacuer spontanément : suivre BE-Alert, la commune, la province et les secours.
- En cas d'ordre d'évacuation, couper gaz et électricité si cela peut être fait sans retard ni danger.

### Fumée sans flamme visible

- Rester hors de toute fumée ; entrer dans un bâtiment sûr si les autorités ne demandent pas d'évacuer.
- Fermer portes et fenêtres et couper la ventilation extérieure, y compris en voiture.
- Éviter les efforts et déplacements non indispensables.
- Les personnes enceintes, enfants, personnes âgées ou atteintes de maladies cardiaques/respiratoires sont prioritaires.
- Pour une sortie indispensable, l'OMS Europe recommande un masque bien ajusté FFP2/N95, notamment aux groupes à risque. Le masque ne rend jamais sûre une zone dangereuse.
- Difficulté respiratoire sévère, douleur thoracique ou autre symptôme inquiétant : 112.

### Évacuation ordonnée

- Répéter l'autorité, la zone, l'heure, l'itinéraire et le centre d'accueil tels que reçus ; ne rien compléter par déduction.
- Prendre le minimum : identité, médicaments essentiels, téléphone/chargeur, clés, eau, argent et hygiène.
- Danger immédiat : partir sans perdre de temps à rassembler des affaires.
- Suivre le mode de transport indiqué ; l'évacuation se fait souvent à pied.
- Demander si une aide est requise pour une personne à mobilité réduite, un enfant ou un animal et transmettre vers le canal humain prévu.

### Prévention

- Aucun feu en forêt ou zone naturelle ; pas de barbecue ni feu de camp.
- Ne pas fumer ni jeter de mégot ; ne pas stationner dans les hautes herbes.
- Ne pas bloquer les chemins forestiers.
- Prudence avec les outils qui produisent chaleur ou étincelles.
- Vérifier le code de risque et les interdictions auprès de la Région, de la commune ou du domaine naturel.
- Emporter un téléphone chargé.

### Après

- Ne pas pénétrer dans la zone sans autorisation des secours.
- Continuer à suivre les canaux officiels.
- En cas de symptômes après exposition à la fumée ou de brûlure, demander une aide médicale.

## Données dynamiques autorisées

Le bot peut lire, avec provenance et horodatage : messages BE-Alert validés, flux des communes/provinces, codes de risque régionaux, points d'accueil et routes fermées publiés officiellement. Il refuse toute donnée non signée, capture d'écran ou rumeur sociale comme fondement d'une consigne.

## Architecture cible

1771/web → couche télécom → détection de langue → triage déterministe → agent conversationnel → base officielle versionnée → outils en lecture seule → transfert 112/humain → journal d'audit pseudonymisé.

Les règles « 112 », « ne pas évacuer spontanément », « ne pas lutter contre un feu établi » et « ne pas inventer un ordre local » sont exécutées hors LLM. Toute mise à jour d'un message opérationnel exige une source, un territoire, une heure de début, une heure d'expiration et un approbateur.

## Mesures de réussite

- Consigne 112 prononcée en moins de 5 secondes sur tous les scénarios rouges.
- 100 % des ordres locaux accompagnés de leur source et heure.
- 0 itinéraire, périmètre ou statut de feu inventé.
- Compréhension testée en FR/NL/DE/EN, y compris bruit, stress, accent et interruption.
- Tests avec publics âgés, malvoyants, malentendants, mobilité réduite et faible littératie numérique.

## Phases

1. Prototype fermé : agent sans données temps réel, scénarios officiels et tests automatisés.
2. Pilote : intégration d'un flux officiel de test et transfert humain, avec une commune/zone de secours partenaire.
3. Validation : exercice de crise, DPO/RGPD, sécurité, charge et revue par services de secours.
4. Production : numéro dédié, supervision 24/7, révocation rapide des contenus et exercices réguliers.

## Points à obtenir avant production

- Autorité porteuse et territoire du pilote.
- Convention avec zone de secours/112 : un voicebot public ne doit pas se présenter comme service d'urgence sans mandat.
- Accès officiel aux messages locaux et politique d'approbation.
- Numéro de transfert humain et horaires.
- Politique de conservation, base juridique, consentement et analyse d'impact RGPD.
- Nom public final du service.

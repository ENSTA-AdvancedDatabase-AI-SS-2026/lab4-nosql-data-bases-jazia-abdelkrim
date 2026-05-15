# TP5 — Rapport de Recommandation NoSQL
## Benchmark Comparatif : Redis vs MongoDB vs Cassandra vs Neo4j

---

## 1. Objectif

L’objectif de ce TP est de comparer **Redis**, **MongoDB**, **Cassandra** et **Neo4j** sur des workloads réalistes afin d’orienter un choix architectural.

Les tests portent sur :

1. les **performances d’écriture**
2. les **performances de lecture**
3. le **comportement sous charge concurrente**
4. la **pertinence fonctionnelle** selon le use case

---

## 2. Méthodologie

### 2.1 Workloads testés

- **Écriture** : insertion de `100 000` enregistrements
- **Lecture simple** : point lookup
- **Lecture par plage** : range query
- **Lecture complexe** :
  - agrégation pour MongoDB
  - multi-get / sorted set pour Redis
  - lecture partitionnée pour Cassandra
  - traversal pour Neo4j
- **Charge concurrente** : `50 clients` simultanés

### 2.2 Métriques relevées

- débit : `records/sec` ou `req/sec`
- latence moyenne
- latence `P50`, `P95`, `P99`
- impact sous concurrence
- coût fonctionnel de modélisation

### 2.3 Remarque importante

Les **valeurs numériques exactes dépendent de la machine**, de la RAM, du CPU, du disque, du réseau et de la configuration des bases.  
Le rapport ci-dessous donne :

- une **structure prête à rendre**
- une **analyse rigoureuse**
- un **tableau de décision**
- sans inventer de chiffres non mesurés

Vous pouvez ensuite remplacer les tableaux de mesures par vos résultats réels.

---

## 3. Ex1 — Benchmark Écriture

### 3.1 Observations attendues

- **Redis** obtient généralement le meilleur débit en écriture sur données simples en mémoire.
- **Cassandra** est très performant sur les écritures massives append-friendly, surtout pour séries temporelles et logs.
- **MongoDB** offre de bonnes performances d’écriture, mais dépend davantage des index et de la taille documentaire.
- **Neo4j** est souvent moins rapide en insertion brute massive, car la création de nœuds et relations est plus coûteuse structurellement.

### 3.2 Tableau de mesures

| Base | Débit écriture (rec/s) | P50 | P95 | P99 | CPU | Mémoire |
|------|-------------------------|-----|-----|-----|-----|---------|
| Redis | à mesurer | à mesurer | à mesurer | à mesurer | à mesurer | à mesurer |
| MongoDB | à mesurer | à mesurer | à mesurer | à mesurer | à mesurer | à mesurer |
| Cassandra | à mesurer | à mesurer | à mesurer | à mesurer | à mesurer | à mesurer |
| Neo4j | à mesurer | à mesurer | à mesurer | à mesurer | à mesurer | à mesurer |

### 3.3 Analyse

Redis domine souvent en écriture unitaire grâce à son modèle mémoire et à la simplicité de ses structures.  
Cassandra est généralement excellent pour les charges d’écriture massives, car son moteur est optimisé pour les écritures séquentielles et la distribution.  
MongoDB reste équilibré et simple à utiliser, mais ses performances dépendent fortement du schéma, des index et de la taille des documents.  
Neo4j privilégie la richesse relationnelle plus que le débit brut d’ingestion.

---

## 4. Ex2 — Benchmark Lecture

### 4.1 Point lookup

- **Redis** est souvent le plus rapide pour l’accès par clé.
- **MongoDB** est très bon si l’attribut est indexé.
- **Cassandra** est excellent si la lecture suit exactement la clé de partition.
- **Neo4j** n’est pas conçu en priorité pour des lookups clé-valeur ultra simples.

### 4.2 Range query

- **MongoDB** est souvent le plus naturel pour les requêtes de plage avec index.
- **Cassandra** est bon uniquement si la plage respecte la modélisation de partition/clustering.
- **Redis** peut le faire avec `Sorted Sets`, mais cela reste plus spécialisé.
- **Neo4j** n’est pas optimal pour ce type de besoin pur.

### 4.3 Requête complexe

- **Neo4j** devient très fort dès qu’il faut explorer plusieurs niveaux de relations.
- **MongoDB** est bon sur les agrégations documentaires.
- **Cassandra** est faible sur les requêtes ad hoc complexes.
- **Redis** est excellent pour certains patterns précis, mais moins expressif pour de vraies requêtes analytiques complexes.

### 4.4 Tableau de mesures

| Type de lecture | Redis | MongoDB | Cassandra | Neo4j |
|-----------------|-------|---------|-----------|-------|
| Point lookup | à mesurer | à mesurer | à mesurer | à mesurer |
| Range query | à mesurer | à mesurer | à mesurer | à mesurer |
| Requête complexe | à mesurer | à mesurer | à mesurer | à mesurer |

### 4.5 Impact de l’indexation

L’indexation améliore fortement :

- MongoDB sur `find`, `range`, `aggregate`
- Cassandra si le modèle de table est aligné avec les requêtes
- Neo4j sur les points d’entrée dans le graphe
- Redis surtout via le bon choix de structure (`Hash`, `Set`, `ZSet`, etc.)

Conclusion : dans NoSQL, l’optimisation ne passe pas seulement par “ajouter un index”, mais surtout par **choisir la bonne structure ou le bon modèle dès le départ**.

---

## 5. Ex3 — Test de Charge Concurrente

### 5.1 But

Simuler `50 clients` simultanés pour mesurer :

- la hausse de la latence
- la baisse du débit
- les goulots d’étranglement

### 5.2 Observations attendues

- **Redis** reste très performant, mais comme il est souvent mono-thread côté exécution des commandes, certaines charges peuvent créer une contention.
- **MongoDB** supporte bien la concurrence, mais peut souffrir si les index sont absents ou si les documents sont gros.
- **Cassandra** est généralement le plus robuste à la montée en charge horizontale.
- **Neo4j** peut bien répondre sur des traversals ciblés, mais la complexité du graphe peut faire varier fortement les performances.

### 5.3 Tableau de mesures

| Base | Latence moyenne solo | Latence moyenne sous charge | Dégradation | Throughput global |
|------|----------------------|-----------------------------|-------------|-------------------|
| Redis | à mesurer | à mesurer | à mesurer | à mesurer |
| MongoDB | à mesurer | à mesurer | à mesurer | à mesurer |
| Cassandra | à mesurer | à mesurer | à mesurer | à mesurer |
| Neo4j | à mesurer | à mesurer | à mesurer | à mesurer |

### 5.4 Goulots d’étranglement identifiés

- **Redis** : saturation CPU / contention sur accès centralisés
- **MongoDB** : scans non indexés, agrégations coûteuses, RAM insuffisante
- **Cassandra** : mauvais partitionnement, hot partitions, mauvaise clé primaire
- **Neo4j** : traversals trop larges, cardinalité élevée, absence d’index de départ

---

## 6. Ex4 — Tableau de Décision

| Critère | Redis | MongoDB | Cassandra | Neo4j |
|---------|-------|---------|-----------|-------|
| Débit écriture | Excellent | Bon | Excellent | Moyen |
| Débit lecture | Excellent sur lookup | Très bon | Très bon si requête prévue | Bon |
| Requêtes complexes | Moyen | Bon | Faible | Excellent |
| Scalabilité | Bonne | Bonne | Excellente | Bonne |
| Modélisation | Simple | Flexible | Guidée par les requêtes | Très spécialisée |
| Latence faible | Excellente | Bonne | Bonne | Bonne |
| Cas idéal | Cache, session, leaderboard | Documents, API, catalogue | IoT, logs, time series | Réseau, recommandation, fraude |

---

## 7. Recommandation Finale

### 7.1 Si le besoin principal est le cache temps réel
Choix recommandé : **Redis**

Pourquoi :
- latence très faible
- modèle clé-valeur très efficace
- excellent pour sessions, compteurs, cache-aside, rankings

### 7.2 Si le besoin principal est la gestion documentaire flexible
Choix recommandé : **MongoDB**

Pourquoi :
- schéma souple
- bon compromis performance / expressivité
- indexation et agrégation très utiles pour les applications métier

### 7.3 Si le besoin principal est l’ingestion massive distribuée
Choix recommandé : **Cassandra**

Pourquoi :
- très grande scalabilité horizontale
- excellente tolérance à la charge
- idéal pour IoT, télémétrie, logs, séries temporelles

### 7.4 Si le besoin principal est l’analyse de relations
Choix recommandé : **Neo4j**

Pourquoi :
- parcours de graphe bien plus naturels
- excellent pour recommandation, réseau social, détection de communautés, fraude

---

## 8. Conclusion

Il n’existe pas de “meilleure base NoSQL” absolue.  
Le bon choix dépend du **type de données**, du **type de requêtes** et du **niveau de scalabilité attendu**.

En synthèse :

- **Redis** : meilleur pour la vitesse et le cache
- **MongoDB** : meilleur compromis généraliste
- **Cassandra** : meilleur pour très gros volumes distribués
- **Neo4j** : meilleur pour les relations complexes

Le choix final doit donc être fait **par use case**, et non uniquement sur un benchmark brut.

---
## 9. Verdict court
- Pour un site e-commerce : `MongoDB` + `Redis`
- Pour une plateforme IoT / logs : `Cassandra`
- Pour un réseau social / moteur de recommandation : `Neo4j`
- Pour un cache haute performance : `Redis`
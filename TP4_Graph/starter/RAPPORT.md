# TP4 - Rapport Neo4j

## Informations

- **Thème** : Modélisation graphe et algorithmes GDS
- **SGBD** : Neo4j
- **Use case** : UniConnect DZ

---

## Exercice 1 - Création du graphe

### Objectif

Construire un graphe universitaire avec :

- des étudiants
- des cours
- des compétences
- des relations sociales et pédagogiques

### Nœuds

- `Etudiant`
- `Cours`
- `Competence`

### Relations

- `CONNAIT`
- `SUIT`
- `MAITRISE`

### Contraintes

- unicité sur `Etudiant.id`
- unicité sur `Cours.code`
- unicité sur `Competence.nom`

### Résultat

Le graphe modélise correctement :

- le réseau social étudiant
- les inscriptions pédagogiques
- le niveau de maîtrise des compétences

---

## Exercice 3 - Algorithmes de graphe avec GDS

### 3.1 Plus court chemin

Utilisation de `shortestPath` pour répondre à la question :

- comment un étudiant peut rencontrer un autre via le réseau social

### 3.2 Centralité de degré

Utilisation de `gds.degree.stream` pour identifier :

- les étudiants les plus connectés
- les profils les plus centraux dans le réseau

### 3.3 Détection de communautés

Utilisation de `gds.louvain.stream` pour :

- découvrir des groupes d'étudiants cohérents
- observer les communautés par proximité sociale

### 3.4 Recommandation de contacts

Score calculé à partir de :

- amis en commun
- cours en commun
- même filière

### 3.5 Chemin de compétences

Exploration des parcours d'apprentissage vers une compétence cible via les relations du graphe.

---

## Bilan TP4

### Cas où Neo4j est idéal

- réseau social
- moteur de recommandation
- graphe de compétences
- détection de communautés
- analyse de proximité

### Forces

- traversals très naturels
- expressivité des relations
- excellent pour les requêtes multi-sauts
- algorithmes GDS puissants

### Limites

- moins performant pour le simple clé-valeur
- modélisation plus spécialisée
- intérêt maximal seulement si les relations sont centrales dans le métier

### Verdict

Neo4j est la meilleure option lorsqu'on doit raisonner sur les relations et pas seulement sur les entités.
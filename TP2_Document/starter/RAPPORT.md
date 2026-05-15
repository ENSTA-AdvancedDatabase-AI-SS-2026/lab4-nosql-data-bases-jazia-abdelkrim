# TP2 - Rapport MongoDB

## Informations

- **Thème** : Modélisation documentaire, agrégation, indexation
- **SGBD** : MongoDB
- **Use case** : HealthCare DZ

---

## Exercice 1 - Modélisation MongoDB

### Objectif

Modéliser des dossiers médicaux avec :

- une collection `patients`
- une collection `analyses`
- validation de schéma

### Choix de modélisation

- `patients` : document principal
- `consultations` : tableau embarqué
- `analyses` : collection séparée référencée par `patient_id`

### Justification

- les consultations sont naturellement liées au patient et souvent lues ensemble
- les analyses peuvent devenir nombreuses et sont mieux gérées dans une collection séparée
- le validateur `$jsonSchema` garantit la qualité minimale des données

### Résultat

La modélisation hybride embarqué + référencé convient bien au dossier médical.

---

## Exercice 3 - Pipelines d'agrégation

### Requêtes réalisées

#### 3.1 Diagnostics par wilaya

- dénormalisation via `$unwind`
- regroupement par wilaya et diagnostic
- tri par fréquence

#### 3.2 Médicament le plus prescrit par spécialité

- double `$unwind`
- groupement `specialite + medicament`
- conservation du top 1 par spécialité

#### 3.3 Évolution mensuelle des consultations

- filtrage sur les 12 derniers mois
- regroupement par année et mois
- projection au format `YYYY-MM`

#### 3.4 Patients à risque élevé

- filtre sur antécédents multiples
- calcul de l'âge via `$dateDiff`
- statistiques globales

#### 3.5 Rapport médecins

- nombre de consultations
- nombre de patients uniques
- calcul du taux de ré-consultation

### Conclusion

Le framework d'agrégation MongoDB est très puissant pour l'analyse métier.

---

## Exercice 4 - Index et optimisation

### Index créés

- index composé sur `adresse.wilaya` et `antecedents`
- index sur `consultations.date`
- index texte sur `consultations.diagnostic`
- index sur `analyses.patient_id`
- index TTL sur `analyses.dateAnalyse`

### Intérêt

- réduction du `COLLSCAN`
- accélération des filtres multi-critères
- support de recherche textuelle
- meilleure performance des `lookup`
- archivage automatique des anciennes analyses

### Conclusion

Une bonne indexation améliore fortement les performances, mais doit rester alignée avec les requêtes réelles.

---

## Bilan TP2

### Cas où MongoDB est idéal

- dossiers médicaux
- catalogues produits
- profils utilisateurs
- applications avec schéma flexible

### Forces

- schéma souple
- documents riches
- agrégation puissante
- indexation variée

### Limites

- jointures moins naturelles qu'en relationnel
- attention à la taille des documents et au design des tableaux

### Verdict

MongoDB est un excellent compromis entre flexibilité, performance et expressivité.
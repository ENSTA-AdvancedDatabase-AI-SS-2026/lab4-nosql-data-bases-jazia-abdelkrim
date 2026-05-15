# TP3 - Rapport Cassandra

## Informations

- **Thème** : Modélisation orientée requêtes et ingestion IoT
- **SGBD** : Cassandra
- **Use case** : SmartGrid DZ

---

## Exercice 1 - Schéma Cassandra

### Objectif

Concevoir un schéma adapté à :

- les mesures par capteur
- les alertes par wilaya
- les agrégats horaires

### Tables conçues

#### `mesures_par_capteur`

- requête cible : mesures d'un capteur entre deux dates
- partition : `(capteur_id, date_jour)`
- clustering : `timestamp DESC`

#### `alertes_par_wilaya`

- requête cible : alertes de la wilaya X au jour Y
- partition : `(wilaya, date_jour)`
- clustering : `timestamp DESC, capteur_id`

#### `agregats_horaires`

- requête cible : dashboard temporel par wilaya
- partition : `wilaya`
- clustering : `date_heure DESC`

### Justification

Le modèle Cassandra doit être pensé à partir des requêtes, pas à partir d'une normalisation logique classique.

---

## Exercice 2 - Ingestion IoT

### Objectif

Simuler l'ingestion de mesures issues de 10 000 capteurs sur 5 minutes d'historique.

### Choix techniques

- `prepared statements`
- `UNLOGGED BATCH`
- lots de 50 insertions
- bucket journalier pour éviter les partitions trop larges

### Bénéfices

- meilleure efficacité réseau
- très bon débit d'écriture
- distribution adaptée à la série temporelle

### Point d'attention

Les batchs Cassandra servent surtout à réduire l'overhead, pas à reproduire des transactions relationnelles.

---

## Bilan TP3

### Cas où Cassandra est idéal

- IoT
- télémétrie
- logs
- séries temporelles
- ingestion massive distribuée

### Forces

- très forte scalabilité horizontale
- excellent débit d'écriture
- haute disponibilité

### Limites

- faible souplesse pour les requêtes ad hoc
- forte dépendance au bon design des clés
- attention aux hot partitions

### Verdict

Cassandra est le meilleur choix quand les volumes sont massifs et les patterns de lecture sont connus à l'avance.
"""
TP3 - Exercice 2 : Ingestion de données IoT
Use Case : SmartGrid DZ - 10 000 capteurs, 5 minutes de mesures
"""
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
import uuid
import random
from datetime import datetime, timedelta
import time

# Configuration
CASSANDRA_HOST = 'localhost'
KEYSPACE = 'smartgrid'
NB_CAPTEURS = 10000
MINUTES_HISTORIQUE = 5

WILAYAS = ["Alger", "Oran", "Constantine", "Annaba", "Blida"]
COMMUNES = {
    "Alger": ["Bab Ezzouar", "Hydra", "El Harrach", "Dar El Beida"],
    "Oran": ["Bir El Djir", "Es Senia", "Arzew"],
    "Constantine": ["El Khroub", "Ain Smara", "Hamma Bouziane"],
    "Annaba": ["El Bouni", "El Hadjar", "Seraidi"],
    "Blida": ["Bougara", "Boufarik", "Larbaa"],
}

INSERT_MESURE_CQL = """
INSERT INTO mesures_par_capteur (
    capteur_id,
    date_jour,
    timestamp,
    wilaya,
    commune,
    tension_v,
    courant_a,
    puissance_kw,
    frequence_hz,
    temperature,
    alerte,
    code_alerte
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
"""

_prepared_insert = None


def connect():
    """Connexion au cluster Cassandra"""
    cluster = Cluster([CASSANDRA_HOST])
    session = cluster.connect(KEYSPACE)
    return session, cluster


def generate_mesure(capteur_id, wilaya, commune, timestamp):
    """Générer une mesure réaliste pour un capteur"""
    tension_base = 220  # Volts (réseau algérien)

    alerte = random.random() < 0.05
    code_alerte = None

    if alerte:
        code_alerte = random.choice([
            "SURTENSION",
            "SOUS_TENSION",
            "SURCHAUFFE",
            "FREQUENCE_INSTABLE",
            "SURCONSOMMATION",
        ])

    return {
        "capteur_id": capteur_id,
        "date_jour": timestamp.date(),
        "timestamp": timestamp,
        "wilaya": wilaya,
        "commune": commune,
        "tension_v": round(tension_base + random.gauss(0, 5), 2),
        "courant_a": round(random.uniform(0.5, 15.0), 2),
        "puissance_kw": round(random.uniform(0.1, 3.3), 3),
        "frequence_hz": round(50 + random.gauss(0, 0.1), 2),
        "temperature": round(random.uniform(20, 65), 1),
        "alerte": alerte,
        "code_alerte": code_alerte,
    }


def get_prepared_insert(session):
    global _prepared_insert
    if _prepared_insert is None:
        _prepared_insert = session.prepare(INSERT_MESURE_CQL)
    return _prepared_insert


def mesure_to_params(mesure):
    return (
        mesure["capteur_id"],
        mesure["date_jour"],
        mesure["timestamp"],
        mesure["wilaya"],
        mesure["commune"],
        mesure["tension_v"],
        mesure["courant_a"],
        mesure["puissance_kw"],
        mesure["frequence_hz"],
        mesure["temperature"],
        mesure["alerte"],
        mesure["code_alerte"],
    )


def insert_single(session, mesure):
    """
    Insérer une seule mesure dans mesures_par_capteur
    Utilise une prepared statement
    """
    prepared = get_prepared_insert(session)
    session.execute(prepared, mesure_to_params(mesure))


def insert_batch(session, mesures: list):
    """
    Insérer un batch de mesures de manière efficace
    Utilise UNLOGGED BATCH pour les séries temporelles
    Fait des batches de max 50 items
    """
    if not mesures:
        return

    prepared = get_prepared_insert(session)
    batch_size = 50

    for i in range(0, len(mesures), batch_size):
        chunk = mesures[i:i + batch_size]
        batch = BatchStatement(batch_type=BatchType.UNLOGGED)

        for mesure in chunk:
            batch.add(prepared, mesure_to_params(mesure))

        session.execute(batch)


def run_ingestion(session):
    """
    Générer et insérer NB_CAPTEURS × MINUTES_HISTORIQUE mesures
    1. Générer les capteurs (ID aléatoires + assignation wilaya/commune)
    2. Pour chaque minute des MINUTES_HISTORIQUE dernières minutes
       → Insérer les mesures de tous les capteurs
    3. Mesurer et afficher :
       - Nombre total d'insertions
       - Durée totale
       - Débit (mesures/seconde)
    """
    print(f"Démarrage ingestion : {NB_CAPTEURS} capteurs × {MINUTES_HISTORIQUE} min")
    start = time.time()

    # Préparer la requête une seule fois
    get_prepared_insert(session)

    # 1. Générer les capteurs
    capteurs = []
    for _ in range(NB_CAPTEURS):
        wilaya = random.choice(WILAYAS)
        commune = random.choice(COMMUNES[wilaya])
        capteurs.append({
            "capteur_id": uuid.uuid4(),
            "wilaya": wilaya,
            "commune": commune,
        })

    # 2. Générer et insérer les mesures minute par minute
    now = datetime.now().replace(second=0, microsecond=0)
    total_inserted = 0

    for minute_offset in range(MINUTES_HISTORIQUE):
        ts = now - timedelta(minutes=minute_offset)
        mesures_minute = []

        for capteur in capteurs:
            mesure = generate_mesure(
                capteur["capteur_id"],
                capteur["wilaya"],
                capteur["commune"],
                ts
            )
            mesures_minute.append(mesure)

        insert_batch(session, mesures_minute)
        total_inserted += len(mesures_minute)
        print(f"Minute {minute_offset + 1}/{MINUTES_HISTORIQUE} : {len(mesures_minute):,} mesures insérées")

    elapsed = time.time() - start
    total = total_inserted
    print(f"\n✅ {total:,} mesures insérées en {elapsed:.1f}s")
    print(f"   Débit : {total/elapsed:,.0f} mesures/seconde")


if __name__ == "__main__":
    session, cluster = connect()
    run_ingestion(session)
    cluster.shutdown()

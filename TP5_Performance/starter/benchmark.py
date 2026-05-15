"""
TP5 - Benchmark Comparatif NoSQL
Mesurer les performances de Redis, MongoDB, Cassandra, Neo4j
"""
import time
import statistics
import uuid
import random
from typing import Callable
import redis
from pymongo import MongoClient, InsertOne
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
from neo4j import GraphDatabase


# ─── Utilitaires de mesure ────────────────────────────────────────────────────

def measure_latency(fn: Callable, iterations: int = 1000) -> dict:
    """
    Exécuter fn iterations fois et retourner les statistiques
    """
    latencies = []
    for _ in range(iterations):
        start = time.perf_counter()
        fn()
        latencies.append((time.perf_counter() - start) * 1000)

    latencies.sort()
    return {
        "mean_ms": statistics.mean(latencies),
        "p50_ms": latencies[int(0.50 * len(latencies))],
        "p95_ms": latencies[int(0.95 * len(latencies))],
        "p99_ms": latencies[int(0.99 * len(latencies))],
        "max_ms": max(latencies),
        "throughput_rps": 1000 / statistics.mean(latencies)
    }


def print_results(name: str, results: dict):
    print(f"\n{'=' * 50}")
    print(f" {name}")
    print(f"{'=' * 50}")
    for k, v in results.items():
        print(f"  {k:20s}: {v:.2f}")


# ─── Ex1 : Benchmark Écriture ─────────────────────────────────────────────────

def benchmark_write_redis(n: int = 100_000):
    """Insérer n enregistrements dans Redis et mesurer le débit"""
    r = redis.Redis(host="localhost", port=6379, decode_responses=True)
    r.flushdb()

    start = time.perf_counter()
    pipe = r.pipeline(transaction=False)
    batch_size = 1000

    for i in range(n):
        key = f"bench:product:{i}"
        pipe.hset(key, mapping={
            "id": i,
            "name": f"product-{i}",
            "price": random.randint(1000, 100000),
            "stock": random.randint(1, 100)
        })

        if (i + 1) % batch_size == 0:
            pipe.execute()

    if n % batch_size != 0:
        pipe.execute()

    elapsed = time.perf_counter() - start
    print_results("Redis Write", {
        "records": float(n),
        "total_time_s": elapsed,
        "throughput_rps": n / elapsed
    })


def benchmark_write_mongodb(n: int = 100_000):
    """Insérer n documents dans MongoDB et mesurer le débit"""
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db = client["benchmark"]
    col = db["products"]
    col.drop()

    start = time.perf_counter()
    batch_size = 1000
    ops = []

    for i in range(n):
        ops.append(InsertOne({
            "_id": i,
            "name": f"product-{i}",
            "price": random.randint(1000, 100000),
            "stock": random.randint(1, 100),
            "category": random.choice(["phones", "laptops", "audio", "gaming"]),
            "created_at": time.time()
        }))

        if len(ops) == batch_size:
            col.bulk_write(ops, ordered=False)
            ops = []

    if ops:
        col.bulk_write(ops, ordered=False)

    elapsed = time.perf_counter() - start
    print_results("MongoDB Write", {
        "records": float(n),
        "total_time_s": elapsed,
        "throughput_rps": n / elapsed
    })


def benchmark_write_cassandra(n: int = 100_000):
    """Insérer n rows dans Cassandra et mesurer le débit"""
    cluster = Cluster(["localhost"])
    session = cluster.connect()

    session.execute("""
        CREATE KEYSPACE IF NOT EXISTS benchmark
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
    """)
    session.set_keyspace("benchmark")

    session.execute("""
        CREATE TABLE IF NOT EXISTS products (
            id UUID PRIMARY KEY,
            name TEXT,
            price INT,
            stock INT,
            category TEXT,
            created_at TIMESTAMP
        )
    """)
    session.execute("TRUNCATE products")

    prepared = session.prepare("""
        INSERT INTO products (id, name, price, stock, category, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """)

    start = time.perf_counter()
    batch_size = 50
    batch = BatchStatement(batch_type=BatchType.UNLOGGED)
    count_in_batch = 0

    for i in range(n):
        batch.add(prepared, (
            uuid.uuid4(),
            f"product-{i}",
            random.randint(1000, 100000),
            random.randint(1, 100),
            random.choice(["phones", "laptops", "audio", "gaming"]),
            int(time.time() * 1000)
        ))
        count_in_batch += 1

        if count_in_batch == batch_size:
            session.execute(batch)
            batch = BatchStatement(batch_type=BatchType.UNLOGGED)
            count_in_batch = 0

    if count_in_batch > 0:
        session.execute(batch)

    elapsed = time.perf_counter() - start
    print_results("Cassandra Write", {
        "records": float(n),
        "total_time_s": elapsed,
        "throughput_rps": n / elapsed
    })

    cluster.shutdown()


# ─── Ex2 : Benchmark Lecture ─────────────────────────────────────────────────

def benchmark_read_redis():
    """Point lookup, range (ZRANGE), complex (pipeline multi-get)"""
    r = redis.Redis(host="localhost", port=6379, decode_responses=True)
    r.flushdb()

    pipe = r.pipeline(transaction=False)
    for i in range(2000):
        pipe.hset(f"bench:item:{i}", mapping={"id": i, "price": i * 10, "stock": 100 - (i % 50)})
        pipe.zadd("bench:sales", {str(i): random.randint(1, 10000)})
    pipe.execute()

    def point_lookup():
        rid = random.randint(0, 1999)
        r.hgetall(f"bench:item:{rid}")

    def range_lookup():
        r.zrevrange("bench:sales", 0, 49, withscores=True)

    def complex_lookup():
        ids = [random.randint(0, 1999) for _ in range(20)]
        p = r.pipeline(transaction=False)
        for rid in ids:
            p.hgetall(f"bench:item:{rid}")
        p.execute()

    print_results("Redis Read - point lookup", measure_latency(point_lookup, 1000))
    print_results("Redis Read - range lookup", measure_latency(range_lookup, 1000))
    print_results("Redis Read - pipeline multi-get", measure_latency(complex_lookup, 1000))


def benchmark_read_mongodb():
    """find_one, find avec range, aggregate pipeline"""
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db = client["benchmark"]
    col = db["products_read"]
    col.drop()

    docs = [{
        "_id": i,
        "name": f"product-{i}",
        "price": random.randint(1000, 100000),
        "stock": random.randint(1, 100),
        "category": random.choice(["phones", "laptops", "audio", "gaming"])
    } for i in range(5000)]

    col.insert_many(docs)
    col.create_index("price")
    col.create_index("category")

    def point_lookup():
        rid = random.randint(0, 4999)
        col.find_one({"_id": rid})

    def range_lookup():
        list(col.find({"price": {"$gte": 10000, "$lte": 50000}}).limit(50))

    def aggregate_lookup():
        list(col.aggregate([
            {"$match": {"stock": {"$gt": 10}}},
            {"$group": {"_id": "$category", "avg_price": {"$avg": "$price"}, "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]))

    print_results("MongoDB Read - find_one", measure_latency(point_lookup, 1000))
    print_results("MongoDB Read - range find", measure_latency(range_lookup, 1000))
    print_results("MongoDB Read - aggregate", measure_latency(aggregate_lookup, 500))


# ─── Ex3 : Charge concurrente ─────────────────────────────────────────────────

def benchmark_concurrent(db_fn: Callable, n_clients: int = 50, requests_per_client: int = 200):
    """
    Lancer n_clients threads simultanés
    Chaque thread effectue requests_per_client requêtes
    Mesurer les latences globales et la dégradation vs single client
    """
    import threading

    single = measure_latency(db_fn, 200)

    latencies = []
    lock = threading.Lock()

    def worker():
        local = []
        for _ in range(requests_per_client):
            start = time.perf_counter()
            db_fn()
            local.append((time.perf_counter() - start) * 1000)
        with lock:
            latencies.extend(local)

    start_total = time.perf_counter()
    threads = [threading.Thread(target=worker) for _ in range(n_clients)]

    for t in threads:
        t.start()
    for t in threads:
        t.join()

    total_elapsed = time.perf_counter() - start_total
    latencies.sort()

    concurrent_results = {
        "mean_ms": statistics.mean(latencies),
        "p50_ms": latencies[int(0.50 * len(latencies))],
        "p95_ms": latencies[int(0.95 * len(latencies))],
        "p99_ms": latencies[int(0.99 * len(latencies))],
        "max_ms": max(latencies),
        "throughput_rps": len(latencies) / total_elapsed
    }

    print_results("Concurrent Load - single client baseline", single)
    print_results("Concurrent Load - global", concurrent_results)
    print_results("Concurrent Load - degradation", {
        "mean_latency_ratio": concurrent_results["mean_ms"] / single["mean_ms"],
        "p95_latency_ratio": concurrent_results["p95_ms"] / single["p95_ms"],
        "throughput_gain": concurrent_results["throughput_rps"] / single["throughput_rps"]
    })


# ─── Bonus Neo4j ──────────────────────────────────────────────────────────────

def benchmark_read_neo4j():
    """Petit benchmark de lecture Neo4j"""
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

    with driver.session() as session:
        session.run("MATCH (n) DETACH DELETE n")
        session.run("""
            UNWIND range(1, 1000) AS i
            CREATE (:User {id: i, name: 'user-' + toString(i)})
        """)
        session.run("""
            MATCH (a:User), (b:User)
            WHERE a.id < b.id AND a.id % 50 = b.id % 50 AND a.id <> b.id
            CREATE (a)-[:KNOWS]->(b)
        """)

    def point_lookup():
        uid = random.randint(1, 1000)
        with driver.session() as session:
            list(session.run("MATCH (u:User {id: $id}) RETURN u", id=uid))

    def neighborhood():
        uid = random.randint(1, 1000)
        with driver.session() as session:
            list(session.run("""
                MATCH (u:User {id: $id})-[:KNOWS]->(v)
                RETURN v LIMIT 20
            """, id=uid))

    print_results("Neo4j Read - node lookup", measure_latency(point_lookup, 300))
    print_results("Neo4j Read - neighborhood", measure_latency(neighborhood, 300))
    driver.close()


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🚀 Benchmark NoSQL - Comparatif des 4 technologies")
    print("=" * 60)

    N = 10_000

    print(f"\n📝 Benchmark Écriture ({N:,} enregistrements)")
    benchmark_write_redis(N)
    benchmark_write_mongodb(N)
    benchmark_write_cassandra(N)

    print(f"\n📖 Benchmark Lecture (1,000 requêtes)")
    benchmark_read_redis()
    benchmark_read_mongodb()

    print(f"\n🕸️ Benchmark Lecture Neo4j")
    # Nécessite un mot de passe Neo4j valide
    # benchmark_read_neo4j()

    print(f"\n⚡ Test Charge Concurrente (50 clients)")
    r = redis.Redis(host="localhost", port=6379, decode_responses=True)
    r.set("bench:ping", "ok")
    benchmark_concurrent(lambda: r.get("bench:ping"))

    print("\n✅ Benchmark terminé ! Consultez RAPPORT.md pour l'analyse.")

# TP1 - Rapport Redis

## Informations

- **Thème** : Structures de données Redis, cache TTL, leaderboard
- **SGBD** : Redis
- **Use case** : ShopFast

---

## Exercice 1 - Structures de données Redis

### Objectif

Mettre en place :

- un stockage produit avec `Hash`
- un panier utilisateur avec `Hash`
- un historique de navigation avec `List`
- des catégories avec `Set`

### Choix de modélisation

- `product:{id}` : hash produit
- `cart:{user_id}` : hash `product_id -> quantite`
- `history:{user_id}` : liste des derniers produits vus
- `category:{nom}` : set des produits d'une catégorie

### Points clés

- `HSET` pour stocker un produit
- `HGETALL` pour relire un produit ou un panier
- `HINCRBY` pour incrémenter les quantités du panier
- `LPUSH + LTRIM` pour garder un historique borné
- `SADD` et `SINTER` pour les catégories et intersections

### Conclusion

Redis est très adapté aux accès simples, fréquents et temps réel, avec une excellente latence.

---

## Exercice 3 - Pattern Cache-Aside avec TTL

### Objectif

Accélérer l'accès aux fiches produits avec un cache Redis devant une base lente.

### Pattern utilisé

1. Lire dans Redis avec la clé `product_cache:{id}`
2. En cas de `MISS`, lire depuis la base lente
3. Sérialiser en JSON
4. Stocker dans Redis avec TTL
5. Retourner le résultat

### Fonctions principales

- `get_product_cached(...)`
- `invalidate_product_cache(...)`
- `benchmark_cache(...)`

### Analyse

- Le premier accès est lent car il touche la base
- Les accès suivants sont rapides tant que le TTL n'expire pas
- L'invalidation explicite est nécessaire après mise à jour métier

### Conclusion

Le pattern Cache-Aside convient très bien aux fiches produit fréquemment consultées.

---

## Exercice 4 - Leaderboard temps réel

### Objectif

Construire un classement dynamique des meilleures ventes.

### Structure utilisée

- `leaderboard:sales` : `Sorted Set`

### Opérations

- `ZINCRBY` pour enregistrer une vente
- `ZREVRANGE WITHSCORES` pour lire le top N
- `ZREVRANK` pour connaître le rang d'un produit

### Avantages

- mise à jour incrémentale
- lecture triée native
- rang disponible sans recalcul complet

### Conclusion

Redis est excellent pour les top produits, classements et statistiques temps réel.

---

## Bilan TP1

### Cas où Redis est idéal

- cache applicatif
- panier utilisateur
- historique récent
- leaderboards
- compteurs temps réel

### Limites

- peu adapté aux requêtes analytiques riches
- persistance et modélisation relationnelle limitées
- nécessite de bien choisir la structure de données

### Verdict

Redis est le meilleur choix pour les besoins ultra-rapides, simples et fortement sollicités.

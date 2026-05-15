// TP4 - Exercice 3 : Algorithmes de Graphe avec GDS
// Prérequis : Plugin Graph Data Science installé

// ─── 3.1 : Plus court chemin ──────────────────────────────────────────────────
// "Comment Ahmed peut-il rencontrer Yasmine ?"
MATCH p = shortestPath(
  (a:Etudiant {prenom: "Ahmed"})-[:CONNAIT*..10]-(b:Etudiant {prenom: "Yasmine"})
)
RETURN [n IN nodes(p) | n.prenom + " (" + n.universite + ")"] AS chemin,
       length(p) AS nb_intermediaires;


// ─── 3.2 : Centralité de degré ────────────────────────────────────────────────
CALL gds.graph.project(
  'reseau_social',
  'Etudiant',
  'CONNAIT'
);

CALL gds.degree.stream('reseau_social')
YIELD nodeId, score
RETURN gds.util.asNode(nodeId).prenom AS etudiant,
       gds.util.asNode(nodeId).universite AS universite,
       score AS nb_connexions
ORDER BY score DESC, etudiant
LIMIT 10;


// ─── 3.3 : Détection de communautés (Louvain) ────────────────────────────────
CALL gds.louvain.stream('reseau_social')
YIELD nodeId, communityId
WITH communityId, collect(gds.util.asNode(nodeId).prenom) AS membres
RETURN communityId,
       size(membres) AS taille,
       membres[0..5] AS exemple_membres
ORDER BY taille DESC, communityId;


// ─── 3.4 : Recommandation de contacts ────────────────────────────────────────
// "Qui Ahmed devrait-il connaître ?"
// Score = nb_amis_communs * 3 + nb_cours_communs * 2 + (meme_filiere ? 1 : 0)

MATCH (moi:Etudiant {prenom: "Ahmed"})
MATCH (suggestion:Etudiant)
WHERE suggestion <> moi
  AND NOT (moi)-[:CONNAIT]-(suggestion)

OPTIONAL MATCH (moi)-[:CONNAIT]-(ami:Etudiant)-[:CONNAIT]-(suggestion)
WITH moi, suggestion, count(DISTINCT ami) AS nb_amis_communs

OPTIONAL MATCH (moi)-[:SUIT]->(cours:Cours)<-[:SUIT]-(suggestion)
WITH moi, suggestion, nb_amis_communs, count(DISTINCT cours) AS nb_cours_communs

WITH suggestion,
     nb_amis_communs,
     nb_cours_communs,
     CASE WHEN moi.filiere = suggestion.filiere THEN 1 ELSE 0 END AS meme_filiere
WITH suggestion,
     nb_amis_communs,
     nb_cours_communs,
     meme_filiere,
     nb_amis_communs * 3 + nb_cours_communs * 2 + meme_filiere AS score
WHERE score > 0
RETURN suggestion.prenom + " " + suggestion.nom AS suggestion,
       suggestion.universite AS universite,
       suggestion.filiere AS filiere,
       nb_amis_communs,
       nb_cours_communs,
       meme_filiere,
       score
ORDER BY score DESC, nb_amis_communs DESC, nb_cours_communs DESC, suggestion
LIMIT 5;


// ─── 3.5 : Chemin de compétences ─────────────────────────────────────────────
// "Quels cours mènent à Machine Learning ?"
// Cette requête suppose que des relations :REQUIERT existent dans le graphe

MATCH path = (debut:Cours)-[:REQUIERT*]->(but:Competence {nom: "Machine Learning"})
RETURN [n IN nodes(path) |
  CASE WHEN n:Cours THEN n.intitule ELSE n.nom END
] AS parcours_apprentissage;


// Nettoyage
CALL gds.graph.drop('reseau_social');

// TP4 - Exercice 1 : Création du graphe UniConnect DZ
// Effacer la base pour partir propre
MATCH (n) DETACH DELETE n;

// ─── 1.1 : Contraintes d'unicité ─────────────────────────────────────────────
CREATE CONSTRAINT etudiant_id IF NOT EXISTS FOR (e:Etudiant) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT cours_code IF NOT EXISTS FOR (c:Cours) REQUIRE c.code IS UNIQUE;
CREATE CONSTRAINT competence_nom IF NOT EXISTS FOR (c:Competence) REQUIRE c.nom IS UNIQUE;

// ─── 1.2 : Créer les compétences ──────────────────────────────────────────────
UNWIND [
  {nom: "Python", categorie: "Programmation"},
  {nom: "Java", categorie: "Programmation"},
  {nom: "SQL", categorie: "Bases de Données"},
  {nom: "NoSQL", categorie: "Bases de Données"},
  {nom: "Machine Learning", categorie: "IA"},
  {nom: "Deep Learning", categorie: "IA"},
  {nom: "React", categorie: "Web"},
  {nom: "Docker", categorie: "DevOps"},
  {nom: "Linux", categorie: "Systèmes"},
  {nom: "Réseaux", categorie: "Infrastructure"}
] AS comp
MERGE (:Competence {nom: comp.nom})
SET comp.categorie = comp.categorie;

// ─── 1.3 : Créer les cours ────────────────────────────────────────────────────
UNWIND [
  {code: "INFO401", intitule: "Bases de Données Avancées", credits: 6, dept: "Informatique"},
  {code: "INFO402", intitule: "Intelligence Artificielle", credits: 6, dept: "Informatique"},
  {code: "INFO403", intitule: "Développement Web", credits: 4, dept: "Informatique"},
  {code: "INFO404", intitule: "Systèmes Distribués", credits: 5, dept: "Informatique"},
  {code: "INFO405", intitule: "Cloud Computing", credits: 4, dept: "Informatique"}
] AS cours
MERGE (c:Cours {code: cours.code})
SET c.intitule = cours.intitule,
    c.credits = cours.credits,
    c.departement = cours.dept;

// ─── 1.4 : Créer les étudiants ────────────────────────────────────────────────
UNWIND [
  {id: "E001", prenom: "Ahmed", nom: "Bensalem", universite: "USTHB", filiere: "Informatique", annee: 3, ville: "Alger"},
  {id: "E002", prenom: "Fatima", nom: "Ouali", universite: "USTHB", filiere: "Informatique", annee: 3, ville: "Alger"},
  {id: "E003", prenom: "Yacine", nom: "Meziane", universite: "USTHB", filiere: "GL", annee: 4, ville: "Alger"},
  {id: "E004", prenom: "Sonia", nom: "Bouzid", universite: "USTHB", filiere: "Telecoms", annee: 2, ville: "Alger"},
  {id: "E005", prenom: "Nabil", nom: "Khellaf", universite: "USTHB", filiere: "Electronique", annee: 5, ville: "Alger"},
  {id: "E006", prenom: "Amel", nom: "Benali", universite: "USTHB", filiere: "Mathématiques", annee: 2, ville: "Alger"},
  {id: "E007", prenom: "Walid", nom: "Saadi", universite: "USTHB", filiere: "Informatique", annee: 1, ville: "Alger"},
  {id: "E008", prenom: "Imene", nom: "Brahimi", universite: "USTHB", filiere: "GL", annee: 5, ville: "Alger"},
  {id: "E009", prenom: "Riad", nom: "Ait Ali", universite: "USTHB", filiere: "Telecoms", annee: 3, ville: "Alger"},
  {id: "E010", prenom: "Nesrine", nom: "Hamlaoui", universite: "USTHB", filiere: "Electronique", annee: 4, ville: "Alger"},

  {id: "E011", prenom: "Karim", nom: "Zerrouki", universite: "UMBB", filiere: "Informatique", annee: 3, ville: "Boumerdes"},
  {id: "E012", prenom: "Lina", nom: "Mokhtari", universite: "UMBB", filiere: "GL", annee: 2, ville: "Boumerdes"},
  {id: "E013", prenom: "Adel", nom: "Kaci", universite: "UMBB", filiere: "Telecoms", annee: 4, ville: "Boumerdes"},
  {id: "E014", prenom: "Sara", nom: "Taleb", universite: "UMBB", filiere: "Mathématiques", annee: 1, ville: "Boumerdes"},
  {id: "E015", prenom: "Hichem", nom: "Belaid", universite: "UMBB", filiere: "Electronique", annee: 5, ville: "Boumerdes"},
  {id: "E016", prenom: "Yasmine", nom: "Guerfi", universite: "UMBB", filiere: "Informatique", annee: 2, ville: "Boumerdes"},
  {id: "E017", prenom: "Mourad", nom: "Ferhat", universite: "UMBB", filiere: "GL", annee: 3, ville: "Boumerdes"},
  {id: "E018", prenom: "Rym", nom: "Benyoucef", universite: "UMBB", filiere: "Telecoms", annee: 4, ville: "Boumerdes"},
  {id: "E019", prenom: "Ismail", nom: "Cherif", universite: "UMBB", filiere: "Informatique", annee: 5, ville: "Boumerdes"},
  {id: "E020", prenom: "Kenza", nom: "Abbassi", universite: "UMBB", filiere: "Mathématiques", annee: 2, ville: "Boumerdes"},

  {id: "E021", prenom: "Samir", nom: "Bensmail", universite: "USTO", filiere: "Informatique", annee: 3, ville: "Oran"},
  {id: "E022", prenom: "Amina", nom: "Mebarki", universite: "USTO", filiere: "GL", annee: 1, ville: "Oran"},
  {id: "E023", prenom: "Bilal", nom: "Touati", universite: "USTO", filiere: "Telecoms", annee: 4, ville: "Oran"},
  {id: "E024", prenom: "Nadia", nom: "Rezig", universite: "USTO", filiere: "Electronique", annee: 2, ville: "Oran"},
  {id: "E025", prenom: "Omar", nom: "Merabet", universite: "USTO", filiere: "Mathématiques", annee: 5, ville: "Oran"},
  {id: "E026", prenom: "Chaima", nom: "Boudiaf", universite: "USTO", filiere: "Informatique", annee: 2, ville: "Oran"},
  {id: "E027", prenom: "Anis", nom: "Kherfi", universite: "USTO", filiere: "GL", annee: 3, ville: "Oran"},
  {id: "E028", prenom: "Malak", nom: "Bensaid", universite: "USTO", filiere: "Telecoms", annee: 5, ville: "Oran"},
  {id: "E029", prenom: "Tarek", nom: "Derbal", universite: "USTO", filiere: "Electronique", annee: 4, ville: "Oran"},
  {id: "E030", prenom: "Hana", nom: "Amrane", universite: "USTO", filiere: "Informatique", annee: 1, ville: "Oran"},

  {id: "E031", prenom: "Nadir", nom: "Rahmani", universite: "UMC", filiere: "Informatique", annee: 3, ville: "Constantine"},
  {id: "E032", prenom: "Sabrina", nom: "Bekkouche", universite: "UMC", filiere: "GL", annee: 2, ville: "Constantine"},
  {id: "E033", prenom: "Zineddine", nom: "Laouar", universite: "UMC", filiere: "Telecoms", annee: 4, ville: "Constantine"},
  {id: "E034", prenom: "Ikram", nom: "Saidi", universite: "UMC", filiere: "Mathématiques", annee: 5, ville: "Constantine"},
  {id: "E035", prenom: "Aymen", nom: "Djelloul", universite: "UMC", filiere: "Electronique", annee: 1, ville: "Constantine"},
  {id: "E036", prenom: "Farah", nom: "Oukil", universite: "UMC", filiere: "Informatique", annee: 4, ville: "Constantine"},
  {id: "E037", prenom: "Mehdi", nom: "Boulahbal", universite: "UMC", filiere: "GL", annee: 3, ville: "Constantine"},
  {id: "E038", prenom: "Rania", nom: "Kouider", universite: "UMC", filiere: "Telecoms", annee: 2, ville: "Constantine"},
  {id: "E039", prenom: "Sofiane", nom: "Mansouri", universite: "UMC", filiere: "Informatique", annee: 5, ville: "Constantine"},
  {id: "E040", prenom: "Nour", nom: "Ghezali", universite: "UMC", filiere: "Mathématiques", annee: 1, ville: "Constantine"},

  {id: "E041", prenom: "Hakim", nom: "Benabed", universite: "UBMA", filiere: "Informatique", annee: 3, ville: "Annaba"},
  {id: "E042", prenom: "Yousra", nom: "Khelifi", universite: "UBMA", filiere: "GL", annee: 4, ville: "Annaba"},
  {id: "E043", prenom: "Nassim", nom: "Benkaci", universite: "UBMA", filiere: "Telecoms", annee: 2, ville: "Annaba"},
  {id: "E044", prenom: "Marwa", nom: "Haddadi", universite: "UBMA", filiere: "Electronique", annee: 5, ville: "Annaba"},
  {id: "E045", prenom: "Lotfi", nom: "Aouadi", universite: "UBMA", filiere: "Mathématiques", annee: 1, ville: "Annaba"},
  {id: "E046", prenom: "Sihem", nom: "Bouras", universite: "UBMA", filiere: "Informatique", annee: 2, ville: "Annaba"},
  {id: "E047", prenom: "Kamel", nom: "Ziani", universite: "UBMA", filiere: "GL", annee: 3, ville: "Annaba"},
  {id: "E048", prenom: "Asma", nom: "Mecheri", universite: "UBMA", filiere: "Telecoms", annee: 4, ville: "Annaba"},
  {id: "E049", prenom: "Reda", nom: "Benhamou", universite: "UBMA", filiere: "Informatique", annee: 5, ville: "Annaba"},
  {id: "E050", prenom: "Ines", nom: "Kerroum", universite: "UBMA", filiere: "Mathématiques", annee: 2, ville: "Annaba"}
] AS data
MERGE (e:Etudiant {id: data.id})
SET e += data;

// ─── 1.5 : Créer les relations ────────────────────────────────────────────────
// CONNAIT : chaîne de base pour garantir la connexité
UNWIND range(1, 49) AS i
MATCH (e1:Etudiant {id: "E" + right("00" + toString(i), 3)})
MATCH (e2:Etudiant {id: "E" + right("00" + toString(i + 1), 3)})
MERGE (e1)-[:CONNAIT {depuis: 2022 + (i % 4), contexte: "Campus"}]->(e2)
MERGE (e2)-[:CONNAIT {depuis: 2022 + (i % 4), contexte: "Campus"}]->(e1);

// CONNAIT : liens supplémentaires entre étudiants de même université
MATCH (e1:Etudiant), (e2:Etudiant)
WHERE e1.id < e2.id
  AND e1.universite = e2.universite
  AND (toInteger(substring(e1.id, 1, 3)) + toInteger(substring(e2.id, 1, 3))) % 4 = 0
MERGE (e1)-[:CONNAIT {depuis: 2023, contexte: "Université"}]->(e2)
MERGE (e2)-[:CONNAIT {depuis: 2023, contexte: "Université"}]->(e1);

// CONNAIT : quelques liens inter-universités
MATCH (e1:Etudiant), (e2:Etudiant)
WHERE e1.id < e2.id
  AND e1.universite <> e2.universite
  AND (toInteger(substring(e1.id, 1, 3)) * toInteger(substring(e2.id, 1, 3))) % 37 = 0
MERGE (e1)-[:CONNAIT {depuis: 2024, contexte: "Hackathon"}]->(e2)
MERGE (e2)-[:CONNAIT {depuis: 2024, contexte: "Hackathon"}]->(e1);

// SUIT : chaque étudiant suit 2 à 4 cours avec note
MATCH (e:Etudiant)
WITH e, toInteger(substring(e.id, 1, 3)) AS n
MATCH (c1:Cours {code: "INFO401"})
MERGE (e)-[:SUIT {annee_univ: "2024/2025", note: 10 + (n % 9)}]->(c1);

MATCH (e:Etudiant)
WITH e, toInteger(substring(e.id, 1, 3)) AS n
MATCH (c2:Cours {code: "INFO402"})
WHERE e.filiere IN ["Informatique", "GL", "Mathématiques"] OR n % 2 = 0
MERGE (e)-[:SUIT {annee_univ: "2024/2025", note: 11 + (n % 8)}]->(c2);

MATCH (e:Etudiant)
WITH e, toInteger(substring(e.id, 1, 3)) AS n
MATCH (c3:Cours {code: "INFO403"})
WHERE e.filiere IN ["Informatique", "GL"] OR n % 3 = 0
MERGE (e)-[:SUIT {annee_univ: "2024/2025", note: 9 + (n % 10)}]->(c3);

MATCH (e:Etudiant)
WITH e, toInteger(substring(e.id, 1, 3)) AS n
MATCH (c4:Cours {code: "INFO404"})
WHERE e.annee >= 3
MERGE (e)-[:SUIT {annee_univ: "2024/2025", note: 10 + (n % 7)}]->(c4);

MATCH (e:Etudiant)
WITH e, toInteger(substring(e.id, 1, 3)) AS n
MATCH (c5:Cours {code: "INFO405"})
WHERE e.filiere IN ["Informatique", "GL", "Telecoms"] AND e.annee >= 2
MERGE (e)-[:SUIT {annee_univ: "2024/2025", note: 10 + (n % 8)}]->(c5);

// MAITRISE : 2 à 4 compétences par étudiant avec niveau
MATCH (e:Etudiant)
WITH e, toInteger(substring(e.id, 1, 3)) AS n
MATCH (comp:Competence)
WHERE
  (comp.nom = "Python" AND e.filiere IN ["Informatique", "GL", "Mathématiques"]) OR
  (comp.nom = "Java" AND e.filiere IN ["Informatique", "GL"]) OR
  (comp.nom = "SQL" AND e.annee >= 2) OR
  (comp.nom = "NoSQL" AND e.annee >= 3 AND e.filiere IN ["Informatique", "GL"]) OR
  (comp.nom = "Machine Learning" AND e.filiere IN ["Informatique", "Mathématiques"] AND e.annee >= 3) OR
  (comp.nom = "Deep Learning" AND e.filiere IN ["Informatique", "Mathématiques"] AND e.annee >= 4) OR
  (comp.nom = "React" AND e.filiere IN ["Informatique", "GL"]) OR
  (comp.nom = "Docker" AND e.annee >= 3) OR
  (comp.nom = "Linux" AND e.filiere IN ["Informatique", "GL", "Telecoms"]) OR
  (comp.nom = "Réseaux" AND e.filiere IN ["Telecoms", "Electronique"])
WITH e, comp, n
WHERE (n + size(comp.nom)) % 2 = 0 OR comp.nom IN ["Python", "SQL"]
MERGE (e)-[:MAITRISE {
  niveau: CASE
    WHEN e.annee <= 2 THEN "Débutant"
    WHEN e.annee = 3 THEN "Intermédiaire"
    ELSE "Avancé"
  END,
  score: CASE
    WHEN e.annee <= 2 THEN 50 + (n % 15)
    WHEN e.annee = 3 THEN 65 + (n % 15)
    ELSE 80 + (n % 15)
  END
}]->(comp);

// Vérification
MATCH (n) RETURN labels(n)[0] AS type, count(n) AS total ORDER BY total DESC;
MATCH ()-[r]->() RETURN type(r) AS relation, count(r) AS total ORDER BY total DESC;

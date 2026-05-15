/**
 * TP2 - Exercice 4 : Index et Optimisation
 */

use("medical_db");

// ─── 4.1 : Créer les index appropriés ────────────────────────────────────────

// Index 1 : Recherche fréquente par wilaya + antécédents
db.patients.createIndex(
  { "adresse.wilaya": 1, antecedents: 1 },
  { name: "idx_wilaya_antecedents" }
);

// Index 2 : Recherche par date de consultation
db.patients.createIndex(
  { "consultations.date": 1 },
  { name: "idx_consultations_date" }
);

// Index 3 : Texte sur diagnostics pour recherche full-text
db.patients.createIndex(
  { "consultations.diagnostic": "text" },
  {
    name: "idx_diagnostic_text",
    default_language: "french"
  }
);

// Index 4 : Analyses par patient (lookup)
db.analyses.createIndex(
  { patient_id: 1 },
  { name: "idx_analyses_patient_id" }
);


// ─── 4.2 : Comparer avec explain() ────────────────────────────────────────────

// Requête de test
const requeteTest = {
  "adresse.wilaya": "Alger",
  antecedents: "Diabète type 2"
};

print("=== AVANT index ===");

// Pour simuler "avant index", on force un COLLSCAN avec hint sur l'index naturel
const avantIndex = db.patients.find(requeteTest)
  .hint({ $natural: 1 })
  .explain("executionStats");

printjson({
  stage: avantIndex.queryPlanner.winningPlan.stage,
  nReturned: avantIndex.executionStats.nReturned,
  totalDocsExamined: avantIndex.executionStats.totalDocsExamined,
  totalKeysExamined: avantIndex.executionStats.totalKeysExamined,
  executionTimeMillis: avantIndex.executionStats.executionTimeMillis
});

print("\n=== APRÈS index ===");

const apresIndex = db.patients.find(requeteTest)
  .hint("idx_wilaya_antecedents")
  .explain("executionStats");

printjson({
  stage: apresIndex.queryPlanner.winningPlan.inputStage
    ? apresIndex.queryPlanner.winningPlan.inputStage.stage
    : apresIndex.queryPlanner.winningPlan.stage,
  nReturned: apresIndex.executionStats.nReturned,
  totalDocsExamined: apresIndex.executionStats.totalDocsExamined,
  totalKeysExamined: apresIndex.executionStats.totalKeysExamined,
  executionTimeMillis: apresIndex.executionStats.executionTimeMillis
});

// Comparaison simple
print("\n=== COMPARAISON ===");
printjson({
  nReturned_avant: avantIndex.executionStats.nReturned,
  nReturned_apres: apresIndex.executionStats.nReturned,
  totalDocsExamined_avant: avantIndex.executionStats.totalDocsExamined,
  totalDocsExamined_apres: apresIndex.executionStats.totalDocsExamined,
  executionTimeMillis_avant: avantIndex.executionStats.executionTimeMillis,
  executionTimeMillis_apres: apresIndex.executionStats.executionTimeMillis
});

// ─── 4.4 : Index TTL pour archivage ───────────────────────────────────────────
// 5 ans = 5 * 365 * 24 * 60 * 60 = 157680000 secondes
db.analyses.createIndex(
  { dateAnalyse: 1 },
  {
    name: "idx_ttl_analyses_5ans",
    expireAfterSeconds: 157680000
  }
);

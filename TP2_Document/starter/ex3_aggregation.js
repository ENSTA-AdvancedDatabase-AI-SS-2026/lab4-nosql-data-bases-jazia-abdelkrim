/**
 * TP2 - Exercice 3 : Pipelines d'Agrégation
 * Use Case : Statistiques médicales HealthCare DZ
 */

use("medical_db");

// ─── 3.1 : Distribution des diagnostics par wilaya ────────────────────────────
print("=== 3.1 : Top diagnostics par wilaya ===");

const diagParWilaya = db.patients.aggregate([
  { $unwind: "$consultations" },
  {
    $group: {
      _id: {
        wilaya: "$adresse.wilaya",
        diagnostic: "$consultations.diagnostic"
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1, "_id.wilaya": 1, "_id.diagnostic": 1 } },
  { $limit: 20 },
  {
    $project: {
      _id: 0,
      wilaya: "$_id.wilaya",
      diagnostic: "$_id.diagnostic",
      total: "$count"
    }
  }
]).toArray();

// printjson(diagParWilaya);

// ─── 3.2 : Médicament le plus prescrit par spécialité ─────────────────────────
print("\n=== 3.2 : Top médicaments par spécialité ===");

const medsParSpecialite = db.patients.aggregate([
  { $unwind: "$consultations" },
  { $unwind: "$consultations.medicaments" },
  {
    $group: {
      _id: {
        specialite: "$consultations.medecin.specialite",
        medicament: "$consultations.medicaments.nom"
      },
      nbPrescriptions: { $sum: 1 }
    }
  },
  { $sort: { "_id.specialite": 1, nbPrescriptions: -1, "_id.medicament": 1 } },
  {
    $group: {
      _id: "$_id.specialite",
      topMedicament: { $first: "$_id.medicament" },
      nbPrescriptions: { $first: "$nbPrescriptions" }
    }
  },
  {
    $project: {
      _id: 0,
      specialite: "$_id",
      medicament: "$topMedicament",
      nbPrescriptions: 1
    }
  },
  { $sort: { specialite: 1 } }
]).toArray();

// ─── 3.3 : Évolution mensuelle des consultations ──────────────────────────────
print("\n=== 3.3 : Consultations par mois (12 derniers mois) ===");

const evolutionMensuelle = db.patients.aggregate([
  { $unwind: "$consultations" },
  {
    $match: {
      "consultations.date": {
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      }
    }
  },
  {
    $group: {
      _id: {
        annee: { $year: "$consultations.date" },
        mois: { $month: "$consultations.date" }
      },
      totalConsultations: { $sum: 1 }
    }
  },
  { $sort: { "_id.annee": 1, "_id.mois": 1 } },
  {
    $project: {
      _id: 0,
      periode: {
        $concat: [
          { $toString: "$_id.annee" },
          "-",
          {
            $cond: [
              { $lt: ["$_id.mois", 10] },
              { $concat: ["0", { $toString: "$_id.mois" }] },
              { $toString: "$_id.mois" }
            ]
          }
        ]
      },
      totalConsultations: 1
    }
  }
]).toArray();

// ─── 3.4 : Patients à risque multiple ────────────────────────────────────────
print("\n=== 3.4 : Profil patients à risque élevé ===");

const patientsRisque = db.patients.aggregate([
  {
    $match: {
      antecedents: { $all: ["Diabète type 2", "HTA"] }
    }
  },
  {
    $addFields: {
      age: {
        $dateDiff: {
          startDate: "$dateNaissance",
          endDate: "$$NOW",
          unit: "year"
        }
      },
      nbConsultations: { $size: "$consultations" }
    }
  },
  {
    $match: {
      age: { $gt: 60 }
    }
  },
  {
    $group: {
      _id: null,
      nombrePatients: { $sum: 1 },
      ageMoyen: { $avg: "$age" },
      consultationsMoyennes: { $avg: "$nbConsultations" },
      ageMax: { $max: "$age" },
      ageMin: { $min: "$age" },
      patients: {
        $push: {
          cin: "$cin",
          nom: "$nom",
          prenom: "$prenom",
          age: "$age",
          wilaya: "$adresse.wilaya",
          nbConsultations: "$nbConsultations"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      nombrePatients: 1,
      ageMoyen: { $round: ["$ageMoyen", 1] },
      consultationsMoyennes: { $round: ["$consultationsMoyennes", 1] },
      ageMin: 1,
      ageMax: 1,
      patients: 1
    }
  }
]).toArray();

// ─── 3.5 : Rapport médecins ───────────────────────────────────────────────────
print("\n=== 3.5 : Top 5 médecins & taux de ré-consultation ===");

const rapportMedecins = db.patients.aggregate([
  { $unwind: "$consultations" },
  {
    $group: {
      _id: {
        nom: "$consultations.medecin.nom",
        specialite: "$consultations.medecin.specialite"
      },
      totalConsultations: { $sum: 1 },
      patientsUniques: { $addToSet: "$_id" }
    }
  },
  {
    $addFields: {
      nbPatientsUniques: { $size: "$patientsUniques" }
    }
  },
  {
    $addFields: {
      tauxReconsultation: {
        $multiply: [
          {
            $divide: [
              { $subtract: ["$totalConsultations", "$nbPatientsUniques"] },
              "$nbPatientsUniques"
            ]
          },
          100
        ]
      }
    }
  },
  { $sort: { totalConsultations: -1, tauxReconsultation: -1, "_id.nom": 1 } },
  { $limit: 5 },
  {
    $project: {
      _id: 0,
      medecin: "$_id.nom",
      specialite: "$_id.specialite",
      totalConsultations: 1,
      nbPatientsUniques: 1,
      tauxReconsultation: { $round: ["$tauxReconsultation", 2] }
    }
  }
]).toArray();

printjson(rapportMedecins);

/**
 * TP2 - Exercice 1 : Modélisation MongoDB
 * Use Case : HealthCare DZ - Dossiers Médicaux
 */

// Se connecter à la base médicale
use("medical_db");

// Nettoyage optionnel
db.patients.drop();
db.analyses.drop();

// ─── 1.1 : Créer la collection avec validation ────────────────────────────────
db.createCollection("patients", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["cin", "nom", "prenom", "dateNaissance", "sexe", "adresse", "consultations"],
      properties: {
        cin: {
          bsonType: "string",
          pattern: "^[0-9]{12}$",
          description: "CIN obligatoire, chaîne de 12 chiffres"
        },
        nom: {
          bsonType: "string",
          minLength: 2,
          description: "Nom obligatoire"
        },
        prenom: {
          bsonType: "string",
          minLength: 2,
          description: "Prénom obligatoire"
        },
        dateNaissance: {
          bsonType: "date",
          description: "Date de naissance obligatoire"
        },
        sexe: {
          enum: ["M", "F"],
          description: "Sexe obligatoire : M ou F"
        },
        adresse: {
          bsonType: "object",
          required: ["wilaya", "commune"],
          properties: {
            wilaya: { bsonType: "string" },
            commune: { bsonType: "string" }
          }
        },
        groupeSanguin: {
          enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
          description: "Groupe sanguin valide"
        },
        antecedents: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        allergies: {
          bsonType: "array",
          items: { bsonType: "string" }
        },
        consultations: {
          bsonType: "array",
          minItems: 2,
          items: {
            bsonType: "object",
            required: ["id", "date", "medecin", "diagnostic", "medicaments", "notes"],
            properties: {
              id: { bsonType: "binData", description: "UUID de consultation" },
              date: { bsonType: "date" },
              medecin: {
                bsonType: "object",
                required: ["nom", "specialite"],
                properties: {
                  nom: { bsonType: "string" },
                  specialite: { bsonType: "string" }
                }
              },
              diagnostic: { bsonType: "string" },
              tension: {
                bsonType: ["object", "null"],
                properties: {
                  systolique: { bsonType: "int" },
                  diastolique: { bsonType: "int" }
                }
              },
              medicaments: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["nom", "dosage", "duree"],
                  properties: {
                    nom: { bsonType: "string" },
                    dosage: { bsonType: "string" },
                    duree: { bsonType: "string" }
                  }
                }
              },
              notes: { bsonType: "string" }
            }
          }
        }
      }
    }
  }
});

// ─── 1.2 : Insérer des patients avec données algériennes ──────────────────────
const patients = [
  {
    cin: "198001012300",
    nom: "Bensalem",
    prenom: "Ahmed",
    dateNaissance: new Date("1980-01-01"),
    sexe: "M",
    adresse: { wilaya: "Alger", commune: "Bab Ezzouar" },
    groupeSanguin: "O+",
    antecedents: ["Diabète type 2", "HTA"],
    allergies: ["Pénicilline"],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-01-15"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "Hypertension artérielle",
        tension: { systolique: 145, diastolique: 92 },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }],
        notes: "Surveillance tensionnelle recommandée"
      },
      {
        id: UUID(),
        date: new Date("2024-07-10"),
        medecin: { nom: "Dr. Boudiaf", specialite: "Médecine interne" },
        diagnostic: "Diabète déséquilibré",
        tension: { systolique: 138, diastolique: 88 },
        medicaments: [{ nom: "Metformine", dosage: "850mg", duree: "60 jours" }],
        notes: "Renforcer régime alimentaire"
      },
      {
        id: UUID(),
        date: new Date("2025-03-03"),
        medecin: { nom: "Dr. Mansouri", specialite: "Cardiologie" },
        diagnostic: "HTA stabilisée",
        tension: { systolique: 132, diastolique: 84 },
        medicaments: [{ nom: "Amlodipine", dosage: "5mg", duree: "30 jours" }],
        notes: "Bonne évolution"
      }
    ]
  },
  {
    cin: "199203145611",
    nom: "Benali",
    prenom: "Sonia",
    dateNaissance: new Date("1992-03-14"),
    sexe: "F",
    adresse: { wilaya: "Oran", commune: "Es Senia" },
    groupeSanguin: "A+",
    antecedents: ["Asthme"],
    allergies: ["Poussière"],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-02-08"),
        medecin: { nom: "Dr. Cherif", specialite: "Pneumologie" },
        diagnostic: "Crise d'asthme légère",
        tension: null,
        medicaments: [{ nom: "Ventoline", dosage: "2 bouffées", duree: "7 jours" }],
        notes: "Eviter les allergènes"
      },
      {
        id: UUID(),
        date: new Date("2024-11-19"),
        medecin: { nom: "Dr. Cherif", specialite: "Pneumologie" },
        diagnostic: "Asthme contrôlé",
        tension: null,
        medicaments: [{ nom: "Seretide", dosage: "50/250", duree: "30 jours" }],
        notes: "Traitement de fond maintenu"
      }
    ]
  },
  {
    cin: "197511220455",
    nom: "Khelifi",
    prenom: "Nadir",
    dateNaissance: new Date("1975-11-22"),
    sexe: "M",
    adresse: { wilaya: "Constantine", commune: "El Khroub" },
    groupeSanguin: "B+",
    antecedents: ["HTA"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-03-12"),
        medecin: { nom: "Dr. Rahmani", specialite: "Cardiologie" },
        diagnostic: "Hypertension modérée",
        tension: { systolique: 150, diastolique: 95 },
        medicaments: [{ nom: "Losartan", dosage: "50mg", duree: "30 jours" }],
        notes: "Réduire le sel"
      },
      {
        id: UUID(),
        date: new Date("2025-01-16"),
        medecin: { nom: "Dr. Rahmani", specialite: "Cardiologie" },
        diagnostic: "Suivi HTA",
        tension: { systolique: 140, diastolique: 90 },
        medicaments: [{ nom: "Losartan", dosage: "50mg", duree: "60 jours" }],
        notes: "Amélioration légère"
      }
    ]
  },
  {
    cin: "198807093322",
    nom: "Mebarki",
    prenom: "Amel",
    dateNaissance: new Date("1988-07-09"),
    sexe: "F",
    adresse: { wilaya: "Annaba", commune: "El Bouni" },
    groupeSanguin: "AB+",
    antecedents: ["Anémie"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-04-05"),
        medecin: { nom: "Dr. Zaidi", specialite: "Hématologie" },
        diagnostic: "Anémie ferriprive",
        tension: null,
        medicaments: [{ nom: "Tardyferon", dosage: "80mg", duree: "90 jours" }],
        notes: "Complémentation en fer"
      },
      {
        id: UUID(),
        date: new Date("2025-02-20"),
        medecin: { nom: "Dr. Zaidi", specialite: "Hématologie" },
        diagnostic: "Amélioration de l'hémoglobine",
        tension: null,
        medicaments: [{ nom: "Tardyferon", dosage: "80mg", duree: "30 jours" }],
        notes: "Poursuivre encore un mois"
      }
    ]
  },
  {
    cin: "196904301278",
    nom: "Touati",
    prenom: "Karim",
    dateNaissance: new Date("1969-04-30"),
    sexe: "M",
    adresse: { wilaya: "Blida", commune: "Boufarik" },
    groupeSanguin: "O-",
    antecedents: ["Diabète type 2"],
    allergies: ["Aspirine"],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-05-11"),
        medecin: { nom: "Dr. Messaoudi", specialite: "Endocrinologie" },
        diagnostic: "Diabète mal équilibré",
        tension: { systolique: 136, diastolique: 86 },
        medicaments: [{ nom: "Insuline lente", dosage: "10 UI", duree: "30 jours" }],
        notes: "Autosurveillance glycémique"
      },
      {
        id: UUID(),
        date: new Date("2025-04-01"),
        medecin: { nom: "Dr. Messaoudi", specialite: "Endocrinologie" },
        diagnostic: "Diabète équilibré",
        tension: { systolique: 130, diastolique: 82 },
        medicaments: [{ nom: "Metformine", dosage: "1000mg", duree: "60 jours" }],
        notes: "Continuer activité physique"
      }
    ]
  },
  {
    cin: "199511160987",
    nom: "Bouziane",
    prenom: "Yasmine",
    dateNaissance: new Date("1995-11-16"),
    sexe: "F",
    adresse: { wilaya: "Tlemcen", commune: "Chetouane" },
    groupeSanguin: "A-",
    antecedents: ["Migraine"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-06-17"),
        medecin: { nom: "Dr. Ferhati", specialite: "Neurologie" },
        diagnostic: "Migraine sans aura",
        tension: null,
        medicaments: [{ nom: "Sumatriptan", dosage: "50mg", duree: "10 jours" }],
        notes: "Eviter stress et manque de sommeil"
      },
      {
        id: UUID(),
        date: new Date("2025-01-08"),
        medecin: { nom: "Dr. Ferhati", specialite: "Neurologie" },
        diagnostic: "Diminution de la fréquence des migraines",
        tension: null,
        medicaments: [{ nom: "Paracétamol", dosage: "1g", duree: "5 jours" }],
        notes: "Suivi si récidive"
      }
    ]
  },
  {
    cin: "198402280761",
    nom: "Ouali",
    prenom: "Samir",
    dateNaissance: new Date("1984-02-28"),
    sexe: "M",
    adresse: { wilaya: "Sétif", commune: "El Eulma" },
    groupeSanguin: "B-",
    antecedents: ["Ulcère gastrique"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-03-30"),
        medecin: { nom: "Dr. Haddad", specialite: "Gastro-entérologie" },
        diagnostic: "Gastrite",
        tension: null,
        medicaments: [{ nom: "Oméprazole", dosage: "20mg", duree: "21 jours" }],
        notes: "Régime sans épices"
      },
      {
        id: UUID(),
        date: new Date("2025-02-11"),
        medecin: { nom: "Dr. Haddad", specialite: "Gastro-entérologie" },
        diagnostic: "Stabilisation digestive",
        tension: null,
        medicaments: [{ nom: "Oméprazole", dosage: "20mg", duree: "14 jours" }],
        notes: "Amélioration nette"
      }
    ]
  },
  {
    cin: "199908050144",
    nom: "Saidi",
    prenom: "Lina",
    dateNaissance: new Date("1999-08-05"),
    sexe: "F",
    adresse: { wilaya: "Béjaïa", commune: "Akbou" },
    groupeSanguin: "O+",
    antecedents: ["Asthme allergique"],
    allergies: ["Pollens"],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-09-09"),
        medecin: { nom: "Dr. Merabet", specialite: "Allergologie" },
        diagnostic: "Rhinite allergique",
        tension: null,
        medicaments: [{ nom: "Cétirizine", dosage: "10mg", duree: "15 jours" }],
        notes: "Suivi saisonnier"
      },
      {
        id: UUID(),
        date: new Date("2025-03-18"),
        medecin: { nom: "Dr. Cherif", specialite: "Pneumologie" },
        diagnostic: "Asthme bien contrôlé",
        tension: null,
        medicaments: [{ nom: "Ventoline", dosage: "si besoin", duree: "30 jours" }],
        notes: "Bonne observance"
      }
    ]
  },
  {
    cin: "197812241532",
    nom: "Mokhtar",
    prenom: "Farid",
    dateNaissance: new Date("1978-12-24"),
    sexe: "M",
    adresse: { wilaya: "Djelfa", commune: "Ain Oussera" },
    groupeSanguin: "AB-",
    antecedents: ["Lombalgie chronique"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-10-03"),
        medecin: { nom: "Dr. Benyoucef", specialite: "Rhumatologie" },
        diagnostic: "Lombalgie mécanique",
        tension: null,
        medicaments: [{ nom: "Ibuprofène", dosage: "400mg", duree: "7 jours" }],
        notes: "Repos relatif"
      },
      {
        id: UUID(),
        date: new Date("2025-04-10"),
        medecin: { nom: "Dr. Benyoucef", specialite: "Rhumatologie" },
        diagnostic: "Douleurs persistantes",
        tension: null,
        medicaments: [{ nom: "Diclofénac", dosage: "50mg", duree: "10 jours" }],
        notes: "Kinésithérapie conseillée"
      }
    ]
  },
  {
    cin: "198610140633",
    nom: "Zerrouki",
    prenom: "Nabila",
    dateNaissance: new Date("1986-10-14"),
    sexe: "F",
    adresse: { wilaya: "Batna", commune: "Barika" },
    groupeSanguin: "A+",
    antecedents: ["Hypothyroïdie"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-01-22"),
        medecin: { nom: "Dr. Kerroum", specialite: "Endocrinologie" },
        diagnostic: "Hypothyroïdie stabilisée",
        tension: null,
        medicaments: [{ nom: "Levothyrox", dosage: "75µg", duree: "90 jours" }],
        notes: "Contrôle TSH dans 3 mois"
      },
      {
        id: UUID(),
        date: new Date("2025-02-05"),
        medecin: { nom: "Dr. Kerroum", specialite: "Endocrinologie" },
        diagnostic: "TSH normale",
        tension: null,
        medicaments: [{ nom: "Levothyrox", dosage: "75µg", duree: "90 jours" }],
        notes: "Traitement maintenu"
      }
    ]
  },
  {
    cin: "197301090711",
    nom: "Hamdi",
    prenom: "Rachid",
    dateNaissance: new Date("1973-01-09"),
    sexe: "M",
    adresse: { wilaya: "Tizi Ouzou", commune: "Draâ Ben Khedda" },
    groupeSanguin: "O+",
    antecedents: ["HTA", "Hypercholestérolémie"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-08-14"),
        medecin: { nom: "Dr. Amrane", specialite: "Cardiologie" },
        diagnostic: "Dyslipidémie",
        tension: { systolique: 148, diastolique: 93 },
        medicaments: [{ nom: "Atorvastatine", dosage: "20mg", duree: "30 jours" }],
        notes: "Régime hypolipidiant"
      },
      {
        id: UUID(),
        date: new Date("2025-03-25"),
        medecin: { nom: "Dr. Amrane", specialite: "Cardiologie" },
        diagnostic: "Amélioration du profil lipidique",
        tension: { systolique: 138, diastolique: 87 },
        medicaments: [{ nom: "Atorvastatine", dosage: "20mg", duree: "60 jours" }],
        notes: "Poursuite du traitement"
      }
    ]
  },
  {
    cin: "199001270822",
    nom: "Ait Ali",
    prenom: "Salima",
    dateNaissance: new Date("1990-01-27"),
    sexe: "F",
    adresse: { wilaya: "Biskra", commune: "Tolga" },
    groupeSanguin: "B+",
    antecedents: ["Anxiété"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-05-29"),
        medecin: { nom: "Dr. Kaci", specialite: "Psychiatrie" },
        diagnostic: "Trouble anxieux léger",
        tension: null,
        medicaments: [{ nom: "Hydroxyzine", dosage: "25mg", duree: "14 jours" }],
        notes: "Relaxation conseillée"
      },
      {
        id: UUID(),
        date: new Date("2025-01-30"),
        medecin: { nom: "Dr. Kaci", specialite: "Psychiatrie" },
        diagnostic: "Amélioration clinique",
        tension: null,
        medicaments: [{ nom: "Hydroxyzine", dosage: "25mg", duree: "7 jours" }],
        notes: "Espacer les prises"
      }
    ]
  },
  {
    cin: "198305170933",
    nom: "Rezig",
    prenom: "Khaled",
    dateNaissance: new Date("1983-05-17"),
    sexe: "M",
    adresse: { wilaya: "Mostaganem", commune: "Mazagran" },
    groupeSanguin: "A-",
    antecedents: ["Bronchite chronique"],
    allergies: ["Fumée"],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-12-04"),
        medecin: { nom: "Dr. Bendris", specialite: "Pneumologie" },
        diagnostic: "Bronchite aiguë",
        tension: null,
        medicaments: [{ nom: "Amoxicilline", dosage: "1g", duree: "8 jours" }],
        notes: "Arrêt du tabac fortement conseillé"
      },
      {
        id: UUID(),
        date: new Date("2025-04-22"),
        medecin: { nom: "Dr. Bendris", specialite: "Pneumologie" },
        diagnostic: "Toux chronique stabilisée",
        tension: null,
        medicaments: [{ nom: "Acétylcystéine", dosage: "600mg", duree: "10 jours" }],
        notes: "Hydratation recommandée"
      }
    ]
  },
  {
    cin: "199704060244",
    nom: "Guerfi",
    prenom: "Imene",
    dateNaissance: new Date("1997-04-06"),
    sexe: "F",
    adresse: { wilaya: "Médéa", commune: "Berrouaghia" },
    groupeSanguin: "O-",
    antecedents: ["SOPK"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-03-07"),
        medecin: { nom: "Dr. Laib", specialite: "Gynécologie" },
        diagnostic: "SOPK avec cycles irréguliers",
        tension: null,
        medicaments: [{ nom: "Metformine", dosage: "500mg", duree: "60 jours" }],
        notes: "Suivi hormonal"
      },
      {
        id: UUID(),
        date: new Date("2025-02-14"),
        medecin: { nom: "Dr. Laib", specialite: "Gynécologie" },
        diagnostic: "Amélioration du cycle",
        tension: null,
        medicaments: [{ nom: "Metformine", dosage: "500mg", duree: "30 jours" }],
        notes: "Poursuivre suivi"
      }
    ]
  },
  {
    cin: "196612180355",
    nom: "Brahimi",
    prenom: "Mustapha",
    dateNaissance: new Date("1966-12-18"),
    sexe: "M",
    adresse: { wilaya: "Chlef", commune: "Oued Fodda" },
    groupeSanguin: "B+",
    antecedents: ["Arthrose"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-07-21"),
        medecin: { nom: "Dr. Kherfi", specialite: "Rhumatologie" },
        diagnostic: "Gonarthrose",
        tension: null,
        medicaments: [{ nom: "Paracétamol", dosage: "1g", duree: "15 jours" }],
        notes: "Rééducation articulaire"
      },
      {
        id: UUID(),
        date: new Date("2025-03-12"),
        medecin: { nom: "Dr. Kherfi", specialite: "Rhumatologie" },
        diagnostic: "Douleurs mécaniques modérées",
        tension: null,
        medicaments: [{ nom: "Diclofénac", dosage: "50mg", duree: "7 jours" }],
        notes: "Eviter surcharge pondérale"
      }
    ]
  },
  {
    cin: "198911290466",
    nom: "Belkacem",
    prenom: "Rym",
    dateNaissance: new Date("1989-11-29"),
    sexe: "F",
    adresse: { wilaya: "Skikda", commune: "Azzaba" },
    groupeSanguin: "AB+",
    antecedents: ["Eczéma"],
    allergies: ["Cosmétiques"],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-06-03"),
        medecin: { nom: "Dr. Othmani", specialite: "Dermatologie" },
        diagnostic: "Poussée d'eczéma",
        tension: null,
        medicaments: [{ nom: "Bétaméthasone", dosage: "crème", duree: "10 jours" }],
        notes: "Hydratation cutanée"
      },
      {
        id: UUID(),
        date: new Date("2025-01-27"),
        medecin: { nom: "Dr. Othmani", specialite: "Dermatologie" },
        diagnostic: "Rémission partielle",
        tension: null,
        medicaments: [{ nom: "Émollient", dosage: "2 applications/j", duree: "30 jours" }],
        notes: "Eviter produits irritants"
      }
    ]
  },
  {
    cin: "197707150577",
    nom: "Merzoug",
    prenom: "Adel",
    dateNaissance: new Date("1977-07-15"),
    sexe: "M",
    adresse: { wilaya: "Jijel", commune: "Taher" },
    groupeSanguin: "O+",
    antecedents: ["Calculs rénaux"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-02-28"),
        medecin: { nom: "Dr. Khelil", specialite: "Néphrologie" },
        diagnostic: "Colique néphrétique",
        tension: { systolique: 142, diastolique: 90 },
        medicaments: [{ nom: "Spasfon", dosage: "80mg", duree: "5 jours" }],
        notes: "Hydratation importante"
      },
      {
        id: UUID(),
        date: new Date("2025-04-04"),
        medecin: { nom: "Dr. Khelil", specialite: "Néphrologie" },
        diagnostic: "Absence de récidive",
        tension: { systolique: 134, diastolique: 84 },
        medicaments: [{ nom: "Citrate de potassium", dosage: "10ml", duree: "30 jours" }],
        notes: "Poursuivre prévention"
      }
    ]
  },
  {
    cin: "199312120688",
    nom: "Belaid",
    prenom: "Nesrine",
    dateNaissance: new Date("1993-12-12"),
    sexe: "F",
    adresse: { wilaya: "Ghardaïa", commune: "Berriane" },
    groupeSanguin: "A+",
    antecedents: ["Diabète gestationnel ancien"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-04-18"),
        medecin: { nom: "Dr. Tebbal", specialite: "Médecine interne" },
        diagnostic: "Pré-diabète",
        tension: null,
        medicaments: [{ nom: "Metformine", dosage: "500mg", duree: "30 jours" }],
        notes: "Surveillance glycémie"
      },
      {
        id: UUID(),
        date: new Date("2025-02-09"),
        medecin: { nom: "Dr. Tebbal", specialite: "Médecine interne" },
        diagnostic: "Glycémie améliorée",
        tension: null,
        medicaments: [{ nom: "Metformine", dosage: "500mg", duree: "30 jours" }],
        notes: "Poursuivre régime"
      }
    ]
  },
  {
    cin: "198208230799",
    nom: "Kaci",
    prenom: "Hakim",
    dateNaissance: new Date("1982-08-23"),
    sexe: "M",
    adresse: { wilaya: "Ouargla", commune: "Touggourt" },
    groupeSanguin: "B-",
    antecedents: ["HTA", "Surpoids"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-09-15"),
        medecin: { nom: "Dr. Sahnoune", specialite: "Cardiologie" },
        diagnostic: "HTA non contrôlée",
        tension: { systolique: 155, diastolique: 98 },
        medicaments: [{ nom: "Valsartan", dosage: "80mg", duree: "30 jours" }],
        notes: "Perte de poids conseillée"
      },
      {
        id: UUID(),
        date: new Date("2025-03-29"),
        medecin: { nom: "Dr. Sahnoune", specialite: "Cardiologie" },
        diagnostic: "Pression artérielle en amélioration",
        tension: { systolique: 142, diastolique: 90 },
        medicaments: [{ nom: "Valsartan", dosage: "80mg", duree: "60 jours" }],
        notes: "Poursuivre surveillance"
      }
    ]
  },
  {
    cin: "199606110810",
    nom: "Derbal",
    prenom: "Chaima",
    dateNaissance: new Date("1996-06-11"),
    sexe: "F",
    adresse: { wilaya: "Mascara", commune: "Sig" },
    groupeSanguin: "O+",
    antecedents: ["Asthme léger"],
    allergies: ["Pollen"],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-05-06"),
        medecin: { nom: "Dr. Cherif", specialite: "Pneumologie" },
        diagnostic: "Toux allergique",
        tension: null,
        medicaments: [{ nom: "Ventoline", dosage: "si besoin", duree: "15 jours" }],
        notes: "Eviter exposition extérieure"
      },
      {
        id: UUID(),
        date: new Date("2025-04-06"),
        medecin: { nom: "Dr. Cherif", specialite: "Pneumologie" },
        diagnostic: "Etat respiratoire stable",
        tension: null,
        medicaments: [{ nom: "Montélukast", dosage: "10mg", duree: "30 jours" }],
        notes: "Suivi annuel"
      }
    ]
  },
  {
    cin: "197910190921",
    nom: "Ghezali",
    prenom: "Walid",
    dateNaissance: new Date("1979-10-19"),
    sexe: "M",
    adresse: { wilaya: "Tiaret", commune: "Sougueur" },
    groupeSanguin: "A+",
    antecedents: ["Reflux gastro-oesophagien"],
    allergies: [],
    consultations: [
      {
        id: UUID(),
        date: new Date("2024-08-08"),
        medecin: { nom: "Dr. Haddad", specialite: "Gastro-entérologie" },
        diagnostic: "RGO symptomatique",
        tension: null,
        medicaments: [{ nom: "Esoméprazole", dosage: "40mg", duree: "30 jours" }],
        notes: "Eviter repas tardifs"
      },
      {
        id: UUID(),
        date: new Date("2025-01-21"),
        medecin: { nom: "Dr. Haddad", specialite: "Gastro-entérologie" },
        diagnostic: "Amélioration digestive",
        tension: null,
        medicaments: [{ nom: "Esoméprazole", dosage: "20mg", duree: "15 jours" }],
        notes: "Bonne réponse"
      }
    ]
  }
];

db.patients.insertMany(patients);

// ─── 1.3 : Collection analyses (référencée) ───────────────────────────────────
db.createCollection("analyses");

const insertedPatients = db.patients.find({}, { cin: 1 }).toArray();

const analyses = insertedPatients.flatMap((p, i) => ([
  {
    patient_id: p._id,
    cin_patient: p.cin,
    type: "Glycémie",
    dateAnalyse: new Date(`2024-${String((i % 9) + 1).padStart(2, "0")}-10`),
    laboratoire: "Laboratoire El Amel",
    resultat: { valeur: 1.1 + (i % 5) * 0.1, unite: "g/L" },
    commentaire: "Contrôle glycémique"
  },
  {
    patient_id: p._id,
    cin_patient: p.cin,
    type: "NFS",
    dateAnalyse: new Date(`2024-${String((i % 9) + 1).padStart(2, "0")}-18`),
    laboratoire: "BioSanté DZ",
    resultat: { hemoglobine: 12 + (i % 4), leucocytes: 6000 + i * 120 },
    commentaire: "Bilan sanguin standard"
  },
  {
    patient_id: p._id,
    cin_patient: p.cin,
    type: i % 2 === 0 ? "Lipidogramme" : "Créatinine",
    dateAnalyse: new Date(`2025-${String((i % 4) + 1).padStart(2, "0")}-06`),
    laboratoire: "Clinilab",
    resultat: i % 2 === 0
      ? { cholesterolTotal: 1.7 + i * 0.03, triglycerides: 1.1 + i * 0.02 }
      : { valeur: 8 + (i % 6), unite: "mg/L" },
    commentaire: "Suivi périodique"
  }
]));

db.analyses.insertMany(analyses);

print("✅ Modélisation terminée. Patients insérés: " + db.patients.countDocuments());
print("✅ Analyses insérées: " + db.analyses.countDocuments());

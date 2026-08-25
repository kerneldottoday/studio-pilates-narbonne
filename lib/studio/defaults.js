/** Formules alignées sur la page Tarifs actuelle (miroir bsport). */

const PRODUCTS = [
  {
    id: "reformer-1",
    group: "unit",
    featured: false,
    active: true,
    name: "Reformer, 1 cours",
    priceCents: 3200,
    credits: 1,
    validityMonths: 12,
    duration: "1 h",
    description:
      "Une séance de Reformer pour renforcer le corps en profondeur, améliorer la posture et gagner en souplesse.",
  },
  {
    id: "reformer-essai",
    group: "unit",
    featured: false,
    active: true,
    name: "Séance d'essai Reformer",
    priceCents: 2800,
    credits: 1,
    validityMonths: 1,
    duration: "1 h",
    description:
      "Cours Reformer en petit groupe. La séance d'essai est remboursée lors de l'achat d'une carte de 10 séances Reformer.",
  },
  {
    id: "mat-yoga-1",
    group: "unit",
    featured: false,
    active: true,
    name: "Mat ou Yoga, 1 cours",
    priceCents: 1250,
    credits: 1,
    validityMonths: 1,
    duration: "1 h",
    description:
      "Pilates Mat ou Yoga Ashtanga à l'unité. Idéal pour tester une discipline ou compléter votre pratique Reformer.",
  },
  {
    id: "reformer-5",
    group: "pack",
    featured: false,
    active: true,
    name: "Carte 5 cours Reformer",
    priceCents: 16000,
    credits: 5,
    validityMonths: 4,
    duration: "1 h",
    description:
      "Pour venir régulièrement au Reformer et progresser séance après séance en petit groupe.",
  },
  {
    id: "reformer-10",
    group: "pack",
    featured: true,
    active: true,
    name: "Carte 10 cours Reformer",
    priceCents: 31500,
    credits: 10,
    validityMonths: 4,
    duration: "1 h",
    description:
      "Le meilleur rapport pour une pratique régulière au Reformer. La séance d'essai est déduite lors de cet achat.",
  },
  {
    id: "mat-5",
    group: "pack",
    featured: false,
    active: true,
    name: "Pilates Mat, 5 cours",
    priceCents: 5500,
    credits: 5,
    validityMonths: 2,
    duration: "1 h",
    description:
      "Séries fluides au sol : renforcement, étirements, mobilité et respiration en Pilates Mat.",
  },
];

const SCHEDULE = [
  { id: "tue-0830", day: "Mardi", start: "08:30", end: "09:30", title: "Reformer", level: "Intermédiaire", capacity: 6, kind: "reformer" },
  { id: "tue-0930", day: "Mardi", start: "09:30", end: "10:30", title: "Reformer", level: "Tous niveaux", capacity: 6, kind: "reformer" },
  { id: "tue-1815", day: "Mardi", start: "18:15", end: "19:15", title: "RESET", level: "Tous niveaux", capacity: 10, kind: "mat" },
  { id: "tue-1915", day: "Mardi", start: "19:15", end: "20:15", title: "Stretching", level: "Tous niveaux", capacity: 10, kind: "mat" },
  { id: "wed-0930", day: "Mercredi", start: "09:30", end: "10:30", title: "Reformer", level: "Intermédiaire", capacity: 6, kind: "reformer" },
  { id: "wed-1030", day: "Mercredi", start: "10:30", end: "11:30", title: "Reformer", level: "Tous niveaux", capacity: 6, kind: "reformer" },
  { id: "wed-1830", day: "Mercredi", start: "18:30", end: "19:30", title: "Yoga Ashtanga", level: "Niveau 2", capacity: 10, kind: "mat" },
  { id: "thu-0930", day: "Jeudi", start: "09:30", end: "10:30", title: "Reformer", level: "Intermédiaire", capacity: 6, kind: "reformer" },
  { id: "thu-1030", day: "Jeudi", start: "10:30", end: "11:30", title: "Reformer", level: "Tous niveaux", capacity: 6, kind: "reformer" },
  { id: "thu-1230", day: "Jeudi", start: "12:30", end: "13:30", title: "Reformer", level: "Intermédiaire", capacity: 6, kind: "reformer" },
  { id: "thu-1815", day: "Jeudi", start: "18:15", end: "19:15", title: "RESET", level: "Tous niveaux", capacity: 10, kind: "mat" },
  { id: "thu-1915", day: "Jeudi", start: "19:15", end: "20:15", title: "Yoga débutant", level: "Débutant", capacity: 10, kind: "mat" },
  { id: "fri-1030", day: "Vendredi", start: "10:30", end: "11:30", title: "Reformer", level: "Tous niveaux", capacity: 6, kind: "reformer" },
  { id: "fri-1230", day: "Vendredi", start: "12:30", end: "13:30", title: "Reformer", level: "Tous niveaux", capacity: 6, kind: "reformer" },
  { id: "sat-0930", day: "Samedi", start: "09:30", end: "10:30", title: "Reformer", level: "Tous niveaux", capacity: 6, kind: "reformer" },
  { id: "sat-1030", day: "Samedi", start: "10:30", end: "11:30", title: "Reformer", level: "Tous niveaux", capacity: 6, kind: "reformer" },
];

const RENTREE = "2026-09-15";
const SCHEDULE_WEEKS = 12;

module.exports = { PRODUCTS, SCHEDULE, RENTREE, SCHEDULE_WEEKS };

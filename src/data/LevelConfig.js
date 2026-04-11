// Asumimos: 1 Macetón = 1 Rosario (50 Ave Marías) = ~20 min de rezo meditativo
// 3 Macetones = ~1 hora

export const NIVELES = [
  { id: 1, name: "La Semilla", description: "El inicio del hábito.", rutinaDiaria: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 0: 1 } },
  { id: 2, name: "El Buscador", description: "Buscando constancia.", rutinaDiaria: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 0: 2 } },
  { id: 3, name: "Fiel Diario", description: "Fidelidad de un misterio.", rutinaDiaria: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 0: 3 } },
  { id: 4, name: "Ferviente", description: "Aumentando el fervor.", rutinaDiaria: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 0: 4 } },
  { id: 5, name: "Devoto", description: "Dedicación consistente.", rutinaDiaria: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 0: 5 } },
  { id: 6, name: "Rosario Completo", description: "Los 4 misterios del día.", rutinaDiaria: { 1: 4, 2: 4, 3: 4, 4: 4, 5: 4, 6: 4, 0: 6 } },
  {
    id: 7,
    name: "El Asceta",
    description: "Régimen intensivo de fin de semana y días de penitencia.",
    rutinaDiaria: {
      1: 6,  // Lunes: 2 horas (6 rosarios)
      2: 12, // Martes: 4 horas (12 rosarios)
      3: 6,  // Miércoles: 2 horas
      4: 6,  // Jueves: 2 horas
      5: 12, // Viernes: 4 horas (12 rosarios)
      6: 12, // Sábado: 4 horas (12 rosarios)
      0: 18  // Domingo: 6 horas (18 rosarios)
    }
  },
  { id: 8, name: "Guerrero Espiritual", description: "Constancia y disciplina robusta.", rutinaDiaria: { 1: 12, 2: 12, 3: 12, 4: 12, 5: 12, 6: 12, 0: 18 } },
  { id: 9, name: "Intercesor", description: "Oración profunda diaria.", rutinaDiaria: { 1: 15, 2: 15, 3: 15, 4: 15, 5: 15, 6: 15, 0: 20 } },
  { id: 10, name: "Contemplativo", description: "Viviendo en oración.", rutinaDiaria: { 1: 20, 2: 20, 3: 20, 4: 20, 5: 20, 6: 20, 0: 25 } },
  { id: 11, name: "Místico", description: "Unión ininterrumpida.", rutinaDiaria: { 1: 25, 2: 25, 3: 25, 4: 25, 5: 25, 6: 25, 0: 30 } },
  {
    id: 12,
    name: "Padre Pío",
    description: "Oración incesante.",
    rutinaDiaria: {
      1: 34, 2: 34, 3: 34, 4: 34, 5: 34, 6: 34, 0: 34
    }
  }
];

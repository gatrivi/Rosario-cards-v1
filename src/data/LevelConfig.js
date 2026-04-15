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

export const PEREGRINACIONES = [
  { id: 1, name: "Ir a la Iglesia (Local)", description: "Caminar a la parroquia local.", hrs: 1, reqAveMarias: 200 },
  { id: 2, name: "Santuario de Schoenstatt", description: "Peregrinación urbana.", hrs: 5, reqAveMarias: 1000 },
  { id: 3, name: "Santuario de Luján", description: "Desde Buenos Aires a Luján (60km).", hrs: 15, reqAveMarias: 3000 },
  { id: 4, name: "The Jesus Trail", description: "De Nazaret a Cafarnaúm (65km).", hrs: 18, reqAveMarias: 3600 },
  { id: 5, name: "Santuario de Fátima", description: "Desde Lisboa a Fátima (140km).", hrs: 35, reqAveMarias: 7000 },
  { id: 6, name: "Virgen de Guadalupe", description: "Desde Puebla a la Basílica (150km).", hrs: 40, reqAveMarias: 8000 },
  { id: 7, name: "Camino de Asís", description: "Desde Florencia a Asís (380km).", hrs: 95, reqAveMarias: 19000 },
  { id: 8, name: "Camino de Santiago", description: "El histórico Camino Francés (800km).", hrs: 200, reqAveMarias: 40000 },
  { id: 9, name: "Vía de la Plata", description: "De Sevilla a Santiago (1000km).", hrs: 250, reqAveMarias: 50000 },
  { id: 10, name: "Vía Francígena", description: "De Canterbury a Roma (2000km).", hrs: 500, reqAveMarias: 100000 },
  { id: 11, name: "Jerusalem Way", description: "El camino a Tierra Santa (5000km).", hrs: 1250, reqAveMarias: 250000 },
  { id: 12, name: "El Camino al Cielo", description: "Una vida incesante de oración.", hrs: 10000, reqAveMarias: 2000000 }
];

export const getPeregrinacionActual = (totalAveMarias) => {
  // Encuentra la peregrinación más alta que el usuario ya comenzó o completó
  let actual = PEREGRINACIONES[0];
  for (let p of PEREGRINACIONES) {
     if (totalAveMarias >= p.reqAveMarias) {
        // Ya la pasó, o está en ella
        actual = p;
     } else {
        // En progreso hacia esta
        return { actual, next: p };
     }
  }
  return { actual, next: null };
};

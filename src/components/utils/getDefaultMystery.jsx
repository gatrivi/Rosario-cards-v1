export const getDefaultMystery = () => {
  const today = new Date().getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
  switch (today) {
    case 1: // Lunes
    case 6: // Sábado
      return "gozosos";
    case 2: // Martes
    case 5: // Viernes
      return "dolorosos";
    case 3: // Miércoles
    case 0: // Domingo
      return "gloriosos";
    case 4: // Jueves
      return "luminosos";
    default:
      return "gozosos"; // Fallback
  }
};

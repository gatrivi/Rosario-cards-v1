export const VIEW_ROUTES = {
  stats: '/stats',
  tracker: '/plan',
  camino: '/camino',
  booklet: '/libro',
  rose: '/rosa',
  rosary: '/rosario',
  voz: '/voz',
  monk: '/monk',
  macetones: '/macetones',
  jardin: '/jardin',
};

export const VALID_PATHS = new Set(['/', ...Object.values(VIEW_ROUTES)]);

export function getViewIdFromPath(pathname) {
  if (pathname === '/' || pathname === '/libro') return 'booklet';
  const entry = Object.entries(VIEW_ROUTES).find(([, path]) => path === pathname);
  return entry ? entry[0] : 'booklet';
}

export function getPathForView(viewId) {
  return VIEW_ROUTES[viewId] || '/libro';
}

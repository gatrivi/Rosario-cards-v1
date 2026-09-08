export const VIEW_ROUTES = {
  tracker: '/plan',
  camino: '/camino',
  reliquias: '/reliquias',
  booklet: '/libro',
  rose: '/rosa',
  rosary: '/rosario',
  voz: '/voz',
  playlist: '/cola',
  monk: '/monk',
  macetones: '/macetones',
  jardin: '/jardin',
  assets: '/assets',
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

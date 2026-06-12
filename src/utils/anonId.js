const KEY = 'shotmap_anon_id'
export function getAnonId() { return localStorage.getItem(KEY) }
export function setAnonId(id) { localStorage.setItem(KEY, id) }
export function clearAnonId() { localStorage.removeItem(KEY) }

// Web preview only (metro.config.js swaps this in for platform "web").
// The real app runs on iOS/Android and uses the native secure store.
const get = (k) => { try { return localStorage.getItem('ss_' + k); } catch { return null; } };
const set = (k, v) => { try { localStorage.setItem('ss_' + k, v); } catch {} };
const del = (k) => { try { localStorage.removeItem('ss_' + k); } catch {} };
module.exports = {
  getItemAsync: async (k) => get(k),
  setItemAsync: async (k, v) => set(k, v),
  deleteItemAsync: async (k) => del(k),
  getItem: get,
  setItem: set,
  isAvailableAsync: async () => true,
  AFTER_FIRST_UNLOCK: 0, AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 1, ALWAYS: 2,
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 3, ALWAYS_THIS_DEVICE_ONLY: 4, WHEN_UNLOCKED: 5, WHEN_UNLOCKED_THIS_DEVICE_ONLY: 6,
};

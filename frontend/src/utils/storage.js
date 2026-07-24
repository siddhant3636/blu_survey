export const getLocal = (key) => {
  return localStorage.getItem(key);
};

export const setLocal = (key, val) => {
  localStorage.setItem(key, val);
};

export const removeLocal = (key) => {
  localStorage.removeItem(key);
};

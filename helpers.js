const serializePhone = (phone) => `${phone}@c.us`;

const sanitizePhone = (phone) => phone.replaceAll(/[-+\)\(\s\D]/g, "");

const sleep = (t) => new Promise((r) => setTimeout(r, t));

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const unduplicate = (list) => [...new Set([...list])];

const exclude = (originalArray, itemsToExclude) => {
  const newArray = originalArray.filter(item => !itemsToExclude.includes(item));
  return newArray;
}

module.exports = {
  serializePhone,
  sanitizePhone,
  sleep,
  random,
  unduplicate,
  exclude
}

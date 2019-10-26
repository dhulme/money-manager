import cryptoRandomString from 'crypto-random-string';

// The first call to this is slow for some reason,
// so we do this upfront so first UI operation isn't slow.
getId();

export function required(param) {
  throw new Error(`${param} is required`);
}

export function requireObjectProperties(object, params) {
  const errors = params.reduce((acc, param) => {
    if (object[param] === undefined) {
      return [...acc, param];
    }
    return acc;
  }, []);
  if (errors.length) {
    required(errors.join(','));
  }
}

export function getFriendlyId(name, existingIds) {
  const id = name.toLowerCase().replace(/[ ]/g, '-');
  if (existingIds.includes(id)) {
    throw new Error(`Duplicate ID. Id ${id} has already been used`);
  }
  return id;
}

export function getId() {
  return cryptoRandomString({ length: 10 });
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

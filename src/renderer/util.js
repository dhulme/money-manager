import cryptoRandomString from 'crypto-random-string';

// The first call to this is slow for some reason,
// so we do this upfront so first UI operation isn't slow.
cryptoRandomString(10);

export default {
  getFriendlyId(name, existingIds) {
    const id = name.toLowerCase().replace(/[ ]/g, '-');
    if (existingIds.includes(id)) {
      throw new Error(`Duplicate ID. Id ${id} has already been used`);
    }
    return id;
  },

  getId() {
    return cryptoRandomString(10);
  },

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};

import cryptoRandomString from 'crypto-random-string';

export default {
  getFriendlyId(name, existingIds) {
    const id = name.toLowerCase().replace(/[ ]/g, '-');
    if (existingIds.includes(id)) {
      throw new Error(`Duplicate ID. Id ${id} has already been used`);
    }
    return id;
  },

  getId() {
    return cryptoRandomString({ length: 10 });
  },

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
};

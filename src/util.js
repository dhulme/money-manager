import cryptoRandomString from 'crypto-random-string';

export default {
  getFriendlyId(name, existingIds) {
    const id = name.toLowerCase().replace(/[ ]/g, '-');
    if (existingIds.includes(id)) {
      throw new Error(`Id ${id} has already been used`);
    }
    return id;
  },

  getId() {
    return cryptoRandomString(10);
  }
};

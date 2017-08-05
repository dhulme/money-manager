export default {
  getId(name) {
    return name.toLowerCase().replace(/[ ]/g, '-');
  },
};

<template>
  <VBtn :color="color" :text="text" @click="click" class="mr-3">
    <slot />
  </VBtn>
</template>

<script>
export default {
  props: {
    routeName: String,
    childRouteNames: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    active() {
      const route = this.$route.name;
      return route === this.routeName || this.childRouteNames.includes(route);
    },
    color() {
      return this.active ? 'black' : '';
    },
    text() {
      return !this.active;
    },
  },
  methods: {
    click() {
      this.$store.commit('setSearch', '');
      this.$router.push({
        name: this.routeName,
      });
    },
  },
};
</script>

<template>
  <v-btn :color="color" :variant="active ? 'flat' : 'text'" @click="click" class="mr-3">
    <slot />
  </v-btn>
</template>

<script>
import { useRootStore } from '../store/root';

export default {
  props: {
    routeName: String,
    childRouteNames: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    return { rootStore: useRootStore() };
  },
  computed: {
    active() {
      const route = this.$route.name;
      return route === this.routeName || this.childRouteNames.includes(route);
    },
    color() {
      return this.active ? 'black' : '';
    },
  },
  methods: {
    click() {
      this.rootStore.setSearch('');
      this.$router.push({
        name: this.routeName,
      });
    },
  },
};
</script>

<template>
  <v-btn 
    :color="color" 
    :flat="flat" 
    @click="click">
    <slot/>
  </v-btn>
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
      flat() {
        return !this.active;
      },
    },
    methods: {
      click() {
        this.$router.push({
          name: this.routeName,
        });
      },
    },
  };
</script>

<style lang="scss">

</style>
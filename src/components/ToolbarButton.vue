<template>
  <v-btn :color="color" :flat="flat" @click="click">
    <slot></slot>
  </v-btn>
</template>

<script>
  export default {
    props: ['routeName'],
    computed: {
      active() {
        return this.$route.name === this.routeName;
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
<template>
  <button class="btn btn-default" @click="back">
    {{ $t('backButton.backTo')}} {{ $t(`backButton.pages.${name}`) }}</button>
</template>

<script>
  export default {
    props: ['name'],
    methods: {
      back() {
        this.$router.push({
          name: this.name,
        });
      },
    },
  };
</script>

<style>
  
</style>

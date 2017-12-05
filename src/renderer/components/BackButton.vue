<template>
  <v-btn @click="back">
    {{ $t('backButton.backTo')}} {{ $t(`backButton.pages.${name}`) }}</v-btn>
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
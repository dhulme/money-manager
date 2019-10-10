<template>
  <VBtn @click="back">
    {{ $t('backButton.backTo') }} {{ $t(`backButton.pages.${name}`) }}</VBtn>
</template>

<script>
  export default {
    props: {
			name: String
		},
    methods: {
      back() {
        this.$router.push({
          name: this.name,
        });
      },
    },
  };
</script>
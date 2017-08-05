<template>
  <div>
    <button class="btn btn-default btn-sm" @click="saveProject()" :disabled="saveState === 'saving'">
      <template v-if="saveState === 'saving'">Saving</template>
      <template v-else>Save</template>
    </button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        saveState: 'saved',
      };
    },
    methods: {
      saveProject() {
        this.saveState = 'saving';
        this.$project.save();
        setTimeout(() => this.saveState = 'saved', 500);
      },
    },
    mounted() {
      // setInterval(() => this.saveProject(), 1000 * 60);
    },
  };
</script>

<style lang="scss" scoped>
  button {
    margin-right: 5px;
  }
</style>


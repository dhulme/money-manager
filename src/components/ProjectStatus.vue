<template>
  <div>
    <span v-show="saveState === 'unsaved'" class="label label-default">Unsaved changes</span>
    <span v-show="saveState === 'saving'" class="label label-primary">Saving</span>
    <span v-show="saveState === 'saved'" class="label label-success">Saved</span>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        saveState: 'unsaved',
      };
    },
    methods: {
      async saveProject() {
        this.saveState = 'saving';
        await this.$project.save();
        this.saveState = 'saved';

        setTimeout(() => {
          this.saveState = 'unsaved';
        }, 1000 * 10);
      },
    },
    mounted() {
      this.saveProject();
      setInterval(() => this.saveProject(), 1000 * 60);
    },
  };
</script>

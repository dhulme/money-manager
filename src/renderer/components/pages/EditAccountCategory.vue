<template>
  <div v-hotkey.close="goToAccounts">
    <v-card>
      <v-card-title>
        <div class="text-subtitle-1">
          {{ category.id ? 'Edit' : 'Add' }} Account Category
        </div>
      </v-card-title>
      <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="save">
        <v-card-text>
          <v-text-field
            v-model="category.name"
            label="Name"
            :rules="nameRules"
            class="required"
          />
          <v-select
            :items="types"
            v-model="category.type"
            label="Type"
            :rules="typeRules"
            class="required"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn type="submit" color="primary" variant="text">OK</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      category: {
        name: '',
        type: '',
        id: null
      },
      valid: true,
      formClean: true,
      nameRules: [value => this.formClean || !!value || 'Name is required'],
      typeRules: [value => this.formClean || !!value || 'Type is required']
    };
  },
  computed: {
    types() {
      return [
        { title: 'Asset', value: 'asset' },
        { title: 'Budget', value: 'budget' }
      ];
    }
  },
  methods: {
    save() {
      this.formClean = false;
      if (this.$refs.form.validate()) {
        this.$store.dispatch('project/addAccountCategory', {
          name: this.category.name,
          type: this.category.type
        });
        this.goToAccounts();
      }
    },
    goToAccounts() {
      this.$router.push({
        name: 'accounts'
      });
    }
  }
};
</script>

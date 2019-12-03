<template>
  <div v-hotkey.close="goToAccounts">
    <VCard>
      <VCardTitle>
        <div class="title">
          {{ category.id ? 'Edit' : 'Add' }} Account Category
        </div>
      </VCardTitle>
      <VForm ref="form" v-model="valid" lazy-validation @submit.prevent="save">
        <VCardText>
          <VTextField
            v-model="category.name"
            label="Name"
            :rules="nameRules"
            class="required"
          />
          <VSelect
            :items="types"
            v-model="category.type"
            label="Type"
            :rules="typeRules"
            class="required"
          />
        </VCardText>
        <VCardActions>
          <VBtn type="submit" color="primary" text>OK</VBtn>
        </VCardActions>
      </VForm>
    </VCard>
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
        {
          text: 'Asset',
          value: 'asset'
        },
        {
          text: 'Budget',
          value: 'budget'
        }
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

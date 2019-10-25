<template>
  <VCard>
    <VCardTitle class="headline">Import transactions</VCardTitle>
    <VCardText>
      <VDataTable :items="importedTransactions" :headers="headers">
        <template slot-scope="props" slot="item">
          <tr>
            <td><VTextField v-model="props.item.date" /></td>
            <td><VTextField v-model="props.item.description" /></td>
            <td>
              <VTextField
                v-model="props.item.value"
                :prefix="$currencyPrefix"
              />
            </td>
          </tr>
        </template>
      </VDataTable>
    </VCardText>
  </VCard>
</template>

<script>
import Vue from 'vue';

export default {
  data() {
    return {
      headers: [
        {
          text: 'Date',
          value: 'date'
        },
        {
          text: 'Description',
          value: 'description'
        },
        {
          text: 'Value',
          value: 'value'
        }
      ]
    };
  },
  computed: {
    importedTransactions() {
      const dateFilter = Vue.filter('date');
      return this.$store.state.importedTransactions.map(item => ({
        date: dateFilter(item.date),
        description: item.description,
        value: item.value.toFixed(2)
      }));
    }
  }
};
</script>

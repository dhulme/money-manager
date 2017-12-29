<template>
  <v-data-table
    :headers="headers"
    :items="transactions"
    :search="search"
    :rows-per-page-items="rowsPerPageItems"
  >
    <template slot="items" slot-scope="props">
      <td>{{ accountName(props.item.from) }}</td>
      <td>{{ accountName(props.item.to) }}</td>
      <td>{{ props.item.note }}</td>
      <td class="text-xs-right">
        <v-menu
          :min-width="300"
          left
        >
          <span slot="activator" @click="$refs.itemValue.focus()">{{ props.item.value | currency }}</span>
          <v-card>
            <v-card-text>
              <v-text-field
                v-model="props.item.value"
                ref="itemValue"
              />
            </v-card-text>
          </v-card>
        </v-menu>
      </td>
    </template>
  </v-data-table>
</template>

<script>
  export default {
    props: {
      transactions: Array,
      search: String
    },
    data() {
      return {
        headers: [{
          text: 'From',
          value: 'from',
          align: 'left'
        }, {
          text: 'To',
          value: 'to',
          align: 'left'
        }, {
          text: 'Note',
          value: 'note',
          align: 'left'
        }, {
          text: 'Amount',
          value: 'amount',
        }],
        rowsPerPageItems: [10, 20, 50]
      };
    },
    methods: {
      accountName(accountId) {
        return this.$project.account(accountId).name;
      },
    }
  };
</script>

<style lang="scss">

</style>
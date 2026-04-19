<template>
  <v-dialog v-model="dialogVisible" max-width="700" persistent no-click-animation v-hotkey.close="close">
    <v-card>
      <v-card-title>Balance Budget</v-card-title>
      <v-card-text>
        <p class="mb-4">
          Current budget difference:
          <strong :class="{ 'text-red': isNegative }">{{ $currency(summaryBalance) }}</strong>
        </p>
        <v-table density="compact" style="table-layout: fixed; width: 100%">
          <thead>
            <tr>
              <th style="width: 35%">Account</th>
              <th style="width: 35%">Description</th>
              <th style="width: 20%">Amount</th>
              <th style="width: 50px" />
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="index">
              <td>
                <v-autocomplete
                  v-model="row.accountId"
                  :items="accountItems"
                  hide-details
                  density="compact"
                  auto-select-first
                  variant="underlined"
                />
              </td>
              <td>
                <v-text-field
                  v-model="row.description"
                  hide-details
                  density="compact"
                  variant="underlined"
                />
              </td>
              <td>
                <v-text-field
                  v-model="row.value"
                  :prefix="$currencyPrefix"
                  hide-details
                  density="compact"
                  variant="underlined"
                />
              </td>
              <td class="pa-0 pt-2">
                <v-btn icon size="small" @click="removeRow(index)" variant="flat">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" class="pt-2">
                <v-btn variant="text" size="small" @click="addRow">Add row</v-btn>
              </td>
            </tr>
            <tr>
              <td />
              <td class="font-weight-bold text-right">New balance:</td>
              <td class="font-weight-bold" :class="{ 'text-red': newBalance < 0 }">
                {{ $currency(newBalance) }}
              </td>
              <td />
            </tr>
          </tfoot>
        </v-table>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="primary" @click="submit" :disabled="!rows.length">OK</v-btn>
        <v-btn variant="text" @click="close">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import Big from 'big.js';
import { getId } from '../../util';

export default {
  props: {
    modelValue: Boolean,
  },
  emits: ['update:modelValue'],
  data() {
    return {
      rows: [],
    };
  },
  computed: {
    dialogVisible: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      },
    },
    summaryBalance() {
      return this.$store.getters['project/summaryBalance'];
    },
    isNegative() {
      return parseFloat(this.summaryBalance) < 0;
    },
    accountItems() {
      return this.$store.getters['project/accountItems'];
    },
    transactionsTotal() {
      return this.rows.reduce((total, row) => {
        const val = parseFloat(row.value) || 0;
        return total.plus(val);
      }, new Big(0));
    },
    newBalance() {
      const balance = new Big(this.summaryBalance);
      return this.isNegative
        ? Number(balance.plus(this.transactionsTotal))
        : Number(balance.minus(this.transactionsTotal));
    },
  },
  watch: {
    modelValue(value) {
      if (value) {
        this.rows = [];
        this.addRow();
      }
    },
  },
  methods: {
    addRow() {
      this.rows.push({ accountId: null, description: '', value: '' });
    },
    removeRow(index) {
      this.rows.splice(index, 1);
    },
    submit() {
      const transactions = this.rows
        .filter((row) => row.accountId && parseFloat(row.value))
        .map((row) => {
          const id = getId();
          const transaction = {
            id,
            description: row.description || 'Balance adjustment',
            note: '',
            date: new Date().toISOString(),
            value: row.value,
            giftAided: false,
          };

          if (this.isNegative) {
            return { ...transaction, from: row.accountId, to: 'none' };
          } else {
            return { ...transaction, from: 'none', to: row.accountId };
          }
        });

      transactions.forEach((transaction) => {
        this.$store.dispatch('project/addTransaction', transaction);
      });

      this.$store.dispatch(
        'openSnackbar',
        `${transactions.length} balancing transaction${transactions.length === 1 ? '' : 's'} added`
      );
      this.dialogVisible = false;
    },
    close() {
      this.dialogVisible = false;
    },
  },
};
</script>

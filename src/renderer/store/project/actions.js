import { requireObjectProperties, getFriendlyId } from '../../util';

function getAddTransactionParams(transaction) {
  requireObjectProperties(transaction, ['value', 'to', 'from']);
  return {
    transaction: {
      ...transaction,
      highlighted: false
    },
    value: transaction.value,
    toAccountId: transaction.to,
    fromAccountId: transaction.from
  };
}

export default {
  addTransaction({ commit }, transaction) {
    commit('addTransaction', getAddTransactionParams(transaction));
    commit('updateSummaryBalance');
  },

  addDualTransaction({ commit }, { primary, secondary }) {
    commit('addTransaction', getAddTransactionParams(primary));
    if (secondary) {
      commit('addTransaction', getAddTransactionParams(secondary));
    }
    commit('updateSummaryBalance');
  },

  addDualTransactions({ commit }, transactions) {
    transactions.forEach(({ primary, secondary } = {}) => {
      if (primary) {
        commit('addTransaction', getAddTransactionParams(primary));
      }
      if (secondary) {
        commit('addTransaction', getAddTransactionParams(secondary));
      }
    });
    commit('updateSummaryBalance');
  },

  updateTransaction({ commit }, transaction) {
    commit('updateTransaction', transaction);
  },

  updateDualTransaction({ commit }, { primary, secondary }) {
    commit('updateTransaction', primary);
    commit('updateTransaction', secondary);
  },

  deleteAccount({ commit }, accountId) {
    commit('deleteAccount', accountId);
    commit('updateSummaryBalance');
  },

  runBulkTransactionTransactions(
    { commit },
    { bulkTransaction, transactions }
  ) {
    transactions.forEach(transaction => {
      commit(
        'addTransaction',
        getAddTransactionParams({
          ...transaction,
          description: `Bulk Transaction (${bulkTransaction.name})`,
          note: transaction.note
        })
      );
    });
  },

  updateBulkTransactionTransaction(
    { commit },
    { bulkTransaction, transaction }
  ) {
    commit('addUpdateBulkTransactionTransaction', {
      bulkTransaction,
      transaction
    });
  },

  deleteBulkTransactionTransaction(
    { commit },
    { bulkTransaction, transaction }
  ) {
    commit('deleteBulkTransactionTransaction', {
      bulkTransaction,
      transaction
    });
  },

  addBulkTransactionTransaction({ commit }, { bulkTransaction, transaction }) {
    commit('addUpdateBulkTransactionTransaction', {
      bulkTransaction,
      transaction
    });
  },

  addBulkTransaction(
    { commit, state, getters },
    { description, name, transactions }
  ) {
    const existingIds = state.bulkTransactions.map(_ => _.id);
    const id = getFriendlyId(name, existingIds);
    commit('addBulkTransaction', {
      description,
      name,
      id
    });
    const bulkTransaction = getters.bulkTransaction(id);
    transactions.forEach(transaction =>
      commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction
      })
    );
  },

  addAccount(
    { commit },
    { name, balance, type, category, importTransactionsFormatId }
  ) {
    commit('addAccount', {
      name,
      balance,
      type,
      category,
      importTransactionsFormatId
    });
  },

  editAccount({ commit }, { id, name, importTransactionsFormatId }) {
    commit('editAccount', { id, name, importTransactionsFormatId });
  }
};
import { requireObjectProperties, getFriendlyId } from '../../util';

function getAddTransactionParams(transaction) {
  requireObjectProperties(transaction, ['value', 'to', 'from']);
  return {
    transaction: {
      ...transaction,
      highlighted: false,
    },
    value: transaction.value,
    toAccountId: transaction.to,
    fromAccountId: transaction.from,
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
    commit('updateSummaryBalance');
  },

  updateDualTransaction({ commit }, { primary, secondary }) {
    commit('updateTransaction', primary);
    commit('updateTransaction', secondary);
    commit('updateSummaryBalance');
  },

  deleteAccount({ commit }, accountId) {
    commit('setAccountDeleted', { accountId, deleted: true });
    commit('updateSummaryBalance');
  },

  restoreDeletedAccount({ commit }, accountId) {
    commit('setAccountDeleted', { accountId, deleted: false });
    commit('updateSummaryBalance');
  },

  runBulkTransactionTransactions(
    { commit },
    { bulkTransaction, transactions }
  ) {
    transactions.forEach((transaction) => {
      commit(
        'addTransaction',
        getAddTransactionParams({
          ...transaction,
          description: `Bulk Transaction (${bulkTransaction.name})`,
          note: transaction.note,
        })
      );
    });
  },

  deleteBulkTransactionTransaction(
    { commit },
    { bulkTransaction, transaction }
  ) {
    commit('deleteBulkTransactionTransaction', {
      bulkTransaction,
      transaction,
    });
  },

  addBulkTransaction(
    { commit, state, getters },
    { description, name, transactions }
  ) {
    const id = getFriendlyId(name);
    commit('addBulkTransaction', {
      description,
      name,
      id,
    });
    const bulkTransaction = getters.bulkTransaction(id);
    transactions.forEach((transaction) =>
      commit('addUpdateBulkTransactionTransaction', {
        bulkTransaction,
        transaction,
      })
    );
  },

  updateBulkTransaction(
    { commit, getters },
    { id, description, name, transactions }
  ) {
    commit('updateBulkTransaction', {
      id,
      description,
      name,
      ...(transactions && { transactionIds: [] }),
    });
    if (transactions) {
      const bulkTransaction = getters.bulkTransaction(id);
      transactions.forEach((transaction) =>
        commit('addUpdateBulkTransactionTransaction', {
          bulkTransaction,
          transaction,
        })
      );
    }
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
      importTransactionsFormatId,
    });
  },

  editAccount({ commit }, { id, name, importTransactionsFormatId }) {
    commit('editAccount', { id, name, importTransactionsFormatId });
  },

  addAccountCategory({ commit }, { name, type }) {
    commit('addAccountCategory', { name, type });
  },
};

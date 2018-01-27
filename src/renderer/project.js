import example from '../example.json';

const remote = window.require ? window.require('electron').remote.require('./project') : {
  load(done) {
    done(null, JSON.stringify(example));
  },
  save(projectString, done) {
    done(null);
  },
};

const project = {
  load() {
    return new Promise((resolve, reject) => {
      remote.load((err, loadedData) => {
        if (err) {
          reject(err);
        } else {
          const data = JSON.parse(loadedData);
          resolve(data);
        }
      });
    });
  },

  save(data) {
    return new Promise((resolve, reject) => {
      remote.save(JSON.stringify(data), (err) => {
        if (!err) {
          resolve();
        } else {
          reject(err);
        }
      });
    });
  },
  

  
  

  addBulkTransactionTransaction(bulkTransaction, {
    to,
    from,
    value
  }) {
    const transaction = {
      to,
      from,
      value
    };
    const transactionId = util.getId();
    data.bulkTransactionTransactions[transactionId] = transaction;
    bulkTransaction.transactionIds.push(transactionId);
  },

  addBulkTransactionTransactions(bulkTransaction, transactions) {
    transactions.forEach(_ => project.addBulkTransactionTransaction(bulkTransaction, _));
  },

  

  addAccount({
    name,
    balance,
    type,
  }) {
    const existingIds = data.accounts.map(account => account.id);
    const newAccount = {
      transactionIds: [],
      id: util.getFriendlyId(name, existingIds),
      balance,
      type,
      name,
    };
    data.accounts.push(newAccount);

    return newAccount;
  },

  
  bulkTransactions() {
    return data.bulkTransactions;
  },

  bulkTransactionTransactions(bulkTransaction) {
    return bulkTransaction.transactionIds.map(id => data.bulkTransactionTransactions[id]);
  },

  addBulkTransaction({
    description,
    name
  }) {
    const existingIds = project.bulkTransactions().map(_ => _.id);
    const bulkTransaction = {
      name,
      description,
      id: util.getFriendlyId(name, existingIds),
      transactionIds: []
    };
    data.bulkTransactions.push(bulkTransaction);

    return bulkTransaction;
  },

  updateBulkTransactionTransaction(bulkTransaction, transaction) {
    // const bulkTransaction.transactions.find(_ => _.id === transaction.id);
    
  },

  bulkTransaction(id) {
    return project.bulkTransactions().find(bulkTransaction => bulkTransaction.id === id);
  },

  runBulkTransactionTransactions(bulkTransaction, transactions) {
    transactions.forEach(_ => project.runBulkTransactionTransaction(bulkTransaction, _));
  },

  runBulkTransactionTransaction(bulkTransaction, transaction) {
    project.addTransaction({
      ...transaction,
      description: bulkTransaction.description,
      note: 'Bulk Transaction',
    });
  },
};

window.project = project;

export default project;

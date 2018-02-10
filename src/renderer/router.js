import Vue from 'vue';
import Router from 'vue-router';
import Accounts from '@/components/pages/Accounts';
import Account from '@/components/pages/Account';
import NewAccount from '@/components/pages/NewAccount';
import NewBulkTransaction from '@/components/pages/NewBulkTransaction';
import BulkTransactions from '@/components/pages/BulkTransactions';
import BulkTransaction from '@/components/pages/BulkTransaction';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'accounts',
      component: Accounts,
    }, {
      path: '/bulk-transactions/new',
      name: 'newBulkTransaction',
      component: NewBulkTransaction,
    }, {
      path: '/bulk-transactions',
      name: 'bulkTransactions',
      component: BulkTransactions,
    }, {
      path: '/bulk-transactions/:bulkTransactionId',
      name: 'bulkTransaction',
      component: BulkTransaction,
    }, {
      path: '/:accountType/:accountCategory/new',
      name: 'newAccount',
      component: NewAccount,
    }, {
      path: '/:accountType/:accountCategory/:accountId',
      name: 'account',
      component: Account,
    },
  ],
});

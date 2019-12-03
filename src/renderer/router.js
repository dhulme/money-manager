import Vue from 'vue';
import Router from 'vue-router';
import Accounts from '@/components/pages/Accounts';
import Account from '@/components/pages/Account';
import EditAccount from '@/components/pages/EditAccount';
import NewBulkTransaction from '@/components/pages/NewBulkTransaction';
import BulkTransactions from '@/components/pages/BulkTransactions';
import BulkTransaction from '@/components/pages/BulkTransaction';
import Insights from '@/components/pages/Insights';
import EditAccountCategory from '@/components/pages/EditAccountCategory';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'accounts',
      component: Accounts
    },
    {
      path: '/bulk-transactions/new',
      name: 'newBulkTransaction',
      component: NewBulkTransaction
    },
    {
      path: '/bulk-transactions',
      name: 'bulkTransactions',
      component: BulkTransactions
    },
    {
      path: '/bulk-transactions/:bulkTransactionId',
      name: 'bulkTransaction',
      component: BulkTransaction
    },
    {
      path: '/newAccountCategory',
      name: 'newAccountCategory',
      component: EditAccountCategory
    },
    {
      path: '/:accountType/:accountCategory/new',
      name: 'newAccount',
      component: EditAccount
    },
    {
      path: '/:accountType/:accountCategory/:accountId',
      name: 'account',
      component: Account
    },
    {
      path: '/:accountType/:accountCategory/:accountId/edit',
      name: 'editAccount',
      component: EditAccount
    },
    {
      path: '/insights',
      name: 'insights',
      component: Insights
    }
  ]
});

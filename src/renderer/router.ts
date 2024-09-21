import { createMemoryHistory, createRouter } from 'vue-router';
import Accounts from './components/pages/Accounts.vue';
import Account from './components/pages/Account.vue';
import EditAccount from './components/pages/EditAccount.vue';
import NewBulkTransaction from './components/pages/NewBulkTransaction.vue';
import BulkTransactions from './components/pages/BulkTransactions.vue';
import BulkTransaction from './components/pages/BulkTransaction.vue';
import Insights from './components/pages/Insights.vue';
import EditAccountCategory from './components/pages/EditAccountCategory.vue';
import Reports from './components/pages/Reports.vue';
import Report from './components/pages/Report.vue';

export default createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'accounts',
      component: Accounts,
    },
    {
      path: '/bulk-transactions/new',
      name: 'newBulkTransaction',
      component: NewBulkTransaction,
    },
    {
      path: '/bulk-transactions',
      name: 'bulkTransactions',
      component: BulkTransactions,
    },
    {
      path: '/bulk-transactions/:bulkTransactionId',
      name: 'bulkTransaction',
      component: BulkTransaction,
    },
    {
      path: '/newAccountCategory',
      name: 'newAccountCategory',
      component: EditAccountCategory,
    },
    {
      path: '/:accountType/:accountCategory/new',
      name: 'newAccount',
      component: EditAccount,
    },
    {
      path: '/:accountType/:accountCategory/:accountId',
      name: 'account',
      component: Account,
    },
    {
      path: '/:accountType/:accountCategory/:accountId/edit',
      name: 'editAccount',
      component: EditAccount,
    },
    {
      path: '/insights/:accountId',
      name: 'insights',
      component: Insights,
    },
    {
      path: '/reports',
      name: 'reports',
      component: Reports,
    },
    {
      path: '/reports/:reportId',
      name: 'report',
      component: Report,
    },
  ],
});

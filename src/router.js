import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '@/components/pages/Dashboard';
import Account from '@/components/pages/Account';
import NewAccount from '@/components/pages/NewAccount';
import NewBulkTransaction from '@/components/pages/NewBulkTransaction';
import BulkTransactions from '@/components/pages/BulkTransactions';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    }, {
      path: '/bulk-transactions/new',
      name: 'newBulkTransaction',
      component: NewBulkTransaction,
    }, {
      path: '/:accountType/new',
      name: 'newAccount',
      component: NewAccount,
    }, {
      path: '/:accountType/:accountId',
      name: 'account',
      component: Account,
    }, {
      path: '/bulk-transactions',
      name: 'bulkTransactions',
      component: BulkTransactions,
    }, 
  ],
});

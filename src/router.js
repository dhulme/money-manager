import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '@/components/pages/Dashboard';
import Account from '@/components/pages/Account';
import NewAccount from '@/components/pages/NewAccount';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    }, {
      path: '/:accountType/new',
      name: 'newAccount',
      component: NewAccount,
    }, {
      path: '/:accountType/:accountId',
      name: 'account',
      component: Account,
    },
  ],
});

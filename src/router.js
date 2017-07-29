import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '@/components/pages/Dashboard';
import Account from '@/components/pages/Account';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    }, {
      path: '/budget/:accountId',
      name: 'budget',
      component: Account,
    }, {
      path: '/asset/:accountId',
      name: 'asset',
      component: Account,
    },
  ],
});

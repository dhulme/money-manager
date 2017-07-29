import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '@/components/pages/Dashboard';
import Budget from '@/components/pages/Budget';
import Asset from '@/components/pages/Asset';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
    }, {
      path: '/budget/:budgetId',
      name: 'budget',
      component: Budget,
    }, {
      path: '/asset/:assetId',
      name: 'asset',
      component: Asset,
    },
  ],
});

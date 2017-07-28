import Vue from 'vue';
import Router from 'vue-router';
import Dashboard from '@/components/pages/Dashboard';
import Budget from '@/components/pages/Budget';

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
      component: Budget
    }
  ],
});

// import Vue from 'vue';
// // import HelloWorld from '../../../src/renderer/components/HelloWorld';

// describe('HelloWorld.vue', () => {
//   it('should render correct contents', () => {
//     const Constructor = Vue.extend(HelloWorld);
//     const vm = new Constructor().$mount();
//     expect(vm.$el.querySelector('.hello h1').textContent)
//       .toEqual('Welcome to Your Vue.js App');
//   });
// });

import store from '@/store';

describe('store', () => {
  describe('project', () => {
    const projectState = store.state.project;

    it('should initialize correctly', () => {
      expect(projectState.summary.balance).toEqual(0);
    });
  });
});

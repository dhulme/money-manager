// import Vue from 'vue';
// // import HelloWorld from '../../../src/renderer/components/HelloWorld';

// describe('HelloWorld.vue', () => {
//   it('should render correct contents', () => {
//     const Constructor = Vue.extend(HelloWorld);
//     const vm = new Constructor().$mount();
//     expect(vm.$el.querySelector('.hello h1').textContent)
//       .toBe('Welcome to Your Vue.js App');
//   });
// });

import store from "@/store";

describe("project store", () => {
  const state = store.state.project;

  function commit(name, data) {
    store.commit(`project/${name}`, data);
  }

  it("should initialize correctly", () => {
    expect(state.summary.balance).toBe(0);
    expect(state.accounts).toHaveLength(0);
    expect(state.transactions).toEqual({});
    expect(state.bulkTransactions).toHaveLength(0);
    expect(state.bulkTransactionTransactions).toEqual({});
  });

  describe("mutations", () => {
    describe("init", () => {
      it("should set state properties", () => {
        const test = "test";
        commit("init", {
          accounts: test,
          transactions: test,
          summary: test,
          bulkTransactions: test,
          bulkTransactionTransactions: test
        });
        expect(state.accounts).toBe(test);
        expect(state.transactions).toBe(test);
        expect(state.summary).toBe(test);
        expect(state.bulkTransactions).toBe(test);
        expect(state.bulkTransactionTransactions).toBe(test);
      });

      it("should not allow other properties to be set", () => {
        commit("init", {
          test: "test"
        });
        expect(state.test).toBeUndefined();
      });

      it("should clone the data", () => {
        const accountsData = [];
        commit("init", {
          accounts: accountsData
        });
        expect(state.accounts).not.toBe(accountsData);
        expect(state.accounts).toEqual([]);
      });
    });

    describe("addTransaction", () => {
      it("should require all parameters", () => {
        expect(() => {
          commit("addTransaction", {});
        }).toThrowError("required");
      });

      it("should add the transaction to store", () => {
        commit("init", {
          transactions: {}
        });
      });
    });
  });
});

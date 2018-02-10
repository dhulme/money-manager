import project from './project';

const history = {
  install(Vue, store) {
    const done = [];
    let undone = [];
    let newMutation = true;

    store.subscribe((mutation) => {
      if (mutation.type !== 'init') {
        done.push(mutation);
      }
      if (newMutation) {
        undone = [];
      }
    });
    
    Vue.history = {
      async init() {
        const data = await project.load();
        store.commit('init', data);
      },
    };

    Vue.prototype.$history = {
      async undo() {
        undone.push(done.pop());
        newMutation = false;
        await Vue.history.init();
        done.forEach((mutation) => {
          store.commit(mutation.type, mutation.payload);
          done.pop();
        });
        newMutation = true;
      },
      redo() {
        const commit = undone.pop();
        newMutation = false;
        store.commit(commit.type, commit.payload);
        newMutation = true;
      },
      async save() {
        
      }
    };
  },
};

export default history;

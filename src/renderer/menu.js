const remote = window.require ? window.require('electron').remote : null;

export default {
  init({
    saveClick,
    accountsClick,
    bulkTransactionsClick,
    undoClick,
    redoClick,
  }) {
    if (!remote) {
      return;
    }

    const menu = remote.Menu.buildFromTemplate([
      {
        label: 'File',
        submenu: [
          {
            label: 'Save',
            click: saveClick,
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          {
            label: 'Undo',
            click: undoClick,
          },
          {
            label: 'Redo',
            click: redoClick,
          },
        ],
      },
      {
        label: 'View',
        submenu: [
          {
            label: 'Accounts',
            click: accountsClick,
          },
          {
            label: 'Bulk transactions',
            click: bulkTransactionsClick,
          },
        ],
      },
      {
        label: 'Development',
        submenu: [
          {
            label: 'Toggle dev tools',
            role: 'toggledevtools'
          },
        ],
      },
    ]);
    remote.Menu.setApplicationMenu(menu);
  },
};

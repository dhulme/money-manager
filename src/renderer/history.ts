import { unparse } from 'papaparse';
import { format } from 'date-fns';
import type { App } from 'vue';
import type { Router } from 'vue-router';

import ipc from './ipc';
import { setSaveEnabled, setUndoLabel, setRedoLabel } from './menu';
import { useProjectStore } from './store/project';
import type { ProjectData, Account, Transaction } from '../types/project';

type ActionName = keyof typeof actionNames;

interface HistoryEntry {
  name: ActionName;
  args: unknown;
}

const actionNames: Record<string, string> = {
  addTransaction: 'Add transaction',
  addDualTransaction: 'Add transaction',
  addDualTransactions: 'Add transactions',
  updateTransaction: 'Update transaction',
  updateDualTransaction: 'Update transaction',
  deleteAccount: 'Delete account',
  runBulkTransactionTransactions: 'Run bulk transactions',
  deleteBulkTransactionTransaction: 'Delete bulk transaction',
  addBulkTransaction: 'Add bulk transaction',
  deleteBulkTransaction: 'Delete bulk transaction',
  addAccount: 'Add account',
  editAccount: 'Edit account',
  addAccountCategory: 'Add account category',
  updateBulkTransaction: 'Apply bulk transaction changes',
};

function setEdited(edited: boolean) {
  ipc.setEdited(edited);
  setSaveEnabled(edited);
}

const history = {
  install(app: App, { router, ready }: { router: Router; ready: () => void }) {
    const done: HistoryEntry[] = [];
    let undone: HistoryEntry[] = [];
    let newAction = true;
    let initData: ProjectData | undefined;
    let savedDoneLength = 0;
    let projectStore: ReturnType<typeof useProjectStore> | undefined;

    // We defer getting the store until after Pinia is installed
    function getProjectStore() {
      if (!projectStore) projectStore = useProjectStore();
      return projectStore;
    }

    // Subscribe to Pinia actions on the project store
    // We need to wait until Pinia is ready before subscribing
    let unsubscribe: (() => void) | undefined;
    const setupSubscription = () => {
      if (unsubscribe) return;
      const store = getProjectStore();
      unsubscribe = store.$onAction(({ name, args, after }: { name: string; args: unknown[]; after: (cb: () => void) => void }) => {
        // Skip internal/private actions
        if (name.startsWith('_') || name === 'init' || name === 'updateSummaryBalance') return;
        if (!actionNames[name]) return;

        after(() => {
          done.push({ name: name as ActionName, args: args[0] });
          setEdited(true);
          setUndoLabel(actionNames[name]);
          if (newAction) {
            setRedoLabel();
            undone = [];
          }
        });
      });
    };

    ipc.on('projectOpened', (data: unknown) => {
      const callReady = !initData;
      initData = data as ProjectData;
      setupSubscription();
      getProjectStore().init(initData!);
      setEdited(false);
      if (callReady) {
        ready();
      } else {
        router.push({ name: 'accounts' });
      }
    });
    ipc.openDefaultProject();

    let canClose = false;
    window.addEventListener('beforeunload', (e) => {
      if (
        !canClose &&
        done.length !== savedDoneLength
      ) {
        const store = getProjectStore();
        ipc.showCloseWarning({
          accountCategories: store.accountCategories,
          accounts: store.accounts,
          transactions: store.transactions,
          summary: store.summary,
          bulkTransactions: store.bulkTransactions,
          bulkTransactionTransactions: store.bulkTransactionTransactions,
        });
        e.returnValue = false;
      }
    });

    ipc.on('closeConfirmed', () => {
      canClose = true;
      window.close();
    });

    app.config.globalProperties.$history = {
      undo() {
        if (done.length === 0) return;

        const toUndo = done.pop()!;
        undone.push(toUndo);
        setRedoLabel(actionNames[toUndo.name]);

        const store = getProjectStore();
        newAction = false;
        store.init(initData!);
        const actionsToReplay = [...done];
        // Clear done because replaying will re-add them via the subscription
        done.length = 0;
        actionsToReplay.forEach((action) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (store as any)[action.name](action.args);
        });
        store.updateSummaryBalance();
        newAction = true;

        if (done.length === 0) {
          setUndoLabel();
        }

        if (done.length === savedDoneLength) {
          setUndoLabel();
        }
        setEdited(done.length !== savedDoneLength);
      },
      redo() {
        if (undone.length === 0) return;

        const action = undone.pop()!;
        newAction = false;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (getProjectStore() as any)[action.name](action.args);
        newAction = true;

        if (undone.length === 0) {
          setRedoLabel();
        }

        if (done.length === savedDoneLength) {
          setRedoLabel();
        }
        setEdited(done.length !== savedDoneLength);
      },
      save() {
        const store = getProjectStore();
        savedDoneLength = done.length;
        ipc.saveProject({
          accountCategories: store.accountCategories,
          accounts: store.accounts,
          transactions: store.transactions,
          summary: store.summary,
          bulkTransactions: store.bulkTransactions,
          bulkTransactionTransactions: store.bulkTransactionTransactions,
        });
        setEdited(false);
      },
      open() {
        ipc.openProject();
      },
      saveAs() {
        const store = getProjectStore();
        savedDoneLength = done.length;
        ipc.saveProjectAs({
          accountCategories: store.accountCategories,
          accounts: store.accounts,
          transactions: store.transactions,
          summary: store.summary,
          bulkTransactions: store.bulkTransactions,
          bulkTransactionTransactions: store.bulkTransactionTransactions,
        });
        setEdited(false);
      },
      new() {
        ipc.newProject();
      },
      exportSummary() {
        const store = getProjectStore();
        const summary = store.accounts.map((account) => ({
          Name: account.name,
          Category: account.category,
          Type: account.type,
          Balance: Number(account.balance),
        }));
        ipc.exportCsv('summary', unparse(summary));
      },
      exportTransactions() {
        const store = getProjectStore();
        const accountNamesById = store.accounts.reduce<Record<string, string>>(
          (acc, account) => ({
            ...acc,
            [account.id]: account.name,
          }),
          {}
        );
        const transactions = (Object.values(store.transactions) as Transaction[])
          .sort((a, b) => {
            const aDateValue = new Date(a.date).valueOf();
            const bDateValue = new Date(b.date).valueOf();
            return aDateValue - bDateValue;
          })
          .map((transaction) => ({
            Date: format(new Date(transaction.date), 'yyyy-MM-dd'),
            From: accountNamesById[transaction.from],
            To: accountNamesById[transaction.to],
            Description: transaction.description,
            Note: transaction.note,
            Value: Number(transaction.value),
          }));
        ipc.exportCsv('transactions', unparse(transactions));
      },
    };
  },
};

export default history;

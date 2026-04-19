export interface Settings {
  projectPath: string | null;
  lastBackupDates: Record<string, string>;
  currencyPrefix: string;
  dateFormat: string;
  importTransactionsDescriptionsGiftAided: string[];
}

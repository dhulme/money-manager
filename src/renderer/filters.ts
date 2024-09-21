import { format } from 'date-fns';
import { Plugin } from 'vue';

const filters: Plugin = {
  install(
    app,
    {
      currencyPrefix,
      dateFormat,
    }: { currencyPrefix: string; dateFormat: string },
  ) {
    const numberFormat = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    });

    app.config.globalProperties.$currencyPrefix = currencyPrefix;
    app.config.globalProperties.$dateFormat = dateFormat;
    app.config.globalProperties.$filters = {
      currency(value: number | undefined | null) {
        if (value === undefined || value === null) {
          return '';
        }
        if (value === 0 && Object.is(value, -0)) {
          value = 0;
        }
        const formatted = numberFormat.format(value);

        return currencyPrefix === '£'
          ? formatted
          : formatted.replace('£', currencyPrefix);
      },
      date(value: string) {
        return value ? format(new Date(value), dateFormat) : '';
      },
    };
  },
};

export default filters;

import cryptoRandomString from 'crypto-random-string';

// The first call to this is slow for some reason,
// so we do this upfront so first UI operation isn't slow.
getId();

export function getFriendlyId(name: string) {
  return name.toLowerCase().replace(/[ ]/g, '-') + '-' + getId(5);
}

export function getId(length = 10) {
  return cryptoRandomString({ length });
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function validateInputValue(value: string) {
  if (Number.isNaN(Number(value))) {
    return 'Amount must be a number';
  }
  const dp = value.split('.')[1];
  if (dp && dp.length > 2) {
    return 'Amount must have no more than 2 decimal places';
  }
  return true;
}

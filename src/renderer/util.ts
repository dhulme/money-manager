// The first call to this is slow for some reason,
// so we do this upfront so first UI operation isn't slow.
getId();

export function required(param: string): never {
  throw new Error(`${param} is required`);
}

export function requireObjectProperties(object: Record<string, unknown>, params: string[]): void {
  const errors = params.reduce<string[]>((acc, param) => {
    if (object[param] === undefined) {
      return [...acc, param];
    }
    return acc;
  }, []);
  if (errors.length) {
    required(errors.join(','));
  }
}

export function getFriendlyId(name: string): string {
  return name.toLowerCase().replace(/[ ]/g, '-') + '-' + getId(5);
}

export function getId(length = 10): string {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function validateInputValue(value: string): string | true {
  if (Number.isNaN(Number(value))) {
    return 'Amount must be a number';
  }
  const dp = value.split('.')[1];
  if (dp && dp.length > 2) {
    return 'Amount must have no more than 2 decimal places';
  }
  return true;
}

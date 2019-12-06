import { NumberFormatOptions } from './interfaces';

/** FUNCTIONS **/

/**
 * Shortcut function used to format a number as a currency
 */
export function currency(
  code: NumberFormatOptions['currency'],
  display?: NumberFormatOptions['currencyDisplay'],
  options: NumberFormatOptions = {}
): NumberFormatOptions {
  return Object.assign({
    style: 'currency',
    currency: code,
    currencyDisplay: display,
  }, options);
}

/**
 * Shortcut function used to format a number as a percent
 */
export function percent(
  options: NumberFormatOptions = {}
): NumberFormatOptions {
  return Object.assign({
    style: 'percent',
  }, options);
}

import { IsObject } from '../../../../misc/helpers/is/IsObject';
import {
  TStylePropertyChangeMap, TStylePropertyName, TStylePropertyTuple, TStylePropertyValue, TStyleState, TStyleStateMap,
  TStyleStateTuples
} from './types';

/**
 * Converts a generic style state to a proper map
 */
export function NormalizeStyleState(style: TStyleState): TStyleStateMap {
  if (style instanceof Map) {
    return style;
  } else if (Symbol.iterator in style) {
    return new Map(style as TStyleStateTuples);
  } else if (IsObject(style)) {
    return new Map(Object.entries(style) as TStyleStateTuples);
  } else {
    throw new TypeError(`Invalid style's structure`);
  }
}

/**
 * Converts an 'origin' and 'target' (both style states), into a proper <style change map>
 */
export function OriginAndTargetStyleStatesToChangeMap(
  origin: TStyleState,
  target: TStyleState,
): TStylePropertyChangeMap {
  const _origin: TStyleStateMap = NormalizeStyleState(origin);
  const _target: TStyleStateMap = NormalizeStyleState(target);

  const map: TStylePropertyChangeMap = new Map<TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]>();

  const originIterator: Iterator<TStylePropertyTuple> = _origin.entries();
  let originIteratorResult: IteratorResult<TStylePropertyTuple>;
  while (!(originIteratorResult = originIterator.next()).done) {
    const [key, value] = originIteratorResult.value;
    const target: TStylePropertyValue = _target.has(key) ? _target.get(key) as TStylePropertyValue : void 0;
    if (value !== target) {
      map.set(key, [value, target]);
    }
  }

  const targetIterator: Iterator<TStylePropertyTuple> = _target.entries();
  let targetIteratorResult: IteratorResult<TStylePropertyTuple>;
  while (!(targetIteratorResult = targetIterator.next()).done) {
    const [key, value] = targetIteratorResult.value;
    if ((value !== void 0) && !map.has(key)) {
      map.set(key, [void 0, value]);
    }
  }

  return map;
}

// /**
//  * Returns true if 'input' is a style property's value which requires to be computed
//  */
// export function IsComputedStylePropertyValue(input: TStylePropertyValue): boolean {
//   return (input === void 0)
//     || (input === null)
//     || (input === 'auto');
// }
//
// /**
//  * Returns true if 'styleChangeMap' doesn't contain any property requiring to be computed
//  */
// export function StylePropertyChangeMapContainsNoComputedProperty(styleChangeMap: TStylePropertyChangeMap): boolean {
//   const iterator: Iterator<[TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]]> = styleChangeMap.entries();
//   let result: IteratorResult<[TStylePropertyName, [TStylePropertyValue, TStylePropertyValue]]>;
//   while (!(result = iterator.next()).done) {
//     if (
//       IsComputedStylePropertyValue(result.value[1][0])
//       || IsComputedStylePropertyValue(result.value[1][1])
//     ) {
//       return false;
//     }
//   }
//   return true;
// }


// export function ResolveComputedStylePropertyValue(
//   element: HTMLElement,
//   propertyName: string,
//   propertyValue: TStylePropertyValue,
// ): string {
//   if (propertyValue === void 0) {
//     return getComputedStyle(element).getPropertyValue(propertyName);
//   } else if (propertyValue === null) {
//     const currentPropertyValue = element.style.getPropertyValue(propertyName);
//     element.style.removeProperty(propertyName);
//     const inferredPropertyValue = getComputedStyle(element).getPropertyValue(propertyName);
//     element.style.setProperty(propertyName, currentPropertyValue);
//     return inferredPropertyValue;
//   } else if (propertyValue === 'auto') {
//     const currentPropertyValue = element.style.getPropertyValue(propertyName);
//     element.style.setProperty(propertyName, 'auto');
//     const inferredPropertyValue = getComputedStyle(element).getPropertyValue(propertyName);
//     element.style.setProperty(propertyName, currentPropertyValue);
//     return inferredPropertyValue;
//   } else {
//     return propertyValue;
//   }
// }
//
//
// export function ApplyTargetComputedStylePropertyValue(
//   element: HTMLElement,
//   propertyName: string,
//   propertyValue: TStylePropertyValue,
//   resolvedPropertyValue: string,
// ): void {
//   if (propertyValue === null) {
//     element.style.removeProperty(propertyName);
//   } else if (propertyValue === 'auto') {
//     element.style.setProperty(propertyName, 'auto');
//   } else {
//     element.style.setProperty(propertyName, resolvedPropertyValue);
//   }
// }

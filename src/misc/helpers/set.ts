// https://github.com/tc39/proposal-set-methods

export function union<T>(...iterables: Iterable<T>[]): Set<T> {
  const newSet: Set<T> = new Set<T>((iterables.length === 0) ? [] : iterables[0]);
  for (let i = 1, l = iterables.length; i < l; i++) {
    if ((Symbol.iterator in iterables[i])) {
      const iterator: Iterator<T> = iterables[i][Symbol.iterator]();
      let result: IteratorResult<T>;
      while (!(result = iterator.next()).done) {
        newSet.add(result.value);
      }
    } else {
      throw new TypeError(`Value at index ${ i } is not an iterable.`);
    }
  }
  return newSet;
}


export function intersection<T>(...iterables: Iterable<T>[]): Set<T> {
  const newSet: Set<T> = new Set<T>((iterables.length === 0) ? [] : iterables[0]);
  for (let i = 1, l = iterables.length; i < l; i++) {
    if ((Symbol.iterator in iterables[i])) {
      const set: Set<T> = new Set<T>(iterables[i]);
      const iterator: Iterator<T> = newSet.values();
      let result: IteratorResult<T>;
      while (!(result = iterator.next()).done) {
        if (!set.has(result.value)) {
          newSet.delete(result.value);
        }
      }
    } else {
      throw new TypeError(`Value at index ${ i } is not an iterable.`);
    }
  }
  return newSet;
}

export function difference<T>(...iterables: Iterable<T>[]): Set<T> {
  const newSet: Set<T> = new Set<T>((iterables.length === 0) ? [] : iterables[0]);
  for (let i = 1, l = iterables.length; i < l; i++) {
    if ((Symbol.iterator in iterables[i])) {
      const iterator: Iterator<T> = iterables[i][Symbol.iterator]();
      let result: IteratorResult<T>;
      while (!(result = iterator.next()).done) {
        if (newSet.has(result.value)) {
          newSet.delete(result.value);
        }
      }
    } else {
      throw new TypeError(`Value at index ${ i } is not an iterable.`);
    }
  }
  return newSet;
}

export function symmetricDifference<T>(...iterables: Iterable<T>[]): Set<T> {
  return this.difference(this.union(...iterables), this.intersection(...iterables));
}


export function isSameSet<T>(set: Set<T>, compareSet: Set<T>): boolean {
  if (set.size === compareSet.size) {
    const iterator: Iterator<T> = set.values();
    let result: IteratorResult<T>;
    while (!(result = iterator.next()).done) {
      if (!compareSet.has(result.value)) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

export function isSubsetOf<T>(set: Set<T>, compareSet: Set<T>): boolean {
  if (set.size <= compareSet.size) {
    const iterator: Iterator<T> = set.values();
    let result: IteratorResult<T>;
    while (!(result = iterator.next()).done) {
      if (!compareSet.has(result.value)) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

export function isSupersetOf<T>(set: Set<T>, compareSet: Set<T>): boolean {
  if (set.size >= compareSet.size) {
    const iterator: Iterator<T> = compareSet.values();
    let result: IteratorResult<T>;
    while (!(result = iterator.next()).done) {
      if (!set.has(result.value)) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

export function isDisjointWith<T>(set: Set<T>, compareSet: Set<T>): boolean {
  const iterator: Iterator<T> = compareSet.values();
  let result: IteratorResult<T>;
  while (!(result = iterator.next()).done) {
    if (set.has(result.value)) {
      return false;
    }
  }
  return true;
}

/*console.log(SetOperations.union(new Set([1, 2, 3]), new Set([4, 5, 6, 1, 2])));
console.log(SetOperations.intersection(new Set([1, 2, 3]), new Set([4, 5, 6, 1, 2])));
console.log(SetOperations.difference(new Set([1, 2, 3]), new Set([4, 5, 6, 1, 2])));
console.log(SetOperations.symmetricDifference(new Set([1, 2, 3]), new Set([4, 5, 6, 1, 2])));
console.log(SetOperations.isSameSet(new Set([1, 2, 3]), new Set([3, 2, 1])));
console.log(SetOperations.isSubsetOf(new Set([1, 2]), new Set([3, 2, 1])));
console.log(SetOperations.isSupersetOf(new Set([1, 2, 3]), new Set([2, 1])));
console.log(SetOperations.isDisjointWith(new Set([1, 2, 3]), new Set([4, 5, 6])));
console.log(SetOperations.isDisjointWith(new Set([1, 2, 3]), new Set([1])));*/

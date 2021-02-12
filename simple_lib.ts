/**
 * Higher-order functions to help with using the simple APIs.
 */
import {comp, pure, read, write} from './simple';
import {IncrList} from './data';
import {Modifiable} from './adaptive';

export function makeIncrList<T>(arr: T[]): IncrList<T> {
  if (arr.length == 0) return comp(pure(null)) as IncrList<T>;
  return comp(
    pure({value: arr[0], tail: makeIncrList(arr.slice(1))})
  ) as IncrList<T>;
}

export function getList<T>(l: IncrList<T>, acc: T[] = []): T[] {
  const pair = l.get();
  if (!pair) return acc;
  acc.push(pair.value);
  return getList(pair.tail, acc);
}

export function append<T>(v: T, l: IncrList<T>): IncrList<T> {
  // TODO: find out why 'as' assert is needed.
  return comp(pure({value: v, tail: l})) as IncrList<T>;
}

export function writeAtIdx<T>(l: IncrList<T>, idx: number, v: T): void {
  const pair = l.get();
  if (!pair) throw new Error('index out of bound.');
  if (idx < 0) throw new Error('index cannot be negative.');
  if (idx === 0) {
    return write(l, {value: v, tail: pair.tail});
  }
  writeAtIdx(pair.tail, idx - 1, v);
}

export function map<T, S>(l: IncrList<T>, f: (x: T) => S): IncrList<S> {
  return comp(
    read(l, pair => {
      if (!pair) return pure(null);
      return pure({value: f(pair.value), tail: map(pair.tail, f)});
    })
  );
}

export function reduce<T, S>(
  l: IncrList<T>,
  f: (acc: S, x: T) => S,
  initial: S
): Modifiable<S> {
  return comp(
    read(l, pair => {
      if (!pair) return pure(initial);
      return read(reduce(pair.tail, f, f(initial, pair.value)));
    })
  );
}

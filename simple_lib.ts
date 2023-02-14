/**
 * Higher-order functions to help with using the simple APIs.
 */
import {Signal, Input} from './simple';

export type IncrList<T> = Input<Pair<T> | null>;

export interface Pair<T> {
  readonly value: T;
  readonly tail: IncrList<T>;
}

export type IncrTree<T> = Input<TreeNode<T> | null>;
interface TreeNode<T> {
  readonly value: T;
  readonly left: IncrTree<T>;
  readonly right: IncrTree<T>;
}


export function makeIncrList<T>(arr: T[]): IncrList<T> {
  if (arr.length == 0) return new Input(null as Pair<T>|null);
  return new Input({value: arr[0], tail: makeIncrList(arr.slice(1))} as Pair<T>|null);
}

export function getList<T>(l: IncrList<T>): T[] {
  let acc: T[] = [];
  let pair = l.value;
  while (pair) {
    acc.push(pair.value);
    pair = pair.tail.value;
  }
  return acc;
}

export function append<T>(v: T, l: IncrList<T>): IncrList<T> {
  // TODO: find out why 'as' assert is needed.
  return new Input({value: v, tail: l} as Pair<T>|null);
}

export function writeAtIdx<T>(l: IncrList<T>, idx: number, v: T): void {
  const pair = l.value;
  if (!pair) throw new Error('index out of bound.');
  if (idx < 0) throw new Error('index cannot be negative.');
  if (idx === 0) {
    l.value = {value: v, tail: pair.tail};
    return;
  }
  writeAtIdx(pair.tail, idx - 1, v);
}

export function map<T, S>(l: IncrList<T>, f: (x: T) => S): IncrList<S> {
  return l.read(pair => {
      if (!pair) return null;
      return {value: f(pair.value), tail: map(pair.tail, f)};
  });
}

export function reduce<T, S>(
  l: IncrList<T>,
  f: (acc: S, x: T) => S,
  initial: S
): Signal<S> {
  return l.read(pair => {
      if (!pair) return initial;
      return reduce(pair.tail, f, f(initial, pair.value));
  });
}

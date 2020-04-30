/**
 * This file provides simpler API to adaptive compitation.
 * 
 * Mostly, using a global Adaptive and four letter words when possible.
 */

import {Adaptive, Changable, Modifiable, constant} from './adaptive';

const GLOBAL_ADAPTIVE = new Adaptive();

/**
 * Comp is short for computation.
 */
export function comp<T>(ch: Changable<T>): Modifiable<T> {
  return GLOBAL_ADAPTIVE.newMod(ch);
}

export function read<T>(m: Modifiable<T>): Changable<T>;
export function read<T, S>(m: Modifiable<T>, ct: (t: T) => Changable<S>): Changable<S>;
export function read<T, S>(m: Modifiable<T>, ct?: (t: T) => Changable<S>): Changable<S> {
  if (!ct) {
    ct = <T>(t: T) => constant(t) as any;
  }
  return GLOBAL_ADAPTIVE.readMod(m, ct);
}

export function pure<T>(x: T): Changable<T> {
  return constant(x);
}

export function write<T>(m: Modifiable<T>, newVal: T) {
  GLOBAL_ADAPTIVE.change(m, newVal);
  GLOBAL_ADAPTIVE.propagate();
}

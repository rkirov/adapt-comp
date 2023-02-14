/**
 * This file provides simpler API to adaptive compitation, that is
 * more similar to the one provided by modern JS Reactive libraries.
 * 
 * There are only two types:
 * - `Signal<T>` - a reactive value of type `T` that can be read 
 *   using the `.value` property to simply get the value or
 *   using the `.read` method to create a new signal.
 * - `Input<T>` - a mutable signal of type `T` that can be written to.
 * 
 * Under the hood those map to the concepts from 
 * adaptive computation by using a global Adaptive an 
 * automatic wrapping of the monadic callback (like `Promise`), to
 * avoid seeing too many pure calls.
 */

import {Adaptive, Modifiable, constant} from './adaptive';

const GLOBAL_ADAPTIVE = new Adaptive();

export class Signal<T> {
  protected constructor(protected m: Modifiable<T>) {}

  // non-reactive read.
  // TODO: maybe should throw if called from within a reactive read callback.
  get value() {
    return this.m.val;
  }

  // reactive read, i.e. producing a new signal
  // only public way to create new signals.
  read<S>(read: (t: T) => S|Signal<S>): Signal<S> {
    let newM = GLOBAL_ADAPTIVE.newMod(
      GLOBAL_ADAPTIVE.readMod(this.m, (t: T) => {
        let s = read(t);
        if (s instanceof Signal) {
          return GLOBAL_ADAPTIVE.modToC(s.m);
        }
        return constant(s);
      }));
    return new Signal(newM);
  }
}

export class Input<T> extends Signal<T> {
  constructor(value: T) {
    super(GLOBAL_ADAPTIVE.newMod(constant(value)));
  }

  set value(newVal: T) {
    GLOBAL_ADAPTIVE.change(this.m, newVal);
    GLOBAL_ADAPTIVE.propagate();
  }

  get value() {
    return this.m.val;
  }
}

// TODO: add batch updates - setting multiple .changes and a single .propagate.
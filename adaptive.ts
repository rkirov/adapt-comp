import {Entry, OrderedList} from './ordered_list';
import {PriorityQueue} from './pq';

export type Time = Entry<null>;


/**
 * Represents a partial computation that is captured in the Changable reader
 * that started and ended at the given times.
 */
export interface Edge {
  reader: Changable<void>, start: Time, end: Time,
}

/**
 * The main class for Adaptive computations. It maintains all data structures
 * that track dependencies.
 */
export class Adaptive {
  ol = new OrderedList<null>();

  pq = new PriorityQueue<Edge>(
      (x: Edge, y: Edge) => this.ol.order(x.start, y.start));
  currentTime = this.ol.base;

  stepTime() {
    const t = this.currentTime;
    const t1 = this.ol.insertEntryAfter(null, t);
    this.currentTime = t1;
    return t1;
  }

  insertPQ(edges: Edge[]) {
    for (const e of edges) {
      this.pq.insert(e);
    }
  }

  newMod<T>(ch: Changable<T>): Modifiable<T> {
    const now = this.stepTime();
    const m = new Modifiable((newVal: T) => {
      // TODO: add pluggable comparison check.
      if (m.get() === newVal) return;
      m.unsafeSet(newVal);
      this.insertPQ(m.edges);
      m.edges = [];
      this.currentTime = now;
    });
    ch((t: T) => m.unsafeSet(t));
    return m;
  }

  change<T>(m: Modifiable<T>, val: T) {
    m.write(val);
  }

  propagate(): void {
    const now = this.currentTime;
    while (this.pq.length() > 0) {
      const e = this.pq.popMin();
      if (this.ol.deleted(e.start)) continue;
      this.ol.spliceOut(e.start, e.end);
      this.currentTime = e.start;
      // Still trying to get my head around this one.
      // I guess empty continuation is ok, because reader
      // has captured the meaningful one.
      e.reader(() => {});
    }
    this.currentTime = now;
  }

  /**
   * Converts a Modifable to a Changable.
   */
  modToC<T>(mod: Modifiable<T>): Changable<T> {
    return this.readMod(mod, (x) => constant(x));
  }

  /**
   * This is "just" bind from the continuation monad with some caching.
   */
  readMod<T, S>(m: Modifiable<T>, ct: (t: T) => Changable<S>): Changable<S> {
    return (ct2: (s: S) => void) => {
      const start = this.stepTime();
      const reader = () => {
        ct(m.get())(ct2);
        m.edges.push({reader, start, end: this.currentTime});
      };
      reader();
    }
  }
}

/**
 * Represents a single modifiable binding.
 */
export class Modifiable<T> {
  /**
   * UnsafeSet will be called before first read, hence using !.
   */
  val!: T;

  constructor(readonly write: (newVal: T) => void) {}
  edges: Edge[] = [];

  /**
   * The only *external* API after an Adaptive computation is done.
   * It should not be used inside Changables (use readMod instead).
   * Outside Changables it should be the only way to read Modifiables.
   */
  get(): T {
    return this.val;
  }

  unsafeSet(newVal: T) {
    this.val = newVal;
  }
}

/**
 * This is type for the "expressions" which produce Modifiables.
 * 
 * Nothing more than the continuation monad, with Result type being void (all
 * side-effects).
 */
type Changable<T> = (ct: ((t: T) => void)) => void;

/**
 * This would be 'return' in haskell parlance, but it looks odd without
 * do-notation in JS, so it is renamed to 'constant'.
 */
export function constant<T>(val: T): Changable<T> {
  return (ct) => ct(val);
}
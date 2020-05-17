/**
 * This implementation combines the OrderedList and the CircularList from
 * the original haskell library.
 */
export interface Entry<T> {
  data: T | null; // only base should have null data
  stamp: number;
  next: Entry<T>;
  prev: Entry<T>;
  deleted: boolean;
}

/**
 * Implementation of the OrderedList interface from Sleator and
 * Dietz paper https://www.cs.cmu.edu/~sleator/papers/maintaining-order.pdf
 */
export class OrderedList<T> {
  M = 1 << 29;

  // 'as any' needed to break cyclic construction,
  // after the constructor the lie disappears.
  base: Entry<T> = {
    data: null,
    stamp: 0,
    next: undefined as any,
    prev: undefined as any,
    deleted: false,
  };

  constructor() {
    // At this point 'base' actually has 'undefined' for prev and next.
    // A bit or manual patching gets it to be trully cyclical.
    this.base.prev = this.base;
    this.base.next = this.base;
  }

  relabel(start: Entry<T>) {
    let j = 0;
    let end = start;
    while (end.stamp - start.stamp <= j * j && end !== this.base) {
      end = end.next;
      j += 1;
    }
    const w = end.stamp - start.stamp;
    let k = 0;
    let cur = start;
    while (k !== j) {
      cur.stamp = Math.floor((w * k) / j) + start.stamp;
      cur = cur.next;
      k += 1;
    }
  }

  insertEntryAfter(data: T, after: Entry<T>) {
    // no spot left, we need to relabel.
    if (after.stamp + 1 === after.next.stamp) {
      this.relabel(after);
    }

    const nextStamp = after.next === this.base ? this.M : after.next.stamp;
    const stamp = Math.floor((after.stamp + nextStamp) / 2);
    const entry = {
      data,
      stamp,
      next: after.next,
      prev: after,
      deleted: false,
    };
    after.next = entry;
    return entry;
  }

  order(x: Entry<T>, y: Entry<T>): -1 | 0 | 1 {
    return x.stamp < y.stamp ? 1 : x.stamp === y.stamp ? 0 : -1;
  }

  delete(x: Entry<T>) {
    if (x === this.base) {
      throw new Error(`Cannot delete the base entry.`);
    }
    x.deleted = true;
    x.prev.next = x.next;
  }

  deleted(x: Entry<T>) {
    return x.deleted;
  }

  spliceOut(x: Entry<T>, y: Entry<T>) {
    let c = x.next;
    while (c != this.base && this.order(c, y) != -1) {
      this.delete(c);
      c = c.next;
    }
  }
}

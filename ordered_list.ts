/**
 * This implementation combines the OrderedList and the CircularList from
 * the original haskell library.
 */
export interface Entry<T> {
  data: T | null,  // only base should have null data
  stamp: number;
  next: Entry<T>;
  prev: Entry<T>;
  deleted: boolean;
}

/**
 * Inefficient implementation of the OrderedList interface from Sleator and
 * Dietz paper https://www.cs.cmu.edu/~sleator/papers/maintaining-order.pdf
 */
export class OrderedList<T> {

  base: Entry<T> = {data: null, stamp: 0, next: this.base, prev: this.base, deleted: false};

  constructor() {
    // At this point 'base' actually has 'undefined' for prev and next.
    // A bit or manual patching gets it to be trully cyclical.
    this.base.prev = this.base;
    this.base.next = this.base;
  }

  insertEntryAfter(data: T, after: Entry<T>) {
    let stamp: number;
    if (after.next.stamp > after.stamp) {
      stamp = (after.stamp + after.next.stamp) / 2;
      if (stamp === after.stamp || stamp === after.next.stamp) {
        throw new Error(`percision exceeded in the naive OrderedList implemenation`);
      }
    } else {
      stamp = after.stamp + 1;
    }
    const entry = {data, stamp, next: after.next, prev: after, deleted: false};
    after.next = entry;
    return entry;
  }

  order(x: Entry<T>, y: Entry<T>): -1 | 0 | 1 {
    return x.stamp < y.stamp ? 1 : (
      x.stamp === y.stamp ? 0 : -1
    );
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

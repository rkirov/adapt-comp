/**
 * Simple priority queue (binary heap impl).
 * Supports add and popMin in O(log(n)).
 */
export class PriorityQueue<T> {
  private arr: T[] = [];

  constructor(private readonly cmp: (x: T, y: T) => -1 | 0 | 1) {}

  insert(item: T) {
    this.arr.push(item);
    let idx = this.arr.length - 1;
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this.arr[parent] <= this.arr[idx]) return;
      const temp = this.arr[parent];
      this.arr[parent] = this.arr[idx];
      this.arr[idx] = temp;
      idx = parent;
    }
  }

  length() {
    return this.arr.length;
  }

  popMin(): T {
    if (this.arr.length === 0) {
      throw new Error(`can't pop from an empty priority queue.`);
    }
    const min = this.arr[0];
    const last = this.arr.pop()!;
    if (this.arr.length == 0) return min;
    this.arr[0] = last;
    this.adjustHeap();
    return min;
  }

  private adjustHeap() {
    let idx = 0;
    while (true) {
      const left = 2 * idx;
      const right = left + 1;
      if (left < this.arr.length && this.arr[left] < this.arr[idx]) {
        const temp = this.arr[left];
        this.arr[left] = this.arr[idx];
        this.arr[idx] = temp;
        idx = left;
        continue;
      }
      if (right < this.arr.length && this.arr[right] < this.arr[idx]) {
        const temp = this.arr[right];
        this.arr[right] = this.arr[idx];
        this.arr[idx] = temp;
        idx = right;
        continue;
      }
      break;
    }
  }
}

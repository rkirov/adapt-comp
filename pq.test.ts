import {PriorityQueue} from './pq';

const numCmp = (x: number, y: number) => (y > x ? 1 : x === y ? 0 : -1);

test('priority queue supports inserts', () => {
  const pq = new PriorityQueue(numCmp);
  expect(pq.length()).toBe(0);
  pq.insert(1);
  expect(pq.length()).toBe(1);
  pq.insert(2);
  expect(pq.length()).toBe(2);
});

test('priority queue supports popping the min', () => {
  const pq = new PriorityQueue(numCmp);
  pq.insert(2);
  pq.insert(1);
  pq.insert(3);
  expect(pq.popMin()).toBe(1);
  expect(pq.popMin()).toBe(2);
  expect(pq.popMin()).toBe(3);
});

test('priority queue throws on empty', () => {
  const pq = new PriorityQueue<number>(numCmp);
  expect(() => pq.popMin()).toThrowError(/empty/);
});

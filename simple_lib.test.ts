import {write} from './simple';
import {getList, map, reduce, writeAtIdx, makeIncList} from './simple_lib';

test('should convert to and from regular lists', () => {
  const l = makeIncList([1,2,3]);
  expect(getList(l)).toEqual([1,2,3]);
});

test('should map incrementally', () => {
  const l = makeIncList([1,2,3]);
  const mapped = map(l, x => x * x);
  expect(getList(mapped)).toEqual([1,4,9]);
});

test('should update map correctly', () => {
  const l = makeIncList([1,2,3]);
  const mapped = map(l, x => x * x);
  writeAtIdx(l, 1, 6);
  expect(getList(mapped)).toEqual([1,36,9]);
});

test('should compute reduce correctly', () => {
  const l = makeIncList([1,2,3]);
  const sum = reduce(l, (x, y) => x + y, 0);
  expect(sum.get()).toEqual(6);
});

test('should update reduce correctly', () => {
  const l = makeIncList([1,2,3]);
  const sum = reduce(l, (x, y) => x + y, 0);
  writeAtIdx(l, 1, 0);
  expect(sum.get()).toEqual(4);
});

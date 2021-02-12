import {Adaptive, Modifiable} from '../adaptive';

import {aqsort, afilter} from './aqsort_simple';
import {read, write, comp, pure} from '../simple';
import {IncrList} from '../data';
import {makeIncrList, getList, append} from '../simple_lib';

test('adaptive filter filters', () => {
  const mid = makeIncrList([1]);
  const list = append(2, mid);
  const res = afilter(x => x < 2, list);

  expect(getList(res)).toStrictEqual([1]);

  // modification
  write(mid, null);

  expect(res.get()).toBe(null);
});

test('Adaptive quick sort does sort', () => {
  const list = makeIncrList([2, 1, 3]);

  const sortedList = aqsort(list);

  const plainList = getList(sortedList);
  expect(plainList).toStrictEqual([1, 2, 3]);
});

test('Adaptive quick sort does adapt to changes', () => {
  const mid = makeIncrList([1, 3]);
  const list = append(2, mid);
  const sortedList = aqsort(list);

  // change the original list.
  write(mid, makeIncrList([5]).get());

  const plainList = getList(sortedList);
  expect(plainList).toStrictEqual([2, 5]);
});

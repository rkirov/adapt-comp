import {Adaptive, Modifiable} from '../adaptive';

import {aqsort, afilter} from './aqsort_simple';
import {IncrList} from '../simple_lib';
import {makeIncrList, getList, append} from '../simple_lib';

test('adaptive filter filters', () => {
  const mid = makeIncrList([1]);
  const list = append(2, mid);
  const res = afilter(x => x < 2, list);

  expect(getList(res)).toStrictEqual([1]);

  // modification
  mid.value = null;

  expect(res.value).toBe(null);
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
  mid.value = makeIncrList([5]).value;

  const plainList = getList(sortedList);
  expect(plainList).toStrictEqual([2, 5]);
});

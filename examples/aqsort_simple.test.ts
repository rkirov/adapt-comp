import {Adaptive, Modifiable} from '../adaptive';

import {aqsort, afilter} from './aqsort_simple';
import {read, write, comp, pure} from '../simple';
import {IncrList} from '../data';

test('adaptive filter filters', () => {
  // TODO: figure out why 'as' casts are needed.
  const mid = comp(
    pure({
      value: 1,
      tail: comp(pure(null)) as IncrList<number>,
    })
  ) as IncrList<number>;
  const list = comp(pure({value: 2, tail: mid})) as IncrList<number>;

  const res = afilter(x => x < 2, list);

  expect(res.get()!.value).toBe(1);
  expect(res.get()!.tail.get()!).toBe(null);

  // modification
  write(mid, null);

  expect(res.get()!).toBe(null);
});

test('Adaptive quick sort does sort', () => {

  const mid = comp(
    pure({
      value: 1,
      tail: comp(pure({value: 3, tail: comp(pure(null))})),
    })
  ) as IncrList<number>;
  const list = comp(pure({value: 2, tail: mid})) as IncrList<number>;

  const sortedList = aqsort(list);

  const firstCons = sortedList.get()!;
  const secondCons = firstCons.tail.get()!;
  const thirdCons = secondCons.tail.get()!;

  expect(firstCons.value).toBe(1);
  expect(secondCons.value).toBe(2);
  expect(thirdCons.value).toBe(3);
});

test('Adaptive quick sort does adapt to changes', () => {
  const mid = comp(
    pure({
      value: 1,
      tail: comp(pure({value: 3, tail: comp(pure(null))})),
    })
  ) as IncrList<number>;
  const list = comp(pure({value: 2, tail: mid})) as IncrList<number>;
  const sortedList = aqsort(list);

  // change the original list.
  write(mid, {
    value: 5,
    tail: comp(pure(null)) as IncrList<number>,
  });

  expect(sortedList.get()!.value).toBe(2);
  expect(sortedList.get()!.tail.get()!.value).toBe(5);
});

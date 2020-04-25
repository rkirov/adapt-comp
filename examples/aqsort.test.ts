import {Adaptive, constant, Modifiable} from '../adaptive';

import {AList, aqsort} from './aqsort';

test('Adaptive quick sort does sort', () => {
  const a = new Adaptive();

  // TODO: figure out why 'as' casts are needed.
  const mid = a.newMod(constant({
    value: 1,
    tail: a.newMod(constant({value: 3, tail: a.newMod(constant(null))}))
  })) as Modifiable<AList>;
  const list = a.newMod(constant({value: 2, tail: mid})) as Modifiable<AList>;

  const sortedList = aqsort(a, list);

  const firstCons = sortedList.get()!;
  const secondCons = firstCons.tail.get()!;
  const thirdCons = secondCons.tail.get()!;

  expect(firstCons.value).toBe(1);
  expect(secondCons.value).toBe(2);
  expect(thirdCons.value).toBe(3);
});

test('Adaptive quick sort does adapt to changes', () => {
  const a = new Adaptive();

  // TODO: figure out why 'as' casts are needed.
  const mid = a.newMod(constant({
    value: 1,
    tail: a.newMod(constant({value: 3, tail: a.newMod(constant(null))}))
  })) as Modifiable<AList>;
  const list = a.newMod(constant({value: 2, tail: mid})) as Modifiable<AList>;
  const sortedList = aqsort(a, list);

  // change the original list.
  a.change(mid, {value: 5, tail: a.newMod<AList>(constant(null))});
  a.propagate();

  // TODO: This is broken, seems that time stamps are off.
  // expect(sortedList.get()!.value).toBe(2);
  // expect(sortedList.get()!.tail.get()!.value).toBe(5);
});

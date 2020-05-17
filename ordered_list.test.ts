import {OrderedList} from './ordered_list';

test('ordered list should support random insertion and order checks', () => {
  const ol = new OrderedList<null>();

  const c1 = ol.insertEntryAfter(null, ol.base);
  const c3 = ol.insertEntryAfter(null, c1);
  const c2 = ol.insertEntryAfter(null, c1);

  // the entries are ordered c1 -> c2 -> c3;
  expect(ol.order(c1, c2)).toBe(1);
  expect(ol.order(c2, c1)).toBe(-1);
  expect(ol.order(c1, c1)).toBe(0);

  expect(ol.order(c1, c2)).toBe(1);
  expect(ol.order(c2, c3)).toBe(1);
  expect(ol.order(c1, c3)).toBe(1);
});

test('ordered list should support simple deletion', () => {
  const ol = new OrderedList<null>();

  // c1 -> c2 -> c3
  const c1 = ol.insertEntryAfter(null, ol.base);
  const c2 = ol.insertEntryAfter(null, c1);
  const c3 = ol.insertEntryAfter(null, c2);

  expect(ol.deleted(c1)).toBe(false);
  expect(ol.deleted(c2)).toBe(false);

  ol.delete(c2);
  expect(ol.deleted(c1)).toBe(false);
  expect(ol.deleted(c2)).toBe(true);

  expect(ol.order(c1, c3)).toBe(1);
});

test('ordered list should support splice deletion', () => {
  const ol = new OrderedList<null>();

  // c1 -> c2 -> c3
  const c1 = ol.insertEntryAfter(null, ol.base);
  const c2 = ol.insertEntryAfter(null, c1);
  const c3 = ol.insertEntryAfter(null, c2);

  expect(ol.deleted(c2)).toBe(false);
  expect(ol.deleted(c3)).toBe(false);

  ol.spliceOut(c2, c3);
  expect(ol.deleted(c2)).toBe(false);
  expect(ol.deleted(c3)).toBe(true);
});

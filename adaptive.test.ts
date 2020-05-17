import {Adaptive, constant} from './adaptive';

test('adaptive computation of 1 + 2', () => {
  const a = new Adaptive();
  const m1 = a.newMod(constant(1));
  const m2 = a.newMod(constant(2));
  // Representing the computation m1 + m2.
  const res = a.newMod(a.readMod(m1, x => a.readMod(m2, y => constant(x + y))));

  // Initial state
  expect(m1.get()).toBe(1);
  expect(m2.get()).toBe(2);

  // Reading Mods outside a.readMod is not adaptive.
  // This is the downside of not using the Adaptive monad.
  expect(res.get()).toBe(3);

  a.change(m1, 5);
  a.propagate();

  expect(m1.get()).toBe(5);
  expect(res.get()).toBe(7);
});

test('adaptive computation with a switch', () => {
  const a = new Adaptive();
  const bool = a.newMod(constant(true));
  const m1 = a.newMod(constant(1));
  const m2 = a.newMod(constant(2));

  // number of times the result has been reevaluated.
  let reevalCount = 0;
  const res = a.newMod(
    a.readMod(bool, b => {
      reevalCount += 1;
      return b ? a.modToC(m1) : a.modToC(m2);
    })
  );

  // Initial state
  expect(m1.get()).toBe(1);
  expect(m2.get()).toBe(2);

  // Reading Mods outside a.readMod is not adaptive.
  // This is the downside of not using the Adaptive monad.
  expect(res.get()).toBe(1);
  expect(reevalCount).toBe(1);

  // Testing that m2 is "unplugged", i.e. its change doesn't reeval res.
  a.change(m2, 101);
  a.propagate();
  expect(reevalCount).toBe(1);

  a.change(bool, false);
  a.propagate();

  expect(res.get()).toBe(101);
  expect(reevalCount).toBe(2);

  // Testing that m1 is "unplugged", i.e. its change doesn't reeval res.
  a.change(m1, 100);
  a.propagate();
  expect(reevalCount).toBe(2);
});

test('using newMod within a Changable', () => {
  const a = new Adaptive();
  const mod = a.newMod(a.modToC(a.newMod(constant(1))));

  expect(mod.get()).toBe(1);
});

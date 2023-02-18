import {Input} from './simple';

test('should do a simple reactivity', () => {
  const a = new Input(1);
  const b = new Input(2);
  const c = a.read(x => b.read(y => x + y));
  expect(c.value).toBe(3);

  a.value = 2;
  expect(c.value).toBe(4);
});

test('should support dynamic reactivity', () => {
    const a = new Input(1);
    const b = new Input(2);
    const c = new Input(true);
    let aCount = 0;
    let bCount = 0;
    let cCount = 0;
    const d = c.read(x => {
        cCount++;
        return x ? a.read(x => {aCount++; return x}) : b.read(x => {bCount++; return x});
    });
    expect(aCount).toBe(1);
    expect(bCount).toBe(0);
    expect(cCount).toBe(1);
    expect(d.value).toBe(1);

    // b is detached from d, so its updates should not affect d.
    b.value = 101;
    expect(aCount).toBe(1);
    expect(bCount).toBe(0);
    expect(cCount).toBe(1);
    
    // a is still attached to d, so its updates should affect d.
    a.value = 100;
    expect(d.value).toBe(100);
    expect(aCount).toBe(2);
    expect(bCount).toBe(0);
    expect(cCount).toBe(1);

    // switch to b.
    c.value = false;
    expect(d.value).toBe(101);
    expect(aCount).toBe(2);
    expect(bCount).toBe(1);
    expect(cCount).toBe(2);

    // a is detached from d, so its updates should not affect d.
    a.value = 1010;
    expect(d.value).toBe(101);

    expect(aCount).toBe(2);
    expect(bCount).toBe(1);
    expect(cCount).toBe(2);

    // b is still attached to d, so its updates should affect d.
    b.value = 1000;
    expect(d.value).toBe(1000);
    expect(aCount).toBe(2);
    expect(bCount).toBe(2);
    expect(cCount).toBe(2);
});


test('should have no glitches', () => {
    const a = new Input('A');
    const b = a.read(x => x + 'B');
    const cs: string[] = [];
    const c = a.read(x => b.read(y => {
        const res = x + '->' + y;
        cs.push(res);
        return res;
    }));

    expect(cs).toEqual(['A->AB']);

    a.value = 'a';
    // should not have any intermediate values like a->AB.
    expect(c.value).toBe('a->aB');
    expect(cs).toEqual(['A->AB', 'a->aB']);
});

import {Input, Signal} from '../simple';

// example 1 - distance fn
const x = new Input(1);
const y = new Input(1);

const op1 = x.read(x => x * x);
const op2 = y.read(x => x * x);
const op3 = op1.read(x => op2.read(y => x + y));
const op4 = op3.read(x => Math.sqrt(x));

console.log(op4.value);

y.value = 3;

console.log(op4.value);

// example 2 - add up to n

// description
function f(x: Signal<number>, y: Signal<number>): Signal<number> {
  const nextX = x.read(x => x - 1);
  const nextY = x.read(x => y.read(y => x + y));
  const lessZ = x.read(x => x <= 0);
  return lessZ.read(b => (b ? y : f(nextX, nextY)));
}

// or version 2
// Which one is better?
function f2(xS: Signal<number>, yS: Signal<number>): Signal<number> {
  return xS.read(x => {
    if (x <= 0) return yS;
    return f2(xS.read(x => x - 1), yS.read(y => x + y));
  });
}


const x2 = new Input(10);
const y2 = new Input(0);

// computation
const res2 = f2(x2, y2);
console.log(res2.value); // returns 55;

// re-computation
y2.value = 100;
console.log(res2.value); // returns 155;

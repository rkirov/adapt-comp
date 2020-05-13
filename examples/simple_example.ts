import {comp, read, write, pure} from '../simple'; 
import {Modifiable} from '../adaptive'; 

// example 1 - distance fn
const x = comp(pure(1));
const y = comp(pure(1));

const op1 = comp(read(x, x => pure(x * x)));
const op2 = comp(read(y, x => pure(x * x)));
const op3 = comp(read(op1, x => 
                 read(op2, y =>
                   pure(x + y))));
const op4 = comp(read(op3, x => pure(Math.sqrt(x)))); 

console.log(op4.get());

write(y, 3);

console.log(op4.get());

// example 2 - add up to n 

// description
function f(x: Modifiable<number>, y: Modifiable<number>): Modifiable<number> {
  const nextX = comp(read(x, x => pure(x - 1)));
  const nextY = comp(read(x, x => read(y, y => pure(x + y))));
  const lessZ = comp(read(x, x => pure(x <= 0)));
  return comp(read(lessZ, b => b ? read(y) : read(f(nextX, nextY))));
}
const x2 = comp(pure(10));
const y2 = comp(pure(0));

// computation
const res2 = f(x2, y2);
console.log(res2.get());  // returns 55;

// re-computation
write(y2, 10);
console.log(res2.get());  // returns 155;

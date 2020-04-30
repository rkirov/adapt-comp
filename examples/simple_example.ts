import {comp, read, write, pure} from '../simple'; 

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

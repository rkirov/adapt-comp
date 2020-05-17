import {Adaptive, constant, Modifiable} from '../adaptive';
import {IncrList} from '../data';

/**
 * Adaptive filter
 *
 * Creates a new list from the elements for lmod that return true from the cmp
 * function.
 */
export function afilter(
    a: Adaptive, cmp: (x: number) => boolean,
    lmod: IncrList<number>): IncrList<number> {
  return a.newMod(a.readMod(lmod, (l) => {
    if (l === null) return constant(null);
    if (cmp(l.value)) {
        return constant({value: l.value, tail: afilter(a, cmp, l.tail)});
    }
    return a.modToC(afilter(a, cmp, l.tail));
  }));
}

/**
 * Adaptive quick sort.
 *
 * Once a modifiable list has been sorted it can be modified and the algorightm
 * will "self-adjust".
 *
 * @param rest Only used internally. A tail to be attached to the result,
 *     without sorting.
 */
export function aqsort(
    a: Adaptive, lmod: IncrList<number>,
    rest?: IncrList<number>): IncrList<number> {
  return a.newMod(a.readMod(lmod, (l) => {
    if (l === null) return rest ? a.modToC(rest) : constant(null);
    const pivot = l.value;
    const lessThan = afilter(a, (x) => x < pivot, l.tail);
    const greaterThan = afilter(a, (x) => x >= pivot, l.tail);
    const half = a.newMod(constant(
                     {value: pivot, tail: aqsort(a, greaterThan, rest)})) as IncrList<number>;
    return a.modToC(aqsort(a, lessThan, half));
  }));
}

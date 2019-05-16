import {Adaptive, constant, Modifiable} from '../adaptive';

/**
 * An adaptive list.
 *
 * Standard cons pair, but with a tail wrapped in a Modfiable reference.
 */
export interface Cons {
  value: number;
  tail: Modifiable<AList>;
}
export type AList = Cons|null;

/**
 * Adaptive filter
 *
 * Creates a new list from the elements for lmod that return true from the cmp
 * function.
 */
function afilter(
    a: Adaptive, cmp: (x: number) => boolean,
    lmod: Modifiable<AList>): Modifiable<AList> {
  return a.newMod(a.readMod(lmod, (l) => {
    if (l === null) return constant(null);
    const mod = cmp(l.value) ?
          a.newMod(constant({value: l.value, tail: afilter(a, cmp, l.tail)})) as Modifiable<AList> :
          afilter(a, cmp, l.tail);
    return a.modToC(mod);
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
    a: Adaptive, lmod: Modifiable<AList>,
    rest?: Modifiable<AList>): Modifiable<AList> {
  return a.newMod(a.readMod(lmod, (l) => {
    if (l === null) return rest ? a.modToC(rest) : constant(null);
    const pivot = l.value;
    const lessThan = afilter(a, (x) => x < pivot, l.tail);
    const greaterThan = afilter(a, (x) => x >= pivot, l.tail);
    const half = a.newMod(constant(
                     {value: pivot, tail: aqsort(a, greaterThan, rest)})) as
        Modifiable<AList>;
    return a.modToC(aqsort(a, lessThan, half));
  }));
}
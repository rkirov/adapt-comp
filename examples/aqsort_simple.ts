import { Input } from '../simple';
import type { IncrList } from '../simple_lib';

export function afilter(
  cmp: (x: number) => boolean,
  lmod: IncrList<number>
): IncrList<number> {
  return lmod.read(l => {
    if (l === null) return null;
    if (cmp(l.value)) {
      return { value: l.value, tail: afilter(cmp, l.tail) };
    }
    return afilter(cmp, l.tail);
  });
}

export function aqsort(
  lmod: IncrList<number>,
  rest?: IncrList<number>
): IncrList<number> {
  return lmod.read(l => {
    if (l === null) return rest ? rest.value : null;
    const pivot = l.value;
    const lessThan = afilter(x => x < pivot, l.tail);
    const greaterThan = afilter(x => x >= pivot, l.tail);
    const half = new Input({ value: pivot, tail: aqsort(greaterThan, rest) }) as IncrList<number>;
    return aqsort(lessThan, half);
  });
}

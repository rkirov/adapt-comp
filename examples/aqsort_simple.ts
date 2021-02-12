import {Adaptive, constant, Modifiable} from '../adaptive';
import {IncrList} from '../data';
import {read, comp, pure} from '../simple';


export function afilter(
  cmp: (x: number) => boolean,
  lmod: IncrList<number>
): IncrList<number> {
  return comp(
    read(lmod, l => {
      if (l === null) return pure(null);
      if (cmp(l.value)) {
        return pure({value: l.value, tail: afilter(cmp, l.tail)});
      }
      return read(afilter(cmp, l.tail));
    })
  );
}

export function aqsort(
  lmod: IncrList<number>,
  rest?: IncrList<number>
): IncrList<number> {
  return comp(
    read(lmod, l => {
      if (l === null) return rest ? read(rest) : pure(null);
      const pivot = l.value;
      const lessThan = afilter(x => x < pivot, l.tail);
      const greaterThan = afilter(x => x >= pivot, l.tail);
      const half = comp(
        pure({value: pivot, tail: aqsort(greaterThan, rest)})
      ) as IncrList<number>;
      return read(aqsort(lessThan, half));
    })
  );
}

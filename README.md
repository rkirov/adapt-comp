# Adaptive (Self-Adjusting) Computations in JS

_This is a toy! Do not use in real projects!_

This is a JS/TS reimplementation of the [Haskell library][2] described in the
paper [Monads for Incremental Computations][1] by Magnus Carlsson. Of course,
TypeScript does not support monads (higher-kinded types needed), nor
do-notation, so a number of compromises were made in the conversion. The
Haskell library was in turn inspired by earlier ML [implementation][3], but I
have not looked into that code. Also the Haskell improvements (removing
explicit writes) do seem desirable.

It has mostly been a fun exercise and a learning aid to understand the ideas
behind the adaptive computation literature.

## What is Adaptive Computation?

In the programming languages we use today computations are single-usage. We
build a data structure, pass it to an algorithm, and receive the result. If at
later point of time the data structure changes, the algorithm has to be rerun
from scratch.

```typescript
const data = [1, 2, 3];
const function algo(xs: number[]) {
  let r = 0;
  for (const x of xs) r += x * x;
  return r;
}
const result = algo(data);  // what we call the computation

// some time passes

data[1] = 100;
const newResult = algo(data);  // we have to redo the computation from scratch.
```

We can design the data structure and the algorithm to be "adaptive", i.e. to
support mutations together with an appropriate change to the result. In the
example above, this can be done by:

```typescript
function changeInputAtIdx(
  orignalArr: number[],
  idx: number,
  newVal: number,
  oldResult: number
) {
  return oldResult - originalArr[idx] * originalArr[idx] + newVal * newVal;
}
```

Notice that the update logic is almost as complicated as the original
"computation" and we had to write it by hand. What if we can automatically
"derive" if from the original computation, no matter what the computation was.

This is what "adaptive computation" tries to achieve. Some languages like
[Lustre][7] tackle the problem. Here instead we attempt to solve it by using a
library.

## How to use

The library is structured around three main classes - `Adaptive`, `Changable`
and `Modifable`.

Adaptive can be thought of as the context of an adaptive computation. It holds
all the internal data structures needed. Adaptive computation begins by
creating an Adaptive:

```typescript
const a = new Adaptive();
```

In an adaptable computation we have `Modifiable<T>` which is like mutable
variables of type `T` in programming languages. We can create them using
`a.newMod(...)`. In the `...` we pass a `Changable<T>`, which is like an
expression computing a value of type `T` in familiar programming languages.

The simplest way to produce a `Changable` is to use the `constant` function.

```typescript
const m1 = a.newMod(constant(1));
const m2 = a.newMod(constant(2));
```

This is the adaptive version of:

```typescript
const m1 = 1;
const m2 = 2;
```

The only other way to produce a `Changable` is to read a `Modifiable` using
`a.readMod`. It takes a callback with the current value of the `Modifiable`
(very similar to a Promise). At the end of the callback we still have to
return a `Changable`.

For example, the adaptive version of `m3 = m1 + 2` will be:

```typescript
const m3 = a.newMod(a.readMod(m1, x => constant(x + 2)));
```

And with chaining we can write more complicated expressions like the adaptive
version of `m3 = m1 + m2`.

```typescript
const m3 = a.newMod(a.readMod(m1, x => a.readMod(m2, y => constant(x + y)));
```

Simply reading a Modifiable to produce a Changable can be a bit awkward -
`a.readMod(m, x => constant(x))`. To safe some typing we added `a.modToC(m)`
which is just sugar for that same operation.

To summarize the main types here:

| Adaptive Type | Classical analog                         |
| ------------- | ---------------------------------------- |
| Modifable<T>  | Variable of type T                       |
| Changable<T>  | Computation resulting in value of type T |
| Adaptive      | Context                                  |

At any point the result of the computation can be obtained with
`Modifiable.get()`. Note, that this access is not considered "adaptive" and
should be done only outside `Changable` expressions. Inside `Changable` one has
to use `readMod`.

```typescript
console.log(m1.get(), m2.get(), m3.get()); // 1, 2, 3
```

Finally, we can change the value of any modifiable using `a.change(Modifiable, newValue)`. Once we change all modifiables we would like, all affected
computations will be rerun with `a.propagate()`. Notice we don't need to spell
out what will be affected.

```typescript
a.changeMod(m1, 10);
a.propagate();
console.log(m3.get()); // 12
```

Note that one should not use `a.change` inside Changable expressions.
Modifiables should be treated as immutable inside Changables, but we can always
create new Modifiables using `a.newMod`.

### The Dynamic Dependency Graph

Underneath the hood the library is tracking which `Modifiables` were read to
produce the other ones. This mechanism is dynamic, which means that it can
change from one execution to another.

```typescript
const switchMod = a.newMod(
  a.readMod(booleanMod, b => {
    return b ? a.readMod(modTrue, x => x + 1) : a.readMod(modFalse, x => x + 2);
  })
);
```

In this example, the dynamic dependency graph will track which one of `modTrue`
or `modFalse` was read in the previous recomputation. If `b` is `True` and
later `modFalse` changes, no spurious recalculation of `switchMod` will occur.
If at a later point `b` changes the dependency graph will automatically adjust.

### Why all the callbacks

The pervasive use of closures allows for the right scope of reevaluation to
occur.

```typescript
const result = a.newMod(a.readMod(aMod, a => {
  const intermed1 = a * 2;
  return a.readMod(bMod, b => {
    const intermed2 = b * 2;
    return constant(intermed1 + intermed2);
  })
});
```

In this example if `bMod` changes, only the second callback will be evaluated.
Hence, the result `a * 2` will be immediately reused. Note, however, that if
`a` changes the `b * 2` result will not be reused. Because `a` is accessible
inside the `b` reading closure, the library cannot know that `b`'s computation
was not dependent on `a`.

In order to achieve the more efficient computation reuse one has to rewrite the
computation as below. Having to think about these scenarios is a major downside
of this approach to adaptive computations.

```typescript
const a2Mod = a.newMod(a.readMod(aMod, a => constant(a * 2));
const b2Mod = a.newMod(a.readMod(aMod, b => constant(b * 2));
const result = a.newMod(a.readMod(a2Mod, a2 => a.readMod(b2Mod, b2 => constant(a2 + b2))));
```

## Implementation details

The original Haskell implementation has at least four different monads. I have
removed all, but one - Changable and replaced the rest with simple mutable
operations.

As observed in [the Carlsson paper][1] the Changable monad is nothing more than
the continuation monad with some callback caching based on causality ordering.
A nice gentle intro to the continuation monad can be found in Dan Piponi's blog
[here][4],[and here][5].

The original Haskell implementation uses a data structure [by Deitz and
Sleator][6], which I skipped implementing and instead used a trivial
replacement (which would likely fail to scale).

## Syntax sugar

Undoubtedly the current syntax is odd, because of the explicit closures.
Similarly to Promises and async/await, one can invent a syntactic sugar to make
it look like writing regular imperative code with adapt/read keywords.

```typescript

const result = adapt with a { return (read a2Mod) + (read b2Mod); }
// transpiles to
const result = a.newMod(a.readMod(a2Mod, a2 => a.readMod(b2Mod, b2 => constant(a2 + b2))));
```

## Connections with Reactive programming, FRP and dataflow languages

I think adaptive computations are smaller and more restrictive versions of the
same underlying ideas. As such this library likely can be fully backed by
libraries like Rxjs, but that might be an overkill. Adaptive computations as
defined by this library are necessarily smaller scoped than general dataflow,
because one cannot express operations like `take(3)`, which would mean adapt to
changes in other Modifiables only up to 3 times. Being more restrictive, of
course results in simpler model of how this system works, compared to a general
dynamic graph of streams.

This area needs more exploration.

## Examples

See examples/ directory for non-trivial adaptive algorithm examples.

## Next Steps

- [ ] implement the real OrderedList data structure from [6][].
- [ ] add support for pluggable equality checking.
- [ ] add more examples of non-trivial algorithms that can be turned adaptive.

## Open Quesions

- Can native JS arrays and objects be turned into their Modifable equivalents.
  The best current answer is use custom data strucutres like the linked list in
  aqsort example, which of course is a non-starter for any general use.
- Are the runtime performance and memory consumption of this acceptable?
- What runtime checks should be added to get back some of the guarantees that
  the Haskell implentation had using monads?
- API design needs work
  - Should Adaptive be global and not explicitly invoked?
  - Can Modifable/Changle distinction be removed? It is awkward to use modToC.
- what happens when adaptable computations throw.

## Developing

Run `tsc -w` and `jest --watchAll` in two different terminals.

## References

1. Magnus Carlsson. Monads for Incremental Computing. ICFP '02 Proceedings of the seventh ACM SIGPLAN international conference on Functional programming [link][1]
1. U. Acar, G. Blelloch, and R. Harper. Adaptive functional programming. In Principles of Programming Languages (POPL02), Portland, Oregon, January 2002. ACM. [link][3]
1. P.F.Dietz and D.D.Sleator. Two algorithms for mainitaining order in a list. In Proceedings. 19th ACM Symposium. Theory of Computing, 1987. [link][6]

[1]: https://www.researchgate.net/publication/2858472_Monads_for_Incremental_Computing_-_Functional_Pearl
[2]: http://hackage.haskell.org/package/Adaptive
[3]: https://www.cs.cmu.edu/~rwh/papers/afp/popl02.ps
[4]: https://dpiponi.github.io/cont.html
[5]: http://blog.sigfpe.com/2008/12/mother-of-all-monads.html
[6]: https://www.cs.cmu.edu/~sleator/papers/maintaining-order.pdf
[7]: https://en.wikipedia.org/wiki/Lustre_(programming_language)

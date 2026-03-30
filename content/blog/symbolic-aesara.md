---
title: "Rewriting Aesara graphs"
date: 2022-04-12
---

This article is a port of [Brandon Willard'](https://twitter.com/BrandonTWillard)s [Tour of the Symbolic PyMC library](https://pymc-devs.github.io/symbolic-pymc/symbolic-pymc-tour.html), and is a simplified version of the [example in Aesara's documentation](https://aesara.readthedocs.io/en/latest/extending/graph_rewriting.html#unification-and-reification). The text is almost a verbatim copy of the original, but mistakes are obviously mine.

In this document we will be implementing a symbolic "search-and-replace" that changes aesara graphs like `at.dot(A, x+y)` to `at.dot(A, x) + at.dot(A, y)`. In other words we will demonstrate how to implement the distributive property of the matrix multiplication so it can be applied to any aesara graph. Aesara allows one to implement rewrite rules like the distributive property---and many other sophisticated manipulation of graphs---by providing flexible, pure Python versions of core operations in symbolic computation. These operations are then combined and orchestrated through the relational programming DSL [miniKanren](http://minikanren.org/).

More specifically, we'll introduce the basic unification and reification operations and explicitly show how they relate to graph manipulation and the modeling of high-level mathematical relations. Along the way, we'll cover some of the necessary details behind Aesara graphs.

We start by creating a graph of our target expressions--i.e. `at.dot(A, x + y)` in Aesara. We need to do this in order to determine exactly what we're searching for and--later--what to put in its place.

```python
import aesara.tensor as at

A_tt = at.matrix("A")
x_tt = at.vector("x")
y_tt = at.vector("y")
z_tt = at.dot(A_tt, x_tt + y_tt)
```

We can get a text print-out of the graph using the debug print function `dprint`

```python
import aesara

aesara.dprint(z_tt)
```

```text
dot [id A] ''
 |A [id B]
 |Elemwise{add,no_inplace} [id C] ''
   |x [id D]
   |y [id E]
```

The output of `dprint` shows the underlying operators (`dot`, `add`) and their arguments.

To "math/search for" combinations of Aesara operations--or, as we just saw, graphs--we use **unification**; to "replace" parts of the graph (well, produce a copy with replaced parts) we use **reificatoin**. Aesara provides support for these via **expression-tuples**.

# S-expressions

We can convert an Aesara graphs into an [S-expression-like](https://en.wikipedia.org/wiki/S-expression) form using [etuples](https://github.com/pythological/etuples).

```python
from etuples import etuple, etuplize
from IPython.lib.pretty import pprint

z_et = etuplize(z_tt)
pprint(z_et)
```

```text
e(
  e(aesara.tensor.math.Dot),
  A,
  e(
    e(
      aesara.tensor.elemwise.Elemwise,
      <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
      <frozendict {}>),
    x,
    y))
```

An `etuple` is like a normal `tuple`, except that its first element is a `Callable` and the remaining elements are the `Callable`'s arguments. As above, a pretty-printed `etuple` looks like a `tuple` prefixed by an `e`.

By working with `etuples` we can use **arbitrary Python functions** in conjunction with Aesara graphs and logic variable arguments. Basically, and `etuple` can be manipulated until all of its constituent logic variables are replaced with valid arguments to the function/operators. At that point the etuple can be evaluated.

For instance we can create an `etuple` that uses the function `at.add` with a logic variable argument.

```python
from unification import var

x_lv, y_lv = var('x'), var('y')
add_pattern = etuple(etuplize(at.add), x_lv, y_lv)
```

It wouldn't normally be possible to call the `at.add` function with these argument types, as demonstrated in this example:

```python
try:
    at.add(x_lv, 1)
except NotImplementedError as e:
    print(str(e))
```

```text
Cannot convert ~x to a tensor variable.
```

We'll get a similar error if we attempt to evaluate the `etuple` by accessing its `ExpressionTuple.evaled_obj` property. However, after performing a simple manipulation that replaces the logic variable with a valid input to `at.add` (reificatoin), we are able to evaluate the `etuple` and obtain an Aesara Tensor result, as demonstrated by the following code:

```python
from unification import reify

new_add_pattern = reify(add_pattern, {x_lv: 1., y_lv: 1.})
pprint(new_add_pattern)
```

```text
e(
  e(
    aesara.tensor.elemwise.Elemwise,
    <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
    <frozendict {}>),
  1.0,
  1.0)
```

```python
pprint(new_add_pattern.evaled_obj)
```

```text
Elemwise{add,no_inplace}.0
```

Working with S-expressions is much like manipulating a subset of Python AST, so, when using `etuples`, one is--in effect-**meta programming** (e.g. by automating the production and evaluation of Aesara graphs using Python code). As a matter of fact, `etuples` could be recast as `ast.Expr` and `ast.Call` objects that, though the use of `eval`, could achieve the same results-albeit without the more convenient tuple-like structuring.

# Operators and their parameters

In etuplized-graph-print the `etuple` form of our matrix-multuplication graph `z_et` produced Aesaa operators

```python
pprint(z_et[0])
```

```text
e(aesara.tensor.math.Dot)
```

# Unification and reification

With the ability to use logic variables and Aesara graphs together, we can now "search" or "match" arbitrary graphs using **unification** and produce new graphs by replacing logic variables using **reification**.

We start by making "patterns" or templates for the subgraphs we would like to match. Patterns, in this case, take the form of S-expressions with the desired structure and logic variables in place of "unknown" or arbitrary terms that we might like to reference elsewhere.

`dot_pattern` represents an S-expression that evaluateds to a graph in which two terms are matrix-multiplied.

```python
from aesara.tensor.math import Dot

A_lv, B_lv = var("A"), var("B")
dot_pattern = etuple(etuple(Dot), A_lv, B_lv)
```

"Matching" a graph against this pattern is called **unification**. Unificatoin of two graphs implies unification of all sub-graphs and elements between them. When unification is successful, it returns a map of logic variables and their unified values. If there are no logic variables in the graphs it simply returns an empty map. If unification fails, it returns `False`--at least in the implementation we use.

## Unification

We can perform unification using the function `unify`. The result is a `dict` mapping logic variables to their unified values.

```python
from unification import unify

s = unify(dot_pattern, z_et)
pprint(s)
```

```text
{~A: A,
 ~B: e(
   e(
     aesara.tensor.elemwise.Elemwise,
     <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
     <frozendict {}>),
   x,
   y)}
```

The logic variable `A` has been correctly unified with `A_tt`, while the logic variable `B` has been correctly unified with the addition of `x_tt` and `y_tt`.

## Reification

Using `reify` we can "fill-in"--or replace---the logic variables of our "pattern" with the matches obtained by `unify` that are held within the variable s, or we could specify our own substitutions based on that information.

In the following snipped we simply exchange the `A_tt` tensor with another `X_tt` tensor and create a new graph with that value. The end result is a version of the original graph `z_et`, with the new tensor.

```python
X_tt = at.matrix("X")
s[A_lv] = X_tt

z_et_re = reify(dot_pattern, s)
pprint(z_et_re)
```

```text
e(
  e(aesara.tensor.math.Dot),
  X,
  e(
    e(
      aesara.tensor.elemwise.Elemwise,
      <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
      <frozendict {}>),
    x,
    y))
```

## Finishing our implementation

We can also reify an entirely different graph using the values extracted from the graph `z_et`. In this case, we create an "output" pattern graph, to complement our new "input" pattern graph `dot_pattern`. If we combine our dot product and addition `etuple` patterns, we can extract all the arguments needed as input to a distributed multiplication pattern.

```python
output_pattern = etuple(etuplize(at.add), etuple(etuple(Dot), A_lv, x_lv), etuple(etuple(Dot), B_lv, y_lv))
pprint(output_pattern)
```

```text
e(
  e(
    aesara.tensor.elemwise.Elemwise,
    <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
    <frozendict {}>),
  e(e(aesara.tensor.math.Dot), ~A, ~x),
  e(e(aesara.tensor.math.Dot), ~B, ~y))
```

With logic variables `A_lv`, `x_lv` and `y_lv` mapped to their template-corresponding objects in another graph, we can reify `output_pattern` and obtain a reified version of said graph.

Using the previous unification results contained in `s` we only need to reify `output_pattern` with those mappings. However, since our pattern refers to logic variables `x_lv` and `y_lv` we'll need to unify these logic variables with the appropriate terms in the graph.

```python
s_add = unify(s[B_lv], add_pattern, s)
pprint(s_add)
```

```text
{~A: X,
 ~B: e(
   e(
     aesara.tensor.elemwise.Elemwise,
     <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
     <frozendict {}>),
   x,
   y),
 ~x: x,
 ~y: y}
```

```python
z_new = reify(output_pattern, s_add)
aesara.dprint(z_new.evaled_obj)
```

```text
Elemwise{add,no_inplace} [id A] ''
 |dot [id B] ''
 | |X [id C]
 | |x [id D]
 |InplaceDimShuffle{x} [id E] ''
   |dot [id F] ''
     |Elemwise{add,no_inplace} [id G] ''
     | |x [id D]
     | |y [id H]
     |y [id H]
```

Using only the basics of unification and reification provided by Aesara one can extract specific elements from Aesara graphs and use them to implement mathematical identities/relations. Through clever use of multiple mathematical relations, one can--for example--construct graph **optimizations** that turn large classes of user-defined statistical models into computational tractable reformulations. Similarly, one can construct "normal forms" for models, making it possible to determine whether or not a user-defined model is suitable for a specific sampler.

Next we will introduce another major element of Aesara that orchestrates and simplifies sequences of unifications like we used earlier, provides control-flow-like capabilities, produces fully reified results of arbitrary forms and does so within a genuinely declarative formalism that carries much of the same power of logical programming: [miniKanren](http://minikanren.org/)!

# Relational programming in miniKanren

Aesara uses a Python implementation of the embedded domain-specific language miniKanren--provided by the `kanren` package--to orchestrate more sophisticated uses of unification and reification. For a quick intro, see [the basic introduction](https://github.com/pythological/kanren/blob/master/doc/basic.md) provided by the `kanren` package. We'll cover most of the same basic material here.

To start, miniKanren uses **goals** (in the same sense as [logic programming](https://en.wikipedia.org/wiki/Logic_programming)) to assert relations, and the `run` function evaluates those goals and allows one to specify the exact amount and type of reified output desired from the **states** that satisfy the goals.

In their most basic form, miniKanren **states** are simply the substitution maps returned by unification, which--in the normal course of operations--are not dealt with directly.

## The basic goals

Normally, a user will only need to construct compound goals from a basic set of primitives. Arguably, the most primitive goal is the [equivalence relation](https://en.wikipedia.org/wiki/Equivalence_relation) under unification denoted by `eq` in Python.

In the following code block we ask for all successful results/reifications (signified by the `0` argument) of the logic variable `var('q')` for the goal `eq(var('q'), 1)`, i.e. unify `var('q')` with `1`.

```python
from kanren import run, eq

q_lv = var('q')
mk_res = run(0, q_lv, eq(q_lv, 1))
pprint(mk_res)
```

```text
(1,)
```

Since miniKanren's `run` always returns a stream of results, we obtain a tuple containing the reified values of `q_lv` under the one possible state for which our stated goal successfully evaluates.

The other basic primitives represent conjunction and disjunction of miniKanren goals: `lall` and `lany` respectively.

```python
from kanren import lall

mk_res = run(0, q_lv, lall(eq(q_lv, 1), eq(q_lv, 2)))
pprint(mk_res)
```

We just used `lall` to obtain the conjunction of two unificatoin goals. Since we requested the same logic variable be unified with `1` and `2` simultaneously, which is imposssibe, we got back an empty stream of results--indicating failure.

Goal disjunction, `lany`, will split a state stream accross goals, producing new distrinct states for each:

```python
from kanren import lany

mk_res = run(0, q_lv, lany(eq(q_lv, 1), eq(q_lv, 2)))
pprint(mk_res)
```

The goal disjunction result shows that the logic variable `q_lv` can be unified with either `1` or `2` under the two unification goals.

A common pattern of disjuntion and conjunction is called `conde`, and it mirrors the Lisp function `cond`, which is effectively a type compound `if ... elif ... elif ...`. Specifically, `conde([x_1, ...], ..., [y_1,...])` is the same as `lany(lall(x_1,...), ..., lall(y_1, ...))`-i.e. a disjunction of goal conjunctions.

```python
from kanren import conde

r_lv = var("r")

mk_res = run(
    0,
    [q_lv, r_lv],
    conde(
        [eq(q_lv, 1), eq(r_lv, 10)],
        [eq(q_lv, 2), eq(r_lv, 20)]
    )
)
pprint(mk_res)
```

```text
([1, 10], [2, 20])
```

We introduced another logic variable `r_lv` and requested the reified values of a list containing both logic variables. The output resembles the idea thatif `q_lv` is "equal" to `1`, then `r_lv` is "equal" to `10`, etc. Unlike normal conditionals, each clause/branch isn't exclusive, instead each is realized when the goals in a branch can be successful.

The following code demonstrated when `conde` can behave more like a traditional statement.

```python
mk_res = run(0, [q_lv, r_lv],
             lall(eq(q_lv, 1),
                  conde(
                      [eq(q_lv, 1), eq(r_lv, 10)],
                      [eq(q_lv, 2), eq(r_lv, 20)],
                  )))
pprint(mk_res)
```

```text
([1, 10],)
```

## A better implementation

Since miniKanren uses unification and reification, we can apply its basic goals to Aesara graphs, as we did earlier, and reproduce the entire implementation in a much more concise manner.

```python
mk_res = run(1, output_pattern, eq(dot_pattern, z_et), eq(add_pattern, B_lv))
pprint(mk_res)
```

```text
(e(
   e(
     aesara.tensor.elemwise.Elemwise,
     <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
     <frozendict {}>),
   e(e(aesara.tensor.math.Dot), A, x),
   e(
     e(aesara.tensor.math.Dot),
     e(
       e(
         aesara.tensor.elemwise.Elemwise,
         <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
         <frozendict {}>),
       x,
       y),
     y)),)
```

We obtain an etuple that we can evaluate to get the graph

```python
aesara.dprint(mk_res[0].evaled_obj)
```

```text
Elemwise{add,no_inplace} [id A] ''
 |dot [id B] ''
 | |A [id C]
 | |x [id D]
 |InplaceDimShuffle{x} [id E] ''
   |dot [id F] ''
     |Elemwise{add,no_inplace} [id G] ''
     | |x [id D]
     | |y [id H]
     |y [id H]
```

We did not need to use the conjunction operation `lall` explicitly, because all remaining goal arguments to `run` are automatically applied in conjunction.

Before moving on to the next section and goal construction, let us summarize everything we did in a self-contained exampe:

```python
import aesara
import aesara.tensor as at
from aesara.tensor.math import Dot

from etuples import etuple, etuplize
from kanren import eq, run
from unification import var

from IPython.lib.pretty import pprint

# Define the graph we want to "modify"
A_tt = at.matrix("A")
x_tt = at.vector("x")
y_tt = at.vector("y")
z_tt = at.dot(A_tt, x_tt + y_tt)

z_et = etuplize(z_tt)

# Input patterns and logic variables
x_lv, y_lv = var('x'), var('y')
add_pattern = etuple(etuplize(at.add), x_lv, y_lv)

A_lv, B_lv = var('A'), var('B')
dot_pattern = etuple(etuple(Dot), A_lv, B_lv)

# Output pattern
output_pattern = etuple(etuplize(at.add), etuple(etuple(Dot), A_lv, x_lv), etuple(etuple(Dot), B_lv, y_lv))

# Using miniKanren
mk_res = run(1, output_pattern, eq(dot_pattern, z_et), eq(add_pattern, B_lv))
aesara.dprint(mk_res[0].evaled_obj)
```

```text
Elemwise{add,no_inplace} [id A] ''
 |dot [id B] ''
 | |A [id C]
 | |x [id D]
 |InplaceDimShuffle{x} [id E] ''
   |dot [id F] ''
     |Elemwise{add,no_inplace} [id G] ''
     | |x [id D]
     | |y [id H]
     |y [id H]
```

When combinations of miniKanren goals comprise logical units, we can wrap their construction in functions which we call **goal constructors**.

## Goals Constructors

Using our distributive law example, we can create a goal constructor that creates our combined pattern and applies it in one go.

```python
def distributeo(in_g, out_g):
    """Create a oal that represents commuted matrix multiplicatoin and addition."""
    A_lv, x_lv, y_lv = var(), var(), var()
    dot_pattern = etuple(etuple(Dot), A_lv, etuple(etuplize(at.add), x_lv, y_lv))
    dist_pattern = etuple(etuplize(at.add), etuple(etuple(Dot), A_lv, x_lv), etuple(etuple(Dot), A_lv, y_lv))

    return lall(eq(in_g, dot_pattern), eq(out_g, dist_pattern))
```

Our goal constructor represent the **relation** for distribution of matrix multiplication and addition. In this sense, it can be run **both** ways i.e. it can "expand" a multiplication by distributing it through addition, and it can "contract" it by doing the opposite.

In the following example we "expand" the multiplication:

```python
q_lv = var()
mk_res = run(1, q_lv, distributeo(z_et, q_lv))
z_expanded_et = mk_res[0].evaled_obj
aesara.dprint(z_expanded_et)
```

```text
Elemwise{add,no_inplace} [id A] ''
 |dot [id B] ''
 | |A [id C]
 | |x [id D]
 |dot [id E] ''
   |A [id C]
   |y [id F]
```

And in the following example we "contract" the previously expanded result

```python
q_lv = var()
mk_res = run(1, q_lv, distributeo(q_lv, z_expanded_et))
z_contracted_et = mk_res[0].evaled_obj
aesara.dprint(z_contracted_et)
```

```text
dot [id A] ''
 |A [id B]
 |Elemwise{add,no_inplace} [id C] ''
   |x [id D]
   |y [id E]
```

## Graph-based goals

In most situation the desired graphs will be subgraphs of much larger ones. Aesara introduces some miniKanren goals that apply other goals throughout graphs until a fixed-point is reached. This sequence of operations is generally necessary for graph simplification and rewriting.

In the following example we create a new graph that contains `at.dot(A, x+y)` as a subgraph.

```text
e(
  e(
    aesara.tensor.elemwise.Elemwise,
    <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
    <frozendict {}>),
  e(
    e(
      aesara.tensor.elemwise.Elemwise,
      <aesara.scalar.basic.Mul at 0x7fd9c9f1a560>,
      <frozendict {}>),
    e(
      e(aesara.tensor.elemwise.DimShuffle, (), ('x',), True),
      TensorConstant{2}),
    e(
      e(aesara.tensor.math.Dot),
      A,
      e(
        e(
          aesara.tensor.elemwise.Elemwise,
          <aesara.scalar.basic.Add at 0x7fd9c9f1a440>,
          <frozendict {}>),
        x,
        y))),
  e(
    e(aesara.tensor.elemwise.DimShuffle, (), ('x',), True),
    TensorConstant{1.0}))
```

We define `graph_walko`, a function that walks term graphs and will apply our `distributeo` goal throughout the graph until the applicable subgraph is found (and replaced)

```python
from etuples.core import ExpressionTuple
from kanren.graph import walko
from kanren import eq
from functools import partial

graph_walko = partial(walko, rator_goal=eq)

q_lv = var()
mk_res = run(1, q_lv, graph_walko(distributeo, z_graph_et, q_lv))
aesara.dprint(mk_res[0].evaled_obj)
```

```text
Elemwise{add,no_inplace} [id A] ''
 |Elemwise{mul,no_inplace} [id B] ''
 | |InplaceDimShuffle{x} [id C] ''
 | | |TensorConstant{2} [id D]
 | |Elemwise{add,no_inplace} [id E] ''
 |   |dot [id F] ''
 |   | |A [id G]
 |   | |x [id H]
 |   |dot [id I] ''
 |     |A [id G]
 |     |y [id J]
 |InplaceDimShuffle{x} [id K] ''
   |TensorConstant{1.0} [id L]
```

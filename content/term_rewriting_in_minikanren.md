---
title: "Term rewriting in miniKanren"
date: 2022-08-01
aliases:
  - 9b8fb37a-ea51-46ba-91bb-9dcf7348d093
---

Writing a goal that will apply the following rewrites to an expression:

```
\begin{align*}
x + x &= 2 * x\\
\log \left(\exp(x)\right) &= x
\end{align*}
```
```python
from numbers import Real

from etuples.core import ExpressionTuple, etuple

from kanren import var, conde, lall
from kanren.constraints import isinstanceo

def single_math_reduceo(expanded_term, reduced_term):
    x_lv = var()
    return lall(
        isinstanceo(x_lv, Real),
        isinstanceo(x_lv, ExpressionTuple),
        conde(
            # add(x, x) == mul(2, x)
            [eq(expanded_term, etuple(add, x_lv, x_lv)), eq(reduced_term, etuple(mul, 2, x))],
            # exp(log(x)) == x
            [eq(expanded_term, etuple(log, etuple(exp, x_lv))), eq(reduced_term, x_lv)],
        )
    )
```

*TBD:* What this means exactly

```python
from functools import partial

from kanren import reduceo

math_reduceo = partial(reduceo, single_math_reduceo)
```

*TBD:* This too wtf means

```python
from kanren.graph import walko

math_walko = partial(walko, single_math_reduceo)
```

# Try a simple expansion

We're starting from the expanded expression $3 + 3 + \exp(\log(\exp(5)))$ and will try to get the reduced version:

```python
expanded_term  = etuple(add, etuple(add, 3, 3), euple(exp, etuple(log, etuple(exp, 5))))
reduced_term = var()
```

# References

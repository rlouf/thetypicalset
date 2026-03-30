---
title: "Aesara's Intermediate representation"
aliases:
  - a16e41c1-ba00-4822-ad25-082e6b18c0d7
---

# Requirements

## Graph introspection

### At different levels of abstraction

## Graph rewrites

### At different levels of abstraction

## Automatic differentiation through control flow

Which means breaking from the quasi-static assumption.

## Transpilation to different backends

# Elements of representation

## `Scalar`

## `TensorVariable`

## =Op=`\s`{=latex}

## `OpFromGraph=\s
** =FunctionGraph` {#opfromgraphs-functiongraph}

## Loops

The difficulty of differentiating through loops and the necessity to model them in a better IR is motivated by?

## Conditionals

A motivation for implementation a new control flow IR in Aesara comes from the desire to differentiate through expressions like:

```
\begin{equation*}
    f(x) =
        \begin{cases}
            0 & \text{if}\; x \geq 0\\
            x^2 & \text{otherwise}\\
        \end{cases}
\end{equation*}
```
JAX can already take the gradient of control flow:

```python
import jax

def f(x):
    if x >= 0:
        return 0.
    else:
        return x**2

print(jax.grad(f)(-10.))
```

And so can Aesara:

```python
import aesara.tensor as at
from aesara.ifelse import ifelse

x = at.scalar('x')
y = ifelse(at.gt(x,0), at.as_tensor(0., dtype='float64'), x**2)
y_grad = at.grad(y, wrt=x)

print(y_grad.eval({x: -10.}))
```

What is the fundamental different between `ifelse` and a `phi` node?

# The pitfalls

We need to balance relational programming and differentiation. Note that the papers below complain about "black-box operators", and point at JAX's `while~loop~`. Aesara operators are different though, as they allow us to translate concepts people are used to to a flexible IR. We could achieve the same thing that Julia does by parsing the AST, but providing `switch`, `cond`, `while`, `fori` etc operators is as efficient, if not more in python (parsing the AST is possible but tedious)

- `Scan` requires a fixed number of steps. It can be a variable, but `while` loops should not require such input;
- We need to be able to do relational programming + use e-graphs through control flow;
- We need to be able to differentiate through stuff like ODE solvers.

# References

- "Don't unroll adjoint: differentiating SSA-form programs" ([paper](https://arxiv.org/abs/1810.07951))

  Use a SSA representation to be able to differentiate through control flow.

- "Equality saturation: A new Approach to optimization" ([paper](https://web.archive.org/web/20110614052534id_/http://cseweb.ucsd.edu/~lerner/papers/popl09.pdf))

  Introduces PEG, a SSA intermediate representation that allows to do equality saturation on graphs with control flow. Introduces $\theta$ and $\Phi$ nodes as well as a few other, less fundamental, primitives to represent loops.

- "Useful algorithms that are not optimized by JAX or PyTorch" ([blog post](http://www.stochasticlifestyle.com/useful-algorithms-that-are-not-optimized-by-jax-pytorch-or-tensorflow/))

  > If you pull up your standard methods like convolutional neural networks, that's a fixed function kernel call with a good derivative defined, or a recurrent neural network, that's a fixed size for loop. If you want to break this assumption, you have to go to a space that is fundamentally about an algorithm where you cannot know "the amount of computation" until you know the specific values in the problem, and equation solvers are something of this form.
  >
  > How many steps does it take for Newton's method to converge? How many steps does an adaptive ODE solver take? This is not questions that can be answered a priori: they are fundamentally questions which require knowing:
  >
  > What equation are we solving? What is the initial condition? Over what time span? With what solver tolerance?

  Machine learning framework in Python make quasi-static assumptions about the program, the fact that the size of the loops is fixed. **But** there are non quasi-static problems that are really useful for Machine Learning, like the neural ODE solver in the paper listed below.

- "Opening the Blackbox: Accelerating Neural Differential Equations By Regularizing Internal Solver Heuristics" ([ArXiV](https://arxiv.org/abs/2105.03918))

- "Machine Learning Systems are stuck in a rut" ([paper](https://dl.acm.org/doi/abs/10.1145/3317550.3321441))

  The problem is that current frameworks "work".

  > On the other hand, there is little incentive to build high quality back ends that support other features, because all the front ends currently work in terms of monolithic

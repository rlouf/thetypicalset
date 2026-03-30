---
title: "Shape semantics for random variables in Aesara"
date: 2022-08-17
---

# Random variables in Aesara

Random variables are represented in [[aesara|Aesara]] with the `RandomVariable` operator, which corresponds to the following mathematical function:

$$
\operatorname{RandomVariable}: \Omega \times \Theta \to E
$$

Were $\Omega$ is the set of available RNG seeds, $\Theta$ the parameter space. $E$ is the state space, which roughly corresponds to the support of the corresponding distribution. Given a random seed and parameter values, the operator returns a **realization** of the random variable it represents, i.e. an element of $E$.

The recommended way to use random variables in Aesara is via the `RandomStream` interface, which automatically seeds the random functions. Here, `srng.normal` defines a single, normally-distributed, random variable. Executing the graph returns a random value drawn from the normal distribution:

```python
import aesara.tensor as at

srng = at.random.RandomStream(0)
x_rv = srng.normal(0, 1)
print(x_rv.eval())
```

Here `srng.normal(0,1)` returns a scalar, but the output of `RandomVariable` operators can have more complex shape. The shape is essentially determined by three things:

- The *support shape* of the random variable;
- *Broadcasting rules* between the parameters of the random variable's distribution;
- The `size` parameter passed to the random function.

In this document we will explain the semantics of shapes in Aesara, and what these shapes represent.

# The support shape

The dimensionality of the parameter space and the sample space differ depending on the distribution. For instance, the normal distribution is parametrized by $\mu \in \mathbb{R}$ and $\sigma \in \mathbb{R}^+$ and the realizations of the corresponding random variables are scalars $\in \mathbb{R}$.

```python
import aesara.tensor as at

srng = at.random.RandomStream(0)

mu = 0
sigma = 1
x_rv = srng.normal(mu, sigma)
sample = x_rv.eval()

print(f"sample value: {sample}")
print(f"support shape: {sample.shape}")
```

We say that the support `normal` is 0-dimensional and that the support shape is `()`. The Dirichlet distribution is slightly more complicated: it is parametrized by a vector $\boldsymbol{\alpha} \in \mathbb{R}^k$ and its realizations are vectors in the k-unit simplex $\operatorname{\Delta}^k$:

```python
import aesara.tensor as at

srng = at.random.RandomStream(0)

alpha = [1., 3., 4.]
x_rv = srng.dirichlet(alpha)
sample = x_rv.eval()

print(f"sample value: {sample}")
print(f"support shape: {sample.shape}")
```

The support shape of `dirichlet` is `(k,)`, with `k` the length of its parameter $\alpha$. The multinomial is another interesting example because its parameters have different dimensionalities; it is parametrized by a probability vector $\boldsymbol{p} \in \Delta^k$, a number of trials $n \in \mathbb{N}$ and returns a vector in $\mathbb{N}^k$:

```python
import aesara.tensor as at

srng = at.random.RandomStream(0)

n = 10
p = [.1, .3, .6]
x_rv = srng.multinomial(n, p)
sample = x_rv.eval()

print(f"sample value: {sample}")
print(f"support shape: {sample.shape}")
```

The support shape of `multinomial` is `(k,)` with `k` the length of the probability vector $p$. Here we have only considered random variables with a 0- or 1-dimensional sample space, but it can obviously be more complicated. For instance, the random variable with a [Wishart density](https://en.wikipedia.org/wiki/Wishart_distribution) is a function that maps $\Sigma$ to $\mathbb{R}^{n \times m}$, and the corresponding support shape is thus `(n,m)`. All you have to remember is that *the support shape is the shape of a single element of the state space \$E\$*.

The support shape and how it relates to the shape of the parameters is explicited in [the documentation](https://aesara.readthedocs.io/en/latest/library/tensor/random/basic.html), where we attach a `signature` string to each random variable (these are [gufunc](https://numpy.org/doc/stable/reference/c-api/generalized-ufuncs.html)-like signatures). For instance, for the previous examples we have:

- Normal: `(), () -> ()`
- Dirichlet: `(n) -> (n)`
- Multinomial: `(), (n) -> (n)`

So if you have doubts regarding the support shape of a distribution, check out the *signature*.

# The batch shape

We just saw how to define a single random variable, and how the choice of distribution determined the *support shape*. In many realistic settings, however, we would like to define several independently distributed random variables at once. Aesara provides two mechanisms to do so: broadcasting the parameters, and the `size` argument of the `RandomVariable` operator. The shape induced by this mechanism is called the *batch shape*.

## Batching by broadcasting

Say we want a sample from three independent, normally distributed, random variables with a mean of $0$, $3$ and $5$ respectively. One (cumbersome) way to achieve this is:

```python
import aesara.tensor as at

srng = at.random.RandomStream()
rv_0 = srng.normal(0, 1)
rv_3 = srng.normal(3, 1)
rv_5 = srng.normal(5, 1)
rv = at.stack([rv_0, rv_3, rv_5])

sample = rv.eval()
print(f"sample value: {sample}")
print(f"sample shape: {sample.shape}")
```

To simplify this common operation, we can pass arrays as parameters to Aesara's `RandomVariable`, and the `Op` will use [NumPy broadcasting rules](https://numpy.org/doc/stable/user/basics.broadcasting.html) to return an array of samples from independent random variables:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

mean = np.array([0, 3, 5])
rv = srng.normal(mean, 1)

sample = rv.eval()
print(f"sample values: {sample}")
print(f"sample shape: {sample.shape}")
```

In this case the *batch shape* is also `(3,)`; it is the shape of the tensor that contains samples from random variables that are independently distributed and whose distribution belong to the same family. In other words, `srng.normal(mean, 1)` implicitly represents 3 independent random variables.

We can also use arrays for the standard deviation in this case. Standard broadcasting rules apply to determine the batch shape. For instance, the following fails with a shape mismatch error because the `mean` and `sigma` arrays cannot be broadcasted:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

mean = np.array([0, 3, 5])
sigma = np.array([1, 2])
rv = srng.normal(mean, sigma)

try:
    rv.eval()
except ValueError as err:
    print(err)
```

In the following they are broadcastable, and `np.broadcast(mean, sigma)` gives us the batch shape:

```python
import numpy as np

mean = np.array([0, 3, 5])
sigma = np.array([[1, 2, 7], [4, 2, 8]])
print(np.broadcast(mean, sigma).shape)
```

Indeed:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

mean = np.array([0, 3, 5])
sigma = np.array([[1, 2, 7], [4, 2, 8]])
rv = srng.normal(mean, sigma)

sample = rv.eval()
print(f"sample values: {sample}")
print(f"batch shape: {sample.shape}")
```

The normal distribution is fairly simple since its support is 0-dimensional. Let take thus consider the more complex Dirichlet example:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

alpha = np.array([[1., 2., 4.], [3., 5., 7.]])
rv = srng.dirichlet(alpha)
sample = rv.eval()

print(f"sample values: {sample}")
print(f"sample shape: {sample.shape}")
```

Which is equivalent to:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

rv1 = srng.dirichlet([1., 2., 4.])
rv2 = srng.dirichlet([3., 5., 7.])
rv = at.stack([rv1, rv2])
sample = rv.eval()

print(f"sample values: {sample}")
print(f"sample shape: {sample.shape}")
```

I said *more complex*, but we actually have a very simple formula to determine the samples shape from the support and batch shapes. If `support_shape` and `batch_shape` represent the shape tuples, then:

> sample~shape~ = batch~shape~ + support~shape~

## Using the `size` argument to create identically distributed random variables

We also frequently need to define iiid random variables. We could use the previous broadcasting rules to define 3 normally-distributed random variables with mean 0 and variance 1:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

mean = np.zeros(3)
rv = srng.normal(mean, 1)

sample = rv.eval()
print(f"sample values: {sample}")
print(f"sample shape: {sample.shape}")
```

But there is a shortcut: the `size` argument of the `RandomVariable` operator. In the following code, `size` allows us to define the same 3 random variables as above in a more concise way:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

rv = srng.normal(0, 1, size=3)

sample = rv.eval()
print(f"sample values: {sample}")
print(f"sample shape: {sample.shape}")
```

We can of course do the same thing with the Dirichlet distribution:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

rv = srng.dirichlet([1, 3, 5], size=3)

sample = rv.eval()
print(f"sample values: {sample}")
print(f"sample shape: {sample.shape}")
```

In this simple case (no broadcasting), `size` corresponds to the *batch shape*. `Batch` thus refers indistinctly to identifically distributed or differently distributed random variables.

## Broadcasting and the `size` argument

The story with the `size` argument gets more complicated when the `RandomVariable` operator also needs to broadcast the distribution parameters. But luckily, despite the apparent complexity there is only one simple rule to remember: *the `size` argument to `RandomVariable` represents the batch shape*.

Let us illustrate this rule on an example where parameters are broadcasted and the `size` argument is used:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

mean = np.array([0, 3, 5])
sigma = np.array([1, 2, 3])
rv = srng.normal(mean, sigma, size=(2, 2, 3))

sample = rv.eval()
print(f"sample values: {sample}")
print(f"batch shape: {sample.shape}")
```

The batch shape here is given by `np.broadcast_shapes(np.broadcast(mean, sigma).shape, size)`. What we did here was create `(2, 2)` arrays of identically distributed random variables, one for each of the `3` parametrizations of the probability distribution.

To confirm that `size` only affects the batch shape, let us give an example with the Dirichlet `RandomVariable`:

```python
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

alpha = np.array([[1., 2., 4.], [3., 5., 7.]])
rv = srng.dirichlet(alpha, size=(5,2))
sample = rv.eval()

print(f"sample values: {sample}")
print(f"sample shape: {sample.shape}")
```

The batch shape is indeed given by `np.broadcast_shapes(alpha.shape, size)` (and the support shape is `(3,)`).

# Summary

The shape of random tensors in [[aesara|Aesara]] consists in the composition of two semantically different pieces:

- The **support shape** corresponds to the shape of one element in the state space $E$;
- The **batch shape** corresponds to the shape of the array of independent random variables $X_i: \Omega \to E$ where $i \in \left\{ 1 \dots N\right\}$ that are implicitly created by the `RandomVariable`; These can be identically or differently distributed.
- There are two ways to create independent random variables: via broadcasting of the parameter arrays, or using the `size` argument to `RandomVariable=\s. When specified, the =size` argument must be the batch shape.
- The shape of the array returned by the `RandomVariable` operator is `sample_shape = batch_shape + support_shape`

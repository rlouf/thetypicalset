---
title: "AePPL, discrete mixtures and conditionals"
aliases:
  - c40d2cd2-cd16-4e9c-baab-93e368eb3c0e
---

Let us consider a family of probability distributions $\left\{\mathbb{P}_\mu : \mu \in \mathcal{M} \right\}$ where $\mathcal{M} = \left\{1, \dots, K\right\}$ and $\mathbb{Q}$ a probability distribution on the domain $\mathcal{M}$. A discrete mixture model assumes that the value of a random variable $Y$ can be drawm from one of the $\mathbb{P}_\mu$: at each step we draw one value $m \in \mathcal{M}$ from $\mathbb{Q}$, and then draw from $\mathbb{P}_m$.

We can then write the likelihood of $Y$ conditional on $m$ as:

$$
\mathbb{P}(Y \mid  z) = \mathbb{P}_z(Y)
$$

Many probabilistic programming languages implement mixture via an ad-hoc `Mixture` [distribution object](https://docs.pymc.io/en/v5.0.0/api/distributions/generated/pymc.Mixture.html#pymc.Mixture). In [[aesara|Aesara]]/[[aeppl|AePPL]] mixtures are expressed via the generative process described above, using the following Aesara constructs:

- Indexing an array with a random variable;
- `aesara.tensor.where`;
- `aesara.ifelse.ifelse`.

# Indexing an array

We can define mixture by using a random variable with a discrete support (`Bernoulli`, `Categorical`, etc.) to index an array of random variables:

```python
import aeppl
import aesara
import aesara.tensor as at
import numpy as np

srng = at.random.RandomStream(0)

loc = np.array([-1, 0, 1, 2])
N_rv = srng.normal(loc, 1.)

p = np.array([0.2, 0.3, 0.1, 0.4])
I_rv = srng.categorical(p)

Y_rv = N_rv[I_rv]

sample_fn = aesara.function((), Y_rv)
print(sample_fn())

logprob, (y_vv, i_vv) = aeppl.joint_logprob(Y_rv, I_rv)
logprob_fn = aesara.function((y_vv, i_vv), logprob)
print(logprob_fn(10, 0))
```

# Using `aesara.tensor.where`
We can also define mixtures using `aesara.tensor.where`; the conditional can be based on other random variables:

```python
import aeppl
import aesara
import aesara.tensor as at

srng = at.random.RandomStream(0)

x_rv = srng.normal(0, 1)
y_rv = srng.cauchy(0, 1)
i_rv = srng.normal(0, 2)

Y_rv = at.where(at.ge(i_rv, 1.), x_rv, y_rv)

sample_fn = aesara.function((), Y_rv)
print(sample_fn())

logprob, (y_vv, i_vv) = aeppl.joint_logprob(y_rv, i_rv)
logprob_fn = aesara.function((y_vv, i_vv), logprob)
print(logprob_fn(10, -1.))
```

# TODO Using `aeara.ifelse.ifelse`
We also [soon](https://github.com/aesara-devs/aeppl/pull/169) be able to use `aesara.ifelse` to define mixures in the same way we use `aesara.tensor.where`:

```python
import aeppl
import aesara
import aesata.tensor as at

srng = at.random.RandomStream(0)

x_rv = srng.normal(0, 1)
y_rv = srng.cauchy(0, 1)
i_rv = srng.bernoulli(0.5)

Y_rv = aesara.ifelse(i_rv, x_rv, y_rv)

logprob, (y_vv, i_vv) = aeppl.joint_logprob(Y_rv, i_rv)
```

---
title: "Unify to build samplers"
date: 2022-04-15
---

In the [[identify-horsehoe|last post]] we showed how we can identify a horseshoe prior in an aesara model graph. This exercise may appear very academic at first, but we will show that it has practical applications in this and the following posts. In particular, we will show how unification of models with subgraphs will allow us to automatically build samplers for any model. Here, a Gibbs sampler.

Let us consider a simpler version of the previous model that only contains the horseshoe part:

```python
import aesara.tensor as at

srng = at.random.RandomStream(0)

tau_rv = srng.halfcauchy(1, size=1)
lmbda_rv = srng.halfcauchy(1, size=10)
beta_rv = srng.normal(0, tau_rv * lmbda_rv)
```

The following Gibbs sampler updates the values of $\tau$ and $\lambda$ knowing the value of $\beta$:

```python
from typing import Callable, Tuple

from aesara.tensor.random import RandomStream
from aesara.tensor.var import TensorVariable

def step_horseshoe(srng: RandomStream) -> Callable:
    def step(
        lmbda: TensorVariable,
        tau: TensorVariable,
        beta: TensorVariable,
    ) -> Tuple[TensorVariable, TensorVariable]:
        lmbda_inv = 1.0 / lmbda
        tau_inv = 1.0 / tau

        upsilon_inv = srng.exponential(1 + lmbda_inv)
        zeta_inv = srng.exponential(1 + tau_inv)

        beta2 = beta * beta
        lmbda_inv_new = srng.exponential(upsilon_inv + 0.5 * beta2 * tau_inv)
        tau_inv_new = srng.gamma(
            0.5 * (beta.shape[0] + 1),
            zeta_inv + 0.5 * (beta2 * lmbda_inv_new).sum(),
        )

        return 1.0 / lmbda_inv_new, 1.0 / tau_inv_new

    return step
```

It is possible to provide `step_horseshoe` (and many other samplers) in a sampler library, and rely on the users to wire models and samplers together. However this has many shortcomings:

1.  It is *error-prone*: it would be very simple to import a Gibbs sampler that does **not** sample from this model's posterior distribution and use it anyway;
2.  It is *not efficient*: users probably don't know that such a Gibbs sampler exist, and it is also possible that they don't care. They may thus miss opportunities to work with more efficient samplers.
3.  It makes the user code dependent on the underlying implementation of algorithms, instead of having a single interface with all samplers that does not change from release to release.

Instead, we would like to provide a unified interface--a single function--to which users can pass a model, (a set of) observations and that returns a function that generates samples from the model's posterior distribution. Something akin to [PyMC's "inference button"](https://twiecki.io/blog/2013/08/12/bayesian-glms-1/). In this particular case it is fairly simple, if we call `beta_vv` the observed value for `beta_rv`, we can build a sampler from a model with the following function:

```python
def build_sampler(srng, beta_rv, beta_vv, num_samples):
    lmbda_rv, tau_rv = unify_horseshoe(beta_rv)
    step_fn = step_horseshoe(srng)

    outputs, updates = aesara.scan(
        step_fn,
        outputs_info=(lmbda_rv, tau_rv),
        non_sequences=(beta_vv,),
        n_steps=num_samples,
    )

    return outputs, updates
```

Indeed, we can then compile a sampling function:

```python
import aesara

beta_vv = beta_rv.clone()
num_samples = at.iscalar("num_samples")
outputs, updates = build_sampler(srng, beta_rv, beta_vv, num_samples)

sample_fn = aesara.function((beta_vv, num_samples), outputs, updates=updates)
```

And use it to generate samples from the posterior distribution of $\lambda$ and $\tau$:

```python
import numpy as np
from IPython.lib.pretty import pprint

beta = np.random.normal(size=10)
pprint(sample_fn(beta, 3))
```

This example is trivial. We are only considering a very specific model and a single sampler, but you should get a feel of where things are going. In a realistic setting, with a reasonably well developed library, our matching algorithms will succesfully unify several patterns with possibly overlapping subgraphs. In this example, both $\lambda$ and $\tau$ are continuous variables, so we can sample from their posterior distribution using e.g. the NUTS sampler. We could also the use random walk Rosenbluth-Metropolis-Hastings as a step function. We thus need a data structure that allows us to efficiently store these possibilities as we walk down the graph and efficiently retrieve them to build a sampler for the whole model. More than enough material to cover for the next post.

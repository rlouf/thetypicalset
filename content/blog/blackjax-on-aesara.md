---
title: "Blackjax On Aesara"
---

```python
import aesara.tensor as at

srng = at.random.RandomStream(0)

sigma_rv = srng.normal(1.)
mu_rv = srng.normal(0, 1)
Y_rv = srng.normal(mu_rv, sigma_rv)
```

# Sample prior

Sampling from the prior predictive distribution is a useful tool for debugging. One thus needs this function to be:

- **fast**
- Easy to use
- Easy to customize; is it easy to change the value of a parameter.

```python
import aesara
from aesara.graph.basic import io_toposort
from aesara.tensor.random.op import RandomVariable
import jax

rng_key = jax.random.PRNGKey(3)

def count_model_rvs(rv_out):
    """Count the number of `RandomVariable` in a model"""
    return len([node for node in io_toposort([], [rv_out]) if isinstance(node.op, RandomVariable)])

def split_to_tuple(rng_key, num):
    keys = jax.numpy.split(jax.random.split(rng_key, num), num)
    return tuple([key.squeeze() for key in keys])

def prior_sample(rng_key, num_samples, rv_out):
    """Return prior predictive samples"""
    prior_fn = aesara.function([], Y_rv, mode="JAX").vm.jit_fn
    num_rvs = count_model_rvs(Y_rv)

    def take_one_sample(rng_key):
        keys = [{"jax_state": key} for key in split_to_tuple(rng_key, num_rvs)]
        return prior_fn(*keys)[0]

    return jax.vmap(take_one_sample)(jax.random.split(rng_key, num_samples))
```

```python
samples = prior_sample(rng_key, 10, Y_rv)
samples
```

```python
prior_sampler(Y_rv, mu_rv).run(rng_key, 1000, {a_tt: 1.})
```

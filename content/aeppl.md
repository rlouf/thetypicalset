---
title: "AePPL"
aliases:
  - e18d689a-392a-407a-941a-f0ad2d2dc43e
---

AePPL is a set of tools to build A[e]PPL with [[aesara|Aesara]]. The code is available [on Github](https://github.com/aesara-devs/aeppl). AePPL takes any Aesara graph that contains [[random_variables_in_aesara|random variables]], such as:

```python
import aesara
import aesara.tensor as at

srng = at.random.RandomStream(0)

mu_rv = srng.normal(0, 1)
sigma_rv = srng.halfcauchy(1)
x_rv = srng.normal(mu_rv, sigma_rv)

fn = aesara.function([], [mu_rv, sigma_rv, x_rv])
samples = fn()
print(samples)
```

and constructs graphs that compute the joint log-density:

```python
import aeppl

logprob, (mu_vv, sigma_vv, x_vv) = aeppl.joint_logprob(mu_rv, sigma_rv, x_rv)
fn = aesara.function([mu_vv, sigma_vv, x_vv], logprob)
print(fn(*samples))
```

Or conditional log-densities:

```python
import aeppl

logprobs, (mu_vv, sigma_vv, x_vv) = aeppl.conditional_logprob(mu_rv, sigma_rv, x_rv)
fn = aesara.function([mu_vv, sigma_vv, x_vv], logprobs[x_rv])
print(fn(*samples))
```

AePPL is designed to support every model that is mathematically well-defined, using [[aeppl_s_intermediate_representation|an intermediate representation]] for probabilistic models in terms of probability measures.

AePPL provides support for the following:

- [[aeppl_and_custom_distributions|Custom distributions]]
- [[condition_on_transformed_variables|Transformed variables]]
- [[aeppl_and_convolutions|Convolutions]]
- [[aeppl_and_elements_of_multi_dimensional_random_variables|Elements of multi-dimensional random variables]]
- [[aeppl_and_mixtures|Mixtures]]
- [[aeppl_and_variables_defined_by_a_loop|Variables defined by a loop]]
- [[aeppl_and_marginalization|Marginalization]]
- [[algebra_of_random_variables|Algebra of random variables]]
- [[aeppl_and_stochastic_procresses|Stochastic processes]]
- [[aeppl_and_clipping_rounding|Clipping/rounding random variables]]
- [[aeppl_and_order_statistics|Order statistics]]
- [[remove_the_normalization_constants|Remove the normalization constants]]

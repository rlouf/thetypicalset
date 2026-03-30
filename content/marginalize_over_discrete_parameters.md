---
title: "Marginalize over discrete parameters"
aliases:
  - 630773fc-fe6e-4a2b-a191-2c984c27f963
---

# Design in [[aeppl|AePPL]]

Marginalization is an operation that happens at the level of the *probability density*. First, we could add a `marginalize` function that takes a density and a set of values to marginalize out, and rewrites the density to return its marginalized counterpart:

```python
import aeppl

logprob, (y_vv, i_vv) = aeppl.joint_logprob(Y_rv, i_rv)
marginalized_logprob = aeppl.marginalize(logprob, i_vv)
```

Another solution is to add `marginalize` keyword to `joint_logprob`:

```python
import aeppl

logprob, (y_vv,) = aeppl.joint_logprob(Y_rv, i_rv, marginalize=(i_rv,))
```

What this keyword hides is a function that acts at the *measure* level in AePPL's intermediate representation. The availability of this intermediate representation in `joint_logprob` makes it easier to perform marginalization at this level. The internals of `joint_logprob` would then look like in pseudo-code:

```python
def joint_logprob(*rvs, *, to_marginalize):
    rvs_to_values = aeppl.internals.create_value_variables(rvs)
    measures = aeppl.internals.to_ir(rvs_to_values)
    marginalized_measures = aeppl.internals.marginalize(measures, to_marginalize)
    logdensity = aeppl.internals.disintegrate(marginalized_measures)
```

This makes me think that [[aeppl_s_intermediate_representation_should_be_a_first_class_citizen|AePPL's intermediate representation should be a first-class citizen]].

# Related issues

- <https://github.com/aesara-devs/aeppl/issues/21>

# Different examples of marginalization

## TODO Discrete mixtures
## Switchpoint model

Consider the following example from the [Stan documentation](https://mc-stan.org/docs/2_20/stan-users-guide/change-point-section.html):

```python
import aesara
import aesara.tensor as at

srng = at.random.RandomStream(0)

r_e = at.scalar('r_e')
r_l = at.scalar('r_l')
T = at.iscalar('T')

e_rv = srng.exponential(r_e)
l_rv = srng.exponential(r_l)
s_rv = srng.integers(1, T)

t = at.arange(1, T)
rate = at.where(at.ge(s_rv, t), e_rv, l_rv)
D_rv = srng.poisson(rate)

# Draw from the prior predictive distribution
fn = aesara.function([r_e, r_l, T], D_rv)
print(fn(1., 3., 10))
```

Here we can marginalize over `integers` to ease sampling, and recover the posterior distribution using posterior predictive sampling.

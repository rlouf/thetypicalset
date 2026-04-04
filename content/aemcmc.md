---
title: "AeMCMC"
aliases:
  - 7d019ab6-c3f5-4f63-b689-ece3b88afcc2
---

<https://github.com/aesara-devs/aemcmc>

Based on the intermediate representation built by [[aeppl|AePPL]]:

- Built upon representation in terms of measures
- NUTS as default
- Gibbs samplers
- Closed-form posterior
- [[reversible_jump_mcmc|Reversible jump]]
- Walk the space of equivalent representations of the graph
- Automatic inference
- Specify that we want a specific sampler from
- Specify that we don't want some samplers

```python
import aemcmc
import aesara
import aesara.tensor as at

srng = at.random.RandomStream(0)

X = at.matrix("X")

# [[horsehoe|Horseshoe]] prior for `beta_rv`
tau_rv = srng.halfcauchy(0, 1, name="tau")
lmbda_rv = srng.halfcauchy(0, 1, size=X.shape[1], name="lambda")
beta_rv = srng.normal(0, lmbda_rv * tau_rv, size=X.shape[1], name="beta")

a = at.scalar("a")
b = at.scalar("b")
h_rv = srng.gamma(a, b, name="h")

# Negative-binomial regression
eta = X @ beta_rv
p = at.sigmoid(-eta)
Y_rv = srng.nbinom(h_rv, p, name="Y")

y_vv = Y_rv.clone()
y_vv.name = "y"

sampler, initial_values = aemcmc.construct_sampler({Y_rv: y_vv}, srng)

print(sampler.sample_steps[h_rv])
print(sampler.stages)
```

# Rewrites on the `logprob`

We've discussed this and it should happen, as some people will have bad geometry that's induced by a big function they're using. (see models used by Marcus who wrote the MUSE paper)

# Using copulas

- <https://arxiv.org/pdf/1901.11033.pdf> that references this paper on copulas: <http://www.archiv.stochastik.uni-freiburg.de/homepages/rueschendorf/papers/DistributionalTransform-Tartu.pdf>

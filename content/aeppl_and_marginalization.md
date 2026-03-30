---
title: "AePPL and marginalization"
aliases:
  - 8ab6423e-5ec1-489c-919b-c41b84ee8715
---

In some cases, like for [[aeppl_and_mixtures|mixture models]], we are not interested in the posterior distribution of some discrete random variables:

```python
import aeppl
import aesara
import aesara.tensor as at

srng = at.random.RandomStream(0)

x_rv = srng.normal(0, 1, size=(2,), name="X")
i_rv = srng.bernoulli(0.5, name="I")
y_rv = x_rv[i_rv]

logprob, (y_vv, i_vv) = aeppl.joint_logprob(y_rv, i_rv)

aesara.dprint(logprob)
```

Marginalization is an action that is performed on the logprob. The previous model can be written as:

```
\begin{align*}
\mathbf{X} &\sim \operatorname{Normal}(0, 1)\\
I &\sim \operatorname{Bernoulli}(\pi)\\
Y &= \mathbf{X}[I]
\end{align*}
```
And if we write $\operatorname{dnorm(0,1)}$ and $\operatorname{dbern}(\pi)$ the density functions of $\mathbf{X}$ and $I$ respectively, the marginalized joint density $\operatorname{djoint}$ reads as:

$$
\operatorname{djoint}(x) = \pi \operatorname{dnorm}(0, 1)(x_0) + \left(1 - \pi\right) \operatorname{dnorm}(0, 1)(x_1)
$$

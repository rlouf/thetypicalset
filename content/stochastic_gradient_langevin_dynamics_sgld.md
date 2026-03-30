---
title: "Stochastic gradient Langevin Dynamics (SgLD)"
date: 2022-03-30
lastmod: 2022-03-30
aliases:
  - df151e68-b5ae-4ca2-af58-c2010b879466
---

# Principle and motivation

We use the same solver for the overdamped Langevin dynamics as for the [[metropolis_adjusted_langevin_algorithm|Metropolis-Adjusted Langevin Algorithm]], but we work with an *estimator* $\hat{\nabla} \log \pi$ for the gradient of the log-probability density function instead of the gradient itself. There are two reasons why one would want to do that:

- When the amount of data is huge the full gradient can be very expensive to compute;
- When there is a risk to be stuck in a region of the parameter space that is not representative of the typical set; the algorithm has annealing properties.

The exposition follows [Welling & Teh]. At time $t$ a subset $X_t = \left\{x_{1t}, \dots, x_{nt}\right\}$ of $n$ data items is sampled, a step size $\epsilon_t$ is chosen. The gradient is approximated as:

```latex
\begin{equation*}
  \hat{\nabla} \log \pi(\theta_{t}) = \nabla \log p(\theta_{t}) + \frac{N}{n} \sum_{i} \nabla \log p(x_{it}|\theta_{t})
\end{equation*}
```

So the proposed update using the Langevin dynamics is:

```latex
\begin{align*}
  \theta_{t+1} &= \theta_{t} + \frac{\epsilon_{t}}{2}\;\left(\nabla \log p(\theta_{t}) + \frac{N}{n} \sum_{i} \nabla \log p(x_{it}|\theta_{t})\right) + \xi_{t}\\
  \xi_t &\sim \operatorname{Normal}\left(0, \epsilon_t\right)
\end{align*}
```

*We do not use RMH acceptance/rejection step* (which would require evaluation over the whole dataset).

# Convergence

# References

- Welling & Teh (2011) [Bayesian Learning via Stochastic Gradient Langevin Dynamics](https://www.stats.ox.ac.uk/~teh/research/compstats/WelTeh2011a.pdf)

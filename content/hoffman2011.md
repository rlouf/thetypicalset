---
title: "The No-U-Turn Sampler: Adaptively Setting Path Lengths in Hamiltonian Monte Carlo"
aliases:
  - e87a1c79-4d97-48c5-9c0e-9c4ce6abfc6b
---

HMC requires users to specify two parameters:

1.  A step size $\epsilon$. It is too large the simulation will be inaccurate and lead to poor acceptance rate; too small computation will be wasted.
2.  A number of integration steps $N$. If it is too small, slow mixing; if it is too large the trajectory can loop back to the original point.

# A metric to decide when we've integrated for "long enouh"

NUTS = extension of HMC that eliminates the need to specify a fixed value of $N$. The metric used to tell us when we have simulated the dynamics for long enough is the squared distance between the initial position $\theta$ and current position $\tilde{\theta}$:

```latex
\begin{equation}
  \left(\tilde{\theta} = \theta)^{2}
\end{equation}
```

It derivative is given by:

```latex
\begin{equation}
  \left(\tilde{\theta} - \theta) \dot \tilde{r}
\end{equation}
```

where $\tilde{r}$ is the current momentum. The idea is to run the integrator until the above quantity becomes negative. `\However`{=latex}, this algorithm is not guaranteed to converge./

# The NUTS algorithm

Let $\mathcal{B}$ be the set of states that the integrator traces out during a NUTS iteration, and $\mathcal{C}$ the subset of those states to which we can transition without violating detailed balance.

## Theory

## An algorithm that satisfies the constraints

## A more sophisticated algoritm

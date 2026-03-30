---
title: "Metropolis-Adjusted Langevin Algorithm"
date: 2022-03-29
lastmod: 2022-03-29
aliases:
  - 2b7665c9-e950-4432-b260-9e30b593b375
---

The Metropolis-Adjusted Langevin algorithm updates the position of the chain $\boldsymbol{\theta}_t$ at time $t$ based of the overdamped Langevin diffusion equation:

```latex
\begin{equation}
\mathrm{d} L_t = \mathrm{d} W_t + \frac{1}{2}\;\nabla \log \pi(L_t)\;\mathrm{d}t
\end{equation}
```

Where $W_t$ is the standard Brownian motion. Equation (1) is a continuous time diffusion and we instead use a discrete approximation to this diffusion:

```latex
\begin{equation*}
\theta_{t+1} = \theta_t + \tau\;\nabla \log \pi(\theta_t) + \sqrt{2\, \tau\; \xi
\end{equation*}
```

where

```latex
\begin{equation*}
\xi \sim \operatorname{Normal}(0,\mathbb{I}_k)
\end{equation*}
```

$k$ is the number of dimension of $\boldsymbol{\theta}$, $\tau$ the step size and $\pi$ the probability density. The idea, like with [[hamiltonian_monte_carlo|Hamiltonian Monte Carlo]], is to use information about the gradient of the probability density funtion to produce a "better" proposal.

The dynamics defined by the discretized version of the Langevin dynamics only maintain the invariance of $\pi$ approximately and so we need to perform an accept/reject step accepting $\boldsymbol{\theta}_t$ with probability:

```latex
\begin{equation*}
 \alpha = \min \left\{1, \frac{\pi(\theta_{t+1}) q(\theta_t | \theta_{t+1})}{\pi(\theta_{t}) q(\theta_{t+1} | \theta_{t})} \right\}
\end{equation*}
```

where

```latex
\begin{equation*}
  q\left(\theta_{t+1}|\theta_{t}\right) = \exp\left(-\frac{1}{4\, \tau} || \theta_{t+1} - \theta_t - \tau\;\nabla\log \pi(\theta_t) ||_2\right)
\end{equation*}
```

since

```latex
\begin{equation*}
  \theta_{{t+1}} \sim \operatorname{Normal}\left( \theta_{t} + \frac{\tau}{2}\;\nabla\log \pi(\theta_{t}) \right, \tau\,\mathbb{I}_k)
\end{equation*}
```

# References

- [Wikipedia article](https://en.wikipedia.org/wiki/Metropolis-adjusted_Langevin_algorithm)
- [Exponential Convergence of Langevin Distributions and Their Discrete Approximations](https://sci-hub.hkvisa.net/10.2307/3318418)

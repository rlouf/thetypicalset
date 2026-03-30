---
title: "Gaussian scale mixture"
date: 2022-02-14
lastmod: 2022-02-15
aliases:
  - e878015f-6716-44e8-a79b-6b9fa2cbc89b
---

The probability density function of a *Gaussian scale mixture* random variable $X$ can be written as

```
\begin{equation*}
  \pi_{X}(x|\mu,\sigma^{2}) = \int_{0}^{\infty} \mathcal{N}\left(x|\mu, f(\lambda) \sigma^{2}\right)\,\pi_\lambda(\lambda) \mathrm{d}\lambda
\end{equation*}
```
where $\lambda$ is called the *mixing parameter*, and $f$ is a positive function of the mixing parameter. Different choices of $f$ and $\lambda$ lead to a wide variety of non-gaussian distributions:

# Student t distribution

The [[student_t_distribution|Student t distribution]] can be seen as a gaussian scale mixture with $f(\lambda) = 1 / \lambda$ and $\lambda$ gamma-distributed:

```
\begin{align*}
  X &\sim \operatorname{Normal}(\mu, \frac{\sigma^{2}}{\lambda})\\
  \lambda &\sim \operatorname{Gamma}(\delta/2, \delta/2)
\end{align*}
```
is equivalent to:

```
\begin{equation*}
  X \sim \operatorname{Student}(\delta)
\end{equation*}
```
# References

- (makalic2016)
- (polson2013)
- (andrews1974)

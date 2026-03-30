---
title: "The Negative Binomial distribution"
tags:
  - public
aliases:
  - 273bfd3a-7e6e-4971-b422-048f930ae5b0
---

tags: [[probability_distribution|Probability distribution]]

# Canonical parametrization

The negative binomial distribution is usually introduced as the probability distribution of the number $X$ of failures before the $r$ th success in a Bernoulli process with probability $p\in [0,1]$. It is expressed as:

```latex
\begin{equation}
P(X=x|p, r) = \binom{r+x-1}{x} (1-p)^x\, p^r
\end{equation}
```

However, the negative binomial is rarely used in this canonical context but rather to model count data where there seems to be *overdispersion*, i.e. where $\sigma > \mu$ (unlike the Poisson distribution where they're equal). In this case, it is more convenient to work directly with $\mu$ and $\sigma$.

# Mean-variance parametrization

We can indeed reparametrize the distribution as a function of its mean $\mu$ and variance $\sigma$:

```latex
\begin{equation}
r = \frac{\mu^2}{\sigma^{2}-\mu}
\end{equation}
```

and

```latex
\begin{equation}
  p = \frac{r}{r + \mu}
\end{equation}
```

Viewing $\mu$ and $\sigma$ as parameters means we abandon the combinatorial motivation of the negative binomial to view it as a model for count data. A **very important property** of this parametrization is the link between $\mu$ and the variance:

```latex
\begin{equation}
\sigma^{2} = \mu + \frac{1}{r} \mu^{2}
\end{equation}
```

Most problems people have with negative binomial models come from ignoring this property. This dependence in $\mu^2$ is a rather strong constraint; when it becomes problematic we can use:

- The Skellam distribution
- The Conway-Maxwell-Poisson distribution
- The Generalized Poisson distribution

# As a Poisson-Gamma compound distribution

The negative binomial distribution can also be seen as a Poisson distribution where the rate parameter follows a Gamma distribution (conjugate distribution):

```latex
\begin{align*}
  X &\sim \operatorname{Poisson}(\Lambda)\\
  \Lambda &\sim \operatorname{Gamma}(\alpha, \beta)
\end{align*}
```

Then we can show that the distribution of $X$ is a negative binomial with $r = \alpha$ and $p = 1 / (1 + \beta)$, so that the mean and variance follow:

```latex
\begin{equation}
  \sigma^{2} = \mu + \frac{1}{\alpha}\, \mu^{2}
\end{equation}
```

Which is a nice, less ad-hoc interpretation of the negative binomial with the mean-variance parametrization.

# References

- [John Cook's notes](https://www.johndcook.com/negative_binomial.pdf)
- [PyMC3's implementation documentation](https://docs.pymc.io/api/distributions/discrete.html#pymc3.distributions.discrete.NegativeBinomial)

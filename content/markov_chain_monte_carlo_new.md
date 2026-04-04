---
title: "Markov Chain Monte Carlo"
date: 2022-03-06
lastmod: 2022-04-26
aliases:
  - 5acc4f0f-417e-424f-95a5-1c95e7e822ff
---

We are interested in new sampling algorithms, and more interestingly at methods to calibrate the samplers. This also connects to [[bayesian_deep_learning|Bayesian Deep Learning]] where approximate inference over neural network weights is the key challenge.

# The motivation behind MCMC algorithms

Let us briefly explain where it comes from and the motivations behind it. Let us consider a response variable $\bb{Y}$, feature matrix $X$ and a model with parameter $\boldsymbol{\beta}$ so the likelihood of the data given the model and parameter values is given by

$$
P\left(Y | X, \beta\right)
$$

Given a test point $x_*$ we are usually interested in the distribution over predictions $Y_*$ (a random variable):

$$
P\left(Y_* | Y, X, x_*\right)
$$

Let us a assume we have a function (assumed to be deterministic here) that returns a sample $y_*$ of $Y_*$'s distribution given a value of the set of parameters $\tilde{\beta}$:

$$
y_* = f(\tilde{\beta}, x_*)
$$

Then we get this by marginalizing:

$$
P\left(Y_* | Y, X, x_*\right) = \int P(f\left(x_*, \beta\right)| \beta, x_*) P(\beta|Y, X) \mathrm{d} \beta
$$

where $P(\beta|Y, X)$ is the *posterior distribution* of the model's parameters. This is the integral that we would like to evaluate for all practical purposes. Given $\left\{\tilde{\beta}_1, \dots, \tilde{\beta}_N \right\}$ $N$ samples from the posterior distribution.

(Adrien) - Should look at [Ensemble MCMC](https://arxiv.org/abs/1801.09065).

(Junpeng) - [Delayed rejection sampling](https://arxiv.org/pdf/2110.00610.pdf), [Hamiltonian dynamics with non-newtonian momentum for rapid sampling](https://arxiv.org/pdf/2111.02434.pdf)

# References

- [Monte Carlo integration (Wikipedia)](https://en.wikipedia.org/wiki/Monte_Carlo_integration)
- Andrieu et al [A general perspective on the Metropolis-Hastings kernel](https://arxiv.org/abs/2012.14881) (2020)

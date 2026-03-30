---
title: "Gibbs sampling"
aliases:
  - fb76fc82-2653-4aa7-bb62-cd5ec749531a
---

Gibbs sampling is a family of [[markov_chain_monte_carlo_new|Markov Chain Monte Carlo]] algorithm where we conditionally sample from each parameter while holding the others fixed, successively. It is useful when the joint distribution is difficult to sample from (no closed-form expression, for instance) but where the conditional distribution of each variable is known.

# General principle

Assume that we want to generate $N$ samples $\left\{\tilde{\Theta}^{(n)}\right\}_{n=1 \dots N}$ from the joint distribution $P\left(\theta_1, \dots, \theta_D\right)$. We start with an initial position $\tilde{\Theta}^{(0)}$, and to generate $\tilde{\Theta}}^{i+1}$ we successively draw from the following conditional distributions:

- $\tilde{\theta}^{(i+1)}_1 \sim P(\theta_1\; |\; \theta_2 = \tilde{\theta_2}^{(i)}, \dots, \theta_D = \tilde{\theta_D}^{(i)})$
- $\tilde{\theta}^{(i+1)}_2 \sim P(\theta_2\; |\; \theta_1 = \tilde{\theta_1}^{(i+1)}, \theta_3 = \tilde{\theta_3}^{(i)} \dots, \theta_D = \tilde{\theta_D}^{(i)})$
- $\tilde{\theta}^{(i+1)}_j \sim P(\theta_j\; |\; \theta_1 = \tilde{\theta_1}^{(i+1)}, \dots, \theta_{j-1} = \tilde{\theta}_{j-1}^{(i+1)}, \theta_{j+1} = \tilde{\theta}_{j+1}^{(i)}, \dots, \theta_D = \tilde{\theta_D}^{(i)})$

\*\*Gibbs sampling is a particular case of MCMC where the proposal distribution is the same as the acceptance distribution so we always keep the sample with probability 1\*

# Block Gibbs sampling

Accelerate.

# Using auxiliary variables

It is not uncommon to introduce auxiliary variables to the model to make computations easier. Let us consider the *augmented likelihood* $P(y, \omega | \theta)$, so that the original likelihood:

$$
P(Y, \omega|\theta) = P(Y|\omega, \theta) P(\omega)
$$

This works/is useful iff:

1.  Marginalizing the augmented likelihood returns the original likleihood $\int P(Y, \omega | \theta) \mathrm{d} \omega = \int P(Y|\omega, \theta) P(\omega) \mathrm{d}\omega = P(Y|\theta)$
2.  The prior $P(\theta)$ is conjugate to $P(Y|\omega, \theta)$ so $P(\theta|Y) \propto P(Y | \theta) P(\theta) = \int P(Y|\omega, \theta) P(\omega) P(\theta) \mathrm{d}\omega$

This trick is used to build Gibbs samplers for:

- The Bernoulli logit regression ([[polya_gamma_augmentation|Polya-Gamma augmentation]])
- The Negative Binomial logit regression (Idem)
- The Horsehoe prior (using the [[half_cauchy_distribution|inverse-gamma expansion of the Half-Cauchy distribution]])

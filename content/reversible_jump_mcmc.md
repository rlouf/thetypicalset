---
title: "Reversible-jump MCMC"
lastmod: 2022-04-06
tags:
  - public
aliases:
  - d430d6ab-03e8-4d26-b8c3-a4f8a3128cd7
---

tags: [[markov_chain_monte_carlo_new|Markov Chain Monte Carlo]]

The Reversible-jump Markov Chain Monte Carlo (RJ-MCMC) algorithm is an extension of the Rosenbluth-Metropolis-Hastings algorithm where the number of dimensions of the parameter space is allowed to change.

And example of application (from Green 1995) is

> the multiple changepoint model for Poisson model where the rate is supposed to be piecewise constant but changes an unknown number of times.

# Frameworks

- In Julia the PPL [Gen](https://www.gen.dev/) implements RJ-MCMC
- In Python [AeHMC](https://github.com/aesara-devs/aehmc) plans to implement RJ-MCMC

# References

(green1995)

- [[reversible_jump_markov_chain_monte_carlo_computation_and_bayesian_model_determination|Reversible Jump Markov Chain Monte Carlo Computation and Bayesian Model Determination]] (Green 1995)
- [[involutive_mcmc_a_unifying_framework|Involutive MCMC: a Unifying Framework]]
- [[automating_involutive_mcmc_using_probabilistic_and_differentiable_programming|Automating Involutive MCMC using Probabilistic and Differentiable Programming]]

---
title: "Simulation-based inference"
lastmod: 2022-04-26
aliases:
  - 0eefdc2c-544a-47b7-8e3b-05a3c196d2b3
---


Algorithm based on that intuition from Rubin (?) that drawing samples from the posterior distribution was equivalent to simulate data from the prior predictive distribution and accept or reject the sample based on the distance to the observed data. You need two ingredients:

- A function to measure the *distance* between the simulated data and the sample;
- A threshold $\epsilon$ above which we discard the proposal.

# Algorithms

- Approximate Bayesian Computation n
- Sequential Neural Posterior Estimation from (greenberg2019)
- Sequential Neural Likelihood Estimation (papamakarios2018)
- Sequential Neural Ratio Estimation
  - ALLR (hermans2020)

  - SRE (durkan2020)

    ```latex
    \begin{equation}
      \mathcal{F} = \int_{0}^{\infty} f(x) dx
    \end{equation}
    ```

    ```
    \begin{equation}
      \mathcal{F} = \int_{0}^{\infty} f(x) dx
    \end{equation}
    ```

# References

- [This tweet](https://twitter.com/h_rossman/status/1478635223873167362?s=21) has many references (to expand)

Papers: (cranmer2020, durkan2020, greenberg2019, papamakarios2018, hermans2020, lueckmann2017, papamakarios2018a)

Blog post: (cranmer2020a)

Code:

- [SBI](https://github.com/mackelab/sbi/) a python library (PyTorch) that implements ABS, SNLE, SNPE, SNRE
-

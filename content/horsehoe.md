---
title: "Horsehoe prior"
date: 2022-02-11
lastmod: 2022-02-16
aliases:
  - ee8b237a-fa4a-4265-9b7f-972a3dd9b45f
---

We can define the Horseshoe prior in the general context of a [[gaussian_scale_mixture|gaussian scale mixture]] model :

```
\begin{align*}
  z_i &\sim \operatorname{Normal}(x_i^T\beta,\; \sigma^2\, \omega_i^2)\\
  \sigma^2 &\sim \pi(\sigma^2)\, \mathrm{d}\sigma^2\\
  \omega_i &\sim \pi(\omega_i)\, \mathrm{d}\omega_i\\
  \beta_j &\sim \operatorname{Normal}(0,\; \lambda_j^2\, \tau^2\, \sigma^2)\\
 \lambda_{j}  &\sim \operatorname{C}^{+}(0, 1)\\
 \tau &\sim \operatorname{C}^+(0,1)\\
\end{align*}
```
It is characterized by the global ($\tau$) and local ($\lambda_j$) *shrinkage parameters* that follow a half-Cauchy distribution.

# How does it work?

# Sampling

We can use the fact that the [[half_cauchy_distribution|Half-Cauchy distribution]] can be written as the mixture of two [[inverse_gamma_distribution|inverse-gamma distribution]]s to write the conditional posterior distributions for the local shrinkage parameters.

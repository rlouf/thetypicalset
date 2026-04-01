---
title: "Half-Cauchy distribution"
date: 2022-02-14
lastmod: 2022-08-31
aliases:
  - 45ccc897-f07c-4adc-9142-9ae8870fbddc
---


The half-Cauchy is defined on $R^+$ and is [[cauchy_distribution|Cauchy distributed]] on this domain. It can also be interpreted as a mixture of inverse gamma distributions[]]. In other words:

```
\begin{equation*}
  X \sim \operatorname{C}^{+}(0, a)
\end{equation*}
```
is equivalent to

```
\begin{align*}
  X^{2} &\sim  \operatorname{InverseGamma}(1/2,\, 1/\xi)\\
  \xi &\sim \operatorname{InverseGamme}(1/2,\, 1/a^2)
\end{align*}
```
# References

- High-Dimensional Bayesian Regularised Regression with the BayesReg Package ([ArXiv](https://arxiv.org/abs/1611.06649))

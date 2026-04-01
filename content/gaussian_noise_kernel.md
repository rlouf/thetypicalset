---
title: "Ornstein-Uhlenbeck kernel"
aliases:
  - 1a08425d-1fa8-4f9f-98d0-423b0d5c0991
---

The Laplacian function kernel defines a stationary [[gaussian_process|gaussian process]], the Ornstein-Uhlenbeck process:

```latex
\begin{align*}
\displaystyle
K(x, x') &= \sigma^2\,\exp\left(-\frac{|d|}{l}\right),\quad d=x'-x
\end{align*}
```

Unlike the [[wiener_kernel|Wiener process]], this process is *mean reverting* and admits a stationary probability distribution. It is convenient to model *time-series*. It can be seen as a *noisy relaxation model*. ((rasmussen2003) p.212)

The parameter $l$ is the characteristic lengthscale of the process. As one can see on the figure below, the larger the value of $l$ the "further" the kernel takes non-negligible values.

![[img/kernel-ornstein-heatmap.png]]

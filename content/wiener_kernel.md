---
title: "Wiener kernel"
tags:
  - inprogress
  - public
aliases:
  - dc211cf2-78b4-4269-91e8-fc88fb49def5
---

The Wiener kernel defines a non-stationary [[gaussian_process|gaussian process]], the Wiener process:

```latex
\begin{equation*}
\displaystyle
K(x, x') = \min(x, x')
\end{equation*}
```

It is convenient to model *time-series*. It is the limit as $n \rightarrow \infty$ of a random walk of length $n$ ((rasmussen2003) p213). An interesting variant is the *brownian bridge* obtained by conditioning $X(t_0)=0$ ((grimmett2020) p534).

The parameter $l$ is the characteristic lengthscale of the process. As one can see on the figure below, the larger the value of $l$ the "further" the kernel takes non-negligible values.

[file:]()

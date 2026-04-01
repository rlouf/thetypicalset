---
title: "Periodic kernel"
aliases:
  - 29e2f739-8736-4189-9e36-a706fd5ec574
---

The periodic kernel is an important prior when we're trying to model periodic functions with the gaussian process:

```latex
\begin{equation}
 K(x, x') = \sigma^{2}  \, \exp\left(-\frac{2}{l^{2}} \sin^{2}\left(\pi \frac{|x-x'|}{p}\right)\right)
\end{equation}
```

Where $\sigma^2$ is the *amplitude*, $l$ the *lengthscale* and $p$ the *period*.

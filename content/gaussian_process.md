---
title: "Gaussian process"
tags:
  - inprogress
  - machine_learning
  - statistics
  - public
aliases:
  - f2d80a0e-47f7-4531-a654-8343c72dd962
---

tags: [[probability_distribution|Probability distribution]]

We have the follow impractical definition:

> A Gaussian process is a collection of random variables, any finite number of which have consistent Gaussian distributions.

It is completely defined by its mean function $m(x)$ and covariance function $\Sigma(x, x')$. We write:

```latex
\begin{equation}
  f(x) \sim \mathcal{G}\left(m(x), \Sigma(x, x')\right)
\end{equation}
```

A very import special case of Gaussian processes is [[gaussian_markov_processes|Gaussian Markov processes]]

# Kernels

We often express the covariance function $\Sigma(x, x')$ as a function of a *kernel* $K(x,x')$):

```latex
\begin{align*}
\displaystyle
 \Sigma(x,x') = K(x, x') + \;\mathbb{I}
\end{align*}
```

- [[squared_exponential_kernel|Squared exponential kernel]]
- [[gaussian_noise_kernel|Ornstein-Uhlenbeck kernel]]
- [[wiener_kernel|Wiener kernel]]
- [[periodic_kernel|Periodic kernel]]

We can combine kernels. The [[combine_kernels_by_multiplication|multiplication]] of two covariance functions is a valid covariance functions, the [[combine_kernels_by_addition|addition]] of two correlation functions is a correlation function.

## References

- The Kernel Cookbook ([David Duvenaud's website](https://www.cs.toronto.edu/~duvenaud/cookbook/))
- Structure Discovery in Nonparametric Regression Through Compositional Search ([ArXiV](https://arxiv.org/abs/1302.4922))
- Gaussian Processes for Machine Learning, Chapter 4: Covariance Functions ([pdf](http://gaussianprocess.org/gpml/chapters/RW4.pdf))
- Kernel Design ([slides of Nicolas Durrande's talk](http://gpss.cc/gpss15/talks/KernelDesign.pdf))

# Sample

- How to [[sample_from_a_gaussian_process_predictive_distribution|Sample from a Gaussian Process predictive distribution]]
- Practical implementation of Gaussian Process Regression ([Gregory Undersen's blog](https://gregorygundersen.com/blog/2019/09/12/practical-gp-regression/))
- Gaussian Processes for Machine Learning, Chapter 2: Regression ([pdf](https://gaussianprocess.org/gpml/chapters/RW2.pdf))

# Learn

- [Visual exploration of gaussian processes](https://distill.pub/2019/visual-exploration-gaussian-processes/) is a very good introduction
- [Gaussian Process, not quite for dummies](https://yugeten.github.io/posts/2019/09/GP/) is excellent, starts from gaussians to gaussian in high dimensions to get to gaussian process. One of the best things I've read on the topic.
- (rasmussen2003) is a useful reference, but more advanced

# Use

Here is a list of libraries implementating different flavors of Gaussian processes. The catch is that gaussian processes can quick get computation-intensive.

- [BayesNewton](https://github.com/AaltoML/BayesNewton) is written in JAX
- [GPytorch](https://gpytorch.ai/) is built atop the Pytorch autodiff framework
- PyMC3 also has an [implementation of gaussian processes](https://docs.pymc.io/en/v3/Gaussian_Processes.html)

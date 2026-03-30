---
title: "Automatic model selection with Aesara rewrites"
aliases:
  - b49b4614-0d4a-4863-8d85-0ea339ffae3d
---

tags: [[aesara|Aesara]]

Using rewrites we can produce many versions of the same model very easily in Aesara. For instance we could automatically look for the kernel of a [[gaussian_process|Gaussian process]], change the structure of neural networks, etc. In deep learning this called [[neural_architecture_search|Neural Architecture Search]]. [[rewrites_implement_facts|Rewrites implement facts]].

We need to find a simple example.

- Vanilla Gaussian Process ([[gpae|GPae]])
- Simples neural network architecture ([[kaeras|Kaeras]])

<!-- -->

- Neural Architecture Search with Reinforcement Learning ([ArxiV](https://arxiv.org/abs/1611.01578))
- Structure Discovery in Nonparametric Regression Through Compositional Search ([ArXiv](https://arxiv.org/abs/1302.4922))

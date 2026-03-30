---
title: "An API is good when you do not think about it"
date: 2022-01-11
lastmod: 2022-01-11
aliases:
  - 1eb7d036-0133-496e-97de-ae4b92793b89
---

You should always [[implement_what_is_conceptually_correct|Implement what is conceptually correct]] first. Once that is done you should implement the user-interface with *predictability* in mind. To do this you always need to ask yourself: "is that behavior surprising?" "what intent are these names conveying?".

An API is an artifical language on top of an artificial language (the one with which it is implemented), and should come as close as possible to a human language. So interacting with your code activates the more or less the same neural pathways as the ones you use when thinking about the problem.

Sometimes the API will match exactly the problem space, but sometimes predictability will come from *re-using idioms that people are used to.* For instance JAX took off quickly because it made the right call by copying the `numpy` user interface: one just had to replace `numpy as np` with `jax.numpy as jnp` to get the same operations on `DeviceArray` that one has on `ndarray`.

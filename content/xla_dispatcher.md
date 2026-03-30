---
title: "XLA dispatcher"
aliases:
  - 01519e41-9935-4e07-8e10-aee7ffcceade
---

# Looping primitives

## [While](https://www.tensorflow.org/xla/operation_semantics#while)

- The shape of the init parameter must be statically determined and remain fixed during iterations.
- Result is initialized with the `init` parameter, and updated at each iteration of the body. If condition not met at the first iteration, returns `init`.

## [Reduce](https://www.tensorflow.org/xla/operation_semantics#reduce)

## [ReduceWindow](https://www.tensorflow.org/xla/operation_semantics#reducewindow)

## [Map](https://www.tensorflow.org/xla/operation_semantics#map)

# Shapes

There does not seem to be dynamic shapes planned in XLA. But [this in JAX](https://github.com/google/jax/blob/0400db959be865b3ca312ca3355824f0706723c7/jax/_src/config.py#L860). Must be a special kind of dynamic shape, i.e. that can be determined at tracing time.

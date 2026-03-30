---
title: "JAX dispatcher"
aliases:
  - 4d182c43-b24c-4669-ad4a-1b7c79b6798b
---

# Static arguments

## Where they are needed

- `shape` parameters
- Scan's `length` parameter

# Hashable static arguments to JIT compiled function

i.e. no list, numpy array.

# TypeError: Shape

Related issues:

- <https://github.com/aesara-devs/aesara/issues/702>

There are two underlying issues:

- JAX needs shapes to be determined at tracing time.

- Random variables need size specified as tuples (see [docstring of the dirichlet distribution](https://jax.readthedocs.io/en/latest/_autosummary/jax.random.dirichlet.html#jax.random.dirichlet))

  Let's reproduce the example exactly:

  ```python
  import jax

  shape = jax.numpy.array([1000])

  def jax_funcified(prng_key):
      return jax.random.normal(prng_key, shape)

  key = jax.random.PRNGKey(0)
  try:
      jax.jit(jax_funcified)(key)
  except Exception as e:
      print(e)
  ```

  ```
  #+RESULTS:
  ```
  ```text
  Shapes must be 1D sequences of concrete values of integer type, got (Traced<ShapedArray(int32[])>with<DynamicJaxprTrace(level=0/1)>,).
  If using `jit`, try using `static_argnums` or applying `jit` to smaller subfunctions.
  ```

  ```python
  import jax
  import numpy as np

  shape = np.array([10])

  def jax_funcified(prng_key):
      return jax.random.normal(prng_key, shape)

  key = jax.random.PRNGKey(0)
  print(jax.jit(jax_funcified)(key))
  ```

  ```
  #+RESULTS:
  ```
  ```text
  [-0.3721109   0.26423115 -0.18252768 -0.7368197  -0.44030377 -0.1521442
   -0.67135346 -0.5908641   0.73168886  0.5673026 ]
  ```

  ```python
  import jax
  import numpy as np

  rng_key = jax.random.PRNGKey(0)
  try:
      print(jax.random.normal(rng_key, shape=10))
  except Exception as e:
      print(e)
  print(jax.random.normal(rng_key, shape=[3]))
  print(jax.random.normal(rng_key, shape=(3,)))
  print(jax.random.normal(rng_key, shape=np.array([3])))
  print(jax.random.normal(rng_key, shape=jax.numpy.array([3])))

  ```

  ```
  #+RESULTS:
  ```
  ```text
  jax.core.NamedShape() argument after * must be an iterable, not int
  [ 1.8160863  -0.48262316  0.33988908]
  [ 1.8160863  -0.48262316  0.33988908]
  [ 1.8160863  -0.48262316  0.33988908]
  [ 1.8160863  -0.48262316  0.33988908]
  ```

  ```python
  import jax

  def fun(x):
      rng_key = jax.random.PRNGKey(0)
      return jax.random.normal(rng_key, shape=x)

  try:
      jax.jit(fun)(1)
  except Exception as e:
      print(f"shape as int: {e}")

  try:
      jax.jit(fun)([1, 2])
  except Exception as e:
      print(f"shape as list: {e}")

  try:
      jax.jit(fun)((1, 2))
  except Exception as e:
      print(f"shape as tuple: {e}")

  # using static_argnums
  res = jax.jit(fun, static_argnums=(0,))((1, 2))
  print(f"shape as tuple (static argnum): {res}")

  try:
      res = jax.jit(fun, static_argnums=(0,))([1, 2])
  except Exception as e:
      print(f"shape as list (static_argnums): {e}")
  ```

  ```
  #+RESULTS:
  ```
  ```text
  shape as int: iteration over a 0-d array
  shape as list: Shapes must be 1D sequences of concrete values of integer type, got (Traced<ShapedArray(int32[], weak_type=True)>with<DynamicJaxprTrace(level=0/1)>, Traced<ShapedArray(int32[], weak_type=True)>with<DynamicJaxprTrace(level=0/1)>).
  If using `jit`, try using `static_argnums` or applying `jit` to smaller subfunctions.
  shape as tuple: Shapes must be 1D sequences of concrete values of integer type, got (Traced<ShapedArray(int32[], weak_type=True)>with<DynamicJaxprTrace(level=0/1)>, Traced<ShapedArray(int32[], weak_type=True)>with<DynamicJaxprTrace(level=0/1)>).
  If using `jit`, try using `static_argnums` or applying `jit` to smaller subfunctions.
  shape as tuple (static argnum): [[-0.78476596  0.85644484]]
  shape as list (static_argnums): Non-hashable static arguments are not supported. An error occurred during a call to 'fun' while trying to hash an object of type <class 'list'>, [1, 2]. The error was:
  TypeError: unhashable type: 'list'

  ```

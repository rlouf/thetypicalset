---
title: "Shared variables"
aliases:
  - eb1ede04-0bef-49ac-99dd-a050375d287b
---

The documentation defines shared variables as variables that "may be shared between different functions". Well it turns out they have a much deeper meaning that was not explicited in `Aesara`, and was not made obvious by this name. Let's explore what `shared` variables are, what they can be used for, where they occur in the library and where they make things difficult.

Example taken from [the documentation](https://aesara.readthedocs.io/en/latest/tutorial/examples.html?highlight=shared#using-shared-variables):

```python
from aesara import function, shared
import aesara.tensor as at

state = shared(0)
inc = at.iscalar('inc')
accumulate = function([inc], state, updates=[(state, state+inc)])

print(state.get_value())
accumulate(1)
print(state.get_value())
accumulate(10)
print(state.get_value())
state.set_value(0)
print(state.get_value())

decrement = function([inc], state, updates=[(state, state-inc)])

decrement(1)
print(state.get_value())
```

`shared` variables are not completely symbolic as they carry some internal state. They interact with the graph in two ways:

1.  `get_value` gets the current value of the variable, stored in a container.
2.  `set_value` sets the value of the shared variable for *all* the functions it is used in.

They also allow sharing state between compiled graphs.

`updates` parameter in `function` tells the compiler that when the function is going to be run the value of the shared variable is going to be modified in X way. They are necessary because the value of the shared variables needs to be propagated globally?

## TODO Conceptual understanding: what is a shared variable? Why is it not a Variable?
**Variables are placeholders, mere step in a computation. They are variables in the mathematical sense. Shared variables are variables in the computing sense: a value store.** The problem is that shared variables introduce a notion of [[control_flow_in_aesara|imperative programming]] (namely "update this register in memory with this value"). Shared variables allow us to:

- Interact with our graphs once they've been computed;
- Link different compiled graphs;
- SOmething with `scan`.

We can read the following `aesara.function`'s docstring:

> 1.  RemoveShared: shared variables are just an abstraction to make things more convenient for the user. The shared variables are
>
> transformed into implicit inputs and implicit outputs. The optimizations don't see which variables are shared or not.

## TODO How does `scan` work with updates?
Well, `scan` returns a graph that says how the shared variable within should be treated.

```python
import aesara

a = aesara.shared(1)
values, updates = aesara.scan(lambda: {a: a+1}, n_steps=10)
aesara.dprint(updates[a])
```

```python
b = a + 1
c = updates[a] + 1
f = aesara.function([], [b, c], updates=updates)
```

It has an interesting behavior. If we run the function we get something expected:

```python
f()
```

`b` is the original value, plus one. `c` includes the increments that we built by `scan`. If we run the function again we see that `a` value was incremented by 10:

```python
f()
```

What if we don't pass the `updates` to the function?

```python
from aesara import function, shared

a = shared(1)
values, updates = aesara.scan(lambda: {a: a+1}, n_steps=10)
b = a + 1
c = updates[a] + 1
f = aesara.function([], [b, c])
print(f())
print(f())
```

The updates were not *applied* to the shared variable. What passing the updates to the function means is "also update the shared variables' value". Does it otherwise? Let's take a simple example:

```python

a = shared(0)
a = a + 1
fn = aesara.function([], a)
print(fn())
print(fn())
aesara.dprint(a)
```

So `Variables` are placeholders, they're not variables in the sense of the host language (python) as they don't store any value. `SharedVariables` however *are* variables in the sense of the host language; we can modify them in the host process runtime, or in the *graph* runtime using the `updates` kwarg in the function.

## TODO What happens to shared variables when the graph is copied?
If the updates still refer to the original shared variables then nothing is going to happen; so using `aesara.graph.basic.clone_get_equiv` and passing the origin updates will likely lead to buggy code since the original updates won't be applied to the cloned variable.

Instead we need to use functions like `aesara.compile.function.pfunc.rebuild_collec_shared` to also get the updated updates.

## TODO Why do we use `shared` variables for the `RandomStream`?
## TODO Shared variables don't have a sense of scope (give example)
# References

- [`shared` in the Aesara documentation](https://aesara.readthedocs.io/en/latest/library/compile/shared.html?highlight=shared#module-aesara.compile.sharedvalue)
- [Implementation on github](https://github.com/aesara-devs/aesara/blob/8763981ca4263e153c68e6be39c03a272c027b60/aesara/compile/sharedvalue.py#L34-L221)

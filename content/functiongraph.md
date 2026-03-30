---
title: "FunctionGraph"
aliases:
  - b148e4a3-d325-4e77-a609-e8dc913286b7
---

# TODO How do we initialize a `FunctionGraph`?
# TODO What does a `FunctionGraph` do that a variable given by a `TensorVariable` does not?
# TODO What are `Features`?
# TODO What functionalities of `FunctionGraphs` are needed where?
Need to draw a map of where the different `FunctionGraph` functionalities could be used.

# Misc

From the documentation:

> A `FunctionGraph` represents a subgraph bound by a set of input variables and a set of output variables, ie a subgraph that specifies an Aesara function. The inputs list should contain all the inputs on which the outputs depend. `Variable``\s`{=latex} of type `Constant` are not counted as inputs.
>
> The `FunctionGraph` supports the replace operation which allows to replace a variable in the subgraph by another, e.g. replace ``(x + x).out`` by ``(2 \* x).out``. This is the basis for optimization in Aesara.
>
> This class is also responsible for verifying that a graph is valid (ie, all the dtypes and broadcast patterns are compatible with the way the `Variable``\s`{=latex} are used) and for tracking the `Variable``\s`{=latex} with a :attr:`FunctionGraph.clients` ``dict`` that specifies which `Apply` nodes use the `Variable`. The :attr:`FunctionGraph.clients` field, combined with the :attr:`Variable.owner` and each :attr:`Apply.inputs`, allows the graph to be traversed in both directions.
>
> It can also be extended with new features using :meth:`FunctionGraph.attach~feature~`. See `Feature` for event types and documentation. Extra features allow the `FunctionGraph` to verify new properties of a graph as it is optimized.

What I am wondering is: when is a `FunctionGraph` needed? When does it become cumbersome?

```python
import aesara
from aesara.graph.fg import FunctionGraph
import aesara.tensor as at

x = at.vector('x')
z = at.log(at.exp(x + x)) + x + x

fg = FunctionGraph(outputs=[z])

aesara.dprint(fg)
```

```python
print(fg.clients)
```

# TODO What is the `clients` dictionary used for?
It looks like this is what allows to traverse the graph?

# TODO Keep track of where a `FunctionGraph` is necessary, where it is produced, where it is cloned, etc.

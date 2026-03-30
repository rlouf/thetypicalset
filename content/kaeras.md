---
title: "AeNN"
aliases:
  - ee2b16f2-0d64-4172-90bb-fa3f6dab3eac
---

AeNN would be a deep-learning API that sits on top of Aesara. It is inspired by [Keras](https://keras.io) (which used to be built on top of Theano), Flax (NN library built with JAX), and of course [Lasagne](https://github.com/Lasagne/Lasagne). It would make full use of Aesara's graph and rewrite capabilities.

# Inspiration

A minimum viable library could be to be able to reproduce [Keras' documentation](https://keras.io/) examples. For instance the MNIST convnet:

```python
model = keras.Sequential(
    [
        keras.Input(shape=input_shape),
        layers.Conv2D(32, kernel_size=(3, 3), activation="relu"),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Conv2D(64, kernel_size=(3, 3), activation="relu"),
        layers.MaxPooling2D(pool_size=(2, 2)),
        layers.Flatten(),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation="softmax"),
    ]
)
```

I find Keras' API to be sometimes too high-level. In particular, I am not a big fan of the activation being a property of layers, and passed as a keyword argument. Activation functions are just functions, and we should allow users to use custom operators. [Flax](https://github.com/google/flax)'s API is more on point with that respect. I also like the `flax.linen.Module` interface to define blocks a lot:

```python
import flax.linen as nn

class CNN(nn.Module):
  @nn.compact
  def __call__(self, x):
    x = nn.Conv(features=32, kernel_size=(3, 3))(x)
    x = nn.relu(x)
    x = nn.avg_pool(x, window_shape=(2, 2), strides=(2, 2))
    x = nn.Conv(features=64, kernel_size=(3, 3))(x)
    x = nn.relu(x)
    x = nn.avg_pool(x, window_shape=(2, 2), strides=(2, 2))
    x = x.reshape((x.shape[0], -1))  # flatten
    x = nn.Dense(features=256)(x)
    x = nn.relu(x)
    x = nn.Dense(features=10)(x)
    x = nn.log_softmax(x)
    return x

model = CNN()
batch = jnp.ones((32, 10))
variables = model.init(jax.random.PRNGKey(0), batch)
output = model.apply(variables, batch)
```

# Building a simple MLP model

Let's take and try to reproduce a simpler example, the MLP example taken from the Flax documentation:

```python
from typing import Sequence
import flax.linen as nn

class MLP(nn.Module):
    features: Sequence[int]
    @nn.compact
    def __call__(self, x):
        for feature in features[:-1]:
            x = nn.Dense(feature)(x)
            x = nn.relu(x)
        x = nn.Dense(features[-1])(x)
        return x
```

## Activation Function

The first approach to implementing the activation function $\operatorname{Relu}$ is to define it as a function:

```python
import aesara.tensor as at

def relu(x):
    """Rectified linear unit activation function.

    .. math::

        \operatorname{relu}(x) = \max(0, x)

    """
    return at.max(0, x)
```

However, we need the gradient at $0$ to be:

$$
\nabla \operatorname{Relu}(0) = 0
$$

So `relu` will need to be implemented as an `OpFromGraph`, with a custom gradient. The upside of using `OpFromGraph` in this case is that the =Op=`\s`{=latex} it builds are directly identifiable in the graph.

## Dense layer

Layers are best implemented as =OpFromGraph=s for several reasons:

1.  We can target layers with rewrites; This can be useful for AutoML, or optimization at the mathematical level.
2.  We can retrieve the layer's parameters by walking the graph and looking at the inputs of `Apply` nodes whose `Op` is of `Layer` type. We can even add type parameters to indicate which are trainable, regularizable, etc.
3.  `aesara.dprint` shows the graph structure directly.

```python
from typing import Optional

import aesara
import aesara.tensor as at
from aesara.tensor.var import TensorVariable
from aesara.compile.builders import OpFromGraph

class Layer(OpFromGraph):
    """Represents a Layer.

    The difference between layers and transformations is that the former
    hold (potentially trainable) parameter values.
    """

class DenseLayer(Layer):
    """`Op` that represents a Dense Layer"""

class Dense():

    def __init__(self, features: int, W: Optional[TensorVariable], b: Optional[TensorVariable]):
        self.features = features
        self.W = W
        self.b = b

    def __call__(self, x):
        output = at.dot(x, self.W) + self.b
        dense = DenseLayer([x, self.W, self.b], [output])
        return dense(x, self.W, self.b)

x = at.matrix("X")
W = at.vector("W")
b = at.scalar("b")

out = Dense(x.shape[1], W, b)(x)

aesara.dprint(out)
# DenseLayer{inline=False} [id A]
#  |X [id B]
#  |W [id C]
#  |b [id D]
#
# DenseLayer{inline=False} [id A]
#  >Elemwise{add,no_inplace} [id E]
#  > |dot [id F]
#  > | |*0-<TensorType(float64, (None, None))> [id G]
#  > | |*1-<TensorType(float64, (None,))> [id H]
#  > |InplaceDimShuffle{x} [id I]
#  >   |*2-<TensorType(float64, ())> [id J]

assert isinstance(out.owner.op, Layer)
print(out.owner.inputs)
# [X, W, b]
```

Representing layers as `Ops` has several advantages:

1.  More readable `aesara.dprint` outputs;
2.  Parameters can be directly recovered by walking the graphs;
3.  Layers can be targetted by rewrites, which opens possibilities for optimizations and also AutoML (we can replace layers);
4.  We can have layer-specific rules for transpilation. XLA has convolution-specific Ops.

## Management of parameters

Neural network libraries typically initialize the parameters for the users, and they provide them with a way to access their values.

### Lasagne

```python
import aesara.tensor as at
from lasagne.layers import InputLayer, DenseLayer, get_all_params, get_output
from lasagne.updates import nesterov_momentum
from lasagme.objectives import categorical_crossentropy

x = at.matrix('x')
y = at.matrix('y')

l_in = InputLayer((100, 20), x)
l1 = DenseLayer(l_in, num_units=50)
l2 = DenseLayer(l1, num_units=30)

# compue loss
prediction = get_output(l2)
loss = categorical_crossentropy(prediction, y)

# get parameter updates
all_params = get_all_params(l2)
assert all_params ==[l1.W, l1.b, l2.W, l2.b]

updates = nesterov_momentum(loss, params, learning_rate=0.01, momentum=0.9)
```

### Flax

```python
from typing import Sequence

import numpy as np
import jax
import jax.numpy as jnp
import flax.linen as nn

class MLP(nn.Module):
  features: Sequence[int]

  @nn.compact
  def __call__(self, x):
    for feat in self.features[:-1]:
      x = nn.relu(nn.Dense(feat)(x))
    x = nn.Dense(self.features[-1])(x)
    return x

model = MLP([12, 8, 4])
batch = jnp.ones((32, 10))

# Get the parameter values
variables = model.init(jax.random.PRNGKey(0), batch)

# Get model prediction
output = model.apply(variables, batch)
```

## Equinox

Equinox uses the `model(x)` and `equinox.update(model, updates)` pattern (where `updates` are gradient updates) to avoid having to deal with parameters explicitly

```python
linear = equinox.nn.Linear(in_features, out_features)
```

## AeNN

A few notes:

- Only the number of units need be specified
- In some situations (BNN) we'd like to specify the units themselves

```python
import aenn as nn

# multiple dispatch
x = nn.Dense(50)(x)
x = nn.Dense(W, b)(x)

# Lasagne currently does this
x = nn.Dense(50, W, b)(x)
```

```python
import flax.linen as nn

x = nn.Dense(50, bias=False)
```

```python
class Dense():

    __init__ = MethodDispatcher('f')

    @__init__.register(int)
    def _init_units(units: int):
        self.units = units
        self.W = None
        self.b = None

    @__init__.register(TensorVariable)
    def _init_W(W = None, b=None):
        self.W = W
        self.b = b

    def __call__(self, x):
        num_inputs = x.shape[0]

        output = at.dot(x, self.W) + self.b
        dense = DenseLayer([x, self.W, self.b], [output])
        return dense(x, self.W, self.b)
```

## TODO Module
How do we define a module in a similar way we defined `MLP` above with Flax? Is there anything special about modules compared to normal layers? Should we attribute a specific `Module` type to them, as opposed to `Layer`? If we consider they're merely a way to define a new layer they should be implemented as `OpFromGraph` as well. In this case we should have a general way to define layers so the code looks like:

## TODO Bayesian Neural Network
PPLs typically require you to define *probabilistic layers*, but this approach is not general as you cannot define an arbitrary prior structure on the weights. With Aesara/AeNN/AePPL it is fairly simple; you just initialize the weights as random variables:

```python
srng = at.random.RandomStream(0)

num_units = at.scalar("N")
X = at.matrix("X")
W = srng.normal(0, 1, size=(X.shape[1], num_units))
b = at.scalar("b")

out = Dense(x.shape[1], W, b)(x)

aesara.dprint(out)
# DenseLayer{inline=False} [id A]
#  |X [id B]
#  |normal_rv{0, (0, 0), floatX, False}.1 [id C]
#  | |RandomGeneratorSharedVariable(<Generator(PCG64) at 0x7FE904AED660>) [id D]
#  | |SpecifyShape [id E]
#  | | |Elemwise{Cast{int64}} [id F]
#  | | | |MakeVector{dtype='float64'} [id G]
#  | | |   |Elemwise{Cast{float64}} [id H]
#  | | |   | |Subtensor{int64} [id I]
#  | | |   |   |Shape [id J]
#  | | |   |   | |X [id K]
#  | | |   |   |ScalarConstant{1} [id L]
#  | | |   |N [id M]
#  | | |TensorConstant{2} [id N]
#  | |TensorConstant{11} [id O]
#  | |TensorConstant{0} [id P]
#  | |TensorConstant{1} [id Q]
#  |b [id R]
#  |RandomGeneratorSharedVariable(<Generator(PCG64) at 0x7FE904AED660>) [id D]
```

One interesting thing to note is that since the operations performed inside layers are deterministic, AePPL won't need to see "inside" the layer Ops to compute the models' log-density.

*Q: What if I want to initialize some weights randomly but not consider them as random variables?* A: Don't pass them to AePPL's `joint_logprob`!

## Training

We need to be able to call the model with `model(batch, parameters)`, then compute the loss, then update the parameter values using an optimizer.

```python
class MLP(nn.Module):
    features: Sequence[int]

    @nn.module.from_graph
    def __call__(self, x):
        """This returns a layer as an `Op` named `MLP`.
        """
        for feature in features[:-1]:
            x = nn.Dense(feature)(x)
            x = nn.relu(x)
        x = nn.Dense(features[-1])(x)
        return x
```

# Graph rewriting

We can perform rewriting at the layer semantic level, for two reasons:

1.  ****AutoML:**** We can swap activation functions, layer sizes, etc.
2.  ****Performance:**** For instance, the [TENSAT](https://github.com/uwplse/tensat) library adds equality saturation to the [TASO](https://github.com/jiazhihao/TASO) library. There are a list of rewrites that operate on a so-called *layer algebra*. Here are a few examples:

```ascii
matmul(matmul(input_1,input_4),input_5)==matmul(input_1,matmul(input_4,input_5))
conv2d(1,1,0,2,ewadd(input_12,ewadd(input_10,input_11)),ewadd(input_12,ewadd(input_10,input_11)))==conv2d(1,1,0,2,ewadd(input_11,ewadd(input_10,input_12)),ewadd(input_11,ewadd(input_10,input_12)))
poolavg(3,3,1,1,0,input_8)==conv2d(1,1,0,0,input_8,Cpool(3,3))
relu(input_8)==conv2d(1,1,0,2,input_8,Iconv(3,3))
```

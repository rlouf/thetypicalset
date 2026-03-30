---
title: "Pico GPT2 in Aesara"
---

```python
import aesara.tensor as at
import numpy as np

def gelu(x):
    return 0.5 * x * (1 + at.tanh(at.sqrt(2 / np.pi)) * (x + 0.044715 * x ** 3))

x = at.scalar('x')
y = gelu(x)

import aesara
aesara.dprint(y)
```

```python
x = at.vector('x')

def softmax(x):
    return at.exp(x) / at.sum(at.exp(x))

y  = softmax(x)
fn = aesara.function([x], y)
aesara.dprint(y)
aesara.dprint(fn)
```

```python
def layer_norm(x, g, b, eps = 1e-5):
    mean = at.mean(x)
    var = at.var(x)
    return g * (x - mean) / at.sqrt(var + eps) + b

x = at.vector('x')
y = layer_norm(x, 1., 1.)
aesara.dprint(y)
```

```python
def linear(x, w, b):
    return x @ w + b

def ffn(x, c_fc, c_proj):
    return linear(gelu(linear(x, *c_fc)), *c_proj)

def attention(q, k, v, mask):
    return softmax(q @ k.T / at.sqrt(q.shape[-1]) + mask) @ v

def mha(x, c_attn, c_proj, n_head):
    x = linear(x, *c_attn)
    qkv = at.split(x, 3, axis=-1)
    qkv_heads =
    causal_mask =
    out_heads =
    x =
    x = linear(x, *c_proj)
```

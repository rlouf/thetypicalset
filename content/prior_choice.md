---
title: "Prior choice"
aliases:
  - 20e72445-506f-4bb1-a97c-a5b3fa24d625
---

# Negative Binomial

Generic priors often fail dramatically when used for the dispersion parameter of the [[negative_binomial_distribution|Negative Binomial Distribution]].

In PyMC3 the Negative binomial distribution can be parametrized in terms of the mean $\mu$ and the dispersion parameter $\alpha$ so that

```latex
\begin{equation}
  \sigma^{2} = \mu + \alpha \mu^{2}
\end{equation}
```

We typically want $\alpha$ to be small-ish, which can be problematic when $\mu$ is large. A typically prior choice would be to define $\gamma = 1 / \alpha$ and

```latex
\begin{equation}
  \gamma \sim \HalfCauchy(10e-2)
\end{equation}
```

So $\gamma$ can take arbitrarily large values. We can see it by rewriting the Negative binomial as:

```latex
\begin{align}
  X | z &\sim \operatorname{Poisson}(\mu \, z)\\
  z &\sim \operatorname{Gamma}(\gamma^{-1}, \gamma^{-1})
\end{align}
```

and the standard deviation of $z$ is $\sqrt{\gamma}$. This Gamma distribution has a mean of $1$ and a variance of $\gamma$. (simpson2018) suggests that the prior should be put on $\sqrt{\gamma}$, which can be seen as a deviation $d(\gamma)$ so that if $d(\gamma$)\$ is increased by one unit the square root of the information lost by replacing this model by the base model (Poisson, which occurs when $\Gamma$ =0) is increases by one. See (simpson2015) and (simpson2017) for more information.

## Numerically

Are there general numerical transformations on the computation graph that we can learn from this example?

### Model implementation in PyMC3

The original model is written:

```python
alpha = pm.HalfNormal("alpha", 10e-2)
Y = pm.NegativeBinomial("Y", mu, alpha)
```

While the reparametrized model is written:

```python
alpha = pm.HalfNormal("alpha", 10e-2)
phi = pm.Gamma("phi", tt.sqrt(alpha), tt.sqrt(alpha))
Y = pm.Poisson("Y", mu * phi)
```

Note that we introduced a new degree of liberty by expanding the Negative Binomial in its canonical form.

### The logpdf

The logpdf of the negative binomial of parameters $\mu$ and $\alpha$ is implemented as

```python
def logpdf_negativebinomial(x, mu, alpha):
    return (binomln(x + alpha -1, x)
            + logpow(mu, x)
            - logpow(mu+alpha, x)
            + logpow(alpha, alpha)
            - logpow(mu+alpha, alpha)
    )
```

While the Poisson is implemented as:

```python
def logpdf_poisson(x, mu, phi):
    return aet.log(aet.gammainc(X + 1, mu * phi))
```

And the Gamma distribution as:

```python
def logpdf_gamma(phi, alpha):
    return (-gmmaln(alpha)
            + logpow(alpha, alpha)
            - alpha * phi
            + logpow(phi, alpha - 1)
    )
```

So the logpdf of the re-parametrized negative binomial is given by:

```python
def logpdf_reparam(x, mu, alpha, phi):
    return (
        aet.log(aet.gammainc(X + 1, mu * phi))
        -gmmaln(alpha)
        + logpow(alpha, alpha)
        - alpha * phi
        + logpow(phi, alpha - 1)
    )
```

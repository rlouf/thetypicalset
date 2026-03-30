---
title: "Probabilistic programming via source code rewriting (MCX)"
date: 2020-02-12
---

The mathematical representation of graphical model is simple. Take the Beta-Binomial model, which is typically used to model the results of $N$ coin flips in introductory classes:

```
\begin{align*}
p &\sim \operatorname{Beta}(1, 2)\\
Y &\sim \operatorname{Binomial}(p)
\end{align*}
```
With a little experience you can quickly comprehend what they represent, their consequences. For instance that they implicitly define a *predictive distribution* $\operatorname{CoinFlip}(Y | N)$ and a *joint distribution* \$CoinFip (Y, p, N)\$[^1]. The equations are **declarative**: they describe a model, not a computation procedure. Which makes them very **user-friendly** in the sense that their representation of a model matches closely our mental representation. This is [[an_api_is_good_when_you_do_not_think_about_it|what great APIs do]].

To build a useful Probabilistic Programming Library $\lor$ Language (PPL) we need to build at least two functions from this object: one that draws samples form the prior joint distribution, and the log-probability density function. But the one-to-any relationship between the notation and the functions we need in practice is not something that is easy to express in most programming languages. Designing a user-friendly API for a Probabilistic Programming Language is thus cursed.

Of course we can implement these two representations separately. This is simple to do with "elementary" distributions such as the Beta, Dirichlet, Multivariate Normal, etc. distributions. As a matter of fact, they are often implemented as a single object that implements a `sample` and a `logpdf` method. So when you write:

```python
x = Beta(1., 1.)
```

You can draw realizations from this random variable with

```python
x.sample()
```

or compute the log-probability of `x` having the value `a` as

```python
x.logprob(a)
```

This implementation is close enough to the mathematical representation $x \sim \operatorname{Beta}(1., 1.)$. So what is the issue exactly?

Representing the model as a class becomes more tedious with complex graphical models. You could implement the Beta-Binomial model above as a class, thus defining the $\operatorname{BetaBinomial}$ distribution. In fact [some PPLs do](https://docs.pymc.io/en/latest/api/distributions/generated/pymc.BetaBinomial.html) because the Beta-Binomial distribution is a useful abstraction, and [[distributions_are_merely_convenient_abstractions|distributions are merely convenient abstractions]]. But if you do this for every model you encounter you are effectively building a model zoo; The goal of Probabilistic Programming is to be able combine elementary distributions to express arbitrarily complex models.

Existing PPLs have different ways to do this, I recommend Junpeng's [talk at PyData Córdoba](https://www.youtube.com/watch?v=WHoS1ETYFrw) for an overview, but we will take a different approach here. When I design an API, I like to take a sufficiently (but not too) complex example and to [[start_with_designing_the_api_you_want|start implementing the API I want]]. The following linear regression model will do:

```
\begin{align*}
  Y &\sim \operatorname{Normal}(\theta, \sigma)\\
  \theta &= \alpha + X^{T} \beta\\
  \sigma &\sim \operatorname{HalfNormal}(1)\\
  \alpha &\sim \operatorname{Normal}(0, 10)\\
  \beta &\sim \operatorname{Normal}(0, 10)\\
\end{align*}
```
It has random variables, random variables that are used to define othe random variables, and a mathematical expression. Assuming that the design matrix $X$ is given, it would make sense to implement the model as a python function of $X$ that returns the $Y$ values. [[design_by_manipulating_mock_code|In pseudo code]]:

```python
def regression(X):
  alpha = Normal(0, 10)
  beta = Normal(np.zeros(5), 10)
  sigma = HalfNormal(1)

  y = alpha + np.dot(beta, X)
  predictions = Normal(y, sigma)

  return predictions
```

Welcome MCX. Well, almost.

# Defining probabilistic models with MCX

Here is how you express the beta-binomial model in MCX:

```python
import mcx

@mcx.model
def beta_binomial(beta=2):
  a <~ Beta(1, beta)
  b <~ Binomial(a)
  return b
```

Yes, this is working code. The model is syntactically close to both the mathematical notation and that of a standard python function. Notice the `<~` operator, which is not standard python notation. It stands for "random variable" assignment in MCX.

MCX models are defined as **generative functions**. Like any function, MCX model can be parametrized by passing arguments to the model. `beta_binomial` takes `beta` as an argument, which can later be used to parametrize the model. It can also take data as arguments, such as the values of predictive features in a regression model. The `return` statement defines the model's output, which is a measured variable.

When you write a MCX model such as the one above you implicitely define 2 distributions. First the joint probability distribution of the associated graphical model. You can sample from this distribution with the `mcx.sample_joint(beta_binomial)` function. You can also the log-probability for a set of values of is random variables with `mcx.log_prob(model)`.

When you call this function, MCX parses the content of your model into an intermediate representation, which is a mix between a graphical model (which is the mathematical object your model describes) and an abstract syntax tree (to maintain control flow). Random variables are identified as well as their distributions and the other variables they depend on.

Writing a model as a function is intuitive: most bayesian models are generative models. Given input values and parameters they return other values that can be observed. While MCX models also represent a distribution, in the API we treat them first as generative functions.

# Interacting with MCX models

Consider the following linear regression model:

```python
@mcx.model
def linear_regression(x, lmba=1.):
    scale <~ Exponential(lmbda)
    coef <~ Normal(np.zeros(x.shape[-1]), 1)
    y = np.dot(x, coef)
    preds <~ Normal(y, scale)
    return preds
```

Calling the generative function should return a different value each time it is called with a different value of `rng_key`:

```python
linear_regression(rng_key, x)
# 2.3
```

Note the apparition of `rng_key` between the definition and the call here, necessary because of JAX's pseudo-random number generation system. It can be cumbersome to specify a different `rng_key` at each call so we can handle the splitting automatically using:

```python
fn = mcx.seed(linear_regression, rng_key)
fn(10)
# 34.5
fn(10)
# 52.1
```

`linear_regression` is a regular function so we can use JAX's vmap construct to obtain a fixed number of samples from the prior predictive distribution.

```python
import jax

keys = jax.random.split(rng_key, num_samples)
jax.vmap(linear_regression, in_axes=(0, None))(keys, x_data)
```

Again, for convenience, we provide a `sample_predictive` function, which draws samples from the function's predictive distribution.

```python
mcx.sample_predictive(linear_regression, (x_data,), num_samples=1000)
```

The generative function implicitly defines a multivariate distribution over the model's random variables. We include utilities to sample from this distribution. To sample from the prior distribution:

```python
sampler = mcx.sample_joint(rng_key, linear_regression, (x_data,))
```

Since forward sampling can be an efficient way to debug a model, we also introduce a convenient `forward` method to the model:

```python
linear_regression.forward(rng_key, x_data)
```

If you have seeded the model as shown before (recommended when debugging), then you can call

```python
linear_regression.forward(x_data)
```

To sample from the posterior distribution we need to specify which variables we are conditioning the distribution on (the observed variables) and the kernel we use to sample from the posterior:

```python
sampler = mcx.sampler(
    rng_key,
    linear_regression,
    (x_data,),
    {"preds": y_data},
    HMC(100),
)
sampler.run(1000)
```

Once the model's posterior distribution has been sampled we can define a new generative function that is the original function evaluated at the samples from the posterior distribution.

```python
evaluated_model = mcx.evaluate(linear_regression, trace)
```

When sampling from the predictive distribution, instead of drawing a value for each variable from its prior distribution, we sample one position of the chains and compute the function's output. Apart from this we can draw samples from the generative distribution like we would the model:

```python
evaluated_model(rng_key, x_data)
seeded = mcx.seed(evaluated_model, rng_key)
mcx.sample_predictive(rng_key, evaluate_model, (x_data,), num_samples=100)
```

Unlike the original model, however, the evaluated program is not a distribution. It is a generative function for which only predictive distributions are defined.

## Go on your own

MCX provides a convenient interface to interact with the model's predictive, joint prior and posterior distributions, but should you want to build something more sophisticated you can always access the underlying functions directly:

```python
# Get the function that computes the logprobability
log_prob(model)
# Get a function that draws one sample from the joint distributon
joint_sampler(model)
# Function that draws one sample from the predictive distribution
predictive_sampler(model)
```

Which should get you covered for most of your applications. `log_prob`, in particular, allows to you to write your model with MCX and use another library (e.g. BlackJAX) to sample from the posterior distribution.

# How does it work? MCX's internals

## Representing models with graphs (as in probabilistic *graphical* model)

The models' graph can be accessed interactively. It can be changed in place. It is possible to set the value of one node and see how it impacts the others, very useful to debug without re-writing the whole in scipy!

```python
new_graph = simplify_conjugacy(graph)
```

Having a graph is wonderful: it means that you can symbolically manipulate your model. You can detect conjugacies and using conjugate distibution to optimize sampling, reparametrization is trivial to do, etc. Manipulating the graph is pretty much akin to manipulating the mathematical object.

```text

                                     +----> logpdf
@mcx.model                           |
def my_model(X):   ----->   Graph  -------> ....
    .....                            |
    return y                         +----> forward_sampler

```

All this happens in **pure python**, there is no framework involved. We do use NetworkX to build and manipulate graphs for convenience, but could do without.

Currently the graph we compile is a static graph. It only contains the random variables and transformation. As such it can only handle a fixed number of random variables. This, however, is a strong

The advantage of compiling pure python function is that it nicely decouples the modeling language from inference. Any inference library that accepts python functions (with jax constructs) could use the functions used by the DSL. So far the entire code only relies on functions in JAX that are present in numpy/scipy. So you could very well consider this as a numpy/scipy function. And if you were introduce JAX-specific constructs such as control flow, you could still specify a different compiler for each backend since the graph representation is framework-agnostic. Hell, you could even write, without too much effort, an edward2, pymc3 or pyro compiler!

```text
Example with control flow and different
```

Is it crazy to do AST manipulation? It might be harder to do it right than in language with a full-fledged macro system such as, say, Julia or Lisp, but done correctly it actually gives us nice benefits: a nice API with a powerful intermediate representation. Corner cases can also be tested as it is possible to output the code of the logpdfs from the model.

```text
model.source_logpdf
```

## Inference

*The modeling language and the inference module are completely separate.* The modeling language compiles to a logpdf, and that is all the samplers need.

Inference in MCX is also very modular. The idea is that inference in traditional PPLs can be broken down in three different levels:

1.  The building blocks (or *routines*) of the algorithms: integrators, metrics, proposals, ... which do only one thing and do it well.
2.  *Programs* like the HMC algorithm are a particular assembly of these building blocks. They form a transition kernel.
3.  *Runtimes*, that tie the data, the model and the kernel together and then make the chains move forward following an execution plan.

```text
Runtime (Sampling loop)
-------------------------------------------------
Programs (HMC)
-------------------------------------------------
Routines (velocity Verlet, dynamic proposal, etc.)
```

MCX comes with sane defaults (runtimes and pre-defined programs), but has many trap doors that allow you to tinker with the lower level.

Most users will interact with the pre-defined programs (HMC or NUTS with the Stan warmup) and runtimes. But it is also possible to create custom inference schemes in MCX, it can be as simple as overriding HMC's warmup by subclassing it, or as complex as implementing your own transition kernel using the available blocks or blocks you have programmed.

**Update 2022-04-05:** Everything related to inference has moved to [Blackjax](https://github.com/blackjax-devs/blackjax), a sampling library which is focused on speed and modularity.

[^1]: In fact I am not sure everyone who uses PPLs have formalized this, which makes this notation even more powerful.

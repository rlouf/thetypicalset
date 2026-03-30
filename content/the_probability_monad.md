---
title: "The probability monad"
aliases:
  - fe9e3c40-5637-4947-a8a0-c3cf486b89e8
---

Measures are a type constructor $\mathbb{M}\operatorname{T}$. They map subsets of the event space $\operatorname{T}$ to $[0, 1]$:

$$\mathbb{M}\operatorname{T}: \sigma(\operatorname{T}) \to [0, 1]$$

Measures are functors: if we have a measure of type $\mathbb{M}\operatorname{T}$ and a function $f: \operatorname{T} \to \operatorname{U}$ then we can define an object of type $\mathbb{M}\operatorname{U}$.

Under certain conditions, measures have a density $\mathdd{d}\nu: \operatorname{T} \to \mathbb{R}^+$.

We can also define $\operatorname{Rand}[\operatorname{T}] : \Omega \to \operatorname{T}$.

```python
import aeppl.random as ar

mu = at.scalar()
sigma = at.scalar()

x = ar.normal(mu, sigma)
y = ar.halfnormal(x, 1.)
```

In this case the first `ar.normal` is a function $\operatorname{normal}: \mathbb{R} \times \mathbb{R}^+ \to \mathbb{M}\mathbb{R}$, and the second $\operatorname{halfnormal}: \mathbb{M}\mathbb{R} \to \mathbb{M}\mathbb{R}^+$.

- We pass from $\operatorname{halfnormal}$, a probability measure over probability measures to a probabilty measures by defining an **evaluation map** $\mu$, $\mu$ acts by integrating or averaging (or sampling?).
- We define a map $\mu: \operatorname{T} \to \mathbb{M}\operatorname{T}$ for passing from a space $T$ to a probability measure over $T$, typically by sending $x \in \operatorname{T}$ to the Dirac measure over $x$.
- We define an **assignment** $\mathbb{M}$ on maps so that a map of spaces $f: T \to U$ extends to a map of spaces of probability measures $\mathbb{M}f : \mathbb{M}T \to \mathbb{M}U$, this takes the form of the pushforward definition.

# References

## Pratical implementations

- [The probability monad and why it's important for data science](https://www.chrisstucchio.com/blog/2016/probability_the_monad.html)
- [Probability Monads from scratch in 100 lines of Haskell](https://dennybritz.com/posts/probability-monads-from-scratch/)
- [Practical probabilistic programming with monads](http://mlg.eng.cam.ac.uk/pub/pdf/SciGhaGor15.pdf)

## Theory

- [A categorical approach to probability theory](https://www.chrisstucchio.com/blog_media/2016/probability_the_monad/categorical_probability_giry.pdf)
- [A categorical foundation for bayesian probability](https://www.chrisstucchio.com/blog_media/2016/probability_the_monad/1205.1488v3.pdf)
- [Probability monads](https://www.math.harvard.edu/media/JulianAsilisThesis.pdf)
- [What is a probability monad?](http://tobiasfritz.science/2019/cps_workshop/slides/tutorial1.pdf)

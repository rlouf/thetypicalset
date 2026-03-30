---
title: "Interesting applications of Aesara"
date: 2022-12-09
---

Working on [[aesara|Aesara]] and its related projects [[aeppl|AePPL]] and [[aemcmc|AeMCMC]] I have come to realize the versatility and flexibiliy of the ecosystem that we are building. Aesara was built to be *modular*, which means that pretty much everything in the library can be hacked to fit one's particular use case:

- You can create new =Op=`\s`{=latex}. These =Op=`\s`{=latex} don't need to be functional and can be used just as an intermediate representation. AePPL, for instance, takes an Aesara model with =RandomVariable=`\s`{=latex} and transforms it into a graph between measures. These measures are not used to perform computations, but instead to compute the density of the model. And soon by AeMCMC to automatically build samplers from models.
- You can implement new rewrites/optimizations. You found an optimization that makes your model run faster? You can implement it and register it in Aesara's rewrite database easily.
- You can transform parts of your graph into an `Op` that can be targetted by rewrites.
- You can add a new backend. A new framework came up and you'd like your Aesara models to run with it? You can easily add a new backend, even implement it in a different repository.

When you work on a project like this many ideas of applications pop up, but time is limited. *So I am writing all my ideas out here, hoping someone will take one of them and run with it.*

# Probabilistic modelling

## Linear models

Thanks to Aesara's symbolic nature, it should be relatively easy to use [Formulaic](https://github.com/matthewwardrop/formulaic) to parse formulas, and [AeMCMC](https://github.com/aesara-devs/aemcmc) to sample from the posterior distribution.

## Automatic Structured Variational inference

<https://arxiv.org/pdf/2002.00643.pdf>

## Automatic Laplace approximation

# Deep Learning

Theano was completely oriented towards neural networks, but Aesara kind of departed from this to focus on the core functionalities of a tensor library. I see a couple reasons why a deep learning library written in Aesara would be truly unique.

First, deep learning frameworks come and go, and it is not uncommon to have to rewrite one's model several times in different frameworks. Once you have written your model in Aesara, however, you can compile to different backends. Working with the latest compiler is only a matter of adding it as a backend in Aesara, which would benefit the *entire Aesara ecosystem*, and thus be maintained by a community possibly larger than the deep learning community.

But the biggest benefits come from the ability to give layers a *type* by creating =Op=`\s`{=latex} from their Aesara implementation. Having layer types means you can target them with rewrites, and I see two exciting possibilities coming from this.

See [[kaeras|AeNN]] for the current status of my thinking on this topic.

## AutoML

Tired of always making small changes to your models to get an increase in performance? Aesara can automate that! Implement what you manually do as rewrites (increasing the layer size, adding dropout, etc.) and Aesara will output different versions of your model. This means you will only ever have to touch the model implementation once, but also now you can re-use your rewrites for your next models. You are making cumulative progress instead of having to do the same thing over and over. In addition, Aesara's rewrite system will soon include a form of [equality saturation](https://arxiv.org/abs/1012.1802), which means that it will be able to return all the possible models that are defined by your rewrite rules. Now that's *true automation*.

## Higher-level optimizations

Compilers used in deep learning are generally good at optimizing the low-level optimizations (constant folding, loop fusions, etc.), but they cannot reason at the mathematical level. There are however [plenty of optimizations](https://github.com/uwplse/tensat/blob/master/single_rules.txt) that can be performed by reasoning at the layer level, and an Aesara-based DL library could target layers with rewrites to transform the model into a different but mathematically equivalent representation. This kind of rewrites [has been shown](https://github.com/jiazhihao/TASO) to outperform existing compilers by up to a factor of 3.

# Gaussian processes

A Gaussian process library could add kernels as types, and implement rewrites that allow to build models automatically by manipulating kernels. This is essentially what David Duvenaud did in [his PhD thesis](https://www.cs.toronto.edu/~duvenaud/thesis.pdf).

# Probabilistic circuits

Probabilistic circuits rely a lot on *structures* to be able to do tractable inference, and as you might have gathered from the previous sections, Aesara is great when you need to reason about your model structure. Aesara/AePPL already contain some of the logic relative to building graphs that contain random variables, and get a log-density from a probabilistic graph, so that wouldn't need to be implemented. You can also build =Op=`\s`{=latex} based on an existing computational graphs, so the structure objects found in libraries like [SPFlow](https://github.com/SPFlow/SPFlow) could be given a type and then manipulated by rewrites.

I think probabilistic circuits would make a great showcase for Aesara's capabilities, and since most of the building blocks are already there it wouldn't take too long to get to the same level as SPFlow in terms of functionalities.

# Causal inference on probabilistic models

An Aesara model is a graph of computations, that can be manipulated at runtime. It would thus be easy to perform *interventions* on a model without having to modify the original model.

# Target the Triton compiler

The easiest way to use the [Triton compiler](http://www.eecs.harvard.edu/~htk/publication/2019-mapl-tillet-kung-cox.pdf) for now would be to create a new backend that patches the existing JAX backend and replaces some =Op=s with their Triton implemetation using [jax-triton](https://github.com/jax-ml/jax-triton).

# Cross-language portability

Hey, you could even implement a Julia backend for Aesara. Or whatever language you need in your applications. All that while model manipulations stay at the Python level.

# Conclusion

The nature of Aesara (static graph, possibility to delineate regions in your graph, its rewrite system, switchable backend, etc.) makes it really unique in the Python landscape. It opens the way for applications that were either impossible or tedious with existing framework, and we really hope to see these applications come to life.

If you have comments or questions, if you're wondering if your use case could be covered by Aesara, or if you have ideas, reach out to me at [@remilouf](https://twitter.com/remilouf) on Twitter, or [@remilouf@bayes.club](https://bayes.club/@remilouf) on Mastodon! I'll expand this post as I get feedback.

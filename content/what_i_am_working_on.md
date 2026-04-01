---
title: "💻 Working on now"
tags:
  - public
aliases:
  - 9980ae28-68d4-4e29-9248-d661ccd85ab8
---

I enjoy work and my personal projects (open source) very much, and they keep me very busy. I am also trying to [[now|do other things with my life]]. My interests have recently shifted towards Large Language Models, but my statistics and symbolic background are still very relevant!

# Sampling sequences with Large Language Models

I am convinced that the current way we [[sample_text_sequences|generate sequences]] with Large Language Models is suboptimal. We can do much better than [[greedy_search|greedy search]], [[multinomial_sampling|multinomial sampling]] or [[beam_search|beam search]]. I think that [[smc_steering|SMC steering]] is more promising.

# Structured streaming and agent primitives

I think the way we consume LLM output is fundamentally wrong. [[closing-brace-synchronization-point|JSON's closing brace is an unexamined synchronization point]] and [[facts-not-objects|the fundamental unit of LLM output is a fact, not an object]]. Once you see that, [[llm-patch-streaming-coroutine|an LLM with patch streaming is a coroutine]] and [[agent-frameworks-rational-response|agent frameworks are rational responses to an irrational constraint]].

Separately, [[agent-sessions-externalize-reasoning|agent sessions make reasoning explicit]] in a way that changes how we think about [[session-traces-artifact|software artifacts]] and [[code-without-reasoning|code review]].

# Guided generation with Large Language Models

# Optimizing inference time

# Outlines

I am also working on an Open Source library that provides guided generation, [[outlines|Outlines]]. It also helps me learn everything LLMs.

---
title: "An LLM with patch streaming is a coroutine"
---

An LLM with patch streaming is a coroutine. Yield facts out, receive facts in, suspend, resume. That is the definition. This is not a metaphor — it maps exactly onto Python's async generator with `asend()`. The model yields structured assertions; the caller can inject new information at any yield point; the model resumes from where it left off with the injected context available. The only thing that was missing was a [[missing-primitive-yield-surface|protocol that exposed the yield points]].

([[missing-primitive-yield-surface|The missing primitive was the yield surface]] · [[inject-two-way-channel|Inject turns a stream into a two-way channel]] · [[facts-not-objects|The fundamental unit of LLM output is a fact, not an object]])

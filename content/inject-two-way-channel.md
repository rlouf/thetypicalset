---
title: "Inject turns a stream into a two-way channel"
---

`pause()` + `inject()` + `resume()` is not a new concept. It is what `asend()` does in Python generators. The LLM is just the generator. What makes it significant in this context is that it transforms the model from a function you call and wait on into a process you collaborate with. The stream was already one-way; inject makes it two-way. The difference between a one-way and two-way channel is the difference between a tool and a participant.

([[llm-patch-streaming-coroutine|An LLM with patch streaming is a coroutine]] · [[two-streams-not-turn-taking|Two streams injecting into each other is not turn-taking]])

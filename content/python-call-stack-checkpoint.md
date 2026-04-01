---
title: "The Python call stack is the checkpoint"
---

LangGraph's `interrupt()` serializes graph state to Redis or Postgres so it can be replayed later. A suspended coroutine already holds all its state in memory — local variables, execution position, pending yields. The call stack is the checkpoint. No serialization required, no external store, no replay logic. The complexity of LangGraph's persistence layer exists because its execution model lacks suspension. Given a [[llm-patch-streaming-coroutine|coroutine]], the problem it solves does not arise.

([[llm-patch-streaming-coroutine|An LLM with patch streaming is a coroutine]] · [[agent-frameworks-rational-response|Agent frameworks are rational responses to an irrational constraint]])

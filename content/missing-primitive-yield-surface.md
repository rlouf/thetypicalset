---
title: "The missing primitive was the yield surface"
---

Models were always generating facts in order. The information was always there — [[token-streaming-cosmetic|streaming tokens]] proved that. What was missing was a protocol that exposed that sequence as structured facts and accepted injections at the boundaries between them. Patch streaming is that protocol. It does not add a capability to the model. It exposes a capability the model always had, by providing a yield surface where none existed before.

([[llm-patch-streaming-coroutine|An LLM with patch streaming is a coroutine]] · [[facts-not-objects|The fundamental unit of LLM output is a fact, not an object]] · [[closing-brace-synchronization-point|JSON's closing brace is an unexamined synchronization point]])

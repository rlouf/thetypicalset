---
title: "JSON's closing brace is an unexamined synchronization point"
---

JSON's closing brace is an artificial synchronization point. Nothing in inference requires it. It accumulated as a default, unexamined, the same way the page reload and the synchronous render did before it. The entire downstream system — parser, validator, dispatcher — blocks on a character that carries no information beyond "the object is complete." The completeness of the object was never the interesting event. The interesting events were the individual [[facts-not-objects|facts]] inside it.

([[paradigm-shifts-remove-synchronization|Every paradigm shift removes a synchronization point]] · [[token-streaming-cosmetic|Token streaming is cosmetic]] · [[facts-not-objects|The fundamental unit of LLM output is a fact, not an object]])

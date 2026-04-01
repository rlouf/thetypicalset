---
title: "Token streaming is cosmetic"
---

Streaming tokens to a UI looks like progress but preserves the same [[closing-brace-synchronization-point|synchronization point]]. The system still waits for a complete object before it can act. The tokens scroll past, the user feels momentum, but nothing downstream reacts until the closing brace arrives. The progress bar is not the insight. The insight is that the system could have been acting on each [[facts-not-objects|fact]] as it was produced, if anyone had thought to expose facts instead of tokens.

([[closing-brace-synchronization-point|JSON's closing brace is an unexamined synchronization point]] · [[facts-not-objects|The fundamental unit of LLM output is a fact, not an object]])

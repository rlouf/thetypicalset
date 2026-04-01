---
title: "Agent frameworks are rational responses to an irrational constraint"
---

LangChain, LangGraph, AutoGen are not bad engineering. They are the correct solution given a blocking function call as the primitive. When your only interface to a model is "send text, wait, receive text," you need orchestration layers to manage the waiting, parsing, error handling, and state management. The frameworks are well-engineered responses to a poorly-designed interface. Remove the blocking call — replace it with a [[facts-not-objects|fact stream]] and a [[missing-primitive-yield-surface|yield surface]] — and the solutions become unnecessary, not improved. The frameworks do not need better APIs. The primitive they are built on needs to change.

([[closing-brace-synchronization-point|JSON's closing brace is an unexamined synchronization point]] · [[paradigm-shifts-remove-synchronization|Every paradigm shift removes a synchronization point]] · [[asyncio-is-agent-framework|asyncio is the agent framework]] · [[judgement-bottleneck|Judgement is now the bottleneck]])

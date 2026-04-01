---
title: "Agent topology should emerge from facts, not be declared"
---

LangGraph requires you to declare nodes, edges, and conditional transitions before execution. The graph is a design-time artifact — you must know the shape of the computation before it runs. With [[facts-not-objects|fact streams]], nodes spawn when relevant facts arrive. The graph assembles itself at runtime, in response to what the model actually produces, not what you predicted it would produce. The topology is emergent, not designed. This is a fundamental difference in how you think about multi-agent coordination.

([[facts-not-objects|The fundamental unit of LLM output is a fact, not an object]] · [[agent-frameworks-rational-response|Agent frameworks are rational responses to an irrational constraint]] · [[two-streams-not-turn-taking|Two streams injecting into each other is not turn-taking]])

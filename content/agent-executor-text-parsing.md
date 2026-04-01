---
title: "AgentExecutor exists entirely because of text parsing"
---

LangChain's AgentExecutor is roughly 600 lines dedicated to parsing `Action: search\nAction Input: query` out of generated text, regex-matching the tool name, handling parsing failures, reconstructing context after errors. It exists because tool calls are encoded as unstructured text inside a larger unstructured response. With [[facts-not-objects|fact streams]], `/tool_call/name` is just a fact — a typed, named, immediately actionable assertion. The parsing problem does not exist. The 600 lines do not become simpler. They become zero.

([[agent-frameworks-rational-response|Agent frameworks are rational responses to an irrational constraint]] · [[facts-not-objects|The fundamental unit of LLM output is a fact, not an object]])

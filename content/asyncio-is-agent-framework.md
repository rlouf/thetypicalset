---
title: "asyncio is the agent framework"
---

`asyncio.Queue`, `asyncio.gather`, `asyncio.Event`, `create_task`. Every LangGraph abstraction maps onto one of these primitives. They have been in the Python standard library since 3.4. The reason nobody uses them as agent infrastructure is that the underlying model call is blocking and text-in-text-out. Once the model is a [[llm-patch-streaming-coroutine|coroutine]] that yields typed [[facts-not-objects|facts]], asyncio's primitives are exactly what you need to compose, coordinate, and orchestrate agents. No framework required. The standard library is the framework.

([[agent-frameworks-rational-response|Agent frameworks are rational responses to an irrational constraint]] · [[llm-patch-streaming-coroutine|An LLM with patch streaming is a coroutine]] · [[python-call-stack-checkpoint|The Python call stack is the checkpoint]])

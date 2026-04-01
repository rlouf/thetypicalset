---
title: "Model space and transport space have always been conflated"
---

Model space and transport space have always been conflated. The model generates JSON because the client expects JSON. But these are two different problems: what representation is most token-efficient for the model to produce, and what representation the client wants to consume. Once you have a translation layer between them, they decouple. The model can generate whatever is most natural for its architecture — the client always receives clean structured output. Asking the model to produce the client's preferred format directly is like asking a database to render HTML.

([[xml-best-model-format|XML is currently the best model-side format]] · [[facts-not-objects|The fundamental unit of LLM output is a fact, not an object]])

---
title: "The fundamental unit of LLM output is a fact, not an object"
---

The fundamental unit of LLM output is a fact, not an object. An object is what you get when you collect facts and freeze them. That freezing is a consumer choice, not a protocol requirement. The model does not "produce a JSON object" — it produces a sequence of assertions, each one independently meaningful, which happen to be serialized in a format that requires all of them to be present before any of them can be read. The format imposes a constraint that the information does not have.

([[stream-as-transaction-log|The stream is a transaction log]] · [[closing-brace-synchronization-point|JSON's closing brace is an unexamined synchronization point]] · [[model-space-transport-space|Model space and transport space have always been conflated]] · [[session-traces-artifact|Agent traces are first-class artifact of software development]])

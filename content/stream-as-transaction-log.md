---
title: "The stream is a transaction log"
---

Each patch event is an assertion. The stream is an append-only log. The final object is a materialized view. This is how databases have always worked — objects are views over fact logs, not the other way around. The log is primary; the object is derived. Treating the complete JSON response as the primary artifact and the stream as a delivery mechanism has it exactly backwards. The stream is the source of truth. The object is a convenience snapshot for consumers who do not need real-time access to facts.

([[facts-not-objects|The fundamental unit of LLM output is a fact, not an object]] · [[session-traces-artifact|Agent traces are first-class artifact of software development]])

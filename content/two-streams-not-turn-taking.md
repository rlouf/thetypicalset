---
title: "Two streams injecting into each other is not turn-taking"
---

Current multi-agent systems pass complete messages sequentially. Agent A finishes, its output becomes Agent B's input, B finishes, its output becomes A's input. This is turn-taking — the same paradigm as human conversation, imposed on a medium that does not require it. Two [[llm-patch-streaming-coroutine|coroutines]] injecting into each other's streams simultaneously is qualitatively different. Both are reasoning in parallel. Neither waits for the other to finish a turn. [[facts-not-objects|Facts]] flow between them continuously, and each incorporates the other's facts as they arrive. This is closer to how two parts of the same brain work than to how two people talk.

([[inject-two-way-channel|Inject turns a stream into a two-way channel]] · [[llm-patch-streaming-coroutine|An LLM with patch streaming is a coroutine]] · [[agent-topology-emerges-from-facts|Agent topology should emerge from facts, not be declared]])

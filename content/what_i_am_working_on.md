---
title: "💻 Working on now"
---

I am currently the cofoundeur and CEO of [.txt](https://www.dottxt.ai), where we build the reliability layer for AI agents.

# Structured streaming and agent primitives

I think the way we consume LLM output is fundamentally wrong. [[closing-brace-synchronization-point|JSON's closing brace is an unexamined synchronization point]] and [[facts-not-objects|the fundamental unit of LLM output is a fact, not an object]]. Once you see that, [[llm-patch-streaming-coroutine|an LLM with patch streaming is a coroutine]] and [[agent-frameworks-rational-response|agent frameworks are rational responses to an irrational constraint]].

# Developer tools for the AI agent era

It is becoming more and more obvious that we will need more tooling to fully take advantage of AI agents.[[agent-sessions-externalize-reasoning|Agent sessions make reasoning explicit]] in a way that changes how I think about [[session-traces-artifact|software artifacts]] and [[code-without-reasoning|code review]].

# Agent harnesses 

The field has been focused on coding agents, and as a result has focused on an interative (TUI) form factor. Agents are also useful when they run in the background, reacting to their environment. We built our own agent harness at [.txt](https://www.dottxt.ai) to orchestrate the background agents we use for R&D, GTM, and generally gathering information.

# Software design

Designing public APIs is one of my favorite things to do, and I still find time to enjoy it.

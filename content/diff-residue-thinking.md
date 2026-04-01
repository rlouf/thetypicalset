---
title: "The diff is the residue of thinking"
---

The thinking that produces the diff is richer than the diff itself. What was tried, what was rejected, the constraints that were discovered or what tradeoffs were accepted.

A diff compresses all this in the final state. Reviewing it is like evaluating the conclusion of an argument without being able to evaluate whether the argument was sound. 

A code review gate controls for the quality of what is visible to the reviewer. If the reviewer sees only the diff, the gate controls for surface correctness — is the code syntactically valid, does it obviously do what it claims to do, are there clear bugs. It cannot control for reasoning-level correctness — was the approach sound, were the right tradeoffs made, were the relevant alternatives considered. As the complexity of agent-produced code increases and the reasoning behind it becomes more consequential, the gap between what the gate can see and what it needs to see in order to be meaningful widens. A gate that appears to provide quality assurance while missing the most important quality questions is worse than a gate that makes its limitations explicit.


([[code-without-reasoning|Code without reasoning is archeology]] · [[session-traces-artifact|Agent traces are first-class artifact of software development]])

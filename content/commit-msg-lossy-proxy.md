---
title: "Commit messages are a lossy proxy for reasoning"
---

The commit message convention — write why, not what — is a good idea that fails
in practice for structural reasons. Articulating reasoning after the fact is
hard. The thinking happened during implementation; the message is written after,
when context has partially dissolved and the pressure to ship has fully arrived.
Even disciplined developers produce commit messages that describe
[[diff-residue-thinking|the diff]] rather than explain the decision. The convention asks humans to do something
humans are not good at: reconstruct and articulate reasoning retroactively,
consistently, under time pressure, for an audience they cannot anticipate. This
is a tooling failure, not a discipline failure.

([[code-without-reasoning|Code without reasoning is archeology]] · [[agent-sessions-externalize-reasoning|Agent sessions make reasoning explicit]])

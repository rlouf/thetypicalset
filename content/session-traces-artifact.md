---
title: "Agent traces are first-class artifact of software development"
---

The artifact of software development has always been the code. Everything else — [[commit-msg-lossy-proxy|commit messages]], PR descriptions, documentation, design documents — was secondary, optional, and systematically incomplete. Agent sessions change this. The session trace is not secondary to the code — it is the record of the process that produced the code, automatically generated, complete, and machine-readable. Treating the trace as scaffolding to be discarded after the code is produced has it backwards. The code is the output of the session. The session is the work. First-class treatment means the trace is stored, versioned, and surfaced with the same reliability as the code itself.

([[diff-residue-thinking|The diff is the residue of thinking]] · [[colocation-useful-context|Colocation is what makes context useful]] · [[stream-as-transaction-log|The stream is a transaction log]])
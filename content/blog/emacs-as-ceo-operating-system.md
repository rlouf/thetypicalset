---
title: "I run my company from Emacs"
date: 2026-04-03
---

People are often surprised when I say I run my day out of Emacs.

I'm the CEO of [.txt](https://dottxt.co), where we build structured generation infrastructure for LLMs. My job is mostly writing and decision-making: strategy docs, board memos, blog posts, partner agreements. Lately it's also included more coding, because AI agents have made it cheap to turn ideas into working software.

That combination is exactly why Emacs works so well for me. It isn't just where I edit text. It's the system where I read what agents produced, decide what matters, write the next thing, and supervise code as it changes.

Here's what a typical day looks like.

# The overnight shift

By the time I wake up, a fleet of AI agents has already been working. Some monitor open source repos in our space, like vLLM, SGLang, and TensorRT-LLM. Others track the market around structured output, scan research papers, or surface prospects.

Last week an agent flagged several issues with structured outputs and speculative decoding across the major inference servers. I pinged my CTO with the details before breakfast. The research scout surfaced a paper reporting degraded performance due to structured outputs. I sent it to an engineer for assessment and reproduction.

# Morning triage

Emacs is already open. It's always open.

I start by reviewing what the agents found overnight. I record voice notes with reactions, priorities, and loose threads to follow up on. Those notes are automatically processed and uploaded into my personal [Obsidian](https://obsidian.md/) vault as structured summaries. Another agent checks [Linear](https://linear.app/) and [Attio](https://attio.com/) for things that need my attention. Then I plan the day.

The monitoring agents also open PRs with what they found: new repos worth watching, competitor announcements, research papers, market movements. I review those PRs in [magit-forge](https://github.com/magit/forge) before they get merged.

That part matters. This is automation without blind trust. The git-based review creates an audit trail, and bad AI output never silently enters the knowledge base.

Once approved, everything flows into an internal site rendered with [Quartz](https://quartz.jzhao.xyz/). The underlying content lives in git, which means it can be edited from [Obsidian](https://obsidian.md/) or directly from Emacs with [obsidian.el](https://github.com/licht1stein/obsidian.el). The vault itself is organized around decisions, risks, relationships, and projects. When I need to write a board memo or pull context for a meeting, the raw material is already there, linked and searchable.

# Writing with AI in the loop

Most of my work still comes down to writing clearly. I write in [zen mode](https://github.com/joostkremers/writeroom-mode), full screen, nothing but text.

I use [gptel](https://github.com/karthink/gptel) for all of this. Select a region, send it, get a revision in place. No copying text into ChatGPT, no switching to a browser tab. The prompts are tuned for distinct jobs: one kills weasel words and tightens prose, another challenges assumptions, a third turns rough notes into clean copy.

Read, think, rewrite, compare, continue. The loop stays tight because you never leave the editor.

# Spectator mode: watching AI code

The same pattern carries over to code.

[Claude Code](https://github.com/anthropics/claude-code) runs in a panel on the right side of Emacs via [claude-code.el](https://github.com/stevemolitor/claude-code.el). I describe what I want, and then I watch. Emacs auto-reverts files as Claude modifies them, so the left side of my screen becomes a live view of the codebase changing in real time. I see the diffs as they happen. I read the code as it's being written.

When something looks off, I interrupt, correct course, and resume. That's very different from reviewing a finished PR after the important decisions have already hardened into code. The point is to catch architectural mistakes at decision time, before they propagate.

What matters here is judgment: knowing when the abstraction is wrong, when a test covers the wrong invariant, when an approach is clever but will become painful in a month. Writing code is cheap now. Reading it well is the scarce skill.

---

I've always said vim, where I come from, is the best editor. Emacs is the best operating system. I use [Doom Emacs](https://github.com/doomemacs/doomemacs) with [evil mode](https://github.com/emacs-evil/evil), so I get both.

Emacs holds the whole loop in one place: notes, code, AI conversations, git workflow, terminal. When I'm reviewing a PR and want to check a strategy doc, it's there. When I want to inspect what an agent is doing to the codebase, it's already on screen. When I need to turn a thought into a note, or a note into a memo, or a memo into a plan, I stay in the same environment.

After a few weeks, your fingers know where knowledge lives, where AI lives, where code lives. The mechanics recede. The tools disappear. What's left is the thinking.

---
title: "Your Agent Framework Is A Chatbot"
date: 2026-04-17
---

Claude Code, Codex, OpenCode, Pi, Aider, and half a dozen other tools all do the same thing: an event, your prompt, enters a loop, an agent defined by the system prompt reacts, tools get called, side effects land in your repo, and the session ends.

Everything that could be plural is singular. One event source: your keyboard. One agent: the one the tool vendor shipped. One session: in memory, cleared when you exit. Let's call this situation n=1, one of each thing the runtime has to deal with.

The question this post is about is what happens when n stops being 1.

## The moment n stops being 1

In a business setting events arrive from Slack at 3am. GitHub webhooks fire while nobody is watching. A prospect gets added to a CRM list and someone wants research done before the next standup. A scheduled task fires and three agents want to run on its output. Somewhere between "my agent reads my email" and "our agents run the company" the shape of the problem changes.

The shape that works at n=1 is the shape of a chatbot: one session, one state, one timeline. To handle n=N you cannot just add orchestration on top. The unit of work itself has to change.

## Growing on four axes

We need to consider how the system needs to evolve to scale from 1 to N on the following axes:

- Event sources
- Agents
- History
- Execution

Let's see what happens when we walk each of these axes from 1 to N, the primitives that they entail.

### Event sources

**At n=1** the event source is typically your keyboard, or any text string. The tool does not need to know what an event is, there is only ever the latest prompt.

**At n=N** the events come from everywhere. Slack mentions. GitHub pushes. Cron schedules. Webhooks from your CRM. Files dropped in a watched directory. Email. A human typing into a dashboard. These events do not arrive in order. They do not arrive synchronously. They do not wait for a previous one to finish.

The first thing this forces is a durable event log. Append-only, immutable, queryable. The moment you have more than one source, you need a single place where "what happened in the system" is answered, and you need that answer to survive a process restart.

The second thing it forces is idempotency. If Slack retries a webhook, and it will, the same event must not be ingested twice.

The third is an explicit ingress boundary: a layer that knows how to take a noisy, vendor-specific payload and convert it into a typed event the rest of the system can trust.

### Agents

**At n=1** there is one agent, and it is defined by one system prompt, sitting in the tool's configuration. It can just return plain text.

**At n=N** you have a registry. A prospect researcher. A PR reviewer. A docs updater. An on-call summarizer. A calendar triager. They each react to different events, produce different outputs, write to different files.

How do you author them?

Code is the wrong answer. Code is opaque to non-engineers (who you should let author agents!), and drags in the full weight of the language's dependency management. What I found works is treating the agent as a document: a Markdown file with a YAML frontmatter contract at the top and instructions in the body. The frontmatter declares what events the agent subscribes to, what files it may write, what tools it is allowed to use, and what events it may emit. The body is the prompt.

The contract stays declarative. The body stays prose, until it absolutely cannot.

A nice property of *declaring* agents this way is that your entire system can be statically analyzed. You can render the event-to-agent graph without running anything. You can lint for agents whose write paths collide. You can generate the event catalog automatically.

The matching, once the contracts are declared, is deterministic. An event arrives. The runtime looks at the registry. If one agent subscribes, it runs. If several subscribe, each gets its own execution. If none subscribe, the event is marked unhandled and recorded. There is no model-assisted routing, no LLM deciding where to send what. Routing is a pure function over declared contracts.

### History

**At n=1** the history is the scrollback above your cursor. You can see what you asked, what the agent did, what tools it called. When you close the session it is gone, and that is fine, because tomorrow you are going to ask something different anyway.

**At n=N** history is load-bearing. Someone is going to ask, three weeks from now, why a file in the docs repo changed at 3:04 on a Tuesday. They are going to ask whether the change was caused by a Slack message or a GitHub push or a scheduled job or another agent firing. They are going to ask what the agent read, what it decided, what it wrote, and whether a human reviewed it. If you cannot answer those questions, you do not have an agent system. You have a haunted house.

The primitive this forces is an append-only event store *with causal edges*. Every event carries a pointer to the event that caused it, if any. A Slack mention causes an attempt-started event; the attempt-started causes a series of tool-called events; the tool-called events cause a domain event the agent emits; that domain event may cause a second attempt on a different agent. The result is a rooted tree, per inbound event, that records the entire causal chain end to end. You can walk it forward from the root ("show me everything that happened because that Slack message arrived") or backward from a leaf ("what chain of events produced this file edit?").

### Execution

**At n=1** execution is a synchronous loop. The agent runs, you watch, it finishes, you type again. If the process crashes, you rerun your last prompt.

**At n=N** execution has to survive concurrency, long-running jobs, engine timeouts, network blips, and a restart of the runtime process itself. The agent that was halfway through writing a report when the machine rebooted cannot simply start over — its tool calls may have been billed, its external side effects may have fired. The runtime has to know where it was, what it had committed, and whether to resume or retry from scratch.

The primitive this forces is a queue with lease-based claiming. Every inbound event turns into a queue item. Workers claim items with a lease — a time-bounded reservation renewed by heartbeats. If a worker dies, its lease expires and the item is reclaimed. Typed locks — on a context key, on a target branch — serialize agents that share state without serializing the whole system. Crash recovery inspects the git state on startup: if a commit was merged before the crash but the post-merge event persistence was not, the runtime resumes from persistence rather than re-executing the agent.

None of this is novel. It is the same queue-plus-worker pattern you would use for any background job system. The point is that once you have more than one execution in flight, you need it — and a chat loop does not give it to you.

## The scaffold is forty years old

The primitives the generalization forces are not new: a durable append-only log, declarative actors, causal message graphs, supervision and recovery. Event sourcing. The actor model. Supervision trees. All of this predates LLMs by decades. It survived contact with production distributed systems at scale. It is what serious people built when they had to run software continuously against real users and real money.

The mistake agent frameworks need to avoid is assuming that because the payload is new, the scaffold should be too. It should not. The right scaffold is the one that already survived, applied to a substrate that happens to produce tokens.

## Close

We built one of these at [.txt](https://dottxt.ai). We called it [Turbo](https://en.wikipedia.org/wiki/Turbo_button). It takes exactly the shape this post argues for: events are durable and causal, agents are Markdown documents with YAML contracts, the runtime owns the queue and the matching.

The thing that surprised us most is how cheap agents got once the substrate was right. Twenty or so are running in our registry — mostly go-to-market work: prospect research, LinkedIn and Twitter drafts, competitor and conference monitoring, OSS tracking. We are all engineers, but authoring an agent is a short Markdown file with a subscription and a prompt, which moves this kind of automation from quarterly project to afternoon of effort.

Obviously, being The Structured Outputs Company™, we are running `turbo` on our own product. It changes the economics of running a large registry in a way that is worth its own post, and we will write that one on [our blog](https://docs.dottxt.ai) next.

For now: if you are building background agents and it feels like you are fighting your framework, it is probably because you are using a chatbot substrate for a daemon problem.

I am Rémi Louf, CEO of [dottxt](https://dottxt.ai). Follow [@remilouf](https://x.com/remilouf) / [@dottxtai](https://x.com/dottxtai) for our work on reliable agent systems.

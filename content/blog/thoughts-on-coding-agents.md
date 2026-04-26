---
title: "The bottleneck was never the code"
date: 2026-04-29
---

The other month I finally ran an experiment we had been postponing for over a year at [.txt](https://www.dottxt.ai).

The goal was to test our structured-generation algorithms and their open-source counterparts, replacing the naive "does it accept this string?" with something closer to the real problem: "does it produce the right token distribution?"

The experiment kept coming up in conversation, then returning to the roadmap. Last month, I spent half an hour explaining the method to Codex. A few hours later, it had produced a working first version. That's all it took. 

Coding agents are transforming the way individuals write code. In a way, that has already happened. And yet I remain skeptical of the story people usually tell about what this means for software as an industry: that individual productivity gains will translate into the industry moving substantially faster. I have been stuck on that tension for months.

Time to re-read the classics.

---

> Impactful software tends to be written by many humans that need to collaborate.

Discussions on coding agents almost exclusively focus on the individual productivity gains. But collaboration is the interesting unit of analysis.

This is definitely not a new idea. Fred Brooks wrote about it in 1975 in *The Mythical Man Month*, and it was not new then; Gerald Weinberg introduced the idea in 1971 in *The Psychology of Computer Programming*. Software is what's left over after a group of humans finishes negotiating with each other about what the system should do. The code matters, but it is the residue of the harder work, not the work itself.

For fifty years the residue was expensive enough to keep our attention on it. Typing speed, language design, framework choice, IDE plugins, code review tooling were all about reducing the cost of the residue. With coding agents the cost has fallen far enough that we can see what's underneath: people trying to agree.

Negotiating, agreeing, communicating the shared picture of what we are building has become *the* work. And it's just as hard as it was.

---

> The Roadmap is the Limit

What slows down a team where agents do the implementation is the production of specifications precise enough for an agent to pick up and run. Roadmap, written down. Acceptance criteria, written down. The "what we actually want" forced into precision, be it via a test suite, a ticket, or a written design.

Your mileage may vary, but many managers I know are overwhelmed by this. Features get implemented at breakneck speed, and engineers are not waiting on other engineers anymore. They are waiting on the next well-formed spec. The bottleneck moves from the people writing the code to the people deciding what code should exist. Which is to say: management.

---

> Focus is saying no

And the surface that has to be agreed on is growing. Jevons Paradox: when something gets cheaper, you tend to use more of it, not less. When code gets 10x cheaper to write, we don't spend 10% of the effort on the same outcomes. We spend the same effort on outcomes that weren't worth pursuing before. Prototypes that would have been "not worth the time" three months ago get spun up in an afternoon. Internal tools that solve problems nobody quite had get built and forgotten.

Every vibe-coded product with 12 features is 11 features away from being great.

People can only absorb features at a certain rate, and that rate stays roughly the same whether the team ships ten features or fifty. Steve Jobs in 1997: *focus is about saying no*. Apple killed roughly seventy percent of its product line that year, and the company that came back was the one that had learned to subtract. The discipline got harder with agents; don't we all like the feeling of shipping a new feature?

---

> Context is gold.

All of that negotiation runs on something humans rarely think about: shared context.

Context is the commodity an organization runs on. It is the shared understanding of what we are building, why it matters, what has been tried, who decided what, what is load-bearing and what is vestigial. Humans on a team accrete it by osmosis. By being in the room, by reading the same Slack channel, by debugging the same outage at two in the morning. Most of it is never written down. When a senior engineer reviews a PR and says "this'll break the migration," they are drawing on context that has no document.

Agents cannot do osmosis. They do not get context by being in the room, by half-hearing the planning conversation, or by carrying the memory of the last incident. Whatever you do not manage to pack into the prompt, the file tree, the tools, or the explicit instructions, they do not reliably have. Without context, an agent will produce a plausible answer to a slightly wrong version of the question.

So when I find myself excited about an agent that did something useful at .txt, the honest accounting is that *we* did the context work. The next ten engineers will not have that picture by default. They will have it only to the extent we get serious about writing it down.

Context, the unwritten substrate organizations have always run on, is now the rate-limiting input. And the natural thing for humans to do is leave it implicit, because there was never anyone to read the explicit version.

---

> Real programmers don't document their programs.

Producing easily consumable context is precisely the thing humans don't like to do.

What may save us it that agents are unreasonably good at reading exhaustively. An agent will read every PR comment, every closed issue, every commit message, every stale design doc, every Slack archive, and extract patterns nobody bothered to write down because nobody was going to read them.

We have started building this at [.txt](https://www.dottxt.ai). Agents that crawl the codebase, the issues, the PRs, the threads, and produce a knowledge base of the implicit decisions, the conventions, the why-we-did-it-this-way that nobody had time to document. Not just "this module exists," but "this module is weird because the migration had to preserve old behavior," or "this benchmark matters because a previous optimization silently changed the distribution." Other agents use that knowledge base when they need to act on the codebase. The osmosis humans do informally is being externalized into something agents can read, and humans can too.

Agents that consume context need agents that produce it. Once that loop is running, the organization has a written substrate it would never have produced on its own. The constraint that was rate-limiting in the previous section stops being constant. Context becomes a thing you can produce more of.

Of course, this loop will only ever produce a partial picture. To quote Michael Polanyi: *we know more than we can tell*. Some load-bearing context exists precisely because it was never put into words, and writing it down would change what it is. The osmosis layer humans accrete in person is not fully recoverable from written exhaust. What comes out the other side is closer to a useful starting point than to a full recovery, and whether that is enough to compound is an empirical question I'm still testing. I think it is. I'm not sure.

---

> The new moat is organizational, not technical.

The companies that win the next decade will not necessarily have the best models or the best agent infrastructure. It will be the companies whose fifty people, then two hundred, then two thousand, can stay aligned on a shrinking set of decisions while shipping more output per head. They will be the ones that already knew, before agents arrived, that their hardest problem was coherence.

That is a culture and management problem. Always has been.

Every previous generation of tooling, whether IDEs, version control, CI, microservices, or devops, promised to solve coordination through better tools. Every one of them turned out to be a multiplier on whatever organizational coherence was already there. Small teams have coherence for free; the multiplier is uniformly positive there, which is why the loudest agent boosters tend to be small teams, and why they are mostly right about their own context. Past a certain size, coherence has to be produced and maintained, and the multiplier sharpens in both directions. Good orgs got better. Bad orgs got faster at ruining things.

Agents are a much bigger multiplier than any of those. The signal is going to be louder in both directions. They are overestimated as a way to make individuals write code faster, and underestimated as a way to make organizations externalize what they know.

---

Agents can feel like the extension of your own mind, and that feeling is exhilarating. The harder challenge is making them an extension of your company culture. That is a different problem and a different shape of work. It needs writing culture. It needs management thoughtful enough to identify where they remain a context bottleneck. It needs people who treat coherence as a real artifact to maintain. What's new is that some of those things are buildable now. The read-and-extract loop is one shape, and there will be others.

I'll report back on the experiment.

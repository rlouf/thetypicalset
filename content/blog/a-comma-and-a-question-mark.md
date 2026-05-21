---
title: "A comma and a question mark"
date: 2026-05-21
---

I've been using a terminal for more than two decades now, building muscle memory for `find` flags and `git` commands. I'm not sure how it happened, but reaching for `--help` has become less and less natural. Instead of typing the command I would start typing the *sentence*: "find the 5 largest files", "show me the last 3 commits". 

`command not found`

kept reminding me: computers can't talk. Or can't they? In the glorious age of slop, any(one)(thing) can talk. And sure it did; all it took was about a hundred lines of code to stitch together [zsh](https://www.zsh.org/), [llama-server](https://github.com/ggml-org/llama.cpp), [Qwen3.6](https://huggingface.co/Qwen), [Pi](https://pi.dev) and three commands:

- A comma for "give me a command"
- A question mark for "answer my question"

It was fun, easy, and only cost $7k for a M5 Max MBP with 128GB of unified memory.

## The comma

Now I can type a comma followed by plain English, a description of what I want to do. A few seconds later I get a short list of commands, each with a one-line explanation. I pick one, it drops onto my prompt line. I read it, maybe edit it, and press Enter myself.

![[img/shell-comma.gif]]

Of course, being the CEO of the [Structured Outputs Company™](https://dottxt.ai), I had to use a few tricks: [JSON Schema](https://json-schema.org/) to get a list of `{command, note}`, and some grammar fun to force the command prefixes (`ls`, `git`, etc.).

The thing answering my commas is a 27B parameter model running locally through llama.cpp. It is not a frontier model and it doesn't have to be. I'm not asking it to be brilliant; I'm asking it to propose four ways to list large files. Pinning the shape and a local model is more than enough, so is my laptop.

## The question mark

The question mark does a different job, so it gets a different tool.

![[img/shell-ask.gif]]

A question might be answered from what the model already knows, or it might need to read a file on my disk, or check something current on the web. So the question mark hands the prompt to a small local agent instead (the Amazing [Pi](https://pi.dev)). I've given it a deliberately narrow toolset: it can read files and it can search the web, and nothing else. No writing, no editing, no running shell commands. I want it to *look things up*, not erase my hard drive. The answer comes back rendered as markdown, right there in the terminal.

## It's not about what it can do

The comma never executes anything. It proposes; I dispose. The model is good enough to draft `git log --oneline --graph` and nowhere near trusted enough to run it unseen, so the command lands on my prompt line and waits for me to hit enter. One keystroke between "here's a candidate" and "yes, do that", full safety.

The two exclamation marks that *act* on instructions instead of suggesting commands are still cooking. Handing an agent permission to do things in my shell, rather than just look things up, is a different kind of evening, and I'm in no rush. That's a post for later.

## An evening well spent

I enjoyed implementing this a lot more than I'd like to admit. The whole thing runs with the wifi off, does not ask for a credit card. I still can't type a sentence into a shell and have it happen *safely*, but I am real close. Close enough. Computer still can't talk, but mine got a little better at helping me talk to it.

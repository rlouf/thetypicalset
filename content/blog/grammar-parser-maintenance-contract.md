---
title: "Tool calling, open source, and the M×N problem"
date: 2026-04-09
---

Tool calling with closed-source models is seamless. You pass a list of
functions to the API, the model calls them, you get structured JSON back. The
wire format is invisible to you.

Then you move to open models and discover that tool calling depends on a wire
format the engine has to understand. If the engine doesn't support that model's
format yet, the output comes back garbled: reasoning tokens in arguments,
malformed JSON, missing tool calls. Then you either wait, or write the parser
yourself.

## What "supporting a model" actually means

Every model family encodes tool calls differently.

Here's the same semantic operation, calling a function `search(query="GPU")`, in
three wire formats:

**[gpt-oss](https://github.com/openai/gpt-oss) (Harmony):**
```
<|channel|>commentary to=functions.search
<|constrain|>json<|message|>
{"query": "GPU"}
<|call|>
```

**DeepSeek:**
```
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>function<｜tool▁sep｜>search
'''json
{"query": "GPU"}
'''
<｜tool▁call▁end｜><｜tool▁calls▁end｜>
```

**[GLM5](https://huggingface.co/zai-org/GLM-5):**
```
<tool_call>search
<arg_key>query</arg_key><arg_value>GPU</arg_value>
</tool_call>
```

Same operation, incompatible wire formats: different token vocabularies,
boundary markers, and argument serialization schemes.

To return a nice array of JSON objects with the generated tool calls, you need
to parse the model output back into a clean API response. In practice, each of
the M applications (vLLM, SGLang, TensorRT-LLM, transformers, etc.) ends up
writing custom parsers for each model it wants to support. And that is only
half of the implementation burden.

## The pace of the problem

Gemma 4 is a good illustration of the difficulty involved. Its `<|channel>`
reasoning tokens get stripped by the decoder before the parser sees them ([vLLM
#38855](https://github.com/vllm-project/vllm/issues/38855)). Reasoning content
can leak into tool-call arguments ([vLLM PR
#39027](https://github.com/vllm-project/vllm/pull/39027)). The model's
non-standard format was different enough that llama.cpp had to abandon its
generic autoparser and build a dedicated implementation ([llama.cpp PR
#21418](https://github.com/ggml-org/llama.cpp/pull/21418)). These are
training-time format choices surfacing as parser bugs.

## Generic parsers are swimming against the current

The natural response is to build a parser generic enough to handle all formats.
Every engine has tried. A reasonable heuristic, say "find special tokens,
extract JSON between them," covers some formats well enough. But then
Harmony routes through `<|channel|>` with a `to=` attribute, and GLM5
serializes arguments as `<arg_key>`/`<arg_value>` pairs instead of JSON at all.

This is the fundamental problem: **wire formats are training-time decisions, and
nothing constrains them to a shared convention.** The space of possible formats
is open-ended, so a generic parser is trying to anticipate design choices that
haven't been made yet. That is why generic parsers help with the common cases
but do not eliminate the per-model tail, where the hard bugs live: reasoning
tokens leaking into arguments, decoders stripping special tokens before the
parser sees them, end-of-generation signals colliding with content.

The same model-specific format knowledge is also needed during generation, not
just after the fact when parsing the result. That is where grammar engines
enter the picture.

## The missing separation

When a new model ships, work happens in two independent places.

Grammar engines, like Outlines, XGrammar, and llama.cpp's grammar support, need to
know where to apply constraints during generation: which tokens mark the
tool-call envelope, when to activate structured generation inside it, and when
to leave the model unconstrained outside it.

Output parsers inside vLLM, SGLang, TensorRT-LLM, transformers need to do the
reverse: take the raw generated text and extract tool calls into a clean API
response. They need the same format knowledge in reverse.

These are different teams, different codebases, different release cycles. But
the model-specific knowledge they need is the same: which tokens mark the
boundaries, how arguments are serialized, where reasoning tokens can appear.
Today each team reverse-engineers this independently from chat templates and
(if they're lucky) documentation.

The result is N models × M implementations of the same format knowledge,
developed in parallel with no shared contract. A new model ships, and grammar
engine maintainers and inference engine maintainers both start the same
reverse-engineering work from scratch.

We have already seen the ecosystem converge on shared chat templates in
Hugging Face, standardizing how prompts and turns are formatted. Tool calling
needs the same kind of separation: not one wire format, but a shared
declarative way to describe them. Until that exists, each new model will keep
triggering the same reverse-engineering work across the stack.

The separation that's missing is extracting that shared format knowledge into
configuration rather than code. A model's wire format, its boundary tokens,
its argument serialization, and its reasoning token behavior, should be a
declarative spec that both grammar engines and parsers consume. The model
changes, you update the spec. The grammar engine and the parser don't move.

---
*I am Rémi Louf, CEO of [dottxt](https://dottxt.ai). Follow [@remilouf](https://x.com/remilouf) / [@dottxtai](https://x.com/dottxtai) for our work on structured generation and tool calling.*

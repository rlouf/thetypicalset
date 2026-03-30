---
title: "Design by manipulating mock code"
date: 2022-01-11
lastmod: 2022-01-11
aliases:
  - fff18475-59cb-445e-b738-069f59918aec
---

You should build API writing mock code, and manipulate said code [[an_api_is_good_when_you_do_not_think_about_it|until it feels natural]]. When you don't have the contraints of the backend is when you can really be creative. Start from first principle and then elaborate. I can spend **weeks** going over and over details of API. And you should because [[every_improvement_you_make_to_an_api_pays_huge_dividends|every improvement you make to an API pays huge dividends]].

Doing so you should [[constantly_share_progress_on_your_api_code|Constantly share progress on your API code]]

Let us take the case of [aesara](https://github.com/aesara-devs/aesara) and the looping primitive, `Scan`. The basic building block of `aesara` is the Op: an object that transforms variables into other variables. While it is tempting to copy [JAX's interface](https://jax.readthedocs.io/en/latest/notebooks/Common_Gotchas_in_JAX.html#while-loop) we still want to make the Ops salient. So without worrying a second about how things were going to be implemented I just worried about *what we would like to have* and ended with:

```python
import aesara

loop = aesara.while_loop(cond_fn, body_fn)
last_value, acc = loop(initial_value)

scan = aesara.scan(body_fn)
last_value, acc = scan(initial_val, sequence)
```

This should be done at the same time as [[implement_what_is_conceptually_correct|implementing what is conceptually correct]].

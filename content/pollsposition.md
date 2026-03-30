---
title: "Pollsposition"
aliases:
  - 51550685-38f7-4cbd-8fd4-bd0c5c293c04
---

Pollsposition was created by [Alex Andorra](https://twitter.com/alex_andorra) in 2017, and I joined in 2021 for the [popularity dashboard](https://pollsposition.com/popularity). The idea is to understand (and predict) political trends using data and bayesian statistics. Models were originally implemented in [PyMC](https://pymc.io), but I would like to re-implement them in [Aesara](https://github.com/aesara-devs/aesara). Aesara is more flexible, will hopefully have better (and faster) samplers for the kind of models we want to work with... and is in need of a (public) flagship project.

# TODO Port model for president's popularity to Aesara
# TODO Port the poll averaging model to Aesara
# TODO Who do uncertain people vote for?
# TODO Implement the model to compute pollster bias
# TODO Ecological inference using election results
What is done in this [[blog/drafts/presidentielles-report-voix|draft]] for instance.

# References

- [Pollsposition on Twitter](https://twitter.com/pollsposition)

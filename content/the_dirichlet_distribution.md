---
title: "The Dirichlet distribution"
tags:
  - public
aliases:
  - 32caa45b-3668-493f-b193-a244ced47363
---

tags: [[probability_distribution|Probability distribution]]

*Is it to proportions what Multinomial is to number in categories?*

# Interpretation

Let us consider an urn with $K$ different colors. There are $\alpha_1$ balls of the first colors, ..., $\alpha_K$ balls of the \$K\$th color. We draw $N$ balls from this urn using the following protocol:

1.  Pick one ball
2.  Return the ball to the urn
3.  Add another ball of the same color to the urn

When $N$ is very large, the proportions of balls of different colors are distributed according to $\operatorname{Dirichlet}(\mathbf{\alpha})$.

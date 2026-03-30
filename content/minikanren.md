---
title: "miniKanren"
aliases:
  - f4cf39be-6c6a-4a9d-804a-3879a98177bc
---

[[http:/minikanren|miniKanren]] is a DSL for [[relational_programming|relational programming]]. It can be used to *declare* the relations between the parameters of a problem, and let the computer find the values of the parameters that satisfy these relations. While the original implementation is in Scheme, I will be focusing in these notes on [an implementation](https://github.com/pythological/kanren) in [[python|Python]].

# Learn

The goal is to fully understand the python implementation. Here's a diagram that roughly summarizes what I need to understand:

![[img/kanren-learning.png]]

## TODO [[unification|Unification]]
## TODO [[walko|walko]]
## TODO [[condp|condp]]
# Projects

## Term rewriting

I am using miniKanren in the following contexts/projects:

- In [AeMCMC](https://github.com/aesara-devs/aemcmc) to walk through the possible parametrizations of a probabilistic model to find the most efficient sampler;
- In [Aesara](https://github.com/aesara-devs/aesara) to simplify computation graphs.

## Solving puzzles

Puzzles are a good introduction to relational programming: they have a fixed number of rules, were designed to be solved by humans.

- To solve the Zebra riddle ([[blog/zebra-riddle-kanren|blog post]]).
- To solve Sudoku puzzles ([[blog/solve-sudokus-kanren|blog post]])
  - The solver returns correct solution
  - *Hangs for simple grids*. [[condp|condp]] should help with this.
- To solve the NYT's [Spelling Bee](https://www.nytimes.com/puzzles/spelling-bee) ([[blog/drafts/solve-spelling-bee-kanren|draft]])
- A [Wordle](https://www.nytimes.com/games/wordle/index.html) solver (TODO)
- [Miracle Sudoku](http://www.hakank.org/picat/miracle_sudoku.pi) (TODO)
- [Knight's tour](http://www.cs.trincoll.edu/~ram/cpsc352/notes/prolog/knightstour.html), a chess puzzle where we need to find a way for a knight to step on every square of a chessboard, only once (TODO).
- The [N-Queen problem](https://okmij.org/ftp/Prolog/QueensProblem.prl), which is to position N queens on a NxN chessboard such that no queen beats the others. (TODO)

## Bitmaps generation

- To connect two points with a line (e.g. Brownian bridge)
- To implement a declarative version of the [[wavefunctioncollapse_algorithm|WaveFunctionCollapse algorithm]]
  - I get a [RecursionError](https://github.com/pythological/kanren/issues/59) for > 1000 pixels (we will need [[trampoline_evaluation|Trampoline Evaluation]])
  - The memory usage increases very quickly
  - Performance needs to be improved
- To implement the [[markovjunior_algorithm|MarkovJunior algorithm]]
  - I need to understand [[walko|walko]]
  - Same performance concerns as with the [[wavefunctioncollapse_algorithm|WaveFunctionCollapse algorithm]]

## Gardening

Gardening is typically an area where we are trying to find solutions that satisfy some constraints. We could definitely use miniKanren to plan garden if the search scaled : we can enter informations about the different plants in a database, then some information about the garden we are trying to design, and look at the combinations that come out of it.

# References

- The Reasoned Schemer (2nd ed.)
- [Proceedings of the 2019 Workshop on miniKanren and relational programming](https://dash.harvard.edu/bitstream/handle/1/41307116/tr-02-19.pdf?sequence=1&isAllowed=y#page=5) including *towards a miniKanren with fair search strategies*
- "Neural Guided Constraint Logic Programming for Program Synthesis" ([paper](https://proceedings.neurips.cc/paper/2018/file/67d16d00201083a2b118dd5128dd6f59-Paper.pdf))
- "A surprisingly competitive conditional operator" ([paper](https://www.brinckerhoff.org/scheme2018/papers/Boskin_Ma_Christiansen_Friedman.pdf))
- "$\mu\text{Kanren}$: a functional core for relational programming\$" ([paper](http://webyrd.net/scheme-2013/papers/HemannMuKanren2013.pdf) [repo](https://github.com/jasonhemann/microKanren))
- Faster miniKanren ([repo](https://github.com/michaelballantyne/faster-minikanren))
- Temporal logic programming with miniKanren ([repo](https://github.com/nathanielrb/ftmicroKanren))
- cKanren: miniKanre with constraints ([paper](http://www.schemeworkshop.org/2011/papers/Alvis2011.pdf))
- "A unified approach to solving 7 programming problems" ([paper](https://dl.acm.org/doi/pdf/10.1145/3110252))
- AskHN: Why logic programming is not widely used in the industry? ([post on HN](https://news.ycombinator.com/item?id=29521109))
- Clojure's [core.logic](https://github.com/clojure/core.logic) is a miniKanren implementation in Clojure.
- "A relational language - Parasat" ([post](https://davidpratten.com/2019/03/18/a-logic-language-parasat/)) The authors starts from the logic programming language Picat and ends up suggesting something that's close to miniKanren. We also learn that William Byrd recommended the autho tries faster-miniKanren.

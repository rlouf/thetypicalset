---
title: "Navigate linked notes"
lastmod: 2022-05-31
aliases:
  - 7dae4406-eb94-4496-93e1-a989cab14729
---

While navigating in a densely linked cluster of notes almost feels cozy, I bump into two major difficulties when I navigate the landscape:

1.  I have very different centers of interests which leads to **loosely connected, if at all, clusters of nodes**.
2.  It is cumbersome to navigate between notes that are not directly linked but treat topics that are **conceptually similar**. See the [[squared_exponential_kernel|Squared exponential kernel]] and [[gaussian_noise_kernel|Ornstein-Uhlenbeck kernel]]: they are both referenced on the [[gaussian_process|gaussian process]] page but there is no way to know they are related when visiting either of these notes.

I believe these difficulties can be solved elegantly using representations of the notes' graph structure. The way we link notes to one another contains enough information to help us navigate: it can tell us which nodes are important (centrality), which nodes are related (community) and which give context (neighborhood).

# Use the full graph as a map

Wherever we are in the garden we should be able to pull its map, the network of notes, and be able to jump to another location should we want to.

![[img/explore-notes-global.svg]]

We use the [PageRank algorithm](https://en.wikipedia.org/wiki/PageRank) to determine the size of the nodes: this measure of centrality will naturally highlight summary notes (such as "[[gaussian_process|Gaussian process]]" or "[[chess|Chess]]") *as links to and from these notes accumulate*.

Instead of using tags to infer topics we can use a *community detection algorithm* to infer which nodes are conceptually related. For instance we can color nodes based on the community to which they belong. A decent force-based graph layout should separate the communities spatially on the page.

# Show a map of local neighbours in each note

The backlinks at the end of each note are useful, but we can take one step further and show the local neighborhood of the note instead:

![[img/explore-notes-local.svg]]

We learn from the *context* of the current note by displaying the node's parents and the parent's other children. According to [this blog post](https://ag91.github.io/blog/2020/09/04/the-poor-org-user-spaced-repetition/) and the [org-roam documentation](https://www.orgroam.com/manual.html#org_002droam_002dgraph) we can display the N-neighborhood of any node as a `svg` figure using Graphviz. For instance for the 2-neighborhood: 7dae4406-eb94-4496-93e1-a989cab14729

```elisp
(org-roam-graph 1  (org-roam-node-at-point))
```

See [the implementation of org-roam-graph](https://github.com/org-roam/org-roam/blob/3782e88d50f83c5b9fbb4b10df71df3f37e27156/extensions/org-roam-graph.el) which we may be able to modify to suit our needs.

# Navigation through the notes

We can use [Jethro Kuan's theme](https://github.com/jethrokuan/cortex/blob/5e5fd537bed363d12fa297a4b1603ff56dbf397b/assets/js/page.js) for hugo but the navigation is completely backwards and unintuitive. Clicking on a backlink appends a new note to the right. Instead we should probably act as if all the open notes are steps in a walk. A bit like what [Andy Matuschak](https://notes.andymatuschak.org/z6bci25mVUBNFdVWSrQNKr6u7AZ1jFzfTVbMF?stackedNotes=z6UDDkom8Aifg6mLdjT1sPtbMBweCmpyTwmJT&stackedNotes=z3SjnvsB5aR2ddsycyXofbYR7fCxo7RmKW2be&stackedNotes=z6cFzJWgj9vZpnrQsjrZ8yCNREzCTgyFeVZTb&stackedNotes=z2HUE4ABbQjUNjrNemvkTCsLa1LPDRuwh1tXC&stackedNotes=z68tVM68dEAuH4acs7HY6K76tTVzBdoBGKMZB&stackedNotes=z3RzQhmjeRxXVAAy81aUSKARwJL8dikdJG4VG&stackedNotes=z28QkpK3vRKQTacjFDfGYBhCXHqHuVWJzny9&stackedNotes=z3x7AvJgYzmgEY4kcKdSY2aYxdqWYpTyPqRs8) does.

# More

Using the graph and its *properties* to navigate through the notes opens new possibilities. For instance we could design and display a "creativity" score that measures to what extent a note references notes on different topics.

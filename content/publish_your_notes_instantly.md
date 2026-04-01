---
title: "Publish your notes instantly"
aliases:
  - 9b92383e-727d-4d16-9591-9730222e2d5c
---

There should be as little friction as possible between the act of writing and the act of publishing. Notational velocity is essential, publicational velocity is paramout:

- You cannot hide clutter on a web browser;
- Publishing gives you a broader perspective. Being able to navigate through one's notes in a browser gives a perspective that you cannot get in a text editor. This is not just about finding typos or adding a few links, but about breaking down notes, merging some ideas, and sometimes gettings new ideas. It helps you [[how_to_take_notes|write better notes]].
- Publishing is rewarding. It helps create a habit: the more you publish the more you will want to write.
- [[progress_is_better_measured_in_small_chunks|Progress is better measured in small chunks]], and published notes are proofs of your thinking evolving.

# Publishing the typical set

Here are the steps that I will follow after I am done typing these words:

- Save the file `:wq`
- Open Magit `<SPC> g g`
- Stage the changes `S`
- Commit the changes `c c`
- Enter a commit message
- Push the commit to Github `p p`

That's all! Github then [builds the website](https://github.com/rlouf/thetypicalset/blob/main/.github/workflows/deploy.yml) from the org files automatically. I use git only to be able to publish the website easily, and prevent conflicts. The commits do not mean anything as units; I could write some `elisp` to commit and push automatically but I do like a little friction in the process.

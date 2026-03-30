---
title: "Choose what to work on"
date: 2022-04-06
lastmod: 2022-04-06
aliases:
  - 9debe0fb-a3e2-4017-a9af-72d90f54ab89
---

When you have [[what_i_am_working_on|many interests]] the process of choosing what to work on next can be overwhelming. Most people implicitly delegate this process: do whatever most important person wants me to do. This removes pressure off of one's shoulders, and this is the idea behing organization systems like Getting Things Done: wear your planner hat every evening / Friday evening and execute the rest of the time. But that works well in a system where there are external reasons to prioritize some items. What GTD, etc. are planning for is *execution*, not plannification itself.

I however, pursue many activities for which I have no external pressure, with unpredictable rewards:

- Writing / completing / connecting [[zetteltasken|Zetteltasken]] notes;
- Working on [[blog/index|blog posts]]. I have a [[inbox|list of topics]] that I'd like to write about, but no clear priority;
- Working on notebooks;
- Elaborating on topics I've accumulated for creative writing
- What to read out of my reading list (although [[items_in_your_reading_list_should_be_turned_into_notes|each reading item could be made into a new note]])
- What open source projects to focus on a particular week;

It mostly does not matter how the next task is chosen. In this case I think that asking the computer to choose for you helps avoid [choice overload](https://en.wikipedia.org/wiki/Overchoice), frequent among knowledge workers.

The tool of choice here is *spaced repetition*, which is mostly used to learn stuff, but can also be used as a way to develop a concept and refine it over time. [this blog post](https://ag91.github.io/blog/2020/09/04/the-poor-org-user-spaced-repetition/) describes how to do it with emacs:

```elisp
(defun my/space-repeat-if-tag-spaced (e)
  "Resets the header on the TODO states and increases the date
according to a suggested spaced repetition interval."
  (let* ((spaced-rep-map '((0 . "++1d")
                          (1 . "++2d")
                          (2 . "++10d")
                          (3 . "++30d")
                          (4 . "++60d")
                          (5 . "++4m")))
         (spaced-key "spaced")
         (tags (org-get-tags nil t))
         (spaced-todo-p (member spaced-key tags))
         (repetition-n (first (cdr spaced-todo-p)))
         (n+1 (if repetition-n (+ 1 (string-to-number (substring repetition-n (- (length repetition-n) 1) (length repetition-n)))) 0))
         (spaced-repetition-p (alist-get n+1 spaced-rep-map))
         (new-repetition-tag (concat "repetition" (number-to-string n+1)))
         (new-tags (reverse (if repetition-n
                                (seq-reduce
                                 (lambda (a x) (if (string-equal x repetition-n) (cons new-repetition-tag a) (cons x a)))
                                 tags
                                 '())
                              (seq-reduce
                               (lambda (a x) (if (string-equal x spaced-key) (cons new-repetition-tag (cons x a)) (cons x a)))
                               tags
                               '())))))
    (if (and spaced-todo-p spaced-repetition-p)
      (progn
          ;; avoid infinitive looping
          (remove-hook 'org-trigger-hook 'my/space-repeat-if-tag-spaced)
          ;; reset to previous state
          (org-call-with-arg 'org-todo 'left)
          ;; schedule to next spaced repetition
          (org-schedule nil (alist-get n+1 spaced-rep-map))
          ;; rewrite local tags
          (org-set-tags new-tags)
          (add-hook 'org-trigger-hook 'my/space-repeat-if-tag-spaced))
        )))

(add-hook 'org-trigger-hook 'my/space-repeat-if-tag-spaced)
```

which we will need to adapt to work with zetteltasken notes in org-roam.

**Note:** We can turn the implementation details into a [[blog/index|blog post]], as [[blog_posts_are_allowed_to_become_stale|blog posts are allowed to become stale]]. And use [Org-transclusion](https://github.com/nobiot/org-transclusion) to include related notes, including this one.

---
title: "Temporary figures in org-mode"
aliases:
  - d8f8c0db-3bac-4e45-833f-9af161529428
---


When I start exploring a topic I often have to plot figures that I probably won't keep. I thus don't want to have to find a name for these figures. Luckily there is a very simple solution; we can indeed use the `org-babel-temp-file` function to generate a random file location. For instance for a svg file:

```elisp
(org-babel-temp-file "figure" ".svg")
```

```text
/tmp/babel-wLDRPY/figurehXnHv9.svg
```

All we need to do is set the `filename` variable to be the result of this function in the source block header:

```python
#+begin_src python :session :results file :exports both :var filename=(org-babel-temp-file "figure" ".png")
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(-10, 10, 1000)
square = np.square(x)

fig, ax = plt.subplots()
ax.plot(x, square, color='black')
ax.set_xlabel('x')
ax.set_ylabel(r'$x^2$')

plt.savefig(filename)
filename
#+end_src
```

![[file:///tmp/babel-6TNZFG/figure6VQW3J.png]]

To avoid copying the headers for every source block I add this at the top of my org file:

```org
```

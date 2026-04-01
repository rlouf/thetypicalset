---
title: "XML is currently the best model-side format"
---

Models are extensively trained on HTML and XML. Closing tags are unambiguous fact boundaries — they signal completion of a specific named value, not completion of the entire structure. No bracket counting. No comma prediction. Better facts-per-token ratio than JSON. The irony is that the industry chose JSON for LLM output because JSON is the dominant data interchange format, not because it is a good generation format. The generation problem and the interchange problem are different problems, and the answer to each is different.

([[model-space-transport-space|Model space and transport space have always been conflated]] · [[facts-not-objects|The fundamental unit of LLM output is a fact, not an object]])

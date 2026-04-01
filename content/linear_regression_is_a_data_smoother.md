---
title: "Linear regression is a data smoother"
aliases:
  - d25362a3-6f0c-4b00-98fa-13307b2cf217
---


Let us consider the simpler linear regression $r(x) = \alpha + \beta\, x$. The ordinary least square solution gives

```
\begin{equation}
   \hat{\beta} =\frac{\sum_{i} y_{i}\,x_{i}}{\sum_{i}x_{i}}
 \end{equation}
```
The estimated regression function is thus:

```
\begin{equation}
   \hat{r}(x) = \sum_{i} y_{i} \frac{x_{i}}{n\, s_{X}^{2}} x
 \end{equation}
```
where $s_{X}^2$ is the sample variance of X. The prediction is a weighted average of the observed values of the dependent variable where the weights are proportional to how far the $x_i$ is from the center, relative to the variance, and proportional to $x$.

It is a special case of the **linear smoothers** which are estimates of the regression function as:

```
\begin{equation}
   \hat{r}(x) = \sum_{i} y_{i} \hat{\omega}(x_{i, x})
 \end{equation}
```
# Reference

- [Notes of Cosma Shalizi on regression](https://www.stat.cmu.edu/~cshalizi/uADA/12/lectures/ch01.pdf)

---
title: "Conjugate distributions"
aliases:
  - 985512a7-208a-4dad-90fd-1c922905aabb
---

A pair of a sampling distribution and prior distribution are said to be a *conjugate pair* if the resulting posterior distribution belongs to the same parametric family of distributions than the sampling distirbution. The prior distribution is said to be a *conjugate prior* to the sampling distribution.

# Beta distribution

The [[beta_distribution|Beta distribution]] is a conjugate prior to:

- Geometric
- Binomial
- Negative Binomial
- Bernoulli

# Gamma distribution

The [[gamma_distribution|Gamma distribution]] is a conjugate prior to:

- Exponential

- Lognormal

- Poisson

  ```latex
  \begin{align*}
    P(\lambda | Y=y) &= \frac{P(Y=y|\lambda) P(\lambda | \alpha, \beta)}{Z}\\
                     &= \frac{1}{Z} \frac{\lambda^y e^{-\lambda}}{y!} \frac{1}{\Gamma(\alpha)} \beta^\alpha \lambda^{\alpha-1} e^{-\beta \lambda} \\
                     &= \frac{1}{Z} \frac{1}{y! \Gamma(\alpha)} \beta^\alpha \lambda^{(\alpha+y)-1} e^{-(\beta+1) \lambda} \\
                     &= \frac{\lambda^{(\alpha+y)-1} e^{-(\beta+1) \lambda}}{Z'}\\
  \end{align*}
  ```

  ```
  #+RESULTS:
  ```
  ```
  \begin{align*}
     P(\lambda | Y=y) &= \frac{P(Y=y|\lambda) P(\lambda | \alpha, \beta)}{Z}\\
                      &= \frac{1}{Z} \frac{\lambda^y e^{-\lambda}}{y!} \frac{1}{\Gamma(\alpha)} \beta^\alpha \lambda^{\alpha-1} e^{-\beta \lambda} \\
                      &= \frac{1}{Z} \frac{1}{y! \Gamma(\alpha)} \beta^\alpha \lambda^{(\alpha+y)-1} e^{-(\beta+1) \lambda} \\
                      &= \frac{\lambda^{(\alpha+y)-1} e^{-(\beta+1) \lambda}}{Z'}\\
   \end{align*}
  ```

Where $Z'$ is the integral over $\lambda$ of the numerator; we recognize $\operatorname{Gamma(\alpha+y, \beta+1)}$.

- Normal
- Gamma

# Normal distribution

The [[normal_distribution|Normal distribution]] is a conjugate prior to:

- Normal
- Lognormal

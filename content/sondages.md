---
title: "Sondages"
aliases:
  - caa75bbb-8383-44f0-a2b7-2b2ab24267fb
---

We want to display the latest polls as well as some additional information that should help people undestand the results better. In particular:

- Voter turnout (a feature that is often asked);
- A reasonable estimation of the error;
- The probability to go to 2nd round;

# Estimate the error

We use a Dirichlet-Multinomial model to represent the data generating process. We note $\vec{p} = (p_1, \dots, p_N)$ the respective probabilities of voting for either of the candidates, $\vec{\alpha} = (\alpha_1, \dots, \alpha_n)$ the corresponding concentration parameters. The number of votes observed for each candidate is given by:

```latex
\begin{align*}
  \vec{p} \sim \operatorname{Dirichlet}(\vec{\alpha})
  \vec{N} \sim \operatorname{Multinomial}(\vec{p}, N_{tot})
\end{align*}
```

It turns out (surprise!) that the Dirichlet distribution is the conjugate prior of the Multinomial distirbution so that the posterior is also a Dirichlet distribution:

```latex
\begin{align*}
  \vec{p} \sim \operatorname{Dirichlet}(\vec{N} + \vec{\alpha})
\end{align*}
```

We are interested in displaying the marginals, i.e. $P(p_i|\vec{N})$. If we call $\alpha_0 = \sum_i \alpha_i$ we can write

```latex
\begin{align*}
  p_i \sim \operatorname{Beta}(N_i + \alpha_i, N_{tot} - N_i + \alpha_0 -\alpha_i)
\end{align*}
```

From which the HDI can be easily computed using eg [scipy](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.beta.html).

## Choice of prior

Jeffrey prior is $\alpha_i = 1/2$, *but* we do have prior information on the different candidates. We know that Arthaud and Poutou, for instance, are more likely to be between 0 and .05. We also know it is unlikely that anyone will be above .4

How do we elicit this prior?

# Estimate the probability that the candidate will go to second tour?

Take posterior predictive samples for the $N_i$. Count the number of times the candidate is in the top 10. Run \~100k simulations (< 1s par sondage).

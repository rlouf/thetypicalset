---
title: "Mass matrix acts on the correlation between position variables"
date: 2022-05-16
lastmod: 2022-05-16
aliases:
  - 1c40703b-58a0-4493-9cc7-b45b6d62ffdc
---

tags: [[hamiltonian_monte_carlo|Hamiltonian Monte Carlo]]

Assume we have an estimate $\Sigma$ of the covariance matrix for $q$. One way to improve sampling is to transform the $q$ so their covariance matrix is close to identity. To do this we write the Cholesky decomposition:

```
\begin{equation*}
 \Sigma = L^T\,L
\end{equation*}
```
and write $q' = L^{-1}\,q$. If we use $K(p) = p^{T}\,p\;/2$ we have independent momenta, almost independent positions and HMC should perform well with a small number of leapfrog steps. This transformation is equivalent to using $\Sigma$ as the inverse mass matrix:

```
\begin{equation*}
 K(p)  = p^{T}\,\Sigma\,p\; / 2
\end{equation*}
```
# References

- Neal Radford, MCMC using Hamiltonian dynamics (p 22)
- C.H. Bennet, Mass tensor molecular dynamics

---
type: "weekly-note"
series: "Note of the Week"
week: 3
published: 2026-11-23
from: "The Mathematical Lab · Part 3 · Algebra I"
chapter:
  - "[[1108-Sequence and Series]]"
tags:
  - "ch/sequences-series"
  - "jee/advanced"
  - "idea/telescoping"
---

# Telescoping Series

> [!abstract] The result
> If the general term can be written as $T_n = V(n) - V(n+1)$ for some function $V$, then
> $$\sum_{n=1}^{N} T_n = V(1) - V(N+1)$$
> Every middle term cancels, like a telescope folding shut.

**Key idea:** there is no formula to memorise. The skill is to *see* $T_n$ as a difference of the same function at two neighbouring places. Most often that difference comes from [[Partial Fractions]] or a clever factorisation like the one in [[The Sophie Germain to Abel's Summation]].

## The archetype in three steps
Find $S_{10} = \dfrac{1}{1 - 3\cdot1^2 + 1^4} + \dfrac{2}{1 - 3\cdot2^2 + 2^4} + \dfrac{3}{1 - 3\cdot3^2 + 3^4} + \dots$ (10 terms).

**1. Factor the denominator.** Here $T_n = \dfrac{n}{n^4 - 3n^2 + 1}$. Complete the square:
$$n^4 - 3n^2 + 1 = (n^2 - 1)^2 - n^2 = (n^2 - n - 1)(n^2 + n - 1).$$

**2. Make the numerator the difference of the factors.** $(n^2 + n - 1) - (n^2 - n - 1) = 2n$, so
$$T_n = \frac12\left[\frac{1}{n^2 - n - 1} - \frac{1}{n^2 + n - 1}\right].$$

**3. Spot $V$ and collapse.** With $V(n) = \dfrac{1}{n^2 - n - 1}$, we get $V(n+1) = \dfrac{1}{n^2 + n - 1}$. So $T_n = \frac12[V(n) - V(n+1)]$ and
$$S_{10} = \tfrac12\,[V(1) - V(11)] = \tfrac12\left[-1 - \tfrac{1}{109}\right] = -\frac{55}{109}. \quad \blacksquare$$

## Check it with numbers
- $\displaystyle\sum_{n=1}^{99} \frac{1}{n(n+1)} = \sum \left(\frac1n - \frac1{n+1}\right) = 1 - \frac{1}{100} = \frac{99}{100}$.
- Factorials: $\dfrac{n}{(n+1)!} = \dfrac{1}{n!} - \dfrac{1}{(n+1)!}$. For 3 terms: $\frac12 + \frac26 + \frac3{24} = \frac{23}{24} = 1 - \frac{1}{4!}$.
- Adding the archetype's 10 terms one by one also gives $-\frac{55}{109}$ (the first term alone is $-1$).

## In class
- **Where it appears:** rational terms whose denominator factors into "neighbours", $\tan^{-1}$ sums written as $\tan^{-1}x - \tan^{-1}y$, trig sums like $\dfrac{1}{\cos n\theta\,\cos(n+1)\theta}$, and $n$ mixed with $n!$.
- **The trap:** the cancellation is not always with the very next term. If $T_n = V(n) - V(n+2)$, *two* terms survive at each end. Write out the first few and last few terms before you cancel.
- **Try:** $\displaystyle\sum_{n=1}^{\infty} \frac{n}{n^4 + 4}$. *(Answer: $n^4 + 4 = (n^2 - 2n + 2)(n^2 + 2n + 2)$, and the factors differ by $4n$. With $g(n) = \frac{1}{(n-1)^2 + 1}$, $T_n = \frac14[g(n) - g(n+2)]$. Two terms survive: $\frac14[g(1) + g(2)] = \frac14\left(1 + \frac12\right) = \frac38$.)*

---

## Your turn: link it into your brain
This note is **your copy**. Change anything. The original stays in AK's Lab.
1. **Read** it once with a pen in hand.
2. **Link:** click [[Partial Fractions]] and [[The Sophie Germain to Abel's Summation]]. If you don't have those notes yet, Obsidian creates them. Write 3 lines in each in your own words.
3. **Connect:** add one link to a note of yours where a sum collapsed (a question, a lecture, a trick).
4. **Modify:** add your own example or classroom story below.

### My notes
-

---
*Note of the Week · from The Mathematical Lab · AK · Stay Mathactive · mathemission.in*

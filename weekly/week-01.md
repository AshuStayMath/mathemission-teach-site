---
type: "weekly-note"
series: "Note of the Week"
week: 1
published: 2026-11-09
from: "The Mathematical Lab · Part 1 · Sets, Relations & Functions"
chapter:
  - "[[1201B-Types of Functions]]"
tags:
  - "ch/functions"
  - "jee/advanced"
  - "idea/floor-function"
---

# Hermite's Identity

> [!abstract] The identity
> For every real $x$ and every positive integer $n$,
> $$\sum_{k=0}^{n-1} \left\lfloor x + \frac{k}{n} \right\rfloor = \lfloor nx \rfloor$$

**Key idea:** split $x$ into its integer part and its [[Fractional Part]]. The integer part passes straight through the [[Floor Function]], so only the fractional part needs thought.

## Proof in three steps

**1. Remove the integer part.** Write $x = \lfloor x \rfloor + f$, where $0 \le f < 1$. An integer comes out of a floor unchanged, so both sides gain the same $n\lfloor x \rfloor$. It is enough to prove
$$\sum_{k=0}^{n-1} \left\lfloor f + \frac{k}{n} \right\rfloor = \lfloor nf \rfloor.$$

**2. Locate $f$.** Choose the integer $j$ with $\dfrac{j}{n} \le f < \dfrac{j+1}{n}$. Then $\lfloor nf \rfloor = j$.

**3. Count the 1s.** Each term $\left\lfloor f + \frac{k}{n} \right\rfloor$ is $0$ or $1$, because $f + \frac{k}{n} < 2$.
- For $k \le n-j-1$: $f + \frac{k}{n} < \frac{j+1}{n} + \frac{n-j-1}{n} = 1$, so the term is $0$.
- For $k \ge n-j$: $f + \frac{k}{n} \ge \frac{j}{n} + \frac{n-j}{n} = 1$, so the term is $1$.

That leaves exactly $j$ terms equal to $1$, so the sum is $j = \lfloor nf \rfloor$. $\blacksquare$

## Check it with numbers
- $x = 1.7,\ n = 3$: $\lfloor 1.7 \rfloor + \lfloor 2.03 \rfloor + \lfloor 2.37 \rfloor = 1 + 2 + 2 = 5 = \lfloor 5.1 \rfloor$.
- $n = 2$ gives a favourite: $\lfloor x \rfloor + \left\lfloor x + \tfrac12 \right\rfloor = \lfloor 2x \rfloor$.
- $\displaystyle\sum_{k=0}^{9} \left\lfloor \pi + \frac{k}{10} \right\rfloor = \lfloor 10\pi \rfloor = 31$. Nine terms are $3$ and one is $4$.

## In class
- **Where it appears:** sums of floors with equally spaced shifts, often disguised as $\displaystyle\sum_{k=0}^{n-1}\left\lfloor \frac{m+k}{n}\right\rfloor$ with $x = \frac{m}{n}$.
- **The trap:** students try to evaluate each floor separately. Show them the "split off the fractional part" move first. It is the whole proof.
- **Try:** $\displaystyle\sum_{k=0}^{99} \left\lfloor \frac13 + \frac{k}{100} \right\rfloor$. *(Answer: $\lfloor 100/3 \rfloor = 33$.)*

---

## Your turn: link it into your brain
This note is **your copy**. Change anything. The original stays in AK's Lab.
1. **Read** it once with a pen in hand.
2. **Link:** click [[Fractional Part]] and [[Floor Function]]. If you don't have those notes yet, Obsidian creates them. Write 3 lines in each in your own words.
3. **Connect:** add one link to a note of yours where floors appear (a question, a lecture, a trick).
4. **Modify:** add your own example or classroom story below.

### My notes
-

---
*Note of the Week · from The Mathematical Lab · AK · Stay Mathactive · mathemission.in*

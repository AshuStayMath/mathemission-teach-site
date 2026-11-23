---
type: "weekly-note"
series: "Note of the Week"
week: 2
published: 2026-11-16
from: "The Mathematical Lab · Part 1 · Sets, Relations & Functions"
chapter:
  - "[[1201B-Types of Functions]]"
tags:
  - "ch/functions"
  - "jee/main"
  - "idea/absolute-value"
---

# The Maximum of Two Functions

> [!abstract] The formula
> For any two real numbers (or functions) $f$ and $g$,
> $$\max(f, g) = \frac{f + g + |f - g|}{2}, \qquad \min(f, g) = \frac{f + g - |f - g|}{2}$$

**Key idea:** every pair of numbers is "the midpoint, plus or minus half the gap". The gap is $|f - g|$, the [[Absolute Value]] of the difference. So the larger one is the midpoint plus half the gap, and the smaller one is the midpoint minus half the gap.

## Why it works, in three steps

**1. Start at the middle.** On a number line, the midpoint of $f$ and $g$ is $\dfrac{f+g}{2}$.

**2. Measure the gap.** The distance between them is $|f - g|$, so each one sits $\dfrac{|f-g|}{2}$ away from the midpoint.

**3. Step right for the max.** Adding half the gap lands on the larger number. Check both cases:
- If $f \ge g$: $|f-g| = f-g$, so $\dfrac{f+g}{2} + \dfrac{f-g}{2} = f$.
- If $g > f$: $|f-g| = g-f$, so $\dfrac{f+g}{2} + \dfrac{g-f}{2} = g$.

Either way we get the larger number. Stepping left instead gives the min. $\blacksquare$

## Check it with numbers
- $\max(3, 7) = \dfrac{10 + 4}{2} = 7$ and $\min(3, 7) = \dfrac{10 - 4}{2} = 3$.
- $\max(-2, -5) = \dfrac{-7 + 3}{2} = -2$. Works for negatives too.
- $\max(x, -x) = \dfrac{0 + |2x|}{2} = |x|$. So the modulus function is itself a maximum.
- Adding the two formulas: $\max(f,g) + \min(f,g) = f + g$.

## In class
- **Where it appears:** graphs and integrals of $\max\{f(x), g(x)\}$ or $\min\{f(x), g(x)\}$. The formula turns a "piecewise" function into one expression, and it shows exactly where the corner is: where $f = g$, because that is where $|f-g|$ has its kink.
- **The trap:** students try to integrate $\max\{f, g\}$ as one curve. First find where $f = g$, then split the interval and take the upper curve on each piece.
- **Try:** $\displaystyle\int_0^2 \max\{x, x^2\}\,dx$. *(Answer: on $[0,1]$, $x \ge x^2$; on $[1,2]$, $x^2 \ge x$. So $\frac12 + \frac73 = \frac{17}{6}$.)*

---

## Your turn: link it into your brain
This note is **your copy**. Change anything. The original stays in AK's Lab.
1. **Read** it once with a pen in hand.
2. **Link:** click [[Absolute Value]] and [[Graph Transformations]]. If you don't have those notes yet, Obsidian creates them. Write 3 lines in each in your own words.
3. **Connect:** add one link to a note of yours where max or min of two functions appears (a graph, an integral, a question).
4. **Modify:** add your own example or classroom story below.

### My notes
-

---
*Note of the Week · from The Mathematical Lab · AK · Stay Mathactive · mathemission.in*

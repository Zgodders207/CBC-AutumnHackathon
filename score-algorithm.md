# Weighted-Down Score Algorithm

Combines 4 scores (0–100) into one, pulled heavily toward the lowest score.

## Formula

A power mean with a large negative exponent `p = -20`:

```
score = ( (s1^p + s2^p + s3^p + s4^p) / 4 ) ^ (1/p)
```

### Python

```python
def combined_score(scores, p=-20):
    scores = [max(x, 1) for x in scores]  # avoid divide-by-zero on 0
    return (sum(x ** p for x in scores) / len(scores)) ** (1 / p)
```

### JavaScript

```js
const combinedScore = (s, p = -20) =>
  (s.reduce((a, x) => a + Math.max(x, 1) ** p, 0) / s.length) ** (1 / p);
```

## Example outputs

| Scores            | Result |
|-------------------|--------|
| 90 90 90 100      | 91.1   |
| 100 100 100 10    | 10.7   |
| 100 100 100 50    | 53.6   |
| 70 90 90 100      | 75.0   |
| 80 80 80 80       | 80.0   |
| 100 100 100 100   | 100.0  |

Design targets: `90 90 90 100` lands in the very low 90s, and `100 100 100 10` stays under 20.

## Tuning the exponent

`p` is the only knob. More negative means closer to the minimum score; less negative means closer to the average.

| p   | 90 90 90 100 | 100 100 100 10 |
|-----|--------------|----------------|
| -5  | 92.0         | 13.2           |
| -20 | 91.1         | 10.7           |
| -40 | 90.6         | 10.4           |

(`p = -1` is the harmonic mean, which is too lenient: `100 100 100 10` scores about 31.)

## Notes

- Equal scores are unchanged (`80 80 80 80` -> `80`).
- Result is always between the minimum and the arithmetic mean.
- A score of 0 would divide by zero; the code clamps inputs to a minimum of 1. Change this if 0 should force the result to 0.
- Works for any number of scores, not just 4.

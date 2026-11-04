# Failed attempts (kept, not averaged)

- `interactive-run-02-20261104T1037/`: interactive epo-ordering run-02, first attempt. Started 2026-11-04 11:23:48 Berlin time and ran in parallel with the persona-ablation block on the same gpt-6-sol deployment. It failed at 11:37:35 after 13 min, 34 app calls and 0.246 USD, because one chat call got HTTP 429 (token rate limit) on all 6 attempts. Per DESIGN.md "Exclusion" it is reported and not averaged. The owner approved a re-run on 2026-11-04, with the block running alone.

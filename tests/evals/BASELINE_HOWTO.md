# Comparison-condition baselines — futtatási útmutató (Leventének)

## Mit mérünk és miért

A bírálat visszatérő hiányossága, hogy nincs összehasonlítási alap: a cikk
megmutatja, mit nyert vissza az **interaktív** elicitációs ágens, de nem mutatja
meg, hogy az interaktivitás hoz-e bármit. Az `EXPERIMENT_BRIEF.md` (repo
gyökér, `tests/evals/EXPERIMENT_BRIEF.md`) több feltételt ír le, mindegyik
pontosan egy tényezőt változtat. Ez a fájl a B1-et (one-shot baseline)
dokumentálja; B2 (generic interviewer) és B3 (no-commit interview) saját
eval-spec fájlként fut (`baseline-b2-generic-interviewer.eval.spec.mjs`,
`baseline-b3-no-commit.eval.spec.mjs`), de ugyanazzal a
`score-baseline.mjs`-sel pontozható.

## B1 — one-shot transcript → MTSR

- **Kezelt (meglévő):** az ágens fordulónként kérdez, és minden megerősített
  lépést azonnal beír az élő modellbe (tool-calling).
- **Baseline (új):** egyetlen hívás, bemenet a **kész transcript**, kimenet
  ugyanaz az MTSR-nyelvtan.

A beszélgetés maga mindkét oldalon azonos — a baseline ugyanazt a transcriptet
kapja, amit az interaktív ágens állított elő. Ez **szándékosan kedvez a
baseline-nak**: ingyen megkapja a jó kérdezés hasznát. Ha így is alulmarad, a
különbség az inkrementális, modellbe író huroknak tulajdonítható.

## Futtatás

Két parancs. Csak az első hív API-t: **futásonként egyetlen** chat-completion
hívás (nem interjú), a personát egyszer sem szólítjuk meg, és a
`results/runs/` alatti semmi nem módosul.

```sh
# 1) generálás — 3 hívás összesen
OPENAI_API_KEY=sk-... node tests/evals/baseline-one-shot.mjs run-01 run-02 run-03

# 2) kiértékelés — teljesen offline, hívás nélkül
node tests/evals/score-baseline.mjs b1-one-shot run-01 run-02 run-03
```

Az eredmény ide kerül: `tests/evals/results/baselines/b1-one-shot/<run-id>/` —
`recovered-model.yaml`, `raw-response.md` (nyers válasz auditra),
`baseline-provenance.json` (modellazonosító, temperature, prompt- és
transcript-hash, token usage). A `b1-one-shot` alkönyvtár azért van, mert a
`results/baselines/` gyökér alatt B2/B3 saját alkönyvtárba írnak, hogy
ugyanaz a root ne ütközzön.

Alapértelmezett modell: `gpt-5.5-2026-04-23`, azaz **ugyanaz, mint az interaktív
interjúztatóé** — hogy a különbség az eljárásé legyen, ne a modellképességé.
Felülírható: `BASELINE_MODEL=... node ...`, de a cikkbe csak az azonos modellel
készült változat kerülhet.

## Mit fogsz látni

A `score-baseline.mjs` dimenziónként (osztály / kapcsolat / property),
mindkét nevezőn (full domain, practical scope) kiírja a baseline és az
interaktív futás **F1**-ét, plusz a különbséget. Pozitív delta = az interaktív
ágens jobb.

Mind a három dimenzió F1-et kap: a property-k párosítása is egy-az-egyben megy
(`matchProperties()`), így ennek a dimenziónak is van precision-je. Ez pont itt
számít a legtöbbet — egy olyan feltétel, ami sok, a referenciában nem létező
property-t sorol fel, a puszta lefedettségen jól nézne ki.

Az összesített eredmény: `results/baselines/README.md`.

## Két dolog, amit a szkript szándékosan így csinál

**Csak a determinisztikus (heurisztikus) pontozás hasonlítható össze.** Az
interaktív futások szemantikus számai egy LLM-bírótól származnak, akit *azoknak
a futásoknak* a konkrét near-missjeiről kérdeztünk. A baseline near-missei más
tételek, tehát azokat a verdikteket újrahasznosítani értelmetlen volna,
újrakérdezni pedig új hívás. A szkript ezért csak a fix szabályt alkalmazza
mindkét modellre, és ezt ki is írja a fejlécében.

**A deklarálatlan végpontú éleket eldobjuk.** Egy one-shot modell hivatkozhat
olyan osztályra, amit sosem vezetett be; az interaktív ágens ezt nem teheti,
mert az app elutasítja az ilyen élt. Az eldobott élek számát a szkript
kiírja, hogy a döntés látható legyen.

## Ha a baseline nyer

Az is publikálható eredmény, sőt: akkor a cikk állítását kell szűkíteni
(az interaktív hurok ezen a fixture-ön nem hozott többletet), nem az eredményt
elrejteni.

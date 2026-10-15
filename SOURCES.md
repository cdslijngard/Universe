# Sources

Every figure in `src/data/` is transcribed from a published source rather than
estimated. This file records where each kind of number comes from, so the data
is auditable.

## Orbital elements

Planetary elements are the standard J2000 Keplerian set from **E. M. Standish,
"Keplerian Elements for Approximate Positions of the Major Planets"** (JPL Solar
System Dynamics). They are stored in exactly the form that table publishes:

| Field | Meaning |
| --- | --- |
| `a` | semi-major axis, AU |
| `e` | eccentricity |
| `i` | inclination to the ecliptic, degrees |
| `node` | longitude of the ascending node Ω, degrees |
| `periLon` | **longitude of perihelion** ϖ = Ω + ω, degrees |
| `meanLon` | **mean longitude** L at J2000, degrees |

`periLon` and `meanLon` are longitudes, not the argument of periapsis and the
mean anomaly. `src/lib/kepler.ts` converts them (ω = ϖ − Ω, M₀ = L − ϖ) before
solving. Confusing the two shifts a planet by months along its orbit — Earth's
perihelion moves from early January to late September — so keep the stored
values in published form and let the solver do the conversion.

### Verification

The solver and the dataset were checked against independent values:

- Earth's heliocentric distance on 2026-10-15: **0.99731 AU**, implying a solar
  ecliptic longitude of 201.3° against an expected ≈202°.
- Earth's 2026 perihelion **0.98329 AU on 4 January** and aphelion
  **1.01671 AU on 5 July**, both matching published values.
- Orbit closure after exactly one period: error of 4 × 10⁻¹¹ AU.
- For all 13 bodies with elements, perihelion and aphelion derived as
  a(1 ∓ e) match the published perihelion/aphelion distances.

Static elements carry no perturbation terms. Over the decades since J2000 this
costs the outer planets up to about a degree of longitude — far finer than a
pixel at any zoom level this app uses.

## Physical data

Radii, masses, surface gravity, temperatures, rotation periods, axial tilts and
polar flattening come from the **NASA Planetary Fact Sheets** (NASA Space
Science Data Coordinated Archive) and the **JPL Solar System Dynamics** moon
and small-body tables. Moon counts are current as of 2025, including Saturn's
274 after the 2025 confirmations.

## Spacecraft

Voyager 1, Voyager 2 and New Horizons are stored as a distance at a reference
epoch (2025-01-01) plus a constant heliocentric speed, from **NASA/JPL mission
telemetry**. `probeDistanceAU()` extrapolates to the current date. They are no
longer accelerating, so this stays accurate to well under a percent. Heliopause
crossing distances are the published Voyager measurements: 121.6 AU in August
2012 and 119 AU in November 2018.

## Stars

Positions (J2000 right ascension and declination), parallax distances,
spectral types and magnitudes are from **Gaia DR3** and the **RECONS** census
of nearby stars. Planet counts follow the **NASA Exoplanet Archive**.

## Galaxies and large-scale structure

Local Group positions and distances are from the **NASA/IPAC Extragalactic
Database (NED)**. Milky Way structure — a 26,000 ly solar galactocentric
radius, the bar, the four major arms — follows current consensus values
including **Gaia** and **VLBI maser parallax** results. Supercluster and void
figures come from the papers that defined them, notably **Tully et al. (2014)**
for Laniakea. Cosmological parameters are **Planck 2018**.

## What is not measured

Three things in the app are deliberately not to scale, and each says so in the
interface:

1. **Radial distances at most levels** are compressed, because the true ratios
   span too many orders of magnitude to draw at once. The solar system and
   planetary system levels expose a true-scale toggle.
2. **Satellite positions on the body level** are arranged for framing. The
   planetary system level draws the real orbits.
3. **The CMB shell** on the cosmic web level, and **the two Oort cloud
   shells** on the Kuiper belt level, sit at symbolic radii — at true scale
   they would be thousands of scene units out. Each states its real distance,
   and the Oort shells are explicitly marked "not to scale" in their panels.

Surface appearances are procedural. They are generated from noise to match each
world's described character — Jupiter's sheared belts, Europa's lineae, Io's
sulphur — and are not images of the real surfaces.

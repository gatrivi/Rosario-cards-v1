# Luján 2026 launch

## Goal

Have Rosario ready to be shared during the 52nd Peregrinación Juvenil a Luján, scheduled for 3–4 October 2026.

Official 2026 motto: **“Madre, en tu abrazo nos reconocemos hermanos”.**

Primary launch benchmark: a pilgrim receives a link or QR while walking, opens the app quickly on mobile, and can start praying without setup or payment friction.

## Product policy

- **Pilgrims:** Rosario is available without charge during the pilgrimage.
- **Prayer core:** do not interrupt prayer with monetization prompts.
- **Support:** voluntary donations may be offered discreetly outside the active prayer flow.
- **Everyone else:** pricing / supporter / premium policy is intentionally **undecided**. Do not add a paywall until this is explicitly decided.
- Keep the spiritual core usable even if payment infrastructure is unavailable.

## Luján MVP

### P0 — must work before the pilgrimage

1. Mobile prayer flow works reliably.
2. PWA opens quickly and the prayer shell remains useful with weak or intermittent connectivity.
3. “Compartir Rosario” uses native share when available and clipboard fallback otherwise.
4. A stable public URL is used: `https://rosario.gatrivi.com`.
5. Donation entry point is optional and non-blocking.
6. QR/link can be printed or shown from another phone.
7. Smoke-test Android mobile: open → choose/start Rosario → advance prayers → background/return → continue.

### P1 — desirable

1. Luján-specific entry copy / campaign card.
2. Shareable card with the 2026 motto.
3. Intentions for the pilgrimage.
4. Simple install-PWA hint after the user has successfully prayed, not before.
5. Lightweight event metrics: opens, share attempts, prayer starts; avoid invasive tracking.

### Not now

- Subscription architecture.
- Hard paywall.
- Account requirement before prayer.
- Large redesign of the existing Camino/Peregrinación surface.

## Donation implementation

Use `REACT_APP_DONATION_URL` for the external donation/payment link.

Requirements:

- If the variable is empty, no broken payment button is shown.
- Prefer a Mercado Pago link or another mobile-safe HTTPS destination.
- Copy should describe support, not purchase: **“Ayudar a sostener Rosario”.**
- Never auto-open or nag after a prayer.

## Share implementation

Preferred payload:

- title: `Rosario`
- text: `Rezá el Rosario conmigo camino a Luján.`
- URL: `https://rosario.gatrivi.com`

Use `navigator.share()` where supported; fallback to copying the canonical URL.

## Definition of done

Before sharing the QR publicly:

- [ ] Production build passes.
- [ ] Android Chrome smoke test passes.
- [ ] Installed PWA opens and resumes correctly.
- [ ] Core prayer flow tested once in airplane mode after initial load.
- [ ] Share action tested from a real phone.
- [ ] `REACT_APP_DONATION_URL` configured in production and tested, or intentionally left hidden.
- [ ] QR resolves to `https://rosario.gatrivi.com`.
- [ ] No donation/paywall modal appears during active prayer.

## Implemented 2026-08-14

- Luján launch plan documented.
- Camino/Peregrinación surface prepared for native sharing.
- Clipboard fallback included for browsers without native share.
- Donation entry point controlled by `REACT_APP_DONATION_URL`.
- No monetization decision was made for non-pilgrims.

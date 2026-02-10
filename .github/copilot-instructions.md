# Copilot Instructions — Portfolio Project

## Core goals
Improve this portfolio WITHOUT heavy refactor:
- Modern, elegant, premium design (clean colors + typography)
- Smooth UX that encourages scrolling and staying
- Developer-first positioning (proof of skills), design/UI as bonus
- Keep changes small and reversible

## Low tokens & workflow
- Short, action-oriented responses
- No long explanations or theory
- Always:
  1) issues (file + area)
  2) plan P0/P1/P2
  3) apply P0 then P1 only
  4) diff summary

## Product priorities
### P0 – First impression + mobile + readability + perf
- Clear hero oriented job value
- Strong visual hierarchy from first screen
- Obvious navigation and CTAs
- Portfolio is the strongest section
- Remove heavy/unnecessary assets

### P1 – Developer credibility
- Projects as proof (context, role, stack, actions, result)
- Main stack clearly visible
- Clean structure and micro-UX
- Accessible project modals

### P2 – Premium polish
- Subtle animations
- UI consistency (cards, spacing, alignment)
- Easy perf wins (lazy load, preload)

## Positioning (non negotiable)
Always emphasize:
- architecture
- clean code
- APIs
- quality & maintainability
- concrete projects
- main tech stack

Avoid:
- junior tone
- generic marketing text
- designer-first posture

## Technical constraints
- Static one-page site (index.html)
- Existing jQuery + plugins only
- PHP only for contact (mail.php)
- No frameworks, no build system
- No architectural rewrite

## Repo structure
- index.html: #home #about #portfolio #contact
- CSS: plugins.css, style-dark.css, purple-color.css, custom.css (tokens)
- JS: jquery, plugins, main.js
- PHP: mail.php (AJAX JSON)

## Design system (source of truth)
- Use css/custom.css :root variables only
- No hardcoded colors if token exists
- One spacing scale, one radius system, one shadow system

### Visual rules
- 2 fonts max (titles + body)
- Comfortable mobile sizes + generous line-height
- 1 background + 1 surface + 1 accent + 1 soft accent
- Strong hierarchy through size/space first, color second
- Cards with surface, padding, soft shadow, consistent radius
- Consistent buttons, spacing, focus styles
- Mobile-first (never cramped UI)

Avoid:
- decorative gimmicks
- visual clutter
- flat hierarchy
- inconsistent components

## UX flow (recruiter oriented)
Hero → credibility → projects → contact

Rules:
- CTA visible early (max 2)
- Each section understandable in 5 seconds
- Clear feedback (loading/success/error)
- No friction (long preloaders, blocked scroll)
- Keyboard accessible

## Hero standard
- Line 1: main role
- Line 2: target stack
- Line 3: value promise (quality, maintainability, UX)
- Short and non-generic
- 1 primary CTA (Contact) + 1 secondary (Projects)

## Portfolio = proof, not gallery
Each project shows:
- Context
- My role
- Stack (max 6 tags)
- 2–3 concrete actions
- 1 measurable or clear result

## JavaScript rules
- Stay in jQuery
- Modify only if real UX/perf benefit

## mail.php security (mandatory)
- Strict validation + length limits
- Honeypot anti-spam
- Prevent header injection
- Always return JSON {status, message}
- No sensitive logs
- Never change $recipient

## Pre-commit checks
- No secrets
- Tokens respected
- Responsive OK
- Focus visible
- Contact form OK

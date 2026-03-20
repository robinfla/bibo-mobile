# Implementation Plans

This folder contains implementation plans for features before coding begins.

## Workflow

1. **Johnny** creates design spec → `../specs/`
2. **Gilfoye** writes implementation plan → here
3. Plan links to spec + mockups
4. Tasks get checked off during implementation

## Plan Template

```markdown
# [Feature Name] Implementation Plan

**Spec:** ../specs/FEATURE-SPEC.md
**Mockups:** ../mockups/feature-*.png
**Date:** YYYY-MM-DD
**Status:** Not Started | In Progress | Complete
**Assignee:** Gilfoye

---

## Overview

Brief description of what we're building.

## Architecture Decisions

- Decision 1: Why
- Decision 2: Why

---

## Tasks

### Task 1: [Component Name] (~X min)

**Files:**
- Create: `src/path/to/new.tsx`
- Modify: `src/path/to/existing.tsx`
- Test: `__tests__/path/to/test.tsx`

**Steps:**
- [ ] Write failing test
- [ ] Verify test fails
- [ ] Implement minimal code
- [ ] Verify test passes
- [ ] Commit: `feat: description`

### Task 2: ...

---

## Verification

- [ ] All tests pass
- [ ] No console errors/warnings
- [ ] Manual testing complete
- [ ] Committed with meaningful messages

## Notes

Any discoveries, blockers, or decisions made during implementation.
```

## Naming Convention

```
YYYY-MM-DD-feature-name.md
```

Examples:
- `2026-03-15-tasting-sheet.md`
- `2026-03-18-aroma-wheel.md`
- `2026-03-20-cellar-rack-view.md`

## Task Granularity

Each task should take **2-5 minutes**. If longer, split it.

Good task:
```
### Task 3: Add color picker component (~3 min)
- [ ] Write test: renders gradient bar
- [ ] Implement ColorGradientPicker.tsx
- [ ] Commit
```

Bad task (too big):
```
### Task 1: Build entire tasting form (~2 hours)
```

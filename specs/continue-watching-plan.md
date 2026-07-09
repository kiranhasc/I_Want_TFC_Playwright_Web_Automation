# Continue Watching manual validation

## Application Overview

Validate the Continue Watching rail interaction flow on the OTT site

## Test Scenarios

### 1. Continue Watching

**Seed:** `tests/seed.spec.ts`

#### 1.1. scroll rail with reveal arrows

**File:** `tests/home/continue-watching-scroll.spec.ts`

**Steps:**
  1. Open the iWant site and log in
    - expect: The home page loads
  2. Scroll to the Continue Watching rail
    - expect: The rail becomes visible
  3. Hover the right edge and click the revealed arrow
    - expect: The rail scrolls to the next set of cards
  4. Hover the left edge and click the revealed arrow
    - expect: The rail scrolls back to the previous set of cards

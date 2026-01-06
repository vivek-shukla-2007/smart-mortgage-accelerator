# Smart Mortgage Accelerator - Design Document

## Overview

**Smart Mortgage Accelerator** is a premium mortgage calculation app that helps homeowners visualize the impact of extra payments, manage fixed-rate terms, and optimize their mortgage strategy. The app is 100% offline, privacy-focused, and designed for one-handed mobile usage.

---

## Screen List

### 1. **Home Screen (Dashboard)**
The main entry point showing a quick summary of the current mortgage and key metrics.

**Content & Functionality:**
- Mortgage summary card: Loan amount, interest rate, remaining tenure, monthly EMI
- Key metrics cards: Interest saved, time saved, current principal balance
- Quick action buttons: "Calculate Impact", "View Schedule", "Settings"
- Visual indicator: Progress bar showing how much of the loan is paid off

### 2. **Basic Calculator Screen**
Simple mortgage calculation with standard inputs.

**Content & Functionality:**
- Input fields: Loan amount, interest rate (annual %), tenure (years/months)
- Output display: Monthly EMI, total interest, total amount payable
- "Calculate" button with visual feedback
- Option to save as a scenario

### 3. **Overpayment Impact Screen**
Advanced calculator showing the impact of extra monthly payments.

**Content & Functionality:**
- Base mortgage details (loan, rate, tenure)
- Extra payment input field (monthly overpayment amount)
- Results showing:
  - New tenure (months/years saved)
  - Interest saved (amount and percentage)
  - New monthly payment (if applicable)
- Visual chart: Comparison of original vs. accelerated payoff timeline
- Slider to adjust overpayment amount in real-time

### 4. **Fixed-Rate Term Manager Screen**
Specialized calculator for mortgages with fixed-rate periods.

**Content & Functionality:**
- Base mortgage details
- Fixed-rate period inputs: Start date, end date, fixed rate
- Overpayment amount during fixed period
- Results showing:
  - Remaining tenure after fixed period ends
  - Interest saved during fixed period
  - Options available at end of fixed term (e.g., refinance, continue with new rate)
  - Projected principal reduction during fixed period
- Visual timeline showing fixed period and post-fixed period

### 5. **Part Payment (Lump Sum) Calculator Screen**
Calculate the impact of one-time lump-sum payments.

**Content & Functionality:**
- Base mortgage details
- Lump-sum amount input
- Payment timing (immediate, or at specific date)
- Results showing:
  - New principal balance after payment
  - Interest saved
  - Remaining tenure
  - Maximum allowed part payment (typically 10% of original loan per year)
- Warning if payment exceeds allowed limit
- Visual chart: Principal reduction timeline

### 6. **Amortization Schedule Screen**
Detailed month-by-month or year-by-year breakdown of the mortgage.

**Content & Functionality:**
- Toggle between monthly and yearly view
- Table showing: Month/Year, Payment, Principal, Interest, Remaining Balance
- Scrollable list with smooth performance
- Export option (save as PDF or CSV)
- Highlight current month/year
- Search/filter by date range

### 7. **Comparison Screen**
Side-by-side comparison of different mortgage scenarios.

**Content & Functionality:**
- Add multiple scenarios (original, with overpayment, with lump-sum, etc.)
- Comparison table: EMI, total interest, tenure, total amount payable
- Visual charts comparing scenarios
- Save best scenario as default

### 8. **Settings Screen**
App configuration and preferences.

**Content & Functionality:**
- Currency selection (USD, EUR, GBP, INR, etc.)
- Number format preferences (decimal places)
- Theme selection (light/dark)
- Default interest rate compounding (monthly, quarterly, annually)
- About app, privacy policy, feedback

---

## Primary Content and Functionality

### Core Mortgage Calculation Engine

The app will calculate mortgages using the standard amortization formula:

**Monthly EMI = P × [r(1+r)^n] / [(1+r)^n - 1]**

Where:
- P = Principal loan amount
- r = Monthly interest rate (annual rate / 12 / 100)
- n = Total number of months

### Key Features

1. **Basic Mortgage Calculation:** Calculate EMI, total interest, and tenure.
2. **Overpayment Simulation:** Show how extra monthly payments reduce tenure and interest.
3. **Fixed-Rate Term Handling:** Manage mortgages with fixed-rate periods and variable rates post-fixed period.
4. **Part Payment (Lump-Sum) Calculation:** Calculate impact of one-time extra payments with regulatory limits.
5. **Amortization Schedule:** Generate detailed month-by-month breakdown.
6. **Scenario Comparison:** Compare multiple mortgage strategies side-by-side.
7. **Rich Visualizations:** Charts showing interest saved, tenure reduction, and principal payoff timeline.

---

## Key User Flows

### Flow 1: Calculate Impact of Extra Monthly Payments

1. User opens app → Home screen
2. User taps "Calculate Impact" button
3. App navigates to Overpayment Impact screen
4. User enters: Loan amount, interest rate, tenure, extra monthly payment
5. App calculates and displays: New tenure, interest saved, visual chart
6. User adjusts overpayment amount using slider
7. Results update in real-time
8. User saves scenario or returns to home

### Flow 2: Manage Fixed-Rate Term

1. User navigates to Fixed-Rate Term Manager
2. User enters: Loan amount, fixed rate, fixed period end date, overpayment amount
3. App calculates: Principal reduction during fixed period, interest saved, remaining tenure
4. App shows options available at end of fixed term
5. User can adjust inputs and see real-time updates
6. User saves scenario for future reference

### Flow 3: Calculate Part Payment Impact

1. User navigates to Part Payment Calculator
2. User enters: Current loan balance, remaining tenure, interest rate, lump-sum amount
3. App validates: Checks if payment exceeds allowed limit (typically 10% per year)
4. App calculates: New principal, interest saved, new tenure
5. User can adjust lump-sum amount
6. User saves scenario

### Flow 4: View Detailed Amortization Schedule

1. User navigates to Amortization Schedule
2. App displays month-by-month or year-by-year breakdown
3. User scrolls through schedule
4. User can toggle between monthly and yearly view
5. User can export schedule as PDF or CSV

### Flow 5: Compare Scenarios

1. User navigates to Comparison screen
2. User adds multiple scenarios (original, with overpayment, with lump-sum)
3. App displays side-by-side comparison with charts
4. User can delete or modify scenarios
5. User sets best scenario as default

---

## Color Choices

**Brand Colors (Professional Financial App):**

| Element | Color | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| Primary | Deep Blue | #1E3A8A | Buttons, headers, primary actions |
| Secondary | Teal | #0D9488 | Savings indicators, positive outcomes |
| Accent | Amber | #F59E0B | Warnings, alerts, important numbers |
| Background | Off-white | #F9FAFB | Main background |
| Surface | White | #FFFFFF | Cards, input fields |
| Text Primary | Dark Gray | #111827 | Main text |
| Text Secondary | Medium Gray | #6B7280 | Secondary text, labels |
| Success | Green | #10B981 | Success messages, positive metrics |
| Error | Red | #EF4444 | Error messages, warnings |
| Border | Light Gray | #E5E7EB | Dividers, borders |

**Dark Mode Variants:**
- Background: #0F172A
- Surface: #1E293B
- Text Primary: #F1F5F9
- Text Secondary: #94A3B8
- Border: #334155

---

## Design Principles

1. **Clarity:** Every number, chart, and metric should be immediately understandable.
2. **Simplicity:** Minimize cognitive load; group related inputs and outputs.
3. **Visual Hierarchy:** Use size, color, and spacing to guide user attention.
4. **One-Handed Usage:** All interactive elements within thumb reach on a 6-inch screen.
5. **Accessibility:** High contrast, readable fonts, clear labels.
6. **Performance:** Smooth animations and instant calculations (all offline).
7. **Privacy:** No data collection, no tracking, no cloud storage.

---

## Monetization Strategy

- **AdMob Banner Ads:** Display at the bottom of screens (non-intrusive).
- **AdMob Interstitial Ads:** Show after completing a calculation or viewing a schedule.
- **AdMob Rewarded Ads:** Optional—users can watch ads to unlock premium features (e.g., export to PDF, remove ads).
- **Future In-App Purchase:** Premium tier with advanced features (e.g., multi-currency support, advanced analytics).

---

## Technical Considerations

- **Offline-First:** All calculations performed locally using JavaScript/TypeScript.
- **Data Persistence:** Save scenarios using AsyncStorage for quick access.
- **Performance:** Optimize chart rendering to ensure smooth interactions.
- **Compatibility:** Support iOS 13+ and Android 8+.
- **Responsive Design:** Adapt to various screen sizes (phones, tablets).


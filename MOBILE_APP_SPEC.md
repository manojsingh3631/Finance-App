# Android Finance Calculator App - Exact Specification

**Specification Version**: 1.0  
**Date Created**: May 14, 2026  
**Platform**: Android (Java + XML)  
**Minimum SDK**: API 24 (Android 7.0)  
**Target SDK**: API 35 (Android 15)

---

## 1. Project Overview

This document specifies an EXACT 1:1 replication of the web-based Finance Calculator app for Android. The Android app must:
- Connect to the existing FastAPI backend
- Share the same MongoDB database with web app
- Perform identical calculations
- Display identical UI/UX
- Support same authentication flow

---

## 2. App Architecture

### 2.1 Backend URL
```
Production: https://[your-backend-url]:8000
Development: http://localhost:8000
```

### 2.2 Authentication Provider
```
Google Sign-In via: https://auth.emergentagent.com/
```

---

## 3. Authentication Flow

### 3.1 Login Process
1. User clicks "Sign in with Google" button
2. Redirect to `https://auth.emergentagent.com/?redirect=[app_redirect_url]`
3. Auth provider returns `session_id` in URL hash (#session_id=value)
4. Extract `session_id` and POST to backend
5. Backend returns User object with session cookie
6. Save session token in EncryptedSharedPreferences
7. Redirect to Dashboard

### 3.2 API Endpoints

#### POST `/api/auth/session`
```
Request Headers:
  Content-Type: application/json

Request Body:
  {
    "session_id": "string"
  }

Response (User Object):
  {
    "user_id": "user_12345abc",
    "email": "user@example.com",
    "name": "John Doe",
    "picture": "https://...",
    "created_at": "2026-05-14T10:30:00Z"
  }

Response Headers:
  Set-Cookie: session_token=...; HttpOnly; Secure; SameSite=None
```

#### GET `/api/auth/me`
```
Request Headers:
  Cookie: session_token=...
  OR
  Authorization: Bearer <token>

Response: User object (same as above)

Status Codes:
  200: Success
  401: Unauthorized/Session expired
```

#### POST `/api/auth/logout`
```
Request Headers:
  Cookie: session_token=...

Response:
  {
    "message": "Logged out successfully"
  }

Response Headers:
  Set-Cookie: session_token=; Max-Age=0; HttpOnly
```

---

## 4. Calculator Specifications

### 4.1 SIP Calculator (Systematic Investment Plan)

#### Input Fields
| Field Name | Type | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|---|
| Monthly Investment | Number | 10000 | 500 | 1000000 | 500 | ₹ |
| Expected Return | Number | 12 | 1 | 30 | 0.5 | % |
| Duration | Number | 10 | 1 | 50 | 1 | Years |
| Step-up | Number | 0 | 0 | 50 | 0.5 | % |
| Inflation | Number | 6 | 0 | 20 | 0.5 | % |
| Risk Profile | Select | moderate | - | - | - | conservative/moderate/aggressive |
| Include Lumpsum | Toggle | OFF | - | - | - | - |
| Lumpsum Amount (if enabled) | Number | 100000 | 10000 | 10000000 | 10000 | ₹ |

#### Calculation Formula
```
Monthly Rate = Expected Return / 100 / 12
Months = Duration * 12

For each month (1 to Months):
  SIP Future Value = (SIP Future Value + Monthly Investment) * (1 + Monthly Rate)
  Increment step-up every 12 months

Results:
  Total Invested = Sum of all monthly investments
  SIP Future Value = Calculated FV
  Estimated Returns = SIP Future Value - Total Invested
  Inflation Adjusted Value = Total FV / (1 + Inflation/100)^Duration
  Inflation Impact = Total FV - Inflation Adjusted Value
```

#### Output Fields
| Field Name | Format | Color | Test ID |
|---|---|---|---|
| Total Invested | Currency (₹) | Blue | sip-total-invested |
| Estimated Returns | Currency (₹) | Green | sip-estimated-returns |
| Total Portfolio Value | Currency (₹) | Purple | sip-total-value |
| Inflation Adjusted Value | Currency (₹) | Orange | sip-inflation-adjusted |
| Confidence Level | Percentage (%) | - | sip-confidence |

#### Chart
- Type: Pie Chart
- Data Points:
  - Invested Amount (Blue: #3b82f6)
  - Returns Earned (Green: #10b981)
  - (If Lumpsum): Lumpsum Invested (Purple: #8b5cf6)
- Legend: Yes
- Tooltip: Yes

#### Features
- Risk Profile Adjustment:
  - Conservative: -1% to expected return
  - Moderate: No adjustment
  - Aggressive: +1% to expected return
- Export to PDF
- Export to Excel
- Goal Planner (calculate required SIP for target amount)
- Save Calculation (authenticated users only)

---

### 4.2 SWP Calculator (Systematic Withdrawal Plan)

#### Input Fields
| Field Name | Type | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|---|
| Lumpsum Investment | Number | 1000000 | 100000 | 100000000 | 10000 | ₹ |
| Monthly Withdrawal | Number | 10000 | 1000 | 10000000 | 1000 | ₹ |
| Expected Return | Number | 10 | 1 | 30 | 0.5 | % |
| Duration | Number | 15 | 1 | 50 | 1 | Years |
| Inflation | Number | 6 | 0 | 20 | 0.5 | % |
| Risk Profile | Select | moderate | - | - | - | conservative/moderate/aggressive |
| Withdrawal Mode | Radio | fixed | - | - | - | fixed/percentage |
| Yearly Withdrawal % (if percentage mode) | Number | 6 | 0.5 | 30 | 0.5 | % |
| Inflation Adjusted Withdrawal | Toggle | OFF | - | - | - | - |
| Import from SIP | Button | - | - | - | - | - |

#### Calculation Formula
```
Monthly Rate = Expected Return / 100 / 12
Months = Duration * 12

If Withdrawal Mode = percentage:
  Monthly Withdrawal = (Lumpsum * Yearly %) / 100 / 12
Else:
  Monthly Withdrawal = Fixed amount

For each month:
  Monthly Return = Balance * Monthly Rate
  Balance = Balance + Monthly Return - Monthly Withdrawal
  Track total withdrawals
  If Inflation Adjusted: Increase withdrawal by inflation rate yearly
  If Balance <= 0: Mark as Exhausted, record month

Results:
  Total Withdrawals = Sum of all withdrawals
  Returns Earned = Total monthly returns
  Remaining Value = Final balance
  Exhausted = Yes/No
  Exhaustion Month = Month when balance becomes 0
  Exhaustion Probability = Risk percentage
```

#### Output Fields
| Field Name | Format | Color | Test ID |
|---|---|---|---|
| Total Withdrawals | Currency (₹) | Orange | swp-total-withdrawals |
| Returns Earned | Currency (₹) | Green | swp-returns-earned |
| Remaining Portfolio Value | Currency (₹) | Blue | swp-remaining-value |
| Exhaustion Status | Text | Red/Green | swp-exhaustion-status |
| Exhaustion Probability | Percentage (%) | - | swp-exhaustion-probability |

#### Chart
- Type: Pie Chart
- Data Points:
  - Total Withdrawals (Orange: #f59e0b)
  - Returns Earned (Green: #10b981)
  - Remaining Value (Blue: #3b82f6)
- Withdrawal Schedule: Line chart (Year vs Monthly Withdrawal)

#### Features
- Import SIP results as starting capital
- Inflation-adjusted withdrawals
- Withdrawal schedule visualization
- Exhaustion warning
- Export to PDF & Excel
- Save Calculation

---

### 4.3 Lumpsum Calculator

#### Input Fields
| Field Name | Type | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|---|
| Investment Amount | Number | 100000 | 10000 | 10000000 | 10000 | ₹ |
| Expected Return | Number | 12 | 1 | 30 | 0.5 | % |
| Duration | Number | 5 | 1 | 50 | 1 | Years |

#### Calculation Formula
```
Future Value = Investment * (1 + Expected Return / 100) ^ Duration
Returns = Future Value - Investment
```

#### Output Fields
| Field Name | Format | Color | Test ID |
|---|---|---|---|
| Total Invested | Currency (₹) | Blue | lumpsum-total-invested |
| Estimated Returns | Currency (₹) | Green | lumpsum-estimated-returns |
| Total Value | Currency (₹) | Purple | lumpsum-total-value |

#### Chart
- Type: Pie Chart
- Data Points:
  - Invested (Blue: #3b82f6)
  - Returns (Green: #10b981)

---

### 4.4 EMI Calculator (Equated Monthly Installment)

#### Input Fields
| Field Name | Type | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|---|
| Loan Amount | Number | 1000000 | 100000 | 10000000 | 50000 | ₹ |
| Interest Rate | Number | 8.5 | 1 | 20 | 0.1 | % p.a. |
| Loan Tenure | Number | 10 | 1 | 30 | 1 | Years |

#### Calculation Formula
```
Monthly Rate = Interest Rate / 100 / 12
Months = Tenure * 12

EMI = (Loan Amount × Monthly Rate × (1 + Monthly Rate)^Months) / ((1 + Monthly Rate)^Months - 1)
Total Payment = EMI × Months
Total Interest = Total Payment - Loan Amount
```

#### Output Fields
| Field Name | Format | Color | Test ID |
|---|---|---|---|
| Monthly EMI | Currency (₹) | Purple | emi-monthly |
| Total Payment | Currency (₹) | Gray | emi-total-payment |
| Total Interest | Currency (₹) | Red | emi-total-interest |

#### Chart
- Type: Pie Chart
- Data Points:
  - Principal (Blue: #3b82f6)
  - Interest (Red: #ef4444)

---

### 4.5 ELSS Calculator (Equity Linked Saving Scheme)

#### Input Fields
| Field Name | Type | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|---|
| Investment Amount | Number | 150000 | 500 | 10000000 | 1000 | ₹ |
| Tax Slab | Select | 30 | - | - | - | 10/20/30/40 |
| Expected Return | Number | 12 | 1 | 30 | 0.5 | % |
| Lock-in Period | Number | 3 | 3 | 3 | 0 | Years |

#### Calculation Formula
```
Future Value = Investment * (1 + Expected Return / 100) ^ Lock-in Period
Tax Benefit = Investment × Tax Slab / 100
Net Tax Benefit = Tax Benefit (amount saved)
Returns = Future Value - Investment
After-Tax Returns = Returns (since ELSS gains are tax-free after lock-in)
```

#### Output Fields
| Field Name | Format | Color | Test ID |
|---|---|---|---|
| Investment Amount | Currency (₹) | Blue | elss-investment |
| Tax Benefit | Currency (₹) | Green | elss-tax-benefit |
| Estimated Returns | Currency (₹) | Purple | elss-returns |
| Total Value After Lock-in | Currency (₹) | Orange | elss-total-value |

#### Chart
- Type: Pie Chart or Bar Chart
- Data Points:
  - Invested (Blue)
  - Tax Benefits (Green)
  - Returns (Purple)

---

### 4.6 PPF Calculator (Public Provident Fund)

#### Input Fields
| Field Name | Type | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|---|
| Yearly Deposit | Number | 150000 | 500 | 1500000 | 1000 | ₹ |
| Interest Rate | Number | 7.1 | 1 | 20 | 0.1 | % p.a. |
| Duration | Number | 15 | 7 | 50 | 1 | Years |

#### Calculation Formula
```
For PPF (compound quarterly):
Quarterly Rate = Interest Rate / 100 / 4
Quarters = Duration * 4

Future Value = 0
For each year (1 to Duration):
  For each quarter in year:
    Future Value = (Future Value + Yearly Deposit / 4) × (1 + Quarterly Rate)
    
Total Invested = Yearly Deposit × Duration
Returns = Future Value - Total Invested
Maturity Amount = Future Value
```

#### Output Fields
| Field Name | Format | Color | Test ID |
|---|---|---|---|
| Total Invested | Currency (₹) | Blue | ppf-total-invested |
| Estimated Returns | Currency (₹) | Green | ppf-estimated-returns |
| Maturity Amount | Currency (₹) | Purple | ppf-maturity-amount |

#### Chart
- Type: Pie Chart
- Data Points:
  - Invested (Blue: #3b82f6)
  - Returns (Green: #10b981)

---

### 4.7 DelayedSIP Calculator (SIP with Delay Period)

#### Input Fields
| Field Name | Type | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|---|
| Monthly SIP | Number | 10000 | 500 | 1000000 | 500 | ₹ |
| Expected Return | Number | 12 | 1 | 30 | 0.5 | % |
| Investment Duration | Number | 20 | 1 | 50 | 1 | Years |
| Delay Period | Number | 5 | 0 | 40 | 1 | Years |

#### Calculation Formula
```
Monthly Rate = Expected Return / 100 / 12
Total Months = Investment Duration * 12
Delay Months = Delay Period * 12

SIP starts after Delay Months
Calculate normal SIP formula from month (Delay Months + 1) to Total Months
```

#### Output Fields
- Same as SIP Calculator
- Additional: "Years Until SIP Starts": Delay Period years

---

## 5. Database Structure

### 5.1 Collections (MongoDB)

#### users
```javascript
{
  user_id: "user_12345abc",
  email: "user@example.com",
  name: "John Doe",
  picture: "https://...",
  created_at: "2026-05-14T10:30:00Z"
}
```

#### calculations
```javascript
{
  id: "calc_uuid",
  user_id: "user_12345abc",
  calculator_type: "SIP|SWP|Lumpsum|EMI|ELSS|PPF|DelayedSIP",
  inputs: {
    monthlyInvestment: 10000,
    expectedReturn: 12,
    duration: 10,
    stepUp: 0,
    inflation: 6,
    riskProfile: "moderate",
    // ... other calculator-specific inputs
  },
  outputs: {
    totalInvested: 1200000,
    estimatedReturns: 2156789,
    totalValue: 3356789,
    // ... other outputs
  },
  name: "My SIP Plan 2026",
  tags: ["retirement", "long-term"],
  notes: "Plan to invest for retirement",
  timestamp: "2026-05-14T10:30:00Z"
}
```

---

## 6. UI Screens

### 6.1 Navigation Structure
```
SplashActivity
    ↓
LoginActivity
    ├─→ DashboardActivity (if authenticated)
    └─→ DashboardActivity (guest mode if "Continue as Guest")

DashboardActivity (Main Screen)
├─→ Tabs:
│   ├─ SIPFragment
│   ├─ SWPFragment
│   ├─ LumsumFragment
│   ├─ EMIFragment
│   ├─ ELSSFragment
│   ├─ PPFFragment
│   └─ (Additional calculators)
├─→ Navigation Drawer:
│   ├─ History (if authenticated)
│   ├─ Settings
│   └─ Logout (if authenticated)

HistoryActivity
    ├─ List of saved calculations
    ├─ Search
    ├─ Filter
    └─ Export

SettingsActivity
    ├─ Theme selection
    ├─ Account info
    └─ Logout
```

### 6.2 Colors & Theme

#### Dark Mode (Default)
- Background: `#030712` (Slate-950)
- Card Background: `#1e293b` (Slate-900)
- Card Border: `#1e293b` (Slate-800)
- Text Primary: `#f1f5f9` (Slate-100)
- Text Secondary: `#94a3b8` (Slate-400)
- Primary Color: `#4f46e5` (Indigo)
- Button: `#3b82f6` (Blue)
- Accent Green: `#10b981` (Emerald)
- Accent Red: `#ef4444` (Red)
- Accent Orange: `#f59e0b` (Amber)
- Accent Purple: `#8b5cf6` (Violet)

#### Light Mode (Optional)
- Background: `#ffffff` (White)
- Card Background: `#ffffff` (White)
- Card Border: `#e2e8f0` (Slate-200)
- Text Primary: `#1e293b` (Slate-900)
- Text Secondary: `#64748b` (Slate-500)

### 6.3 Typography
- Font Family: Manrope (for headings), System Default (for body)
- Title Font Size: 24sp (bold)
- Label Font Size: 14sp (semibold)
- Input Font Size: 18sp (semibold)
- Result Font Size: 28sp+ (bold/black)

### 6.4 Component Specifications

#### Input Field (EditText)
- Height: 48dp-56dp
- Padding: 12dp
- Border Radius: 12dp
- Background: Dark mode: Slate-800, Light mode: Slate-50
- Font Size: 18sp
- Type: Number (numeric keyboard)

#### Label (TextView)
- Font Size: 14sp
- Font Weight: Semibold (600)
- Color: Slate-700 (dark) / Slate-300 (light)
- Margin Bottom: 8dp

#### Slider
- Height: 4dp (thumb height: 20dp)
- Min/Max marks: Optional
- Continuous updates: Yes

#### Button (Calculate/Save)
- Height: 56dp
- Font Size: 18sp
- Font Weight: Bold/Black
- Border Radius: 12dp-24dp
- Background: Gradient (primary color)
- Padding: 16dp horizontal

#### Card
- Border Radius: 16dp-24dp
- Padding: 24dp-32dp
- Box Shadow: Elevation 8dp
- Border: 2dp (Slate-200 light / Slate-800 dark)

#### Results Display
- Background: Gradient (color-specific)
- Border: 2dp
- Border Radius: 16dp
- Padding: 16dp-20dp
- Font: Black weight, 24sp-32sp

---

## 7. API Response Format

All API responses follow this format:

```json
{
  "status": "success|error",
  "data": { /* response data */ },
  "message": "descriptive message",
  "timestamp": "2026-05-14T10:30:00Z"
}
```

Error Response:
```json
{
  "status": "error",
  "error_code": "AUTH_001",
  "message": "Invalid session_id",
  "timestamp": "2026-05-14T10:30:00Z"
}
```

---

## 8. Features Summary

### 8.1 Authenticated Users
- ✅ Save calculations
- ✅ View calculation history
- ✅ Delete calculations
- ✅ Export to PDF/Excel
- ✅ Search & filter calculations
- ✅ Tag calculations
- ✅ Add notes to calculations
- ✅ Sync across devices

### 8.2 Guest Users
- ✅ Access all calculators
- ✅ Perform calculations
- ✅ View results
- ✅ Export (local only)
- ❌ Save history
- ❌ Sync data

### 8.3 Both Modes
- ✅ Dark/Light theme
- ✅ Charts & visualizations
- ✅ Risk profile selection (SIP)
- ✅ Goal planning (SIP)
- ✅ Inflation adjustment
- ✅ Input validation

---

## 9. Testing Validation Checklist

- [ ] All 7 calculators work identically to web version
- [ ] All input field ranges and defaults match
- [ ] All calculation formulas produce exact same results
- [ ] All charts display correctly
- [ ] Authentication flow works end-to-end
- [ ] Save calculation stores to backend
- [ ] History loads from backend
- [ ] Delete calculation removes from backend
- [ ] Export to PDF works
- [ ] Export to Excel works
- [ ] Dark/Light theme toggles
- [ ] Offline mode caches data
- [ ] Error messages display correctly
- [ ] API timeouts handled gracefully
- [ ] Session expiry redirects to login
- [ ] All colors match web version exactly
- [ ] Font sizes are proportionate
- [ ] Button actions trigger correctly
- [ ] Input validation shows errors
- [ ] Loading states display

---

## 10. File Structure Reference

### Mapper to Web App Files
- `SIPCalculator.js` → `SIPFragment.java + fragment_sip.xml`
- `SWPCalculator.js` → `SWPFragment.java + fragment_swp.xml`
- `LumpsumCalculator.js` → `LumsumFragment.java + fragment_lumpsum.xml`
- `EMICalculator.js` → `EMIFragment.java + fragment_emi.xml`
- `ELSSCalculator.js` → `ELSSFragment.java + fragment_elss.xml`
- `PPFCalculator.js` → `PPFFragment.java + fragment_ppf.xml`
- `DelayedSIPCalculator.js` → `DelayedSIPFragment.java + fragment_delayed_sip.xml`
- `CalculationHistory.js` → `HistoryActivity.java + activity_history.xml`
- `AuthContext.js` → `AuthViewModel.java + AuthRepository.java`
- `DashboardPage.js` → `DashboardActivity.java + activity_dashboard.xml`

---

## 11. Critical Notes

1. **Calculation Accuracy**: Results must match web version to within 1 rupee
2. **Colors**: Use exact color codes specified - no variations
3. **Authentication**: DO NOT hardcode URLs - use configurable backend URL
4. **Database**: Use same MongoDB collections - no schema changes
5. **Error Handling**: Mirror web app error messages exactly
6. **Performance**: App must load calculators in < 2 seconds
7. **Offline**: Cache at least 20 calculations locally
8. **Testing**: Every feature must be tested against web version

---

## 12. Backend URL Configuration

Store in `Constants.java`:
```java
public class Constants {
    public static final String BACKEND_URL = BuildConfig.BACKEND_URL; // From build.gradle
    public static final String API_ENDPOINT = BACKEND_URL + "/api/";
    public static final String AUTH_URL = "https://auth.emergentagent.com/";
}
```

Pass via `build.gradle`:
```gradle
buildTypes {
    debug {
        buildConfigField "String", "BACKEND_URL", '"http://localhost:8000"'
    }
    release {
        buildConfigField "String", "BACKEND_URL", '"https://your-prod-url"'
    }
}
```

---

**END OF SPECIFICATION**

Generated from: `/workspaces/Finance-App/frontend/src/components/calculators/`

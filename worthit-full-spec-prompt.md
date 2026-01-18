# WorthIt — Build Prompt (Full Spec)

Build a React Native mobile app called **WorthIt**.

## What it does

WorthIt helps users make mindful purchasing decisions by translating prices into "hours of your life" and providing friction for impulse buys. User inputs their income, then evaluates purchases by seeing how many work hours that item costs. The app encourages delayed gratification through timed reminders and tracks decision history.

## Tech Stack

- React Native (Expo preferred for easier setup)
- TypeScript
- Local storage (AsyncStorage or SQLite)
- Push notifications (expo-notifications)
- Style however you want, but aim for cross-platform visual consistency

## Design Direction

Playful, approachable, friendly. Not corporate. Have fun with it.

---

## Screens & Features

### 1. Onboarding (first launch only)

**Welcome screen:**
- Brief value prop
- CTA to start setup

**Income setup screen:**
- Toggle between "I know my hourly rate" and "I earn a salary"
- Hourly: just input the rate
- Salary: input annual salary + hours/week, app calculates hourly
- Optional toggle: "Account for taxes?"
  - If on: let user input tax bracket OR default to ~25%
  - Show calculated net hourly rate
- Save and continue to home

### 2. Home / Evaluate Screen (main screen)

- Large price input field (currency formatted, numeric keyboard)
- "Is it worth it?" button

**After calculation, show:**
- Hours and/or days required to earn that amount
- Playful visual/copy based on effort level (examples: "☕ A coffee break worth of work" / "📅 A full work week" / "🗓️ Over a month of grind")

**Two CTAs:**
- "Worth it" — logs as purchased, optionally add note or link
- "Let me think..." — triggers reminder flow

### 3. Reminder Flow

When user taps "Let me think...":

Quick action buttons:
- 1 day
- 3 days
- 1 week
- Custom (date/time picker)

Schedule a push notification. When it fires, deep link back to that item so user can decide: Buy / Pass / Snooze again.

### 4. History & Stats Screen

**History list:**
- All evaluated items
- Show: item price, hours required, status (Bought / Passed / Pending)
- Filterable by status

**Stats section:**
- Total items evaluated
- Items passed on (didn't buy after waiting)
- Estimated money saved (sum of passed items)
- Optional: streak counter for "mindful days"

### 5. Settings Screen

- Edit income (switch between hourly/salary, update values)
- Tax toggle and rate
- Notification preferences
- Clear history
- About

---

## Data Model

```
User {
  incomeType: 'hourly' | 'salary'
  hourlyRate: number
  salary?: number
  hoursPerWeek?: number
  taxEnabled: boolean
  taxRate: number (default 0.25)
  netHourlyRate: number (computed)
}

Item {
  id: string
  price: number
  hoursRequired: number
  createdAt: Date
  status: 'pending' | 'bought' | 'passed'
  reminderAt?: Date
  note?: string
  link?: string
}
```

---

## Out of Scope

- User accounts / cloud sync
- Social features
- Ads or monetization
- Barcode scanning (stretch goal, don't attempt unless everything else is  Execution Instructions

- Run fully autonomously. Do not stop to ask questions—make reasonable decisions and keep going.
- Initialize a git repo if one doesn't exist.
- Initialize a new React Native / Expo project.
- Implement all screens and features described above.
- Make sure it runs on both iOS and Android.
- Write clean, organized code with reasonable separation of concerns.
- Commit after completing each major feature or screen. Use clear, descriptive commit messages.
- If you encounter an error, attempt to fix it yourself before moving on.
- When finished, make a final commit and summarize what was built and any known issues.

Go.

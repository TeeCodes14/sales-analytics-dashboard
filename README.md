# SalesPulse - Sales Analytics Dashboard

A responsive, standalone, single-page Sales Analytics Dashboard built entirely with vanilla HTML, CSS, and JavaScript. Zero frameworks, zero CSS variables, zero backend required. All transaction data and quota settings persist in client-side Web Storage (`localStorage`).

![SalesPulse Analytics Dashboard](preview.png)

## Highlights

- **Executive KPI Cards**: Real-time tracking of Total Revenue, Deals Closed, Average Order Value (AOV), and Quota Progress with dynamic trend indicators.
- **Interactive Visualizations (Chart.js)**:
  - **Revenue & Order Volume Trend**: Line & bar dual-axis chart with Daily, Weekly, and Monthly aggregations.
  - **Revenue by Product Line**: Doughnut chart with custom breakdown and legend.
  - **Geographical Regional Performance**: Territory revenue comparison.
  - **Acquisition Channel Efficacy**: Channel deal volume breakdown.
- **Top Sales Reps Leaderboard**: Real-time rep performance ranking with closed deal metrics.
- **Transactions Ledger & CRUD**:
  - Full search across client, product, rep, and order IDs.
  - Sortable columns (Date, Amount, Customer, Status, Rep, Region).
  - Configurable pagination (10, 25, 50, 100 rows per page).
  - Add, edit, and delete transactions with instant state updates.
- **Web Storage & Portability**:
  - Automatically seeds realistic demo sales data on initial visit.
  - Full CSV export and JSON/CSV import support.
  - Customizable monthly revenue target quota saved in `localStorage`.
  - One-click demo data reset.

## Tech Stack

- **HTML5**: Clean semantic structure.
- **CSS3**: Modern dark-theme UI with explicit literal styling (**zero CSS variables**).
- **JavaScript (ES6+)**: Reactive state management, client-side filtering engine, and table pagination.
- **Chart.js**: Smooth canvas-based charting loaded via CDN.

## Getting Started

No build tools, bundlers, or server setups required. Simply open `index.html` in any modern web browser:

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

Or serve with any static web server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

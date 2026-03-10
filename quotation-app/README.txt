========================================
  QuoteFlow - Offline Quotation App
========================================

TECH STACK
----------
  • React 18 (JavaScript)
  • Vite 5
  • react-router-dom v6
  • localStorage (fully offline – no server needed)

SETUP & RUN
-----------
1. Open a terminal in the project folder (quotation-app/)

2. Install dependencies:


3. Start the dev server:
       npm run dev

4. Open your browser at:
       http://localhost:5173

BUILD FOR PRODUCTION
--------------------
       npm run build
       npm run preview     ← serves the built output locally

PROJECT STRUCTURE
-----------------
src/
 ├── pages/
 │    ├── Dashboard.jsx        ← lists all saved quotations
 │    ├── Particulars.jsx      ← manage work/service categories
 │    ├── QuotationForm.jsx    ← create a new quotation
 │    └── QuotationDetail.jsx  ← view a saved quotation
 │
 ├── components/
 │    └── Navbar.jsx           ← top navigation bar
 │
 ├── db/
 │    └── storage.js           ← localStorage helpers
 │
 ├── utils/
 │    └── calculations.js      ← amount / total / format helpers
 │
 ├── App.jsx                   ← routes
 └── main.jsx                  ← React entry point

HOW TO USE
----------
1. Go to "Particulars" and add categories (e.g. Civil Work, Electrical).
2. Go to "+ New Quote", enter a client name, and add line items.
3. Each item picks a Particular from the dropdown; Area × Rate = Amount.
4. Click "Save Quotation" – it appears on the Dashboard instantly.
5. Click "View" on any dashboard card to see the full breakdown.

DATA STORAGE
------------
All data is stored in your browser's localStorage under two keys:
  • quotation_app_particulars
  • quotation_app_quotations

Quotations snapshot the particular name at save-time, so renaming or
deleting a Particular later does NOT affect old quotations.

No internet connection or server is required after npm install.

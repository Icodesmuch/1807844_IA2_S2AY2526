# MediQuick Pharmacy — CIT2011 Group Project

## Overview
A fictional e-commerce pharmacy website built as a front-end demo using HTML5, CSS3, and vanilla JavaScript. All data is persisted via `localStorage` — no server or database required.

---

## Group Members

| Name         | Student ID |
|--------------|------------|
| Jalen Daley  | 1807844    |

**Module:** CIT2011 — Web Programming  
**Class:** Friday, 8:00 AM  
**Semester:** 2, AY 2025–2026

---

## How to Run

1. Open the project folder in any modern browser.
2. Double-click `index.html` (the redirect shim) **or** open `Codes/index.html` directly.
3. The site works entirely offline — no server needed.
4. **Recommended browser:** Google Chrome (latest).

> All paths are relative. Do not move individual files out of their folders.

---

## Demo Login Credentials

Register a new account first via the Register page.  
TRN format: `000-000-000` (e.g. `123-456-789`)  
You must be 18+ to register.

**Example test account** (register it yourself first):
- TRN: `123-456-789`
- Password: `password123`

---

## Page Map

| File                   | Purpose                                      |
|------------------------|----------------------------------------------|
| `index.html`           | Redirect shim ? `Codes/`                    |
| `Codes/index.html`     | **Login** (entry point)                      |
| `Codes/register.html`  | New account registration                     |
| `Codes/products.html`  | Dynamic product catalogue                    |
| `Codes/cart.html`      | Shopping cart (user-specific)                |
| `Codes/checkout.html`  | Checkout & shipping details                  |
| `Codes/invoice.html`   | Generated invoice after checkout             |
| `Codes/dashboard.html` | User frequency charts & invoice list         |
| `Codes/about.html`     | About / student details                      |
| `Codes/locked.html`    | Account locked (3 failed login attempts)     |

---

## localStorage Keys

| Key                | Type            | Description                          |
|--------------------|-----------------|--------------------------------------|
| `RegistrationData` | Array of objects| All registered user accounts         |
| `AllProducts`      | Array of objects| Product catalogue (seeded on load)   |
| `AllInvoices`      | Array of objects| All invoices across all customers    |

### User Object Schema
```json
{
  "firstName": "string",
  "lastName": "string",
  "dob": "YYYY-MM-DD",
  "gender": "Male | Female | Other",
  "phone": "string",
  "email": "string",
  "trn": "000-000-000",
  "password": "string",
  "dateOfRegistration": "ISO date string",
  "cart": {},
  "invoices": []
}
```

---

## Frameworks & Tools

| Tool / Library   | Purpose                          | Source        |
|------------------|----------------------------------|---------------|
| Google Fonts (Roboto) | Typography                  | CDN           |
| Material Icons   | UI icons throughout the site     | CDN           |
| Vanilla CSS (BEM)| All layout, components, themes   | `style.css`   |
| Vanilla JS (ES6) | Auth, cart, invoice, dashboard   | `js/main.js`  |

> 95%+ of styling is hand-written vanilla CSS as required by the rubric.

---

## JavaScript Functions Reference

| Function               | Question | Description                                     |
|------------------------|----------|-------------------------------------------------|
| `initLogin()`          | Q2       | TRN + password login with 3-attempt lockout     |
| `initResetPassword()`  | Q2       | Reset password by TRN lookup                    |
| `initRegister()`       | Q1       | Full registration with age/TRN/password validation |
| `seedProducts()`       | Q3       | Seed `AllProducts` in localStorage on first load |
| `renderProducts()`     | Q3       | Dynamically render product cards from array     |
| `addToCart(id)`        | Q3       | Add product to user's cart in `RegistrationData`|
| `renderCart()`         | Q4       | Render cart rows from user's cart object        |
| `updateQty(id, qty)`   | Q4       | Update item quantity and recalculate totals     |
| `removeItem(id)`       | Q4       | Remove single item from cart                    |
| `clearCart()`          | Q4       | Empty the user's cart                           |
| `generateInvoice()`    | Q6       | Build invoice, save to `AllInvoices` + user     |
| `renderInvoice()`      | Q6       | Display invoice from `sessionStorage`           |
| `ShowUserFrequency()`  | Q7       | Bar charts for gender and age group             |
| `ShowInvoices(trn?)`   | Q7       | All invoices table, filterable by TRN           |
| `GetUserInvoices(trn)` | Q7       | Return invoices for one user by TRN             |

---

## Notes

- This is a **front-end demo only** — no real payments, prescriptions, or data are processed.
- Passwords are stored in plain text in `localStorage` for demonstration purposes only; this is not production-safe.
- The bar chart technique on the dashboard uses stretched SVG images as described in the assignment brief.

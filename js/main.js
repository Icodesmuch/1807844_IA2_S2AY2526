/**
 * CIT2011 — Individual Assignment #2 (Sem 2 AY 25-26)
 * External JavaScript (Basic Guidelines §2 — JavaScript Knowledge & Application)
 * DOM updates, event listeners, validation, control structures / arithmetic.
 */

(function () {
  "use strict";

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  /** §2d — format totals in Jamaican dollars (JMD) */
  function money(n) {
    return (
      "J$" +
      n.toLocaleString("en-JM", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }

  /** §2c — Login: empty-field validation + DOM feedback */
  function initLogin() {
    var form = $("#login-form");
    if (!form) return;
    var msg = $("#login-error");
    form.addEventListener("submit", function (e) {
      var user = $("#username").value.trim();
      var pass = $("#password").value;
      if (!user || !pass) {
        e.preventDefault();
        msg.textContent = "Enter both username and password.";
        msg.hidden = false;
        return;
      }
      msg.hidden = true;
    });
  }

  /** §2c — Registration: email pattern + password match */
  function initRegister() {
    var form = $("#register-form");
    if (!form) return;
    var msg = $("#register-error");
    form.addEventListener("submit", function (e) {
      var email = $("#email").value.trim();
      var p1 = $("#password").value;
      var p2 = $("#confirm-password").value;
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) {
        e.preventDefault();
        msg.textContent = "Enter a valid email address.";
        msg.hidden = false;
        return;
      }
      if (p1 !== p2) {
        e.preventDefault();
        msg.textContent = "Passwords do not match.";
        msg.hidden = false;
        return;
      }
      if (p1.length < 8) {
        e.preventDefault();
        msg.textContent = "Password must be at least 8 characters.";
        msg.hidden = false;
        return;
      }
      msg.hidden = true;
    });
  }

  /** §2d — Cart: qty change recalculates subtotals, tax, line totals, summary (arithmetic) */
  function recalcCart() {
    var rows = $$(".cart-row");
    var sumSub = 0;
    var sumDisc = 0;
    var sumTax = 0;
    var sumGrand = 0;

    rows.forEach(function (row) {
      var unit = parseFloat(row.getAttribute("data-unit"), 10);
      var discPct = parseFloat(row.getAttribute("data-discount-pct"), 10) / 100;
      var qtyInput = row.querySelector(".cart-table__qty-input");
      var qty = parseInt(qtyInput.value, 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      qtyInput.value = qty;

      var lineSub = unit * qty;
      var discAmt = lineSub * discPct;
      var afterDisc = lineSub - discAmt;
      var tax = afterDisc * 0.15;
      var lineTotal = afterDisc + tax;

      sumSub += lineSub;
      sumDisc += discAmt;
      sumTax += tax;
      sumGrand += lineTotal;

      var cells = row.querySelectorAll("[data-calc]");
      cells.forEach(function (cell) {
        var k = cell.getAttribute("data-calc");
        if (k === "sub") cell.textContent = money(lineSub);
        if (k === "tax") cell.textContent = money(tax);
        if (k === "total") cell.innerHTML = "<strong>" + money(lineTotal) + "</strong>";
      });
    });

    var elSub = $("#cart-sum-sub");
    var elDisc = $("#cart-sum-disc");
    var elTax = $("#cart-sum-tax");
    var elGrand = $("#cart-sum-grand");
    if (elSub) elSub.textContent = money(sumSub);
    if (elDisc) elDisc.textContent = "-" + money(sumDisc);
    if (elTax) elTax.textContent = money(sumTax);
    if (elGrand) elGrand.textContent = money(sumGrand);
  }

  function initCart() {
    var tbody = $("#cart-tbody");
    if (!tbody) return;
    tbody.addEventListener("input", function (e) {
      if (e.target.classList.contains("cart-table__qty-input")) {
        recalcCart();
      }
    });

    var clearBtn = $("#cart-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        $$(".cart-table__qty-input", tbody).forEach(function (inp) {
          inp.value = "1";
        });
        recalcCart();
      });
    }

    recalcCart();
  }

  /** §2b — “Add to cart” buttons update badge count (DOM) */
  function initAddToCart() {
    var badge = $("#cart-count");
    if (!badge) return;
    var count = parseInt(badge.textContent, 10) || 0;
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-add-cart]");
      if (!btn) return;
      count += 1;
      badge.textContent = String(count);
    });
  }

  /** §2c — Checkout: required shipping fields */
  function initCheckout() {
    var form = $("#checkout-form");
    if (!form) return;
    var msg = $("#checkout-error");
    form.addEventListener("submit", function (e) {
      var req = ["shipping-name", "address", "city", "parish", "postal-code"];
      for (var i = 0; i < req.length; i++) {
        var el = document.getElementById(req[i]);
        if (el && !el.value.trim()) {
          e.preventDefault();
          msg.textContent = "Fill in all shipping fields.";
          msg.hidden = false;
          return;
        }
      }
      msg.hidden = true;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initLogin();
    initRegister();
    initCart();
    initAddToCart();
    initCheckout();
  });
})();

/**
 * Jalen Daley — Student ID: 1807844
 * CIT2011 Web Programming — Group Project (Sem 2 AY 25-26)
 * MediQuick Pharmacy — main.js
 *
 * localStorage keys:
 *   RegistrationData  — array of user objects
 *   AllProducts       — array of product objects
 *   AllInvoices       — array of invoice objects
 *
 * sessionStorage keys:
 *   mq_active_trn     — TRN of the currently logged-in user
 *   mq_login_attempts — number of failed login attempts this session
 *   mq_pending_invoice — invoice object passed from checkout to invoice page
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────
     SHARED UTILITIES
  ───────────────────────────────────────────── */

  function money(n) {
    return 'J$' + Number(n).toLocaleString('en-JM', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function getStorage(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch (e) { return []; }
  }

  function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getSession(key) {
    try { return JSON.parse(sessionStorage.getItem(key)); }
    catch (e) { return null; }
  }

  function setSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
  }

  function activeTRN() {
    return getSession('mq_active_trn') || '';
  }

  function getActiveUser() {
    var trn = activeTRN();
    if (!trn) return null;
    var users = getStorage('RegistrationData');
    for (var i = 0; i < users.length; i++) {
      if (users[i].trn === trn) return users[i];
    }
    return null;
  }

  function saveActiveUser(updatedUser) {
    var users = getStorage('RegistrationData');
    for (var i = 0; i < users.length; i++) {
      if (users[i].trn === updatedUser.trn) {
        users[i] = updatedUser;
        break;
      }
    }
    setStorage('RegistrationData', users);
  }

  /* Cart item count from the active user's cart object */
  function cartItemCount() {
    var user = getActiveUser();
    if (!user || !user.cart) return 0;
    var total = 0;
    var keys = Object.keys(user.cart);
    for (var i = 0; i < keys.length; i++) {
      total += user.cart[keys[i]].qty;
    }
    return total;
  }

  function updateCartBadge() {
    var badge = document.getElementById('cart-count');
    if (!badge) return;
    var count = cartItemCount();
    badge.textContent = String(count);
    badge.style.display = count > 0 ? '' : 'none';
  }

  /* Show/hide nav items based on login state */
  function updateNav() {
    var trn = activeTRN();
    var navLogin = document.getElementById('nav-login');
    var navLogout = document.getElementById('nav-logout');
    var navDash = document.getElementById('nav-dashboard');
    if (navLogin)  navLogin.style.display  = trn ? 'none' : '';
    if (navLogout) navLogout.style.display = trn ? '' : 'none';
    if (navDash)   navDash.style.display   = trn ? '' : 'none';
  }

  /* Wires logout link to clear session and redirect */
  function initLogout() {
    var btn = document.getElementById('nav-logout');
    if (!btn) return;
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      sessionStorage.removeItem('mq_active_trn');
      sessionStorage.removeItem('mq_login_attempts');
      window.location.href = 'index.html';
    });
  }

  /* Toast notification */
  function showToast(msg, duration) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('toast--visible');
    setTimeout(function () {
      toast.classList.remove('toast--visible');
    }, duration || 2500);
  }

  function showError(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
  }

  function hideError(id) {
    var el = document.getElementById(id);
    if (el) el.hidden = true;
  }

  /* ─────────────────────────────────────────────
     Q2: LOGIN
     Validate TRN + password against RegistrationData.
     Limit to 3 attempts; redirect to locked.html on lockout.
  ───────────────────────────────────────────── */
  function initLogin() {
    var form = document.getElementById('login-form');
    if (!form) return;

    var resetLink = document.getElementById('reset-password-link');
    if (resetLink) {
      resetLink.addEventListener('click', function (e) {
        e.preventDefault();
        initResetPassword();
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var trn  = document.getElementById('trn').value.trim();
      var pass = document.getElementById('password').value;

      var attempts = parseInt(getSession('mq_login_attempts'), 10) || 0;

      if (!trn || !pass) {
        showError('login-error', 'Please enter your TRN and password.');
        return;
      }

      var users = getStorage('RegistrationData');
      var match = null;
      for (var i = 0; i < users.length; i++) {
        if (users[i].trn === trn && users[i].password === pass) {
          match = users[i];
          break;
        }
      }

      if (match) {
        sessionStorage.removeItem('mq_login_attempts');
        setSession('mq_active_trn', trn);
        window.location.href = 'products.html';
      } else {
        attempts += 1;
        setSession('mq_login_attempts', attempts);
        if (attempts >= 3) {
          window.location.href = 'locked.html';
          return;
        }
        showError('login-error',
          'Incorrect TRN or password. Attempt ' + attempts + ' of 3.');
      }
    });
  }

  /* Q2: Reset Password — match TRN then update password in RegistrationData */
  function initResetPassword() {
    var trn = window.prompt('Enter your TRN (000-000-000) to reset your password:');
    if (!trn) return;
    trn = trn.trim();
    var users = getStorage('RegistrationData');
    var found = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].trn === trn) { found = users[i]; break; }
    }
    if (!found) {
      alert('No account found for that TRN.');
      return;
    }
    var np = window.prompt('Enter your new password (min 8 characters):');
    if (!np || np.length < 8) {
      alert('Password must be at least 8 characters. Reset cancelled.');
      return;
    }
    found.password = np;
    setStorage('RegistrationData', users);
    alert('Password updated. You may now log in.');
  }

  /* ─────────────────────────────────────────────
     Q1: REGISTRATION
     Validate all fields, age ≥18, TRN format/uniqueness,
     password match, then append user to RegistrationData.
  ───────────────────────────────────────────── */

  // Q1: Registration — calculate age from date-of-birth string
  function calcAge(dobString) {
    var today = new Date();
    var dob   = new Date(dobString);
    var age   = today.getFullYear() - dob.getFullYear();
    var m     = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  }

  // Q1: Registration — validate TRN format 000-000-000
  function isTRNValid(trn) {
    return /^\d{3}-\d{3}-\d{3}$/.test(trn);
  }

  // Q1: Registration — TRN must not already exist in RegistrationData
  function isTRNUnique(trn) {
    var users = getStorage('RegistrationData');
    for (var i = 0; i < users.length; i++) {
      if (users[i].trn === trn) return false;
    }
    return true;
  }

  function initRegister() {
    var form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideError('register-error');

      var firstName = document.getElementById('firstName').value.trim();
      var lastName  = document.getElementById('lastName').value.trim();
      var dob       = document.getElementById('dob').value;
      var gender    = document.getElementById('gender').value;
      var phone     = document.getElementById('phone').value.trim();
      var email     = document.getElementById('email').value.trim();
      var trn       = document.getElementById('trn').value.trim();
      var password  = document.getElementById('password').value;
      var confirm   = document.getElementById('confirm-password').value;
      var terms     = document.getElementById('terms').checked;

      if (!firstName || !lastName || !dob || !gender || !phone || !email || !trn || !password || !confirm) {
        showError('register-error', 'All fields are required.');
        return;
      }

      // Q1: Visitor must be over 18 years old — calculate age using JavaScript
      var age = calcAge(dob);
      if (age < 18) {
        showError('register-error', 'You must be at least 18 years old to register. (Age: ' + age + ')');
        return;
      }

      if (!isTRNValid(trn)) {
        showError('register-error', 'TRN must be in the format 000-000-000.');
        return;
      }

      if (!isTRNUnique(trn)) {
        showError('register-error', 'That TRN is already registered. Please log in instead.');
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('register-error', 'Please enter a valid email address.');
        return;
      }

      if (password.length < 8) {
        showError('register-error', 'Password must be at least 8 characters.');
        return;
      }

      if (password !== confirm) {
        showError('register-error', 'Passwords do not match.');
        return;
      }

      if (!terms) {
        showError('register-error', 'You must agree to the Terms & Conditions.');
        return;
      }

      // Q1: Store registration info as a JS object; append to RegistrationData array
      var newUser = {
        firstName:        firstName,
        lastName:         lastName,
        dob:              dob,
        gender:           gender,
        phone:            phone,
        email:            email,
        trn:              trn,
        password:         password,
        dateOfRegistration: new Date().toISOString(),
        cart:             {},
        invoices:         []
      };

      var users = getStorage('RegistrationData');
      users.push(newUser);
      setStorage('RegistrationData', users);

      setSession('mq_active_trn', trn);
      window.location.href = 'products.html';
    });
  }

  /* ─────────────────────────────────────────────
     Q3: PRODUCT CATALOGUE
     Seed AllProducts on first load; render dynamically.
  ───────────────────────────────────────────── */

  // Q3: Product Catalogue — seed AllProducts; always re-seed to ensure fresh data
  function seedProducts() {
    var existing = localStorage.getItem('AllProducts');
    if (existing && existing.indexOf('"icon"') !== -1) return;
    var products = [
      {
        id: 1, name: 'Paracetamol 500mg',
        price: 950, discountPct: 0,
        description: 'Pain relief and fever reducer. 20 tablets.',
        color: '#1a3c5e', icon: 'medication'
      },
      {
        id: 2, name: 'Vitamin C 1000mg',
        price: 2050, discountPct: 10,
        description: 'Vitamin C supplement. 60 tablets.',
        color: '#e6a800', icon: 'local_pharmacy'
      },
      {
        id: 3, name: 'First Aid Kit',
        price: 3900, discountPct: 5,
        description: 'Bandages, antiseptic, and basic supplies.',
        color: '#c0392b', icon: 'health_and_safety'
      },
      {
        id: 4, name: 'Ibuprofen 400mg',
        price: 1350, discountPct: 0,
        description: 'Anti-inflammatory. 30 tablets.',
        color: '#2a5a8a', icon: 'medication_liquid'
      },
      {
        id: 5, name: 'Digital Thermometer',
        price: 2500, discountPct: 0,
        description: 'Accurate home-use digital thermometer.',
        color: '#0e7c7b', icon: 'device_thermostat'
      },
      {
        id: 6, name: 'Multivitamin Complex',
        price: 3150, discountPct: 0,
        description: 'Complete daily vitamins. 90 tablets.',
        color: '#6d28d9', icon: 'science'
      }
    ];
    setStorage('AllProducts', products);
  }

  // Q3: Product Catalogue — display products dynamically from AllProducts array
  function renderProducts(filter) {
    var container = document.getElementById('products-container');
    if (!container) return;
    var products = getStorage('AllProducts');
    if (filter) {
      var q = filter.toLowerCase();
      products = products.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) !== -1 ||
               p.description.toLowerCase().indexOf(q) !== -1;
      });
    }
    if (products.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<span class="material-icons empty-state__icon">search_off</span>' +
        '<p>No products match your search.</p></div>';
      return;
    }
    var html = '';
    for (var i = 0; i < products.length; i++) {
      var p = products[i];
      var bg    = p.color || '#1a3c5e';
      var icon  = p.icon  || 'medication';
      var discBadge = p.discountPct > 0
        ? '<span style="background:#28a745;color:#fff;font-size:0.75rem;' +
          'padding:2px 8px;border-radius:4px;margin-left:8px;">' +
          p.discountPct + '% OFF</span>'
        : '';
      html +=
        '<article class="card">' +
          '<div class="card__image" style="background:' + bg + ';' +
            'display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;">' +
            '<span class="material-icons" aria-hidden="true" ' +
              'style="font-size:3.5rem;color:rgba(255,255,255,0.9);">' + icon + '</span>' +
            '<span style="color:rgba(255,255,255,0.7);font-size:0.8rem;font-weight:500;' +
              'letter-spacing:0.05em;text-transform:uppercase;">' + p.name + '</span>' +
          '</div>' +
          '<div class="card__body">' +
            '<h2 class="card__title">' + p.name + discBadge + '</h2>' +
            '<p class="card__description">' + p.description + '</p>' +
            '<p class="card__price">' + money(p.price) + '</p>' +
            '<button type="button" class="btn btn--primary btn--block" ' +
              'data-add-cart data-product-id="' + p.id + '">' +
              '<span class="material-icons" aria-hidden="true">add_shopping_cart</span> Add to Cart' +
            '</button>' +
          '</div>' +
        '</article>';
    }
    container.innerHTML = html;
  }

  function initProducts() {
    if (!document.getElementById('products-container')) return;
    seedProducts();
    renderProducts();

    var searchInput = document.getElementById('product-search');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        renderProducts(this.value);
      });
    }
  }

  /* ─────────────────────────────────────────────
     Q3: ADD TO CART
     Add selected product to the logged-in user's cart
     in RegistrationData; update badge.
  ───────────────────────────────────────────── */

  // Q3: Add to Cart — add product to user's cart object in RegistrationData
  function addToCart(productId) {
    var trn = activeTRN();
    if (!trn) {
      showToast('Please log in to add items to your cart.');
      setTimeout(function () { window.location.href = 'index.html'; }, 1500);
      return;
    }
    var products = getStorage('AllProducts');
    var product = null;
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === productId) { product = products[i]; break; }
    }
    if (!product) return;

    var user = getActiveUser();
    if (!user.cart) user.cart = {};
    var key = String(productId);
    if (user.cart[key]) {
      user.cart[key].qty += 1;
    } else {
      user.cart[key] = {
        id:          product.id,
        name:        product.name,
        price:       product.price,
        discountPct: product.discountPct,
        image:       product.image,
        qty:         1
      };
    }
    saveActiveUser(user);
    updateCartBadge();
    showToast(product.name + ' added to cart!');
  }

  function initAddToCart() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-add-cart]');
      if (!btn) return;
      var id = parseInt(btn.getAttribute('data-product-id'), 10);
      if (id) addToCart(id);
    });
  }

  /* ─────────────────────────────────────────────
     Q4: CART PAGE
     Read cart from user object; render rows dynamically;
     recalculate subtotals, discounts, tax, totals.
  ───────────────────────────────────────────── */

  function cartTotal(cart) {
    var sumSub = 0, sumDisc = 0, sumTax = 0, sumGrand = 0;
    var keys = Object.keys(cart);
    for (var i = 0; i < keys.length; i++) {
      var item     = cart[keys[i]];
      var lineSub  = item.price * item.qty;
      var discAmt  = lineSub * (item.discountPct / 100);
      var afterDisc = lineSub - discAmt;
      var tax      = afterDisc * 0.15;
      sumSub  += lineSub;
      sumDisc += discAmt;
      sumTax  += tax;
      sumGrand += afterDisc + tax;
    }
    return { sub: sumSub, disc: sumDisc, tax: sumTax, grand: sumGrand };
  }

  // Q4: Cart — render cart items from user's cart in RegistrationData
  function renderCart() {
    var container = document.getElementById('cart-container');
    var summary   = document.getElementById('cart-summary');
    var actions   = document.getElementById('cart-actions');
    if (!container) return;

    var user = getActiveUser();

    if (!user) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<span class="material-icons empty-state__icon">lock</span>' +
        '<p>Please <a href="index.html">log in</a> to view your cart.</p></div>';
      return;
    }

    var cart = user.cart || {};
    var keys = Object.keys(cart);

    if (keys.length === 0) {
      container.innerHTML =
        '<div class="empty-state">' +
        '<span class="material-icons empty-state__icon">shopping_cart</span>' +
        '<p>Your cart is empty. <a href="products.html">Browse products</a></p></div>';
      if (summary) summary.style.display = 'none';
      if (actions) actions.style.display = 'none';
      return;
    }

    var tableHtml =
      '<div class="cart-table"><div class="cart-table__wrapper">' +
      '<table><thead><tr>' +
        '<th scope="col">Product</th>' +
        '<th scope="col">Unit Price</th>' +
        '<th scope="col">Qty</th>' +
        '<th scope="col">Sub-total</th>' +
        '<th scope="col">Discount</th>' +
        '<th scope="col">Tax (15%)</th>' +
        '<th scope="col">Total</th>' +
        '<th scope="col">Remove</th>' +
      '</tr></thead><tbody id="cart-tbody">';

    for (var i = 0; i < keys.length; i++) {
      var item = cart[keys[i]];
      var lineSub  = item.price * item.qty;
      var discAmt  = lineSub * (item.discountPct / 100);
      var afterDisc = lineSub - discAmt;
      var tax      = afterDisc * 0.15;
      var lineTotal = afterDisc + tax;
      tableHtml +=
        '<tr class="cart-row" data-product-id="' + item.id + '" ' +
            'data-unit="' + item.price + '" data-discount-pct="' + item.discountPct + '">' +
          '<td>' + item.name + '</td>' +
          '<td>' + money(item.price) + '</td>' +
          '<td>' +
            '<input type="number" value="' + item.qty + '" min="1" max="99" ' +
              'class="cart-table__qty-input" ' +
              'aria-label="Quantity for ' + item.name + '" ' +
              'data-product-id="' + item.id + '">' +
          '</td>' +
          '<td data-calc="sub">' + money(lineSub) + '</td>' +
          '<td>' + item.discountPct + '%</td>' +
          '<td data-calc="tax">' + money(tax) + '</td>' +
          '<td data-calc="total"><strong>' + money(lineTotal) + '</strong></td>' +
          '<td>' +
            '<button type="button" class="btn btn--danger btn--sm" ' +
              'data-remove-item data-product-id="' + item.id + '" ' +
              'aria-label="Remove ' + item.name + '">' +
              '<span class="material-icons" aria-hidden="true">delete</span>' +
            '</button>' +
          '</td>' +
        '</tr>';
    }
    tableHtml += '</tbody></table></div></div>';
    container.innerHTML = tableHtml;

    if (summary) summary.style.display = '';
    if (actions) actions.style.display = '';
    updateCartSummary(cart);
    bindCartEvents();
  }

  function updateCartSummary(cart) {
    var t = cartTotal(cart);
    var elSub   = document.getElementById('cart-sum-sub');
    var elDisc  = document.getElementById('cart-sum-disc');
    var elTax   = document.getElementById('cart-sum-tax');
    var elGrand = document.getElementById('cart-sum-grand');
    if (elSub)   elSub.textContent   = money(t.sub);
    if (elDisc)  elDisc.textContent  = '-' + money(t.disc);
    if (elTax)   elTax.textContent   = money(t.tax);
    if (elGrand) elGrand.textContent = money(t.grand);

    // Keep checkout amount-paid field in sync if on checkout page
    var amountPaid = document.getElementById('amount-paid');
    if (amountPaid) amountPaid.value = money(t.grand);
  }

  // Q4: Cart — update item quantity in user's cart and re-render totals
  function updateQty(productId, newQty) {
    var user = getActiveUser();
    if (!user) return;
    var key = String(productId);
    if (!user.cart[key]) return;
    if (newQty < 1) newQty = 1;
    user.cart[key].qty = newQty;
    saveActiveUser(user);
    updateCartBadge();

    // Recalculate row cells without full re-render for better UX
    var row = document.querySelector('.cart-row[data-product-id="' + productId + '"]');
    if (row) {
      var item    = user.cart[key];
      var lineSub = item.price * item.qty;
      var discAmt = lineSub * (item.discountPct / 100);
      var afterDisc = lineSub - discAmt;
      var tax     = afterDisc * 0.15;
      var total   = afterDisc + tax;
      var cellSub = row.querySelector('[data-calc="sub"]');
      var cellTax = row.querySelector('[data-calc="tax"]');
      var cellTot = row.querySelector('[data-calc="total"]');
      if (cellSub) cellSub.textContent = money(lineSub);
      if (cellTax) cellTax.textContent = money(tax);
      if (cellTot) cellTot.innerHTML = '<strong>' + money(total) + '</strong>';
    }
    updateCartSummary(user.cart);
  }

  // Q4: Cart — remove a single item from the user's cart
  function removeItem(productId) {
    var user = getActiveUser();
    if (!user) return;
    delete user.cart[String(productId)];
    saveActiveUser(user);
    renderCart();
    updateCartBadge();
  }

  // Q4: Cart — clear all items from the user's cart
  function clearCart() {
    var user = getActiveUser();
    if (!user) return;
    user.cart = {};
    saveActiveUser(user);
    renderCart();
    updateCartBadge();
    showToast('Cart cleared.');
  }

  function bindCartEvents() {
    var tbody = document.getElementById('cart-tbody');
    if (!tbody) return;

    tbody.addEventListener('input', function (e) {
      if (e.target.classList.contains('cart-table__qty-input')) {
        var id  = parseInt(e.target.getAttribute('data-product-id'), 10);
        var qty = parseInt(e.target.value, 10);
        if (!isNaN(id) && !isNaN(qty)) updateQty(id, qty);
      }
    });

    tbody.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-remove-item]');
      if (!btn) return;
      var id = parseInt(btn.getAttribute('data-product-id'), 10);
      if (!isNaN(id)) removeItem(id);
    });
  }

  function initCart() {
    if (!document.getElementById('cart-container')) return;
    renderCart();

    var clearBtn = document.getElementById('cart-clear');
    if (clearBtn) clearBtn.addEventListener('click', clearCart);
  }

  /* ─────────────────────────────────────────────
     Q5: CHECKOUT
     Populate order summary from user's cart;
     validate shipping fields; call generateInvoice on submit.
  ───────────────────────────────────────────── */

  function populateCheckoutSummary() {
    var itemsDiv = document.getElementById('checkout-items');
    if (!itemsDiv) return;
    var user = getActiveUser();
    if (!user || !user.cart) return;
    var cart = user.cart;
    var keys = Object.keys(cart);
    if (keys.length === 0) {
      itemsDiv.innerHTML = '<p class="text-muted">Your cart is empty.</p>';
      return;
    }
    var html = '';
    for (var i = 0; i < keys.length; i++) {
      var item = cart[keys[i]];
      html +=
        '<div class="order-item">' +
          '<div><strong>' + item.name + '</strong>' +
          '<br><small class="text-muted">Qty: ' + item.qty +
          ' × ' + money(item.price) + '</small></div>' +
          '<span>' + money(item.price * item.qty) + '</span>' +
        '</div>';
    }
    itemsDiv.innerHTML = html;

    var t = cartTotal(cart);
    var setEl = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setEl('co-sub',   money(t.sub));
    setEl('co-disc',  '-' + money(t.disc));
    setEl('co-tax',   money(t.tax));
    setEl('co-grand', money(t.grand));

    var amountPaid = document.getElementById('amount-paid');
    if (amountPaid) amountPaid.value = money(t.grand);
  }

  // Q5: Checkout — validate required shipping fields before proceeding
  function initCheckout() {
    var form = document.getElementById('checkout-form');
    if (!form) return;
    populateCheckoutSummary();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      hideError('checkout-error');

      var required = ['shipping-name', 'address', 'city', 'parish', 'postal-code'];
      for (var i = 0; i < required.length; i++) {
        var el = document.getElementById(required[i]);
        if (el && !el.value.trim()) {
          showError('checkout-error', 'Please fill in all shipping fields.');
          el.focus();
          return;
        }
      }

      var trn = activeTRN();
      if (!trn) {
        showError('checkout-error', 'You must be logged in to check out.');
        return;
      }

      var user = getActiveUser();
      if (!user || Object.keys(user.cart).length === 0) {
        showError('checkout-error', 'Your cart is empty.');
        return;
      }

      var paymentInput = form.querySelector('input[name="payment-method"]:checked');
      generateInvoice({
        name:     document.getElementById('shipping-name').value.trim(),
        address:  document.getElementById('address').value.trim(),
        city:     document.getElementById('city').value.trim(),
        parish:   document.getElementById('parish').value.trim(),
        postal:   document.getElementById('postal-code').value.trim(),
        payment:  paymentInput ? paymentInput.value : 'Credit Card'
      });
    });
  }

  /* ─────────────────────────────────────────────
     Q6: INVOICE GENERATION
     Assemble invoice object; store in AllInvoices,
     user's invoices[], and sessionStorage; redirect.
  ───────────────────────────────────────────── */

  // Q6: Invoice — generate invoice, append to AllInvoices and user's invoices array
  function generateInvoice(shipping) {
    var user = getActiveUser();
    if (!user) return;
    var cart = user.cart;
    var keys = Object.keys(cart);
    var t    = cartTotal(cart);

    var items = [];
    for (var i = 0; i < keys.length; i++) {
      var item = cart[keys[i]];
      items.push({
        name:        item.name,
        qty:         item.qty,
        unitPrice:   item.price,
        discountPct: item.discountPct
      });
    }

    var invoice = {
      invoiceNumber: 'INV-' + Date.now(),
      date:          new Date().toLocaleDateString('en-JM', {
                       year: 'numeric', month: 'long', day: 'numeric'
                     }),
      trn:           user.trn,
      customerName:  user.firstName + ' ' + user.lastName,
      shipping:      shipping,
      items:         items,
      subtotal:      t.sub,
      discount:      t.disc,
      tax:           t.tax,
      total:         t.grand
    };

    // Append to global AllInvoices
    var allInvoices = getStorage('AllInvoices');
    allInvoices.push(invoice);
    setStorage('AllInvoices', allInvoices);

    // Append to user's invoices array in RegistrationData
    user.invoices.push(invoice);
    user.cart = {};
    saveActiveUser(user);
    updateCartBadge();

    // Pass invoice to the invoice page via sessionStorage
    setSession('mq_pending_invoice', invoice);
    window.location.href = 'invoice.html';
  }

  // Q6: Invoice — render pending invoice from sessionStorage on invoice.html
  function renderInvoice() {
    if (!document.getElementById('invoice-doc')) return;
    var inv = getSession('mq_pending_invoice');
    if (!inv) {
      document.getElementById('invoice-doc').innerHTML =
        '<p class="empty-state">No invoice data found. ' +
        '<a href="products.html">Return to shop.</a></p>';
      return;
    }

    var setText = function (id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('inv-number',  inv.invoiceNumber);
    setText('inv-date',    inv.date);
    setText('inv-trn',     inv.trn);
    setText('inv-name',    inv.shipping.name);
    setText('inv-address', inv.shipping.address);
    setText('inv-city-parish', inv.shipping.city + ', ' + inv.shipping.parish);
    setText('inv-postal',  inv.shipping.postal);
    setText('inv-payment', inv.shipping.payment);
    setText('inv-subtotal', money(inv.subtotal));
    setText('inv-discount', '-' + money(inv.discount));
    setText('inv-tax',      money(inv.tax));
    setText('inv-total',    money(inv.total));

    var tbody = document.getElementById('inv-items');
    if (tbody) {
      var html = '';
      for (var i = 0; i < inv.items.length; i++) {
        var item    = inv.items[i];
        var lineSub = item.unitPrice * item.qty;
        var discAmt = lineSub * (item.discountPct / 100);
        html +=
          '<tr>' +
            '<td>' + item.name + '</td>' +
            '<td>' + money(item.unitPrice) + '</td>' +
            '<td>' + item.qty + '</td>' +
            '<td>' + item.discountPct + '%</td>' +
            '<td>' + money(lineSub - discAmt) + '</td>' +
          '</tr>';
      }
      tbody.innerHTML = html;
    }

    document.title = inv.invoiceNumber + ' — MediQuick Pharmacy';
  }

  /* ─────────────────────────────────────────────
     Q7: DASHBOARD — ShowUserFrequency
     Display frequency bar charts for gender and age group
     using the stretched-image technique.
  ───────────────────────────────────────────── */

  // Q7: ShowUserFrequency — show how many registered users fall under gender categories
  function ShowUserFrequency() {
    var users = getStorage('RegistrationData');
    if (users.length === 0) return;

    // --- Gender chart ---
    var genderCounts = { Male: 0, Female: 0, Other: 0 };
    // --- Age group chart ---
    var ageCounts = { '18-25': 0, '26-35': 0, '36-50': 0, '50+': 0 };

    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      if (genderCounts[u.gender] !== undefined) {
        genderCounts[u.gender]++;
      } else {
        genderCounts['Other']++;
      }
      var age = calcAge(u.dob);
      if      (age <= 25) ageCounts['18-25']++;
      else if (age <= 35) ageCounts['26-35']++;
      else if (age <= 50) ageCounts['36-50']++;
      else                ageCounts['50+']++;
    }

    var MAX_BAR_PX = 300;

    function buildBarChart(counts, containerId) {
      var container = document.getElementById(containerId);
      if (!container) return;
      var labels = Object.keys(counts);
      var max = 0;
      for (var k = 0; k < labels.length; k++) {
        if (counts[labels[k]] > max) max = counts[labels[k]];
      }
      var html = '';
      for (var j = 0; j < labels.length; j++) {
        var label = labels[j];
        var count = counts[label];
        var barPx = max > 0 ? Math.round((count / max) * MAX_BAR_PX) : 0;
        // Stretched-image bar chart technique from brief
        html +=
          '<div class="chart__row">' +
            '<span class="chart__label">' + label + '</span>' +
            '<div class="chart__bar-wrap">' +
              '<img src="../Assets/bar.svg" ' +
                   'width="' + barPx + '" height="20" ' +
                   'alt="' + count + ' user(s)" ' +
                   'style="display:inline-block;min-width:4px;">' +
              '<span class="chart__count">' + count + ' user' + (count !== 1 ? 's' : '') + '</span>' +
            '</div>' +
          '</div>';
      }
      container.innerHTML = html;
    }

    buildBarChart(genderCounts, 'chart-gender');
    buildBarChart(ageCounts,    'chart-age');
  }

  /* ─────────────────────────────────────────────
     Q7: DASHBOARD — ShowInvoices
     Display all invoices; allow search by TRN.
  ───────────────────────────────────────────── */

  // Q7: ShowInvoices — display all invoices from AllInvoices; searchable by TRN
  function ShowInvoices(trnFilter) {
    var all    = getStorage('AllInvoices');
    var tbody  = document.getElementById('invoices-tbody');
    if (!tbody) return;

    var invoices = trnFilter
      ? all.filter(function (inv) {
          return inv.trn.toLowerCase().indexOf(trnFilter.toLowerCase()) !== -1;
        })
      : all;

    // Also log to console as required by brief
    console.log('ShowInvoices() — ' + invoices.length + ' result(s)', invoices);

    if (invoices.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="6" class="data-table__empty">No invoices found.</td></tr>';
      return;
    }
    var html = '';
    for (var i = 0; i < invoices.length; i++) {
      var inv = invoices[i];
      html +=
        '<tr>' +
          '<td>' + inv.invoiceNumber + '</td>' +
          '<td>' + inv.trn + '</td>' +
          '<td>' + (inv.customerName || '—') + '</td>' +
          '<td>' + inv.date + '</td>' +
          '<td>' + inv.items.length + ' item(s)</td>' +
          '<td>' + money(inv.total) + '</td>' +
        '</tr>';
    }
    tbody.innerHTML = html;
  }

  /* ─────────────────────────────────────────────
     Q7: GetUserInvoices — display invoices for a user by TRN
  ───────────────────────────────────────────── */

  // Q7: GetUserInvoices — retrieve and display invoices for one user by TRN
  function GetUserInvoices(trn) {
    var all = getStorage('AllInvoices');
    var userInvoices = all.filter(function (inv) {
      return inv.trn === trn;
    });
    console.log('GetUserInvoices(' + trn + ') —', userInvoices);
    return userInvoices;
  }

  function initDashboard() {
    if (!document.getElementById('chart-gender')) return;

    ShowUserFrequency();
    ShowInvoices();

    var searchBtn   = document.getElementById('invoice-search-btn');
    var searchInput = document.getElementById('invoice-search');
    var clearBtn    = document.getElementById('invoice-search-clear');

    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', function () {
        ShowInvoices(searchInput.value.trim());
      });
      searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') ShowInvoices(searchInput.value.trim());
      });
    }
    if (clearBtn && searchInput) {
      clearBtn.addEventListener('click', function () {
        searchInput.value = '';
        ShowInvoices();
      });
    }
  }

  /* ─────────────────────────────────────────────
     BOOT — wire everything on DOMContentLoaded
  ───────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    // Shared across all pages
    updateNav();
    updateCartBadge();
    initLogout();

    // Page-specific initialisers
    initLogin();
    initRegister();
    initProducts();
    initAddToCart();
    initCart();
    initCheckout();
    renderInvoice();
    initDashboard();
  });

})();

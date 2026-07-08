const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('authToken');
}

function getUserInfo() {
  const raw = localStorage.getItem('userInfo');
  return raw ? JSON.parse(raw) : null;
}

function saveAuth(token, user) {
  localStorage.setItem('authToken', token);
  localStorage.setItem('userInfo', JSON.stringify(user));
  localStorage.setItem('activeCartOwner', user && user.id ? `user:${user.id}` : 'guest');
}

function clearAuth() {
  // Clear guest cart and all other user-specific carts/selections to prevent leaking items
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (
      key.startsWith('mysterypop_cart') || 
      key.startsWith('mysterypop_saved_address') || 
      key.startsWith('mysterypop_saved_phone') || 
      key.startsWith('activeCartOwner') || 
      key.startsWith('authToken') || 
      key.startsWith('userInfo')
    )) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));

  localStorage.setItem('activeCartOwner', 'guest');
}

function getActiveSessionKey() {
  const storedOwner = localStorage.getItem('activeCartOwner');
  const user = getUserInfo();

  if (storedOwner && storedOwner.startsWith('user:')) {
    const userId = storedOwner.split(':')[1];
    if (userId) {
      return `mysterypop_cart_${userId}`;
    }
  }

  if (user && user.id) {
    return `mysterypop_cart_${user.id}`;
  }
  return 'mysterypop_cart_guest';
}

function mergeCartItems(existingCart, incomingCart) {
  const mergedCart = Array.isArray(existingCart) ? [...existingCart] : [];
  (Array.isArray(incomingCart) ? incomingCart : []).forEach((item) => {
    const existingItem = mergedCart.find((entry) => String(entry.id) === String(item.id));
    if (existingItem) {
      existingItem.qty = (existingItem.qty || 1) + (item.qty || 1);
      existingItem.stock = Number(item.stock) || existingItem.stock || 0;
      existingItem.price = Number(item.price) || existingItem.price || 0;
    } else {
      mergedCart.push({
        id: String(item.id),
        name: item.name,
        price: Number(item.price) || 0,
        image: item.image || '',
        qty: Number(item.qty) || 1,
        stock: Number(item.stock) || 0
      });
    }
  });
  return mergedCart;
}

function migrateLegacyCart(targetKey) {
  const legacyCartKey = 'mysterypop_cart';
  const legacyCartRaw = localStorage.getItem(legacyCartKey);
  if (!legacyCartRaw) return false;

  try {
    const legacyCart = JSON.parse(legacyCartRaw);
    const existingCartRaw = localStorage.getItem(targetKey);
    const existingCart = existingCartRaw ? JSON.parse(existingCartRaw) : [];
    const mergedCart = mergeCartItems(existingCart, legacyCart);
    localStorage.setItem(targetKey, JSON.stringify(mergedCart));
    localStorage.removeItem(legacyCartKey);
    return true;
  } catch (e) {
    console.warn('Legacy cart migration failed', e);
    return false;
  }
}

function getCartStorageKey() {
  return getActiveSessionKey();
}

function getCart() {
  try {
    const cartKey = getCartStorageKey();
    migrateLegacyCart(cartKey);

    const currentRaw = localStorage.getItem(cartKey);
    if (currentRaw) {
      const parsed = JSON.parse(currentRaw);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') {
        if (Array.isArray(parsed.cart)) return parsed.cart;
        if (Array.isArray(parsed.data)) return parsed.data;
        if (parsed.id !== undefined) return [parsed];
      }
    }

    return [];
  } catch (e) {
    console.warn('getCart parse failed, resetting cart', e, localStorage.getItem(getCartStorageKey()));
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(getCartStorageKey(), JSON.stringify(Array.isArray(cart) ? cart : []));
  } catch (e) {
    console.warn('saveCart failed', e);
  }
}

function getSelectedCheckoutItems() {
  try {
    const raw = localStorage.getItem(`${getCartStorageKey()}_selection`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (e) {
    return [];
  }
}

function saveSelectedCheckoutItems(itemIds) {
  try {
    const ids = Array.isArray(itemIds) ? itemIds.map(String) : [];
    localStorage.setItem(`${getCartStorageKey()}_selection`, JSON.stringify(ids));
  } catch (e) {
    console.warn('saveSelectedCheckoutItems failed', e);
  }
}

function clearSelectedCheckoutItems() {
  try {
    localStorage.removeItem(`${getCartStorageKey()}_selection`);
  } catch (e) {
    console.warn('clearSelectedCheckoutItems failed', e);
  }
}

function getCartSelection() {
  const cart = getCart();
  const selected = getSelectedCheckoutItems();
  const validIds = cart.map(item => String(item.id));
  const filtered = selected.filter(id => validIds.includes(id));
  if (!filtered.length && cart.length) {
    return validIds;
  }
  return filtered;
}

function getSelectedCartItems() {
  const cart = getCart();
  const selectionIds = getCartSelection();
  if (!selectionIds.length) return cart;
  return cart.filter(item => selectionIds.includes(String(item.id)));
}

function toggleCartItemSelection(id, selected) {
  const itemId = String(id);
  const cart = getCart();
  const validIds = cart.map(item => String(item.id));
  if (!validIds.includes(itemId)) {
    return;
  }
  const selectedIds = new Set(getCartSelection());
  if (selected) {
    selectedIds.add(itemId);
  } else {
    selectedIds.delete(itemId);
  }
  saveSelectedCheckoutItems(Array.from(selectedIds));
}

function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function validateStoredSession() {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE}/users/me`, { headers: getAuthHeaders() });
    const result = await response.json();

    if (response.ok && result.success && result.data?.user) {
      saveAuth(token, result.data.user);
      return result.data.user;
    }

    if (response.status === 401 || (result && typeof result.message === 'string' && /invalid|unauthorized|missing/i.test(result.message))) {
      clearAuth();
      return null;
    }

    // Preserve existing stored session if the request fails for other reasons
    return getUserInfo();
  } catch (error) {
    console.warn('Session validation failed', error);
    return getUserInfo();
  }
}

function renderNav() {
  const user = getUserInfo();
  const navBar = document.getElementById('navBar');
  if (!navBar) return;

  const userText = user ? `${user.name} (${user.role})` : 'Guest';
  const adminLinks = user && user.role === 'admin' 
    ? `<li class="nav-item"><a class="nav-link" href="products-admin.html">Products Admin</a></li>
       <li class="nav-item"><a class="nav-link" href="customers.html">Customers Admin</a></li>
       <li class="nav-item"><a class="nav-link" href="users.html">User Admin</a></li>` 
    : '';
  const authButtons = user
    ? `<li class="nav-item"><a class="nav-link" href="#" id="logoutLink">Logout</a></li>`
    : `<li class="nav-item"><a class="nav-link" href="login.html">Login</a></li><li class="nav-item"><a class="nav-link" href="register.html">Register</a></li>`;

  navBar.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container-fluid">
        <a class="navbar-brand" href="index.html">MysteryPopShop</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item"><a class="nav-link" href="products.html">Products</a></li>
            <li class="nav-item"><a class="nav-link" href="products-infinite.html">Infinite Feed</a></li>
            ${adminLinks}
          </ul>
          <span class="navbar-text me-3">${userText}</span>
          <ul class="navbar-nav">${authButtons}</ul>
        </div>
      </div>
    </nav>
  `;

  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault();
      clearAuth();
      window.location.href = 'index.html';
    });
  }
}

function ensureLoggedIn() {
  if (!getToken()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function ensureAdmin() {
  const user = getUserInfo();
  if (!user || user.role !== 'admin') {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

function renderAdminSidebar(activePage = 'dashboard') {
  const mount = document.getElementById('adminSidebar');
  if (!mount) return;

  const items = [
    { key: 'dashboard', href: 'admin-dashboard.html', label: 'Dashboard', icon: 'house' },
    { key: 'charts', href: 'admin-charts.html', label: 'Charts', icon: 'chart-column' },
    { key: 'products', href: 'products-admin.html', label: 'Products', icon: 'boxes-stacked' },
    { key: 'orders', href: 'admin-orders.html', label: 'Orders', icon: 'receipt' },
    { key: 'customers', href: 'customers.html', label: 'Customers', icon: 'users' },
    { key: 'users', href: 'users.html', label: 'Users', icon: 'user-shield' },
    { key: 'reviews', href: 'admin-reviews.html', label: 'Reviews', icon: 'comments' }
  ];

  const user = getUserInfo();
  const userName = user && user.name ? user.name : 'Administrator';
  const userEmail = user && user.email ? user.email : 'admin@example.com';

  mount.innerHTML = `
    <aside class="admin-sidebar-shell" aria-label="Admin sidebar navigation">
      <div class="admin-sidebar-header">
        <a class="admin-sidebar-brand" href="admin-dashboard.html">
          <i class="fas fa-cube"></i>
          <span>MysteryPop</span>
        </a>
        <div class="admin-profile-badge">
          <div class="admin-avatar">
            <i class="fas fa-user-shield"></i>
          </div>
          <div class="admin-profile-info">
            <div class="admin-profile-name">${userName}</div>
            <div class="admin-profile-role">Store Admin</div>
          </div>
        </div>
      </div>
      
      <p class="admin-sidebar-note">Jump between sections without leaving the admin area.</p>
      
      <nav class="admin-sidebar-nav">
        ${items.map((item) => `
          <a href="${item.href}" class="admin-sidebar-link${item.key === activePage ? ' active' : ''}"${item.key === activePage ? ' aria-current="page"' : ''}>
            <i class="fas fa-${item.icon}"></i>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>

      <div class="admin-sidebar-footer">
        <a href="products.html" class="admin-sidebar-link admin-sidebar-home">
          <i class="fas fa-store"></i>
          <span>Go to Shop</span>
        </a>
        <a href="#" class="admin-sidebar-link admin-sidebar-logout" id="adminSidebarLogout">
          <i class="fas fa-right-from-bracket"></i>
          <span>Logout</span>
        </a>
      </div>
    </aside>
  `;

  const logoutBtn = document.getElementById('adminSidebarLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (event) => {
      event.preventDefault();
      showLogoutConfirmation(() => {
        clearAuth();
        globalThis.location.href = 'index.html';
      });
    });
  }
}

// Theme toggle helpers (used by pages via the #themeToggle button)
function toggleTheme() {
  const body = document.body;
  const toggle = document.getElementById('themeToggle');

  const isDark = body.classList.toggle('dark-mode');
  body.classList.toggle('light-mode', !isDark);
  if (toggle) toggle.classList.toggle('dark-active', isDark);

  try {
    localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
  } catch (e) {
    // ignore storage errors
  }
}

function loadThemePreference() {
  let pref = 'light';
  try {
    pref = localStorage.getItem('theme-preference') || 'light';
  } catch (e) {
    pref = 'light';
  }
  const body = document.body;
  const toggle = document.getElementById('themeToggle');

  if (pref === 'dark') {
    body.classList.add('dark-mode');
    body.classList.remove('light-mode');
    if (toggle) toggle.classList.add('dark-active');
  } else {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    if (toggle) toggle.classList.remove('dark-active');
  }
}

function updateFooterVisibility() {
  const footer = document.querySelector('.hero-footer');
  if (!footer) return;

  const scrollPosition = window.scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const bottomThreshold = 20;

  if (scrollPosition >= documentHeight - bottomThreshold) {
    footer.classList.add('show-on-bottom');
  } else {
    footer.classList.remove('show-on-bottom');
  }
}

function renderFooterLinks() {
  const containers = document.querySelectorAll('.footer-links');
  containers.forEach((container) => {
    if (!container || container.innerHTML.trim()) return;
    container.innerHTML = `
      <a href="about.html">About</a>
      <a href="contact.html">Contact</a>
    `;
  });
}

function initFooterOnScroll() {
  updateFooterVisibility();
  window.addEventListener('scroll', updateFooterVisibility, { passive: true });
  window.addEventListener('resize', updateFooterVisibility);
}

document.addEventListener('DOMContentLoaded', () => {
  loadThemePreference();
  void validateStoredSession();
  renderFooterLinks();
  initFooterOnScroll();
});

// Initialize navbar for pages that call initNav()
function initNav() {
  const user = getUserInfo();
  const navLinks = document.getElementById('navLinks');
  if (!navLinks) return;

  if (user && user.role === 'admin') {
    navLinks.innerHTML = `
      <a href="products-admin.html" class="nav-link">Products Admin</a>
      <a href="customers.html" class="nav-link">Customers</a>
      <a href="users.html" class="nav-link">Users</a>
      <a href="products.html" class="nav-link">Browse Products</a>
      <a href="products-infinite.html" class="nav-link">Infinite Feed</a>
      <a href="admin-orders.html" class="nav-link">Order Management</a>
      <a href="cart.html" class="nav-link">Cart <span id="navCartCount" class="badge bg-primary ms-1" style="display:none">0</span></a>
      <div class="nav-user-profile d-flex align-items-center ms-2" style="cursor: default;">
        <img id="navAvatar" src="" class="rounded-circle border" style="width: 28px; height: 28px; object-fit: cover;" alt="Avatar" />
        <span class="nav-link text-white ms-1">${user.name || user.username}</span>
      </div>
      <a href="#" class="nav-link" id="logoutBtn">Logout</a>
    `;
    const navAvatar = document.getElementById('navAvatar');
    if (navAvatar) {
      const storedAvatar = localStorage.getItem(`mysterypop_avatar_${user.id}`);
      if (storedAvatar) {
        navAvatar.src = storedAvatar;
      } else {
        const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        navAvatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=2e4358&textColor=ffffff`;
      }
    }
  } else if (user) {
    navLinks.innerHTML = `
      <a href="products.html" class="nav-link">Browse Products</a>
      <a href="products-infinite.html" class="nav-link">Infinite Feed</a>
      <a href="profile.html" class="nav-link">Profile</a>
      <a href="orders.html" class="nav-link">Orders</a>
      <a href="cart.html" class="nav-link">Cart <span id="navCartCount" class="badge bg-primary ms-1" style="display:none">0</span></a>
      <div class="nav-user-profile d-flex align-items-center ms-2" style="cursor: default;">
        <img id="navAvatar" src="" class="rounded-circle border" style="width: 28px; height: 28px; object-fit: cover;" alt="Avatar" />
        <span class="nav-link text-white ms-1">${user.name || user.username}</span>
      </div>
      <a href="#" class="nav-link" id="logoutBtn">Logout</a>
    `;
    const navAvatar = document.getElementById('navAvatar');
    if (navAvatar) {
      const storedAvatar = localStorage.getItem(`mysterypop_avatar_${user.id}`);
      if (storedAvatar) {
        navAvatar.src = storedAvatar;
      } else {
        const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        navAvatar.src = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}&backgroundColor=2e4358&textColor=ffffff`;
      }
    }
  } else {
    navLinks.innerHTML = `
      <a href="products.html" class="nav-link">Browse Products</a>
      <a href="products-infinite.html" class="nav-link">Infinite Feed</a>
      <a href="cart.html" class="nav-link">Cart <span id="navCartCount" class="badge bg-primary ms-1" style="display:none">0</span></a>
      <a href="login.html" class="nav-link">Login</a>
      <a href="register.html" class="nav-link">Sign Up</a>
    `;
  }

  // Highlight active link
  try {
    const path = globalThis.location.pathname;
    const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    const anchors = navLinks.querySelectorAll('a');
    anchors.forEach(a => {
      const href = a.getAttribute('href');
      if (href && href === page) {
        a.classList.add('active');
      }
    });
  } catch (e) {
    console.warn('Failed to set active nav link', e);
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showLogoutConfirmation(() => {
        clearAuth();
        window.location.href = 'index.html';
      });
    });
  }

  // update cart badge
  updateCartNavCount();
}

/* ===== LOGOUT VALIDATION MODAL ===== */
function showLogoutConfirmation(onConfirm) {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'logoutConfirmModal';
  modalContainer.style.position = 'fixed';
  modalContainer.style.top = '0';
  modalContainer.style.left = '0';
  modalContainer.style.width = '100vw';
  modalContainer.style.height = '100vh';
  modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
  modalContainer.style.backdropFilter = 'blur(6px)';
  modalContainer.style.webkitBackdropFilter = 'blur(6px)';
  modalContainer.style.display = 'flex';
  modalContainer.style.justifyContent = 'center';
  modalContainer.style.alignItems = 'center';
  modalContainer.style.zIndex = '999999';
  modalContainer.style.opacity = '0';
  modalContainer.style.transition = 'opacity 0.25s ease-out';

  // Create card
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'var(--bg-secondary, #ffffff)';
  modalContent.style.color = 'var(--text-primary, #1a1a1a)';
  modalContent.style.padding = '2.5rem 2rem';
  modalContent.style.borderRadius = '20px';
  modalContent.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
  modalContent.style.maxWidth = '420px';
  modalContent.style.width = '90%';
  modalContent.style.textAlign = 'center';
  modalContent.style.transform = 'scale(0.92)';
  modalContent.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';

  // Build content
  modalContent.innerHTML = `
    <div style="margin-bottom: 1.75rem;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 68px; height: 68px; border-radius: 50%; background-color: rgba(230, 186, 182, 0.2); color: #d4a5a0; margin-bottom: 1.25rem;">
        <i class="fas fa-sign-out-alt" style="font-size: 2.2rem;"></i>
      </div>
      <h3 style="margin: 0 0 0.5rem 0; font-weight: 700; font-family: 'Helvetica Neue', sans-serif; letter-spacing: -0.5px; font-size: 1.5rem;">Confirm Logout</h3>
      <p style="color: var(--text-secondary, #555); margin: 0; font-size: 0.95rem; line-height: 1.6;">Are you sure you want to log out of Mystery Pop? You'll need to sign back in to access your profile and view your past orders.</p>
    </div>
    <div style="display: flex; gap: 1rem; justify-content: center;">
      <button id="cancelLogoutBtn" style="flex: 1; padding: 0.8rem 1.2rem; border: 1px solid rgba(0, 0, 0, 0.12); background-color: transparent; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; color: var(--text-primary, #1a1a1a); transition: background-color 0.2s, border-color 0.2s;">Cancel</button>
      <button id="confirmLogoutBtn" style="flex: 1; padding: 0.8rem 1.2rem; border: none; background-color: var(--button-bg, #2e4358); color: #ffffff; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background-color 0.2s, transform 0.1s;">Log Out</button>
    </div>
  `;

  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  // Trigger transitions
  requestAnimationFrame(() => {
    modalContainer.style.opacity = '1';
    modalContent.style.transform = 'scale(1)';
  });

  const closeModal = () => {
    modalContainer.style.opacity = '0';
    modalContent.style.transform = 'scale(0.92)';
    setTimeout(() => {
      modalContainer.remove();
    }, 250);
  };

  // Add event listeners
  const cancelBtn = modalContent.querySelector('#cancelLogoutBtn');
  const confirmBtn = modalContent.querySelector('#confirmLogoutBtn');

  // Cancel logic
  cancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });

  // Hover states for Cancel
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
    cancelBtn.style.borderColor = 'rgba(0, 0, 0, 0.2)';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.backgroundColor = 'transparent';
    cancelBtn.style.borderColor = 'rgba(0, 0, 0, 0.12)';
  });

  // Hover states for Confirm
  confirmBtn.addEventListener('mouseenter', () => {
    confirmBtn.style.backgroundColor = 'var(--button-hover, #1a2635)';
  });
  confirmBtn.addEventListener('mouseleave', () => {
    confirmBtn.style.backgroundColor = 'var(--button-bg, #2e4358)';
  });

  confirmBtn.addEventListener('mousedown', () => {
    confirmBtn.style.transform = 'scale(0.97)';
  });
  confirmBtn.addEventListener('mouseup', () => {
    confirmBtn.style.transform = 'scale(1)';
  });

  // Confirm logic
  confirmBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
    onConfirm();
  });

  // Click outside to close
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeModal();
    }
  });
}

/* ===== CART HELPERS ===== */
function addToCart(item) {
  const cart = getCart();
  const itemId = String(item.id);
  const normalizedItem = {
    id: itemId,
    name: item.name,
    price: Number(item.price) || 0,
    image: (item.image || (item.images && item.images[0]) || ''),
    qty: 1,
    stock: Number(item.stock) || 0
  };
  const existing = cart.find(i => String(i.id) === itemId);
  if (existing) {
    existing.qty = Math.min((existing.qty || 1) + 1, normalizedItem.stock || 9999);
  } else {
    cart.push(normalizedItem);
  }
  saveCart(cart);
}

function removeFromCart(id) {
  const itemId = String(id);
  const cart = getCart().filter(i => String(i.id) !== itemId);
  saveCart(cart);
}

function updateCartQuantity(id, qty) {
  const itemId = String(id);
  const cart = getCart();
  const item = cart.find(i => String(i.id) === itemId);
  if (!item) return;
  item.qty = Math.max(1, qty);
  if (item.stock) item.qty = Math.min(item.qty, item.stock);
  saveCart(cart);
}

function cartTotal(auto=true) {
  const cart = getCart();
  const total = cart.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
  return total;
}

function updateCartNavCount() {
  const badge = document.getElementById('navCartCount');
  if (!badge) return;
  const cart = getCart();
  const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  badge.textContent = totalQty;
  badge.style.display = totalQty ? 'inline-block' : 'none';
}

function requireLoginForCheckout() {
  if (!getToken()) {
    showAuthRequiredModal();
    return false;
  }
  return true;
}

function showAuthRequiredModal() {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'authRequiredModal';
  modalContainer.style.position = 'fixed';
  modalContainer.style.top = '0';
  modalContainer.style.left = '0';
  modalContainer.style.width = '100vw';
  modalContainer.style.height = '100vh';
  modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
  modalContainer.style.backdropFilter = 'blur(6px)';
  modalContainer.style.webkitBackdropFilter = 'blur(6px)';
  modalContainer.style.display = 'flex';
  modalContainer.style.justifyContent = 'center';
  modalContainer.style.alignItems = 'center';
  modalContainer.style.zIndex = '999999';
  modalContainer.style.opacity = '0';
  modalContainer.style.transition = 'opacity 0.25s ease-out';

  // Create card
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'var(--bg-secondary, #ffffff)';
  modalContent.style.color = 'var(--text-primary, #1a1a1a)';
  modalContent.style.padding = '2.5rem 2rem';
  modalContent.style.borderRadius = '20px';
  modalContent.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
  modalContent.style.maxWidth = '460px';
  modalContent.style.width = '90%';
  modalContent.style.textAlign = 'center';
  modalContent.style.transform = 'scale(0.92)';
  modalContent.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';

  // Build content with option to Login, Sign Up, or Cancel
  modalContent.innerHTML = `
    <div style="margin-bottom: 1.75rem;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 68px; height: 68px; border-radius: 50%; background-color: rgba(13, 110, 253, 0.1); color: #0d6efd; margin-bottom: 1.25rem;">
        <i class="fas fa-lock" style="font-size: 2.2rem;"></i>
      </div>
      <h3 style="margin: 0 0 0.5rem 0; font-weight: 700; font-family: 'Helvetica Neue', sans-serif; letter-spacing: -0.5px; font-size: 1.5rem;">Authentication Required</h3>
      <p style="color: var(--text-secondary, #555); margin: 0; font-size: 0.95rem; line-height: 1.6;">You need to be logged in or signed up to checkout. Please log in or register a new account to continue!</p>
    </div>
    <div style="display: flex; flex-direction: column; gap: 0.75rem; align-items: stretch;">
      <button id="modalLoginBtn" style="padding: 0.8rem 1.2rem; border: none; background-color: var(--button-bg, #2e4358); color: #ffffff; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background-color 0.2s, transform 0.1s;">Log In to Account</button>
      <button id="modalSignupBtn" style="padding: 0.8rem 1.2rem; border: 1px solid rgba(13, 110, 253, 0.3); background-color: rgba(13, 110, 253, 0.05); color: #0d6efd; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background-color 0.2s, transform 0.1s;">Sign Up / Register</button>
      <button id="modalCancelBtn" style="padding: 0.8rem 1.2rem; border: 1px solid rgba(0, 0, 0, 0.12); background-color: transparent; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; color: var(--text-primary, #1a1a1a); transition: background-color 0.2s, border-color 0.2s;">Cancel</button>
    </div>
  `;

  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  // Trigger transitions
  requestAnimationFrame(() => {
    modalContainer.style.opacity = '1';
    modalContent.style.transform = 'scale(1)';
  });

  const closeModal = () => {
    modalContainer.style.opacity = '0';
    modalContent.style.transform = 'scale(0.92)';
    setTimeout(() => {
      modalContainer.remove();
    }, 250);
  };

  // Select buttons
  const loginBtn = modalContent.querySelector('#modalLoginBtn');
  const signupBtn = modalContent.querySelector('#modalSignupBtn');
  const cancelBtn = modalContent.querySelector('#modalCancelBtn');

  // Login handler
  loginBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
    globalThis.location.href = 'login.html';
  });

  // Signup handler
  signupBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
    globalThis.location.href = 'register.html';
  });

  // Cancel handler
  cancelBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeModal();
  });

  // Click outside to close
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeModal();
    }
  });

  // Hover animations
  loginBtn.addEventListener('mouseenter', () => {
    loginBtn.style.backgroundColor = 'var(--button-hover, #1a2635)';
  });
  loginBtn.addEventListener('mouseleave', () => {
    loginBtn.style.backgroundColor = 'var(--button-bg, #2e4358)';
  });

  signupBtn.addEventListener('mouseenter', () => {
    signupBtn.style.backgroundColor = 'rgba(13, 110, 253, 0.12)';
  });
  signupBtn.addEventListener('mouseleave', () => {
    signupBtn.style.backgroundColor = 'rgba(13, 110, 253, 0.05)';
  });

  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
    cancelBtn.style.borderColor = 'rgba(0, 0, 0, 0.2)';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.backgroundColor = 'transparent';
    cancelBtn.style.borderColor = 'rgba(0, 0, 0, 0.12)';
  });
}

function showNoticeModal(title, message) {
  const modalContainer = document.createElement('div');
  modalContainer.id = 'noticeModal';
  modalContainer.style.position = 'fixed';
  modalContainer.style.top = '0';
  modalContainer.style.left = '0';
  modalContainer.style.width = '100vw';
  modalContainer.style.height = '100vh';
  modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
  modalContainer.style.backdropFilter = 'blur(6px)';
  modalContainer.style.webkitBackdropFilter = 'blur(6px)';
  modalContainer.style.display = 'flex';
  modalContainer.style.justifyContent = 'center';
  modalContainer.style.alignItems = 'center';
  modalContainer.style.zIndex = '999999';
  modalContainer.style.opacity = '0';
  modalContainer.style.transition = 'opacity 0.25s ease-out';

  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = 'var(--bg-secondary, #ffffff)';
  modalContent.style.color = 'var(--text-primary, #1a1a1a)';
  modalContent.style.padding = '2.5rem 2rem';
  modalContent.style.borderRadius = '20px';
  modalContent.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
  modalContent.style.maxWidth = '420px';
  modalContent.style.width = '90%';
  modalContent.style.textAlign = 'center';
  modalContent.style.transform = 'scale(0.92)';
  modalContent.style.transition = 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';

  modalContent.innerHTML = `
    <div style="margin-bottom: 1.75rem;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 68px; height: 68px; border-radius: 50%; background-color: rgba(255, 193, 7, 0.15); color: #ffc107; margin-bottom: 1.25rem;">
        <i class="fas fa-exclamation-triangle" style="font-size: 2.2rem;"></i>
      </div>
      <h3 style="margin: 0 0 0.5rem 0; font-weight: 700; font-family: 'Helvetica Neue', sans-serif; letter-spacing: -0.5px; font-size: 1.5rem;">${title}</h3>
      <p style="color: var(--text-secondary, #555); margin: 0; font-size: 0.95rem; line-height: 1.6;">${message}</p>
    </div>
    <div style="display: flex; justify-content: center;">
      <button id="noticeOkBtn" style="padding: 0.8rem 2rem; border: none; background-color: var(--button-bg, #2e4358); color: #ffffff; border-radius: 10px; font-weight: 600; font-size: 0.95rem; cursor: pointer; transition: background-color 0.2s, transform 0.1s;">OK</button>
    </div>
  `;

  modalContainer.appendChild(modalContent);
  document.body.appendChild(modalContainer);

  requestAnimationFrame(() => {
    modalContainer.style.opacity = '1';
    modalContent.style.transform = 'scale(1)';
  });

  const closeModal = () => {
    modalContainer.style.opacity = '0';
    modalContent.style.transform = 'scale(0.92)';
    setTimeout(() => {
      modalContainer.remove();
    }, 250);
  };

  const okBtn = modalContent.querySelector('#noticeOkBtn');
  okBtn.addEventListener('click', closeModal);
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeModal();
    }
  });

  okBtn.addEventListener('mouseenter', () => {
    okBtn.style.backgroundColor = 'var(--button-hover, #1a2635)';
  });
  okBtn.addEventListener('mouseleave', () => {
    okBtn.style.backgroundColor = 'var(--button-bg, #2e4358)';
  });
}

function showCartToast(itemName, itemImage = '') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.position = 'fixed';
    container.style.top = '85px'; // Below the custom navbar
    container.style.right = '20px';
    container.style.zIndex = '999999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.gap = '10px';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.style.pointerEvents = 'auto';
  toast.style.width = '340px';
  toast.style.backgroundColor = 'rgba(30, 41, 59, 0.95)';
  toast.style.color = '#ffffff';
  toast.style.padding = '14px 18px';
  toast.style.borderRadius = '16px';
  toast.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)';
  toast.style.display = 'flex';
  toast.style.alignItems = 'center';
  toast.style.gap = '14px';
  toast.style.opacity = '0';
  toast.style.transform = 'translateX(50px)';
  toast.style.transition = 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
  toast.style.backdropFilter = 'blur(12px)';
  toast.style.webkitBackdropFilter = 'blur(12px)';
  toast.style.border = '1px solid rgba(255, 255, 255, 0.15)';

  const imgHtml = itemImage ? `<img src="${itemImage}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1);" />` : `
    <div style="width: 48px; height: 48px; background-color: rgba(40, 167, 69, 0.15); color: #2ecc71; display: flex; align-items: center; justify-content: center; border-radius: 10px;">
      <i class="fas fa-shopping-basket" style="font-size: 1.3rem;"></i>
    </div>
  `;

  toast.innerHTML = `
    ${imgHtml}
    <div style="flex-grow: 1; overflow: hidden;">
      <div style="font-weight: 700; font-size: 0.95rem; color: #2ecc71; margin-bottom: 2px; display: flex; align-items: center; gap: 6px;">
        <i class="fas fa-check-circle"></i> Added to Cart!
      </div>
      <div style="font-size: 0.85rem; color: #e2e8f0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px; font-weight: 500;">${itemName}</div>
    </div>
    <button style="border: none; background: transparent; color: #94a3b8; cursor: pointer; font-size: 1.2rem; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color 0.2s;" onmouseenter="this.style.color='#f1f5f9'" onmouseleave="this.style.color='#94a3b8'" onclick="this.parentElement.remove()">&times;</button>
  `;

  container.appendChild(toast);

  // Trigger entering animation
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // Remove toast automatically after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 3500);
}



const money = amount =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);


const productSets = {
  men: {
    container: "menProducts",
    names: [
      "The Heritage Classic", "Rosewood Chronograph", "Everyday Silver",
      "The Modern Minimal", "Midnight Blue", "Golden Hour",
      "Urban Steel", "The Weekend Edit", "Classic Brown Leather",
      "The Executive", "Ocean Blue Dial", "Vintage Inspired",
      "The Daily Essential", "Silver Edge", "The Timeless One",
      "Weekend Explorer"
    ],
    prices: [2499, 3299, 1899, 2199, 2799, 3599, 2999, 1999, 2399, 3899, 2699, 3199, 1799, 2899, 3499, 2599],
    category: "Men's collection",
    tags: ["Bestseller", "New arrival", "Everyday", "Classic"]
  },
  women: {
    container: "womenProducts",
    names: [
      "Blush Rose", "Petal Pink", "Rose Gold Grace", "The Soft Hour",
      "Pearl White", "Golden Bloom", "Delicate Charm", "Satin Silver",
      "Pink Champagne", "The Graceful Edit", "Rose Garden", "Luna Classic",
      "The Minimal Muse", "Little Luxe", "Soft Sunset", "Timeless Beauty"
    ],
    prices: [2199, 1799, 2999, 1999, 2499, 3299, 1899, 2399, 2799, 3499, 2299, 2599, 1699, 3199, 2099, 2899],
    category: "Women's collection",
    tags: ["Bestseller", "Pastel pick", "New arrival", "Elegant"]
  },
  kids: {
    container: "kidsProducts",
    names: [
      "Little Sunshine", "Rainbow Days", "Tiny Explorer", "Candy Pink",
      "Ocean Buddy", "Happy Hour", "Mini Star", "Playtime Pop",
      "Little Dreamer", "Blue Skies", "Sunny Side", "Magic Moments",
      "Junior Classic", "Happy Hearts", "Little Adventurer", "Colour Splash"
    ],
    prices: [799, 699, 999, 749, 899, 649, 1099, 799, 699, 949, 749, 899, 1199, 699, 999, 849],
    category: "Kids' collection",
    tags: ["Playful pick", "Colourful", "Bestseller", "New arrival"]
  }
};


// Realistic watch product photos from Unsplash
const imageIds = [
  "photo-1523275335684-37898b6baf30",
  "photo-1524805444758-089113d48a6d",
  "photo-1523170335258-f5ed11844a49",
  "photo-1508685096489-7aacd43bd3b1",
  "photo-1524592094714-0f0654e20314",
  "photo-1547996160-81dfa63595aa",
  "photo-1522312346375-d1a52e2b99b3",
  "photo-1539874754764-5a96559165b0",
  "photo-1434056886845-dac89ffe9b56",
  "photo-1612817288484-6f916006741a",
  "photo-1522335789203-aabd1fc54bc9",
  "photo-1619134778706-7015533a6150"
];

const products = [];
let nextId = 1;

Object.entries(productSets).forEach(([group, set], groupIndex) => {
  set.names.forEach((name, index) => {
    const imageId = imageIds[
      (index + groupIndex * 3) % imageIds.length
    ];

    products.push({
      id: nextId++,
      group,
      name,
      price: set.prices[index],
      category: set.category,
      tag: set.tags[index % set.tags.length],
      image: `https://images.unsplash.com/${imageId}?auto=format&fit=crop&w=650&q=80`
    });
  });
});




// ===============================
// TIMEZONE WISHLIST
// ===============================

const WISHLIST_KEY = "timezoneWishlist";

let wishlist = [];

try {
    wishlist = JSON.parse(
        localStorage.getItem(WISHLIST_KEY) || "[]"
    );

    if (!Array.isArray(wishlist)) {
        wishlist = [];
    }
} catch (error) {
    wishlist = [];
}

// Save wishlist in the browser
function saveWishlist() {
    localStorage.setItem(
        WISHLIST_KEY,
        JSON.stringify(wishlist)
    );
}

// Check whether a product is saved
function isWishlisted(productId) {
    return wishlist.some(
        item => String(item.id) === String(productId)
    );
}

// Add or remove a product
function toggleWishlist(productId) {
    const product = products.find(
        item => String(item.id) === String(productId)
    );

    if (!product) return;

    if (isWishlisted(productId)) {
        wishlist = wishlist.filter(
            item => String(item.id) !== String(productId)
        );
    } else {
        wishlist.push(product);
    }

    saveWishlist();
    updateWishlistHearts();

    // Refresh wishlist page if it is open
    if (typeof renderWishlistPage === "function") {
        renderWishlistPage();
    }
}

// Update heart buttons
function updateWishlistHearts() {
    document.querySelectorAll("[data-wishlist]").forEach(button => {
        const saved = isWishlisted(button.dataset.wishlist);

        button.textContent = saved ? "♥" : "♡";
        button.classList.toggle("is-wishlisted", saved);
        button.setAttribute(
            "aria-label",
            saved ? "Remove from wishlist" : "Add to wishlist"
        );
        button.setAttribute("aria-pressed", String(saved));
    });
}

// Handle heart clicks on product cards
document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-wishlist]");

    if (!button) return;

    event.preventDefault();

    toggleWishlist(button.dataset.wishlist);
});

// Apply saved heart states after products render
document.addEventListener("DOMContentLoaded", function () {
    updateWishlistHearts();
});


const bagKey = "timezoneBag";
let bag = loadBag();
let activeCoupon = false;
let toastTimer;

function loadBag() {
  try {
    const saved = JSON.parse(localStorage.getItem(bagKey) || "[]");
    if (!Array.isArray(saved)) return [];

    return saved
      .filter(item => products.some(product => product.id === Number(item.id)))
      .map(item => ({
        id: Number(item.id),
        quantity: Math.max(1, Math.min(99, Number(item.quantity) || 1))
      }));
  } catch {
    return [];
  }
}

function saveBag() {
  localStorage.setItem(bagKey, JSON.stringify(bag));
}

function renderProducts(searchTerm = "") {
  const term = searchTerm.trim().toLowerCase();

  Object.values(productSets).forEach(set => {
    const container = document.getElementById(set.container);
    const group = set.container.replace("Products", "");

    const matchingProducts = products.filter(product =>
      product.group === group &&
      (product.name.toLowerCase().includes(term) ||
       product.category.toLowerCase().includes(term) ||
       product.tag.toLowerCase().includes(term))
    );

    if (matchingProducts.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          No matching watches found. Try another search.
        </div>`;
      return;
    }

    container.innerHTML = matchingProducts.map(product => `
      <article class="product-card">
        <div class="product-image-wrap">
          <img
            class="product-image"
            src="${product.image}"
            alt="${product.name}"
            loading="lazy"
          >
          <span class="product-tag">${product.tag}</span>
          <button
            class="wishlist-button"
            type="button"
            aria-label="Toggle wishlist for ${product.name}"
            aria-pressed="false"
            data-wishlist="${product.id}"
          >♡</button>
        </div>
        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <h3>${product.name}</h3>
          <p class="product-rating">★★★★★ <span>(${4 + (product.id % 2)}.0)</span></p>
          <p class="product-price">${money(product.price)}</p>
          <button
            class="add-to-bag"
            type="button"
            data-add="${product.id}"
          >ADD TO BAG +</button>
        </div>
      </article>
    `).join("");
  });

  updateWishlistHearts();
}

function renderBag() {
  const bagItems = document.getElementById("bagItems");
  const totalQuantity = bag.reduce((sum, item) => sum + item.quantity, 0);

  document.getElementById("bagCount").textContent = totalQuantity;
  document.getElementById("drawerCount").textContent = `(${totalQuantity})`;

  if (bag.length === 0) {
    bagItems.innerHTML = `
      <div class="empty-bag">
        <div style="font-size:42px;color:#b66e7f;">♡</div>
        <h3>Your bag is waiting for something lovely.</h3>
        <p>Explore the collections and add a watch you love.</p>
      </div>`;
  } else {
    bagItems.innerHTML = bag.map(item => {
      const product = products.find(p => p.id === item.id);
      if (!product) return "";

      return `
        <article class="bag-item">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <h3>${product.name}</h3>
            <p class="bag-item-price">${money(product.price * item.quantity)}</p>
            <div class="bag-item-actions">
              <div class="quantity-control">
                <button type="button" data-quantity="-1" data-id="${product.id}" aria-label="Decrease quantity">−</button>
                <span>${item.quantity}</span>
                <button type="button" data-quantity="1" data-id="${product.id}" aria-label="Increase quantity">+</button>
              </div>
              <button type="button" class="remove-item" data-remove="${product.id}">Remove</button>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  const subtotal = bag.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  const discount = activeCoupon ? Math.round(subtotal * 0.30) : 0;
  document.getElementById("bagSubtotal").textContent = money(subtotal);
  document.getElementById("bagTotal").textContent = money(subtotal - discount);

  saveBag();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function openModal(id) {
  document.getElementById(id).classList.add("show");
  document.body.classList.add("no-scroll");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("show");
  if (!document.querySelector(".modal-overlay.show") &&
      !document.getElementById("bagOverlay").classList.contains("show")) {
    document.body.classList.remove("no-scroll");
  }
}

function openBag() {
  document.getElementById("bagOverlay").classList.add("show");
  document.body.classList.add("no-scroll");
  renderBag();
}

function closeBag() {
  document.getElementById("bagOverlay").classList.remove("show");
  if (!document.querySelector(".modal-overlay.show")) {
    document.body.classList.remove("no-scroll");
  }
}

function addToBag(id) {
  const existing = bag.find(item => item.id === id);

  if (existing) {
    if (existing.quantity >= 99) {
      showToast("Maximum quantity reached.");
      return;
    }
    existing.quantity += 1;
  } else {
    bag.push({ id, quantity: 1 });
  }

  renderBag();
  showToast("A lovely pick has been added to your bag ♡");
}

function updateQuantity(id, change) {
  const item = bag.find(entry => entry.id === id);
  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    bag = bag.filter(entry => entry.id !== id);
  } else if (item.quantity > 99) {
    item.quantity = 99;
  }

  renderBag();
}

function removeFromBag(id) {
  bag = bag.filter(item => item.id !== id);
  renderBag();
  showToast("Item removed from your bag.");
}

function applyOffer() {
  const input = document.getElementById("couponInput");
  const message = document.getElementById("bagMessage");
  const code = input.value.trim().toUpperCase();

  if (code === "TIME30") {
    activeCoupon = true;
    message.textContent = "Offer applied: 30% off this demo subtotal.";
    renderBag();
  } else {
    activeCoupon = false;
    message.textContent = "That code isn't recognised. Try TIME30.";
    renderBag();
  }
}

document.getElementById("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  renderProducts(document.getElementById("searchInput").value);

  const firstVisible = document.querySelector(".collection-section");
  if (firstVisible) {
    firstVisible.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

document.getElementById("searchInput").addEventListener("input", event => {
  renderProducts(event.target.value);
});

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    addToBag(Number(addButton.dataset.add));
    return;
  }

  const quantityButton = event.target.closest("[data-quantity]");
  if (quantityButton) {
    updateQuantity(
      Number(quantityButton.dataset.id),
      Number(quantityButton.dataset.quantity)
    );
    return;
  }

  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    removeFromBag(Number(removeButton.dataset.remove));
    return;
  }


  const closeButton = event.target.closest("[data-close]");
  if (closeButton) {
    closeModal(closeButton.dataset.close);
  }
});

document.getElementById("openBag").addEventListener("click", openBag);
document.getElementById("closeBag").addEventListener("click", closeBag);

document.getElementById("bagOverlay").addEventListener("click", event => {
  if (event.target.id === "bagOverlay") closeBag();
});

document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeModal(overlay.id);
  });
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    document.querySelectorAll(".modal-overlay.show").forEach(modal => closeModal(modal.id));
    closeBag();
  }
});

document.getElementById("showOffer").addEventListener("click", () => openModal("offerModal"));

document.getElementById("copyCoupon").addEventListener("click", async () => {
  const message = document.getElementById("couponMessage");

  try {
    await navigator.clipboard.writeText("TIME30");
    message.textContent = "TIME30 copied! Paste it into the offer-code box in your bag.";
  } catch {
    message.textContent = "Your demo offer code is TIME30. You can type it into your bag.";
  }
});

document.getElementById("applyCoupon").addEventListener("click", applyOffer);

document.getElementById("couponInput").addEventListener("keydown", event => {
  if (event.key === "Enter") applyOffer();
});

document.getElementById("clearBag").addEventListener("click", () => {
  bag = [];
  activeCoupon = false;
  document.getElementById("couponInput").value = "";
  document.getElementById("bagMessage").textContent = "";
  renderBag();
  showToast("Your bag has been cleared.");
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (bag.length === 0) {
    showToast("Your bag is empty. Add a watch first.");
    return;
  }

  alert(
    "Thank you for exploring TIMEZONE!\n\n" +
    "This is a demo checkout. No order or payment has been made.\n" +
    "Estimated total: " + document.getElementById("bagTotal").textContent
  );
});

document.getElementById("newsletterForm").addEventListener("submit", event => {
  event.preventDefault();
  document.getElementById("newsletterMessage").textContent =
    "Thank you! This demo newsletter does not save or send your email.";
  event.target.reset();
});

renderProducts();
renderBag();

if (sessionStorage.getItem("timezoneWelcomeShown") !== "yes") {
  sessionStorage.setItem("timezoneWelcomeShown", "yes");
  setTimeout(() => openModal("welcomeModal"), 500);
}

// TIMEZONE Frequent Offer Popups
document.addEventListener("DOMContentLoaded", function () {
    const popup = document.getElementById("offerPopup");
    const closeBtn = document.getElementById("closeOffer");
    const shopBtn = document.getElementById("shopOffer");

    if (!popup || !closeBtn || !shopBtn) return;

    const title = popup.querySelector("h2");
    const description = popup.querySelector(".offer-box > p:not(.offer-label):not(.offer-code):not(.offer-note)");
    const discount = popup.querySelector(".offer-discount");
    const code = popup.querySelector(".offer-code");

    const offers = [
        {
            title: 'Time for Something <span>Beautiful!</span>',
            description: "Enjoy an exclusive discount on your favourite timepieces.",
            discount: "30% OFF",
            code: "TIME30"
        },
        {
            title: 'A Little <span>Luxury!</span>',
            description: "Treat yourself to a timeless accessory today.",
            discount: "SPECIAL DEAL",
            code: "LUXURY10"
        },
        {
            title: 'A Gift for <span>You!</span>',
            description: "Discover your next favourite watch in our collection.",
            discount: "FREE SHIPPING",
            code: "SHIPFREE"
        }
    ];

    let offerIndex = 0;
    let popupTimer;

    function showOffer() {
        const offer = offers[offerIndex];

        title.innerHTML = offer.title;
        description.textContent = offer.description;
        discount.textContent = offer.discount;
        code.innerHTML = "Use code: <strong>" + offer.code + "</strong>";

        popup.classList.add("show");

        offerIndex = (offerIndex + 1) % offers.length;
    }

    function startOffers() {
        popupTimer = setInterval(function () {
            if (!popup.classList.contains("show")) {
                showOffer();
            }
        }, 15000);
    }

    // First offer after 2 seconds
    setTimeout(function () {
        showOffer();
        startOffers();
    }, 2000);

    closeBtn.addEventListener("click", function () {
        popup.classList.remove("show");
    });

    popup.addEventListener("click", function (event) {
        if (event.target === popup) {
            popup.classList.remove("show");
        }
    });

    shopBtn.addEventListener("click", function () {
        popup.classList.remove("show");

        const collection =
            document.getElementById("products") ||
            document.getElementById("collection");

        if (collection) {
            collection.scrollIntoView({ behavior: "smooth" });
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });
});


/* ==========================================
   TIMEZONE: NEW ARRIVALS, MEGA SALE,
   AND PRICE FILTERS
   Uses the existing products and card actions
========================================== */

function renderFeatureProducts(containerId, items, emptyMessage, badgeText) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!items.length) {
    container.innerHTML = `<div class="no-results">${emptyMessage}</div>`;
    return;
  }

  container.innerHTML = items.map(product => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img
          class="product-image"
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >
        <span class="product-tag">${badgeText || product.tag}</span>
        <button
          class="wishlist-button"
          type="button"
          aria-label="Add to wishlist"
          aria-pressed="false"
          data-wishlist="${product.id}"
        >♡</button>
      </div>

      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3>${product.name}</h3>
        <p class="product-rating">★★★★★ <span>(${4 + (product.id % 2)}.0)</span></p>
        <p class="product-price">${money(product.price)}</p>
        <button
          class="add-to-bag"
          type="button"
          data-add="${product.id}"
        >ADD TO BAG +</button>
      </div>
    </article>
  `).join("");

  // Keep saved wishlist hearts in sync with existing wishlist data.
  if (typeof updateWishlistHearts === "function") {
    updateWishlistHearts();
  }
}

function renderTimezoneFeatures() {
  // New Arrivals: use products tagged as new arrivals first.
  const taggedNew = products.filter(product =>
    product.tag.toLowerCase().includes("new arrival")
  );

  const newArrivals = (taggedNew.length ? taggedNew : products).slice(0, 8);

  renderFeatureProducts(
    "newArrivalsGrid",
    newArrivals,
    "New arrivals will appear here soon.",
    "New Arrival"
  );

  // MEGA SALE: show selected lower-priced watches.
  // These are demo picks, not claimed discounts.
  const salePicks = [...products]
    .sort((a, b) => a.price - b.price)
    .slice(0, 8);

  renderFeatureProducts(
    "megaSaleGrid",
    salePicks,
    "Sale picks will appear here soon.",
    "MEGA SALE PICK"
  );

  // Initial price-filter display: all products.
  const priceSelect = document.getElementById("priceRange");

  if (priceSelect) {
    renderFeatureProducts(
      "priceFilterGrid",
      products,
      "No watches found in this price range.",
      "Shop by Price"
    );

    updatePriceFilterMessage(products.length);
  }
}

function updatePriceFilterMessage(count) {
  const message = document.getElementById("priceFilterMessage");
  if (!message) return;

  message.textContent = `${count} watch${count === 1 ? "" : "es"} found.`;
}

function applyTimezonePriceFilter() {
  const priceSelect = document.getElementById("priceRange");
  if (!priceSelect) return;

  const maxPrice = priceSelect.value;

  const filteredProducts = products.filter(product =>
    maxPrice === "all" || product.price <= Number(maxPrice)
  );

  renderFeatureProducts(
    "priceFilterGrid",
    filteredProducts,
    "No watches found in this price range. Try a higher budget.",
    "Shop by Price"
  );

  updatePriceFilterMessage(filteredProducts.length);
}

function setupTimezoneFeatureControls() {
  const applyButton = document.getElementById("applyPriceFilter");
  const clearButton = document.getElementById("clearPriceFilter");
  const priceSelect = document.getElementById("priceRange");

  if (applyButton) {
    applyButton.addEventListener("click", applyTimezonePriceFilter);
  }

  if (priceSelect) {
    priceSelect.addEventListener("change", applyTimezonePriceFilter);
  }

  if (clearButton && priceSelect) {
    clearButton.addEventListener("click", () => {
      priceSelect.value = "all";
      applyTimezonePriceFilter();
    });
  }
}

// Initialize the extra sections without replacing existing functions.
renderTimezoneFeatures();
setupTimezoneFeatureControls();

/* ============================================================
   SAMA CROCHET — app.js
   خاصك تبدل هاد الرابط برابط الـ Google Apps Script deployment ديالك
   (Deploy > Web app > Copy URL) من نفس السكريبت اللي عندك
   ============================================================ */
const SHEET_API = "https://script.google.com/macros/s/AKfycbw29vMBsvGs21Eistfe6tx3PUCt1l_huTmTHvXb8Djd5mB0iv40YKeap-tQgYEy2GbSYg/exec";
const WHATSAPP_NUMBER = "212621091399";

/* منتجاتك الأصلية (43 منتج). كتخدم كنسخة احتياطية ملي مايكونش عندك اتصال بـ
   Google Sheets، أو ملي الشيت مازال فارغ. الصور خاصها تكون فمجلد image/
   بجانب index.html، مسماة بالأرقام: image/1.jpg, image/2.jpg ... image/43.jpg */
const SEED_PRODUCTS = [
  {
    "id": "p1",
    "name": "Chicken with Flowers",
    "desc": "كتكوت لطيف مع ورود كروشيه ♡",
    "cat": "keychains",
    "price": 46,
    "oldPrice": 0,
    "stock": 10,
    "img": "images/1.jpg"
  },
  {
    "id": "p2",
    "name": "Strawberry Keychain",
    "desc": "سلسلة مفاتيح فراولة لطيفة ♡",
    "cat": "keychains",
    "price": 48,
    "oldPrice": 60,
    "stock": 8,
    "img": "images/2.jpg"
  },
  {
    "id": "p3",
    "name": "Romantic Fllouss",
    "desc": "كتكوت ضريف يحمل قلب أحمر",
    "cat": "keychains",
    "price": 62,
    "oldPrice": 0,
    "stock": 5,
    "img": "images/3.jpg"
  },
  {
    "id": "p4",
    "name": "Tomato Keychain",
    "desc": "سلسلة مفاتيح طماطم مضحكة ♡",
    "cat": "keychains",
    "price": 56,
    "oldPrice": 0,
    "stock": 12,
    "img": "images/4.jpg"
  },
  {
    "id": "p5",
    "name": "Nishinoya Volleyball",
    "desc": "نيشينويا مع الكرة الطائرة - Haikyuu ♡",
    "cat": "keychains",
    "price": 57,
    "oldPrice": 0,
    "stock": 3,
    "img": "images/5.jpg"
  },
  {
    "id": "p6",
    "name": "Hinata Volleyball",
    "desc": "هيناتا مع الكرة الطائرة - Haikyuu ♡",
    "cat": "keychains",
    "price": 57,
    "oldPrice": 0,
    "stock": 4,
    "img": "images/6.jpg"
  },
  {
    "id": "p7",
    "name": "Kaito Kid Keychain",
    "desc": "كايتو كيد - شخصية لطيفة ♡",
    "cat": "keychains",
    "price": 44,
    "oldPrice": 0,
    "stock": 7,
    "img": "images/7.jpg"
  },
  {
    "id": "p8",
    "name": "Mikasa Scarf & Gloves",
    "desc": "طقم وشاح وقفازات ميكاسا",
    "cat": "accessories",
    "price": 289,
    "oldPrice": 350,
    "stock": 2,
    "img": "images/8.jpg"
  },
  {
    "id": "p9",
    "name": "Crochet Gloves",
    "desc": "قفازات كروشيه دافئة ♡",
    "cat": "accessories",
    "price": 78,
    "oldPrice": 0,
    "stock": 6,
    "img": "images/9.jpg"
  },
  {
    "id": "p10",
    "name": "Single Tulip",
    "desc": "زهرة توليب واحدة جميلة ♡",
    "cat": "flowers",
    "price": 25,
    "oldPrice": 0,
    "stock": 15,
    "img": "images/10.jpg"
  },
  {
    "id": "p11",
    "name": "Graduation Girl Doll",
    "desc": "فتاة تخرج بدفتر وطاقية",
    "cat": "dolls",
    "price": 63,
    "oldPrice": 0,
    "stock": 4,
    "img": "images/11.jpg"
  },
  {
    "id": "p12",
    "name": "Mini Scarf Keychain",
    "desc": "سلسلة مفاتيح وشاح صغير ♡",
    "cat": "keychains",
    "price": 28,
    "oldPrice": 0,
    "stock": 20,
    "img": "images/12.jpg"
  },
  {
    "id": "p13",
    "name": "Sunflower Girl Doll",
    "desc": "فتاة مع دوار الشمس ♡",
    "cat": "dolls",
    "price": 70,
    "oldPrice": 0,
    "stock": 3,
    "img": "images/13.jpg"
  },
  {
    "id": "p14",
    "name": "Single Carnation",
    "desc": "زهرة قرنفل واحدة أنيقة ♡",
    "cat": "flowers",
    "price": 60,
    "oldPrice": 0,
    "stock": 9,
    "img": "images/14.jpg"
  },
  {
    "id": "p15",
    "name": "Bouquet of 4 Carnations",
    "desc": "باقة من ٤ ورود قرنفل ♡",
    "cat": "flowers",
    "price": 230,
    "oldPrice": 280,
    "stock": 2,
    "img": "images/15.jpg"
  },
  {
    "id": "p16",
    "name": "Sunflower",
    "desc": "دوار شمس كبير مشرق ♡",
    "cat": "flowers",
    "price": 70,
    "oldPrice": 0,
    "stock": 5,
    "img": "images/16.jpg"
  },
  {
    "id": "p17",
    "name": "Mirror Flower Crochet",
    "desc": "مرآة الزهور كروشيه ♡",
    "cat": "accessories",
    "price": 119,
    "oldPrice": 0,
    "stock": 3,
    "img": "images/17.jpg"
  },
  {
    "id": "p18",
    "name": "Mushroom Keychain",
    "desc": "سلسلة مفاتيح فطر لطيف ♡",
    "cat": "keychains",
    "price": 44,
    "oldPrice": 0,
    "stock": 11,
    "img": "images/18.jpg"
  },
  {
    "id": "p19",
    "name": "Octopus Keychain",
    "desc": "سلسلة مفاتيح أخطبوط لطيف ♡",
    "cat": "keychains",
    "price": 50,
    "oldPrice": 0,
    "stock": 8,
    "img": "images/19.jpg"
  },
  {
    "id": "p20",
    "name": "Bouquet of Lily Flowers",
    "desc": "زهرة زنبق أنيقة ♡",
    "cat": "flowers",
    "price": 146,
    "oldPrice": 180,
    "stock": 2,
    "img": "images/20.jpg"
  },
  {
    "id": "p21",
    "name": "Rose Flower",
    "desc": "وردة كروشيه رومانسية ♡",
    "cat": "flowers",
    "price": 62,
    "oldPrice": 0,
    "stock": 7,
    "img": "images/21.jpg"
  },
  {
    "id": "p22",
    "name": "Large Handmade Doll",
    "desc": "دمية كروشيه كبيرة وجميلة ♡",
    "cat": "dolls",
    "price": 370,
    "oldPrice": 420,
    "stock": 1,
    "img": "images/22.jpg"
  },
  {
    "id": "p23",
    "name": "Ramadan Character Doll",
    "desc": "شخصية رمضان مع فانوس ♡",
    "cat": "dolls",
    "price": 325,
    "oldPrice": 0,
    "stock": 2,
    "img": "images/23.jpg"
  },
  {
    "id": "p24",
    "name": "Mini Pig Doll",
    "desc": "خنزير صغير كروشيه لطيف ♡",
    "cat": "dolls",
    "price": 85,
    "oldPrice": 0,
    "stock": 5,
    "img": "images/24.jpg"
  },
  {
    "id": "p25",
    "name": "Teddy Bear Keychain",
    "desc": "دبدوب صغير سلسلة مفاتيح ♡",
    "cat": "keychains",
    "price": 45,
    "oldPrice": 0,
    "stock": 14,
    "img": "images/25.jpg"
  },
  {
    "id": "p26",
    "name": "Romantic Fllouss 2",
    "desc": "سلسلة مفاتيح كتكوت يحمل وردة ♡",
    "cat": "keychains",
    "price": 65,
    "oldPrice": 0,
    "stock": 6,
    "img": "images/26.jpg"
  },
  {
    "id": "p27",
    "name": "Little Fllouss",
    "desc": "سلسلة مفاتيح ورود صغيرة لطيفة ♡",
    "cat": "keychains",
    "price": 40,
    "oldPrice": 0,
    "stock": 10,
    "img": "images/27.jpg"
  },
  {
    "id": "p28",
    "name": "Batman Doll",
    "desc": "دمية باتمان كروشيه مميزة",
    "cat": "dolls",
    "price": 129,
    "oldPrice": 0,
    "stock": 3,
    "img": "images/28.jpg"
  },
  {
    "id": "p29",
    "name": "Mini Flowers",
    "desc": "سلسلة مفاتيح ورود صغيرة جداً ♡",
    "cat": "keychains",
    "price": 25,
    "oldPrice": 0,
    "stock": 18,
    "img": "images/29.jpg"
  },
  {
    "id": "p30",
    "name": "Chicken Bo3o",
    "desc": "دجاجة بوعو لطيفة سلسلة مفاتيح ♡",
    "cat": "keychains",
    "price": 59,
    "oldPrice": 0,
    "stock": 7,
    "img": "images/30.jpg"
  },
  {
    "id": "p31",
    "name": "Flowers Box",
    "desc": "صندوق ورود كروشيه جميل ♡",
    "cat": "flowers",
    "price": 79,
    "oldPrice": 0,
    "stock": 4,
    "img": "images/31.jpg"
  },
  {
    "id": "p32",
    "name": "Little Bear",
    "desc": "دب صغير سلسلة مفاتيح لطيف ♡",
    "cat": "keychains",
    "price": 45,
    "oldPrice": 0,
    "stock": 9,
    "img": "images/32.jpg"
  },
  {
    "id": "p33",
    "name": "Book Marker",
    "desc": "علامة كتاب كروشيه مميزة ♡",
    "cat": "accessories",
    "price": 25,
    "oldPrice": 0,
    "stock": 20,
    "img": "images/33.jpg"
  },
  {
    "id": "p34",
    "name": "Gold Earrings",
    "desc": "أقراط ذهبية كروشيه ♡",
    "cat": "accessories",
    "price": 43,
    "oldPrice": 0,
    "stock": 6,
    "img": "images/34.jpg"
  },
  {
    "id": "p35",
    "name": "Flower Earrings",
    "desc": "أقراط الورود كروشيه ♡",
    "cat": "accessories",
    "price": 45,
    "oldPrice": 0,
    "stock": 8,
    "img": "images/35.jpg"
  },
  {
    "id": "p36",
    "name": "Naruto Keychain",
    "desc": "ناروتو من انمي ناروتو ♡",
    "cat": "keychains",
    "price": 40,
    "oldPrice": 0,
    "stock": 10,
    "img": "images/36.jpg"
  },
  {
    "id": "p37",
    "name": "Gojo Satoru Keychain",
    "desc": "جوجو من انمي جوجتسو كايسن ♡",
    "cat": "keychains",
    "price": 45,
    "oldPrice": 0,
    "stock": 7,
    "img": "images/37.jpg"
  },
  {
    "id": "p38",
    "name": "Strawberry Earrings",
    "desc": "أقراط فراولة كروشيه ♡",
    "cat": "accessories",
    "price": 43,
    "oldPrice": 0,
    "stock": 5,
    "img": "images/38.jpg"
  },
  {
    "id": "p39",
    "name": "Panda",
    "desc": "باندا كروشيه لطيف ♡",
    "cat": "keychains",
    "price": 40,
    "oldPrice": 0,
    "stock": 11,
    "img": "images/39.jpg"
  },
  {
    "id": "p40",
    "name": "Spider-Man",
    "desc": "سلسلة مفاتيح للرجل العنكبوت ♡",
    "cat": "keychains",
    "price": 50,
    "oldPrice": 0,
    "stock": 8,
    "img": "images/40.jpg"
  },
  {
    "id": "p41",
    "name": "Bouquet Flowers",
    "desc": "ورود كروشيه جميلة ♡",
    "cat": "flowers",
    "price": 279,
    "oldPrice": 320,
    "stock": 2,
    "img": "images/41.jpg"
  },
  {
    "id": "p42",
    "name": "Kout-kout Twin",
    "desc": "توأم كتاكيت لطيف بقبعة وردية ♡",
    "cat": "keychains",
    "price": 42,
    "oldPrice": 0,
    "stock": 6,
    "img": "images/42.jpg"
  },
  {
    "id": "p43",
    "name": "Rose Flower Earrings",
    "desc": "أقراط ورود حمراء كروشيه ♡",
    "cat": "accessories",
    "price": 45,
    "oldPrice": 0,
    "stock": 5,
    "img": "images/43.jpg"
  }
];

const CAT_LABELS = {
  keychains: "سلاسل مفاتيح",
  dolls: "دمى",
  flowers: "ورود",
  accessories: "إكسسوارات"
};

let products = [];
let cart = JSON.parse(localStorage.getItem('sama_cart') || '[]');
let currentCat = 'all';
let currentModalProduct = null;
let modalQty = 1;
let adminPassword = '';
let logoTapCount = 0, logoTapTimer = null;

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  loadProductsFromCloud();
  updateCartBadge();
  initThreadAnimation();
  initSecretGesture();

  document.getElementById('searchInput').addEventListener('input', renderShop);
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCat = chip.dataset.cat;
      renderShop();
    });
  });
});

/* ---------- Navigation ---------- */
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.page === id));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* secret gesture: 5 taps on logo within 2s opens admin */
function initSecretGesture() {
  document.getElementById('logoGesture').addEventListener('click', () => {
    logoTapCount++;
    clearTimeout(logoTapTimer);
    logoTapTimer = setTimeout(() => { logoTapCount = 0; }, 2000);
    if (logoTapCount >= 5) {
      logoTapCount = 0;
      showPage('admin');
    }
  });
}

/* ---------- Cloud sync ---------- */
async function loadProductsFromCloud() {
  try {
    const res = await fetch(SHEET_API + '?action=getProducts');
    const data = await res.json();
    const cloudProducts = Array.isArray(data) ? data : (data.products || []);
    if (cloudProducts.length) {
      products = cloudProducts;
      localStorage.setItem('sama_products', JSON.stringify(products));
    } else {
      // الشيت مازال فارغ: نستعملو الكتالوج الأصلي (SEED_PRODUCTS) كنقطة انطلاق
      products = SEED_PRODUCTS;
    }
  } catch (e) {
    const cached = localStorage.getItem('sama_products');
    products = cached ? JSON.parse(cached) : SEED_PRODUCTS;
  }
  renderFeatured();
  renderShop();
}

async function apiCall(action, payload = {}) {
  const protectedActions = ['addProduct', 'updateProduct', 'deleteProduct'];
  const body = protectedActions.includes(action)
    ? { action, password: adminPassword, ...payload }
    : { action, ...payload };
  try {
    const res = await fetch(SHEET_API, { method: 'POST', body: JSON.stringify(body) });
    const data = await res.json();
    if (data.status === 'error' && data.message === 'Unauthorized') {
      toast('غير مسموح، دخلي من جديد ❌', 'danger');
      adminLogout();
    }
    return data;
  } catch (e) {
    toast('مشكل فالاتصال بالسيرفر ❌', 'danger');
    return { status: 'error', message: 'network' };
  }
}

/* ---------- Rendering ---------- */
function stockLabel(p) {
  if (p.stock <= 0) return '<span class="card-badge badge-outofstock">نفدت الكمية</span>';
  if (p.oldPrice > 0) return '<span class="card-badge badge-discount">تخفيض</span>';
  return '';
}

function createCard(p) {
  const div = document.createElement('div');
  div.className = 'card';
  div.innerHTML = `
    ${stockLabel(p)}
    <img class="card-img" src="${p.img || ''}" alt="${p.name}" loading="lazy" onerror="this.src='icon-192.png'">
    <div class="card-body">
      <div class="card-name">${p.name}</div>
      <div class="card-desc">${p.desc || ''}</div>
      <div class="price-row">
        <span class="price">${p.price} DH</span>
        ${p.oldPrice > 0 ? `<span class="old-price">${p.oldPrice} DH</span>` : ''}
      </div>
      <button class="add-btn" ${p.stock <= 0 ? 'disabled' : ''} onclick="event.stopPropagation();quickAdd('${p.id}')">
        <i class="fa-solid fa-cart-plus"></i> ${p.stock <= 0 ? 'نفدت' : 'أضيفي للسلة'}
      </button>
    </div>`;
  div.addEventListener('click', () => openModal(p.id));
  return div;
}

function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  grid.innerHTML = '';
  const featured = products.slice(-8).reverse();
  if (!featured.length) { grid.innerHTML = emptyStateHTML('مازال ما كاينين حتى منتجات'); return; }
  featured.forEach(p => grid.appendChild(createCard(p)));
}

function renderShop() {
  const grid = document.getElementById('shopGrid');
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  let list = products.filter(p => currentCat === 'all' || p.cat === currentCat);
  if (q) list = list.filter(p => (p.name + p.desc).toLowerCase().includes(q));
  grid.innerHTML = '';
  if (!list.length) { grid.innerHTML = emptyStateHTML('ماكاينش منتجات تطابق البحث'); return; }
  list.forEach(p => grid.appendChild(createCard(p)));
}

function emptyStateHTML(msg) {
  return `<div class="empty-state" style="grid-column:1/-1">
    <i class="fa-solid fa-box-open"></i><p>${msg}</p>
  </div>`;
}

/* ---------- Product modal ---------- */
function openModal(id) {
  const p = products.find(x => String(x.id) === String(id));
  if (!p) return;
  currentModalProduct = p;
  modalQty = 1;
  document.getElementById('modalImg').src = p.img || 'icon-192.png';
  document.getElementById('modalName').textContent = p.name;
  document.getElementById('modalDesc').textContent = p.desc || '';
  document.getElementById('modalPrice').textContent = p.price + ' DH';
  document.getElementById('modalOldPrice').textContent = p.oldPrice > 0 ? p.oldPrice + ' DH' : '';
  document.getElementById('modalQty').textContent = modalQty;
  const btn = document.getElementById('modalAddBtn');
  btn.disabled = p.stock <= 0;
  btn.textContent = p.stock <= 0 ? 'نفدت الكمية' : 'أضيفي للسلة';
  document.getElementById('productModal').classList.add('show');
}
function closeModal() { document.getElementById('productModal').classList.remove('show'); }
function changeModalQty(d) {
  modalQty = Math.max(1, modalQty + d);
  document.getElementById('modalQty').textContent = modalQty;
}
function addToCartFromModal() {
  if (!currentModalProduct) return;
  addToCart(currentModalProduct.id, modalQty);
  closeModal();
}
function quickAdd(id) { addToCart(id, 1); }

/* ---------- Cart ---------- */
function addToCart(id, qty) {
  const p = products.find(x => String(x.id) === String(id));
  if (!p || p.stock <= 0) return;
  const existing = cart.find(i => String(i.id) === String(id));
  if (existing) existing.qty += qty;
  else cart.push({ id: p.id, name: p.name, price: p.price, img: p.img, qty });
  saveCart();
  toast('تزادت للسلة ✅', 'success');
}
function changeQty(id, d) {
  const item = cart.find(i => String(i.id) === String(id));
  if (!item) return;
  item.qty += d;
  if (item.qty <= 0) cart = cart.filter(i => String(i.id) !== String(id));
  saveCart(); renderCart();
}
function removeFromCart(id) { cart = cart.filter(i => String(i.id) !== String(id)); saveCart(); renderCart(); }
function saveCart() { localStorage.setItem('sama_cart', JSON.stringify(cart)); updateCartBadge(); }
function cartTotal() { return cart.reduce((s, i) => s + i.price * i.qty, 0); }
function updateCartBadge() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById('cartCount');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}
function openCart() { renderCart(); document.getElementById('cartDrawer').classList.add('show'); document.getElementById('cartOverlay').classList.add('show'); }
function closeCart() { document.getElementById('cartDrawer').classList.remove('show'); document.getElementById('cartOverlay').classList.remove('show'); }
function renderCart() {
  const body = document.getElementById('cartBody');
  if (!cart.length) { body.innerHTML = emptyStateHTML('السلة فارغة'); document.getElementById('cartFooter').style.display = 'none'; return; }
  document.getElementById('cartFooter').style.display = 'block';
  body.innerHTML = '';
  cart.forEach(i => {
    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${i.img || 'icon-192.png'}" alt="${i.name}">
      <div class="cart-item-info">
        <h4>${i.name}</h4>
        <span class="price">${i.price} DH</span>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="changeQty('${i.id}',-1)">-</button>
          <span class="qty-val">${i.qty}</span>
          <button class="qty-btn" onclick="changeQty('${i.id}',1)">+</button>
          <span class="remove-link" onclick="removeFromCart('${i.id}')">حذف</span>
        </div>
      </div>`;
    body.appendChild(row);
  });
  document.getElementById('cartTotalVal').textContent = cartTotal() + ' DH';
}

/* ---------- Checkout via WhatsApp ---------- */
async function sendOrder() {
  const name = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();
  const address = document.getElementById('orderAddress').value.trim();
  if (!cart.length) { toast('السلة فارغة ❌', 'danger'); return; }
  if (!name || !phone || !address) { toast('عمري جميع المعلومات ❌', 'danger'); return; }

  const lines = cart.map(i => `- ${i.name} × ${i.qty} = ${i.price * i.qty} DH`).join('\n');
  const msg = `طلب جديد من SAMA CROCHET\n\nالاسم: ${name}\nالهاتف: ${phone}\nالعنوان: ${address}\n\nالمنتجات:\n${lines}\n\nالمجموع: ${cartTotal()} DH`;

  await apiCall('addOrder', { name, phone, address, items: cart, total: cartTotal(), date: new Date().toISOString() });

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  cart = [];
  saveCart();
  closeCart();
  toast('تصيفط الطلب ✅', 'success');
}

function sendContactMsg() {
  const name = document.getElementById('cName').value.trim();
  const msg = document.getElementById('cMsg').value.trim();
  if (!msg) { toast('كتبي رسالتك ❌', 'danger'); return; }
  const text = `رسالة من الموقع\nالاسم: ${name || 'غير محدد'}\n\n${msg}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, '_blank');
}

/* ---------- Admin: auth ---------- */
async function adminLogin() {
  const pass = document.getElementById('adminPass').value;
  const data = await apiCallPlain('checkLogin', pass);
  if (data && data.status === 'ok') {
    adminPassword = pass;
    document.getElementById('adminLogin').style.display = 'none';
    document.getElementById('adminPanel').classList.add('show');
    loadAdminData();
  } else {
    toast('كلمة السر خاطئة ❌', 'danger');
    document.getElementById('adminPass').value = '';
  }
}
async function apiCallPlain(action, password) {
  try {
    const res = await fetch(SHEET_API + `?action=${action}&password=${encodeURIComponent(password)}`);
    return await res.json();
  } catch (e) { toast('مشكل فالاتصال ❌', 'danger'); return null; }
}
function adminLogout() {
  adminPassword = '';
  document.getElementById('adminLogin').style.display = 'block';
  document.getElementById('adminPanel').classList.remove('show');
  showPage('home');
}

/* ---------- Admin: navigation ---------- */
function showAdminSection(id) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + id).classList.add('active');
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.sec === id));
}

/* ---------- Admin: data ---------- */
async function loadAdminData() {
  await loadProductsFromCloud();
  renderAdminProducts();
  renderAdminStock();
  document.getElementById('statProducts').textContent = products.length;
  document.getElementById('statLowStock').textContent = products.filter(p => p.stock < 5).length;
  loadOrders();
}

function renderAdminProducts() {
  const tbody = document.getElementById('adminProductsTable');
  tbody.innerHTML = '';
  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><img src="${p.img || 'icon-192.png'}" style="width:44px;height:44px;border-radius:8px;object-fit:cover"></td>
      <td>${p.name}</td>
      <td>${CAT_LABELS[p.cat] || p.cat}</td>
      <td>${p.price} DH</td>
      <td class="${p.stock < 5 ? 'low-stock' : ''}">${p.stock}</td>
      <td class="row-actions">
        <button class="mini-btn edit" onclick="editProduct('${p.id}')">تعديل</button>
        <button class="mini-btn del" onclick="deleteProduct('${p.id}')">حذف</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

function renderAdminStock() {
  const tbody = document.getElementById('adminStockTable');
  tbody.innerHTML = '';
  products.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td><td class="${p.stock < 5 ? 'low-stock' : ''}">${p.stock}</td>
      <td>${p.stock <= 0 ? 'نفدت' : (p.stock < 5 ? 'منخفض' : 'متوفر')}</td>`;
    tbody.appendChild(tr);
  });
}

async function loadOrders() {
  // getOrders ماشي action محمية فالسيرفر، فكنديرو GET مباشرة بلا كلمة سر
  let orders = [];
  try {
    const res = await fetch(SHEET_API + '?action=getOrders');
    const d = await res.json();
    orders = Array.isArray(d) ? d : (d.orders || []);
  } catch (e) {}
  document.getElementById('statOrders').textContent = orders.length;
  const tbody = document.getElementById('adminOrdersTable');
  tbody.innerHTML = '';
  orders.slice().reverse().forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${(o.date || '').slice(0, 10)}</td><td>${o.name}</td><td>${o.phone}</td><td>${o.address}</td><td>${o.total} DH</td>`;
    tbody.appendChild(tr);
  });
}

/* ---------- Admin: product CRUD ---------- */
function editProduct(id) {
  const p = products.find(x => String(x.id) === String(id));
  if (!p) return;
  document.getElementById('pId').value = p.id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pDesc').value = p.desc || '';
  document.getElementById('pCat').value = p.cat;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pOldPrice').value = p.oldPrice || '';
  document.getElementById('pStock').value = p.stock;
  document.getElementById('pImg').value = p.img || '';
  document.getElementById('addFormTitle').textContent = 'تعديل منتج';
  showAdminSection('add');
}

async function saveProduct() {
  const id = document.getElementById('pId').value;
  const payload = {
    id: id || 'p_' + Date.now(),
    name: document.getElementById('pName').value.trim(),
    desc: document.getElementById('pDesc').value.trim(),
    cat: document.getElementById('pCat').value,
    price: Number(document.getElementById('pPrice').value) || 0,
    oldPrice: Number(document.getElementById('pOldPrice').value) || 0,
    stock: Number(document.getElementById('pStock').value) || 0,
    img: document.getElementById('pImg').value.trim()
  };
  if (!payload.name || !payload.price) { toast('عمري الاسم والسعر ❌', 'danger'); return; }
  const action = id ? 'updateProduct' : 'addProduct';
  const res = await apiCall(action, payload);
  if (res && res.status !== 'error') {
    toast('تحفظ المنتج ✅', 'success');
    document.getElementById('pId').value = '';
    ['pName', 'pDesc', 'pPrice', 'pOldPrice', 'pStock', 'pImg'].forEach(f => document.getElementById(f).value = '');
    document.getElementById('addFormTitle').textContent = 'إضافة منتج جديد';
    loadAdminData();
    showAdminSection('products');
  }
}

async function deleteProduct(id) {
  if (!confirm('متأكدة بغيتي تحذفي هاد المنتج؟')) return;
  const res = await apiCall('deleteProduct', { id });
  if (res && res.status !== 'error') { toast('تحذف المنتج ✅', 'success'); loadAdminData(); }
}

/* ---------- Toast ---------- */
function toast(msg, type = '') {
  const box = document.getElementById('toastBox');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(() => t.remove(), 3200);
}

/* ---------- Decorative thread canvas ---------- */
function initThreadAnimation() {
  const canvas = document.getElementById('threadCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, threads = [];

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  function Thread() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.r = 20 + Math.random() * 40;
    this.speed = 0.15 + Math.random() * 0.3;
    this.angle = Math.random() * Math.PI * 2;
  }
  Thread.prototype.update = function () {
    this.angle += this.speed * 0.01;
    this.y -= this.speed;
    if (this.y < -this.r) { this.y = h + this.r; this.x = Math.random() * w; }
  };
  Thread.prototype.draw = function () {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,119,204,0.25)';
    ctx.lineWidth = 2;
    ctx.arc(this.x, this.y, this.r, this.angle, this.angle + Math.PI * 1.5);
    ctx.stroke();
  };

  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 14; i++) threads.push(new Thread());

  function loop() {
    ctx.clearRect(0, 0, w, h);
    threads.forEach(t => { t.update(); t.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
}

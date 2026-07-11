// ══════════════════════════════
//  CANVAS WOOL ANIMATION
// ══════════════════════════════
(function(){
  const canvas=document.getElementById('bgCanvas');
  const ctx=canvas.getContext('2d');
  let W,H,threads=[];
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  function Thread(){
    this.x=Math.random()*W;this.y=Math.random()*H;
    this.vx=(Math.random()-0.5)*0.6;this.vy=(Math.random()-0.5)*0.6;
    this.len=Math.random()*80+40;this.angle=Math.random()*Math.PI*2;
    this.va=(Math.random()-0.5)*0.015;
    this.color=['#0077cc','#38bdf8','#005fa3','#60a5fa'][Math.floor(Math.random()*4)];
    this.alpha=Math.random()*0.3+0.1;this.width=Math.random()*1.5+0.5;
  }
  Thread.prototype.draw=function(){
    ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.angle);
    ctx.beginPath();ctx.moveTo(-this.len/2,0);
    ctx.bezierCurveTo(-this.len/4,-12,this.len/4,12,this.len/2,0);
    ctx.strokeStyle=this.color;ctx.globalAlpha=this.alpha;
    ctx.lineWidth=this.width;ctx.lineCap='round';ctx.stroke();ctx.restore();
    this.x+=this.vx;this.y+=this.vy;this.angle+=this.va;
    if(this.x<-100)this.x=W+100;if(this.x>W+100)this.x=-100;
    if(this.y<-100)this.y=H+100;if(this.y>H+100)this.y=-100;
  };
  for(let i=0;i<35;i++)threads.push(new Thread());
  function loop(){ctx.clearRect(0,0,W,H);threads.forEach(t=>t.draw());requestAnimationFrame(loop);}
  loop();
})();

// ══════════════════════════════
//  BACKEND CONFIG (خاصك تبدل هاد الرابط برابط الـ Apps Script ديالك)
// ══════════════════════════════
const SHEET_API = "https://script.google.com/macros/s/AKfycbw29vMBsvGs21Eistfe6tx3PUCt1l_huTmTHvXb8Djd5mB0iv40YKeap-tQgYEy2GbSYg/exec";
const WHATSAPP_NUMBER = "212621091399";

let useCloud = false;
let adminPassword = ''; // كتتخزن مؤقتاً فالمتصفح بعد الدخول الصحيح، ماكاينش مكتوبة فالكود

// ══ تحميل المنتجات من Google Sheets ══
async function loadProductsFromCloud() {
  try {
    const res = await fetch(SHEET_API + '?action=getProducts');
    const data = await res.json();
    if (data.status === 'ok' && data.products && data.products.length > 0) {
      products = data.products.map(p => ({
        ...p,
        id:       Number(p.id),
        price:    Number(p.price)    || 0,
        oldPrice: Number(p.oldPrice) || 0,
        stock:    Number(p.stock)    || 0,
      }));
      useCloud = true;
      saveProducts();
    }
  } catch(e) { console.log('Cloud unavailable, using local data'); }
  renderFeatured();
  renderProducts();
}

// ══ حفظ طلب جديد فـ Google Sheets (addOrder مدعومة عبر GET فالباك اند) ══
async function saveOrderToSheet(order) {
  orders.unshift(order);
  saveOrders();
  try {
    const itemsText = order.items.map(i => i.name + ' x' + i.qty + ' = ' + (i.price*i.qty) + 'dh').join(' | ');
    const url = SHEET_API +
      '?action=addOrder' +
      '&name='    + encodeURIComponent(order.name) +
      '&phone='   + encodeURIComponent(order.phone) +
      '&city='    + encodeURIComponent(order.city) +
      '&address=' + encodeURIComponent(order.address || '') +
      '&notes='   + encodeURIComponent(order.notes || '') +
      '&items='   + encodeURIComponent(itemsText) +
      '&total='   + order.total +
      '&date='    + encodeURIComponent(order.date);
    await fetch(url, {method:'GET', mode:'no-cors'});
  } catch(e) { console.log('Orders sheet error', e); }
}

async function loadOrdersFromSheet() {
  try {
    const emptyEl = document.getElementById('ordersEmpty');
    emptyEl.style.display = 'block';
    emptyEl.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size:2rem;margin-bottom:12px;display:block;opacity:0.6;color:var(--blue-main);"></i>جاري تحميل الطلبات...';
    document.getElementById('ordersTableWrap').style.display = 'none';

    const res = await fetch(SHEET_API + '?action=getOrders');
    const data = await res.json();
    if (data.status === 'ok' && data.orders && data.orders.length > 0) {
      renderOrdersTable(data.orders);
    } else {
      emptyEl.innerHTML = '<i class="fas fa-inbox" style="font-size:3rem;opacity:0.3;margin-bottom:12px;display:block;"></i>لا توجد طلبات بعد';
    }
  } catch(e) {
    if (orders.length) renderOrdersTable(orders);
    else document.getElementById('ordersEmpty').innerHTML =
      '<i class="fas fa-inbox" style="font-size:3rem;opacity:0.3;margin-bottom:12px;display:block;"></i>لا توجد طلبات بعد';
  }
}

function renderOrdersTable(list) {
  if (!list.length) {
    document.getElementById('ordersEmpty').style.display = 'block';
    document.getElementById('ordersTableWrap').style.display = 'none';
    return;
  }
  document.getElementById('ordersEmpty').style.display = 'none';
  document.getElementById('ordersTableWrap').style.display = 'block';
  const tb = document.getElementById('ordersTable');
  tb.innerHTML = list.map((o, i) => {
    const items = typeof o.items === 'string' ? o.items : o.items.map(it => it.name + 'x' + it.qty).join(', ');
    return '<tr>' +
      '<td>#' + (list.length - i) + '</td>' +
      '<td>' + (o.name  || '') + '</td>' +
      '<td>' + (o.phone || '') + '</td>' +
      '<td>' + (o.city  || '') + '</td>' +
      '<td style="font-size:0.8rem;">' + items + '</td>' +
      '<td><strong>' + (o.total || '') + ' درهم</strong></td>' +
      '<td>' + (o.date  || '') + '</td>' +
    '</tr>';
  }).join('');
}

// ══ عمليات المنتجات المحمية بكلمة السر (addProduct / updateProduct / deleteProduct) ══
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
    console.log('API error', e);
    return { status: 'error', message: 'network' };
  }
}

// ══════════════════════════════
//  منتجاتك الأصلية (43 منتج) — نسخة احتياطية محلية
//  الصور خاصها تكون فمجلد images/ بجانب index.html: images/1.jpg ... images/43.jpg
// ══════════════════════════════
let products = JSON.parse(localStorage.getItem('sama_products')) || [
  {id:1,cat:'keychains',name:'Chicken with Flowers',desc:'كتكوت لطيف مع ورود كروشيه ♡',price:46,oldPrice:0,stock:10,img:'images/1.jpg'},
  {id:2,cat:'keychains',name:'Strawberry Keychain',desc:'سلسلة مفاتيح فراولة لطيفة ♡',price:48,oldPrice:60,stock:8,img:'images/2.jpg'},
  {id:3,cat:'keychains',name:'Romantic Fllouss',desc:'كتكوت ضريف يحمل قلب أحمر',price:62,oldPrice:0,stock:5,img:'images/3.jpg'},
  {id:4,cat:'keychains',name:'Tomato Keychain',desc:'سلسلة مفاتيح طماطم مضحكة ♡',price:56,oldPrice:0,stock:12,img:'images/4.jpg'},
  {id:5,cat:'keychains',name:'Nishinoya Volleyball',desc:'نيشينويا مع الكرة الطائرة - Haikyuu ♡',price:57,oldPrice:0,stock:3,img:'images/5.jpg'},
  {id:6,cat:'keychains',name:'Hinata Volleyball',desc:'هيناتا مع الكرة الطائرة - Haikyuu ♡',price:57,oldPrice:0,stock:4,img:'images/6.jpg'},
  {id:7,cat:'keychains',name:'Kaito Kid Keychain',desc:'كايتو كيد - شخصية لطيفة ♡',price:44,oldPrice:0,stock:7,img:'images/7.jpg'},
  {id:8,cat:'accessories',name:'Mikasa Scarf & Gloves',desc:'طقم وشاح وقفازات ميكاسا',price:289,oldPrice:350,stock:2,img:'images/8.jpg'},
  {id:9,cat:'accessories',name:'Crochet Gloves',desc:'قفازات كروشيه دافئة ♡',price:78,oldPrice:0,stock:6,img:'images/9.jpg'},
  {id:10,cat:'flowers',name:'Single Tulip',desc:'زهرة توليب واحدة جميلة ♡',price:25,oldPrice:0,stock:15,img:'images/10.jpg'},
  {id:11,cat:'dolls',name:'Graduation Girl Doll',desc:'فتاة تخرج بدفتر وطاقية',price:63,oldPrice:0,stock:4,img:'images/11.jpg'},
  {id:12,cat:'keychains',name:'Mini Scarf Keychain',desc:'سلسلة مفاتيح وشاح صغير ♡',price:28,oldPrice:0,stock:20,img:'images/12.jpg'},
  {id:13,cat:'dolls',name:'Sunflower Girl Doll',desc:'فتاة مع دوار الشمس ♡',price:70,oldPrice:0,stock:3,img:'images/13.jpg'},
  {id:14,cat:'flowers',name:'Single Carnation',desc:'زهرة قرنفل واحدة أنيقة ♡',price:60,oldPrice:0,stock:9,img:'images/14.jpg'},
  {id:15,cat:'flowers',name:'Bouquet of 4 Carnations',desc:'باقة من ٤ ورود قرنفل ♡',price:230,oldPrice:280,stock:2,img:'images/15.jpg'},
  {id:16,cat:'flowers',name:'Sunflower',desc:'دوار شمس كبير مشرق ♡',price:70,oldPrice:0,stock:5,img:'images/16.jpg'},
  {id:17,cat:'accessories',name:'Mirror Flower Crochet',desc:'مرآة الزهور كروشيه ♡',price:119,oldPrice:0,stock:3,img:'images/17.jpg'},
  {id:18,cat:'keychains',name:'Mushroom Keychain',desc:'سلسلة مفاتيح فطر لطيف ♡',price:44,oldPrice:0,stock:11,img:'images/18.jpg'},
  {id:19,cat:'keychains',name:'Octopus Keychain',desc:'سلسلة مفاتيح أخطبوط لطيف ♡',price:50,oldPrice:0,stock:8,img:'images/19.jpg'},
  {id:20,cat:'flowers',name:'Bouquet of Lily Flowers',desc:'زهرة زنبق أنيقة ♡',price:146,oldPrice:180,stock:2,img:'images/20.jpg'},
  {id:21,cat:'flowers',name:'Rose Flower',desc:'وردة كروشيه رومانسية ♡',price:62,oldPrice:0,stock:7,img:'images/21.jpg'},
  {id:22,cat:'dolls',name:'Large Handmade Doll',desc:'دمية كروشيه كبيرة وجميلة ♡',price:370,oldPrice:420,stock:1,img:'images/22.jpg'},
  {id:23,cat:'dolls',name:'Ramadan Character Doll',desc:'شخصية رمضان مع فانوس ♡',price:325,oldPrice:0,stock:2,img:'images/23.jpg'},
  {id:24,cat:'dolls',name:'Mini Pig Doll',desc:'خنزير صغير كروشيه لطيف ♡',price:85,oldPrice:0,stock:5,img:'images/24.jpg'},
  {id:25,cat:'keychains',name:'Teddy Bear Keychain',desc:'دبدوب صغير سلسلة مفاتيح ♡',price:45,oldPrice:0,stock:14,img:'images/25.jpg'},
  {id:26,cat:'keychains',name:'Romantic Fllouss 2',desc:'سلسلة مفاتيح كتكوت يحمل وردة ♡',price:65,oldPrice:0,stock:6,img:'images/26.jpg'},
  {id:27,cat:'keychains',name:'Little Fllouss',desc:'سلسلة مفاتيح ورود صغيرة لطيفة ♡',price:40,oldPrice:0,stock:10,img:'images/27.jpg'},
  {id:28,cat:'dolls',name:'Batman Doll',desc:'دمية باتمان كروشيه مميزة',price:129,oldPrice:0,stock:3,img:'images/28.jpg'},
  {id:29,cat:'keychains',name:'Mini Flowers',desc:'سلسلة مفاتيح ورود صغيرة جداً ♡',price:25,oldPrice:0,stock:18,img:'images/29.jpg'},
  {id:30,cat:'keychains',name:'Chicken Bo3o',desc:'دجاجة بوعو لطيفة سلسلة مفاتيح ♡',price:59,oldPrice:0,stock:7,img:'images/30.jpg'},
  {id:31,cat:'flowers',name:'Flowers Box',desc:'صندوق ورود كروشيه جميل ♡',price:79,oldPrice:0,stock:4,img:'images/31.jpg'},
  {id:32,cat:'keychains',name:'Little Bear',desc:'دب صغير سلسلة مفاتيح لطيف ♡',price:45,oldPrice:0,stock:9,img:'images/32.jpg'},
  {id:33,cat:'accessories',name:'Book Marker',desc:'علامة كتاب كروشيه مميزة ♡',price:25,oldPrice:0,stock:20,img:'images/33.jpg'},
  {id:34,cat:'accessories',name:'Gold Earrings',desc:'أقراط ذهبية كروشيه ♡',price:43,oldPrice:0,stock:6,img:'images/34.jpg'},
  {id:35,cat:'accessories',name:'Flower Earrings',desc:'أقراط الورود كروشيه ♡',price:45,oldPrice:0,stock:8,img:'images/35.jpg'},
  {id:36,cat:'keychains',name:'Naruto Keychain',desc:'ناروتو من انمي ناروتو ♡',price:40,oldPrice:0,stock:10,img:'images/36.jpg'},
  {id:37,cat:'keychains',name:'Gojo Satoru Keychain',desc:'جوجو من انمي جوجتسو كايسن ♡',price:45,oldPrice:0,stock:7,img:'images/37.jpg'},
  {id:38,cat:'accessories',name:'Strawberry Earrings',desc:'أقراط فراولة كروشيه ♡',price:43,oldPrice:0,stock:5,img:'images/38.jpg'},
  {id:39,cat:'keychains',name:'Panda',desc:'باندا كروشيه لطيف ♡',price:40,oldPrice:0,stock:11,img:'images/39.jpg'},
  {id:40,cat:'keychains',name:'Spider-Man',desc:'سلسلة مفاتيح للرجل العنكبوت ♡',price:50,oldPrice:0,stock:8,img:'images/40.jpg'},
  {id:41,cat:'flowers',name:'Bouquet Flowers',desc:'ورود كروشيه جميلة ♡',price:279,oldPrice:320,stock:2,img:'images/41.jpg'},
  {id:42,cat:'keychains',name:'Kout-kout Twin',desc:'توأم كتاكيت لطيف بقبعة وردية ♡',price:42,oldPrice:0,stock:6,img:'images/42.jpg'},
  {id:43,cat:'accessories',name:'Rose Flower Earrings',desc:'أقراط ورود حمراء كروشيه ♡',price:45,oldPrice:0,stock:5,img:'images/43.jpg'}
];

let cart = JSON.parse(localStorage.getItem('sama_cart')) || [];
let orders = JSON.parse(localStorage.getItem('sama_orders')) || [];
let currentFilter = 'all';
let currentProductId = null;

const CAT_LABELS = {keychains:'سلاسل مفاتيح',dolls:'دمى',flowers:'ورود',accessories:'إكسسوارات'};
const CAT_ICONS  = {keychains:'🔑',dolls:'🪆',flowers:'🌸',accessories:'✨'};

function saveProducts(){localStorage.setItem('sama_products',JSON.stringify(products));}
function saveCart(){localStorage.setItem('sama_cart',JSON.stringify(cart));}
function saveOrders(){localStorage.setItem('sama_orders',JSON.stringify(orders));}

// ══════════════════════════════
//  PAGES
// ══════════════════════════════
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  const navMap={home:0,products:1,contact:2};
  const navBtns=document.querySelectorAll('.nav-link');
  if(navMap[id]!==undefined) navBtns[navMap[id]].classList.add('active');
  setActivebnav(id);
  window.scrollTo({top:0,behavior:'smooth'});
  if(id==='products') renderProducts();
  if(id==='home') renderFeatured();
}

// ══════════════════════════════
//  PRODUCT RENDERING
// ══════════════════════════════
function productImg(p,h){
  if(p.img){
    return `<img src="${p.img}" alt="${p.name}" style="width:100%;height:${h}px;object-fit:cover;" onerror="this.parentElement.innerHTML=phHTML('${p.cat}','${h}')">`;
  }
  return phHTML(p.cat,h);
}
function phHTML(cat,h){
  const icon = CAT_ICONS[cat]||'🧶';
  return `<div class="img-ph" style="height:${h}px;"><div style="font-size:3rem;">${icon}</div><span>${CAT_LABELS[cat]||cat}</span></div>`;
}

function stockLabel(s){
  if(s===0) return '<span class="stock-badge out">نفد المخزون</span>';
  if(s<5)   return `<span class="stock-badge low">متبقي ${s}</span>`;
  return '<span class="stock-badge">متوفر ✓</span>';
}

function createCard(p){
  const hasSale = p.oldPrice && p.oldPrice > p.price;
  const outOfStock = p.stock===0;
  const div=document.createElement('div');
  div.className='product-card';
  div.innerHTML=`
    <div class="card-img-wrap" onclick="openModal(${p.id})">
      ${productImg(p,240)}
      ${hasSale?'<div class="card-badge sale">تخفيض</div>':''}
      <div class="quick-view-btn"><span><i class="fas fa-eye" style="margin-left:6px;"></i>عرض سريع</span></div>
    </div>
    <div class="card-body">
      <div class="card-cat">${CAT_ICONS[p.cat]||'🧶'} ${CAT_LABELS[p.cat]||p.cat}</div>
      <h3>${p.name}</h3>
      <p>${p.desc}</p>
      <div class="card-price-row">
        <span class="price-now">${p.price} درهم</span>
        ${hasSale?`<span class="price-old">${p.oldPrice} درهم</span>`:''}
        ${stockLabel(p.stock)}
      </div>
      <button class="add-btn" onclick="addToCart(${p.id})" ${outOfStock?'disabled':''}>
        ${outOfStock?'نفد المخزون':'أضف إلى السلة ♡'}
      </button>
    </div>
  `;
  return div;
}

function renderProducts(){
  const grid=document.getElementById('productsGrid');
  const q=(document.getElementById('searchInput')||{}).value||'';
  let list=products.filter(p=>{
    const catOk=currentFilter==='all'||p.cat===currentFilter;
    const qOk=!q||p.name.toLowerCase().includes(q.toLowerCase())||p.desc.includes(q);
    return catOk&&qOk;
  });
  grid.innerHTML='';
  list.forEach((p,i)=>{
    const card=createCard(p);
    card.style.animationDelay=(i*0.05)+'s';
    grid.appendChild(card);
  });
  if(!list.length){
    grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-light);"><i class="fas fa-search" style="font-size:3rem;margin-bottom:12px;display:block;opacity:0.3;"></i>لا توجد منتجات مطابقة</div>';
  }
}

function renderFeatured(){
  const grid=document.getElementById('featuredGrid');
  const featured=products.slice(-8).reverse();
  grid.innerHTML='';
  featured.forEach((p,i)=>{
    const card=createCard(p);
    card.style.animationDelay=(i*0.06)+'s';
    grid.appendChild(card);
  });
}

function setFilter(btn){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentFilter=btn.dataset.cat;
  renderProducts();
}
function applyFilters(){renderProducts();}

// ══════════════════════════════
//  MODAL
// ══════════════════════════════
function openModal(id){
  const p=products.find(x=>x.id===id);
  if(!p)return;
  currentProductId=id;
  const imgWrap=document.getElementById('modalImgWrap');
  imgWrap.innerHTML=productImg(p,280);
  document.getElementById('modalCat').textContent=(CAT_ICONS[p.cat]||'🧶')+' '+(CAT_LABELS[p.cat]||p.cat);
  document.getElementById('modalName').textContent=p.name;
  document.getElementById('modalDesc').textContent=p.desc;
  document.getElementById('modalPrice').textContent=p.price;
  const oldEl=document.getElementById('modalOld');
  oldEl.textContent=p.oldPrice&&p.oldPrice>p.price?p.oldPrice+' درهم':'';
  const addBtn=document.getElementById('modalAddBtn');
  addBtn.disabled=p.stock===0;
  addBtn.textContent=p.stock===0?'نفد المخزون':'أضف إلى السلة ♡';
  document.getElementById('productModal').classList.add('show');
}
function modalAddToCart(){ addToCart(currentProductId); closeModal('productModal'); }
function closeModal(id){document.getElementById(id).classList.remove('show');}

// ══════════════════════════════
//  CART
// ══════════════════════════════
function addToCart(id){
  const p=products.find(x=>x.id===id);
  if(!p||p.stock===0){toast('نفد المخزون ❌','danger');return;}
  const ex=cart.find(x=>x.id===id);
  if(ex){ex.qty++;} else{cart.push({id:p.id,name:p.name,price:p.price,img:p.img,cat:p.cat,qty:1});}
  saveCart();updateBadge();
  toast(`تم إضافة "${p.name}" ♡`,'');
}

function cartTotal(){return cart.reduce((s,i)=>s+i.price*i.qty,0);}

function setActivebnav(page){
  document.querySelectorAll('.bnav-btn').forEach(b=>b.classList.remove('active'));
  const el=document.getElementById('bnav-'+page);
  if(el) el.classList.add('active');
}

function updateBadge(){
  const n=cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartBadge').textContent=n;
  document.getElementById('fabBadge').textContent=n;
  const bb=document.getElementById('bnavBadge');
  if(bb){ bb.textContent=n; bb.style.display=n>0?'flex':'none'; }
}

function openCart(){
  renderCart();
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('overlay').classList.add('show');
}
function closeCart(){
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

function renderCart(){
  const el=document.getElementById('cartItems');
  document.getElementById('cartTotal').textContent=cartTotal();
  if(!cart.length){
    el.innerHTML='<div class="cart-empty"><i class="fas fa-shopping-cart"></i>السلة فارغة حالياً ♡</div>';
    return;
  }
  el.innerHTML='';
  cart.forEach((item,i)=>{
    const div=document.createElement('div');
    div.className='cart-item';
    div.innerHTML=`
      ${item.img?`<img src="${item.img}" alt="${item.name}">`:`<div style="width:72px;height:72px;border-radius:12px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;">${CAT_ICONS[item.cat]||'🧶'}</div>`}
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${item.price*item.qty} درهم</div>
        <div class="qty-row">
          <button class="qty-btn" onclick="changeQty(${i},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty(${i},1)">+</button>
          <button class="del-btn" onclick="removeFromCart(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>
    `;
    el.appendChild(div);
  });
}

function changeQty(i,d){
  cart[i].qty+=d;
  if(cart[i].qty<=0)cart.splice(i,1);
  saveCart();updateBadge();renderCart();
}
function removeFromCart(i){ cart.splice(i,1);saveCart();updateBadge();renderCart(); }

// ══════════════════════════════
//  CHECKOUT
// ══════════════════════════════
function openCheckout(){
  if(!cart.length){toast('السلة فارغة ♡','danger');return;}
  closeCart();
  document.getElementById('checkoutModal').classList.add('show');
}

function sendOrder(){
  const name=document.getElementById('ordName').value.trim();
  const phone=document.getElementById('ordPhone').value.trim();
  const city=document.getElementById('ordCity').value.trim();
  const addr=document.getElementById('ordAddr').value.trim();
  const notes=document.getElementById('ordNotes').value.trim();
  if(!name||!phone||!city||!addr){toast('يرجى ملء جميع الحقول المطلوبة ♡','danger');return;}

  let msg=`🌸 *طلب جديد - SAMA CROCHET* 🌸\n\n`;
  msg+=`👤 *الاسم:* ${name}\n📞 *الهاتف:* ${phone}\n🏙️ *المدينة:* ${city}\n📍 *العنوان:*\n${addr}\n`;
  if(notes) msg+=`📝 *ملاحظات:* ${notes}\n`;
  msg+=`\n🛍️ *المنتجات:*\n`;
  cart.forEach(it=>{ msg+=`• ${it.name} × ${it.qty} = ${it.price*it.qty} درهم\n`; });
  msg+=`\n💰 *الإجمالي: ${cartTotal()} درهم*\n\nشكراً لثقتك بـ SAMA CROCHET ♡`;

  const order={
    id:Date.now(), name, phone, city,
    address: addr, notes,
    items:[...cart], total:cartTotal(),
    date:new Date().toLocaleDateString('ar-MA')
  };
  saveOrderToSheet(order);

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`,'_blank');
  cart=[];saveCart();updateBadge();
  closeModal('checkoutModal');
  toast('تم إرسال طلبك ✓','success');
}

function sendContactMsg(){
  const name=document.getElementById('ctName').value.trim();
  const phone=document.getElementById('ctPhone').value.trim();
  const msg=document.getElementById('ctMsg').value.trim();
  if(!name||!msg){toast('يرجى كتابة اسمك ورسالتك','danger');return;}
  let txt=`مرحبا، أنا *${name}*`;
  if(phone)txt+=` (${phone})`;
  txt+=`\n\n${msg}\n\n— من موقع SAMA CROCHET ♡`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(txt)}`,'_blank');
  toast('تم فتح واتساب ♡','success');
}

// ══════════════════════════════
//  ADMIN — تسجيل الدخول عبر السيرفر (checkLogin) بدل المقارنة المحلية
// ══════════════════════════════
async function adminLogin(){
  const pass=document.getElementById('adminPass').value;
  try {
    const res = await fetch(SHEET_API + '?action=checkLogin&password=' + encodeURIComponent(pass));
    const data = await res.json();
    if(data.status === 'ok'){
      adminPassword = pass;
      document.getElementById('adminLogin').style.display='none';
      document.getElementById('adminPanel').classList.add('show');
      loadAdminData();
    } else {
      toast('كلمة السر خاطئة ❌','danger');
      document.getElementById('adminPass').value='';
    }
  } catch(e) {
    toast('مشكل فالاتصال، حاولي مرة أخرى ❌','danger');
  }
}

function adminLogout(){
  adminPassword = '';
  document.getElementById('adminPanel').classList.remove('show');
  document.getElementById('adminLogin').style.display='flex';
  document.getElementById('adminPass').value='';
  showPage('home');
}

function adminTab(name,btn){
  document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.admin-section').forEach(s=>s.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('sec-'+name).classList.add('active');
  if(name==='overview') loadOverview();
  if(name==='products') loadProductsTable();
  if(name==='orders') loadOrders();
  if(name==='stock') loadStock();
}

function loadAdminData(){loadOverview();}

function loadOverview(){
  document.getElementById('st-total').textContent=products.length;
  document.getElementById('st-instock').textContent=products.filter(p=>p.stock>0).length;
  document.getElementById('st-low').textContent=products.filter(p=>p.stock>0&&p.stock<5).length;
  document.getElementById('st-orders').textContent=orders.length;
  const tb=document.getElementById('overviewTable');
  tb.innerHTML=products.map(p=>`
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${CAT_LABELS[p.cat]||p.cat}</td>
      <td>${p.price} درهم</td>
      <td>${p.stock}</td>
      <td>${stockLabel(p.stock)}</td>
    </tr>
  `).join('');
}

function loadProductsTable(){
  const tb=document.getElementById('productsTable');
  tb.innerHTML=products.map(p=>`
    <tr>
      <td>${p.img?`<img src="${p.img}" style="width:50px;height:50px;border-radius:8px;object-fit:cover;" onerror="this.style.display='none'">`:`<div style="width:50px;height:50px;border-radius:8px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;font-size:1.5rem;">${CAT_ICONS[p.cat]||'🧶'}</div>`}</td>
      <td><strong>${p.name}</strong></td>
      <td>${CAT_LABELS[p.cat]||p.cat}</td>
      <td>${p.price} درهم</td>
      <td>${p.stock}</td>
      <td>
        <button class="action-btn edit-btn" onclick="openEdit(${p.id})">✏️ تعديل</button>
        <button class="action-btn del-action-btn" onclick="deleteProductAdmin(${p.id})">🗑️ حذف</button>
      </td>
    </tr>
  `).join('');
}

function openEdit(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  document.getElementById('editId').value=p.id;
  document.getElementById('editName').value=p.name;
  document.getElementById('editCat').value=p.cat;
  document.getElementById('editPrice').value=p.price;
  document.getElementById('editOldPrice').value=p.oldPrice||'';
  document.getElementById('editStock').value=p.stock;
  document.getElementById('editDesc').value=p.desc;
  document.getElementById('editImgUrl').value=p.img||'';
  document.getElementById('editModal').classList.add('show');
}

async function saveEdit(){
  const id=parseInt(document.getElementById('editId').value);
  const p=products.find(x=>x.id===id);if(!p)return;
  p.name=document.getElementById('editName').value.trim();
  p.cat=document.getElementById('editCat').value;
  p.price=parseFloat(document.getElementById('editPrice').value)||p.price;
  p.oldPrice=parseFloat(document.getElementById('editOldPrice').value)||0;
  p.stock=parseInt(document.getElementById('editStock').value)||0;
  p.desc=document.getElementById('editDesc').value.trim();
  p.img=document.getElementById('editImgUrl').value.trim();
  saveProducts();
  const res = await apiCall('updateProduct', p);
  if (res && res.status !== 'error') {
    closeModal('editModal');loadProductsTable();
    toast('تم حفظ التعديلات ✓','success');
  }
}

async function deleteProductAdmin(id){
  if(!confirm('هل تريدين حذف هذا المنتج نهائياً؟'))return;
  const res = await apiCall('deleteProduct', {id});
  if (res && res.status !== 'error') {
    products=products.filter(p=>p.id!==id);
    saveProducts();
    loadProductsTable();loadOverview();
    toast('تم الحذف ✓','danger');
  }
}

function loadOrders(){
  if (orders.length) renderOrdersTable(orders);
  loadOrdersFromSheet();
}

function loadStock(){
  const tb=document.getElementById('stockTable');
  tb.innerHTML=products.map(p=>`
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${CAT_LABELS[p.cat]||p.cat}</td>
      <td>${stockLabel(p.stock)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px;">
          <button class="qty-btn" onclick="updateStock(${p.id},-1)">−</button>
          <span style="min-width:30px;text-align:center;font-weight:700;">${p.stock}</span>
          <button class="qty-btn" onclick="updateStock(${p.id},1)">+</button>
        </div>
      </td>
    </tr>
  `).join('');
}

async function updateStock(id,d){
  const p=products.find(x=>x.id===id);if(!p)return;
  p.stock=Math.max(0,p.stock+d);
  saveProducts();loadStock();loadOverview();
  await apiCall('updateProduct', p);
}

// ══════════════════════════════
//  ADD PRODUCT
// ══════════════════════════════
function changeAddQty(d){
  const el=document.getElementById('addStock');
  el.value=Math.max(0,parseInt(el.value||0)+d);
}

async function saveNewProduct(){
  const name=document.getElementById('addName').value.trim();
  const cat=document.getElementById('addCat').value;
  const price=parseFloat(document.getElementById('addPrice').value);
  const oldPrice=parseFloat(document.getElementById('addOldPrice').value)||0;
  const stock=parseInt(document.getElementById('addStock').value)||0;
  const desc=document.getElementById('addDesc').value.trim();
  const img=document.getElementById('addImgUrl').value.trim();
  if(!name||!price){toast('يرجى إدخال الاسم والسعر','danger');return;}
  const newP={ id:Date.now(), cat, name, desc, price, oldPrice, stock, img };
  const res = await apiCall('addProduct', newP);
  if (res && res.status !== 'error') {
    products.unshift(newP);saveProducts();
    toast('تم إضافة المنتج ✓','success');
    document.getElementById('addName').value='';
    document.getElementById('addPrice').value='';
    document.getElementById('addOldPrice').value='';
    document.getElementById('addStock').value='10';
    document.getElementById('addDesc').value='';
    document.getElementById('addImgUrl').value='';
    loadProductsTable();loadOverview();
  }
}

// ══════════════════════════════
//  TOAST
// ══════════════════════════════
function toast(msg,type){
  const c=document.getElementById('toastContainer');
  const t=document.createElement('div');
  t.className='toast'+(type?' '+type:'');
  t.textContent=msg;
  c.appendChild(t);
  setTimeout(()=>t.remove(),3000);
}

// ══════════════════════════════
//  SCROLL & MISC
// ══════════════════════════════
function scrollToTop(){window.scrollTo({top:0,behavior:'smooth'});}
window.addEventListener('scroll',()=>{
  const fab=document.getElementById('fabTop');
  fab.classList.toggle('show',window.scrollY>400);
});

// ══════════════════════════════
//  SECRET LONG PRESS ON LOGO (2 ثواني) — يفتح لوحة الأدمن
// ══════════════════════════════
(function(){
  const logo = document.getElementById('logoArea');
  let pressTimer = null;
  const DURATION = 2000;

  function startPress(){ pressTimer = setTimeout(()=>{ showPage('admin'); }, DURATION); }
  function cancelPress(){ if(pressTimer){ clearTimeout(pressTimer); pressTimer = null; } }

  logo.addEventListener('touchstart', startPress, {passive:true});
  logo.addEventListener('touchend',   cancelPress);
  logo.addEventListener('touchmove',  cancelPress);
  logo.addEventListener('mousedown',  startPress);
  logo.addEventListener('mouseup',    cancelPress);
  logo.addEventListener('mouseleave', cancelPress);
  logo.addEventListener('contextmenu', e => e.preventDefault());
})();

// ══ Init ══
loadProductsFromCloud();
updateBadge();

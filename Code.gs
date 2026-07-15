/***********************************************************
 *  SAMA CROCHET — Google Apps Script Backend (v5)
 *  متوافق 100% مع app.js
 *
 *  ▶ خطوات التشغيل (مرة وحدة):
 *  1) بدلي 'CHANGE_ME' بكلمة السر ديالك و 'your-email@example.com'
 *     بإيميلك جوا دالة setupConfig() تحت.
 *  2) من القائمة فوق فالمحرر، اختاري setupConfig ثم دوسي ▶️ Run.
 *  3) Deploy → New deployment → Web app
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  4) انسخي رابط الـ exec وحطيه فـ SHEET_API فـ app.js
 ***********************************************************/

const SS = SpreadsheetApp.getActiveSpreadsheet();

const PRODUCTS_SHEET_NAME = 'Products';
const ORDERS_SHEET_NAME   = 'Orders';
const LOGS_SHEET_NAME     = 'Logs';

// ══ ترتيب الأعمدة ══
const PRODUCT_HEADERS = ['id','cat','name','desc','price','oldPrice','stock','img','img2','img3'];
// itemsJSON و timestamp أعمدة داخلية للإحصائيات، ماكيتبانوش فالواجهة
const ORDER_HEADERS   = ['orderId','date','name','phone','city','address','items','total','notes','status','itemsJSON','timestamp'];
const LOG_HEADERS     = ['timestamp','action','details'];

const LOW_STOCK_THRESHOLD = 5;
// أقل مدة (بالدقائق) بين طلبين متطابقين (اسم/هاتف/مبلغ) — لمنع الطلبات المكررة/الوهمية
const DUPLICATE_WINDOW_MINUTES = 3;

// ══════════════════════════════
//  UTIL
// ══════════════════════════════
function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  let sheet = SS.getSheetByName(name);
  if (!sheet) {
    sheet = SS.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getAdminPassword() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
}

function getAdminEmail() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');
}

// ▶ خاصك تشغلي هاد الدالة مرة وحدة من المحرر (Run) باش تسجلي كلمة السر والإيميل
function setupConfig() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty('ADMIN_PASSWORD', 'CHANGE_ME');
  props.setProperty('ADMIN_EMAIL', 'your-email@example.com');
}

function logAction(action, details) {
  try {
    const sheet = getOrCreateSheet(LOGS_SHEET_NAME, LOG_HEADERS);
    sheet.appendRow([new Date(), action, JSON.stringify(details || {})]);
  } catch (e) {
    // الـ logs ماخصهاش توقف الوظيفة الرئيسية إيلا فشلات
  }
}

function generateOrderId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return 'SC-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyMMdd') + '-' + rand;
}

// ══════════════════════════════
//  doGet — الأكشنات المفتوحة (بلا باسورد)
//  getProducts / getOrders / addOrder / checkLogin
// ══════════════════════════════
function doGet(e) {
  try {
    const action = (e.parameter.action || '').trim();

    if (action === 'getProducts') return jsonOut(getProducts());
    if (action === 'getOrders')   return jsonOut(getOrders());
    if (action === 'checkLogin')  return jsonOut(checkLogin(e.parameter.password || ''));
    // addOrder دابا كيتدار عبر POST (JSON) باش يقدر يرجع رقم الطلب وحالة التحقق من المخزون

    return jsonOut({ status: 'error', message: 'unknown action' });
  } catch (err) {
    return jsonOut({ status: 'error', message: String(err) });
  }
}

// ══════════════════════════════
//  doPost
//  - addOrder: مفتوحة (الزبناء)، فيها تحقق من المخزون/السعر + حماية من التكرار
//  - addProduct / updateProduct / deleteProduct / updateOrderStatus / getStats: محمية بكلمة السر
// ══════════════════════════════
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = (body.action || '').trim();

    if (action === 'addOrder') return jsonOut(addOrder(body));

    const protectedActions = ['addProduct', 'updateProduct', 'deleteProduct', 'updateOrderStatus', 'getStats'];
    if (protectedActions.indexOf(action) !== -1) {
      const savedPass = getAdminPassword();
      if (!savedPass || body.password !== savedPass) {
        return jsonOut({ status: 'error', message: 'Unauthorized' });
      }
    }

    if (action === 'addProduct')        return jsonOut(addProduct(body));
    if (action === 'updateProduct')     return jsonOut(updateProduct(body));
    if (action === 'deleteProduct')     return jsonOut(deleteProduct(body));
    if (action === 'updateOrderStatus') return jsonOut(updateOrderStatus(body));
    if (action === 'getStats')          return jsonOut(getStats());

    return jsonOut({ status: 'error', message: 'unknown action' });
  } catch (err) {
    return jsonOut({ status: 'error', message: String(err) });
  }
}

// ══════════════════════════════
//  AUTH
// ══════════════════════════════
function checkLogin(password) {
  const savedPass = getAdminPassword();
  if (savedPass && password === savedPass) return { status: 'ok' };
  return { status: 'error', message: 'wrong password' };
}

// ══════════════════════════════
//  PRODUCTS
// ══════════════════════════════
function getProducts() {
  const sheet = getOrCreateSheet(PRODUCTS_SHEET_NAME, PRODUCT_HEADERS);
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).filter(r => r[0] !== '' && r[0] !== null);

  const products = rows.map(r => {
    const obj = {};
    PRODUCT_HEADERS.forEach((h, i) => { obj[h] = r[i]; });
    return obj;
  });

  return { status: 'ok', products: products };
}

function addProduct(body) {
  const sheet = getOrCreateSheet(PRODUCTS_SHEET_NAME, PRODUCT_HEADERS);
  const row = PRODUCT_HEADERS.map(h => (body[h] !== undefined ? body[h] : ''));
  sheet.appendRow(row);
  logAction('addProduct', { id: body.id, name: body.name });
  return { status: 'ok' };
}

function updateProduct(body) {
  const sheet = getOrCreateSheet(PRODUCTS_SHEET_NAME, PRODUCT_HEADERS);
  const data = sheet.getDataRange().getValues();
  const idCol = PRODUCT_HEADERS.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(body.id)) {
      const row = PRODUCT_HEADERS.map((h, colIdx) =>
        (body[h] !== undefined ? body[h] : data[i][colIdx])
      );
      sheet.getRange(i + 1, 1, 1, PRODUCT_HEADERS.length).setValues([row]);
      logAction('updateProduct', { id: body.id });

      const newStock = Number(row[PRODUCT_HEADERS.indexOf('stock')]);
      if (!isNaN(newStock) && newStock < LOW_STOCK_THRESHOLD) {
        notifyLowStock(row[PRODUCT_HEADERS.indexOf('name')], newStock);
      }
      return { status: 'ok' };
    }
  }
  return { status: 'error', message: 'product not found' };
}

function deleteProduct(body) {
  const sheet = getOrCreateSheet(PRODUCTS_SHEET_NAME, PRODUCT_HEADERS);
  const data = sheet.getDataRange().getValues();
  const idCol = PRODUCT_HEADERS.indexOf('id');

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idCol]) === String(body.id)) {
      sheet.deleteRow(i + 1);
      logAction('deleteProduct', { id: body.id });
      return { status: 'ok' };
    }
  }
  return { status: 'error', message: 'product not found' };
}

// ══════════════════════════════
//  ORDERS
// ══════════════════════════════
function getOrders() {
  const sheet = getOrCreateSheet(ORDERS_SHEET_NAME, ORDER_HEADERS);
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1);

  const orders = [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i][0] === '' || rows[i][0] === null) continue;
    const obj = {};
    ORDER_HEADERS.forEach((h, idx) => { obj[h] = rows[i][idx]; });
    obj.row = i + 2; // رقم الصف الحقيقي فالشيت (خاص updateOrderStatus)
    orders.push(obj);
  }

  orders.reverse(); // الأحدث فوق
  return { status: 'ok', orders: orders };
}

// addOrder — كتحقق من صحة البيانات، المخزون، وكتحسب السعر من مصدر الحقيقة (Products)
// ماكتثقش فالسعر لي جاي من المتصفح، هادشي كيحمي من التلاعب بالأسعار
function addOrder(body) {
  // 1) حماية Honeypot: إيلا تعمر الحقل المخفي، غالبا bot
  if (body.website) {
    logAction('addOrder_blocked_honeypot', { phone: body.phone });
    return { status: 'error', message: 'invalid_data' };
  }

  // 2) تحقق من الحقول الأساسية
  const name = String(body.name || '').trim();
  const phone = String(body.phone || '').trim();
  const city = String(body.city || '').trim();
  const address = String(body.address || '').trim();
  const items = Array.isArray(body.items) ? body.items : [];

  if (!name || !phone || !city || !address || !items.length) {
    return { status: 'error', message: 'invalid_data' };
  }
  const phoneDigits = phone.replace(/[^0-9]/g, '');
  if (phoneDigits.length < 9) {
    return { status: 'error', message: 'invalid_data' };
  }

  // 3) قراءة المنتجات الحقيقية من الشيت (باش نتحققو من السعر والمخزون)
  const prodSheet = getOrCreateSheet(PRODUCTS_SHEET_NAME, PRODUCT_HEADERS);
  const prodData = prodSheet.getDataRange().getValues();
  const idCol = PRODUCT_HEADERS.indexOf('id');
  const priceCol = PRODUCT_HEADERS.indexOf('price');
  const stockCol = PRODUCT_HEADERS.indexOf('stock');
  const nameCol = PRODUCT_HEADERS.indexOf('name');

  const insufficientDetails = [];
  const validatedItems = []; // {rowIndex, id, name, qty, price}

  for (let k = 0; k < items.length; k++) {
    const reqId = items[k].id;
    const reqQty = Number(items[k].qty) || 0;
    if (reqQty <= 0) continue;

    let found = false;
    for (let i = 1; i < prodData.length; i++) {
      if (String(prodData[i][idCol]) === String(reqId)) {
        found = true;
        const availableStock = Number(prodData[i][stockCol]) || 0;
        const realPrice = Number(prodData[i][priceCol]) || 0;
        const realName = prodData[i][nameCol];
        if (availableStock < reqQty) {
          insufficientDetails.push({ name: realName, available: availableStock });
        } else {
          validatedItems.push({ rowIndex: i + 1, id: reqId, name: realName, qty: reqQty, price: realPrice });
        }
        break;
      }
    }
    if (!found) {
      insufficientDetails.push({ name: 'منتج غير معروف', available: 0 });
    }
  }

  if (insufficientDetails.length) {
    return { status: 'error', message: 'insufficient_stock', details: insufficientDetails };
  }

  // 4) حماية من التكرار السريع (نفس الهاتف + نفس المبلغ خلال آخر بضع دقائق)
  const total = validatedItems.reduce((s, it) => s + it.price * it.qty, 0);
  const ordersSheet = getOrCreateSheet(ORDERS_SHEET_NAME, ORDER_HEADERS);
  const ordersData = ordersSheet.getDataRange().getValues();
  const phoneColO = ORDER_HEADERS.indexOf('phone');
  const totalColO = ORDER_HEADERS.indexOf('total');
  const tsColO = ORDER_HEADERS.indexOf('timestamp');
  const now = Date.now();

  for (let i = 1; i < ordersData.length; i++) {
    const rowPhone = String(ordersData[i][phoneColO] || '').replace(/[^0-9]/g, '');
    const rowTotal = Number(ordersData[i][totalColO]) || 0;
    const rowTs = Number(ordersData[i][tsColO]) || 0;
    if (rowPhone === phoneDigits && rowTotal === total && (now - rowTs) < DUPLICATE_WINDOW_MINUTES * 60000) {
      return { status: 'error', message: 'duplicate_order' };
    }
  }

  // 5) إنقاص المخزون فعليا
  validatedItems.forEach(it => {
    const currentStock = Number(prodSheet.getRange(it.rowIndex, stockCol + 1).getValue()) || 0;
    const newStock = Math.max(0, currentStock - it.qty);
    prodSheet.getRange(it.rowIndex, stockCol + 1).setValue(newStock);
    if (newStock < LOW_STOCK_THRESHOLD) notifyLowStock(it.name, newStock);
  });

  // 6) تسجيل الطلب
  const orderId = generateOrderId();
  const itemsText = validatedItems.map(it => `${it.name} x${it.qty} = ${it.price * it.qty}dh`).join(' | ');
  const dateDisplay = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy');

  ordersSheet.appendRow([
    orderId, dateDisplay, name, phone, city, address,
    itemsText, total, body.notes || '', 'قيد المعالجة',
    JSON.stringify(validatedItems.map(it => ({ id: it.id, name: it.name, qty: it.qty }))),
    now
  ]);

  logAction('addOrder', { orderId, phone, total });
  notifyNewOrder(orderId, name, phone, city, address, itemsText, total, body.notes || '');

  return { status: 'ok', orderId: orderId, total: total };
}

// تحديث حالة الطلب (قيد المعالجة / تم التأكيد / تم الشحن / تم التسليم / ملغي)
function updateOrderStatus(body) {
  const sheet = getOrCreateSheet(ORDERS_SHEET_NAME, ORDER_HEADERS);
  const statusCol = ORDER_HEADERS.indexOf('status') + 1;

  if (!body.row) return { status: 'error', message: 'row is required' };

  sheet.getRange(Number(body.row), statusCol).setValue(body.status || 'قيد المعالجة');
  logAction('updateOrderStatus', { row: body.row, status: body.status });
  return { status: 'ok' };
}

// ══════════════════════════════
//  الإشعارات (البريد الإلكتروني — مجاني عبر MailApp)
// ══════════════════════════════
function notifyNewOrder(orderId, name, phone, city, address, itemsText, total, notes) {
  const email = getAdminEmail();
  if (!email) return;
  try {
    const body =
      `طلب جديد فـ SAMA CROCHET 🌸\n\n` +
      `رقم الطلب: ${orderId}\n` +
      `الاسم: ${name}\nالهاتف: ${phone}\nالمدينة: ${city}\nالعنوان: ${address}\n\n` +
      `المنتجات:\n${itemsText}\n\nالإجمالي: ${total} درهم\n` +
      (notes ? `ملاحظات: ${notes}\n` : '');
    MailApp.sendEmail(email, `طلب جديد #${orderId} - SAMA CROCHET`, body);
  } catch (e) {
    logAction('email_error', { type: 'newOrder', error: String(e) });
  }
}

function notifyLowStock(productName, stock) {
  const email = getAdminEmail();
  if (!email) return;
  try {
    MailApp.sendEmail(
      email,
      `⚠️ مخزون منخفض: ${productName}`,
      `المنتج "${productName}" باقي ليه غير ${stock} فالمخزون. خاصك تزيدي الكمية.`
    );
  } catch (e) {
    logAction('email_error', { type: 'lowStock', error: String(e) });
  }
}

// ══════════════════════════════
//  الإحصائيات (لوحة التحكم — نظرة عامة)
// ══════════════════════════════
function getStats() {
  const sheet = getOrCreateSheet(ORDERS_SHEET_NAME, ORDER_HEADERS);
  const data = sheet.getDataRange().getValues();
  const rows = data.slice(1).filter(r => r[0] !== '' && r[0] !== null);

  const totalCol = ORDER_HEADERS.indexOf('total');
  const statusCol = ORDER_HEADERS.indexOf('status');
  const phoneCol = ORDER_HEADERS.indexOf('phone');
  const tsCol = ORDER_HEADERS.indexOf('timestamp');
  const itemsJsonCol = ORDER_HEADERS.indexOf('itemsJSON');

  const now = new Date();
  const todayStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd');
  const monthStr = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMM');

  let totalRevenue = 0, dailyRevenue = 0, monthlyRevenue = 0;
  const customers = {};
  const productQty = {};

  rows.forEach(r => {
    const status = r[statusCol];
    const total = Number(r[totalCol]) || 0;
    const ts = Number(r[tsCol]) || 0;
    const isCancelled = status === 'ملغي';

    if (!isCancelled) {
      totalRevenue += total;
      if (ts) {
        const d = new Date(ts);
        const dStr = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyyMMdd');
        const mStr = Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyyMM');
        if (dStr === todayStr) dailyRevenue += total;
        if (mStr === monthStr) monthlyRevenue += total;
      }
    }

    const phone = String(r[phoneCol] || '').replace(/[^0-9]/g, '').replace(/^212/, '0');
    if (phone) customers[phone] = true;

    if (!isCancelled) {
      try {
        const parsedItems = JSON.parse(r[itemsJsonCol] || '[]');
        parsedItems.forEach(it => {
          productQty[it.name] = (productQty[it.name] || 0) + Number(it.qty || 0);
        });
      } catch (e) { /* تجاهل السطور القديمة بلا itemsJSON */ }
    }
  });

  const bestSellers = Object.keys(productQty)
    .map(name => ({ name: name, qty: productQty[name] }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return {
    status: 'ok',
    stats: {
      totalOrders: rows.length,
      totalRevenue: totalRevenue,
      dailyRevenue: dailyRevenue,
      monthlyRevenue: monthlyRevenue,
      uniqueCustomers: Object.keys(customers).length,
      bestSellers: bestSellers
    }
  };
}

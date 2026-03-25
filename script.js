/* ══════════════════════════════════════════════════════════════
   TRAMA TERRA – Artesanato com Alma
   script.js – Lógica da loja (carrinho, cores, checkout, histórico)
   ══════════════════════════════════════════════════════════════ */

// ─── CONFIG ──────────────────────────────────────────────────────
const WHATSAPP_NUMBER = "63999999999"; // ← ALTERE PARA SEU NÚMERO
const STORE_NAME      = "Trama Terra";
const HISTORY_KEY     = "trama_terra_orders";

// ─── ESTADO GLOBAL ───────────────────────────────────────────────
let cart        = [];
let shippingType = "correios";
let paymentType  = "pix";
let pendingItem  = null;

// ─── DOM REFS ─────────────────────────────────────────────────────
const menu             = document.getElementById("menu");
const cartModal        = document.getElementById("cart-modal");
const cartBtn          = document.getElementById("cart-btn");
const cartItemsEl      = document.getElementById("cart-items");
const cartTotalEl      = document.getElementById("cart-total");
const checkoutBtn      = document.getElementById("checkout-btn");
const closeModalBtn    = document.getElementById("close-modal-btn");
const cartCounter      = document.getElementById("cart-count");
const cartCounterModal = document.getElementById("cart-count-modal");
const customerNameEl   = document.getElementById("customer-name");
const customerPhoneEl  = document.getElementById("customer-phone");
const customerEmailEl  = document.getElementById("customer-email");
const cepInput         = document.getElementById("cep-input");
const addressStreet    = document.getElementById("address-street");
const addressNum       = document.getElementById("address-num");
const addressComp      = document.getElementById("address-comp");
const addressBairro    = document.getElementById("address-bairro");
const addressCity      = document.getElementById("address-city");
const addressState     = document.getElementById("address-state");
const colorModal       = document.getElementById("color-modal");
const colorChipsEl     = document.getElementById("color-chips");
const colorObsEl       = document.getElementById("color-obs");
const historyModal     = document.getElementById("history-modal");
const historyList      = document.getElementById("history-list");
const changeArea       = document.getElementById("change-area");
const changeValue      = document.getElementById("change-value");
const changeInfo       = document.getElementById("change-info");

// ─── MAPA DE ÍCONES ───────────────────────────────────────────────
const ICONS = { cocas: "🎀", crochet: "🧶" };

function getIcon(name) {
  const n = name.toLowerCase();
  if (n.includes("bolsa") || n.includes("kit")) return "🎁";
  if (n.includes("tapete") || n.includes("quadro")) return "🎨";
  if (n.includes("vaso")) return "🌿";
  if (n.includes("buquê") || n.includes("flor")) return "💐";
  if (n.includes("cachecol")) return "🧣";
  if (n.includes("amigurumi")) return "🧸";
  if (n.includes("natal")) return "🎄";
  if (n.includes("coca") || n.includes("cocá")) return "🎀";
  return "🧶";
}

// ─── NAV ──────────────────────────────────────────────────────────
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 60;
  window.scrollTo({ top, behavior: "smooth" });
  document.querySelectorAll(".cat-tab").forEach((t) => t.classList.remove("active"));
  event.currentTarget.classList.add("active");
}

// ─── CARRINHO – MODAL ─────────────────────────────────────────────
cartBtn.addEventListener("click", () => {
  updateCartModal();
  cartModal.classList.add("active");
});
closeModalBtn.addEventListener("click", () => cartModal.classList.remove("active"));
cartModal.addEventListener("click", (e) => {
  if (e.target === cartModal) cartModal.classList.remove("active");
});

// ─── ENVIO ────────────────────────────────────────────────────────
function selectShipping(type) {
  shippingType = type;
  ["correios", "motoboy", "retirada"].forEach((s) => {
    document.getElementById("ship-" + s).classList.toggle("selected", s === type);
  });
  const addrBlock = document.getElementById("address-block");
  addrBlock.style.display = type === "retirada" ? "none" : "block";
}

// ─── PAGAMENTO ────────────────────────────────────────────────────
function selectPayment(type) {
  paymentType = type;
  ["pix", "cartao", "deposito"].forEach((p) => {
    document.getElementById("btn-" + p).classList.toggle("selected", p === type);
  });
  changeArea.style.display = type === "dinheiro" ? "flex" : "none";
}

// ─── CEP FORMAT ───────────────────────────────────────────────────
function formatCEP(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
  input.value = v;
}

// ─── SWATCHES DE CORES ────────────────────────────────────────────
const COLOR_SWATCHES = {
  "Rosa": "#F4A7B9", "Rosa Chiclete": "#FF69B4", "Rosa Antigo": "#C9A0A0",
  "Azul Bebê": "#B5D8F7", "Azul Claro": "#87CEEB", "Azul Royal": "#4169E1",
  "Azul Jeans": "#4A7FB5", "Azul Marinho": "#1C3D6E", "Azul": "#5B9BD5",
  "Lilás": "#C8A8E9", "Roxo": "#9B59B6",
  "Branco": "#F8F8F8", "Creme": "#FFF8E7", "Champagne": "#F7E7CE",
  "Nude": "#E8C9A0", "Natural": "#D4B896",
  "Amarelo": "#FFE066", "Mostarda": "#E0A020",
  "Verde Menta": "#B8E8C8", "Verde Sage": "#B2C9AD", "Verde": "#5DAA68",
  "Verde Militar": "#4A5E3A", "Verde Claro": "#90EE90",
  "Terracota": "#C1613C", "Coral": "#FF7F6E", "Pêssego": "#FFCBA4",
  "Vermelho": "#E63946", "Vermelho Cereja": "#C0392B", "Vinho": "#7B1E3C",
  "Caramelo": "#C87941", "Dourado": "#D4AC0D", "Marrom": "#8B6045",
  "Bege": "#D2B48C", "Preto": "#2C2C2C", "Cinza": "#9E9E9E",
  "Natural/Creme": "#D4B896", "Terracota/Creme": "#C1613C",
  "Preto/Branco": "#666666", "Azul/Branco": "#5B9BD5",
  "Rosa/Branco": "#F4A7B9", "Colorido": "linear-gradient(135deg,#F4A7B9,#FFE066,#B5D8F7,#B8E8C8)",
  "Tons de Rosa": "#F4A7B9", "Tons de Branco": "#F8F8F8",
  "Tons Terrosos": "#C1613C", "Roxo e Verde": "#9B59B6",
  "Neutros": "#D4B896", "Terrosos": "#C1613C",
  "Azuis": "#5B9BD5", "Rosas": "#F4A7B9",
  "Tradicional (Verm/Verd)": "#C0392B",
  "Branco e Dourado": "#F7E7CE", "Azul e Prata": "#5B9BD5",
};

// ─── MODAL DE CORES ───────────────────────────────────────────────
let selectedColors = [];

document.querySelectorAll(".add-td-cart-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const name      = btn.dataset.name;
    const price     = parseFloat(btn.dataset.price);
    const colors    = JSON.parse(btn.dataset.colors || "[]");
    const maxColors = parseInt(btn.dataset.maxColors || "1", 10);

    pendingItem   = { name, price, colors: [], obs: "" };
    selectedColors = [];

    document.getElementById("color-product-name").textContent  = name;
    document.getElementById("color-product-price").textContent = `R$ ${price.toFixed(2).replace(".", ",")}`;
    document.getElementById("color-product-icon").textContent  = getIcon(name);
    document.getElementById("color-max-label").textContent     = `Selecione até ${maxColors} cor${maxColors > 1 ? "es" : ""}`;
    document.getElementById("color-selected-hint").textContent = "Nenhuma cor selecionada";

    colorChipsEl.innerHTML = "";
    colorObsEl.value = "";

    colors.forEach((color) => {
      const chip  = document.createElement("button");
      chip.className = "color-chip";
      const swatch = COLOR_SWATCHES[color] || "#ccc";
      const isGradient = swatch.startsWith("linear");
      chip.innerHTML = `<span class="chip-dot" style="background:${swatch};${isGradient ? "" : ""}"></span>${color}`;
      chip.addEventListener("click", () => {
        if (chip.classList.contains("selected")) {
          chip.classList.remove("selected");
          selectedColors = selectedColors.filter((c) => c !== color);
        } else {
          if (selectedColors.length >= maxColors) {
            const first = colorChipsEl.querySelector(".color-chip.selected");
            if (first) {
              const removed = selectedColors.shift();
              first.classList.remove("selected");
            }
          }
          chip.classList.add("selected");
          selectedColors.push(color);
        }
        colorChipsEl.querySelectorAll(".color-chip:not(.selected)").forEach((c) => {
          c.classList.toggle("disabled", selectedColors.length >= maxColors);
        });
        const hint = document.getElementById("color-selected-hint");
        hint.textContent = selectedColors.length
          ? `Selecionada${selectedColors.length > 1 ? "s" : ""}: ${selectedColors.join(" + ")}`
          : "Nenhuma cor selecionada";
      });
      colorChipsEl.appendChild(chip);
    });

    colorModal.classList.add("active");
  });
});

document.getElementById("color-modal-close").addEventListener("click", () => colorModal.classList.remove("active"));
document.getElementById("color-cancel-btn").addEventListener("click", () => colorModal.classList.remove("active"));
colorModal.addEventListener("click", (e) => {
  if (e.target === colorModal) colorModal.classList.remove("active");
});

document.getElementById("color-confirm-btn").addEventListener("click", () => {
  if (!pendingItem) return;
  pendingItem.colors = [...selectedColors];
  pendingItem.obs    = colorObsEl.value.trim();
  addToCart(pendingItem);
  colorModal.classList.remove("active");
  pendingItem = null;
});

// ─── CARRINHO – LÓGICA ────────────────────────────────────────────
function addToCart(item) {
  const key    = item.name + "|" + item.colors.join(",");
  const exists = cart.find((c) => c.name + "|" + c.colors.join(",") === key);
  if (exists) {
    exists.quantity++;
    exists.obs = item.obs || exists.obs;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  updateCartCounter();
  const fab = document.getElementById("cart-btn");
  fab.classList.add("bounce");
  fab.addEventListener("animationend", () => fab.classList.remove("bounce"), { once: true });
}

function updateCartCounter() {
  const total = cart.reduce((s, c) => s + c.quantity, 0);
  cartCounter.textContent      = total;
  cartCounterModal.textContent = `${total} ${total === 1 ? "item" : "itens"}`;
}

function updateCartModal() {
  updateCartCounter();
  if (!cart.length) {
    cartItemsEl.innerHTML = `
      <div class="empty-cart">
        <i class="fas fa-shopping-basket"></i>
        <p style="font-weight:800;">Carrinho vazio</p>
        <p style="font-size:0.82rem;">Adicione suas peças favoritas 🧶</p>
      </div>`;
    cartTotalEl.textContent = "R$ 0,00";
    return;
  }
  cartItemsEl.innerHTML = "";
  let total = 0;
  cart.forEach((item, i) => {
    const sub = item.price * item.quantity;
    total += sub;
    const card = document.createElement("div");
    card.className = "cart-item-card";
    card.innerHTML = `
      <div class="cart-item-info">
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-unit">R$ ${item.price.toFixed(2).replace(".", ",")} × ${item.quantity}</p>
        ${item.colors.length ? `<p class="cart-item-color">🎨 ${item.colors.join(" + ")}</p>` : ""}
        ${item.obs ? `<p class="cart-item-obs">💬 ${item.obs}</p>` : ""}
      </div>
      <div style="display:flex;flex-direction:column;align-items:flex-end;gap:0.5rem;">
        <span class="cart-item-price">R$ ${sub.toFixed(2).replace(".", ",")}</span>
        <div class="cart-item-controls">
          <button class="qty-btn" data-i="${i}" data-action="dec">−</button>
          <span class="qty-num">${item.quantity}</span>
          <button class="qty-btn" data-i="${i}" data-action="inc">+</button>
        </div>
      </div>`;
    cartItemsEl.appendChild(card);
  });
  cartTotalEl.textContent = `R$ ${total.toFixed(2).replace(".", ",")}`;
  cartItemsEl.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.i);
      if (btn.dataset.action === "inc") {
        cart[idx].quantity++;
      } else {
        cart[idx].quantity--;
        if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      }
      updateCartModal();
    });
  });
}

// ─── BUILD ORDER DATA ─────────────────────────────────────────────
function buildOrderData() {
  const total = cart.reduce((s, item) => s + item.price * item.quantity, 0);

  const cartLines = cart.map((item) => {
    const sub = item.price * item.quantity;
    let line = `▪️ *${item.name}*\n   Qtd: ${item.quantity} × R$ ${item.price.toFixed(2)} = R$ ${sub.toFixed(2)}`;
    if (item.colors.length) line += `\n   🎨 Cores: ${item.colors.join(" + ")}`;
    if (item.obs) line += `\n   💬 Obs: ${item.obs}`;
    return line;
  }).join("\n\n");

  const shippingLabels = { correios: "📦 Correios", motoboy: "🛵 Motoboy Local", retirada: "🏡 Retirada" };
  const payLabels      = { pix: "💠 Pix", cartao: "💳 Cartão", deposito: "🏦 Depósito Bancário" };

  const address = shippingType !== "retirada"
    ? `📍 *ENDEREÇO DE ENTREGA:*\n${addressStreet.value}, ${addressNum.value}${addressComp.value ? ", " + addressComp.value : ""}\n${addressBairro.value} – ${addressCity.value}/${addressState.value.toUpperCase()}\nCEP: ${cepInput.value}`
    : "🏡 *RETIRADA NO LOCAL*";

  const text =
    `🧶 *NOVO PEDIDO – ${STORE_NAME}* 🧶\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `👤 *CLIENTE:* ${customerNameEl.value.trim()}\n` +
    `📱 *WHATSAPP:* ${customerPhoneEl.value.trim()}\n` +
    `📧 *E-MAIL:* ${customerEmailEl.value.trim() || "Não informado"}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `🛍️ *ITENS DO PEDIDO:*\n\n` +
    `${cartLines}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `💰 *VALOR TOTAL:* R$ ${total.toFixed(2)}\n\n` +
    `🚀 *ENVIO:* ${shippingLabels[shippingType]}\n\n` +
    `${address}\n\n` +
    `💳 *PAGAMENTO:* ${payLabels[paymentType]}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n\n` +
    `⏰ Pedido em: ${new Date().toLocaleString("pt-BR")}`;

  return {
    total,
    cartSnapshot: JSON.parse(JSON.stringify(cart)),
    whatsappText: text,
    customerName:  customerNameEl.value.trim(),
    customerPhone: customerPhoneEl.value.trim(),
    customerEmail: customerEmailEl.value.trim(),
    shippingType,
    paymentType,
    address: shippingType !== "retirada"
      ? `${addressStreet.value}, ${addressNum.value} – ${addressCity.value}/${addressState.value}`
      : "Retirada",
    date: new Date().toISOString(),
  };
}

// ─── CHECKOUT ─────────────────────────────────────────────────────
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) { alert("Adicione peças ao carrinho antes de finalizar."); return; }
  if (customerNameEl.value.trim() === "")  { showWarn("customer-name-warn", customerNameEl); return; }
  if (customerPhoneEl.value.trim() === "") { showWarn("customer-phone-warn", customerPhoneEl); return; }
  if (shippingType !== "retirada") {
    if (!cepInput.value.trim() || cepInput.value.replace(/\D/g, "").length < 8) {
      showWarn("cep-warn", cepInput); return;
    }
    if (!addressStreet.value.trim() || !addressCity.value.trim()) {
      showWarn("address-warn", addressStreet); return;
    }
  }

  const orderData = buildOrderData();
  saveOrderToHistory(orderData);

  window.open(
    "https://wa.me/" + WHATSAPP_NUMBER.replace(/\D/g, "") + "?text=" + encodeURIComponent(orderData.whatsappText),
    "_blank"
  );

  // Reset
  cart = [];
  [customerNameEl, customerPhoneEl, customerEmailEl, cepInput,
   addressStreet, addressNum, addressComp, addressBairro, addressCity, addressState]
    .forEach((el) => (el.value = ""));
  updateCartModal();
  cartModal.classList.remove("active");
});

function showWarn(warnId, inputEl) {
  const w = document.getElementById(warnId);
  if (w) w.style.display = "block";
  if (inputEl) {
    inputEl.classList.add("input-error");
    inputEl.scrollIntoView({ behavior: "smooth", block: "center" });
    inputEl.focus();
  }
}

[customerNameEl, customerPhoneEl, cepInput, addressStreet, addressCity].forEach((el) => {
  el.addEventListener("input", () => {
    el.classList.remove("input-error");
    document.querySelectorAll(".form-warn").forEach((w) => (w.style.display = "none"));
  });
});

// ─── HISTÓRICO ────────────────────────────────────────────────────
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); }
  catch { return []; }
}

function saveOrderToHistory(d) {
  try {
    const h = loadHistory();
    h.unshift({
      id: Date.now(),
      date: d.date,
      customerName:  d.customerName,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail,
      items:         d.cartSnapshot,
      total:         d.total,
      shippingType:  d.shippingType,
      paymentType:   d.paymentType,
      address:       d.address,
      status:        "novo",
    });
    if (h.length > 100) h.splice(100);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  } catch (e) {}
}

function openHistoryModal() {
  renderHistoryList();
  historyModal.classList.add("active");
}

function renderHistoryList() {
  const history = loadHistory();
  historyList.innerHTML = "";
  if (!history.length) {
    historyList.innerHTML = `
      <div class="history-empty">
        <i class="fas fa-receipt"></i>
        <p style="font-weight:800;">Nenhum pedido ainda</p>
        <p style="font-size:0.82rem;">Seus pedidos aparecerão aqui após a confirmação 🧶</p>
      </div>`;
    return;
  }
  const shipLabels = { correios: "📦 Correios", motoboy: "🛵 Motoboy", retirada: "🏡 Retirada" };
  const payLabels  = { pix: "💠 Pix", cartao: "💳 Cartão", deposito: "🏦 Depósito" };

  history.forEach((order) => {
    const dateStr = new Date(order.date).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
    const itemsHTML = order.items.map((item) => {
      let t = `${item.quantity}× ${item.name}`;
      if (item.colors && item.colors.length) t += ` – ${item.colors.join(" + ")}`;
      if (item.obs) t += ` (${item.obs})`;
      return `<div class="history-item-line"><i class="fas fa-circle"></i><span>${t}</span></div>`;
    }).join("");

    const card = document.createElement("div");
    card.className = "history-card";
    card.innerHTML = `
      <div class="history-card-header">
        <div>
          <div style="font-size:0.82rem;font-weight:800;">${order.customerName}</div>
          <div class="history-card-date">${dateStr}</div>
        </div>
        <div class="history-card-total">${order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
      </div>
      <div class="history-card-body">
        <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:0.5rem;">
          <i class="fas fa-map-marker-alt"></i> ${order.address || "—"}
        </div>
        ${itemsHTML}
        <div class="history-badge-row">
          <span class="history-badge">${shipLabels[order.shippingType] || order.shippingType}</span>
          <span class="history-badge">${payLabels[order.paymentType]  || order.paymentType}</span>
        </div>
      </div>`;
    historyList.appendChild(card);
  });
}

function clearHistory() {
  if (!confirm("Limpar todo o histórico de pedidos?")) return;
  localStorage.removeItem(HISTORY_KEY);
  renderHistoryList();
}

document.getElementById("history-modal-close").addEventListener("click", () =>
  historyModal.classList.remove("active")
);
historyModal.addEventListener("click", (e) => {
  if (e.target === historyModal) historyModal.classList.remove("active");
});

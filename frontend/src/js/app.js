// app.js - Código principal da aplicação
import {
  handleLoginSuccess,
  login,
  register,
  getCurrentUser,
  clearErrorMessages,
  handleValidationError,
} from "./modules/auth.js";

// Estado da aplicação
let currentUser = null;
let token = null;
let products = [];
let cart = [];

// URLs da API
const API_URL = "http://localhost:3000/api";

// DOM Elements
const authContainer = document.getElementById("auth-container");
const mainContent = document.getElementById("main-content");
const loginForm = document.getElementById("login-form");
const toggleAuth = document.getElementById("toggle-auth");
const productsContainer = document.getElementById("products-container");
const cartItems = document.getElementById("cart-items");
const emptyCartMessage = document.getElementById("empty-cart-message");
const cartTotal = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-button");
const ordersContainer = document.getElementById("orders-container");
const noOrdersMessage = document.getElementById("no-orders-message");
const adminPanelLink = document.getElementById("admin-panel-link");
const logoutButton = document.getElementById("logout-button");

// Verificar se já existe um token no localStorage
document.addEventListener("DOMContentLoaded", () => {
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("currentUser");

  if (savedToken && savedUser) {
    token = savedToken;
    currentUser = JSON.parse(savedUser);

    // Verificar se o token ainda é válido
    fetchCurrentUser();

    // Verificar se o usuário é admin
    if (currentUser && currentUser.role === "ADMIN") {
      adminPanelLink.classList.remove("hidden");
    }
  }
});

// Alternar entre login e registro
let isLoginMode = true;
toggleAuth.addEventListener("click", (e) => {
  e.preventDefault();
  isLoginMode = !isLoginMode;

  const title = authContainer.querySelector("h2");
  const submitButton = loginForm.querySelector('button[type="submit"]');

  if (isLoginMode) {
    title.textContent = "Login";
    submitButton.textContent = "Entrar";
    toggleAuth.textContent = "Não tem uma conta? Registre-se";

    // Remover campo de nome se existir
    const nameField = document.getElementById("register-name-field");
    if (nameField) {
      nameField.remove();
    }
  } else {
    title.textContent = "Registro";
    submitButton.textContent = "Registrar";
    toggleAuth.textContent = "Já tem uma conta? Faça login";

    // Adicionar campo de nome se não existir
    if (!document.getElementById("register-name-field")) {
      const emailField = loginForm.querySelector("div:first-child");
      const nameField = document.createElement("div");
      nameField.id = "register-name-field";
      nameField.innerHTML = `
        <label class="block text-gray-700">Nome</label>
        <input type="text" id="register-name" class="w-full border p-2 rounded" required>
      `;
      loginForm.insertBefore(nameField, emailField);
    }
  }
});

// Processar formulário de login/registro
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  // Limpar mensagens de erro anteriores
  clearErrorMessages(loginForm);

  try {
    if (isLoginMode) {
      // Login
      const { response, data } = await login(email, password, API_URL);

      if (!response.ok) {
        handleValidationError(data);
        return;
      }

      const result = handleLoginSuccess(
        data,
        mainContent,
        authContainer,
        adminPanelLink
      );
      currentUser = result.currentUser;
      token = result.token;

      // Carregar produtos e pedidos
      fetchProducts();
      fetchOrders();
    } else {
      // Registro
      const name = document.getElementById("register-name").value;

      const { response, data } = await register(name, email, password, API_URL);

      if (!response.ok) {
        handleValidationError(data);
        return;
      }

      // Após registro bem-sucedido, fazer login
      alert("Registro realizado com sucesso! Faça login com suas credenciais.");
      isLoginMode = true;
      toggleAuth.textContent = "Não tem uma conta? Registre-se";
      const title = authContainer.querySelector("h2");
      title.textContent = "Login";
      const submitButton = loginForm.querySelector('button[type="submit"]');
      submitButton.textContent = "Entrar";
      const nameField = document.getElementById("register-name-field");
      if (nameField) {
        nameField.remove();
      }
    }
  } catch (error) {
    alert(error.message);
  }
});

// Buscar usuário atual pelo token
async function fetchCurrentUser() {
  try {
    const user = await getCurrentUser(token, API_URL);
    currentUser = user;

    // Mostrar conteúdo principal e esconder autenticação
    authContainer.classList.add("hidden");
    mainContent.classList.remove("hidden");

    // Verificar se o usuário é admin
    if (currentUser.role === "ADMIN") {
      adminPanelLink.classList.remove("hidden");
    }

    // Carregar produtos e pedidos
    fetchProducts();
    fetchOrders();
  } catch (error) {
    // Token inválido, remover do localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    token = null;
    currentUser = null;
  }
}

// Buscar produtos
async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/items`);
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }
}

// Renderizar produtos na página
function renderProducts() {
  productsContainer.innerHTML = "";

  if (products.length === 0) {
    productsContainer.innerHTML =
      '<p class="col-span-3 text-center">Nenhum produto disponível.</p>';
    return;
  }

  products.forEach((product) => {
    if (!product.available) return;

    const productCard = document.createElement("div");
    productCard.className = "bg-white p-4 rounded shadow";
    productCard.innerHTML = `
      <h3 class="font-semibold">${product.name}</h3>
      <p class="text-gray-600 text-sm mb-2">${
        product.description || "Sem descrição"
      }</p>
      <p class="font-bold mb-2">R$ ${product.price.toFixed(2)}</p>
      <button class="add-to-cart bg-blue-500 text-white p-1 rounded text-sm hover:bg-blue-600" data-id="${
        product.id
      }">
        Adicionar ao Carrinho
      </button>
    `;

    productCard.querySelector(".add-to-cart").addEventListener("click", () => {
      addToCart(product);
    });

    productsContainer.appendChild(productCard);
  });
}

// Adicionar produto ao carrinho
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  renderCart();
}

// Renderizar carrinho
function renderCart() {
  if (cart.length === 0) {
    emptyCartMessage.classList.remove("hidden");
    cartItems.innerHTML = "";
    cartItems.appendChild(emptyCartMessage);
    checkoutButton.disabled = true;
    checkoutButton.classList.add("opacity-50");
  } else {
    emptyCartMessage.classList.add("hidden");
    cartItems.innerHTML = "";

    const cartList = document.createElement("div");
    cartList.className = "space-y-2";

    let total = 0;

    cart.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      const cartItem = document.createElement("div");
      cartItem.className = "flex justify-between items-center border-b pb-2";
      cartItem.innerHTML = `
        <div>
          <span class="font-semibold">${item.name}</span>
          <span class="text-gray-600 text-sm"> x ${item.quantity}</span>
        </div>
        <div class="flex items-center">
          <span class="mr-2">R$ ${itemTotal.toFixed(2)}</span>
          <button class="remove-item text-red-500 text-sm" data-id="${
            item.id
          }">Remover</button>
        </div>
      `;

      cartItem.querySelector(".remove-item").addEventListener("click", () => {
        removeFromCart(item.id);
      });

      cartList.appendChild(cartItem);
    });

    cartItems.appendChild(cartList);
    cartTotal.textContent = `Total: R$ ${total.toFixed(2)}`;

    checkoutButton.disabled = false;
    checkoutButton.classList.remove("opacity-50");
  }
}

// Remover item do carrinho
function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  renderCart();
}

// Finalizar pedido
checkoutButton.addEventListener("click", async () => {
  if (cart.length === 0) return;

  try {
    const orderItems = cart.map((item) => ({
      itemId: item.id,
      quantity: item.quantity,
    }));

    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items: orderItems,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao criar pedido");
    }

    const orderData = await response.json();

    // Limpar carrinho
    cart = [];
    renderCart();

    // Atualizar lista de pedidos
    fetchOrders();

    alert("Pedido realizado com sucesso!");
  } catch (error) {
    alert(error.message);
  }
});

// Buscar pedidos do usuário
async function fetchOrders() {
  try {
    const response = await fetch(`${API_URL}/orders/my-orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar pedidos");
    }

    const orders = await response.json();
    renderOrders(orders);
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error);
  }
}

// Renderizar pedidos
function renderOrders(orders) {
  if (orders.length === 0) {
    noOrdersMessage.classList.remove("hidden");
    ordersContainer.innerHTML = "";
    ordersContainer.appendChild(noOrdersMessage);
    return;
  }

  noOrdersMessage.classList.add("hidden");
  ordersContainer.innerHTML = "";

  const ordersList = document.createElement("div");
  ordersList.className = "space-y-4";

  orders.forEach((order) => {
    const orderCard = document.createElement("div");
    orderCard.className = "border rounded p-3";

    // Formatar data
    const date = new Date(order.createdAt);
    const formattedDate =
      date.toLocaleDateString("pt-BR") + " " + date.toLocaleTimeString("pt-BR");

    // Status em português
    const statusMap = {
      PENDING: "Pendente",
      PROCESSING: "Em processamento",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
    };

    // Cor do status
    const statusColorMap = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };

    orderCard.innerHTML = `
      <div class="flex justify-between items-start mb-2">
        <div>
          <h3 class="font-semibold">Pedido #${order.id.substring(0, 8)}</h3>
          <p class="text-sm text-gray-600">${formattedDate}</p>
        </div>
        <span class="px-2 py-1 rounded text-xs font-semibold ${
          statusColorMap[order.status]
        }">
          ${statusMap[order.status]}
        </span>
      </div>
      <div class="mb-2">
        <h4 class="text-sm font-semibold mb-1">Itens:</h4>
        <ul class="text-sm ml-4 list-disc">
          ${order.items
            .map(
              (item) => `
            <li>${item.quantity}x ${item.item.name} - R$ ${(
                item.price * item.quantity
              ).toFixed(2)}</li>
          `
            )
            .join("")}
        </ul>
      </div>
      <div class="text-right font-bold">
        Total: R$ ${order.total.toFixed(2)}
      </div>
    `;

    ordersList.appendChild(orderCard);
  });

  ordersContainer.appendChild(ordersList);
}

///////////////////////////////////////////////// AQUI

function logout() {
  // Remover token e dados do usuário
  localStorage.removeItem("token");
  localStorage.removeItem("currentUser");

  alert("Logout realizado com sucesso!");

  // Esconder conteúdo principal e mostrar autenticação
  mainContent.classList.add("hidden");
  authContainer.classList.remove("hidden");

  // Limpar estado da aplicação
  currentUser = null;
  token = null;
  cart = [];

  // Redirecionar para a página inicial ou atualizar a página
  // Opcional: se você quiser apenas atualizar a página atual
  window.location.reload();

  // Opcional: se você quiser redirecionar para outra página
  // window.location.href = "index.html";
}

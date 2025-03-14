// js/admin.js
// Constantes
const API_URL = "http://localhost:3000/api";

// Estado
let token = null;
let currentUser = null;
let activeTab = "dashboard";

// Elementos DOM
const authCheck = document.getElementById("auth-check");
const adminContent = document.getElementById("admin-content");
const tabButtons = document.querySelectorAll("button[id^='tab-']");
const tabContents = document.querySelectorAll("div[id^='tab-content-']");

// Verificar se o usuário está autenticado e é admin
async function checkAdminAuth() {
  token = localStorage.getItem("token");

  if (!token) {
    showAuthError();
    return;
  }

  try {
    // Tentar obter dados do usuário para verificar se é admin
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Falha na autenticação");
    }

    currentUser = await response.json();

    if (currentUser.role !== "ADMIN") {
      showAuthError();
      return;
    }

    // Usuário é admin, mostrar conteúdo
    adminContent.classList.remove("hidden");

    // Carregar dados iniciais
    loadDashboardData();
  } catch (error) {
    console.error("Erro na verificação de autenticação:", error);
    showAuthError();
  }
}

function showAuthError() {
  authCheck.classList.remove("hidden");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 2000);
}

// === DASHBOARD ===
async function loadDashboardData() {
  try {
    const response = await fetch(`${API_URL}/admin/dashboard`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta: ${response.status}`);
    }

    const data = await response.json();

    // Atualizar os elementos do dashboard
    document.getElementById("users-count").textContent = data.usersCount || 0;
    document.getElementById("products-count").textContent =
      data.productsCount || 0;
    document.getElementById("orders-count").textContent = data.ordersCount || 0;
    document.getElementById("revenue").textContent = `R$ ${(
      data.revenue || 0
    ).toFixed(2)}`;

    // Atualizar os produtos mais vendidos
    const topProductsElement = document.getElementById("top-products");

    if (topProductsElement) {
      // Limpar conteúdo anterior
      topProductsElement.innerHTML = "";

      // Verificar se temos produtos para mostrar
      if (data.topProducts && data.topProducts.length > 0) {
        const list = document.createElement("ul");
        list.className = "divide-y";

        data.topProducts.forEach((product) => {
          const item = document.createElement("li");
          item.className = "py-2 flex justify-between";
          item.innerHTML = `
            <span class="font-medium">${product.name}</span>
            <span class="text-gray-600">${product.quantity} unidades</span>
          `;
          list.appendChild(item);
        });

        topProductsElement.appendChild(list);
      } else {
        topProductsElement.innerHTML =
          "<p class='text-gray-500'>Nenhum produto vendido ainda.</p>";
      }
    }

    // Atualizar os pedidos por status
    const ordersByStatusElement = document.getElementById("orders-by-status");

    if (ordersByStatusElement && data.ordersByStatus) {
      // Limpar conteúdo anterior
      ordersByStatusElement.innerHTML = "";

      const statusMap = {
        PENDING: "Pendente",
        PROCESSING: "Em processamento",
        COMPLETED: "Concluído",
        CANCELLED: "Cancelado",
      };

      if (data.ordersByStatus.length > 0) {
        const list = document.createElement("ul");
        list.className = "space-y-2";

        data.ordersByStatus.forEach((statusData) => {
          const item = document.createElement("li");
          item.className = "flex justify-between";
          item.innerHTML = `
            <span class="font-medium">${
              statusMap[statusData.status] || statusData.status
            }</span>
            <span>${statusData._count.id} pedidos</span>
          `;
          list.appendChild(item);
        });

        ordersByStatusElement.appendChild(list);
      } else {
        ordersByStatusElement.innerHTML =
          "<p class='text-gray-500'>Nenhum pedido registrado.</p>";
      }
    }
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
    alert("Falha ao carregar dados do dashboard. Por favor, tente novamente.");
  }
}

// === PRODUTOS ===
// Carregar produtos
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/items`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta: ${response.status}`);
    }

    const products = await response.json();

    const productsListElement = document.getElementById("products-list");
    if (!productsListElement) return;

    // Limpar conteúdo anterior
    productsListElement.innerHTML = "";

    if (products.length === 0) {
      productsListElement.innerHTML = `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-center" colspan="4">
            Nenhum produto cadastrado.
          </td>
        </tr>
      `;
      return;
    }

    // Preencher tabela com produtos
    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm font-medium text-gray-900">${product.name}</div>
          <div class="text-sm text-gray-500">${
            product.description || "Sem descrição"
          }</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <div class="text-sm text-gray-900">R$ ${product.price.toFixed(
            2
          )}</div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap">
          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            product.available
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }">
            ${product.available ? "Disponível" : "Indisponível"}
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button class="edit-product text-blue-600 hover:text-blue-900 mr-2" data-id="${
            product.id
          }">Editar</button>
          <button class="delete-product text-red-600 hover:text-red-900" data-id="${
            product.id
          }">Excluir</button>
        </td>
      `;

      productsListElement.appendChild(row);
    });

    // Adicionar eventos para os botões de editar e excluir
    document.querySelectorAll(".edit-product").forEach((button) => {
      button.addEventListener("click", () => editProduct(button.dataset.id));
    });

    document.querySelectorAll(".delete-product").forEach((button) => {
      button.addEventListener("click", () => deleteProduct(button.dataset.id));
    });
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    const productsListElement = document.getElementById("products-list");
    if (productsListElement) {
      productsListElement.innerHTML = `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-center text-red-500" colspan="4">
            Erro ao carregar produtos. Tente novamente.
          </td>
        </tr>
      `;
    }
  }
}

// Editar produto
async function editProduct(id) {
  const formContainer = document.getElementById("product-form-container");
  const form = document.getElementById("product-form");
  const productIdInput = document.getElementById("product-id");
  const nameInput = document.getElementById("product-name");
  const descriptionInput = document.getElementById("product-description");
  const priceInput = document.getElementById("product-price");
  const availableInput = document.getElementById("product-available");

  try {
    const response = await fetch(`${API_URL}/items/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao obter dados do produto");
    }

    const product = await response.json();

    // Preencher formulário com dados do produto
    productIdInput.value = product.id;
    nameInput.value = product.name;
    descriptionInput.value = product.description || "";
    priceInput.value = product.price;
    availableInput.checked = product.available;

    // Mostrar formulário
    formContainer.classList.remove("hidden");
    nameInput.focus();
  } catch (error) {
    console.error("Erro ao editar produto:", error);
    alert("Erro ao carregar dados do produto. Tente novamente.");
  }
}

// Excluir produto
async function deleteProduct(id) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao excluir produto");
    }

    // Recarregar lista de produtos
    loadProducts();
  } catch (error) {
    console.error("Erro ao excluir produto:", error);
    alert(error.message || "Erro ao excluir produto. Tente novamente.");
  }
}

// Configurar formulário de produto
function setupProductForm() {
  const addButton = document.getElementById("add-product-button");
  const formContainer = document.getElementById("product-form-container");
  const form = document.getElementById("product-form");
  const cancelButton = document.getElementById("cancel-product");

  // Botão para adicionar produto
  if (addButton) {
    addButton.addEventListener("click", () => {
      // Limpar formulário
      document.getElementById("product-id").value = "";
      document.getElementById("product-name").value = "";
      document.getElementById("product-description").value = "";
      document.getElementById("product-price").value = "";
      document.getElementById("product-available").checked = true;

      // Mostrar formulário
      formContainer.classList.remove("hidden");
      document.getElementById("product-name").focus();
    });
  }

  // Botão para cancelar
  if (cancelButton) {
    cancelButton.addEventListener("click", () => {
      formContainer.classList.add("hidden");
    });
  }

  // Envio do formulário
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const productId = document.getElementById("product-id").value;
      const name = document.getElementById("product-name").value;
      const description = document.getElementById("product-description").value;
      const price = parseFloat(document.getElementById("product-price").value);
      const available = document.getElementById("product-available").checked;

      const productData = {
        name,
        description,
        price,
        available,
      };

      try {
        let response;

        if (productId) {
          // Atualizar produto existente
          response = await fetch(`${API_URL}/items/${productId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
          });
        } else {
          // Criar novo produto
          response = await fetch(`${API_URL}/items`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
          });
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Erro ao salvar produto");
        }

        // Esconder formulário e recarregar lista
        formContainer.classList.add("hidden");
        loadProducts();
      } catch (error) {
        console.error("Erro ao salvar produto:", error);
        alert(error.message || "Erro ao salvar produto. Tente novamente.");
      }
    });
  }
}

// === USUÁRIOS ===
// Carregar usuários
async function loadUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta: ${response.status}`);
    }

    const users = await response.json();

    const usersListElement = document.getElementById("users-list");
    if (!usersListElement) return;

    // Limpar conteúdo anterior
    usersListElement.innerHTML = "";

    if (users.length === 0) {
      usersListElement.innerHTML = `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-center" colspan="5">
            Nenhum usuário encontrado.
          </td>
        </tr>
      `;
      return;
    }

    // Preencher tabela com usuários
    users.forEach((user) => {
      const createdAt = new Date(user.createdAt).toLocaleDateString("pt-BR");
      const row = document.createElement("tr");
      const isSelf = user.id === currentUser.id;
      row.innerHTML = `
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm font-medium text-gray-900">${user.name}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <div class="text-sm text-gray-500">${user.email}</div>
      </td>
      <td class="px-6 py-4 whitespace-nowrap">
        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          user.role === "ADMIN"
            ? "bg-purple-100 text-purple-800"
            : "bg-blue-100 text-blue-800"
        }">
          ${user.role === "ADMIN" ? "Administrador" : "Usuário"}
        </span>
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        ${createdAt}
      </td>
      <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button class="change-role text-blue-600 hover:text-blue-900 mr-2" data-id="${
          user.id
        }" data-role="${user.role}">
          ${user.role === "ADMIN" ? "Tornar Usuário" : "Tornar Admin"}
        </button>
        ${
          !isSelf
            ? `<button class="delete-user text-red-600 hover:text-red-900" data-id="${user.id}">Excluir</button>`
            : ""
        }
      </td>
    `;

      usersListElement.appendChild(row);
    });

    // Adicionar eventos para os botões de alterar tipo
    document.querySelectorAll(".change-role").forEach((button) => {
      button.addEventListener("click", () =>
        changeUserRole(button.dataset.id, button.dataset.role)
      );
    });

    // Adicionar eventos para os botões de excluir usuário
    document.querySelectorAll(".delete-user").forEach((button) => {
      button.addEventListener("click", () => deleteUser(button.dataset.id));
    });
  } catch (error) {
    console.error("Erro ao carregar usuários:", error);
    const usersListElement = document.getElementById("users-list");
    if (usersListElement) {
      usersListElement.innerHTML = `
        <tr>
          <td class="px-6 py-4 whitespace-nowrap text-center text-red-500" colspan="5">
            Erro ao carregar usuários. Tente novamente.
          </td>
        </tr>
      `;
    }
  }
}

// Excluir usuário
async function deleteUser(userId) {
  // Confirmar antes de excluir
  if (
    !confirm(
      "Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita e excluirá também todos os pedidos associados."
    )
  ) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao excluir usuário");
    }

    // Recarregar lista de usuários
    loadUsers();

    // Atualizar o dashboard para refletir a mudança
    loadDashboardData();
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    alert(error.message || "Erro ao excluir usuário. Tente novamente.");
  }
}

// Alterar tipo de usuário
async function changeUserRole(userId, currentRole) {
  const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
  const confirmMessage =
    currentRole === "ADMIN"
      ? "Tem certeza que deseja remover os privilégios de administrador deste usuário?"
      : "Tem certeza que deseja tornar este usuário um administrador?";

  if (!confirm(confirmMessage)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: newRole }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao alterar tipo de usuário");
    }

    // Recarregar lista de usuários
    loadUsers();
  } catch (error) {
    console.error("Erro ao alterar tipo de usuário:", error);
    alert(error.message || "Erro ao alterar tipo de usuário. Tente novamente.");
  }
}

// === PEDIDOS ===
// Carregar pedidos
async function loadOrders(status = null) {
  try {
    let url = `${API_URL}/orders`;
    if (status && status !== "all") {
      url += `?status=${status}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na resposta: ${response.status}`);
    }

    const orders = await response.json();

    const ordersListElement = document.getElementById("orders-list");
    if (!ordersListElement) return;

    // Limpar conteúdo anterior
    ordersListElement.innerHTML = "";

    if (orders.length === 0) {
      ordersListElement.innerHTML = `
        <div class="bg-white p-4 rounded shadow text-center">
          Nenhum pedido encontrado.
        </div>
      `;
      return;
    }

    // Preencher lista com pedidos
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const formattedDate =
        date.toLocaleDateString("pt-BR") +
        " " +
        date.toLocaleTimeString("pt-BR");

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

      const orderCard = document.createElement("div");
      orderCard.className = "bg-white p-4 rounded shadow";
      orderCard.innerHTML = `
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="font-semibold">Pedido #${order.id.substring(0, 8)}</h3>
            <p class="text-sm text-gray-600">${formattedDate}</p>
            <p class="text-sm mt-1">Cliente: <span class="font-medium">${
              order.user.name
            }</span></p>
          </div>
          <div class="flex flex-col items-end">
            <span class="px-2 py-1 rounded text-xs font-semibold ${
              statusColorMap[order.status]
            }">
              ${statusMap[order.status]}
            </span>
            <div class="mt-2 text-right">
              <select class="order-status-select border rounded p-1 text-sm" data-order-id="${
                order.id
              }">
                <option value="PENDING" ${
                  order.status === "PENDING" ? "selected" : ""
                }>Pendente</option>
                <option value="PROCESSING" ${
                  order.status === "PROCESSING" ? "selected" : ""
                }>Em processamento</option>
                <option value="COMPLETED" ${
                  order.status === "COMPLETED" ? "selected" : ""
                }>Concluído</option>
                <option value="CANCELLED" ${
                  order.status === "CANCELLED" ? "selected" : ""
                }>Cancelado</option>
              </select>
            </div>
          </div>
        </div>
        <div class="mb-3">
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

      ordersListElement.appendChild(orderCard);
    });

    // Adicionar eventos para os selects de status
    document.querySelectorAll(".order-status-select").forEach((select) => {
      select.addEventListener("change", (e) => {
        updateOrderStatus(select.dataset.orderId, e.target.value);
      });
    });
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    const ordersListElement = document.getElementById("orders-list");
    if (ordersListElement) {
      ordersListElement.innerHTML = `
        <div class="bg-white p-4 rounded shadow text-center text-red-500">
          Erro ao carregar pedidos. Tente novamente.
        </div>
      `;
    }
  }
}

// Atualizar status do pedido
async function updateOrderStatus(orderId, newStatus) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erro ao atualizar status");
    }

    // Recarregar pedidos mantendo o filtro atual
    const activeFilter = document.querySelector(".order-filter.active");
    const status = activeFilter ? activeFilter.dataset.status : "all";
    loadOrders(status);
  } catch (error) {
    console.error("Erro ao atualizar status do pedido:", error);
    alert(error.message || "Erro ao atualizar status. Tente novamente.");
  }
}

// Configurar filtros de pedidos
function setupOrderFilters() {
  const filterButtons = document.querySelectorAll(".order-filter");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remover classe active de todos os botões
      filterButtons.forEach((btn) => btn.classList.remove("active"));

      // Adicionar classe active ao botão clicado
      button.classList.add("active");

      // Carregar pedidos com o filtro selecionado
      loadOrders(button.dataset.status);
    });
  });
}

// Configurar navegação por tabs
function setupTabs() {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remover estado ativo de todos os botões
      tabButtons.forEach((btn) => {
        btn.classList.remove("border-blue-500", "active");
        btn.classList.add(
          "border-transparent",
          "hover:text-gray-600",
          "hover:border-gray-300"
        );
      });

      // Adicionar estado ativo ao botão clicado
      button.classList.add("border-blue-500", "active");
      button.classList.remove(
        "border-transparent",
        "hover:text-gray-600",
        "hover:border-gray-300"
      );

      // Esconder todos os conteúdos
      tabContents.forEach((content) => {
        content.classList.add("hidden");
      });

      // Mostrar o conteúdo correspondente
      const tabName = button.id.replace("tab-", "");
      const tabContentId = `tab-content-${tabName}`;
      document.getElementById(tabContentId).classList.remove("hidden");

      // Carregar dados específicos da tab
      activeTab = tabName;
      loadTabData(tabName);
    });
  });
}

// Carregar dados baseado na tab ativa
function loadTabData(tabName) {
  switch (tabName) {
    case "dashboard":
      loadDashboardData();
      break;
    case "products":
      loadProducts();
      break;
    case "users":
      loadUsers();
      break;
    case "orders":
      loadOrders();
      setupOrderFilters();
      break;
  }
}

// Inicializar a página
document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  setupTabs();
  setupProductForm();
});

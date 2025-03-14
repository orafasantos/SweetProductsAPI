// js/modules/auth.js

// Funções exportadas
export function handleLoginSuccess(
  data,
  mainContent,
  authContainer,
  adminPanelLink
) {
  const currentUser = data.user;
  const token = data.token;

  // Salvar token e informações do usuário no localStorage
  localStorage.setItem("token", token);
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // Mostrar conteúdo principal e esconder autenticação
  authContainer.classList.add("hidden");
  mainContent.classList.remove("hidden");

  // Verificar se o usuário é admin e mostrar o painel admin
  if (currentUser.role === "ADMIN") {
    adminPanelLink.classList.remove("hidden");
  } else {
    adminPanelLink.classList.add("hidden");
  }

  return { currentUser, token };
}

export async function login(email, password, apiUrl) {
  const response = await fetch(`${apiUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return { response, data: await response.json() };
}

export async function register(name, email, password, apiUrl) {
  const response = await fetch(`${apiUrl}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  return { response, data: await response.json() };
}

export async function getCurrentUser(token, apiUrl) {
  const response = await fetch(`${apiUrl}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Token inválido ou expirado");
  }

  return await response.json();
}

// Funções de validação
export function clearErrorMessages(formElement) {
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((message) => message.remove());

  // Remover bordas vermelhas
  const inputs = formElement.querySelectorAll("input");
  inputs.forEach((input) => input.classList.remove("border-red-500"));
}

export function showFieldError(fieldId, errorMessage) {
  const field = document.getElementById(fieldId);
  if (field) {
    // Adicionar mensagem de erro abaixo do campo
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message text-red-500 text-sm mt-1";
    errorDiv.textContent = errorMessage;
    field.parentNode.appendChild(errorDiv);

    // Destacar o campo com erro
    field.classList.add("border-red-500");

    // Remover destaque quando o usuário começar a digitar novamente
    field.addEventListener(
      "input",
      function () {
        this.classList.remove("border-red-500");
        const errorMsg = this.parentNode.querySelector(".error-message");
        if (errorMsg) errorMsg.remove();
      },
      { once: true }
    );
  }
}

export function handleValidationError(data) {
  if (data.message && data.message.includes("fewer than 6 characters")) {
    showFieldError(
      "login-password",
      "A senha deve ter pelo menos 6 caracteres"
    );
  } else if (data.message) {
    alert(data.message);
  }
}

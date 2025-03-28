// Elementos DOM
const keywordInput = document.getElementById("keywordInput");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("resultsContainer");
const loadingIndicator = document.getElementById("loadingIndicator");

// Funções auxiliares
function validateKeyword(keyword) {
  if (!keyword.trim()) {
    showError("Por favor, digite um termo de busca");
    return false;
  }
  if (keyword.length < 3) {
    showError("Digite pelo menos 3 caracteres");
    return false;
  }
  return true;
}

function toggleLoading(show) {
  loadingIndicator.classList.toggle("hidden", !show);
  searchButton.disabled = show;
}

function showError(message) {
  resultsContainer.innerHTML = `
    <div class="error-message">
      ⚠️ ${message}
      <p>Tente novamente mais tarde ou use um termo diferente</p>
    </div>
  `;
}

function hideError() {
  const errorElement = document.querySelector(".error-message");
  if (errorElement) errorElement.remove();
}

// Função aprimorada para garantir URLs válidos da Amazon
function getAmazonProductLink(link, asin) {
  // Se o link já estiver correto
  if (link && (link.startsWith('https://www.amazon.com/') || link.startsWith('http://www.amazon.com/'))) {
    try {
      const url = new URL(link);
      // Remove parâmetros de tracking e mantém apenas o caminho principal
      const cleanPath = url.pathname.split('/ref=')[0];
      return `https://www.amazon.com${cleanPath}`;
    } catch {
      // Se falhar ao criar URL, continua para os fallbacks
    }
  }
  
  // Se tiver um ASIN válido
  if (asin && asin.length === 10) { // ASINs da Amazon têm 10 caracteres
    return `https://www.amazon.com/dp/${asin}`;
  }
  
  // Se o link contiver /dp/ ou /gp/product/ mas não estiver completo
  if (link && (link.includes('/dp/') || link.includes('/gp/product/'))) {
    const match = link.match(/(\/dp\/[A-Z0-9]{10}|\/gp\/product\/[A-Z0-9]{10})/);
    if (match) {
      return `https://www.amazon.com${match[0]}`;
    }
  }
  
  // Fallback seguro
  return 'https://www.amazon.com';
}

// Função para exibir produtos
function displayProducts(products) {
  if (!products || products.length === 0) {
    resultsContainer.innerHTML =
      '<p class="error-message">Nenhum produto encontrado. Tente outro termo.</p>';
    return;
  }

  resultsContainer.innerHTML = products
    .map((product) => {
      // Obtém o ASIN do atributo data-asin ou extrai do link se existir
      const asin = product.asin || 
                   (product.link ? product.link.match(/(\/dp\/|\/gp\/product\/)([A-Z0-9]{10})/)?.[2] : null);
      
      // Corrige o link do produto
      const productLink = getAmazonProductLink(product.link, asin);
      
      return `
        <div class="product-card" data-asin="${asin || ''}">
          <div class="product-image">
            <img src="${product.imageUrl || "placeholder.jpg"}" alt="${
              product.title || "Produto sem nome"
            }" loading="lazy">
          </div>
          <div class="product-info">
            <h3 class="product-title">${product.title || "Produto sem nome"}</h3>
            <div class="product-price">${
              product.price || "Preço não disponível"
            }</div>
            ${
              product.rating
                ? `
              <div class="product-rating">
                ⭐ ${product.rating}
                ${
                  product.reviewCount ? `<span>(${product.reviewCount})</span>` : ""
                }
              </div>
            `
                : ""
            }
            <a href="${productLink}" 
               target="_blank" 
               rel="noopener noreferrer nofollow"
               class="product-link">
              Ver na Amazon
            </a>
          </div>
        </div>
      `;
    })
    .join("");
}

// Função principal de busca
async function fetchProducts(keyword) {
  try {
    toggleLoading(true);
    hideError();

    const response = await fetch(
      `https://amazon-scraper-production-9ec4.up.railway.app/api/scrape?keyword=${encodeURIComponent(
        keyword
      )}`
    );

    if (!response.ok) {
      throw new Error(`Erro na busca: ${response.status}`);
    }

    const data = await response.json();
    displayProducts(data.products || data);
  } catch (error) {
    showError("Falha ao buscar produtos. " + error.message);
    console.error("Error:", error);
  } finally {
    toggleLoading(false);
  }
}

// Event Listeners
searchButton.addEventListener("click", () => {
  const keyword = keywordInput.value.trim();
  if (validateKeyword(keyword)) fetchProducts(keyword);
});

keywordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const keyword = keywordInput.value.trim();
    if (validateKeyword(keyword)) fetchProducts(keyword);
  }
});

// Elementos DOM
const keywordInput = document.getElementById("keywordInput");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("resultsContainer");
const loadingIndicator = document.getElementById("loadingIndicator");

// Funções auxiliares (colocar no início)
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

// Função para garantir URLs válidos da Amazon
function getAmazonProductLink(link, asin) {
  // Se já for um link completo da Amazon
  if (link && link.includes('amazon.com')) {
    try {
      const url = new URL(link);
      // Remove parâmetros de tracking e mantém apenas o pathname
      return `https://www.amazon.com${url.pathname}`;
    } catch {
      // Se falhar ao criar URL, usa o ASIN como fallback
    }
  }
  
  // Se não tiver link mas tiver ASIN
  if (asin) {
    return `https://www.amazon.com/dp/${asin}`;
  }
  
  // Fallback caso não tenha nenhum dos dois
  return '#';
}

// Função para exibir produtos (versão corrigida)
function displayProducts(products) {
  if (!products || products.length === 0) {
    resultsContainer.innerHTML =
      '<p class="error-message">Nenhum produto encontrado. Tente outro termo.</p>';
    return;
  }

  resultsContainer.innerHTML = products
    .map(
      (product) => {
        // Corrige o link do produto
        const productLink = getAmazonProductLink(product.link, product.asin);
        
        return `
          <div class="product-card" data-asin="${product.asin || ''}">
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
                 rel="noopener noreferrer"
                 class="product-link">
                Ver na Amazon
              </a>
            </div>
          </div>
        `;
      }
    )
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
    showError(error.message);
    console.error("Error:", error);
  } finally {
    toggleLoading(false);
  }
}

// Event Listeners (colocar no final)
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

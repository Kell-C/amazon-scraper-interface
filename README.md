# Amazon Scraper Interface - Frontend

Interface web para pesquisa e visualização de produtos da Amazon, consumindo uma API de scraping.


## ✨ Funcionalidades

- Busca de produtos por palavra-chave
- Exibição de cards com:
  - Imagem do produto
  - Título
  - Preço
  - Avaliação (se disponível)
- Design responsivo
- Feedback visual durante carregamento

## 🛠️ Tecnologias

- **Frontend**:
  - HTML5, CSS3, JavaScript Vanilla
  - Fetch API para consumo de dados
  - GitHub Pages para hospedagem

- **Backend**:
  - (Bun + Puppeteer)
  - Hospedado no Railway


## 🌐 Arquitetura

```
frontend/
├── index.html          # Estrutura principal
├── style.css           # Estilos globais
└──  main.js            # Lógica da aplicação           
```

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

**Nota**: Este frontend requer a [API de Scraping]([https://amazon-scraper-production-9ec4.up.railway.app/]) para funcionar corretamente.

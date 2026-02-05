// config.js - VERSÃO JAVASCRIPT
export const getApiBaseUrl = () => {
    // Se estiver no servidor (SSR) ou ambiente sem window
    if (typeof window === 'undefined') {
      return 'http://localhost:3333';
    }
    
    // No navegador
    const hostname = window.location.hostname;
    
    // Se for localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3333';
    }
    
    // Se for um IP (como 192.168.x.x)
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      return `http://${hostname}:3333`;
    }
    
    // Fallback
    return 'http://localhost:3333';
  };
  
  // Exporta como constante ou função
  export const API_BASE_URL = getApiBaseUrl();
  export const DERIVED_CATEGORY_ID = "bd9b9cc9-05c7-4f71-b63a-bc5c3ed86db8";
  export const IGREDIENT_CATEGORY_ID = "22576d57-2863-414c-80da-660beb93545e";
  
  // OU exporte só a função e use onde precisar
// utils/storage.ts
export const storage = {
    getCart: () => {
      if (typeof window === 'undefined') return []
      const saved = localStorage.getItem('restaurant_cart')
      return saved ? JSON.parse(saved) : []
    },
  
    saveCart: (cart: any[]) => {
      if (typeof window === 'undefined') return
      localStorage.setItem('restaurant_cart', JSON.stringify(cart))
    },
  
    clearCart: () => {
      if (typeof window === 'undefined') return
      localStorage.removeItem('restaurant_cart')
    }
  }
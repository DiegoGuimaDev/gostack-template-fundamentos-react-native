import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const products = await AsyncStorage.getItem('@GoMarket:products');

      if(products) {
        setProducts(JSON.parse(products));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async (product: Product) => {

    const oldProduct = products.find(p => p.id === product.id);
    if(oldProduct) {
      oldProduct.quantity += 1;
      setProducts([
        ...products.filter(p => p.id !== oldProduct.id),
        oldProduct
      ])
    } else {
        setProducts([
          ...products,
          {
            ...product,
            quantity: 1
          }
        ])
    }
    await AsyncStorage.setItem('@GoMarket:products',JSON.stringify(products));
  }, [products]);

  const increment = useCallback(async id => {
    const product = products.find(p => p.id === id);
    if(product) {
      product.quantity += 1;
      setProducts([
        ...products.filter(p => p.id !== id),
        product
      ])
    }
    await AsyncStorage.setItem('@GoMarket:products',JSON.stringify(products));
  }, [products]);

  const decrement = useCallback(async id => {
    const product = products.find(p => p.id === id);
    if(product) {
      product.quantity -= 1;
      setProducts([
        ...products.filter(p => p.id !== id),
        product
      ])
    }
    await AsyncStorage.setItem('@GoMarket:products',JSON.stringify(products));
  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };

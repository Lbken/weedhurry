import React, { createContext, useState, useEffect } from 'react';

// Create a Context for the cart
export const CartContext = createContext();

export const CartProvider = ({ children }) => {

  // Load cart items from localStorage on initial load
  const loadCartFromLocalStorage = () => {
    const savedCartItems = JSON.parse(localStorage.getItem('cartItems'));
    return savedCartItems ? savedCartItems : [];
  };

  // State to hold cart items, initialized from localStorage
  const [cartItems, setCartItems] = useState(loadCartFromLocalStorage);

  // Save cart items to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Function to get the dispensary name of the vendor from the cart
  const getDispensaryName = () => {
    return cartItems.length > 0 ? cartItems[0].vendorName : null;
  };

  // Function to check if a product can be added to the cart
  const canAddToCart = (newProduct) => {
    if (cartItems.length === 0) {
      return true; // If the cart is empty, any product can be added
    }
    const existingVendor = cartItems[0].vendorId;
    return existingVendor === newProduct.vendorId;
  };

  const addToCart = (product) => {
    console.log("Attempting to add product to cart:", product);
    console.log("Current cart items before adding:", cartItems);
  
    if (canAddToCart(product)) {
      setCartItems((prevItems) => {
        const uniqueKey = `${product._id}-${product.strain}-${product.amount}`;
        const existingItem = prevItems.find(
          (item) => `${item._id}-${item.strain}-${item.amount}` === uniqueKey
        );
  
        if (existingItem) {
          console.log("Product already in cart, incrementing quantity:", existingItem);
          return prevItems.map((item) =>
            `${item._id}-${item.strain}-${item.amount}` === uniqueKey
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          console.log("Product not in cart, adding new product:", product);
          // Ensure vendorId is properly handled
          const vendorId = product.vendorId?.toString() || product._id?.toString();
          return [
            ...prevItems,
            {
              ...product,
              quantity: 1,
              productId: product._id?.toString(),  // Ensure string conversion
              vendorId: vendorId,  // Use consistent vendorId
              vendorName: product.dispensaryName || product.vendorName, // Handle both formats
              logoUrl: product.logoUrl,
              orderType: product.orderType,
              _id: product._id?.toString(),  // Ensure _id is consistent
              variation: {
                ...product.variation,
                strain: product.variation?.strain || product.strain
              },
              strain: product.variation?.strain || product.strain 
            },
          ];
        }
      });
    } else {
      console.warn(
        `Cannot add product from different vendor (${product.vendorName}). Current vendor: ${cartItems[0]?.vendorName}`
      );
      alert(
        `You can only add products from the same vendor (${cartItems[0]?.vendorName}). Please clear your cart to add items from a different vendor.`
      );
    }
  };
  
  
  

  // Remove product from the cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) =>
      prevItems.filter(item => item._id !== productId)
    );
  };

  // Increment quantity of a specific item in the cart
  const incrementItem = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  // Decrement quantity of a specific item in the cart
  const decrementItem = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item._id === productId && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  // Update quantity of a specific item in the cart manually
  const updateItemQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) =>
      prevItems.map(item =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Clear all items from the cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total price of items in the cart
  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const itemPrice = item.salePrice || item.price || 0; // Fallback to 0 if undefined
      return acc + itemPrice * (item.quantity || 1); // Fallback quantity to 1
    }, 0);
  };
  

  // Get the total number of items in the cart (quantity, not unique items)
  const getItemCount = () => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Provide cart data and functions to the rest of the app
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    incrementItem,
    decrementItem,
    updateItemQuantity,
    clearCart,
    calculateTotal,
    getItemCount,
    getDispensaryName,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

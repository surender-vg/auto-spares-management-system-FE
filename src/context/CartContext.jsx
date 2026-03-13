import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const cartItemsFromStorage = localStorage.getItem('cartItems')
            ? JSON.parse(localStorage.getItem('cartItems'))
            : [];

        const normalizedItems = cartItemsFromStorage.map((item) => {
            const productId = item.product || item._id || item.id;
            return {
                ...item,
                product: productId,
                qty: Number(item.qty || 1),
            };
        });

        if (normalizedItems.length !== cartItemsFromStorage.length ||
            normalizedItems.some((item, index) => item.product !== cartItemsFromStorage[index]?.product || item.qty !== cartItemsFromStorage[index]?.qty)) {
            localStorage.setItem('cartItems', JSON.stringify(normalizedItems));
        }

        setCartItems(normalizedItems);
    }, []);

    const addToCart = async (id, qty) => {
        const { data } = await axios.get(`/api/products/${id}`);

        if (data.countInStock === 0) {
            throw new Error('This product is out of stock');
        }

        const item = {
            product: data._id,
            name: data.name,
            image: data.image,
            price: data.price,
            countInStock: data.countInStock,
            qty,
        };

        setCartItems((prevItems) => {
            const existItem = prevItems.find((x) => x.product === item.product);

            let newItems;
            if (existItem) {
                newItems = prevItems.map((x) =>
                    x.product === existItem.product ? item : x
                );
            } else {
                newItems = [...prevItems, item];
            }
            localStorage.setItem('cartItems', JSON.stringify(newItems));
            return newItems;
        });
    };

    const removeFromCart = (id) => {
        setCartItems((prevItems) => {
            const newItems = prevItems.filter((x) => x.product !== id);
            localStorage.setItem('cartItems', JSON.stringify(newItems));
            return newItems;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cartItems');
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);

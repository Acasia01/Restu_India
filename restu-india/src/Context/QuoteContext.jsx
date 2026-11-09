import React, { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-hot-toast";
import { getImageUrl } from "../Pages/Admin/utils/adminUtils";

const QuoteContext = createContext(null);

export const useQuote = () => useContext(QuoteContext);

export const QuoteProvider = ({ children }) => {
  const [quoteItems, setQuoteItems] = useState([]);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("restu_quote_items");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setQuoteItems(parsed);
        }
      } catch (e) {
        console.error("Error parsing quote items:", e);
      }
    }
  }, []);

  // Save to LocalStorage
  const saveItems = (newItems) => {
    setQuoteItems(newItems);
    localStorage.setItem("restu_quote_items", JSON.stringify(newItems));
  };

  const addToQuote = (product, quantity = 1) => {
    if (!product) return;

    const productId = String(product._id || product.id || "");
    const existingIndex = quoteItems.findIndex(
      (item) => String(item.id || item._id) === productId
    );

    const rawImage = product.images?.[0] || product.image || "";
    const resolvedImage = rawImage
      ? (typeof rawImage === "string" && (rawImage.startsWith("http") || rawImage.startsWith("/") || rawImage.startsWith("uploads"))
          ? getImageUrl(rawImage)
          : rawImage)
      : "";
    const parsedPrice = Number(String(product.price || 0).replace(/[^0-9.]/g, "")) || 0;

    let updatedItems;

    if (existingIndex !== -1) {
      const existingItem = quoteItems[existingIndex];
      const newQty = (Number(existingItem.qty) || 1) + Number(quantity || 1);
      const itemPrice = Number(existingItem.price || parsedPrice || 0);

      const updatedItem = {
        ...existingItem,
        qty: newQty,
        totalPrice: itemPrice * newQty,
      };

      updatedItems = [...quoteItems];
      updatedItems[existingIndex] = updatedItem;

      toast.success("Added to Quote");
    } else {
      const initialQty = Number(quantity || 1);
      const newItem = {
        ...product,
        id: productId,
        _id: productId,
        name: product.name || "Medical Product",
        image: resolvedImage || rawImage,
        rawImage: rawImage,
        price: parsedPrice,
        qty: initialQty,
        totalPrice: parsedPrice * initialQty,
        category: product.category || { name: "Equipment" },
        code: product.code || "",
      };

      updatedItems = [...quoteItems, newItem];
      toast.success("Added to Quote");
    }

    saveItems(updatedItems);
  };

  const removeFromQuote = (productId) => {
    const idStr = String(productId);
    const filtered = quoteItems.filter(
      (item) => String(item.id || item._id) !== idStr
    );
    toast.error("Removed from quotation");
    saveItems(filtered);
  };

  const updateQty = (productId, qty) => {
    const idStr = String(productId);
    const newQty = Number(qty);
    if (newQty <= 0) {
      removeFromQuote(productId);
      return;
    }

    const updated = quoteItems.map((item) => {
      if (String(item.id || item._id) === idStr) {
        const itemPrice = Number(item.price || 0);
        return {
          ...item,
          qty: newQty,
          totalPrice: itemPrice * newQty,
        };
      }
      return item;
    });

    saveItems(updated);
  };

  const clearQuote = () => {
    saveItems([]);
  };

  const isInQuote = (productId) => {
    const idStr = String(productId);
    return quoteItems.some((item) => String(item.id || item._id) === idStr);
  };

  const totalCount = quoteItems.reduce((acc, item) => acc + (Number(item.qty) || 1), 0);
  const totalItemsCount = quoteItems.length;
  const totalAmount = quoteItems.reduce(
    (acc, item) =>
      acc + (Number(item.totalPrice) || Number(item.price || 0) * (Number(item.qty) || 1)),
    0
  );

  return (
    <QuoteContext.Provider
      value={{
        quoteItems,
        addToQuote,
        addQuoteItem: addToQuote,
        removeFromQuote,
        updateQty,
        clearQuote,
        isInQuote,
        totalCount,
        totalItemsCount,
        totalAmount,
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
};

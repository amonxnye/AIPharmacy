"use client";

import { useState } from "react";
import { Search, Trash2, Plus, Minus, CreditCard } from "lucide-react";

const products = [
  { id: 1, name: "Paracetamol 500mg", price: 100, stock: 450 },
  { id: 2, name: "Amoxicillin 250mg", price: 350, stock: 320 },
  { id: 3, name: "Ibuprofen 400mg", price: 150, stock: 280 },
  { id: 4, name: "Metformin 500mg", price: 200, stock: 150 },
  { id: 5, name: "Omeprazole 20mg", price: 250, stock: 200 },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.18; // 18% VAT
  const total = subtotal + tax;

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left Side - Product Selection */}
      <div className="flex flex-1 flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search and add products to cart
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or scan barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-900/5">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className="rounded-lg border-2 border-gray-200 p-4 text-left transition-all hover:border-teal-500 hover:shadow-md"
              >
                <div className="mb-2 flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-teal-50 to-teal-100">
                  <span className="text-4xl">💊</span>
                </div>
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <p className="mt-1 text-sm text-gray-500">Stock: {product.stock}</p>
                <p className="mt-2 text-lg font-bold text-teal-600">
                  UGX {product.price.toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Cart & Checkout */}
      <div className="flex w-96 flex-col rounded-xl bg-white shadow-lg ring-1 ring-gray-900/5">
        <div className="border-b border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900">Current Sale</h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">
                  No items in cart. Search and add products to get started.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      UGX {item.price.toLocaleString()} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="rounded-lg bg-gray-100 p-1 hover:bg-gray-200"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="rounded-lg bg-gray-100 p-1 hover:bg-gray-200"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 rounded-lg bg-red-100 p-1 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">UGX {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (18%)</span>
              <span className="font-medium">UGX {tax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
              <span>Total</span>
              <span className="text-teal-600">UGX {total.toLocaleString()}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 font-medium text-white shadow-sm transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <CreditCard className="h-5 w-5" />
            Complete Sale
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Stripe from "stripe";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface Price {
  id: string;
  unit_amount: number | null;
  product: string;
  recurring: {
    interval: string;
    interval_count: number;
    usage_type: string;
    aggregate_usage: string | null;
    trial_period_days: number | null;
  };
}

interface ProductWithPrices extends Stripe.Product {
  prices?: Price[];
}

const ProductsList = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<ProductWithPrices[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/subscriptions/plans");
      const data = await response.json();

      // Combine products with their prices
      const productsWithPrices = data.products.map(
        (product: Stripe.Product) => ({
          ...product,
          prices: data.prices.filter(
            (price: Price) => price.product === product.id
          ),
        })
      );

      console.log("Products with prices:", productsWithPrices); // Debug log
      setProducts(productsWithPrices);
    };
    fetchProducts();
  }, []);

  const formatPrice = (amount: number | null) => {
    if (amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          planId,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else if (data.success) {
        // Handle free plan subscription
        toast.success("Successfully subscribed to free plan!");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to process subscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-300 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {product.name}
              </h3>
              {product.description && (
                <p className="text-gray-600 mb-4">{product.description}</p>
              )}

              <div className="space-y-3">
                {product.prices && product.prices.length > 0 ? (
                  product.prices.map((price) => (
                    <div
                      key={price.id}
                      className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-gray-800">
                            {formatPrice(price.unit_amount)}
                          </span>
                          <span className="text-gray-600 ml-1">
                            /{price.recurring.interval}
                          </span>
                        </div>
                        <button
                          onClick={() => handleSubscribe(product.id)}
                          disabled={isLoading}
                          className={`${
                            isLoading
                              ? "bg-gray-400"
                              : "bg-blue-600 hover:bg-blue-700"
                          } text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center`}
                        >
                          {isLoading ? (
                            <>
                              <span className="animate-spin mr-2">⚪</span>
                              Processing...
                            </>
                          ) : (
                            "Subscribe"
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 italic">No pricing available</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;

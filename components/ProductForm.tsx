"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createSubscriptionPlan } from "@/lib/paypal";

export default function ProductForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    documentsLimit: "",
    questionsLimit: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSubscriptionPlan({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        documentsLimit: parseInt(formData.documentsLimit),
        questionsLimit: parseInt(formData.questionsLimit),
        interval: "MONTH",
      });

      toast({
        title: "Subscription plan created successfully",
      });

      setFormData({
        name: "",
        description: "",
        price: "",
        documentsLimit: "",
        questionsLimit: "",
      });
      router.refresh();
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      toast({
        title: "Failed to create subscription plan",
        description: "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Plan Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({
              ...formData,
              description: e.target.value,
            })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="price">Monthly Price (USD)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="documentsLimit">Documents per Month</Label>
        <Input
          id="documentsLimit"
          type="number"
          value={formData.documentsLimit}
          onChange={(e) =>
            setFormData({ ...formData, documentsLimit: e.target.value })
          }
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="questionsLimit">Questions per Month</Label>
        <Input
          id="questionsLimit"
          type="number"
          value={formData.questionsLimit}
          onChange={(e) =>
            setFormData({ ...formData, questionsLimit: e.target.value })
          }
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Plan"}
      </Button>
    </form>
  );
}

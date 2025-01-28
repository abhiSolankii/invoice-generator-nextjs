"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Image, X, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { InvoiceData, InvoiceItem } from "@/types";

const page = () => {
  const [formData, setFormData] = useState<InvoiceData>({
    logoUrl: "",
    invoiceNumber: "",
    from: "",
    billTo: "",
    shipTo: "",
    invoiceDate: new Date(),
    paymentTerms: "",
    dueDate: new Date(),
    poNumber: 0,
    items: [],
    taxAmount: 0,
    taxPercentage: 0,
    discountAmount: 0,
    discountPercentage: 0,
    shippingAmount: 0,
    totalAmount: 0,
    amountPaid: 0,
    balanceDue: 0,
    notes: "",
    terms: "",
    currency: "USD",
  });

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          logoUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateItemAmount = (
    quantity: number,
    rate: number,
    taxPercentage: number
  ) => {
    const baseAmount = quantity * rate;
    const taxAmount = (baseAmount * taxPercentage) / 100;
    return {
      amount: baseAmount,
      taxAmount: taxAmount,
    };
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          name: "",
          description: "",
          quantity: 0,
          rate: 0,
          amount: 0,
          taxAmount: 0,
          taxPercentage: 0,
        },
      ],
    }));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    if (field === "quantity" || field === "rate" || field === "taxPercentage") {
      const { amount, taxAmount } = calculateItemAmount(
        field === "quantity" ? value : newItems[index].quantity,
        field === "rate" ? value : newItems[index].rate,
        field === "taxPercentage" ? value : newItems[index].taxPercentage
      );
      newItems[index].amount = amount;
      newItems[index].taxAmount = taxAmount;
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  // Calculate totals whenever relevant values change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const totalTaxAmount = formData.items.reduce(
      (sum, item) => sum + item.taxAmount,
      0
    );
    const discountAmount = (subtotal * formData.discountPercentage) / 100;
    const totalAmount =
      subtotal + totalTaxAmount - discountAmount + formData.shippingAmount;
    const balanceDue = totalAmount - formData.amountPaid;

    setFormData((prev) => ({
      ...prev,
      taxAmount: totalTaxAmount,
      discountAmount,
      totalAmount,
      balanceDue,
    }));
  }, [
    formData.items,
    formData.discountPercentage,
    formData.shippingAmount,
    formData.amountPaid,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Convert the logo to a file if it's a base64 string
      if (formData.logoUrl.startsWith("data:")) {
        const response = await fetch(formData.logoUrl);
        const blob = await response.blob();
        formDataToSend.append("logo", blob, "logo.png");
      }

      // Append all other form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== "logoUrl") {
          if (
            typeof value === "object" &&
            !Array.isArray(value) &&
            !(value instanceof Date)
          ) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      const response = await fetch("/api/invoices", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) throw new Error("Failed to create invoice");

      toast.success("Invoice created successfully!");
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  const calculateTax = (subtotal: number) => {
    if (formData.taxAmount) return formData.taxAmount;
    if (formData.taxPercentage)
      return (subtotal * formData.taxPercentage) / 100;
    return 0;
  };

  const calculateDiscount = (subtotal: number) => {
    if (formData.discountAmount) return formData.discountAmount;
    if (formData.discountPercentage)
      return (subtotal * formData.discountPercentage) / 100;
    return 0;
  };

  // Tax and Discount Components
  const TaxInputSection = () => (
    <div className="space-y-2 border-b pb-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Tax:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                taxAmount: prev.taxPercentage ? undefined : prev.taxAmount || 0,
                taxPercentage: prev.taxAmount
                  ? undefined
                  : prev.taxPercentage || 0,
              }));
            }}
            className="text-sm text-blue-600"
          >
            Switch to{" "}
            {formData.taxAmount !== undefined ? "Percentage" : "Amount"}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-32 px-2 py-1 border rounded"
          value={
            formData.taxAmount !== undefined
              ? formData.taxAmount
              : formData.taxPercentage || ""
          }
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            setFormData((prev) => ({
              ...prev,
              [formData.taxAmount !== undefined
                ? "taxAmount"
                : "taxPercentage"]: value,
            }));
          }}
        />
        <span>{formData.taxAmount !== undefined ? "₹" : "%"}</span>
      </div>
    </div>
  );

  const DiscountInputSection = () => (
    <div className="space-y-2 border-b pb-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Discount:</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                discountAmount: prev.discountPercentage
                  ? undefined
                  : prev.discountAmount || 0,
                discountPercentage: prev.discountAmount
                  ? undefined
                  : prev.discountPercentage || 0,
              }));
            }}
            className="text-sm text-blue-600"
          >
            Switch to{" "}
            {formData.discountAmount !== undefined ? "Percentage" : "Amount"}
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          className="w-32 px-2 py-1 border rounded"
          value={
            formData.discountAmount !== undefined
              ? formData.discountAmount
              : formData.discountPercentage || ""
          }
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            setFormData((prev) => ({
              ...prev,
              [formData.discountAmount !== undefined
                ? "discountAmount"
                : "discountPercentage"]: value,
            }));
          }}
        />
        <span>{formData.discountAmount !== undefined ? "₹" : "%"}</span>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-start">
        {/* Logo Upload */}
        <div className="w-48 h-48 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          <label htmlFor="logo-upload" className="cursor-pointer">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Logo"
                className="max-w-full h-auto"
              />
            ) : (
              <div className="text-center">
                <Image className="w-12 h-12 mx-auto text-gray-400" />
                <span>Add Logo</span>
              </div>
            )}
          </label>
        </div>

        {/* Invoice Header */}
        <div className="text-right space-y-2">
          <h1 className="text-4xl font-bold">INVOICE</h1>
          <input
            type="text"
            value={formData.invoiceNumber}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                invoiceNumber: e.target.value,
              }))
            }
            placeholder="Invoice Number"
            className="border p-2 rounded"
          />
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              From
            </label>
            <textarea
              value={formData.from}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, from: e.target.value }))
              }
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bill To
            </label>
            <textarea
              value={formData.billTo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, billTo: e.target.value }))
              }
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ship To
            </label>
            <textarea
              value={formData.shipTo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shipTo: e.target.value }))
              }
              className="mt-1 block w-full border rounded-md shadow-sm p-2"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Invoice Date
              </label>
              <DatePicker
                selected={formData.invoiceDate}
                onChange={(date: Date) =>
                  setFormData((prev) => ({ ...prev, invoiceDate: date }))
                }
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <DatePicker
                selected={formData.dueDate}
                onChange={(date: Date) =>
                  setFormData((prev) => ({ ...prev, dueDate: date }))
                }
                className="mt-1 block w-full border rounded-md shadow-sm p-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Items</h2>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Item</th>
              <th className="p-2 text-left">Description</th>
              <th className="p-2 text-right">Quantity</th>
              <th className="p-2 text-right">Rate</th>
              <th className="p-2 text-right">Tax %</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {formData.items.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    className="w-full border rounded p-1"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(index, "quantity", Number(e.target.value))
                    }
                    className="w-full border rounded p-1 text-right"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) =>
                      updateItem(index, "rate", Number(e.target.value))
                    }
                    className="w-full border rounded p-1 text-right"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={item.taxPercentage}
                    onChange={(e) =>
                      updateItem(index, "taxPercentage", Number(e.target.value))
                    }
                    className="w-full border rounded p-1 text-right"
                  />
                </td>
                <td className="p-2 text-right">
                  {formData.currency} {item.amount.toFixed(2)}
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        items: prev.items.filter((_, i) => i !== index),
                      }))
                    }
                    className="text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 text-blue-600"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Totals */}
      <div className="space-y-4 w-full md:w-96 ml-auto mt-8">
        <TaxInputSection />
        <DiscountInputSection />
        <div className="space-y-2 pt-4">
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span>₹ {formData.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Amount Paid:</span>
            <input
              type="number"
              className="w-32 px-2 py-1 border rounded text-right"
              value={formData.amountPaid}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setFormData((prev) => ({
                  ...prev,
                  amountPaid: value,
                  balanceDue: prev.totalAmount - value,
                }));
              }}
            />
          </div>
          <div className="flex justify-between font-bold">
            <span>Balance Due:</span>
            <span>₹ {formData.balanceDue.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <div className="space-y-4 w-72 ml-auto">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>
            {formData.currency}{" "}
            {(
              formData.totalAmount -
              formData.taxAmount +
              formData.discountAmount -
              formData.shippingAmount
            ).toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Discount %:</span>
          <input
            type="number"
            value={formData.discountPercentage}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                discountPercentage: Number(e.target.value),
              }))
            }
            className="w-20 border rounded p-1 text-right"
          />
        </div>
        <div className="flex justify-between">
          <span>Shipping:</span>
          <input
            type="number"
            value={formData.shippingAmount}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                shippingAmount: Number(e.target.value),
              }))
            }
            className="w-20 border rounded p-1 text-right"
          />
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>
            {formData.currency} {formData.totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Amount Paid:</span>
          <input
            type="number"
            value={formData.amountPaid}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                amountPaid: Number(e.target.value),
              }))
            }
            className="w-20 border rounded p-1 text-right"
          />
        </div>
        <div className="flex justify-between font-bold">
          <span>Balance Due:</span>
          <span>
            {formData.currency} {formData.balanceDue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Notes and Terms */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="mt-1 block w-full border rounded-md shadow-sm p-2"
            rows={3}
            placeholder="Additional notes..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Terms & Conditions
          </label>
          <textarea
            value={formData.terms}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, terms: e.target.value }))
            }
            className="mt-1 block w-full border rounded-md shadow-sm p-2"
            rows={3}
            placeholder="Terms and conditions..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Generate Invoice
        </button>
      </div>
    </form>
  );
};

export default page;

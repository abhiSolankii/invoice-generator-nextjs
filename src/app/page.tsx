"use client";
import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Image, X, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import { Invoice, InvoiceItem } from "@/types";

const page = () => {
  const currencyOptions = [
    "USD",
    "INR",
    "EUR",
    "GBP",
    "AUD",
    "CAD",
    "JPY",
    "CNY",
    "SGD",
    "CHF",
  ];

  const [formData, setFormData] = useState<Invoice>({
    _id: "",
    userId: "",
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
    taxPercentage: 0,
    discountPercentage: 0,
    shippingAmount: 0,
    totalAmount: 0,
    amountPaid: 0,
    balanceDue: 0,
    notes: "",
    terms: "",
    currency: "USD",
  });
  console.log(formData);
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
  //Calculation starts
  // 1.  Item Amount Calculator - Replace existing calculateItemAmount function
  const calculateItemAmount = (
    quantity: number,
    rate: number,
    taxPercentage: number
  ) => {
    const baseAmount = quantity * rate;
    const itemTaxAmount = (baseAmount * taxPercentage) / 100;
    const totalItemAmount = baseAmount + itemTaxAmount;
    return {
      baseAmount,
      itemTaxAmount,
      totalItemAmount,
    };
  };

  // 3. Total Calculator Effect - Replace existing useEffect
  useEffect(() => {
    // Calculate items subtotal
    const itemsSubtotal = formData.items.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    // Calculate main tax
    const mainTaxAmount = (itemsSubtotal * formData.taxPercentage) / 100;

    // Calculate discount
    const discountAmount = (itemsSubtotal * formData.discountPercentage) / 100;

    // Calculate final total
    const totalBeforeShipping = itemsSubtotal + mainTaxAmount - discountAmount;
    const finalTotal = totalBeforeShipping + formData.shippingAmount;

    // Calculate balance due
    const balanceDue = finalTotal - formData.amountPaid;

    setFormData((prev) => ({
      ...prev,
      totalAmount: finalTotal,
      balanceDue: balanceDue,
    }));
  }, [
    formData.items,
    formData.taxPercentage,
    formData.discountPercentage,
    formData.shippingAmount,
    formData.amountPaid,
  ]);
  const calculateItemTotal = (item: InvoiceItem) => {
    const baseAmount = item.quantity * item.rate;
    const itemTaxAmount = (baseAmount * item.taxPercentage) / 100;
    return baseAmount + itemTaxAmount;
  };

  const calculateSubtotal = (items: InvoiceItem[]) => {
    return items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const calculateMainTax = (subtotal: number, taxPercentage: number) => {
    return (subtotal * taxPercentage) / 100;
  };

  const calculateDiscount = (subtotal: number, discountPercentage: number) => {
    return (subtotal * discountPercentage) / 100;
  };

  const recalculateAll = (currentFormData: Invoice) => {
    // Step 1: Calculate each item's total
    const updatedItems = currentFormData.items.map((item) => ({
      ...item,
      amount: calculateItemTotal(item),
    }));

    // Step 2: Calculate subtotal
    const subtotal = calculateSubtotal(updatedItems);

    // Step 3: Calculate main tax
    const mainTax = calculateMainTax(subtotal, currentFormData.taxPercentage);

    // Step 4: Calculate discount
    const discount = calculateDiscount(
      subtotal,
      currentFormData.discountPercentage
    );

    // Step 5: Calculate final total
    const total =
      subtotal + mainTax - discount + currentFormData.shippingAmount;

    // Step 6: Calculate balance due
    const balanceDue = total - currentFormData.amountPaid;

    return {
      items: updatedItems,
      totalAmount: total,
      balanceDue: balanceDue,
    };
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };

    const updatedFormData = {
      ...formData,
      items: newItems,
    };

    const recalculatedData = recalculateAll(updatedFormData);
    setFormData((prev) => ({
      ...prev,
      ...recalculatedData,
    }));
  };

  useEffect(() => {
    const recalculatedData = recalculateAll(formData);
    setFormData((prev) => ({
      ...prev,
      ...recalculatedData,
    }));
  }, [
    formData.taxPercentage,
    formData.discountPercentage,
    formData.shippingAmount,
    formData.amountPaid,
  ]);
  //Calculation ends
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
          taxPercentage: 0,
        },
      ],
    }));
  };

  // Calculate totals whenever relevant values change
  useEffect(() => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);

    const discountAmount = (subtotal * formData.discountPercentage) / 100;
    const totalAmount = subtotal - discountAmount + formData.shippingAmount;
    const balanceDue = totalAmount - formData.amountPaid;

    setFormData((prev) => ({
      ...prev,

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

  // Tax and Discount Components
  const TaxInputSection = () => (
    <div className="space-y-2 border-b pb-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Tax:</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={formData.taxPercentage}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              taxPercentage: parseFloat(e.target.value),
            }))
          }
          className="w-32 border rounded p-2 text-right"
          min="0"
          step="0.01"
        />
        <span>%</span>
      </div>
    </div>
  );

  const DiscountInputSection = () => (
    <div className="space-y-2 border-b pb-4">
      <div className="flex justify-between items-center">
        <span className="font-medium">Discount:</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={formData.discountPercentage}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              discountPercentage: parseFloat(e.target.value),
            }))
          }
          className="w-32 border rounded p-2 text-right"
          min="0"
          step="0.01"
        />
        <span>%</span>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto p-8 space-y-8 bg-white shadow-lg rounded-xl"
    >
      {/* Enhanced Header Section */}
      <div className="flex justify-between items-start gap-8">
        <div className="w-48 h-48 border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center hover:border-blue-500 transition-colors">
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
                <span className="text-sm text-gray-600">Add Logo</span>
              </div>
            )}
          </label>
        </div>

        <div className="flex-grow">
          <div className="text-right space-y-4">
            <h1 className="text-4xl font-bold text-gray-800">INVOICE</h1>
            <div className="space-y-2">
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
                className="border p-2 rounded w-48"
              />
              <select
                value={formData.currency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currency: e.target.value as Invoice["currency"],
                  }))
                }
                className="border p-2 rounded w-48 ml-2"
              >
                {currencyOptions.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Business Details Section */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From
            </label>
            <textarea
              value={formData.from}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, from: e.target.value }))
              }
              className="w-full border rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Your business details..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bill To
            </label>
            <textarea
              value={formData.billTo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, billTo: e.target.value }))
              }
              className="w-full border rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Client billing address..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ship To
            </label>
            <textarea
              value={formData.shipTo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, shipTo: e.target.value }))
              }
              className="w-full border rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Shipping address..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date
              </label>
              <DatePicker
                selected={formData.invoiceDate}
                onChange={(date: Date) =>
                  setFormData((prev) => ({ ...prev, invoiceDate: date }))
                }
                className="w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <DatePicker
                selected={formData.dueDate}
                onChange={(date: Date) =>
                  setFormData((prev) => ({ ...prev, dueDate: date }))
                }
                className="w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms
              </label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    paymentTerms: e.target.value,
                  }))
                }
                className="w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Net 30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PO Number
              </label>
              <input
                type="number"
                value={formData.poNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    poNumber: Number(e.target.value),
                  }))
                }
                className="w-full border rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Items Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 text-left font-medium text-gray-700">
                  Item
                </th>
                <th className="p-3 text-left font-medium text-gray-700">
                  Description
                </th>
                <th className="p-3 text-right font-medium text-gray-700">
                  Quantity
                </th>
                <th className="p-3 text-right font-medium text-gray-700">
                  Rate
                </th>
                <th className="p-3 text-right font-medium text-gray-700">
                  Tax
                </th>
                <th className="p-3 text-right font-medium text-gray-700">
                  Amount
                </th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(index, "name", e.target.value)
                      }
                      className="w-full border rounded p-2"
                      placeholder="Item name"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, "description", e.target.value)
                      }
                      className="w-full border rounded p-2"
                      placeholder="Description"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      className="w-full border rounded p-2 text-right"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, "rate", Number(e.target.value))
                      }
                      className="w-full border rounded p-2 text-right"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={item.taxPercentage}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "taxPercentage",
                            Number(e.target.value)
                          )
                        }
                        className="w-full border rounded p-2 text-right"
                      />
                      <span>%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-medium">
                    {formData.currency} {item.amount.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          items: prev.items.filter((_, i) => i !== index),
                        }))
                      }
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add Item
        </button>
      </div>

      {/* Enhanced Totals Section */}
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              className="w-full border rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Terms & Conditions
            </label>
            <textarea
              value={formData.terms}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, terms: e.target.value }))
              }
              className="w-full border rounded-md shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Terms and conditions..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg">
            <TaxInputSection />
            <DiscountInputSection />
            <div className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax:</span>
                <span className="font-medium">{formData.currency} [200]</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Discount:</span>
                <span className="font-medium text-red-600">
                  -{formData.currency} [100]
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping:</span>
                <div className="w-32">
                  <input
                    type="number"
                    value={formData.shippingAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        shippingAmount: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded p-2 text-right"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    Total Amount:
                  </span>
                  <span className="font-bold text-lg">
                    {formData.currency} {formData.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount Paid:</span>
                <div className="w-32">
                  <input
                    type="number"
                    value={formData.amountPaid}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0;
                      setFormData((prev) => ({
                        ...prev,
                        amountPaid: value,
                        balanceDue: prev.totalAmount - value,
                      }));
                    }}
                    className="w-full border rounded p-2 text-right"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    Balance Due:
                  </span>
                  <span className="font-bold text-lg text-blue-600">
                    {formData.currency} {formData.balanceDue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-lg font-medium"
        >
          Generate Invoice
        </button>
      </div>
    </form>
  );
};

export default page;

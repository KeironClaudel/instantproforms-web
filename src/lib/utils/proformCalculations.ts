import type { ProformItemDraft } from "@/types/proform";

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return Number((quantity * unitPrice).toFixed(2));
}

export function calculateSubtotal(items: ProformItemDraft[]): number {
  return Number(
    items
      .reduce((total, item) => total + calculateLineTotal(item.quantity, item.unitPrice), 0)
      .toFixed(2),
  );
}

export function calculateTaxAmount(subtotal: number, taxPercentage: number): number {
  return Number((subtotal * (taxPercentage / 100)).toFixed(2));
}

export function calculateTotal(subtotal: number, taxAmount: number): number {
  return Number((subtotal + taxAmount).toFixed(2));
}
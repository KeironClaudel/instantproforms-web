import type { ProformItemDraft } from "@/types/proform";

function parseMoneyInput(value: string): number {
  const normalized = value.trim();

  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : 0;
}

export function calculateLineTotal(quantity: string, unitPrice: string): number {
  const quantityNumber = parseMoneyInput(quantity);
  const unitPriceNumber = parseMoneyInput(unitPrice);

  return Number((quantityNumber * unitPriceNumber).toFixed(2));
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

export function toNumberOrNull(value: string): number | null {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}
/**
 * Delivery cost calculation engine.
 * Categories: installation, transport, mechanisms
 */

export interface DeliveryLineInput {
  category: string;
  quantity: number;
  unitPrice: number;
}

export interface DeliverySummary {
  totalDeliveryCost: number;
  totalInstallationCost: number;
  totalTransportCost: number;
  totalMechanismsCost: number;
  totalHours: number;
}

export function calcDeliveryLine(input: DeliveryLineInput): number {
  return round2(input.quantity * input.unitPrice);
}

export function calcDeliveryTotals(
  lines: Array<{ category: string; quantity: number; unitPrice: number; totalCost: number }>
): DeliverySummary {
  let totalInstallationCost = 0;
  let totalTransportCost = 0;
  let totalMechanismsCost = 0;
  let totalHours = 0;

  for (const line of lines) {
    const cost = line.totalCost;
    switch (line.category) {
      case "installation":
        totalInstallationCost += cost;
        totalHours += line.quantity;
        break;
      case "transport":
        totalTransportCost += cost;
        break;
      case "mechanisms":
        totalMechanismsCost += cost;
        break;
    }
  }

  return {
    totalDeliveryCost: round2(totalInstallationCost + totalTransportCost + totalMechanismsCost),
    totalInstallationCost: round2(totalInstallationCost),
    totalTransportCost: round2(totalTransportCost),
    totalMechanismsCost: round2(totalMechanismsCost),
    totalHours: round2(totalHours),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

import { ExtractedData, MatchResult, Difference } from '../types';

export function matchDocuments(
  invoices: Map<string, ExtractedData>,
  pos: Map<string, ExtractedData>
): MatchResult[] {
  const results: MatchResult[] = [];

  invoices.forEach((invoice, invoiceId) => {
    const matchingPO = findMatchingPO(invoice, pos);

    if (matchingPO) {
      const [poId, po] = matchingPO;
      const differences = compareDocuments(invoice, po);

      results.push({
        invoiceId,
        poId,
        invoice,
        po,
        status: differences.length === 0 ? 'match' : 'mismatch',
        differences
      });
    }
  });

  return results;
}

function findMatchingPO(
  invoice: ExtractedData,
  pos: Map<string, ExtractedData>
): [string, ExtractedData] | null {
  for (const [poId, po] of pos.entries()) {
    if (
      po.vendor.toLowerCase() === invoice.vendor.toLowerCase() ||
      po.documentNumber === invoice.documentNumber ||
      Math.abs(po.total - invoice.total) < 1
    ) {
      return [poId, po];
    }
  }

  const posArray = Array.from(pos.entries());
  if (posArray.length > 0) {
    return posArray[0];
  }

  return null;
}

function compareDocuments(invoice: ExtractedData, po: ExtractedData): Difference[] {
  const differences: Difference[] = [];

  if (invoice.vendor.toLowerCase() !== po.vendor.toLowerCase()) {
    differences.push({
      field: 'Vendor',
      invoiceValue: invoice.vendor,
      poValue: po.vendor,
      severity: 'high',
      message: 'Vendor names do not match'
    });
  }

  const totalDiff = Math.abs(invoice.total - po.total);
  if (totalDiff > 0.01) {
    const percentDiff = (totalDiff / po.total) * 100;
    differences.push({
      field: 'Total Amount',
      invoiceValue: `$${invoice.total.toFixed(2)}`,
      poValue: `$${po.total.toFixed(2)}`,
      severity: percentDiff > 10 ? 'high' : percentDiff > 5 ? 'medium' : 'low',
      message: `Amount differs by $${totalDiff.toFixed(2)} (${percentDiff.toFixed(1)}%)`
    });
  }

  if (invoice.items.length !== po.items.length) {
    differences.push({
      field: 'Line Items',
      invoiceValue: invoice.items.length,
      poValue: po.items.length,
      severity: 'medium',
      message: 'Different number of line items'
    });
  }

  const itemDiffs = compareLineItems(invoice.items, po.items);
  differences.push(...itemDiffs);

  return differences;
}

function compareLineItems(invoiceItems: any[], poItems: any[]): Difference[] {
  const differences: Difference[] = [];
  const maxLength = Math.max(invoiceItems.length, poItems.length);

  for (let i = 0; i < maxLength; i++) {
    const invItem = invoiceItems[i];
    const poItem = poItems[i];

    if (!invItem || !poItem) continue;

    if (Math.abs(invItem.total - poItem.total) > 0.01) {
      differences.push({
        field: `Item ${i + 1}: ${invItem.description.substring(0, 30)}`,
        invoiceValue: `$${invItem.total.toFixed(2)}`,
        poValue: `$${poItem.total.toFixed(2)}`,
        severity: 'medium',
        message: 'Line item total mismatch'
      });
    }

    if (invItem.quantity !== poItem.quantity) {
      differences.push({
        field: `Item ${i + 1} Quantity`,
        invoiceValue: invItem.quantity,
        poValue: poItem.quantity,
        severity: 'low',
        message: 'Quantity mismatch'
      });
    }
  }

  return differences;
}

export function generateMatchSummary(results: MatchResult[]): string {
  const matched = results.filter(r => r.status === 'match').length;
  const mismatched = results.filter(r => r.status === 'mismatch').length;

  let summary = `Matching Complete!\n\n`;
  summary += `✓ ${matched} invoice${matched !== 1 ? 's' : ''} matched perfectly\n`;

  if (mismatched > 0) {
    summary += `⚠️ ${mismatched} invoice${mismatched !== 1 ? 's' : ''} need${mismatched === 1 ? 's' : ''} review\n\n`;

    summary += `Issues Found:\n`;
    results
      .filter(r => r.status === 'mismatch')
      .forEach(result => {
        summary += `\n📄 Invoice ${result.invoice.documentNumber}:\n`;
        result.differences.forEach(diff => {
          const icon = diff.severity === 'high' ? '🔴' : diff.severity === 'medium' ? '🟡' : '🟢';
          summary += `  ${icon} ${diff.message}\n`;
        });
      });
  }

  return summary;
}

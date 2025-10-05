import { CheckCircle2, AlertCircle } from 'lucide-react';
import { ExtractedData } from '../types';

interface ExtractedDataViewProps {
  data: ExtractedData;
  type: 'invoice' | 'po';
}

export function ExtractedDataView({ data, type }: ExtractedDataViewProps) {
  const label = type === 'invoice' ? 'Invoice' : 'Purchase Order';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-5 h-5 text-green-600" />
        <h4 className="font-semibold text-gray-900">{label} Extracted</h4>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Document #:</span>
          <span className="font-medium text-gray-900">{data.documentNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Vendor:</span>
          <span className="font-medium text-gray-900">{data.vendor}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium text-gray-900">{data.date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total:</span>
          <span className="font-semibold text-gray-900">${data.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Line Items:</span>
          <span className="font-medium text-gray-900">{data.items.length}</span>
        </div>
      </div>

      {data.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs font-semibold text-gray-700 mb-2">Items:</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {data.items.map((item, idx) => (
              <div key={idx} className="text-xs text-gray-600 flex justify-between">
                <span className="truncate flex-1 mr-2">{item.description}</span>
                <span className="font-medium">${item.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

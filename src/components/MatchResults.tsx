import { CheckCircle2, AlertTriangle, XCircle, Download, FileSpreadsheet } from 'lucide-react';
import { MatchResult } from '../types';

interface MatchResultsProps {
  results: MatchResult[];
  summary: string;
}

export function MatchResults({ results, summary }: MatchResultsProps) {
  const matchedCount = results.filter(r => r.status === 'match').length;
  const mismatchedCount = results.filter(r => r.status === 'mismatch').length;

  const exportToJSON = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `match-results-${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToCSV = () => {
    let csv = 'Invoice Number,PO Number,Invoice Vendor,PO Vendor,Invoice Total,PO Total,Status,Issues\n';

    results.forEach(result => {
      const issues = result.differences.map(d => d.message).join('; ');
      csv += `"${result.invoice.documentNumber}","${result.po.documentNumber}","${result.invoice.vendor}","${result.po.vendor}",${result.invoice.total},${result.po.total},${result.status},"${issues}"\n`;
    });

    const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csv);
    const exportFileDefaultName = `match-results-${new Date().toISOString().split('T')[0]}.csv`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-6 border border-pink-200 shadow-lg">        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Matching Results</h3>
          <div className="flex gap-2">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow btn"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={exportToJSON}
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 transition-all shadow-sm hover:shadow btn"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span className="font-semibold text-gray-900">Matched</span>
            </div>
            <div className="text-3xl font-bold text-green-600">{matchedCount}</div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <span className="font-semibold text-gray-900">Needs Review</span>
            </div>
            <div className="text-3xl font-bold text-orange-600">{mismatchedCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{summary}</pre>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((result, idx) => (
          <div
            key={idx}
            className={`rounded-lg border-2 p-6 ${
              result.status === 'match'
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {result.status === 'match' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                  <h4 className="text-lg font-bold text-gray-900">
                    Invoice {result.invoice.documentNumber}
                  </h4>
                </div>
                <p className="text-sm text-gray-600">
                  Matched with PO {result.po.documentNumber}
                </p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  result.status === 'match'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {result.status === 'match' ? 'Perfect Match' : 'Mismatch Found'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-2">Invoice Details</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor:</span>
                    <span className="font-medium">{result.invoice.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{result.invoice.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">${result.invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h5 className="font-semibold text-gray-900 mb-2">Purchase Order Details</h5>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor:</span>
                    <span className="font-medium">{result.po.vendor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{result.po.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-semibold">${result.po.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {result.differences.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <h5 className="font-semibold text-red-900 mb-3">Issues Found:</h5>
                <div className="space-y-2">
                  {result.differences.map((diff, diffIdx) => (
                    <div
                      key={diffIdx}
                      className={`p-3 rounded-lg border ${
                        diff.severity === 'high'
                          ? 'bg-red-100 border-red-300'
                          : diff.severity === 'medium'
                          ? 'bg-yellow-100 border-yellow-300'
                          : 'bg-blue-100 border-blue-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={`text-lg ${
                            diff.severity === 'high'
                              ? 'text-red-600'
                              : diff.severity === 'medium'
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                          }`}
                        >
                          {diff.severity === 'high' ? '🔴' : diff.severity === 'medium' ? '🟡' : '🟢'}
                        </span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">{diff.field}</div>
                          <div className="text-sm text-gray-700 mb-2">{diff.message}</div>
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-600">
                              Invoice: <span className="font-medium">{diff.invoiceValue}</span>
                            </span>
                            <span className="text-gray-600">
                              PO: <span className="font-medium">{diff.poValue}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

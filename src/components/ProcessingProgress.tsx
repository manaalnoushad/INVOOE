import { Loader2 } from 'lucide-react';

interface ProcessingProgressProps {
  currentFile: string;
  progress: number;
  totalFiles: number;
  processedFiles: number;
}

export function ProcessingProgress({ currentFile, progress, totalFiles, processedFiles }: ProcessingProgressProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-center mb-6">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>

        <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Processing Documents
        </h3>

        <p className="text-sm text-gray-600 text-center mb-6">
          AI is extracting data from your documents...
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current File:</span>
              <span className="font-medium text-gray-900">{processedFiles + 1} / {totalFiles}</span>
            </div>
            <p className="text-xs text-gray-500 truncate">{currentFile}</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-semibold text-blue-600">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800 text-center">
              Using AI to read PDFs, images, and text documents
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

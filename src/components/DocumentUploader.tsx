import { useState } from 'react';
import { Upload, FileText, X, Image as ImageIcon } from 'lucide-react';
import { UploadedDocument } from '../types';

interface DocumentUploaderProps {
  type: 'invoice' | 'po';
  documents: UploadedDocument[];
  onUpload: (files: FileList, type: 'invoice' | 'po') => void;
  onRemove: (id: string) => void;
  maxFiles: number;
}

export function DocumentUploader({ type, documents, onUpload, onRemove, maxFiles }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);

  const label = type === 'invoice' ? 'Invoices' : 'Purchase Orders';
  const canUploadMore = documents.length < maxFiles;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files, type);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && canUploadMore) {
      onUpload(files, type);
    }
  };

  const createPreview = (doc: UploadedDocument) => {
    if (doc.file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        doc.preview = e.target?.result as string;
        setPreviewDoc({ ...doc });
      };
      reader.readAsDataURL(doc.file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-pink-500" />
          {label}
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          documents.length === maxFiles
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600'
        }`}>
          {documents.length} / {maxFiles}
        </span>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-pink-50 rounded-xl border border-gray-200 hover:border-pink-400 transition-all hover:shadow-md cursor-pointer"
            onClick={() => {
              if (doc.file.type.startsWith('image/') && !doc.preview) {
                createPreview(doc);
              }
              setPreviewDoc(doc);
            }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {doc.file.type.startsWith('image/') ? (
                <ImageIcon className="w-6 h-6 text-pink-500 flex-shrink-0" />
              ) : (
                <FileText className="w-6 h-6 text-pink-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 truncate block">
                  {doc.file.name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatFileSize(doc.file.size)}
                </span>
              </div>
              {doc.extracted && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex-shrink-0">
                  Extracted
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(doc.id);
              }}
              className="ml-3 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 btn"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ))}

        {canUploadMore && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative transition-all ${
              isDragging ? 'scale-105' : ''
            }`}
          >
            <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              isDragging
                ? 'border-pink-500 bg-pink-50 scale-105'
                : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'
            }`}>
              <Upload className={`w-10 h-10 mb-3 transition-all ${
                isDragging ? 'text-pink-600 scale-110' : 'text-gray-400'
              }`} />
              <span className="text-base font-semibold text-gray-700 mb-1">
                {isDragging ? 'Drop files here' : `Upload ${label.toLowerCase()}`}
              </span>
              <span className="text-sm text-gray-500">
                Drag & drop or click to browse
              </span>
              <span className="text-xs text-gray-400 mt-2">
                PDF, PNG, JPG or TXT
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.txt"
                multiple={maxFiles - documents.length > 1}
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}
      </div>

      {previewDoc && previewDoc.preview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setPreviewDoc(null)}
        >
          <div className="bg-white rounded-xl p-4 max-w-4xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg">{previewDoc.file.name}</h4>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={previewDoc.preview}
              alt={previewDoc.file.name}
              className="max-w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}

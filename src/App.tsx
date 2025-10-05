import { useState } from 'react';
import { FileCheck, PlayCircle, Sparkles } from 'lucide-react';
import { DocumentUploader } from './components/DocumentUploader';
import { ExtractedDataView } from './components/ExtractedDataView';
import { MatchResults } from './components/MatchResults';
import { ProcessingProgress } from './components/ProcessingProgress';
import { UploadedDocument, MatchResult } from './types';
import { extractDocumentData } from './utils/documentExtractor';
import { matchDocuments, generateMatchSummary } from './utils/documentMatcher';

function App() {
  const [invoices, setInvoices] = useState<UploadedDocument[]>([]);
  const [pos, setPOs] = useState<UploadedDocument[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchResults, setMatchResults] = useState<MatchResult[] | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [currentFile, setCurrentFile] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [processedFiles, setProcessedFiles] = useState<number>(0);

  const handleUpload = async (files: FileList, type: 'invoice' | 'po') => {
    const newDocuments: UploadedDocument[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const doc: UploadedDocument = {
        id: `${type}-${Date.now()}-${i}`,
        type,
        file,
      };
      newDocuments.push(doc);
    }

    if (type === 'invoice') {
      setInvoices((prev) => [...prev, ...newDocuments].slice(0, 3));
    } else {
      setPOs((prev) => [...prev, ...newDocuments].slice(0, 3));
    }
  };

  const handleRemove = (id: string) => {
    setInvoices((prev) => prev.filter((doc) => doc.id !== id));
    setPOs((prev) => prev.filter((doc) => doc.id !== id));
    setMatchResults(null);
  };

  const handleRunMatching = async () => {
    if (invoices.length === 0 || pos.length === 0) {
      alert('Please upload at least one invoice and one purchase order');
      return;
    }

    setIsProcessing(true);
    setMatchResults(null);
    setProcessedFiles(0);
    setProgress(0);

    try {
      const totalFiles = invoices.length + pos.length;
      let fileCount = 0;

      const invoiceMap = new Map();
      for (const doc of invoices) {
        setCurrentFile(doc.file.name);
        const extracted = await extractDocumentData(doc.file, 'invoice', (prog) => {
          setProgress(prog);
        });
        doc.extracted = extracted;
        invoiceMap.set(doc.id, extracted);
        fileCount++;
        setProcessedFiles(fileCount);
        setProgress(0);
      }

      const poMap = new Map();
      for (const doc of pos) {
        setCurrentFile(doc.file.name);
        const extracted = await extractDocumentData(doc.file, 'po', (prog) => {
          setProgress(prog);
        });
        doc.extracted = extracted;
        poMap.set(doc.id, extracted);
        fileCount++;
        setProcessedFiles(fileCount);
        setProgress(0);
      }

      setInvoices([...invoices]);
      setPOs([...pos]);

      setCurrentFile('Matching documents...');
      setProgress(90);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const results = matchDocuments(invoiceMap, poMap);
      const summaryText = generateMatchSummary(results);

      setProgress(100);
      setMatchResults(results);
      setSummary(summaryText);
    } catch (error) {
      console.error('Error processing documents:', error);
      alert('Error processing documents. Please check your files and try again.');
      return;
    } finally {
      setIsProcessing(false);
      setCurrentFile('');
      setProgress(0);
      setProcessedFiles(0);
    }
  };

  const hasExtractedData = invoices.some((doc) => doc.extracted) || pos.some((doc) => doc.extracted);
  const totalFiles = invoices.length + pos.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-100">
      {isProcessing && (
        <ProcessingProgress
          currentFile={currentFile}
          progress={progress}
          totalFiles={totalFiles}
          processedFiles={processedFiles}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-8 sm:mb-12 animate-fadeIn">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <FileCheck className="w-12 h-12 sm:w-14 sm:h-14 text-primary" />
              <Sparkles className="w-5 h-5 text-accent absolute -top-1 -right-1 animate-pulse" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-text-primary via-accent to-text-primary bg-clip-text text-transparent">
              INVOOE
            </h1>
          </div>
          <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto px-4">
            Find matches between invoices and purchase orders.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <DocumentUploader
            type="invoice"
            documents={invoices}
            onUpload={handleUpload}
            onRemove={handleRemove}
            maxFiles={3}
          />
          <DocumentUploader
            type="po"
            documents={pos}
            onUpload={handleUpload}
            onRemove={handleRemove}
            maxFiles={3}
          />
        </div>

        <div className="flex justify-center mb-8 sm:mb-12">
          <button
            onClick={handleRunMatching}
            disabled={isProcessing || invoices.length === 0 || pos.length === 0}
            className="group flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold text-base sm:text-lg rounded-xl hover:from-secondary hover:to-accent disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:hover:translate-y-0"
          >
            <PlayCircle className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
            <span>Run Matching</span>
          </button>
        </div>

        {hasExtractedData && !matchResults && (
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">Extracted Data</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-text-secondary text-lg">Invoices</h3>
                {invoices
                  .filter((doc) => doc.extracted)
                  .map((doc) => (
                    <ExtractedDataView key={doc.id} data={doc.extracted!} type="invoice" />
                  ))}
              </div>
              <div className="space-y-4">
                <h3 className="font-semibold text-text-secondary text-lg">Purchase Orders</h3>
                {pos
                  .filter((doc) => doc.extracted)
                  .map((doc) => (
                    <ExtractedDataView key={doc.id} data={doc.extracted!} type="po" />
                  ))}
              </div>
            </div>
          </div>
        )}

        {matchResults && matchResults.length > 0 && (
          <MatchResults results={matchResults} summary={summary} />
        )}

        {matchResults && matchResults.length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center animate-fadeIn">
            <p className="text-yellow-800 font-medium text-lg">
              No matches found. Please check your documents and try again.
            </p>
          </div>
        )}
      </div>

      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200 mt-12">
        <p>AI-powered document matching • Supports PDF, PNG, JPG, and TXT files</p>
      </footer>
    </div>
  );
}

export default App;

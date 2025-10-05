export interface UploadedDocument {
  id: string;
  type: 'invoice' | 'po';
  file: File;
  preview?: string;
  extracted?: ExtractedData;
}

export interface ExtractedData {
  documentNumber: string;
  vendor: string;
  date: string;
  total: number;
  items: LineItem[];
  rawText?: string;
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface MatchResult {
  invoiceId: string;
  poId: string;
  invoice: ExtractedData;
  po: ExtractedData;
  status: 'match' | 'mismatch';
  differences: Difference[];
}

export interface Difference {
  field: string;
  invoiceValue: any;
  poValue: any;
  severity: 'high' | 'medium' | 'low';
  message: string;
}

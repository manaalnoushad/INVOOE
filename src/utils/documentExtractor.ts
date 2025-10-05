import { ExtractedData } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function extractDocumentData(
  file: File,
  type: 'invoice' | 'po',
  onProgress?: (progress: number) => void
): Promise<ExtractedData> {
  try {
    onProgress?.(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    onProgress?.(30);
    console.log(formData.get('type'), formData.get('file'));
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/extract-document`,
      {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: formData,
      }
    );

    onProgress?.(80);

    if (!response.ok) {
      throw new Error(`Extraction failed: ${response.statusText}`);
    }

    const data = await response.json();

    onProgress?.(100);
    console.log(data)
    if (data.error && data.fallbackData) {
      return data.fallbackData;
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return data;
  } catch (error) {
    console.error('Error extracting document:', error);
    throw error;
  }
}

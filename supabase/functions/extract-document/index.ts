import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { encode } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("type") as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No file provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    // FIX: Convert ArrayBuffer to Uint8Array before encoding
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64 = encode(uint8Array);
    
    const mediaType = file.type || "application/pdf";

    const prompt = documentType === "invoice"
      ? `Analyze this invoice document and extract the following information in JSON format:
{
  "documentNumber": "the invoice number",
  "vendor": "the vendor/company name",
  "date": "the invoice date",
  "total": numeric_total_amount,
  "items": [
    {
      "description": "item description",
      "quantity": numeric_quantity,
      "unitPrice": numeric_unit_price,
      "total": numeric_item_total
    }
  ]
}

Extract all line items if present. If any field is not found, use reasonable defaults. Return only valid JSON.`
      : `Analyze this purchase order document and extract the following information in JSON format:
{
  "documentNumber": "the PO number",
  "vendor": "the vendor/supplier name",
  "date": "the order date",
  "total": numeric_total_amount,
  "items": [
    {
      "description": "item description",
      "quantity": numeric_quantity,
      "unitPrice": numeric_unit_price,
      "total": numeric_item_total
    }
  ]
}

Extract all line items if present. If any field is not found, use reasonable defaults. Return only valid JSON.`;

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "AI service not configured. Please add GEMINI_API_KEY to your environment variables.",
          fallbackData: generateFallbackData(file.name, documentType)
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Use gemini-1.5-flash or gemini-1.5-pro for document processing
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mediaType,
                    data: base64,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", errorText);
      
      return new Response(
        JSON.stringify({
          error: "AI extraction failed",
          fallbackData: generateFallbackData(file.name, documentType)
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const geminiData = await geminiResponse.json();
    const extractedText = geminiData.candidates[0].content.parts[0].text;
    
    // Remove markdown code blocks if present
    const cleanedText = extractedText.replace(/```json\n?|\n?```/g, '').trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : generateFallbackData(file.name, documentType);

    return new Response(
      JSON.stringify(extractedData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing document:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        fallbackData: generateFallbackData("document", "invoice")
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateFallbackData(filename: string, type: string) {
  const docNum = filename.replace(/\.(pdf|png|jpg|jpeg|txt)$/i, "");
  return {
    documentNumber: docNum || `${type.toUpperCase()}-${Date.now()}`,
    vendor: "Sample Vendor Inc.",
    date: new Date().toISOString().split("T")[0],
    total: 1000.00,
    items: [
      {
        description: "Sample Item",
        quantity: 1,
        unitPrice: 1000.00,
        total: 1000.00
      }
    ]
  };
}
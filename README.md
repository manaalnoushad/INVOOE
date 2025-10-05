# INVOOE
A webapp which uses AI tool for matching invoices and purchase orders.
# Invoice & Purchase Order Matching System

## Features

- 📄 **AI-Powered Document Extraction** - Upload invoices and POs in PDF, PNG, or JPG format
- 🤖 **Smart Matching** - Automatically matches invoices with corresponding purchase orders
- 🔍 **Discrepancy Detection** - Identifies mismatches in vendor names, amounts, quantities, and line items
- 📊 **Visual Comparison** - Side-by-side document comparison with highlighted differences, also show mismatches.
- ⚡ **Real-time Processing** - Fast extraction using Google Gemini AI

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase Edge Functions
- **AI**: Google Gemini 2.5 Flash (Vision API)
- **Deployment**: Vercel

## Prerequisites

Before running this project, make sure you have:

- Node.js 18+ installed
- A Supabase account
- A Google Gemini API key
- npm or yarn package manager

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/invooe.git
cd invooe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Supabase Edge Function

#### Install Supabase CLI

```bash
npm install -g supabase
```

#### Login to Supabase

```bash
supabase login
```

#### Link Your Project

```bash
supabase link --project-ref your-project-ref
```

#### Set the Gemini API Key Secret

```bash
supabase secrets set GEMINI_API_KEY=your_gemini_api_key
```

#### Deploy the Edge Function

```bash
supabase functions deploy extract-document
```

### 5. Get API Keys

#### Supabase Setup:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy your `Project URL` and `anon public` key

#### Google Gemini API Key:
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key
3. Copy the key for use in Supabase secrets

## Running the Project

### Development Mode

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Usage

1. **Upload Documents**
   - Click "Upload Invoice" to add invoice documents
   - Click "Upload PO" to add purchase order documents
   - Supports PDF, PNG, and JPG formats

2. **AI Extraction**
   - The AI automatically extracts key information:
     - Document number
     - Vendor name
     - Date
     - Total amount
     - Line items with quantities and prices

3. **Match Documents**
   - Click "Match Documents" to compare invoices with POs
   - View matching results with color-coded severity levels:
     - 🔴 High severity (vendor mismatch, large amount differences)
     - 🟡 Medium severity (line item count differences)
     - 🟢 Low severity (minor quantity differences)

4. **Review Results**
   - See side-by-side comparison
   - Review all identified discrepancies
   - Export results if needed

## Project Structure

```
invooe/
├── src/
│   ├── components/        # React components
│   ├── utils/
│   │   ├── documentExtractor.ts    # Frontend API calls
│   │   └── documentMatcher.ts      # Matching logic
│   ├── types/            # TypeScript type definitions
│   └── App.tsx           # Main application
├── supabase/
│   └── functions/
│       └── extract-document/
│           └── index.ts  # Edge function for AI extraction
├── .env                  # Environment variables
├── package.json
└── README.md
```

## Deployment

### Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
vercel
```

3. **Set Environment Variables**
   - Go to your Vercel project settings
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Deploy to Production**
```bash
vercel --prod
```

## Troubleshooting

### "AI service not configured" Error
- Make sure you've set the `GEMINI_API_KEY` secret in Supabase
- Verify the edge function is deployed: `supabase functions list`

### CORS Errors
- Ensure your Supabase project allows requests from your domain
- Check that CORS headers are properly set in the edge function

### Extraction Not Working
- Verify your Gemini API key is valid and has sufficient quota
- Check the Supabase function logs: `supabase functions logs extract-document`
- Ensure uploaded files are valid PDFs or images

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that all environment variables are set correctly

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check the Supabase documentation: https://supabase.com/docs
- Review Gemini API docs: https://ai.google.dev/docs

## Acknowledgments

- Built with React and Vite
- Powered by Google Gemini AI
- Hosted on Supabase and Vercel

---

**Live Demo**: [https://invooe.vercel.app](https://invooe.vercel.app)

**Made with ❤️ for automated invoice processing**

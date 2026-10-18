// ocr.js — Gemini Vision AI OCR Engine for LV Spices Raw Material Invoices
// Uses Gemini 2.5 Flash with Canvas compression and 5 rotating keys

import { getActiveGeminiKey, rotateGeminiKey, GEMINI_KEYS } from './keys.js';

export function resizeImageToCanvas(file, maxDimension = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const base64Data = canvas.toDataURL('image/jpeg', 0.88);
        const rawBase64 = base64Data.split(',')[1];

        // Thumbnail for entry preview
        const thumbCanvas = document.createElement('canvas');
        const thumbSize = 80;
        thumbCanvas.width = thumbSize;
        thumbCanvas.height = Math.round((img.height * thumbSize) / img.width);
        const thumbCtx = thumbCanvas.getContext('2d');
        thumbCtx.drawImage(img, 0, 0, thumbCanvas.width, thumbCanvas.height);
        const thumbData = thumbCanvas.toDataURL('image/jpeg', 0.7);

        resolve({ rawBase64, mimeType: 'image/jpeg', thumbData });
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function scanRawMaterialInvoice(file, onProgress = () => {}) {
  onProgress(25, "Compressing invoice image...");
  const { rawBase64, mimeType, thumbData } = await resizeImageToCanvas(file);

  onProgress(50, "Analyzing with Gemini Vision AI...");

  const prompt = `
You are an expert OCR and Commodities Logistics Assistant specialized in Indian spice industry supplier invoices, APMC Mandi tax invoices, transport bilties, and weighbridge slips.
Extract the raw material inward details from this invoice/challan image.

EXTRACT THESE FIELDS IN VALID JSON:
1. "purchase_date": Date of purchase or invoice date in "YYYY-MM-DD" format. If day/month are ambiguous (e.g. 10/10/2026), use standard Indian format DD/MM/YYYY. Default to "2026-10-18" if year is 2026 or missing.
2. "raw_material_name": Exact spice or raw material commodity name. Standardize to clean food-grade title (e.g. "Cumin Seeds (Jeera)", "Coriander Whole (Dhaniya)", "Turmeric Whole (Haldi)", "Red Chilli Whole", "Mustard Seeds (Rai)", "Black Pepper", "Fennel Seeds (Saunf)", "Fenugreek (Methi Dana)", "Cardamom", "Cloves", "Bay Leaf", "Cinnamon", "Dry Ginger (Sonth)").
3. "supplier_name": Full name of the supplier firm, mandi merchant, farmer trader, or commission agent.
4. "invoice_no": The printed Tax Invoice number, Bill number, or APMC Mandi memo number (e.g. "INV-2026-9041", "BILL/402", "MEMO-88").
5. "supplier_lot": The supplier lot number, batch number, or transport vehicle number if visible (e.g. "RJ-14-GA-8821" or "LOT-UNJHA-22").
6. "quantity_kg": Net weight in KG as a float/number (e.g. 1200 or 500.5). If given in Quintals (Qtl), convert to KG (1 Qtl = 100 KG). If given in Bags (e.g. 20 bags of 50kg = 1000kg).
7. "rate_per_kg": Rate or price per KG in INR (₹) as a number (e.g. 280 or 115.5). If rate per Qtl is given, divide by 100 to get rate/kg.
8. "total_value": Total taxable or invoice amount in INR (₹) as a number.
9. "quality_status": Quality check observation, default to "Passed / Food Grade".

Return ONLY a single valid JSON object with these exact keys. No markdown code blocks, no other text.
`;

  let attempts = 0;
  const maxAttempts = GEMINI_KEYS.length;

  while (attempts < maxAttempts) {
    const key = getActiveGeminiKey();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: rawBase64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    };

    try {
      onProgress(75, `AI Extraction in progress (Key #${attempts + 1})...`);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.status === 429) {
        console.warn(`[Gemini AI] Quota limit on key. Rotating...`);
        rotateGeminiKey();
        attempts++;
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini Error (${response.status}): ${errorText}`);
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

      let parsed = {};
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        const clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(clean);
      }

      // Rotate gently to spread quota
      rotateGeminiKey();
      onProgress(100, "Extraction complete!");

      const qty = parseFloat(parsed.quantity_kg) || 0;
      const rate = parseFloat(parsed.rate_per_kg) || 0;
      const total = parseFloat(parsed.total_value) || Math.round(qty * rate);

      return {
        date: parsed.purchase_date || new Date().toISOString().split('T')[0],
        material: parsed.raw_material_name || "Cumin (Jeera)",
        supplier: parsed.supplier_name || "Patel Agro Commodities, Unjha",
        invoice: parsed.invoice_no || `INV-${Date.now().toString().slice(-4)}`,
        supplierLot: parsed.supplier_lot || "LOT-01",
        qty: qty,
        rate: rate,
        total: total,
        quality: parsed.quality_status || "Passed / Food Grade",
        thumbData: thumbData
      };
    } catch (err) {
      console.error(`Attempt ${attempts + 1} failed:`, err);
      rotateGeminiKey();
      attempts++;
      if (attempts >= maxAttempts) {
        throw new Error("Unable to parse invoice image. Please check image clarity or fill manually.");
      }
    }
  }

  throw new Error("All Gemini Vision AI keys exhausted.");
}

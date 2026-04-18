import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { Resend } from "resend";
import dotenv from "dotenv";
import { supabase } from "./lib/supabase.ts";
import { GoogleGenAI } from "@google/genai";

dotenv.config({ override: true });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, systemInstruction } = req.body;
      
      const geminiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "").replace(/['"]/g, '').trim();

      if (!geminiKey) {
        return res.status(401).json({ error: "Gemini API Key belum dikonfigurasi di server lokal." });
      }

      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const history = (messages || []).map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: history,
          config: {
            systemInstruction: systemInstruction || "Anda adalah asisten virtual Dhevv Premium.",
            maxOutputTokens: 1024,
            temperature: 0.7
          }
        });

        const responseText = response.text;

        if (responseText) {
          return res.status(200).json({
            choices: [{
              message: { content: responseText }
            }]
          });
        }
        
        throw new Error("Empty response from Gemini");
      } catch (err: any) {
        console.error("Server Gemini Error:", err);
        return res.status(500).json({ error: `AI Failure: ${err.message}` });
      }
    } catch (error: any) {
      console.error("Server AI Chat Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.post("/api/create-payment", async (req, res) => {
    try {
      const { orderId, grossAmount, customerDetails, items } = req.body;

      // Fetch Midtrans settings from Supabase
      const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('server_key, client_key, is_production')
        .eq('id', 1)
        .maybeSingle();

      if (settingsError) {
        console.error("Supabase settings error:", settingsError);
        return res.status(500).json({ error: `Database error: ${settingsError.message}` });
      }

      if (!settings) {
        return res.status(500).json({ error: "Midtrans configuration not found in database. Please configure it in the Admin panel." });
      }

      const serverKey = settings.server_key;
      const isProduction = settings.is_production;

      if (!serverKey) {
        return res.status(500).json({ error: "Midtrans Server Key is not configured." });
      }

      const apiUrl = isProduction 
        ? 'https://app.midtrans.com/snap/v1/transactions' 
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const authString = Buffer.from(`${serverKey}:`).toString('base64');

      const payload = {
        transaction_details: {
          order_id: orderId,
          gross_amount: Math.round(grossAmount)
        },
        customer_details: customerDetails,
        item_details: items
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authString}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Midtrans API Error:", data);
        return res.status(response.status).json({ error: data.error_messages || "Failed to create payment" });
      }

      res.status(200).json({ 
        token: data.token, 
        redirect_url: data.redirect_url,
        clientKey: settings.client_key,
        isProduction: isProduction
      });
    } catch (error) {
      console.error("Server error creating payment:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/send-receipt", async (req, res) => {
    try {
      const { orderId, email, customerName, phoneNumber, accountDetails = "-", products, voucher, total } = req.body;

      if (!email || !orderId) {
        return res.status(400).json({ error: "Email and Order ID are required" });
      }

      const resendKey = (process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || "").trim();
      if (!resendKey) {
        return res.status(500).json({ error: "Resend API Key is not configured" });
      }

      const resend = new Resend(resendKey);
      const transactionTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', dateStyle: 'full', timeStyle: 'long' });

      const productRows = products.map((p: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #fff;">${p.name}</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; color: #fff;">${p.price}</td>
        </tr>
      `).join("");

      const voucherRow = voucher ? `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #333; color: #10b981;">Voucher (${voucher.code})</td>
          <td style="padding: 12px; border-bottom: 1px solid #333; text-align: right; color: #10b981;">-${voucher.discount}</td>
        </tr>
      ` : "";

      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; }
            .container { max-width: 600px; margin: 0 auto; background-color: #111111; border-radius: 12px; padding: 40px; border: 1px solid #333; }
            .header { text-align: center; margin-bottom: 40px; }
            .logo-img { width: 80px; height: 80px; border-radius: 16px; margin-bottom: 15px; object-fit: cover; border: 1px solid #333; }
            .logo { font-size: 24px; font-weight: bold; color: #ffffff; margin-bottom: 10px; }
            .title { font-size: 20px; color: #a1a1aa; font-weight: normal; margin-bottom: 20px; }
            .order-meta { text-align: center; margin-bottom: 30px; }
            .order-meta p { margin: 5px 0; font-size: 14px; }
            .label { color: #a1a1aa; }
            .value { color: #ffffff; font-weight: 500; }
            .section { margin-bottom: 30px; padding-top: 20px; border-top: 1px solid #333; }
            .section-title { font-size: 16px; color: #ffffff; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
            .info-row { margin-bottom: 10px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #333; color: #a1a1aa; font-weight: normal; }
            .total-row td { padding: 16px 12px; font-weight: bold; font-size: 18px; border-bottom: none; color: #ffffff; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333; color: #a1a1aa; font-size: 14px; line-height: 1.6; }
            a { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://user5703.na.imgto.link/public/20260406/d44fe453-510c-40f5-93c8-7a8bbc87af8e.avif" alt="Dhevv Premium Logo" class="logo-img">
              <div class="logo">Dhevv Premium</div>
              <div class="title">Pembelian Anda Telah Dikonfirmasi</div>
            </div>
            
            <div class="order-meta">
              <p><span class="label">Order ID:</span> <span class="value">${orderId}</span></p>
              <p><span class="label">Waktu:</span> <span class="value">${transactionTime}</span></p>
            </div>

            <div class="section">
              <div class="section-title">Detail Pelanggan</div>
              <div class="info-row"><span class="label">Nama:</span> <span class="value">${customerName}</span></div>
              <div class="info-row"><span class="label">No. WhatsApp:</span> <span class="value">${phoneNumber}</span></div>
              <div class="info-row"><span class="label">Email:</span> <span class="value">${email}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Detail Akun</div>
              <div class="info-row"><span class="value">${accountDetails}</span></div>
            </div>

            <div class="section">
              <div class="section-title">Ringkasan Pesanan</div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style="text-align: right;">Harga</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                  ${voucherRow}
                  <tr class="total-row">
                    <td>Total</td>
                    <td style="text-align: right;">${total}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="footer">
              Hormat kami,<br>
              <strong>Team Dhevv Premium Store</strong><br><br>
              Butuh bantuan? <a href="https://wa.me/6282116505311">Hubungi WhatsApp Kami</a>
            </div>
          </div>
        </body>
        </html>
      `;

      const { data, error } = await resend.emails.send({
        from: "admin@dhevvpremium.shop",
        to: email, // Changed from array to string
        subject: `Struk Pembelian ${orderId} - Dhevv Premium`,
        html: htmlTemplate,
      });

      if (error) {
        console.error("Resend Error Detail:", JSON.stringify(error, null, 2));
        return res.status(400).json({ 
          error: error.message || "Email validation failed.",
          raw: error
        });
      }

      res.status(200).json({ success: true, id: data?.id });
    } catch (error: any) {
      console.error("Server Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
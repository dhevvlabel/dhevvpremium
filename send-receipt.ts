import { Resend } from 'resend';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { orderId, email, customerName, phoneNumber, products, voucher, total } = await req.json();

    const resendKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;
    if (!resendKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
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
            <div class="info-row"><span class="value">Akan dikirimkan oleh admin melalui WhatsApp</span></div>
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
      from: "Dhevv Premium <admin@dhevvpremium.shop>",
      to: [email],
      subject: `Invoice Pembelian #${orderId} - Dhevv Premium`,
      html: htmlTemplate
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

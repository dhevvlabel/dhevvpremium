import { supabase } from '../lib/supabase';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
      return res.status(500).json({ error: "Midtrans configuration not found in database." });
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
  } catch (error: any) {
    console.error("Server error creating payment:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}

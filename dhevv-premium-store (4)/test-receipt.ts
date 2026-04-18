import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/send-receipt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId: 'DP/20260406/1234',
      email: 'test@example.com',
      customerName: 'Test User',
      phoneNumber: '081234567890',
      accountDetails: 'Username: test, Password: password',
      orderDate: '2026-04-06',
      products: [{ name: 'Test Product', price: 10000 }],
      voucher: { code: 'TEST10', discount: 1000 },
      total: 9000
    })
  });
  const text = await res.text();
  console.log(res.status, text);
}

test();

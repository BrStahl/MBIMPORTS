import express from 'express';
import { createServer as createViteServer } from 'vite';
import Stripe from 'stripe';
import path from 'path';

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }
    stripeClient = new Stripe(key, { apiVersion: '2023-10-16' as any });
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post('/api/create-checkout-session', async (req, res) => {
    try {
      const { items, pedidoId, valorFrete } = req.body;
      const stripe = getStripe();
      
      const line_items = items.map((item: any) => ({
        price_data: {
          currency: 'brl',
          product_data: {
            name: item.name,
            images: item.image ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
        },
        quantity: item.quantity,
      }));

      if (valorFrete && Number(valorFrete) > 0) {
        line_items.push({
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'Frete',
            },
            unit_amount: Math.round(Number(valorFrete) * 100),
          },
          quantity: 1,
        });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        client_reference_id: pedidoId ? String(pedidoId) : undefined,
        metadata: {
          pedidoId: pedidoId ? String(pedidoId) : '',
          cart: JSON.stringify(items),
          valorFrete: valorFrete ? String(valorFrete) : '0',
        },
        line_items,
        mode: 'payment',
        success_url: `${req.headers.origin}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error('Error creating checkout session', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/checkout-session', async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ error: 'Session ID is required' });
      }

      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(session_id, {
        expand: ['line_items', 'customer']
      });

      res.json(session);
    } catch (error: any) {
      console.error('Error retrieving checkout session', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/calculate-shipping', async (req, res) => {
    try {
      const { cep_destino } = req.body;

      if (!cep_destino) {
        return res.status(400).json({ error: 'CEP de destino é obrigatório' });
      }

      const token = process.env.MELHOR_ENVIO_TOKEN;

      if (!token) {
        // Mock se não houver token
        return res.status(200).json([
          {
            id: 1,
            name: 'PAC (Mock)',
            price: 25.50,
            custom_delivery_time: 5,
            company: { name: 'Correios' },
          },
          {
            id: 2,
            name: 'SEDEX (Mock)',
            price: 45.00,
            custom_delivery_time: 2,
            company: { name: 'Correios' },
          }
        ]);
      }

      const cepOrigem = process.env.CEP_ORIGEM || '01001000'; // Default CEP
      const payload = {
        from: { postal_code: cepOrigem },
        to: { postal_code: cep_destino.replace(/\D/g, '') },
        products: [
          {
            id: "1",
            width: 20,
            height: 10,
            length: 30,
            weight: 1.0,
            insurance_value: 100.0,
            quantity: 1,
          }
        ]
      };

      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://www.melhorenvio.com.br/api/v2' 
        : 'https://sandbox.melhorenvio.com.br/api/v2';

      const response = await fetch(`${baseUrl}/me/shipment/calculate`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Falha ao calcular frete na Melhor Envio');
      }

      const data = await response.json();
      const validOptions = data
        .filter((opt: any) => !opt.error)
        .map((opt: any) => ({
          id: opt.id,
          name: opt.name,
          price: parseFloat(opt.price),
          custom_delivery_time: opt.custom_delivery_time,
          company: opt.company
        }));

      res.status(200).json(validOptions);
    } catch (error: any) {
      console.error('Error calculating shipping', error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

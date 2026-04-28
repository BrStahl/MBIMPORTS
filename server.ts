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
      const { items } = req.body;
      const stripe = getStripe();
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        shipping_address_collection: {
          allowed_countries: ['BR'],
        },
        metadata: {
          cart: JSON.stringify(items),
        },
        line_items: items.map((item: any) => ({
          price_data: {
            currency: 'brl',
            product_data: {
              name: item.name,
              images: item.image ? [item.image] : [],
            },
            unit_amount: Math.round(item.price * 100), // Stripe expects amounts in cents
          },
          quantity: item.quantity,
        })),
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

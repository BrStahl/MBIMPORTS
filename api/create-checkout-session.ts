import Stripe from 'stripe';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, pedidoId, valorFrete } = req.body;
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2023-10-16' as any
    });

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
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
      success_url: `${req.headers.origin || req.headers.referer || 'https://' + req.headers.host}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || req.headers.referer || 'https://' + req.headers.host}/?canceled=true`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Error creating checkout session', error);
    res.status(500).json({ error: error.message });
  }
}

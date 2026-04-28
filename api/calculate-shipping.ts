import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { cep_destino } = req.body;

  if (!cep_destino) {
    return res.status(400).json({ error: 'CEP de destino é obrigatório' });
  }

  const token = process.env.MELHOR_ENVIO_TOKEN;

  if (!token) {
    // Retornamos dados mockados se não houver token configurado,
    // para que a interface continue funcionando durante o desenvolvimento.
    console.warn('MELHOR_ENVIO_TOKEN não configurado. Retornando dados mockados.');
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

  try {
    // Configuração de exemplo para requisição à Melhor Envio
    // CEP de origem deve ser configurado como variável de ambiente (ex: VITE_CEP_ORIGEM)
    const cepOrigem = process.env.CEP_ORIGEM || '01001000'; // CEP padrão (Sé, SP)

    const payload = {
      from: {
        postal_code: cepOrigem,
      },
      to: {
        postal_code: cep_destino.replace(/\D/g, ''),
      },
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

    // A URL base muda entre sandbox e produção
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
      const errorText = await response.text();
      console.error('Erro na API Melhor Envio', errorText);
      throw new Error('Falha ao calcular frete na Melhor Envio');
    }

    const data = await response.json();
    
    // Filtrar opções que possuem erro e formatar a resposta
    const validOptions = data
      .filter((option: any) => !option.error)
      .map((option: any) => ({
        id: option.id,
        name: option.name,
        price: parseFloat(option.price),
        custom_delivery_time: option.custom_delivery_time,
        company: option.company
      }));

    res.status(200).json(validOptions);
  } catch (error: any) {
    console.error('Erro ao calcular frete', error);
    res.status(500).json({ error: error.message });
  }
}

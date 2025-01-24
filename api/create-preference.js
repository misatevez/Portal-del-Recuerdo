import mercadopago from 'mercadopago';

    mercadopago.configure({
      access_token: process.env.MP_PRIVATE_KEY,
    });

    export default async function handler(req, res) {
      if (req.method === 'POST') {
        try {
          const { planId, title, price, quantity } = req.body;

          const preference = {
            items: [
              {
                id: planId,
                title: title,
                quantity: quantity,
                unit_price: price,
              },
            ],
            back_urls: {
              success: `${process.env.APP_URL}/perfil`,
              failure: `${process.env.APP_URL}/precios`,
              pending: `${process.env.APP_URL}/precios`,
            },
            auto_return: 'approved',
          };

          const response = await mercadopago.preferences.create(preference);

          res.status(200).json({
            id: response.body.id,
            init_point: response.body.init_point,
          });
        } catch (error) {
          console.error('Error creating preference:', error);
          res.status(500).json({ error: 'Error al crear preferencia de pago' });
        }
      } else {
        res.status(405).json({ error: 'Method not allowed' });
      }
    }

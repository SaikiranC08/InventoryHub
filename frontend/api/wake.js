export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed'
    });
  }

  const azureKey = process.env.AZURE_FUNCTION_KEY;

  if (!azureKey) {
    return res.status(500).json({
      error: 'AZURE_FUNCTION_KEY is missing in Vercel'
    });
  }

  try {
    const azureEndpoint =
      'https://inventoryhub-vm-controller-chb9gsgka2fu.centralindia-01.azurewebsites.net/api/wake';

    const azureResponse = await fetch(azureEndpoint, {
      method: 'GET',
      headers: {
        'x-functions-key': azureKey
      }
    });

    const text = await azureResponse.text();

    return res.status(azureResponse.status).json({
      azureStatus: azureResponse.status,
      azureResponse: text
    });

  } catch (error) {
    return res.status(500).json({
      error: 'Vercel failed to call Azure Function',
      message: error?.message || 'Unknown error'
    });
  }
}
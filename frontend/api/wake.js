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
      'https://inventoryhub-vm-controller-chb9gsbre9gka2fu.centralindia-01.azurewebsites.net/api/wake';

    const azureResponse = await fetch(azureEndpoint, {
      method: 'GET',
      headers: {
        'x-functions-key': azureKey
      }
    });

    const data = await azureResponse.json().catch(() => ({}));

    return res.status(azureResponse.status).json(data);

  } catch (error) {
    return res.status(500).json({
      error: 'Vercel failed to call Azure Function',
      message: error?.message || 'Unknown error'
    });
  }
}
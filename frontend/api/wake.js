export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed'
    });
  }

  const azureKey = process.env.AZURE_FUNCTION_KEY;

  if (!azureKey) {
    return res.status(500).json({
      error: 'AZURE_FUNCTION_KEY is not configured'
    });
  }

  try {
    const azureResponse = await fetch(
      'https://inventoryhub-vm-controller-chb9gsgka2fu.centralindia-01.azurewebsites.net/api/wake',
      {
        method: 'GET',
        headers: {
          'x-functions-key': azureKey
        }
      }
    );

    const data = await azureResponse.json().catch(() => ({}));

    return res.status(azureResponse.status).json(data);

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to trigger Azure Function'
    });
  }
}
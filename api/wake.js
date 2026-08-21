export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please send a POST request.' });
  }

  const azureKey = process.env.AZURE_FUNCTION_KEY;
  if (!azureKey) {
    return res.status(500).json({ error: 'AZURE_FUNCTION_KEY environment variable is not configured on Vercel.' });
  }

  try {
    const azureEndpoint = `https://inventoryhub-vm-controller-chb9gsbre9gka2fu.centralindia-01.azurewebsites.net/api/wake?code=${encodeURIComponent(azureKey)}`;
    const azureResponse = await fetch(azureEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await azureResponse.json().catch(() => ({}));
    return res.status(azureResponse.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to trigger Azure Function endpoint.' });
  }
}

export default function handler(req, res) {
  const token = req.headers['x-auth-token'];
  if (token !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    LEADS_TABLE_ID: process.env.LEADS_TABLE_ID,
    CLIENTS_TABLE_ID: process.env.CLIENTS_TABLE_ID,
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
  });
}

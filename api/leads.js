export default async function handler(req, res) {
  const token = req.headers['x-auth-token'];
  if (token !== process.env.APP_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.LEADS_TABLE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  try {
    let allRecords = [];
    let offset = null;
    const filter = encodeURIComponent('{client}=BLANK()');

    do {
      let url = `https://api.airtable.com/v0/${baseId}/${tableId}?filterByFormula=${filter}`;
      if (offset) url += `&offset=${offset}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Airtable API error: ${response.status}` });
      }

      const data = await response.json();
      allRecords = allRecords.concat(data.records);
      offset = data.offset;
    } while (offset);

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ records: allRecords });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

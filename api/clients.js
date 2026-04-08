export default async function handler(req, res) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableId = process.env.CLIENTS_TABLE_ID;
  const apiKey = process.env.AIRTABLE_API_KEY;

  try {
    let allRecords = [];
    let offset = null;

    do {
      let url = `https://api.airtable.com/v0/${baseId}/${tableId}`;
      if (offset) url += `?offset=${offset}`;

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

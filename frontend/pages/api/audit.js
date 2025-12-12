export default function handler(req, res) {
    if (req.method === 'POST') {
        res.status(200).json({ success: true, id: 'AUD-' + Date.now() });
    } else {
        res.status(200).json({ history: [] }); // Placeholder
    }
}

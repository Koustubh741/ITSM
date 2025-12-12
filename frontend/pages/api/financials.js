export default function handler(req, res) {
    res.status(200).json({
        total_spend: 1250000,
        // ... (API logic essentially duplicate of mock state for now, but provides endpoint)
        status: 'ok'
    });
}

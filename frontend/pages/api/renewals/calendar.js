export default function handler(req, res) {
    // Generate random events for the current and surrounding months
    const today = new Date();
    const events = [];

    // Helper to add random days
    const getRandomDate = (baseDate, range) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + Math.floor(Math.random() * range) - (range / 2));
        return d.toISOString().split('T')[0];
    };

    // Generate 20 events
    for (let i = 0; i < 20; i++) {
        const isWarranty = Math.random() > 0.5;
        events.push({
            id: i,
            title: isWarranty ? 'Warranty Expiration' : 'License Renewal',
            type: isWarranty ? 'Warranty' : 'Contract',
            date: getRandomDate(today, 60), // +/- 30 days
            asset: `Asset-${1000 + i}`,
            cost: isWarranty ? 0 : Math.floor(Math.random() * 500)
        });
    }

    res.status(200).json(events);
}

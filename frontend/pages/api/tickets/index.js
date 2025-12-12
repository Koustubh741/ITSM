export default function handler(req, res) {
    const { id } = req.query;

    if (id) {
        // Return single ticket details
        res.status(200).json({
            id: id,
            subject: 'Laptop Screen Flicker',
            description: 'Screen flickers when brightness is above 50%.',
            priority: 'High',
            status: 'Open',
            user: 'Sarah Connor',
            created: '2023-12-10',
            asset: 'AST-1001 (MacBook Pro)',
            history: [
                { date: '2023-12-10 09:00', user: 'Sarah Connor', action: 'Ticket Created' },
                { date: '2023-12-10 10:15', user: 'Help Desk', action: 'Status changed to Open' }
            ]
        });
    } else {
        // Return list
        res.status(200).json([
            { id: 'TCK-2023-001', subject: 'Laptop Screen Flicker', priority: 'High', status: 'Open', user: 'Sarah Connor', created: '2023-12-10' },
            { id: 'TCK-2023-002', subject: 'Software Install Request', priority: 'Low', status: 'Pending', user: 'Kyle Reese', created: '2023-12-09' },
            { id: 'TCK-2023-003', subject: 'Keyboard Replacement', priority: 'Medium', status: 'Closed', user: 'T-800', created: '2023-12-08' },
        ]);
    }
}

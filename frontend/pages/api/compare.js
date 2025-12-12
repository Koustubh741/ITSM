export default function handler(req, res) {
    const { id1, id2 } = req.query;

    // Simulate delay
    // await new Promise(resolve => setTimeout(resolve, 500));

    const mockSpecs = (id) => ({
        model: `X1 Carbon Gen ${Math.floor(Math.random() * 5) + 5}`,
        processor: `Intel Core i${Math.random() > 0.5 ? '7' : '5'} 11th Gen`,
        ram: Math.random() > 0.5 ? '16GB DDR4' : '32GB DDR4',
        storage: '512GB NVMe SSD',
        graphics: 'Intel Iris Xe',
        purchase_date: '2023-01-15',
        warranty: '3 Years On-site',
        cost: `$${(Math.random() * 1000 + 1000).toFixed(2)}`
    });

    res.status(200).json({
        asset1: {
            id: id1,
            name: `Asset ${id1}`,
            specs: mockSpecs(id1),
            condition: 'Excellent'
        },
        asset2: {
            id: id2,
            name: `Asset ${id2}`,
            specs: mockSpecs(id2),
            condition: 'Good'
        }
    });
}

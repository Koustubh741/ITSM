export default function handler(req, res) {
    const roles = ['Software Engineer', 'Product Manager', 'HR Specialist', 'Sales Exec', 'System Admin'];
    const users = Array.from({ length: 12 }).map((_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        role: roles[i % roles.length],
        status: i === 10 ? 'On Leave' : 'Active',
        assets_count: Math.floor(Math.random() * 3) + 1,
        software_count: Math.floor(Math.random() * 5) + 2,
        tickets_count: Math.floor(Math.random() * 2)
    }));

    res.status(200).json(users);
}

from database import engine
from sqlalchemy import text

conn = engine.connect()
result = conn.execute(text('SELECT email, role FROM users LIMIT 5'))
print('Users:')
for row in result:
    print(f'  - {row[0]} ({row[1]})')

result = conn.execute(text('SELECT COUNT(*) FROM assets'))
print(f'\nAssets: {result.scalar()}')
conn.close()

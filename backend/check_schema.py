from database import engine
from sqlalchemy import text, inspect

def check_database_schema():
    try:
        with engine.connect() as connection:
            # Check if assets table exists
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            print("\n=== DATABASE SCHEMA CHECK ===")
            print(f"Database: {engine.url.database}")
            print(f"\nAvailable tables: {tables}")
            
            if 'assets' in tables:
                print("\n✅ 'assets' table EXISTS")
                
                # Get column info
                columns = inspector.get_columns('assets')
                print("\nColumns in 'assets' table:")
                for col in columns:
                    print(f"  - {col['name']}: {col['type']}")
                
                # Count rows
                result = connection.execute(text("SELECT COUNT(*) FROM assets"))
                count = result.scalar()
                print(f"\nTotal rows in 'assets': {count}")
                
                # Get sample data
                if count > 0:
                    result = connection.execute(text("SELECT * FROM assets LIMIT 3"))
                    print("\nSample data (first 3 rows):")
                    for row in result:
                        print(f"  {dict(row._mapping)}")
            else:
                print("\n❌ 'assets' table DOES NOT EXIST")
                print("The table needs to be created!")
                
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_database_schema()

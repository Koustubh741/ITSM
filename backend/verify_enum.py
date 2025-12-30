from models import UserRole
import enum

print(f"UserRole members: {list(UserRole)}")
print(f"Value of SYSTEM_ADMIN: '{UserRole.SYSTEM_ADMIN.value}'")

try:
    r = UserRole("system_admin")
    print(f"Lookup 'system_admin' success: {r}")
except Exception as e:
    print(f"Lookup 'system_admin' failed: {e}")

try:
    r = UserRole("system_admin ") # Trailing space?
    print(f"Lookup 'system_admin ' success: {r}")
except Exception as e:
    print(f"Lookup 'system_admin ' failed: {e}")

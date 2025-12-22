import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useRole } from '@/contexts/RoleContext';

const ROLE_DASHBOARD_MAP = {
    'System Admin': '/dashboard/system-admin',
    'Asset & Inventory Manager': '/dashboard/asset-inventory-manager',
    'Procurement & Finance': '/dashboard/procurement-finance',
    'IT Management': '/dashboard/it-management',
    'End User': '/dashboard/end-user'
};

export default function AuthGuard({ children }) {
    const { isAuthenticated, currentRole, ROLES, isLoading } = useRole();
    const router = useRouter();
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        if (isLoading) return; // Wait for hydration

        const checkAuth = () => {
            const currentPath = router.asPath.split('?')[0];
            const isLoginPage = currentPath === '/login';

            if (!isAuthenticated) {
                // Not authenticated
                if (!isLoginPage) {
                    router.push('/login');
                } else {
                    setAuthorized(true);
                }
            } else {
                // Authenticated
                if (currentPath === '/') {
                    // Redirect root to user's dashboard
                    const targetPath = ROLE_DASHBOARD_MAP[currentRole.label] || '/dashboard/end-user';
                    router.push(targetPath);
                } else if (isLoginPage) {
                    // Allow access to login page even if authenticated (User Request)
                    setAuthorized(true);
                } else {
                    // ALLOW current route. 
                    // Do NOT redirect even if it doesn't match the "default" dashboard for the role.
                    // This fixes the reload issue where it forces you back to default.
                    setAuthorized(true);
                }
            }
        };

        checkAuth();

    }, [isAuthenticated, currentRole, router.asPath, isLoading]);

    // Show loading state while hydrating or unauthorized/redirecting
    if (isLoading || (!authorized && router.pathname !== '/login')) {
        // Render a blank dark background to prevent white flash, but no "Loading..." text to reduce "different page" feel
        return <div className="min-h-screen bg-slate-950" />;
    }

    return children;
}

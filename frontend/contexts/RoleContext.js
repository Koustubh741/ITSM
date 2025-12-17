import { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const ROLES = [
    { label: 'System Admin', dept: 'IT Dept' },
    { label: 'Asset & Inventory Manager', dept: 'Asset Mgmt' },
    { label: 'Procurement & Finance', dept: 'Finance' },
    { label: 'IT Management', dept: 'IT Dept' },
    { label: 'End User', dept: 'Employee' },
];

export function RoleProvider({ children }) {
    const [currentRole, setCurrentRole] = useState(ROLES[0]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem('auth_session');
            if (session) {
                try {
                    const parsed = JSON.parse(session);
                    if (parsed.isAuthenticated) {
                        setIsAuthenticated(true);
                        setUser({ name: parsed.userName, location: parsed.location });
                        const savedRole = ROLES.find(r => r.label === parsed.role) || ROLES[0];
                        setCurrentRole(savedRole);
                    }
                } catch (e) {
                    console.error("Failed to parse auth session", e);
                }
            }
        }
        setIsLoading(false);
    }, []);

    // Persist role changes to localStorage automatically to prevent reset on reload
    useEffect(() => {
        if (!isLoading && isAuthenticated && user && currentRole) {
            const session = {
                isAuthenticated: true,
                userName: user.name,
                location: user.location,
                role: currentRole.label // Ensure updated role is saved
            };
            localStorage.setItem('auth_session', JSON.stringify(session));
        }
    }, [currentRole, isAuthenticated, user, isLoading]);

    const login = (userData) => {
        setIsAuthenticated(true);
        setUser({ name: userData.userName, location: userData.location });
        const roleObj = ROLES.find(r => r.label === userData.role) || ROLES[0];
        setCurrentRole(roleObj);

        localStorage.setItem('auth_session', JSON.stringify({
            isAuthenticated: true,
            userName: userData.userName,
            role: userData.role,
            location: userData.location
        }));
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        setCurrentRole(ROLES[0]);
        localStorage.removeItem('auth_session');
    };

    return (
        <RoleContext.Provider value={{ currentRole, setCurrentRole, ROLES, isAuthenticated, user, login, logout, isLoading }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    return useContext(RoleContext);
}

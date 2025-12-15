import { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export const ROLES = [
    { label: 'System Admin', dept: 'IT Dept' },
    { label: 'Asset Manager', dept: 'IT Asset' },
    { label: 'Asset Owner', dept: 'Operations' },
    { label: 'Custodian', dept: 'Logistics' },
    { label: 'Inventory Manager', dept: 'Warehouse' },
    { label: 'Procurement Manager', dept: 'Procurement' },
    { label: 'IT Support', dept: 'Helpdesk' },
    { label: 'Audit Officer', dept: 'Compliance' },
    { label: 'Finance', dept: 'Accounts' },
    { label: 'End User', dept: 'Employee' },
];

export function RoleProvider({ children }) {
    const [currentRole, setCurrentRole] = useState(ROLES[0]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    // Initialize from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem('auth_session');
            if (session) {
                const parsed = JSON.parse(session);
                if (parsed.isAuthenticated) {
                    setIsAuthenticated(true);
                    setUser({ name: parsed.userName, location: parsed.location });
                    const savedRole = ROLES.find(r => r.label === parsed.role) || ROLES[0];
                    setCurrentRole(savedRole);
                }
            }
        }
    }, []);

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
        <RoleContext.Provider value={{ currentRole, setCurrentRole, ROLES, isAuthenticated, user, login, logout }}>
            {children}
        </RoleContext.Provider>
    );
}

export function useRole() {
    return useContext(RoleContext);
}

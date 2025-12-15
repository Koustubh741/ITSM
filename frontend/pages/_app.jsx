import '@/styles/globals.css'
import Layout from '@/components/Layout'
import { RoleProvider } from '@/contexts/RoleContext'
import AuthGuard from '@/components/AuthGuard'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
    const router = useRouter();
    const isLoginPage = router.pathname === '/login';

    return (
        <RoleProvider>
            <AuthGuard>
                {isLoginPage ? (
                    <Component {...pageProps} />
                ) : (
                    <Layout>
                        <Component {...pageProps} />
                    </Layout>
                )}
            </AuthGuard>
        </RoleProvider>
    )
}

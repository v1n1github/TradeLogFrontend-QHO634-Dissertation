import '../styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '../context/AuthContext';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }) {
  // Login page renders without the main Layout (no nav)
  const noLayout = Component.noLayout;
  return (
    <AuthProvider>
      {noLayout ? (
        <>
          <Component {...pageProps} />
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#13131f', color: '#e2e8f0', border: '1px solid #1e1e30', borderRadius: '10px', fontSize: '14px' }, success: { iconTheme: { primary: '#10b981', secondary: '#080810' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#080810' } } }} />
        </>
      ) : (
        <Layout>
          <Component {...pageProps} />
          <Toaster position="top-right" toastOptions={{ duration: 4000, style: { background: '#13131f', color: '#e2e8f0', border: '1px solid #1e1e30', borderRadius: '10px', fontSize: '14px' }, success: { iconTheme: { primary: '#10b981', secondary: '#080810' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#080810' } } }} />
        </Layout>
      )}
    </AuthProvider>
  );
}

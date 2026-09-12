import { Outlet } from 'react-router-dom';
import SkipLink from './SkipLink';
import Header from './Header';
import Footer from './Footer';
import ConnectivityBanner from '../status/ConnectivityBanner';

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <SkipLink />
      <Header />
      <ConnectivityBanner />
      <main id="main-content" className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

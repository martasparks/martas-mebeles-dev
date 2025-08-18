import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import '../globals.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </AuthProvider>
    </ToastProvider>
  );
}
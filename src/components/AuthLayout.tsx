
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthLayout({ children, requireAdmin = false }: AuthLayoutProps) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  // Check if user has admin role (based on public metadata)
  const isAdmin = user?.publicMetadata?.role === 'admin';
  
  if (requireAdmin && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-600">You need administrator privileges to access this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}

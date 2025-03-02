
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { Spinner } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function AuthLayout({ children, requireAdmin = false }: AuthLayoutProps) {
  const { isLoaded, isSignedIn, user } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to="/sign-in" />;
  }

  // Check if user has admin role (based on public metadata)
  const isAdmin = user?.publicMetadata?.role === 'admin';
  
  // For testing purposes - in development, you can uncomment this line to simulate admin access
  // const isAdmin = true;
  
  if (requireAdmin && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-600">You need administrator privileges to access this page.</p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h2 className="text-lg font-semibold text-yellow-800">How to get admin access:</h2>
          <p className="text-sm text-yellow-700 mt-2">
            Admin access is controlled through Clerk's user metadata. To grant admin access:
          </p>
          <ol className="list-decimal ml-5 mt-2 text-sm text-yellow-700">
            <li>Go to the Clerk Dashboard</li>
            <li>Find your user in the Users section</li>
            <li>Edit the Public Metadata to include: {`{"role": "admin"}`}</li>
            <li>Save the changes</li>
          </ol>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

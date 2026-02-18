import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { useOnboardingStatus } from "@/hooks/useOnboarding";
import { useAdmin } from "@/hooks/useAdmin";
import { useDeviceGuard } from "@/hooks/useDeviceGuard";
import DeviceChangeModal from "@/components/DeviceChangeModal";

const ProtectedRoute = ({ children, skipOnboardingCheck = false }: { children: React.ReactNode; skipOnboardingCheck?: boolean }) => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const { data: onboardingCompleted, isLoading: onboardingLoading } = useOnboardingStatus();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { status: deviceStatus, confirmDeviceChange } = useDeviceGuard(user?.id, isAdmin);

  const onboardingStillLoading = user && !skipOnboardingCheck && (onboardingLoading || onboardingCompleted === null);

  if (loading || onboardingStillLoading || (user && adminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Device guard — wait for check
  if (deviceStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Verificando dispositivo...</p>
      </div>
    );
  }

  if (deviceStatus === "mismatch") {
    return (
      <DeviceChangeModal
        open={true}
        onConfirm={confirmDeviceChange}
        onCancel={() => signOut()}
      />
    );
  }

  if (!skipOnboardingCheck && onboardingCompleted === false && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

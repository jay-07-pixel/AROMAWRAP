import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  getUserProfile,
  mapApiUserToProfile,
  mapApiUserToSessionUser,
  SessionUser,
  UserProfile,
} from "@/services/authService";
import { apiGetMe } from "@/services/apiAuthService";
import { subscribeAuthSession } from "@/services/authSession";

interface AuthContextType {
  user: SessionUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const apiUser = await apiGetMe();

      if (!apiUser) {
        setUser(null);
        setUserProfile(null);
        return;
      }

      const sessionUser = mapApiUserToSessionUser(apiUser);
      setUser(sessionUser);

      try {
        const profile = await getUserProfile(apiUser.id);
        setUserProfile(profile ?? mapApiUserToProfile(apiUser));
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUserProfile(mapApiUserToProfile(apiUser));
      }
    } catch (error) {
      console.error("Error fetching auth session:", error);
      setUser(null);
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      setLoading(true);
      await refreshSession();
      if (active) {
        setLoading(false);
      }
    };

    loadSession();

    const unsubscribe = subscribeAuthSession(async () => {
      await refreshSession();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [refreshSession]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

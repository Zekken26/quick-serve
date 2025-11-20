import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sampleUsers, User } from "@/lib/data";

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (
    email: string,
    password: string,
    metadata: Record<string, any>,
    opts?: { silent?: boolean }
  ) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check localStorage for persisted user
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Find user in sample data
    const foundUser = sampleUsers.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      toast({ title: "Invalid credentials", description: "Please check your email and password", variant: "destructive" });
      throw new Error("Invalid credentials");
    }

    const authUser: AuthUser = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role
    };

    setUser(authUser);
    localStorage.setItem('currentUser', JSON.stringify(authUser));

    toast({ title: "Welcome back!", description: "Signed in successfully." });
    return foundUser.role === 'admin';
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: Record<string, any>,
    opts?: { silent?: boolean }
  ) => {
    // For demo, just simulate signup success
    if (!opts?.silent) {
      toast({ title: "Account created!", description: "Welcome aboard." });
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate("/");
    toast({ title: "Signed out", description: "You have been signed out successfully" });
  };

  const getIdToken = async () => {
    // Return a dummy token for demo
    return "demo-token";
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signIn, signUp, signOut, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

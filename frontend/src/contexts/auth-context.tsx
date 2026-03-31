import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Call backend to get current session/user
    // For now, mock a user or keep it null
    setTimeout(() => {
      setUser(null);
      setLoading(false);
    }, 500);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // TODO: Call backend to sign up
      const mockUser: User = {
        id: '1',
        email,
        user_metadata: { full_name: fullName },
      };
      
      setUser(mockUser);
      toast({
        title: 'Đăng ký thành công',
        description: 'Chào mừng bạn đến với Expense Tracker!',
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi đăng ký',
        description: error.message || 'Có lỗi xảy ra khi đăng ký',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // TODO: Call backend to sign in
      const mockUser: User = {
        id: '1',
        email,
        user_metadata: { full_name: 'Người dùng Demo' },
      };

      setUser(mockUser);
      toast({
        title: 'Đăng nhập thành công',
        description: `Xin chào, ${mockUser.user_metadata.full_name || 'bạn'}!`,
      });
      navigate('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi đăng nhập',
        description: error.message || 'Email hoặc mật khẩu không đúng',
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // TODO: Call backend to sign out
      setUser(null);
      toast({
        title: 'Đăng xuất thành công',
        description: 'Hẹn gặp lại bạn!',
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi đăng xuất',
        description: error.message,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/types';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<{ requiresOtp?: boolean } | void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  updateProfile: (data: { name?: string; avatar?: string }) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getErrorMessage(error: unknown) {
  const anyErr = error as any;
  return (
    anyErr?.response?.data?.message ||
    anyErr?.message ||
    anyErr?.error ||
    anyErr?.msg ||
    anyErr?.data?.message ||
    'Có lỗi xảy ra'
  );
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const response: any = await api.get('/users/me');
        if (response.success && response.data) {
          const userData = response.data;
          setUser({
             id: userData._id || userData.id,
             name: userData.name,
             email: userData.email,
             role: userData.role,
             avatar: userData.avatar
          });
        } else {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('Failed to load profile', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response: any = await api.post('/auth/register', {
        name: fullName,
        email,
        password
      });
      
      if (response.success) {
        toast({
          title: 'Đăng ký thành công',
          description: 'Vui lòng kiểm tra email để lấy mã OTP xác thực.',
        });
        return true;
      }
      return false;
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi đăng ký',
        description: getErrorMessage(error) || 'Có lỗi xảy ra khi đăng ký',
      });
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response: any = await api.post('/auth/verify-otp', { email, otp });
      if (response.success) {
        toast({
          title: 'Xác thực thành công',
          description: 'Tài khoản của bạn đã được kích hoạt. Hãy Đăng nhập để tiếp tục!',
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi xác thực',
        description: getErrorMessage(error) || 'Mã OTP không hợp lệ',
      });
      throw error;
    }
  };

  const resendOtp = async (email: string) => {
    try {
      const response: any = await api.post('/auth/resend-otp', { email });
      if (response.success) {
        toast({
          title: 'Thành công',
          description: 'Mã OTP đã được gửi lại vào email của bạn.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi gửi OTP',
        description: getErrorMessage(error) || 'Không thể gửi lại mã OTP',
      });
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const response: any = await api.post('/auth/forgot-password', { email });
      if (response.success) {
        toast({
          title: 'Đã gửi OTP',
          description: 'Vui lòng kiểm tra email để lấy mã OTP khôi phục mật khẩu.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi khôi phục mật khẩu',
        description: getErrorMessage(error) || 'Không thể gửi OTP khôi phục mật khẩu',
      });
      throw error;
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string) => {
    try {
      const response: any = await api.post('/auth/reset-password', { email, otp, newPassword });
      if (response.success) {
        toast({
          title: 'Đặt lại mật khẩu thành công',
          description: 'Bạn có thể đăng nhập bằng mật khẩu mới.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi đặt lại mật khẩu',
        description: getErrorMessage(error) || 'Không thể đặt lại mật khẩu',
      });
      throw error;
    }
  };

  const updateProfile = async (data: { name?: string; avatar?: string }) => {
    try {
      const res: any = await api.put('/users/me', data);
      const userData = res?.data ?? res;
      if (res?.success && userData) {
        setUser((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            name: userData.name ?? prev.name,
            avatar: userData.avatar ?? prev.avatar,
          };
        });
        toast({
          title: 'Thành công',
          description: 'Cập nhật thông tin tài khoản thành công',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: getErrorMessage(error) || 'Không thể cập nhật thông tin',
      });
      throw error;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const res: any = await api.put('/users/password', { oldPassword, newPassword });
      if (res?.success) {
        toast({
          title: 'Thành công',
          description: 'Đổi mật khẩu thành công',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: getErrorMessage(error) || 'Không thể đổi mật khẩu',
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response: any = await api.post('/auth/login', {
        email,
        password
      });

      if (response.success) {
        const token = response.token;
        const userData = response.data;
        localStorage.setItem('token', token);
        
        setUser({
           id: userData._id || userData.id,
           email: userData.email,
           name: userData.name,
           role: userData.role,
           avatar: userData.avatar
        });

        toast({
          title: 'Đăng nhập thành công',
          description: `Xin chào, ${userData.name || 'bạn'}!`,
        });
        navigate('/');
      }
    } catch (error: any) {
      const status = error?.response?.status || error?.status;
      const msg = getErrorMessage(error) || '';
      
      // Some errors may not include status (depending on interceptor / network).
      // We still want to route user to OTP screen based on backend message.
      if ((status === 403 || !status) && msg.toLowerCase().includes('chưa được xác thực')) {
        toast({
          title: 'Yêu cầu xác thực',
          description: 'Tài khoản của bạn chưa được xác thực. Vui lòng xác thực OTP trước.',
        });
        return { requiresOtp: true };
      }
      
      console.error(error);
      // Only show error toast if it's not an OTP verification error
      if (!(status === 403 && msg.toLowerCase().includes('chưa được xác thực'))) {
        toast({
          variant: 'destructive',
          title: 'Lỗi đăng nhập',
          description: msg || 'Email hoặc mật khẩu không đúng',
        });
      }
      throw error;
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('token');
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
    <AuthContext.Provider value={{ user, loading, signUp, signIn, verifyOtp, resendOtp, forgotPassword, resetPassword, updateProfile, changePassword, signOut }}>
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


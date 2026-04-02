import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wallet, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';

// Khai báo biến resendOtpLoading
const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  // Đã bỏ yêu cầu password trong schema
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { signIn, verifyOtp, resendOtp, forgotPassword, resetPassword, user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isVerifying, setIsVerifying] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [isForgotting, setIsForgotting] = useState(false);
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmNewPassword, setForgotConfirmNewPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmNewPassword, setShowForgotConfirmNewPassword] = useState(false);

  // Sửa lỗi: tạo thêm state resendOtpLoading cho forgot password
  const [resendOtpLoading, setResendOtpLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  if (user) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Khi không có password validation trong schema, password sẽ undefined trong data.
      // Để giữ cũ, ta lấy value password từ form DOM nếu muốn, hoặc đặt mặc định rỗng.
      const passwordInput = document.getElementById('password') as HTMLInputElement | null;
      const password = passwordInput?.value ?? '';
      const result = await signIn(data.email, password);
      if (result && result.requiresOtp) {
        setLoginEmail(data.email);
        setIsVerifying(true);
        // Auto send OTP when showing verification form
        await resendOtp(data.email);
      }
    } catch (error) {
      // Có thể điền thêm xử lý lỗi ở đây nếu muốn.
    } finally {
      setIsLoading(false);
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;
    setIsLoading(true);
    try {
      await verifyOtp(loginEmail, otpCode);
      // After successful verification, return to login form immediately
      setIsVerifying(false);
      setOtpCode('');
      setValue('email', loginEmail, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      // Có thể điền thêm xử lý lỗi ở đây nếu muốn.
    } finally {
      setIsLoading(false);
    }
  };

  const onResendOtp = async () => {
    setIsLoading(true);
    try {
      await resendOtp(loginEmail);
    } catch (error) {
      // Có thể điền thêm xử lý lỗi ở đây nếu muốn.
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsLoading(true);
    try {
      await forgotPassword(forgotEmail);
      setForgotStep('reset');
    } catch (error) {
      // Có thể điền thêm xử lý lỗi ở đây nếu muốn.
    } finally {
      setIsLoading(false);
    }
  };

  const onForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !forgotEmail ||
      forgotOtp.length < 6 ||
      forgotNewPassword.length < 8 ||
      forgotNewPassword !== forgotConfirmNewPassword
    ) {
      return;
    }
    setIsLoading(true);
    try {
      await resetPassword(forgotEmail, forgotOtp, forgotNewPassword);
      setIsForgotting(false);
      setForgotStep('request');
      setForgotOtp('');
      setForgotNewPassword('');
      setForgotConfirmNewPassword('');
    } catch (error) {
      // Có thể điền thêm xử lý lỗi ở đây nếu muốn.
    } finally {
      setIsLoading(false);
    }
  };

  if (isForgotting) {
    if (forgotStep === 'request') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Wallet className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Quên mật khẩu</CardTitle>
              <CardDescription>Nhập email để nhận mã OTP khôi phục mật khẩu</CardDescription>
            </CardHeader>
            <form onSubmit={onForgotRequest}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail">Email</Label>
                  <Input
                    id="forgotEmail"
                    type="email"
                    placeholder="example@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading || !forgotEmail}>
                  {isLoading ? 'Đang xử lý...' : 'Quên mật khẩu'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => {
                    setIsForgotting(false);
                    setForgotStep('request');
                    setForgotOtp('');
                    setForgotNewPassword('');
                    setForgotConfirmNewPassword('');
                    setShowForgotNewPassword(false);
                    setShowForgotConfirmNewPassword(false);
                  }}
                >
                  Quay lại đăng nhập
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Xác thực OTP</CardTitle>
            <CardDescription>Nhập mã OTP và mật khẩu mới cho {forgotEmail}</CardDescription>
          </CardHeader>
          <form onSubmit={onForgotReset}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotOtp">Mã OTP</Label>
                <Input
                  id="forgotOtp"
                  type="text"
                  placeholder="Nhập mã 6 chữ số"
                  value={forgotOtp}
                  onChange={(e) => setForgotOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="forgotNewPassword">Mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="forgotNewPassword"
                    type={showForgotNewPassword ? 'text' : 'password'}
                    placeholder="Ít nhất 8 ký tự"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showForgotNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="forgotConfirmNewPassword">Xác nhận mật khẩu mới</Label>
                <div className="relative">
                  <Input
                    id="forgotConfirmNewPassword"
                    type={showForgotConfirmNewPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu mới"
                    value={forgotConfirmNewPassword}
                    onChange={(e) => setForgotConfirmNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmNewPassword(!showForgotConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showForgotConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {forgotConfirmNewPassword.length > 0 && forgotNewPassword !== forgotConfirmNewPassword && (
                  <p className="text-sm text-destructive">Mật khẩu xác nhận không khớp</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={
                  isLoading ||
                  forgotOtp.length < 6 ||
                  forgotNewPassword.length < 8 ||
                  forgotNewPassword !== forgotConfirmNewPassword
                }
              >
                {isLoading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={async () => {
                  // Chỉ loading cho nút này
                  setResendOtpLoading(true);
                  try {
                    await forgotPassword(forgotEmail);
                  } catch (error) {
                  } finally {
                    setResendOtpLoading(false);
                  }
                }}
                disabled={resendOtpLoading}
              >
                {resendOtpLoading ? 'Đang gửi...' : 'Gửi lại OTP'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Xác thực OTP</CardTitle>
            <CardDescription>
              Tài khoản của bạn chưa được xác thực. Hãy nhập mã OTP lấy từ {loginEmail}
            </CardDescription>
          </CardHeader>
          <form onSubmit={onVerify}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpCode">Mã OTP</Label>
                <Input
                  id="otpCode"
                  type="text"
                  placeholder="Nhập mã 6 chữ số"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  maxLength={6}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading || otpCode.length < 6}>
                {isLoading ? 'Đang xác thực...' : 'Xác thực'}
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={onResendOtp} disabled={isLoading}>
                Gửi lại mã OTP
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={isLoading}
                onClick={() => {
                  setIsVerifying(false);
                  setOtpCode('');
                }}
              >
                Quay lại đăng nhập
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Đăng nhập</CardTitle>
          <CardDescription>
            Nhập thông tin để truy cập tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  // Not registered in react-hook-form anymore
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline font-medium"
                  onClick={() => {
                    setIsForgotting(true);
                    setForgotStep('request');
                    setForgotEmail('');
                    setForgotOtp('');
                    setForgotNewPassword('');
                    setForgotConfirmNewPassword('');
                  }}
                >
                  Quên mật khẩu?
                </button>
              </div>
              {/* Không lỗi password khi không validate */}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

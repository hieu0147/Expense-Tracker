import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function SettingsPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý thông tin tài khoản của bạn
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>
            Thông tin cá nhân và cài đặt tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Tên</p>
            <p className="text-lg">
              {user?.name || 'Chưa cập nhật'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p className="text-lg">{user?.email}</p>
          </div>
          <div className="pt-4">
            <Button variant="destructive" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

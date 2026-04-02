import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  FolderTree,
  PiggyBank,
  BarChart3,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Wallet,
  LogOut
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { name: 'Giao dịch', href: '/transactions', icon: Receipt },
  { name: 'Hạng mục', href: '/categories', icon: FolderTree },
  { name: 'Ngân sách', href: '/budgets', icon: PiggyBank },
  { name: 'Báo cáo', href: '/reports', icon: BarChart3 },
  { name: 'Cài đặt', href: '/settings', icon: Settings },
];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setDarkMode(!darkMode);
  };

  const userDisplayName = user?.name || user?.email || 'Người dùng';
  const userInitial = userDisplayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      {/* Top header bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b px-4 lg:px-6">
        <div className="h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <Wallet className="h-8 w-8 text-primary shrink-0" />
              <span className="font-bold text-2xl truncate">Expense Tracker</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 lg:gap-3 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="h-9 w-9"
              title="Dark/Light mode"
            >
              {darkMode ? <Sun className="h-7 w-7" /> : <Moon className="h-7 w-7" />}
            </Button>

            <div className="h-11 w-11 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-muted-foreground">{userInitial}</span>
              )}
              
            </div>

            <span className="hidden md:inline text-lg font-medium max-w-[180px] truncate mr-5">
              {userDisplayName}
            </span>

            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              onClick={signOut}
            >
              <LogOut className="h-6 w-6" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          'fixed top-16 bottom-0 left-0 z-40 w-64 bg-card border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile-only user actions in menu */}
          <div className="lg:hidden border-t p-4 space-y-3">
            <div className="flex items-center gap-3">
            <Button
                variant="ghost"
                size="icon"
                onClick={toggleDarkMode}
                className="h-8 w-8"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <div className="h-10 w-10 rounded-full overflow-hidden border bg-muted flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold text-muted-foreground">{userInitial}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{userDisplayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>

            

            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => {
                setSidebarOpen(false);
                signOut();
              }}
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64 pt-16">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@features/auth/hooks/useAuth';
import { ROUTES } from '@constants';
import toast from 'react-hot-toast';
import { authService } from '@features/auth/services/auth.service';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { User, Shield, ArrowLeft, Mail, Lock, LogIn, Info } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'STAFF' | 'ADMIN' | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const navigate = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const roleContext = authService.getRoleContext();
      if (roleContext) {
        if (user.role === 'ADMIN' && roleContext === 'ADMIN') {
          navigate(`${ROUTES.ADMIN_DASHBOARD}?tab=overview`, { replace: true });
        } else if (user.role === 'STAFF' && roleContext === 'STAFF') {
          navigate(ROUTES.HOME, { replace: true });
        }
      }
    }
  }, [isAuthenticated, user, authLoading, navigate]);

  const handleRoleSelect = (role: 'STAFF' | 'ADMIN') => {
    setSelectedRole(role);
    setEmail('');
    setPassword('');
  };

  const handleBack = () => {
    setSelectedRole(null);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (!selectedRole) {
      toast.error('Vui lòng chọn vai trò');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password }, selectedRole);
    } catch {
      // Error handled in login
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden font-sans">
      {/* Premium Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-orange-100/50 rounded-full blur-[100px]" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]" />

      {/* Vertical Content Stack */}
      <div className="w-full max-w-[420px] flex flex-col gap-8 z-10 animate-fade-in">
        {/* Branding */}
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-black text-primary tracking-tighter drop-shadow-sm italic">
            OCHA
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="h-[2px] w-8 bg-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Smart POS solution</span>
            <div className="h-[2px] w-8 bg-slate-300" />
          </div>
        </div>

        {/* Auth Container */}
        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden bg-white/90 backdrop-blur-md">
          {!selectedRole ? (
            <>
              <CardHeader className="text-center pb-2 pt-8">
                <CardTitle className="text-2xl font-bold text-slate-800">Chào Mừng Trở Lại</CardTitle>
                <CardDescription className="text-slate-500">Vui lòng chọn cổng đăng nhập của bạn</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-6 px-8">
                <Button
                  onClick={() => handleRoleSelect('STAFF')}
                  variant="outline"
                  className="w-full h-auto py-6 flex flex-col items-center gap-3 border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group"
                >
                  <div className="p-3 bg-blue-100 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg text-slate-700">Nhân Viên</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Bán hàng & Gọi món</span>
                  </div>
                </Button>

                <Button
                  onClick={() => handleRoleSelect('ADMIN')}
                  variant="outline"
                  className="w-full h-auto py-6 flex flex-col items-center gap-3 border-slate-200 hover:border-orange-400 hover:bg-orange-50/50 transition-all duration-300 group"
                >
                  <div className="p-3 bg-orange-100 rounded-2xl group-hover:scale-110 group-hover:-rotate-3 transition-all">
                    <Shield className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-lg text-slate-700">Quản Trị Viên</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Thiết lập & Báo cáo</span>
                  </div>
                </Button>
              </CardContent>

              <CardFooter className="flex justify-center pb-8 opacity-40">
                <p className="text-[9px] font-bold text-slate-800 tracking-widest">OCHA VIET POS v1.1</p>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader className="pt-8 px-8 space-y-1">
                <div className="flex items-center justify-between mb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 -ml-3 text-slate-400 hover:text-slate-900 hover:bg-transparent"
                    onClick={handleBack}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
                  </Button>
                  <Badge className={selectedRole === 'STAFF' ? "bg-blue-500" : "bg-orange-500"}>
                    {selectedRole}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-black text-slate-800">Đăng Nhập</CardTitle>
                <CardDescription>Cổng truy cập dành riêng cho {selectedRole === 'STAFF' ? 'Nghiệp vụ' : 'Hệ thống'}</CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-8 space-y-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                      Email đăng nhập
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="email"
                        placeholder="admin@ocha.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 border-slate-200 focus:ring-2 focus:ring-primary/20 bg-slate-50/30"
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Mật khẩu bảo mật
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 border-slate-200 focus:ring-2 focus:ring-primary/20 bg-slate-50/30"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className={`w-full h-12 rounded-xl text-base font-bold shadow-[0_10px_20px_rgba(0,0,0,0.1)] transition-all active:scale-95 ${selectedRole === 'STAFF'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-primary hover:bg-primary-hover text-white'
                      }`}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Đang kết nối...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Xác Nhận Đăng Nhập <LogIn className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Info className="w-4 h-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Demo Credentials</p>
                      <p className="text-[11px] font-mono text-slate-600 leading-none">
                        {selectedRole === 'STAFF' ? 'staff@ocha.com / staff123' : 'admin@ocha.com / admin123'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">
          Secure POS Environment
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

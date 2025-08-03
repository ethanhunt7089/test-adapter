'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearAuthToken, getAuthToken, setAuthToken } from '@/lib/api';
import { Eye, EyeOff, Key, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function TokenManager() {
  const [token, setToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedToken = getAuthToken();
    if (savedToken) {
      setToken(savedToken);
      setIsValid(true);
    }
  }, []);

  const handleSaveToken = () => {
    if (!token.trim()) {
      toast.error('กรุณากรอก Token');
      return;
    }

    setAuthToken(token.trim());
    setIsValid(true);
    toast.success('บันทึก Token สำเร็จ');
  };

  const handleClearToken = () => {
    clearAuthToken();
    setToken('');
    setIsValid(false);
    toast.success('ลบ Token สำเร็จ');
  };

  const handleTestToken = async () => {
    if (!token.trim()) {
      toast.error('กรุณากรอก Token ก่อนทดสอบ');
      return;
    }

    try {
      setAuthToken(token.trim());
      // ทดสอบโดยเรียก API getMembers
      const response = await fetch('http://localhost:3000/api/member/list', {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Token ใช้งานได้');
        setIsValid(true);
      } else {
        toast.error('Token ไม่ถูกต้อง');
        setIsValid(false);
      }
    } catch (error) {
      toast.error('ไม่สามารถเชื่อมต่อกับ API ได้');
      setIsValid(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          จัดการ Token
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isClient ? (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground">กำลังโหลด...</div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="token">Bank Adapter Token</Label>
              <div className="relative">
                <Input
                  id="token"
                  type={showToken ? 'text' : 'password'}
                  placeholder="กรอก Token ของคุณ"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="pr-10 cursor-pointer"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 cursor-pointer"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button onClick={handleSaveToken} className="flex-1 cursor-pointer">
                <Save className="w-4 h-4 mr-2" />
                บันทึก
              </Button>
              <Button onClick={handleTestToken} variant="outline" className="flex-1 cursor-pointer">
                ทดสอบ
              </Button>
            </div>

            {isValid && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
                <span className="text-sm text-green-700">Token ใช้งานได้</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearToken}
                  className="text-red-600 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              <p>• Token จะถูกบันทึกใน localStorage</p>
              <p>• ใช้สำหรับเรียก API ของ Bank Adapter</p>
              <p>• ตัวอย่าง: your-token-here</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 
import TokenManager from '@/components/token-manager';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Plus, Settings, Users } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Bank Adapter Test Dashboard</h1>
          <p className="text-xl text-muted-foreground">
            ทดสอบการเชื่อมต่อกับ Bank Adapter API
          </p>
        </div>

        {/* Token Manager */}
        <div className="flex justify-center">
          <TokenManager />
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Bank Adapter Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>API Endpoint:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    http://localhost:3000
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium">พร้อมใช้งาน</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Backoffice Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>API Endpoint:</span>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    http://localhost:5173
                  </code>
                </div>
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <span className="text-green-600 font-medium">พร้อมใช้งาน</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">เริ่มต้นใช้งาน</h2>
          <div className="flex justify-center space-x-4">
            <Link href="/members">
              <Button size="lg" className="cursor-pointer">
                <Users className="w-4 h-4 mr-2" />
                ดูรายการสมาชิก
              </Button>
            </Link>
            <Link href="/members/create">
              <Button size="lg" variant="outline" className="cursor-pointer">
                <Plus className="w-4 h-4 mr-2" />
                เพิ่มสมาชิกใหม่
              </Button>
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>คำแนะนำการใช้งาน</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h3 className="font-semibold">1. ตั้งค่า Token</h3>
              <p className="text-sm text-muted-foreground">
                กรอก Token ของ Bank Adapter ในช่องด้านบน และกด "บันทึก"
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">2. ทดสอบการเชื่อมต่อ</h3>
              <p className="text-sm text-muted-foreground">
                กดปุ่ม "ทดสอบ" เพื่อตรวจสอบว่า Token ใช้งานได้
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">3. ใช้งาน CRUD</h3>
              <p className="text-sm text-muted-foreground">
                เริ่มต้นใช้งานฟีเจอร์ CRUD ผ่านปุ่มด้านล่าง
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

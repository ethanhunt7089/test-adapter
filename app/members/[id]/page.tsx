'use client';

import { CreditManagementModal } from '@/components/credit-management-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api, formatCurrency, formatDate } from '@/lib/api';
import type { Member } from '@/types/member';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  const memberId = params.id as string;

  useEffect(() => {
    loadMember();
  }, [memberId]);

  const loadMember = async () => {
    try {
      setLoading(true);
      
      // ตรวจสอบ token ก่อนเรียก API
      if (typeof window !== 'undefined') {
        const currentToken = localStorage.getItem('bank-adapter-token');
        if (!currentToken) {
          toast.error('กรุณาตั้งค่า Token ก่อนใช้งาน');
          router.push('/');
          return;
        }
      }
      
      const response = await api.getMemberById(memberId);
      
      if (response.success) {
        setMember(response.data.member);
        await loadBalance(memberId);
      } else {
        toast.error('ไม่พบข้อมูลสมาชิก');
        router.push('/members');
      }
    } catch (error) {
      console.error('Error loading member:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      router.push('/members');
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async (id: string) => {
    try {
      setRefreshingBalance(true);
      const response = await api.getMemberBalance(id);
      if (response.success) {
        setBalance(response.data.balance);
        toast.success('อัปเดตยอดเงินสำเร็จ');
      } else {
        toast.error('ไม่สามารถโหลดยอดเงินได้');
      }
    } catch (error) {
      console.error('Error loading balance:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดยอดเงิน');
    } finally {
      setRefreshingBalance(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('คุณต้องการลบสมาชิกนี้หรือไม่?')) return;
    
    try {
      await api.deleteMember(memberId);
      toast.success('ลบสมาชิกสำเร็จ');
      router.push('/members');
    } catch (error) {
      toast.error('ไม่สามารถลบสมาชิกได้');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">ไม่พบข้อมูลสมาชิก</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()} className="cursor-pointer">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับ
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{member.name}</h1>
              <p className="text-muted-foreground">@{member.username}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => loadBalance(memberId)}
              className="cursor-pointer"
              disabled={refreshingBalance}
            >
              {refreshingBalance ? (
                <svg
                  className="animate-spin h-4 w-4 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              รีเฟรชยอดเงิน
            </Button>
            <div className="flex space-x-4">
              <Link href={`/members/${member.id}/edit`}>
                <Button>
                  แก้ไขข้อมูล
                </Button>
              </Link>
              <CreditManagementModal member={member} />
            </div>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              ลบ
            </Button>
          </div>
        </div>

        {/* Member Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลส่วนตัว</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ชื่อ</label>
                <p className="text-lg">{member.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ชื่อผู้ใช้</label>
                <p className="text-lg">@{member.username}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">เบอร์โทรศัพท์</label>
                <p className="text-lg">{member.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">วันที่สร้าง</label>
                <p className="text-lg">
                  {member.createdAt ? formatDate(member.createdAt) : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">อัปเดตล่าสุด</label>
                <p className="text-lg">
                  {member.updatedAt ? formatDate(member.updatedAt) : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ข้อมูลธนาคาร</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">ธนาคาร</label>
                <p className="text-lg">{member.bankCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">เลขบัญชี</label>
                <p className="text-lg">{member.bankAccountNo}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">สกุลเงิน</label>
                <Badge variant="outline">{member.currency}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">ยอดเงินปัจจุบัน</label>
                <div className="text-2xl font-bold text-green-600">
                  {balance !== null ? formatCurrency(balance) : 'กำลังโหลด...'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { api, formatCurrency, formatDate } from '@/lib/api';
import type { Member } from '@/types/member';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreditManagementModal } from './credit-management-modal';

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const availablePageSizes = [10, 20, 50, 100];

  useEffect(() => {
    loadMembers(1, itemsPerPage);
  }, []);

  const loadMembers = async (page = 1, limit = itemsPerPage, search = '') => {
    try {
      setLoading(true);
      
      // ตรวจสอบ token ก่อนเรียก API
      if (typeof window !== 'undefined') {
        const currentToken = localStorage.getItem('bank-adapter-token');
        if (!currentToken) {
          toast.error('กรุณาตั้งค่า Token ก่อนใช้งาน');
          return;
        }
      }
      
             console.log('🔍 [DEBUG] Calling API with:', { page, limit, search });
       const response = await api.getMembers(page, limit, search);
      
      if (response.success) {
        setMembers(response.data.members);
        // แปลง field names ให้ตรงกับ API
        setSummary({
          today: response.data.summary.memberTodayCount || 0,
          week: response.data.summary.memberWeekCount || 0,
          month: response.data.summary.memberMonthCount || 0,
          total: response.data.summary.memberAllCount || 0,
        });
        
        // อัพเดท pagination จาก API
        if (response.data.pagination) {
          setPagination(response.data.pagination);
          // ใช้ page ที่ส่งไป ไม่ใช่ที่ return กลับมา
          setCurrentPage(page);
          setItemsPerPage(response.data.pagination.limit);
          console.log('🔍 [DEBUG] Updated pagination:', { 
            requestedPage: page, 
            responsePage: response.data.pagination.page,
            currentPage: page 
          });
        }
      } else {
        toast.error('ไม่สามารถโหลดข้อมูลสมาชิกได้');
      }
    } catch (error: any) {
      console.error('Error loading members:', error);
      
      if (error.code === 'ECONNABORTED') {
        toast.error('การเชื่อมต่อช้าเกินไป กรุณาลองใหม่อีกครั้ง');
      } else if (error.response?.status === 401) {
        toast.error('Token ไม่ถูกต้อง กรุณาตั้งค่า Token ใหม่');
      } else if (error.response?.status === 500) {
        toast.error('เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง');
      } else {
        toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    } finally {
      setLoading(false);
    }
  };

  // Server-side pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // ใช้ข้อมูลจาก API โดยตรง (server-side pagination)
  const filteredMembers = members;
  const lastPage = pagination.totalPages;
  const paginatedMembers = members; // ข้อมูลมาจาก API แล้ว

  // Generate selectable pages
  const selectablePages = (() => {
    const maxPage = Math.min(lastPage, currentPage + 2);
    const minPage = Math.max(1, currentPage - 2);
    return Array.from({ length: maxPage - minPage + 1 }, (_, i) => i + minPage);
  })();

  // Handle page change
  const goToPage = (page: number) => {
    setCurrentPage(page);
    loadMembers(page, itemsPerPage, searchTerm);
  };

  // Server-side search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadMembers(1, itemsPerPage, searchTerm);
    }, 500); // รอ 500ms หลังหยุดพิมพ์

    return () => clearTimeout(timeoutId);
  }, [searchTerm, itemsPerPage]);

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบสมาชิกนี้หรือไม่?')) return;
    
    try {
      await api.deleteMember(id);
      toast.success('ลบสมาชิกสำเร็จ');
      loadMembers(currentPage, itemsPerPage, searchTerm);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">รายการสมาชิก</h1>
          <p className="text-muted-foreground">
            รวม {summary.total} คน (วันนี้: {summary.today}, สัปดาห์: {summary.week}, เดือน: {summary.month})
          </p>
        </div>
        <Link href="/members/create">
          <Button className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มสมาชิกใหม่
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ค้นหาสมาชิก..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 cursor-pointer"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">วันนี้</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สัปดาห์</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.week}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เดือน</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.month}</div>
          </CardContent>
        </Card>
      </div>

      {/* Members Table */}
      <Card>
        <CardHeader>
                     <CardTitle>
             รายการสมาชิก ({filteredMembers.length}) - หน้า {currentPage} จาก {lastPage}
             <div className="text-sm text-muted-foreground mt-2">
               Debug: members={members.length}, currentPage={currentPage}, lastPage={lastPage}, pagination={JSON.stringify(pagination)}
             </div>
           </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>บัญชีธนาคาร</TableHead>
                <TableHead>ยอดเงิน</TableHead>
                <TableHead>วันที่สร้าง</TableHead>
                <TableHead>การดำเนินการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.name || 'ไม่มีชื่อ'}</div>
                      <div className="text-sm text-muted-foreground">
                        @{member.username || 'ไม่มี username'}
                      </div>
                      {member.agentUsername && (
                        <div className="text-xs text-muted-foreground">
                          Agent: {member.agentUsername}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.username || 'ไม่มี username'}</div>
                      {member.agentUsername && (
                        <div className="text-sm text-muted-foreground">
                          Agent: {member.agentUsername}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{member.bankCode || 'ไม่มีธนาคาร'}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.bankAccountNo || 'ไม่มีเลขบัญชี'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.creditBalance && parseFloat(member.creditBalance) > 0 ? 'default' : 'secondary'}>
                      {formatCurrency(parseFloat(member.creditBalance || '0'), member.currency || 'LAK')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.createdAt ? formatDate(member.createdAt) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/members/${member.id}`}>
                        <Button variant="outline" size="sm">
                          ดูรายละเอียด
                        </Button>
                      </Link>
                      <Link href={`/members/${member.id}/edit`}>
                        <Button variant="outline" size="sm">
                          แก้ไข
                        </Button>
                      </Link>
                      <CreditManagementModal member={member} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {lastPage > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
                             <div className="text-sm text-muted-foreground">
                 แสดง {((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.totalItems)} จาก {pagination.totalItems} รายการ
               </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(1)}
                  disabled={currentPage === 1}
                  className="cursor-pointer"
                >
                  หน้าแรก
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="cursor-pointer"
                >
                  ก่อนหน้า
                </Button>
                
                {selectablePages.map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === lastPage}
                  className="cursor-pointer"
                >
                  ถัดไป
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(lastPage)}
                  disabled={currentPage === lastPage}
                  className="cursor-pointer"
                >
                  หน้าสุดท้าย
                </Button>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-sm">แสดง:</span>
                  <select
                    value={itemsPerPage}
                                         onChange={(e) => {
                       const newLimit = Number(e.target.value);
                       setItemsPerPage(newLimit);
                       setCurrentPage(1);
                       loadMembers(1, newLimit, searchTerm);
                     }}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {availablePageSizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <span className="text-sm">รายการ</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 
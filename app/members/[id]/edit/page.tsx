'use client';

import MemberForm from '@/components/member-form';
import { api } from '@/lib/api';
import type { Member } from '@/types/member';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function EditMemberPage() {
  const params = useParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);

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
          return;
        }
      }
      
      const response = await api.getMemberById(memberId);
      
      if (response.success) {
        setMember(response.data.member);
      } else {
        toast.error('ไม่พบข้อมูลสมาชิก');
      }
    } catch (error) {
      console.error('Error loading member:', error);
      toast.error('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
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
      <MemberForm member={member} mode="edit" />
    </div>
  );
} 
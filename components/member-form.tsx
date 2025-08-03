'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import type { CreateMemberRequest, Member, UpdateMemberRequest } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const memberSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อ'),
  username: z.string().min(1, 'กรุณากรอกชื่อผู้ใช้'),
  phone: z.string().min(10, 'กรุณากรอกเบอร์โทรให้ถูกต้อง'),
  bankAccountNo: z.string().min(1, 'กรุณากรอกเลขบัญชีธนาคาร'),
  bankCode: z.string().min(1, 'กรุณาเลือกธนาคาร'),
  currency: z.string().min(1, 'กรุณาเลือกสกุลเงิน'),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  member?: Member;
  mode: 'create' | 'edit';
}

const bankOptions = [
  { value: 'BCEL', label: 'BCEL BANK (BCEL)' },
  { value: 'JDB', label: 'JOINT DEVELOPMENT BANK (JDB)' },
  { value: 'LDB', label: 'LAO DEVELOPMENT BANK (LDB)' },
  { value: 'LVB', label: 'LAOS-VIETNAM BANK (LVB)' },
  { value: 'ACLB', label: 'ACLEDA BANK LAO (ACLB)' },
  { value: 'APB', label: 'AGRICULTURAL PROMOTION BANK (APB)' },
  { value: 'BIC', label: 'BIC Bank Lao Co. Ltd. (BIC)' },
  { value: 'BOC', label: 'Bank of China (Hong Kong) Ltd (BOC)' },
  { value: 'ICBC', label: 'Industrial and Commercial Bank of China Ltd (ICBC)' },
  { value: 'IDCB', label: 'INDOCHINA BANK LTD (IDCB)' },
  { value: 'KTB', label: 'KASIKORNTHAI Bank Sole Ltd. (KTB)' },
  { value: 'MRB', label: 'MARUHAN Japan Bank Lao Co., Ltd (MRB)' },
  { value: 'MBB', label: 'Military Commercial Joint Stock Ban (MBB)' },
  { value: 'PBB', label: 'Public Bank Lao Ltd. (PBB)' },
  { value: 'SCB', label: 'SACOMBANK LAO (SCB)' },
  { value: 'STB', label: 'ST Bank Ltd. (STB)' },
  { value: 'VTB', label: 'Vietinbank Lao Ltd. (VTB)' },
  { value: 'BFL', label: 'Banque Franco-Lao Ltd. (BFL)' },
  { value: 'PSV', label: 'PHONGSAVANH BANK LTD (PSV)' }
];

const currencyOptions = [
  { value: 'LAK', label: 'LAK' },
  { value: 'THB', label: 'THB' }
];

export default function MemberForm({ member, mode }: MemberFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member?.name || '',
      username: member?.username || '',
      phone: member?.phone || '',
      bankAccountNo: member?.bankAccountNo || '',
      bankCode: member?.bankCode || '',
      currency: member?.currency || 'LAK',
    },
  });

  const onSubmit = async (data: MemberFormData) => {
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

      if (mode === 'create') {
        const createData: CreateMemberRequest = {
          name: data.name,
          username: data.username,
          phone: data.phone,
          bankAccountNo: data.bankAccountNo,
          bankCode: data.bankCode,
          currency: data.currency,
        };

        await api.createMember(createData);
        toast.success('สร้างสมาชิกสำเร็จ');
      } else {
        const updateData: UpdateMemberRequest = {
          id: member!.id,
          name: data.name,
          username: data.username,
          phone: data.phone,
          bankAccountNo: data.bankAccountNo,
          bankCode: data.bankCode,
          currency: data.currency,
        };

        await api.updateMember(updateData);
        toast.success('อัปเดตข้อมูลสำเร็จ');
      }

      router.push('/members');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(mode === 'create' ? 'ไม่สามารถสร้างสมาชิกได้' : 'ไม่สามารถอัปเดตข้อมูลได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>
            {mode === 'create' ? 'เพิ่มสมาชิกใหม่' : 'แก้ไขข้อมูลสมาชิก'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อ</FormLabel>
                      <FormControl>
                        <Input placeholder="กรอกชื่อ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ชื่อผู้ใช้</FormLabel>
                      <FormControl>
                        <Input placeholder="กรอกชื่อผู้ใช้" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทรศัพท์</FormLabel>
                    <FormControl>
                      <Input placeholder="กรอกเบอร์โทรศัพท์" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bankAccountNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เลขบัญชีธนาคาร</FormLabel>
                    <FormControl>
                      <Input placeholder="กรอกเลขบัญชีธนาคาร" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="bankCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ธนาคาร</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกธนาคาร" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bankOptions.map((bank) => (
                            <SelectItem key={bank.value} value={bank.value}>
                              {bank.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>สกุลเงิน</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกสกุลเงิน" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencyOptions.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={loading}
                  className="cursor-pointer"
                >
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={loading} className="cursor-pointer">
                  {loading ? 'กำลังบันทึก...' : mode === 'create' ? 'สร้างสมาชิก' : 'บันทึกการเปลี่ยนแปลง'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 
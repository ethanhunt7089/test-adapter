'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import type { BankOption, CreateMemberRequest, CurrencyOption, CustomerGroup, Member, RegisterChannel, UpdateMemberRequest } from '@/types/member';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

const memberSchema = z.object({
  name: z.string().optional(),
  username: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  bankAccountNo: z.string().optional(),
  bankCode: z.string().optional(),
  currency: z.string().optional(),
  bcelOneId: z.string().optional(),
  registerChannelId: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  member?: Member;
  mode: 'create' | 'edit';
}

export default function MemberForm({ member, mode }: MemberFormProps) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [banks, setBanks] = useState<BankOption[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [customerGroups, setCustomerGroups] = useState<CustomerGroup[]>([]);
  const [bcelBanks, setBcelBanks] = useState<Array<{ id: string; customerGroupName: string }>>([]);
  const [registerChannels, setRegisterChannels] = useState<RegisterChannel[]>([]);
  const router = useRouter();

  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      name: member?.name || '',
      username: member?.username || '',
      phone: member?.phone || '',
      password: member?.password || '',
      bankAccountNo: member?.bankAccountNo || '',
      bankCode: member?.bankCode || '',
      currency: member?.currency || 'LAK',
      bcelOneId: member?.bcelOneId || '',
      registerChannelId: member?.registerChannelId || '',
    },
  });

  // Load data on component mount
  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      // Load banks
      const banksResponse = await api.getLaoBanks();
      if (banksResponse.success) {
        setBanks(banksResponse.data);
      }

      // Load currencies
      const currenciesResponse = await api.getCurrencies();
      if (currenciesResponse.success) {
        setCurrencies(currenciesResponse.data);
      }

      // Load customer groups
      const customerGroupsResponse = await api.getCustomerGroups();
      if (customerGroupsResponse.success) {
        setCustomerGroups(customerGroupsResponse.data);
      }

      // Load BCEL banks
      const bcelBanksResponse = await api.getBcelBanks();
      if (bcelBanksResponse.success) {
        setBcelBanks(bcelBanksResponse.data);
      }

      // TODO: Add register channels API when available
      // For now, use empty array
      setRegisterChannels([]);
    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error('ไม่สามารถโหลดข้อมูลได้');
    }
  };

  const verifyAccount = async () => {
    const bankCode = form.getValues('bankCode') || '';
    const bankAccountNo = form.getValues('bankAccountNo') || '';
    const currency = form.getValues('currency') || '';
    const phone = form.getValues('username') || '';

    console.log('🔍 [DEBUG] verifyAccount called with:', { bankCode, bankAccountNo, currency, phone });

    if (!bankCode) {
      console.log('🔍 [DEBUG] Showing toast: กรุณาเลือกธนาคารก่อน');
      toast.error('กรุณาเลือกธนาคารก่อน');
      return;
    }

    if (!bankAccountNo) {
      console.log('🔍 [DEBUG] Showing toast: กรุณากรอกเลขบัญชีก่อน');
      toast.error('กรุณากรอกเลขบัญชีก่อน');
      return;
    }

    if (!phone) {
      console.log('🔍 [DEBUG] Showing toast: กรุณากรอกเบอร์โทรก่อน');
      toast.error('กรุณากรอกเบอร์โทรก่อน');
      return;
    }

    try {
      setVerifying(true);
      const response = await api.checkAccount({
        bankAccountNumber: bankAccountNo,
        bankName: bankCode,
        bankType: currency,
        phone: phone,
      });

      console.log('🔍 [DEBUG] Response:', response);
      
      if (response.success) {
        // Auto-fill the name field
        form.setValue('name', response.data.message);
        toast.success('ตรวจสอบบัญชีสำเร็จ');
      } else {
        // แสดง error message จาก Backoffice
        const errorMessage = response.data?.message || 'ไม่สามารถตรวจสอบบัญชีได้';
        toast.error(errorMessage);
        
        // ถ้าเป็น error เกี่ยวกับข้อมูลที่ถูกใช้ไปแล้ว ให้แสดงรายละเอียด
        if (errorMessage.includes('ถูกใช้ไปแล้ว')) {
          console.log('ข้อมูลที่ถูกใช้ไปแล้ว:', {
            bankAccountNumber: bankAccountNo,
            bankName: bankCode,
            phone: phone
          });
        }
      }
    } catch (error: any) {
      console.error('Error verifying account:', error);
      
      // ตรวจสอบ error response จาก Bank Adapter
      if (error.response?.data?.data?.message) {
        toast.error(error.response.data.data.message);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('เกิดข้อผิดพลาดในการตรวจสอบบัญชี');
      }
    } finally {
      setVerifying(false);
    }
  };

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
          name: data.name || '',
          username: data.username || '',
          phone: data.username || '', // ใช้ username เป็น phone
          password: data.password || '',
          bankAccountNo: data.bankAccountNo || '',
          bankCode: data.bankCode || '',
          currency: data.currency || 'LAK',
          bcelOneId: data.bcelOneId || '',
          registerChannelId: data.registerChannelId || '',
        };

        await api.createMember(createData);
        toast.success('สร้างสมาชิกสำเร็จ');
      } else {
        const updateData: UpdateMemberRequest = {
          id: member!.id,
          name: data.name || '',
          username: data.username || '',
          phone: data.phone || '',
          password: data.password || '',
          bankAccountNo: data.bankAccountNo || '',
          bankCode: data.bankCode || '',
          currency: data.currency || 'LAK',
          bcelOneId: data.bcelOneId || undefined, // ใช้ undefined เพื่อให้ตรงกับ interface
          registerChannelId: data.registerChannelId || undefined, // ใช้ undefined เพื่อให้ตรงกับ interface
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
              {/* Phone Number */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เบอร์โทร</FormLabel>
                    <FormControl>
                      <Input placeholder="0812345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>รหัสผ่าน</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="รหัสผ่าน 6 หลัก" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Bank */}
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
                        {banks.map((bank) => (
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

              {/* Account Number with Verify Button */}
              <FormField
                control={form.control}
                name="bankAccountNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>เลขบัญชี</FormLabel>
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input placeholder="เลขบัญชีธนาคาร" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={verifyAccount}
                        disabled={verifying}
                        className="cursor-pointer"
                      >
                        {verifying ? 'กำลังตรวจสอบ...' : 'ตรวจสอบ'}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Name */}
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

              {/* Currency */}
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
                        {currencies.map((currency) => (
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

              {/* BCEL Bank */}
              <FormField
                control={form.control}
                name="bcelOneId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BCEL Bank</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือก BCEL Bank" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bcelBanks.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id}>
                            {bank.customerGroupName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Source */}
              <FormField
                control={form.control}
                name="registerChannelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>แหล่งที่มา</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกแหล่งที่มา" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {registerChannels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.id}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
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
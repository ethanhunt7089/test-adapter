'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { Member } from '@/types/member';
import { useState } from 'react';
import { toast } from 'sonner';

interface CreditManagementModalProps {
  member: Member;
  onSuccess?: () => void;
}

export function CreditManagementModal({ member, onSuccess }: CreditManagementModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<'add' | 'remove' | 'cashout' | 'deposit'>('deposit');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '0',
    phone: member.username || '',
    remarks: '',
    currency: 'LAK',
    bankName: 'BCEL',
    dateDeposit: new Date().toISOString().split('T')[0],
    timeDeposit: new Date().toTimeString().split(' ')[0],
    actualDateTime: new Date().toISOString()
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      switch (action) {
        case 'add':
          await api.addCredit(member.id!, {
            phone: formData.phone,
            amount: parseFloat(formData.amount),
            remarks: formData.remarks
          });
          toast.success('เพิ่มเครดิตสำเร็จ');
          break;

        case 'remove':
          await api.removeCredit(member.id!, {
            amount: parseFloat(formData.amount),
            remarks: formData.remarks
          });
          toast.success('ลดเครดิตสำเร็จ');
          break;

        case 'cashout':
          await api.cashoutCredit(member.id!, {
            remarks: formData.remarks
          });
          toast.success('ถอนเครดิตทั้งหมดสำเร็จ');
          break;

        case 'deposit':
          // ตรวจสอบข้อมูลที่จำเป็น
          if (!formData.phone || !formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
          }
          
          // สร้าง actualDateTime จาก dateDeposit และ timeDeposit
          const depositDate = new Date(formData.dateDeposit);
          const [hours, minutes] = formData.timeDeposit.split(':');
          depositDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          await api.deposit({
            phone: formData.phone,
            amount: parseFloat(formData.amount),
            currency: formData.currency || 'LAK',
            bankName: formData.bankName || 'BCEL',
            dateDeposit: formData.dateDeposit,
            timeDeposit: formData.timeDeposit,
            actualDateTime: depositDate.toISOString()
          });
          toast.success('เติมเงินสำเร็จ');
          break;
      }

      setIsOpen(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          จัดการเครดิต
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>จัดการเครดิต - {member.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>การดำเนินการ</Label>
            <Select value={action} onValueChange={(value: any) => setAction(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">เพิ่มเครดิต</SelectItem>
                <SelectItem value="remove">ลดเครดิต</SelectItem>
                <SelectItem value="cashout">ถอนทั้งหมด</SelectItem>
                <SelectItem value="deposit">เติมเงิน</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {action !== 'cashout' && (
            <div className="space-y-2">
              <Label>จำนวนเงิน</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
          )}

          {action === 'add' && (
            <div className="space-y-2">
              <Label>เบอร์โทรศัพท์</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="เบอร์โทรศัพท์"
                required
              />
            </div>
          )}

          {action === 'deposit' && (
            <>
              <div className="space-y-2">
                <Label>เบอร์โทรศัพท์</Label>
                <Input
                  value={member.username || formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="เบอร์โทรศัพท์"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>สกุลเงิน</Label>
                <Input
                  value="LAK"
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <Label>ธนาคาร</Label>
                <Input
                  value="BCEL"
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>วันที่</Label>
                  <Input
                    type="date"
                    value={formData.dateDeposit}
                    onChange={(e) => setFormData({ ...formData, dateDeposit: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>เวลาโอน</Label>
                  <Input
                    type="time"
                    value={formData.timeDeposit}
                    onChange={(e) => setFormData({ ...formData, timeDeposit: e.target.value })}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>หมายเหตุ</Label>
            <Textarea
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="หมายเหตุ (ไม่บังคับ)"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'กำลังดำเนินการ...' : 'ยืนยัน'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
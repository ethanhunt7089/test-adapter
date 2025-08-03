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
  const [action, setAction] = useState<'add' | 'remove' | 'cashout' | 'deposit'>('add');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    phone: member.username || '',
    remarks: '',
    currency: 'THB',
    bankName: '',
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
          await api.deposit({
            phone: formData.phone,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            bankName: formData.bankName,
            dateDeposit: formData.dateDeposit,
            timeDeposit: formData.timeDeposit,
            actualDateTime: formData.actualDateTime
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
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="เบอร์โทรศัพท์"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>สกุลเงิน</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THB">THB</SelectItem>
                    <SelectItem value="LAK">LAK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ธนาคาร</Label>
                <Input
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="ชื่อธนาคาร"
                  required
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
                  <Label>เวลา</Label>
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
import MemberForm from '@/components/member-form';

export default function CreateMemberPage() {
  return (
    <div className="container mx-auto py-8">
      <MemberForm mode="create" />
    </div>
  );
}

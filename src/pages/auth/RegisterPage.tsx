
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join StudyVault and start your learning journey"
    >
      <RegisterForm />
    </AuthLayout>
  );
}

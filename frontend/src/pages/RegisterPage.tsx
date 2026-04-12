import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../hooks/index.ts';
import { Button, Input, Card } from '../components/ui/index.tsx';

const schema = z.object({
  fullName: z.string().min(2, 'Name required'),
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
});

type Form = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register_, isPending, error } = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Form) => {
    register_(data, { onSuccess: () => navigate('/resume') });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">BulkApply</h1>
          <p className="text-gray-500 text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            placeholder="Mihir Patel"
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {error && (
            <p className="text-sm text-red-500 text-center">
              {(error as any)?.response?.data?.message || 'Registration failed'}
            </p>
          )}

          <Button type="submit" loading={isPending} className="w-full mt-2">
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
}

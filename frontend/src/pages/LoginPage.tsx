import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/index.ts';
import { Button, Input, Card } from '../components/ui/index.tsx';

const schema = z.object({
  email:    z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: Form) => {
    login(data, { onSuccess: () => navigate('/dashboard') });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-blue-600">BulkApply</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              {(error as any)?.response?.data?.message || 'Login failed'}
            </p>
          )}

          <Button type="submit" loading={isPending} className="w-full mt-2">
            Sign In
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}

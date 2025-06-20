import authSchema from '@/server/auth/auth-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'nextjs-toploader/app';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { passwordSchema } from '@/lib/schema';

import authActions from './auth-actions';

const signUpSchema = authSchema.signUpSchema.and(
  z.object({
    agree: z.boolean().refine((value) => value, {
      message: 'You must agree to the terms and conditions',
    }),
  }),
);

const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirmPassword'],
      });
    }
  });

export const useSignup = () => {
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      agree: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authActions.signup,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess(data) {
      toast.success(data.message);
      form.reset();
    },
  });

  const onSubmit = async (body: z.infer<typeof authSchema.signUpSchema>) => {
    mutate(body);
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};

export const useLogin = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof authSchema.loginSchema>>({
    resolver: zodResolver(authSchema.loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authActions.login,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess() {
      router.push('/');
    },
  });

  const onSubmit = async (body: z.infer<typeof authSchema.loginSchema>) => {
    mutate(body);
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};

export const useForgotPassword = () => {
  const form = useForm<z.infer<typeof authSchema.forgotPasswordSchema>>({
    resolver: zodResolver(authSchema.forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authActions.forgotPassword,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess(data) {
      toast.success(data.message);
      form.reset();
    },
  });

  const onSubmit = async (body: z.infer<typeof authSchema.forgotPasswordSchema>) => {
    mutate(body);
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};

export const useResetPassword = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: authActions.resetPassword,
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess() {
      router.push('/');
    },
  });

  const onSubmit = async (body: z.infer<typeof resetPasswordSchema>) => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      toast.error('Invalid token');

      return;
    }
    mutate({
      password: body.password,
      token: token,
    });
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};

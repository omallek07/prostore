import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Metadata } from 'next';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SignUpForm from './signup-form';

export const metadata: Metadata = {
  title: 'Sign Up - ProStore',
  description:
    'Sign up for a ProStore account to access your dashboard and manage your products.',
};

async function SignUpPage(props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();

  if (session) {
    redirect(callbackUrl || '/');
  }

  return (
    <div className='w-full max-w-md mx-auto'>
      <Card>
        <CardHeader className='space-y-4'>
          <div className='flex-center'>
            <Image
              src='/images/logo.svg'
              width={100}
              height={100}
              alt={`${APP_NAME} Logo`}
              priority={true}
            />
          </div>
          <CardTitle className='text-center'>Sign Up</CardTitle>
          <CardDescription className='text-center'>
            Sign up to create an account
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <SignUpForm />
        </CardContent>
      </Card>
    </div>
  );
}

export default SignUpPage;

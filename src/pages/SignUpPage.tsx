import { SignUp } from '@clerk/clerk-react';
import { Link } from 'react-router';

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md px-6 pt-16 pb-24">
      <div className="mb-10 text-center">
        <p className="text-sm uppercase tracking-widest text-hive-honey">Create account</p>
        <h1 className="mt-2 font-serif text-4xl text-hive-cream">Start your hive.</h1>
        <p className="mt-3 text-hive-mist">
          Sign up with your work email. No password, just a one-time code.
        </p>
      </div>
      <div className="flex justify-center">
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/get-started"
          afterSignInUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: '#E8A33F',
              colorBackground: '#1A1A1D',
              colorText: '#F5F1E8',
              colorTextSecondary: '#8B8B8F',
              colorInputBackground: '#0E0E10',
              colorInputText: '#F5F1E8',
              fontFamily: 'Inter, system-ui, sans-serif',
              borderRadius: '0.75rem',
            },
            elements: {
              rootBox: 'w-full',
              card: 'bg-hive-charcoal border border-hive-slate/50 shadow-none',
              headerTitle: 'hidden',
              headerSubtitle: 'hidden',
              socialButtonsBlockButton:
                'bg-hive-black border border-hive-slate/50 hover:bg-hive-slate/20',
              formButtonPrimary:
                'bg-hive-honey hover:bg-hive-honey/90 text-hive-black font-medium normal-case',
              footerActionLink: 'text-hive-honey hover:text-hive-honey/80',
              formFieldInput: 'border-hive-slate/50 focus:border-hive-honey',
            },
          }}
        />
      </div>
      <p className="mt-8 text-center text-sm text-hive-mist">
        Already have an account?{' '}
        <Link to="/sign-in" className="text-hive-honey hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

import { SignIn } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">QuizzDrop</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-sm normal-case',
              card: 'shadow-lg',
              headerTitle: 'text-purple-600',
              headerSubtitle: 'text-gray-600',
              socialButtonsBlockButton: 'border-gray-200 hover:bg-gray-50',
              socialButtonsBlockButtonText: 'text-gray-600',
              formFieldInput: 'border-gray-200 focus:border-purple-600 focus:ring-purple-600',
              footerActionLink: 'text-purple-600 hover:text-purple-700'
            }
          }}
        />
      </div>
    </div>
  );
}

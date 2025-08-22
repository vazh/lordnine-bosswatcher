import AuthForm from '@/components/AuthForm'

export default function Login() {
  return (
    <main className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Lord Nine</h1>
          <p className="text-slate-300">Boss Tracker</p>
        </div>
        <AuthForm />
      </div>
    </main>
  )
}
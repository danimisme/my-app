import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { decodePayload } from '@/lib/jwt'
import LogoutButton from '@/components/logout-button'

export default async function Home() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) redirect('/auth/login')

  const payload = decodePayload(accessToken)

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Selamat datang, {payload?.username ?? 'User'}!
          </h1>
          <div className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            <p>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Username:</span>{' '}
              {payload?.username}
            </p>
            <p>
              <span className="font-medium text-zinc-700 dark:text-zinc-300">Role:</span>{' '}
              {payload?.role}
            </p>
            {payload?.exp && (
              <p>
                <span className="font-medium text-zinc-700 dark:text-zinc-300">Token expires:</span>{' '}
                {new Date(payload.exp * 1000).toLocaleTimeString('id-ID')}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <LogoutButton />
        </div>
      </main>
    </div>
  )
}

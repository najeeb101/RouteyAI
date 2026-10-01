import { createClient } from '@/lib/supabase/server'
import { RouteyLogo } from '@/components/RouteyLogo'
import InviteForm from './InviteForm'
import type { InviteRole } from '@/types/database'

interface Props {
  params: { code: string }
}

function ErrorCard({ message }: { message: string }) {
  return (
    <div className="w-full max-w-sm">
      <div className="flex flex-col items-center mb-6">
        <RouteyLogo size={64} variant="white" />
        <div className="mt-3 text-2xl font-extrabold text-white tracking-tight">
          Routey<span className="text-sky-400">AI</span>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-2">Invalid invite</h2>
        <p className="text-sm text-[#64748B] mb-5">{message}</p>
        <a
          href="/login"
          className="inline-block bg-[#1E3A8A] text-white rounded-xl px-6 py-2.5 text-sm font-semibold hover:bg-[#1e40af] transition-colors"
        >
          Go to login
        </a>
      </div>
    </div>
  )
}

export default async function InvitePage({ params }: Props) {
  const supabase = createClient()

  // get_invite() returns only this code; invites can't be listed (0014_fix_rls.sql).
  const { data: rows } = await supabase.rpc('get_invite', { p_code: params.code })
  const invite = rows?.[0]

  if (!invite) {
    return <ErrorCard message="This invite link is invalid or does not exist." />
  }

  if (invite.used_at) {
    return <ErrorCard message="This invite has already been used. Each invite link can only be redeemed once." />
  }

  if (new Date(invite.expires_at) < new Date()) {
    return <ErrorCard message="This invite link has expired. Please ask your administrator to generate a new one." />
  }

  return <InviteForm code={params.code} role={invite.role as InviteRole} />
}

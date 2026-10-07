import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { TriangleAlert } from 'lucide-react'
import { AuthShell } from '@/components/auth/AuthShell'
import InviteForm from './InviteForm'
import type { InviteRole } from '@/types/database'

interface Props {
  params: { code: string }
}

function ErrorCard({ message }: { message: string }) {
  return (
    <AuthShell subtitle="Invite link">
      <div className="text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bad-tint text-bad-text">
          <TriangleAlert size={22} aria-hidden="true" />
        </span>
        <h1 className="font-display text-[22px] font-bold leading-7 tracking-[-0.01em] text-ink">Invalid invite</h1>
        <p className="mb-5 mt-1.5 text-sm text-ink-2">{message}</p>
        <Link href="/login" className="inline-flex h-10 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-pressed">
          Go to login
        </Link>
      </div>
    </AuthShell>
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

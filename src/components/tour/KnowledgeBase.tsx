import { BookOpen, FileText, Flag, Search } from 'lucide-react'
import Window from '../mock/Window'

/* ---------------------------------------------------------------------
 * Knowledge Base — the indexed source library the copilot reads from.
 * A search field over a divided doc list, rendered settled. Session 5
 * motion ration (Tour = QUIET) removed the per-row stagger; the module
 * enters once with its article via kz-enter and then holds still.
 * ------------------------------------------------------------------- */

const DOCS: { icon: typeof FileText; name: string; tag: string }[] = [
  { icon: BookOpen, name: 'Sales playbook — 2026', tag: 'Indexed' },
  { icon: FileText, name: 'Pricing & packaging guide', tag: 'Synced' },
  { icon: Flag, name: 'Objection battlecards', tag: 'Indexed' },
  { icon: FileText, name: 'Discovery question bank', tag: 'Synced' },
]

export function KnowledgeBase() {
  return (
    <Window title="Knowledge base" meta={<span className="font-mono font-[550] text-[10px] tracking-[0.08em] text-gray-600 uppercase">148 docs</span>}>
      <div className="p-5">
        <div className="flex items-center gap-2 rounded-input border border-hairline-2 bg-surface-200 px-3 py-2 text-gray-500">
          <Search size={14} strokeWidth={1.75} />
          <span className="text-[12px]">Ask across every playbook, doc and battlecard…</span>
        </div>
        <div className="mt-4 flex flex-col divide-y divide-hairline-2 rounded-tile border border-hairline-2 bg-surface-200">
          {DOCS.map(({ icon: Icon, name, tag }) => (
            <div key={name} className="flex items-center gap-3 px-4 py-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-micro border border-hairline-2 bg-surface-100 text-gray-600">
                <Icon size={14} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-[550] text-gray-800">{name}</span>
              <span className="shrink-0 rounded-micro bg-surface-300 px-1.5 py-0.5 font-mono font-[550] text-[9px] tracking-[0.08em] text-gray-600 uppercase">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Window>
  )
}

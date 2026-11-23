import type { ReactNode } from 'react'

export function PageShell(props: {
  title: string
  subtitle?: string
  right?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="text-base font-semibold">{props.title}</div>
          {props.subtitle ? (
            <div className="mt-1 text-sm text-slate-500">{props.subtitle}</div>
          ) : null}
        </div>
        {props.right ? <div className="shrink-0">{props.right}</div> : null}
      </div>
      <div className="min-h-0 flex-1">{props.children}</div>
    </div>
  )
}


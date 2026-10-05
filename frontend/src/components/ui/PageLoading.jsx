import { Skeleton } from "./index";

export function SkeletonCard() {
  return <div className="ui-card ui-loading-card"><Skeleton className="h-11 w-11" /><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-full" /><Skeleton className="h-10 w-full" /></div>;
}

export function SkeletonTable({ rows = 5 }) {
  return <div className="ui-card ui-loading-table"><div className="ui-loading-row"><Skeleton className="h-5 w-1/3" /><Skeleton className="h-5 w-1/4" /></div>{Array.from({ length: rows }, (_, index) => <div className="ui-loading-row" key={index}><Skeleton className="h-10 w-10 shrink-0" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-7 w-20" /></div>)}</div>;
}

export default function PageLoading({ page = "" }) {
  const dashboard = page.includes("dashboard") || page.includes("statistics");
  const profile = /profile|company|settings|detail/.test(page);
  const table = /applications|users|recruiters|notifications/.test(page);
  return <div className="ui-page-skeleton" role="status" aria-label="Chargement des données" aria-busy="true">
    <Skeleton className="ui-skeleton-heading" /><Skeleton className="ui-skeleton-subtitle" />
    {dashboard ? <><div className="ui-skeleton-stats">{[0, 1, 2, 3].map(index => <Skeleton key={index} className="ui-skeleton-stat" />)}</div><div className="ui-loading-dashboard"><div className="ui-card space-y-6"><Skeleton className="h-6 w-1/2" /><div className="ui-loading-chart">{[45, 70, 55, 85, 65, 95, 75].map((height, index) => <Skeleton key={index} className="flex-1" style={{ height: `${height}%` }} />)}</div></div><SkeletonTable rows={3} /></div></> : profile ? <div className="ui-loading-profile"><div className="ui-card ui-loading-card"><Skeleton className="h-20 w-20 rounded-full" /><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-3/4" /></div><div className="ui-card ui-loading-fields">{[0, 1, 2, 3, 4, 5].map(index => <div className="space-y-3" key={index}><Skeleton className="h-4 w-1/3" /><Skeleton className="h-12 w-full" /></div>)}</div></div> : table ? <div className="mt-7"><SkeletonTable /></div> : <div className="ui-loading-cards">{[0, 1, 2, 3, 4, 5].map(index => <SkeletonCard key={index} />)}</div>}
    <span className="sr-only">Chargement en cours…</span>
  </div>;
}

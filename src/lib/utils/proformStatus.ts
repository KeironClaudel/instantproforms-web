export function getProformStatusBadgeClassName(status: string | null | undefined): string {
  switch ((status ?? "").toLowerCase()) {
    case "draft":
      return "bg-slate-100 text-slate-700";
    case "sent":
      return "bg-sky-100 text-sky-700";
    case "accepted":
      return "bg-emerald-100 text-emerald-700";
    case "rejected":
      return "bg-rose-100 text-rose-700";
    case "cancelled":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

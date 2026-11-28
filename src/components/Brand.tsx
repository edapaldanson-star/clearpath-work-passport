import logo from "@/assets/clearpath-logo.png.asset.json";

export function Brand() {
  return <span className="flex min-w-0 items-center gap-2.5">
    <img src={logo.url} alt="" className="h-10 w-10 shrink-0 rounded-sm" />
    <span className="min-w-0 leading-tight"><span className="block font-display text-xl font-bold">ClearPath</span><span className="block text-[10px] font-semibold uppercase tracking-[0.12em]">Work Passport</span></span>
  </span>;
}
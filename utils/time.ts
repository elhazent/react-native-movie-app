// utils/time.ts
export const formatMinutesToHM = (mins?: number | null) => {
  if (mins == null) return 'N/A';
  const h = Math.floor(mins / 60);
  const m = Math.floor(mins % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`; // kalau mau tanpa spasi: `${h}h${m}m`
};

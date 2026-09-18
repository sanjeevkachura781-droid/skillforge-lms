export function formatDuration(minutes?: number | null) { return minutes ? `${minutes} min` : 'Self-paced'; }
export function formatDate(value: string) { return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)); }

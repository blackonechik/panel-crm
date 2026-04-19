export function statusChipColor(status: string): 'default' | 'accent' | 'success' | 'warning' | 'danger' {
  if (status.includes('CANCEL') || status === 'LOST' || status === 'SPAM') return 'danger';
  if (status.includes('WAITING')) return 'warning';
  if (status.includes('COMPLETED') || status === 'SUCCESSFUL' || status === 'CONFIRMED') return 'success';
  if (status === 'NEW') return 'default';
  return 'accent';
}

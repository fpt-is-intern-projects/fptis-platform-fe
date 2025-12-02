export function getAvatarLetters(
  firstName: string | undefined,
  lastName: string | undefined
): string {
  if (!firstName && !lastName) return '?';

  const f = firstName?.trim()?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.trim()?.charAt(0)?.toUpperCase() || '';

  return f + l;
}

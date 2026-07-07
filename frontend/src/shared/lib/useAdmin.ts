/**
 * Simple hook / helper to check if the current user is an admin.
 * The value is stored in localStorage by the LoginPage after a successful login.
 *
 * Usage:
 *   const isAdmin = useAdmin()
 */
export function useAdmin(): boolean {
  return localStorage.getItem('is_admin') === 'true'
}

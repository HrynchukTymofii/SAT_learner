// Bumped on logout. A user load that started before the logout must not
// call setUser when it finishes, or the old user comes back without a token
let session = 0;

export function getUserSession() {
  return session;
}

export function endUserSession() {
  session++;
}

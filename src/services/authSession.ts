type AuthSessionListener = () => void | Promise<void>;

const listeners = new Set<AuthSessionListener>();

export function subscribeAuthSession(listener: AuthSessionListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export async function notifyAuthSessionChanged(): Promise<void> {
  await Promise.all([...listeners].map((listener) => listener()));
}

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './AuthContext';
import { authApi } from '../api/endpoints';
import { api, tokenKey } from '../api/client';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
vi.mock('../api/endpoints', () => ({ authApi: { login: vi.fn(), register: vi.fn(), me: vi.fn() } }));
function Session() { const auth = useAuth(); return <><p>{auth.loading ? 'Loading' : auth.user?.email ?? 'Signed out'}</p><button onClick={() => void auth.login('b@test.com', 'password')}>Login</button><button onClick={auth.logout}>Logout</button></>; }
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}
const account = { id: 2, email: 'b@test.com', role: 'student' };
function renderSession() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><AuthProvider><Session /></AuthProvider></QueryClientProvider>);
  return client;
}
function unauthorized(config: InternalAxiosRequestConfig) {
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, undefined, { config, data: {}, headers: {}, status: 401, statusText: 'Unauthorized' });
}
describe('Account isolation', () => {
  beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
  it('clears the previous account cache when signing in and signing out', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.mocked(authApi.login).mockResolvedValue({ data: { data: { user: { id: 2, email: 'b@test.com', role: 'student' }, accessToken: 'new-token' } } } as never);
    render(<QueryClientProvider client={client}><AuthProvider><Session /></AuthProvider></QueryClientProvider>);
    client.setQueryData(['enrollments'], [{ id: 1, private: 'account A' }]);
    await userEvent.click(screen.getByText('Login'));
    await screen.findByText('b@test.com');
    expect(client.getQueryData(['enrollments'])).toBeUndefined();
    client.setQueryData(['notifications'], ['account B private message']);
    await userEvent.click(screen.getByText('Logout'));
    expect(client.getQueryData(['notifications'])).toBeUndefined();
    expect(localStorage.getItem('skillforge.accessToken')).toBeNull();
    await waitFor(() => expect(screen.getByText('Signed out')).toBeInTheDocument());
  });
  it('does not restore a session when its profile response arrives after logout', async () => {
    const profile = deferred<Awaited<ReturnType<typeof authApi.me>>>();
    localStorage.setItem(tokenKey, 'old-token');
    vi.mocked(authApi.me).mockReturnValue(profile.promise);
    renderSession();
    await userEvent.click(screen.getByText('Logout'));
    await act(async () => { profile.resolve({ data: { data: account } } as never); });
    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(localStorage.getItem(tokenKey)).toBeNull();
  });
  it('keeps a new account when the previous profile request fails late', async () => {
    const profile = deferred<Awaited<ReturnType<typeof authApi.me>>>();
    localStorage.setItem(tokenKey, 'old-token');
    vi.mocked(authApi.me).mockReturnValue(profile.promise);
    vi.mocked(authApi.login).mockResolvedValue({ data: { data: { user: account, accessToken: 'new-token' } } } as never);
    renderSession();
    await userEvent.click(screen.getByText('Login'));
    await screen.findByText(account.email);
    await act(async () => { profile.reject(new Error('Old session expired')); });
    expect(screen.getByText(account.email)).toBeInTheDocument();
    expect(localStorage.getItem(tokenKey)).toBe('new-token');
  });
  it('does not sign in after logout while a login request is pending', async () => {
    const login = deferred<Awaited<ReturnType<typeof authApi.login>>>();
    vi.mocked(authApi.login).mockReturnValue(login.promise);
    renderSession();
    await userEvent.click(screen.getByText('Login'));
    await userEvent.click(screen.getByText('Logout'));
    await act(async () => { login.resolve({ data: { data: { user: account, accessToken: 'new-token' } } } as never); });
    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(localStorage.getItem(tokenKey)).toBeNull();
  });
  it('ignores expired responses from an earlier session but clears the current expired session', async () => {
    const response = deferred<AxiosResponse>();
    let oldConfig: InternalAxiosRequestConfig | undefined;
    localStorage.setItem(tokenKey, 'old-token');
    vi.mocked(authApi.me).mockResolvedValue({ data: { data: { ...account, email: 'a@test.com' } } } as never);
    vi.mocked(authApi.login).mockResolvedValue({ data: { data: { user: account, accessToken: 'new-token' } } } as never);
    const client = renderSession();
    await screen.findByText('a@test.com');
    const oldRequest = api.get('/enrollments/mine', { adapter: config => { oldConfig = config; return response.promise; } }).catch(() => undefined);
    await waitFor(() => expect(oldConfig).toBeDefined());
    await userEvent.click(screen.getByText('Login'));
    await screen.findByText(account.email);
    client.setQueryData(['enrollments'], ['New account private data']);
    await act(async () => { response.reject(unauthorized(oldConfig!)); await oldRequest; });
    expect(screen.getByText(account.email)).toBeInTheDocument();
    expect(client.getQueryData(['enrollments'])).toEqual(['New account private data']);
    await act(async () => { await api.get('/enrollments/mine', { adapter: async config => { throw unauthorized(config); } }).catch(() => undefined); });
    expect(screen.getByText('Signed out')).toBeInTheDocument();
    expect(client.getQueryData(['enrollments'])).toBeUndefined();
    expect(localStorage.getItem(tokenKey)).toBeNull();
  });
});

import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react"
import { api } from "../services/api";


type AuthProviderProps = PropsWithChildren<{}>;

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

type AuthContextData = {
  user: User | null;
  isSigningIn: boolean;
  signInUrl: string;
  signOut: () => Promise<void>;
}

const AuthContext = createContext({} as AuthContextData);

const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
const redirectUri = import.meta.env.VITE_GITHUB_CALLBACK_URL;

type AuthResponse = {
  token: string;
  user: {
    id: string; 
    avatar_url: string;
    name: string;
    login: string;
  }
}

type ProfileResponse = AuthResponse['user']

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const [isSigningIn, setIsSigningIn] = useState(false);

  async function signIn(code: string) {
    setIsSigningIn(true);

    try {
      const response = await api.post<AuthResponse>('/authenticate', {
        code
      });

      const { token, user } = response.data;

      localStorage.setItem('@dowhile:token', token)

      api.defaults.headers.common.authorization = `Bearer ${token}`

      setUser(user)
    } catch (err) {
      console.log(err)
    } finally {
      setIsSigningIn(false);
    }
  }

  async function signOut() {
    setUser(null)

    localStorage.removeItem('@dowhile:token')
  }

  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token')

    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`

      api.get<ProfileResponse>('/profile')
        .then(response => {
          setUser(response.data)
        })
        .catch(() => {
          signOut()
        });
    }
  }, [])

  useEffect(() => {
    const url = window.location.href;
    const hasGithubCallbackCode = url.includes("?code=");

    if (hasGithubCallbackCode) {
      const [urlWithoutCode, githubAuthCode] = url.split("?code=");

      window.history.pushState({}, '', urlWithoutCode);

      signIn(githubAuthCode);
    }
  }, [])

  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=${clientId}&redirect_uri=${redirectUri}`

  return (
    <AuthContext.Provider value={{ user, isSigningIn, signInUrl, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  return context
}
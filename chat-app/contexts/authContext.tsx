import { AuthContextProps, DecodedTokenProps, UserProps } from "@/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { login, register } from "@/services/authServices";

export const AuthContext = createContext<AuthContextProps>({
  token: null,
  user: null,
  signIn: async () => ({ token: "" }),
  signUp: async () => {},
  signOut: async () => {},
  updateToken: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProps | null>(null);

  const router = useRouter();

  const loadToken = async () => {
    const storedToken = await AsyncStorage.getItem("token");
    if (storedToken) {
      try {
        const decodedToken = jwtDecode<DecodedTokenProps>(storedToken);
        if (decodedToken.exp && decodedToken.exp < Date.now() / 1000) {
          // token expired
          await AsyncStorage.removeItem("token");
          goToWelcomePage();
          return;
        }

        // user is authenticated
        setToken(storedToken);
        setUser(decodedToken.user);

        goToHomePage();
      } catch (error) {
        goToWelcomePage();
      }
    } else {
      goToWelcomePage();
    }
  };

  useEffect(() => {
    loadToken();
  }, []);

  const goToHomePage = () => {
    router.replace("/(main)/home" as any);
  };

  const goToWelcomePage = () => {
    router.replace("/(auth)/welcome" as any);
  };

  const updateToken = async (token: string) => {
    if (token) {
      setToken(token);
      await AsyncStorage.setItem("token", token);

      // decode the token
      const decodedToken = jwtDecode<DecodedTokenProps>(token);
      setUser(decodedToken.user);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await login(email, password);
    await updateToken(response.token);
    router.replace("/(main)/home" as any);
    return { token: response.token };
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    avatar?: string
  ) => {
    const response = await register(email, password, name, avatar);
    await updateToken(response.token);
    router.replace("/(main)/home" as any);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/welcome" as any);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, signIn, signUp, signOut, updateToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

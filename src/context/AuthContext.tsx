import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  userId: string | null; // ID utilisateur directement accessible
  isLoading: boolean;
  isAuthenticated: boolean; // Flag de vérification rapide
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (email: string, firstName: string, lastName: string) => Promise<void>;
  updatePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize with admin user
const initializeUsers = () => {
  const existingUsers = localStorage.getItem('users');
  if (!existingUsers) {
    const defaultUsers = [
      { id: '1', username: 'Jema41', email: 'admin@rayha.com', password: 'berkane41', firstName: 'Admin', lastName: 'Store', role: 'admin' }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize on mount
  useEffect(() => {
    initializeUsers();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const usersJSON = localStorage.getItem('users');
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      
      const foundUser = users.find(
        (u: any) => u.username === username && u.password === password
      );

      if (!foundUser) {
        throw new Error('Identifiants invalides');
      }

      const loggedInUser: User = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role,
      };

      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const usersJSON = localStorage.getItem('users');
      const users = usersJSON ? JSON.parse(usersJSON) : [];

      // Check if username or email already exists
      if (users.some((u: any) => u.username === username || u.email === email)) {
        throw new Error('Cet utilisateur ou cet email existe déjà');
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        password,
        firstName: '',
        lastName: '',
        role: 'user',
      };

      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Log in the new user
      const loggedInUser: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: 'user' as const,
      };

      setUser(loggedInUser);
      localStorage.setItem('currentUser', JSON.stringify(loggedInUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = async (email: string, firstName: string, lastName: string) => {
    if (!user) throw new Error('Aucun utilisateur connecté');
    
    try {
      const usersJSON = localStorage.getItem('users');
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      
      // Update user data
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex === -1) throw new Error('Utilisateur non trouvé');
      
      users[userIndex] = { ...users[userIndex], email, firstName, lastName };
      localStorage.setItem('users', JSON.stringify(users));
      
      // Update current user
      const updatedUser: User = { ...user, email, firstName, lastName };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  const updatePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) throw new Error('Aucun utilisateur connecté');
    
    try {
      const usersJSON = localStorage.getItem('users');
      const users = usersJSON ? JSON.parse(usersJSON) : [];
      
      const userIndex = users.findIndex((u: any) => u.id === user.id);
      if (userIndex === -1) throw new Error('Utilisateur non trouvé');
      
      if (users[userIndex].password !== oldPassword) {
        throw new Error('Le mot de passe actuel est incorrect');
      }
      
      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userId: user?.id || null, isAuthenticated: !!user, isLoading, login, signup, logout, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

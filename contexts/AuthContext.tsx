import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabase';
import { Session, User } from '@supabase/supabase-js';

// Define the profile type
interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  second_surname: string | null;
  phone_number: string | null;
}

// Define the context shape
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  updateProfile: (updatedProfile: Partial<Profile>) => Promise<{ error: any }>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      }
      setLoading(false);
    };
    
    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      if (loading) setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null); // Clear profile on sign out
  };

  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    if (!user) {
        return { error: { message: 'User not authenticated' } };
    }
    const { data, error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id)
        .select()
        .single();

    if (!error && data) {
        setProfile(data);
    }
    return { error };
  };

  const value = {
    session,
    user,
    profile,
    signOut,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
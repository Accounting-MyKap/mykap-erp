import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
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

// Helper function to fetch a user's profile
const fetchProfile = async (user: User | null): Promise<Profile | null> => {
    if (!user) return null;
    const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    if (error) {
        console.error('Error fetching profile:', error.message);
        return null;
    }
    return profileData;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      const userProfile = await fetchProfile(currentUser);
      setProfile(userProfile);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    // Manually clear state for immediate UI feedback. The listener will also
    // fire, but this ensures the state is cleared without delay.
    setSession(null);
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updatedProfile: Partial<Profile>) => {
    // Fetch the latest user data directly from Supabase to ensure the session is valid,
    // avoiding any potential stale state issues from React's render cycle.
    const { data: { user } } = await supabase.auth.getUser();

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
        // Update local profile state upon successful DB update.
        setProfile(data);
    }
    return { error };
  }, []); // No dependencies needed as we fetch the user inside.

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
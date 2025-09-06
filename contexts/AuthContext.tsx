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
    // onAuthStateChange is the single source of truth. It fires on initial load,
    // sign-in, and sign-out, ensuring the React state is always in sync.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      // Fetch the profile if a user exists, otherwise clear it. This handles both
      // login (fetches profile) and logout (clears profile) gracefully.
      const userProfile = await fetchProfile(currentUser);
      setProfile(userProfile);
      
      setLoading(false);
    });

    // Unsubscribe from the listener when the component unmounts.
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // The signOut function now only notifies Supabase. The onAuthStateChange listener
  // above will then handle clearing the state, eliminating the race condition.
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error signing out:", error.message);
    }
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
  }, []);

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
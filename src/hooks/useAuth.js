import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInAnonymously,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import React, { useState, useEffect, useContext, createContext } from "react";
import { config as firebaseConfig } from "../config/firebaseConfig.js";

// Code edited from https://usehooks.com/useAuth/ and
// https://firebase.google.com/docs/auth/web/start#add-initialize-sdk
// Not my original work.

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const firebaseAuth = getAuth(app);

// Hacky export, a cleaner way might be to export it from firebaseConfig
export const db = getFirestore(app);

const googleAuthProvider = new GoogleAuthProvider();

const authContext = createContext();

// Provider component that wraps your app and makes auth object ...
// ... available to any child component that calls useAuth().
export function ProvideAuth({ children }) {
  const auth = useProvideAuth();
  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

// Hook for child components to get the auth object ...
// ... and re-render when it changes.
export const useAuth = () => {
  return useContext(authContext);
};

// Provider hook that creates auth object and handles state
function useProvideAuth() {
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Wrap any Firebase methods we want to use making sure ...
  // ... to save the user to state.
  const signin = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      setUser(response.user);
      return response.user;
    } catch (error) {
      setErrorMessage(error.message);
      return error.message;
    }
  };

  const signup = async (email, password) => {
    try {
      const response = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      setUser(response.user);
      return response.user;
    } catch (error) {
      setErrorMessage(error.message);
      throw error;
    }
  };

  const signout = async () => {
    await firebaseAuth.signOut();
    setUser(false);
  };

  const SendPasswordResetEmail = async (email) => {
    try {
      await sendPasswordResetEmail(firebaseAuth, email);
      setErrorMessage("Password reset email sent");
    } catch (error) {
      setErrorMessage(error.message);
      return error.message;
    }
  };

  const confirmPasswordReset = (code, password) => {
    return firebaseAuth
      .confirmPasswordReset(code, password)
      .then(() => {
        return true;
      })
      .catch((error) => {
        setErrorMessage(error.message);
        return error.message;
        // ...
      });
  };

  const signInWithGoogle = () => {
    return signInWithPopup(firebaseAuth, googleAuthProvider);
  };

  const signInAnonymous = () => {
    return signInAnonymously(firebaseAuth);
  };

  // Subscribe to user on mount
  // Because this sets state in the callback it will cause any ...
  // ... component that utilizes this hook to re-render with the ...
  // ... latest auth object.
  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Return the user object and auth methods
  return {
    user,
    signin,
    signup,
    signout,
    SendPasswordResetEmail,
    confirmPasswordReset,
    signInWithGoogle,
    signInAnonymous,
    errorMessage,
  };
}

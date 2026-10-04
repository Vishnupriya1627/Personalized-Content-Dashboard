import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../features/auth/authSlice';

export default function AuthListener() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      dispatch(
        setUser(
          user
            ? {
                uid: user.uid,
                email: user.email,
                name: user.displayName,
                photo: user.photoURL,
              }
            : null
        )
      );
    });
    return unsubscribe;
  }, [dispatch]);

  return null;
}
import { FC, createContext, useContext, useCallback, useEffect, useState, ReactNode, useMemo, SetStateAction } from 'react';
import Prefs from '../models/prefs';
import Show from '../models/show';
import Profile from '../models/profile';

const getLocalCurrentProfile = () => {
  const loaded = localStorage.getItem('currentProfile');
  if (!loaded)
    return undefined;
  const data = JSON.parse(loaded);
  if (!data.id || !data.name)
    return undefined;
  return data as Profile;
}

interface ProfileContextProps {
  profile: Profile | null;
  prefs: Prefs | null;
  setPrefs: React.Dispatch<SetStateAction<Prefs | null>>;
  newProfileRequest: (name: string) => void;
  setProfileAndReload: (profile: { id: number; name: string; }) => void;
  saveShowRequest: (currentEditingShow: Show) => Promise<void>;
  unsavedData: boolean;
  setUnsavedData: (unsaved: boolean) => void;
}

const ProfileContext = createContext<ProfileContextProps | null>(null);

export const useProfile = () => {
  const profileContext = useContext(ProfileContext);

  if (!profileContext)
    throw new Error(
      'profile has to be used within <ProfileProvider>',
    );

  return profileContext;
};

interface ProfileProviderProps {
  children: ReactNode;
}

const ProfileProvider: FC<ProfileProviderProps> = ({ children }) => {
  const profile = getLocalCurrentProfile() || null

  const [unsavedData, setUnsavedData] = useState(false);
  
  const saveShowRequest = useCallback(async (currentEditingShow: Show) => {
    const showsRes = await fetch(`/api/shows?profileID=${ profile?.id }`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: currentEditingShow.id, name: currentEditingShow.name, singleArtist: currentEditingShow.singleArtist, twoPMRehearsal: currentEditingShow.twoPMRehearsal, setSplitIndex: currentEditingShow.setSplitIndex }),
    });

    const songsRes = await fetch(`/api/songs?showID=${ currentEditingShow.id }`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentEditingShow.songs),
    });

    const castRes = await fetch(`/api/students?showID=${ currentEditingShow.id }`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentEditingShow.cast),
    });

    if ([showsRes, songsRes, castRes].every(x => x.status === 200))
      setUnsavedData(false);
  }, [profile?.id]);

  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    const storagePrefs = localStorage.getItem('prefs');
    if (!storagePrefs)
      return setPrefs({ hideGuitar3: false, hideKeys3: false, hideExtras: false });
    const loadedPrefs = JSON.parse(storagePrefs);
    return setPrefs(loadedPrefs);
  }, []);

  useEffect(() => {
    if (!prefs)
      return;
    localStorage.setItem('prefs', JSON.stringify(prefs))
  }, [prefs]);

  const newProfileRequest = useCallback(async (name: string) => {
    await fetch(`/api/profiles?profileName=${ name }`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      }
    );
    location.reload();
  }, []);

  const setProfileAndReload = useCallback((profile: Profile) => {
    localStorage.setItem('currentProfile', JSON.stringify(profile));
    location.reload();
  }, []);

  const context = useMemo(() => ({
    profile,
    prefs,
    setPrefs,
    newProfileRequest,
    setProfileAndReload,
    saveShowRequest,
    unsavedData,
    setUnsavedData,
  }), [
    profile,
    prefs,
    setPrefs,
    newProfileRequest,
    setProfileAndReload,
    saveShowRequest,
    unsavedData,
    setUnsavedData,
  ]);

  return (
    <ProfileContext.Provider value={ context }>
      { children }
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;

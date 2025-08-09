import { FC, createContext, useContext, useCallback, useEffect, useState, ReactNode, useMemo, SetStateAction } from 'react';
import Prefs from '../models/prefs';
import { ShowProps } from '../models/show';
import Profile from '../models/profile';
import useSWR from 'swr';

const getLocalCurrentProfile = () => {
  const loaded = localStorage.getItem('currentProfile');
  if (!loaded)
    return undefined;
  const data = JSON.parse(loaded);
  if (!data.id || !data.name)
    return undefined;
  return data as Profile;
}

const addShowRequest = async (showProps: ShowProps, profileID: number) => {
  const res = await fetch(`/api/shows?profileID=${ profileID }`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(showProps),
  });

  const data: { newID: number } = await res.json();
  return data.newID;
}
      

interface ProfileContextProps {
  profiles: Profile[] | undefined;
  currentProfile: Profile | undefined;
  prefs: Prefs | null;
  setPrefs: React.Dispatch<SetStateAction<Prefs | null>>;
  newProfileRequest: (name: string) => void;
  setProfileAndReload: (profile: { id: number; name: string; }) => void;
  currentShowID: number | undefined;
  setCurrentShowID: (showID: number) => void;
  initializeShow: (showName: string, singleArtist: boolean, startsAtTwo: boolean) => void;
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
  const { data: profiles } = useSWR<Profile[]>('/api/profiles');
  
  const [currentProfile, setCurrentProfile] = useState<Profile | undefined>(getLocalCurrentProfile());

  useEffect(() => {
    if (!profiles)
      return;
    
    if (!profiles.length) {
      localStorage.removeItem('currentProfile');
      setCurrentProfile(undefined);
      return;
    }

    const local = getLocalCurrentProfile();
    if (!local)
      return;

    const foundProfile = profiles.find(x => x.id === local.id && x.name === local.name)
    if (foundProfile)
      setCurrentProfile(foundProfile);
  }, [profiles]);

  const [currentShowID, setCurrentShowID] = useState<number | undefined>(undefined);

  const initializeShow = useCallback(async (showName: string, singleArtist: boolean, startsAtTwo: boolean) => {
    if (!currentProfile)
      return;
      
    const newShow: ShowProps = {
      id: -1,
      name: showName.trim(),
      singleArtist,
      twoPMRehearsal: startsAtTwo,
      setSplitIndex: 0,
    };

    const resShowID = await addShowRequest(newShow, currentProfile.id);

    setCurrentShowID(resShowID);
  }, [currentProfile?.id]);

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
    profiles,
    currentProfile,
    prefs,
    setPrefs,
    newProfileRequest,
    setProfileAndReload,
    currentShowID,
    setCurrentShowID,
    initializeShow,
  }), [
    profiles,
    currentProfile,
    prefs,
    setPrefs,
    newProfileRequest,
    setProfileAndReload,
    currentShowID,
    setCurrentShowID,
    initializeShow,
  ]);

  return (
    <ProfileContext.Provider value={ context }>
      { children }
    </ProfileContext.Provider>
  );
};

export default ProfileProvider;

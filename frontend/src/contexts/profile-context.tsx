import { FC, createContext, useContext, useCallback, useEffect, useState, ReactNode, useMemo, SetStateAction } from 'react';
import Prefs from '../models/prefs';
import { ShowProps } from '../models/show';
import Profile from '../models/profile';
import useSWR from 'swr';

const getLocalCurrentProfile = () => {
  const loaded = localStorage.getItem('currentProfile');
  if (!loaded)
    return undefined;
  const data: Profile | undefined = JSON.parse(loaded);
  if (!data?.id || !data?.name)
    return undefined;
  return data;
};

const addShowRequest = async (showProps: ShowProps, profileID: string) => {
  await fetch(`/api/shows?profileID=${ profileID }`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(showProps),
  });
};
      

interface ProfileContextProps {
  profiles: Profile[] | undefined;
  currentProfile: Profile | undefined;
  prefs: Prefs | null;
  setPrefs: React.Dispatch<SetStateAction<Prefs | null>>;
  newProfileRequest: (name: string) => void;
  setProfileAndReload: (profile: { id: string; name: string; }) => void;
  currentShowID: string | undefined;
  setCurrentShowID: (showID: string) => void;
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
  const [currentShowID, setCurrentShowID] = useState<string | undefined>(undefined);

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

    const foundProfile = profiles.find(x => x.id === local.id && x.name === local.name);
    if (foundProfile)
      setCurrentProfile(foundProfile);
  }, [profiles]);

  const initializeShow = useCallback(async (showName: string, singleArtist: boolean, startsAtTwo: boolean) => {
    if (!currentProfile)
      return;

    const newShowID = crypto.randomUUID();
      
    const newShow: ShowProps = {
      id: newShowID,
      name: showName.trim(),
      singleArtist,
      twoPMRehearsal: startsAtTwo,
      setSplitIndex: 0,
    };

    await addShowRequest(newShow, currentProfile.id);

    setCurrentShowID(newShowID);
  }, [currentProfile?.id]);

  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    const storagePrefs = localStorage.getItem('prefs');
    if (!storagePrefs)
      return setPrefs({ hideGuitar3: false, hideKeys3: false, hideExtras: false });
    const loadedPrefs: Prefs = JSON.parse(storagePrefs);
    return setPrefs(loadedPrefs);
  }, []);

  useEffect(() => {
    if (!prefs)
      return;
    localStorage.setItem('prefs', JSON.stringify(prefs));
  }, [prefs]);

  const newProfileRequest = useCallback(async (name: string) => {
    await fetch(`/api/profiles?profileName=${ name }`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: crypto.randomUUID(), name }),
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

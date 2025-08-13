import { FC, useState, createContext, useCallback, useContext, ReactNode, useMemo, SetStateAction } from 'react';
import { ShowProps } from '../models/show';
import Student, { Casting, CastingInst, FivePMStartLesson, MainInstrument, TwoPMStartLesson } from '../models/student';
import { useProfile } from './profile-context';
import tileColors from '../tile-color';
import Song from '../models/song';
import useSWR from 'swr';

type NewShowStatus = 'songsWereAdded' | 'castWasAdded' | undefined;
interface StudentInfoOptions {
  name: string;
  lesson?: FivePMStartLesson | TwoPMStartLesson;
  main: MainInstrument;
}

type ResourceName = 'shows' | 'songs' | 'students';

const updateResourceRequest = async (data: Student[] | Song[], showID: string, resourceName: ResourceName) => {
  await fetch(`/api/${ resourceName }?showID=${ showID }`, {
    method: 'PUT',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify(data),
  });
};

interface EditorContextProps {
  singleArtist: boolean;
  setSingleArtist: React.Dispatch<SetStateAction<boolean>>;
  currentEditingShow: ShowProps | undefined;
  showSongs: Song[] | undefined;
  showCast: Student[] | undefined;
  newShowStatus: NewShowStatus;
  setNewShowStatus: React.Dispatch<SetStateAction<NewShowStatus>>;
  currentCastEdit: Casting | null;
  highlightedStudent: string | null;
  setHighlightedStudent: (studentName: string | null) => void;
  setCastEdit: (songID: string, inst: CastingInst) => void;
  discardCastEdit: () => void;
  assignCasting: (studentID: string) => void;
  clearAndCloseCasting: () => void;
  addStudent: (newStudent: Student) => void;
  addNewCastStudents: (newStudents: Student[]) => void;
  updateStudentInfo: (studentID: string, studentInfo: StudentInfoOptions) => void;
  deleteStudent: (studentID: string) => void;
  addSong: (songName: string, artist?: string) => void;
  addNewShowSongs: (songs: Song[]) => void;
  renameSong: (songID: string, newName: string, newArtist?: string) => void;
  reorderSong: (movedSongID: string, target: number) => void;
  deleteSong: (songID: string) => void;
  saveSetListSplitIndex: (setSplitIndex: number) => void;
  availableColors: string[];
}

const EditorContext = createContext<EditorContextProps | null>(null);

export const useEditor = () => {
  const editorContext = useContext(EditorContext);

  if (!editorContext)
    throw new Error(
      'editor has to be used within <EditorProvider>',
    );

  return editorContext;
};

interface EditorProviderProps {
  children: ReactNode;
}

const EditorProvider: FC<EditorProviderProps> = ({ children }) => {
  const { currentProfile, currentShowID } = useProfile();

  const [singleArtist, setSingleArtist] = useState(false);
  
  const { data: currentEditingShow, mutate: mutateCurrentShow } = useSWR<ShowProps>(currentShowID ? `/api/shows?showID=${ currentShowID }` : null);
  const { data: showSongs, mutate: mutateSongs } = useSWR<Song[]>(currentShowID ? `/api/songs?showID=${ currentShowID }`: null);
  const { data: showCast, mutate: mutateCast } = useSWR<Student[]>(currentShowID ? `/api/students?showID=${ currentShowID }`: null);

  const [newShowStatus, setNewShowStatus] = useState<NewShowStatus>();
  const [currentCastEdit, setCurrentCastEdit] = useState<Casting | null>(null);
  const [highlightedStudent, setHighlightedStudent] = useState<string | null>(null);

  const availableColors = useMemo(() => {
    if (!showSongs)
      return [];
    const usedColors = showSongs.map(x => x.color);
    return tileColors.filter(x => !usedColors.find(color => color === x));
  }, [showSongs]);

  const setCastEdit = useCallback((songID: string, inst: CastingInst) => {
    setCurrentCastEdit({ songID, inst });
  }, [setCurrentCastEdit]);

  const discardCastEdit = useCallback(() => setCurrentCastEdit(null), []);

  const unAssignCasting = useCallback(async () => {
    if (!currentEditingShow || !currentCastEdit || !showCast)
      return;

    const oldStudent = showCast.find(x => x.castings.some(casting => casting.inst === currentCastEdit.inst && casting.songID === currentCastEdit.songID));
    if (!oldStudent)
      return;

    const newStudent: Student = { ...oldStudent, castings: oldStudent.castings.filter(x => !(x.inst === currentCastEdit.inst && x.songID === currentCastEdit.songID)) };
    const newCast = showCast.toSpliced(showCast.findIndex(x => x === oldStudent), 1, newStudent);
  
    await mutateCast(async () => { await updateResourceRequest([newStudent], currentEditingShow.id, 'students'); return newCast; }, { optimisticData: newCast, rollbackOnError: true });
  }, [currentEditingShow?.id, currentCastEdit, showCast]);

  const clearAndCloseCasting = useCallback(async () => {
    await unAssignCasting();
    setCurrentCastEdit(null);
  }, [unAssignCasting]);

  const assignCasting = useCallback(async (studentID: string) => {
    await unAssignCasting();
    if (!currentEditingShow || !currentCastEdit || !showCast)
      return;
    
    const oldStudent = showCast.find(x => x.id === studentID);
    if (!oldStudent)
      return;

    const newStudent: Student = { ...oldStudent, castings: [...oldStudent.castings, { songID: currentCastEdit?.songID, inst: currentCastEdit?.inst }] };
    const newCast = showCast.toSpliced(showCast.findIndex(x => x === oldStudent), 1, newStudent);

    await mutateCast(async () => { await updateResourceRequest([newStudent], currentEditingShow.id, 'students'); return newCast; }, { optimisticData: newCast, rollbackOnError: true });
    setCurrentCastEdit(null);
  }, [currentEditingShow?.id, currentCastEdit, unAssignCasting, showCast]);

  const addStudent = useCallback(async (newStudent: Student) => {
    if (!currentEditingShow || !showCast || showCast?.some(x => x.name === newStudent.name))
      return;

    await mutateCast(async () => { await updateResourceRequest([newStudent], currentEditingShow.id, 'students'); return [...showCast, newStudent]; });
  }, [currentEditingShow?.id, showCast]);

  const addNewCastStudents = useCallback(async (newStudents: Student[]) => {
    if (!currentEditingShow)
      return;

    await mutateCast(async () => { await updateResourceRequest(newStudents, currentEditingShow.id, 'students'); return newStudents; }, { optimisticData: newStudents });
  }, [currentEditingShow?.id]);

  const updateStudentInfo = useCallback(async (studentID: string, studentInfo: StudentInfoOptions) => {
    if (!currentEditingShow || !showCast)
      return;
    const oldStudent = showCast.find(x => x.id === studentID);
    if (!oldStudent)
      return;

    const newStudent: Student = { ...oldStudent, name: studentInfo.name, lesson: studentInfo.lesson, main: studentInfo.main };
    const newCast = showCast.toSpliced(showCast.findIndex(x => x === oldStudent), 1, newStudent);

    await mutateCast(async () => { await updateResourceRequest([newStudent], currentEditingShow.id, 'students'); return newCast; }, { optimisticData: newCast, rollbackOnError: true });
  }, [currentEditingShow?.id, showCast]);

  const deleteStudent = useCallback(async (studentID: string) => {
    if (!showCast)
      return;
    
    const newCast = showCast.filter(x => x.id !== studentID);

    const deleteStudentRequest = async () => {
      await fetch(`/api/students?studentID=${ studentID }`, { method: 'DELETE' });
    };

    await mutateCast(async () => { await deleteStudentRequest(); return newCast; }, { optimisticData: newCast, rollbackOnError: true });
  }, [showCast]);

  const addSong = useCallback(async (name: string, artist?: string) => {
    if (!currentEditingShow || !showSongs)
      return;

    const newSong = { id: crypto.randomUUID(), name, artist, setOrder: showSongs.length, color: availableColors[0] };

    const newSongs = [...showSongs, newSong];
    
    await mutateSongs(async () => { await updateResourceRequest([newSong], currentEditingShow.id, 'songs'); return newSongs; }, { optimisticData: newSongs, rollbackOnError: true });
  }, [currentEditingShow?.id, showCast, availableColors]);

  const addNewShowSongs = useCallback(async (newSongs: Song[]) => {
    if (!currentEditingShow)
      return;

    await mutateSongs(async () => { await updateResourceRequest(newSongs, currentEditingShow.id, 'songs'); return newSongs; }, { optimisticData: newSongs, rollbackOnError: true });
  }, [currentEditingShow]);

  const renameSong = useCallback(async (songID: string, newName: string, newArtist?: string) => {
    if (!currentEditingShow || !showSongs)
      return;

    const oldSong = showSongs.find(x => x.id === songID);
    if (!oldSong)
      return;

    const newSong = { ...oldSong, name: newName, artist: newArtist };

    const newSongs = showSongs.toSpliced(showSongs.findIndex(x => x === oldSong), 1, newSong);

    await mutateSongs(async () => { await updateResourceRequest([newSong], currentEditingShow.id, 'songs'); return newSongs; }, { optimisticData: newSongs, rollbackOnError: true });
  }, [currentEditingShow?.id, showSongs]);

  const reorderSong = useCallback(async (movedSongId: string, target: number) => {
    if (!showSongs || !currentEditingShow)
      return;
    
    const newSongs = [...showSongs].toSorted((a, b) => a.setOrder - b.setOrder);
    const movedIndex = newSongs.findIndex(x => x.id === movedSongId);
    const moved = newSongs.splice(movedIndex, 1)[0];

    const newSetOrder = moved.setOrder > target ? target : target - 1;

    const newOrderedSongs: Song[] = newSongs.toSpliced(newSetOrder, 0, moved).map((x, i) => ({ ...x, setOrder: i }));

    await mutateSongs(async () => { await updateResourceRequest(newOrderedSongs, currentEditingShow?.id, 'songs'); return newOrderedSongs; }, { optimisticData: newOrderedSongs, rollbackOnError: true });
  }, [currentEditingShow?.id, showSongs]);

  const deleteSong = useCallback(async (songID: string) => {
    if (!currentEditingShow || !showSongs)
      return;

    const newSongs = showSongs.filter(x => x.id !== songID).toSorted((a, b) => a.setOrder - b.setOrder).map((x, i) => ({ ...x, setOrder: i }));

    const deleteSongRequest = async () => {
      await fetch(`/api/songs?songID=${ songID }`, { method: 'DELETE' });
    };

    await mutateSongs(async () => { await deleteSongRequest(); return newSongs; }, { optimisticData: newSongs, rollbackOnError: true });

    if (newSongs.length) {
      await mutateSongs(async () => { await updateResourceRequest(newSongs, currentEditingShow.id, 'songs'); return newSongs; }, { optimisticData: newSongs, rollbackOnError: true });
    }
  }, [currentEditingShow?.id, showSongs]);

  const saveSetListSplitIndex = useCallback(async (setSplitIndex: number) => {
    if (!currentEditingShow)
      return;

    const newShow = { ...currentEditingShow, setSplitIndex };

    const updateShowRequest = async () => {
      await fetch(`/api/shows?profileID=${ currentProfile?.id }`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(newShow),
      });
    };

    await mutateCurrentShow(async () => { await updateShowRequest(); return newShow; }, { optimisticData: newShow, rollbackOnError: true });
  }, [currentEditingShow, currentProfile?.id]);

  const context = useMemo(() => ({
    singleArtist,
    setSingleArtist,
    currentEditingShow,
    showSongs,
    showCast,
    newShowStatus,
    setNewShowStatus,
    currentCastEdit,
    highlightedStudent,
    setHighlightedStudent,
    setCastEdit,
    discardCastEdit,
    assignCasting,
    clearAndCloseCasting,
    addStudent,
    addNewCastStudents,
    updateStudentInfo,
    deleteStudent,
    addSong,
    addNewShowSongs,
    renameSong,
    reorderSong,
    deleteSong,
    saveSetListSplitIndex,
    availableColors,
  }),
  [
    singleArtist,
    setSingleArtist,
    currentEditingShow,
    showSongs,
    showCast,
    newShowStatus,
    setNewShowStatus,
    currentCastEdit,
    highlightedStudent,
    setHighlightedStudent,
    setCastEdit,
    discardCastEdit,
    assignCasting,
    clearAndCloseCasting,
    addStudent,
    addNewCastStudents,
    updateStudentInfo,
    deleteStudent,
    addSong,
    addNewShowSongs,
    renameSong,
    reorderSong,
    deleteSong,
    saveSetListSplitIndex,
    availableColors,
  ]);

  return (
    <EditorContext.Provider value={ context }>
      { children }
    </EditorContext.Provider>
  );
};

export default EditorProvider;

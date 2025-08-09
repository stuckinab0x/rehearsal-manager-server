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

const updateResourceRequest = async (data: Student[] | Song[], showID: number, resourceName: ResourceName) => {
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
  setCastEdit: (songId: number, inst: CastingInst) => void;
  discardCastEdit: () => void;
  assignCasting: (studentID: number) => void;
  clearAndCloseCasting: () => void;
  addStudent: (newStudent: Student) => void;
  addNewCastStudents: (newStudents: Student[]) => void;
  updateStudentInfo: (studentID: number, studentInfo: StudentInfoOptions) => void;
  deleteStudent: (studentID: number) => void;
  addSong: (songName: string, artist?: string) => void;
  addNewShowSongs: (songs: Song[]) => void;
  renameSong: (songId: number, newName: string, newArtist?: string) => void;
  reorderSong: (movedSongId: number, target: number) => void;
  deleteSong: (songId: number) => void;
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

  const setCastEdit = useCallback((songID: number, inst: CastingInst) => {
    setCurrentCastEdit({ songID, inst });
  }, [setCurrentCastEdit]);

  const discardCastEdit = useCallback(() => setCurrentCastEdit(null), []);

  const unAssignCasting = useCallback(() => {
    if (!currentEditingShow || !currentCastEdit || !showCast)
      return;

    const oldStudent = showCast.find(x => x.castings.some(casting => casting.inst === currentCastEdit.inst && casting.songID === currentCastEdit.songID));
    if (!oldStudent)
      return;

    const newStudent: Student = { ...oldStudent, castings: oldStudent.castings.filter(x => !(x.inst === currentCastEdit.inst && x.songID === currentCastEdit.songID)) };
    const newCast = showCast.toSpliced(showCast.findIndex(x => x === oldStudent), 1, newStudent);
  
    mutateCast(() => { updateResourceRequest([newStudent], currentEditingShow.id, 'students'); return newCast }, { optimisticData: newCast, rollbackOnError: true });
  }, [currentEditingShow?.id, currentCastEdit, showCast]);

  const clearAndCloseCasting = useCallback(() => {
    unAssignCasting();
    setCurrentCastEdit(null);
  }, [unAssignCasting]);

  const assignCasting = useCallback((studentID: number) => {
    unAssignCasting()
    if (!currentEditingShow || !currentCastEdit || !showCast)
      return;
    
    const oldStudent = showCast.find(x => x.id === studentID);
    if (!oldStudent)
      return;

    const newStudent: Student = { ...oldStudent, castings: [...oldStudent.castings, { songID: currentCastEdit?.songID, inst: currentCastEdit?.inst }] };
    const newCast = showCast.toSpliced(showCast.findIndex(x => x === oldStudent), 1, newStudent);

    mutateCast(() => { updateResourceRequest([newStudent], currentEditingShow.id, 'students'); return newCast }, { optimisticData: newCast, rollbackOnError: true });
    setCurrentCastEdit(null);
  }, [currentEditingShow?.id, currentCastEdit, unAssignCasting, showCast]);

  const addStudent = useCallback((newStudent: Student) => {
    if (!currentEditingShow || !showCast || showCast?.some(x => x.name === newStudent.name))
      return;

    mutateCast(() => { updateResourceRequest([newStudent], currentEditingShow.id, 'students'); return [...showCast, newStudent] })
  }, [currentEditingShow?.id, showCast]);

  const addNewCastStudents = useCallback((newStudents: Student[]) => {
    if (!currentEditingShow)
      return;

    mutateCast(() => { updateResourceRequest(newStudents, currentEditingShow.id, 'students'); return newStudents }, { optimisticData: newStudents })
  }, [currentEditingShow?.id])

  const updateStudentInfo = useCallback((studentID: number, studentInfo: StudentInfoOptions) => {
    if (!currentEditingShow || !showCast)
      return;
    const oldStudent = showCast.find(x => x.id === studentID);
    if (!oldStudent)
      return;

    const newStudent: Student = { ...oldStudent, name: studentInfo.name, lesson: studentInfo.lesson, main: studentInfo.main };
    const newCast = showCast.toSpliced(showCast.findIndex(x => x === oldStudent), 1, newStudent);

    mutateCast(() => { updateResourceRequest([newStudent], currentEditingShow.id, 'students'); return newCast; }, { optimisticData: newCast, rollbackOnError: true });
  }, [currentEditingShow?.id, showCast]);

  const deleteStudent = useCallback((studentID: number) => {
    if (!showCast)
      return;
    
    const newCast = showCast.filter(x => x.id !== studentID);

    const deleteStudentRequest = async () => {
      await fetch(`/api/students?studentID=${ studentID }`, { method: 'DELETE' });
    }

    mutateCast(() => { deleteStudentRequest(); return newCast }, { optimisticData: newCast, rollbackOnError: true });
  }, [showCast]);

  const addSong = useCallback((name: string, artist?: string) => {
    if (!currentEditingShow || !showSongs)
      return;

    const newSong = { id: -1, name, artist, setOrder: showSongs.length, color: availableColors[0] };

    const newSongs = [...showSongs, newSong];
    
    mutateSongs(() => { updateResourceRequest([newSong], currentEditingShow.id, 'songs'); return newSongs }, { optimisticData: newSongs, rollbackOnError: true });
  }, [currentEditingShow?.id, showCast, availableColors]);

  const addNewShowSongs = useCallback((newSongs: Song[]) => {
    if (!currentEditingShow)
      return;

    mutateSongs(() => { updateResourceRequest(newSongs, currentEditingShow.id, 'songs'); return newSongs }, { optimisticData: newSongs, rollbackOnError: true });
  }, []);

  const renameSong = useCallback((songID: number, newName: string, newArtist?: string) => {
    if (!currentEditingShow || !showSongs)
      return;

    const oldSong = showSongs.find(x => x.id === songID);
    if (!oldSong)
      return;

    const newSong = { ...oldSong, name: newName, artist: newArtist };

    const newSongs = showSongs.toSpliced(showSongs.findIndex(x => x === oldSong), 1, newSong);

    mutateSongs(() => { updateResourceRequest([newSong], currentEditingShow.id, 'songs'); return newSongs }, { optimisticData: newSongs, rollbackOnError: true });
  }, [currentEditingShow?.id, showSongs]);

  const reorderSong = useCallback((movedSongId: number, target: number) => {
    if (!showSongs || !currentEditingShow)
      return;
    
    const newSongs = [...showSongs].toSorted((a, b) => a.setOrder - b.setOrder);
    const movedIndex = newSongs.findIndex(x => x.id === movedSongId);
    const moved = newSongs.splice(movedIndex, 1)[0];
    const newOrderedSongs: Song[] = newSongs.toSpliced(target, 0, moved).map((x, i) => ({ ...x, setOrder: i }));

    mutateSongs(() => { updateResourceRequest(newOrderedSongs, currentEditingShow?.id, 'songs'); return newOrderedSongs }, { optimisticData: newOrderedSongs, rollbackOnError: true });
  }, [currentEditingShow?.id, showSongs]);

  const deleteSong = useCallback((songID: number) => {
    if (!currentEditingShow || !showSongs)
      return;

    const newSongs = showSongs.filter(x => x.id !== songID).toSorted((a, b) => a.setOrder - b.setOrder).map((x, i) => ({ ...x, setOrder: i }))

    const deleteSongRequest = async () => {
      await fetch(`/api/songs?songID=${ songID }`, { method: 'DELETE' });
    }

    mutateSongs(() => { deleteSongRequest(); return newSongs }, { optimisticData: newSongs, rollbackOnError: true });

    if (newSongs.length) {
      mutateSongs(() => { updateResourceRequest(newSongs, currentEditingShow.id, 'songs'); return newSongs }, { optimisticData: newSongs, rollbackOnError: true });
    }
  }, [currentEditingShow?.id, showSongs]);

  const saveSetListSplitIndex = useCallback((setSplitIndex: number) => {
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

    mutateCurrentShow(() => { updateShowRequest(); return newShow }, { optimisticData: newShow, rollbackOnError: true });
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

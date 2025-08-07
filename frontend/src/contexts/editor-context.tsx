import { FC, useState, createContext, useCallback, useContext, ReactNode, useMemo, SetStateAction } from 'react';
import Show from '../models/show';
import Student, { Casting, CastingInst, FivePMStartLesson, MainInstrument, TwoPMStartLesson } from '../models/student';
import { useProfile } from './profile-context';
import tileColors from '../tile-color';

type NewShowStatus = 'songsWereAdded' | 'castWasAdded' | undefined;
interface StudentInfoOptions {
  name: string;
  lesson?: FivePMStartLesson | TwoPMStartLesson;
  main: MainInstrument;
}

interface EditorContextProps {
  singleArtist: boolean;
  setSingleArtist: React.Dispatch<SetStateAction<boolean>>;
  currentEditingShow: Show | null;
  setCurrentEditingShow: React.Dispatch<SetStateAction<Show | null>>;
  newShowStatus: NewShowStatus;
  setNewShowStatus: React.Dispatch<SetStateAction<NewShowStatus>>;
  currentCastEdit: Casting | null;
  highlightedStudent: string | null;
  setHighlightedStudent: (studentName: string | null) => void;
  setCastEdit: (songId: number, inst: CastingInst) => void;
  discardCastEdit: () => void;
  assignCasting: (studentName: string) => void;
  clearAndCloseCasting: () => void;
  addStudent: (newStudent: Student) => void;
  updateStudentInfo: (studentName: string, studentInfo: StudentInfoOptions) => void;
  deleteStudent: (studentName: string) => void;
  addSong: (songName: string, artist?: string) => void;
  renameSong: (songId: number, newName: string, newArtist?: string) => void;
  reorderSong: (movedSongId: number, target: number) => void;
  deleteSong: (songId: number) => void;
  initializeShow: (showName: string, singleArtist: boolean, startsAtTwo: boolean) => void;
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
  const { setUnsavedData } = useProfile();
  
  const [singleArtist, setSingleArtist] = useState(false);
  const [currentEditingShow, setCurrentEditingShow] = useState<Show | null>(null);
  const [newShowStatus, setNewShowStatus] = useState<NewShowStatus>();
  const [currentCastEdit, setCurrentCastEdit] = useState<Casting | null>(null);
  const [highlightedStudent, setHighlightedStudent] = useState<string | null>(null);

  const availableColors = useMemo(() => {
    if (!currentEditingShow?.songs)
      return [];
    const usedColors = currentEditingShow?.songs.map(x => x.color);
    return tileColors.filter(x => !usedColors.find(color => color === x));
  }, [currentEditingShow?.songs]);
  
  const initializeShow = useCallback((showName: string, singleArtist: boolean, startsAtTwo: boolean) => {
    const newShow: Show = {
      id: -1,
      name: showName.trim(),
      singleArtist,
      twoPMRehearsal: startsAtTwo,
      setSplitIndex: 0,
      songs: [],
      cast:[],
    }
    setCurrentEditingShow(newShow);
    setUnsavedData(true);
  }, [setUnsavedData]);

  const setCastEdit = useCallback((songId: number, inst: CastingInst) => {
    setCurrentCastEdit({ songId, inst });
  }, [setCurrentCastEdit]);

  const discardCastEdit = useCallback(() => setCurrentCastEdit(null), []);

  const unAssignCasting = useCallback(() => {
    if (!currentCastEdit)
      return;
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      const oldStudent = oldState.cast.find(x => x.castings.some(casting => casting.inst === currentCastEdit.inst && casting.songId === currentCastEdit.songId));
      if (!oldStudent)
        return oldState;
      const newStudent: Student = { ...oldStudent, castings: oldStudent.castings.filter(x => !(x.inst === currentCastEdit.inst && x.songId === currentCastEdit.songId)) };
      return { ...oldState, cast: oldState.cast.toSpliced(oldState.cast.findIndex(x => x === oldStudent), 1, newStudent) };
    });
    setUnsavedData(true);
  }, [currentCastEdit, setUnsavedData]);

  const clearAndCloseCasting = useCallback(() => {
    unAssignCasting();
    setCurrentCastEdit(null);
    setUnsavedData(true);
  }, [unAssignCasting, setUnsavedData]);

  const assignCasting = useCallback((studentName: string) => {
    unAssignCasting()
    if (!currentCastEdit)
      return;
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      const oldStudent = oldState.cast.find(x => x.name === studentName);
      if (!oldStudent)
        return oldState;
      const newStudent: Student = { ...oldStudent, castings: [...oldStudent.castings, { songId: currentCastEdit?.songId, inst: currentCastEdit?.inst }] };
      return { ...oldState, cast: oldState.cast.toSpliced(oldState.cast.findIndex(x => x === oldStudent), 1, newStudent) };
    }) 
    setCurrentCastEdit(null);
    setUnsavedData(true);
  }, [currentCastEdit, unAssignCasting, setUnsavedData]);

  const addStudent = useCallback((newStudent: Student) => {
    if (currentEditingShow?.cast.some(x => x.name === newStudent.name))
      return;
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      return { ...oldState, cast: [...oldState.cast, newStudent]};
    })
    setUnsavedData(true);
  }, [currentEditingShow, setUnsavedData]);

  const updateStudentInfo = useCallback((studentName: string, studentInfo: StudentInfoOptions) => {
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      const oldStudent = oldState.cast.find(x => x.name === studentName);
      if (!oldStudent)
        return oldState;
      const newStudent: Student = { ...oldStudent, name: studentInfo.name, lesson: studentInfo.lesson, main: studentInfo.main };
      return { ...oldState, cast: oldState.cast.toSpliced(oldState.cast.findIndex(x => x === oldStudent), 1, newStudent) };
    });
    setUnsavedData(true);
  }, [setUnsavedData]);

  const deleteStudent = useCallback((studentName: string) => {
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      return { ...oldState, cast: oldState.cast.filter(x => x.name !== studentName) };
    });
    setUnsavedData(true);
  }, [setUnsavedData]);

  const addSong = useCallback((songName: string, artist?: string) => {
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      return { ...oldState, songs: [...oldState.songs, { id: Math.max(...oldState.songs.map(x => x.id)) + 1, name: songName, artist, color: availableColors[0] }] };
    });
    setUnsavedData(true);
  }, [setUnsavedData, availableColors]);

  const renameSong = useCallback((songId: number, newName: string, newArtist?: string) => {
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      const oldSong = oldState.songs.find(x => x.id === songId);
      if (!oldSong)
        return oldState;
      return { ...oldState, songs: oldState.songs.toSpliced(oldState.songs.findIndex(x => x === oldSong), 1, { ...oldSong, name: newName, artist: newArtist }) };
    });
    setUnsavedData(true);
  }, [setUnsavedData]);

  const reorderSong = useCallback((movedSongId: number, target: number) => {
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      const movedIndex = oldState.songs.findIndex(x => x.id === movedSongId);
      if (movedIndex === -1)
        return oldState;
      const newSongs = oldState.songs.toSpliced(target, 0, { ...oldState.songs[movedIndex] })
      newSongs.splice(movedIndex >= target ? movedIndex + 1 : movedIndex, 1);
      return { ...oldState, songs: newSongs }
    });
    setUnsavedData(true);
  }, [setUnsavedData]);

  const deleteSong = useCallback((songId: number) => {
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      return {
        ...oldState,
        cast: oldState.cast.map(x => ({ ...x, castings: x.castings.filter(x => x.songId !== songId) })),
        songs: oldState.songs.filter(x => x.id !== songId),
      };
    });
    setUnsavedData(true);
  }, [setUnsavedData]);

  const saveSetListSplitIndex = useCallback((setSplitIndex: number) => {
    setCurrentEditingShow(oldState => {
      if (!oldState)
        return null;
      return { ...oldState, setSplitIndex };
    })
    setUnsavedData(true);
  }, [setUnsavedData]);

  const context = useMemo(() => ({
    singleArtist,
    setSingleArtist,
    currentEditingShow,
    setCurrentEditingShow,
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
    updateStudentInfo,
    deleteStudent,
    addSong,
    renameSong,
    reorderSong,
    deleteSong,
    initializeShow,
    saveSetListSplitIndex,
    availableColors,
  }),
    [
      singleArtist,
      setSingleArtist,
      currentEditingShow,
      setCurrentEditingShow,
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
      updateStudentInfo,
      deleteStudent,
      addSong,
      renameSong,
      reorderSong,
      deleteSong,
      initializeShow,
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

import { FC, useState, createContext, useContext, ReactNode, useMemo, SetStateAction, useEffect } from 'react';
import EditorView from '../models/editor-view';
import { useProfile } from './profile-context';

interface ViewsContextProps {
  editorView: EditorView;
  setEditorView: React.Dispatch<SetStateAction<EditorView>>;
  toolsMode: boolean;
  setToolsMode: (on: boolean) => void;
}

const ViewsContext = createContext<ViewsContextProps | null>(null);

export const useViews = () => {
  const viewsContext = useContext(ViewsContext);

  if (!viewsContext)
    throw new Error(
      'views has to be used within <ViewsProvider>',
    );

  return viewsContext;
};

interface ViewsProviderProps {
  children: ReactNode;
}

const ViewsProvider: FC<ViewsProviderProps> = ({ children }) => {
  const { profiles, currentProfile } = useProfile();

  const [editorView, setEditorView] = useState<EditorView>(currentProfile ? 'welcome' : 'profiles');
  const [toolsMode, setToolsMode] = useState(false);

  useEffect(() => {
    if (profiles && !currentProfile)
      setEditorView('profiles');
  }, [profiles]);

  const context = useMemo(() => ({
    editorView,
    setEditorView,
    toolsMode,
    setToolsMode,
  }), [
    editorView,
    setEditorView,
    toolsMode,
    setToolsMode,
  ]);

  return (
    <ViewsContext.Provider value={ context }>
      { children }
    </ViewsContext.Provider>
  );
};

export default ViewsProvider;

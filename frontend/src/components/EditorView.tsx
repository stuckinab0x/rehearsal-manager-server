import { FC } from 'react';
import NewShowView from './NewShowView';
import NewCastView from './NewCastView';
import NewSongsView from './NewSongsView';
import ShowOverview from './ShowOverview';
import WelcomeScreen from './WelcomeScreen';
import CastMemberView from './CastMemberView';
import ProfilesView from './ProfilesView';
import { useViews } from '../contexts/views-context';

const EditorView: FC = () => {
  const { editorView } = useViews();
  
  if (editorView === 'profiles')
    return <ProfilesView />;

  if (editorView === 'welcome')
    return <WelcomeScreen />;
  
  if (editorView === 'newShow')
    return <NewShowView />;

  if (editorView === 'newShowCast')
    return <NewCastView />;

  if (editorView === 'newShowSongs')
    return <NewSongsView />;

  if (editorView === 'showOverview')
    return <ShowOverview />;

  if (editorView === 'editCast')
    return <CastMemberView />;
};

export default EditorView;

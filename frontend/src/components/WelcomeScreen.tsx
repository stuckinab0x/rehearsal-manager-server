import { FC, useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useViews } from '../contexts/views-context';
import { useProfile } from '../contexts/profile-context';

interface ShowNameAndId {
  id: string;
  name: string;
}

const WelcomeScreen: FC = () => {
  const { setEditorView } = useViews();
  const { profiles, currentProfile, setCurrentShowID } = useProfile();

  const [showNamesAndIds, setShowNamesAndIds] = useState<ShowNameAndId[] | undefined>();

  useEffect(() => {
    if (profiles && !currentProfile)
      setEditorView('profiles');
  }, [profiles, currentProfile]);

  useEffect(() => {
    const requestShowNames = async () => {
      try {
        const res = await fetch(`/api/shows?profileID=${ currentProfile?.id }`);
        const shows: ShowNameAndId[] = await res.json();
          setShowNamesAndIds(shows);
      } catch (error) {
        console.log(error);
      }
    }
    requestShowNames();
  }, []);

  const handleShowClick = useCallback((showID: string) => {
    setCurrentShowID(showID);
    setEditorView('showOverview');
  }, [])

  return (
    <ViewMain>
      <h1>
        Create/Edit Shows:
      </h1>
      { showNamesAndIds && <ShowsList>
        { showNamesAndIds.map(x => <Button key={ x.id } onClick={ () => handleShowClick(x.id) }>
          <h2>{ x.name }</h2>
        </Button>) }
      </ShowsList> }
      <Divider />
      <Button onClick={ () => setEditorView('newShow') }>
        <h2>Create New Show</h2>
      </Button>
    </ViewMain>
  )
}

const ViewMain = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  text-align: center;

  h1, h2, h3, h4 {
    margin: 0 0 4px 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }
`;

const ShowsList = styled.div`
  display: flex;
  flex-direction: column;
`;

const Divider = styled.div`
  display: flex;
  background-color: ${ props => props.theme.colors.bgInner3 };
  height: 15px;
  width: 100%;
  margin: 4px 0;
  border-radius: 4px;
`;

const Button = styled.div`
  display: flex;
  background-color: ${ props => props.theme.colors.accent };
  justify-content: center;
  border-radius: 4px;
  padding: 4px;
  margin: 4px 0px;
  cursor: pointer;
`;

export default WelcomeScreen;

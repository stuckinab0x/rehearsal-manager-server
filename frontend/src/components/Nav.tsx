import { FC } from 'react';
import styled from 'styled-components';
import { useEditor } from '../contexts/editor-context';
import { useProfile } from '../contexts/profile-context';
import { useViews } from '../contexts/views-context';

const Nav: FC = () => {
  const { profile, unsavedData, saveShowRequest } = useProfile();
  const { setEditorView } = useViews();
  const { currentEditingShow } = useEditor();

    return (
    <NavMain>
      <div>
        <h1>Rehearsal Manager</h1>
        { currentEditingShow && 
          <Button onClick={ () => setEditorView('welcome') }>
            <h2>{ currentEditingShow.name }</h2>
          </Button>
        }
        { unsavedData && currentEditingShow && 
        <SaveButton onClick={ () => saveShowRequest(currentEditingShow) }>
          <h3>Save Changes</h3>
        </SaveButton>
        }
      </div>
      { profile && <ProfileName onClick={ () => setEditorView('profiles') }>Profile: { profile.name }</ProfileName> }
    </NavMain>
    )
}
const NavMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${ props => props.theme.colors.bgNav };
  height: 60px;
  padding: 10px 20px;
  box-shadow: 0px 2px 10px 2px rgba(0, 0, 0, 0.5);

  h1, h2, h3 {
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  }

  > div {
    display: flex;
    align-items: center;

    > h1 {
      color: ${ props => props.theme.colors.accent };
    }
  }
`;

const ProfileName = styled.h1`
  color: white;
  margin-right: 10px;
  cursor: pointer;
  background-color: ${ props => props.theme.colors.accent };
  padding: 2px 12px;
  border-radius: 6px;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.5);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
`;

const Button = styled.div`
  display: flex;
  background-color: ${ props => props.theme.colors.accent };
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  padding: 4px 10px;
  margin: 4px 22px 0px;
  cursor: pointer;
  box-shadow: 1px 1px 4px 1px rgba(0, 0, 0, 0.5);

  > h2, h3 {
    color: white;
  }
`;

const SaveButton = styled(Button)`
  opacity: 0.7;
  animation: pulse 10s infinite;

  &:hover {
    opacity: 1;
  }

  @keyframes pulse {
    0% {
      background-color: #1f1f1f;
    }

    50% {
      background-color: ${ props => props.theme.colors.accent };
    }

    100% {
      background-color: #1f1f1f;
    }
  }
`;

export default Nav;

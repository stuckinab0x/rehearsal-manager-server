import { FC, useState } from 'react';
import styled from 'styled-components';
import { useProfile } from '../contexts/profile-context';

const ProfilesView: FC = () => {
  const { profiles, setProfileAndReload, newProfileRequest } = useProfile();

  const [input, setInput] = useState('');
  const [creatingNew, setCreatingNew] = useState(false);

  if (!profiles)
    return (
      <ViewMain>
        <h2>Waiting for profiles...</h2>
      </ViewMain>
    );

  return (
    <ViewMain>
      { !creatingNew && <>
        <h2>{ profiles.length ? 'Existing profiles' : 'No Profiles Found' }</h2>
        { profiles.length > 0 && profiles.map(x => 
          <Button key={ x.id } onClick={ () => setProfileAndReload(x) }>
            <h2>{ x.name }</h2>
          </Button>,
        )}
        <Divider />
        <Button onClick={ () => setCreatingNew(true) }>
          <h2>New Profile</h2>
        </Button>
      </>
      }
      { creatingNew
      && <>
        <h2>New Profile:</h2>
        <NameInput value={ input } onChange={ event => setInput(event.currentTarget.value) } placeholder='enter profile name' />
        <Button onClick={ () => newProfileRequest(input) } $disabled={ !input }>
          <h2>Create</h2>
        </Button>
      </>
      }
    </ViewMain>
  );
};

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

interface ButtonProps {
  $disabled?: boolean;
}

const Button = styled.div<ButtonProps>`
  display: flex;
  background-color: ${ props => props.theme.colors.accent };
  justify-content: center;
  border-radius: 4px;
  padding: 4px;
  margin: 4px 0px;
  cursor: pointer;

  ${ props => props.$disabled && 'pointer-events: none; opacity: 0.5' };
`;

const NameInput = styled.input`
  color: white;
  border: none;
  border-radius: 2px;
  margin: 2px;
  padding: 5px 10px;
  min-height: 25px;
  background-color: ${ props => props.theme.colors.bgInner3 };
  outline: none;
  font-size: 1.3rem;
`;

const Divider = styled.div`
  display: flex;
  background-color: ${ props => props.theme.colors.bgInner3 };
  height: 15px;
  width: 100%;
  margin: 4px 0;
  border-radius: 4px;
`;

export default ProfilesView;

import { FC, useState } from 'react';
import styled from 'styled-components';
import { useViews } from '../contexts/views-context';
import { useProfile } from '../contexts/profile-context';

const NewShowView: FC = () => {
  const [editingName, setEditingName] = useState(true);
  const [nameInput, setNameInput] = useState('');
  const [singleArtist, setSingleArtist] = useState(0);
  const [startsAtTwo, setStartsAtTwo] = useState(0);

  const { setEditorView } = useViews();
  const { initializeShow } = useProfile();

  return (
    <ViewMain>
        <Section>
          <h2>What's the show's name?</h2>
          { editingName && <input type='text' value={ nameInput } onChange={ event => setNameInput(event.currentTarget.value) } />}
          <Button $orange $fade={ !nameInput } $fontLarge={ !editingName } onClick={ () => setEditingName(nameInput ? !editingName : true) }>
            { editingName ? 'Ok' : nameInput }
          </Button>
        </Section>
        { !editingName && 
        <Section>
          <ShowTypeContainer>
            <h2>Is the show for a single band/artist?</h2>
            <h4>(we won't bother using artist names later if there's only one)</h4>
            <div>
            <Button $orange={ singleArtist === 1 } onClick={ () => setSingleArtist(1) }>
              Single artist
            </Button>
            <Button $orange={ singleArtist === 2 } onClick={ () => setSingleArtist(2) }>
              At least 2 artists
            </Button>
            </div>
          </ ShowTypeContainer>
        </Section> }
        { !editingName && singleArtist !== 0 &&
          <Section>
            <ShowTypeContainer>
              <h2>What time do rehearsals start?</h2>
              <h4>(for setting any lessons that students might have)</h4>
              <div>
                <Button $orange={ startsAtTwo === 1 } onClick={ () => setStartsAtTwo(1) }>
                  5:00 PM
                </Button>
                <Button $orange={ startsAtTwo === 2 } onClick={ () => setStartsAtTwo(2) }>
                  2:00 PM
                </Button>
              </div>
            </ShowTypeContainer>
          </Section>
        }
        { !editingName && singleArtist !== 0 && startsAtTwo !== 0 &&
            <Section>
              <h2>Okay, let's add songs/cast members</h2>
              <div>
                <Button onClick={ () => { initializeShow(nameInput, singleArtist === 1, startsAtTwo === 2); setEditorView('newShowCast') } }>
                  Add Cast Members
                </Button>
                <Button onClick={ () => { initializeShow(nameInput, singleArtist === 1, startsAtTwo === 2); setEditorView('newShowSongs') } }>
                  Add Songs
                </Button>
              </div>
            </Section>
          }
    </ViewMain>
  )
}

const ViewMain = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  text-align: center;

  h2, h4 {
    margin: 0 0 4px 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }

  input {
    margin-bottom: 15px;
    background-color: ${ props => props.theme.colors.bgInner1 };
    border: 2px solid rgba(0, 0, 0, 0.4);
    border-radius: 4px;
    font-size: 20px;
    color: white;
    outline: none;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
`;

const ShowTypeContainer = styled.div`
  display: flex;
  flex-direction: column;

  div {
    display: flex;
    justify-content: space-evenly;
  }
`;



interface ButtonProps {
  $orange?: boolean;
  $fade?: boolean;
  $fontLarge?: boolean;
}

const Button = styled.div<ButtonProps>`
  display: flex;
  justify-content: center;
  font-size: 20px;
  ${ props => props.$fontLarge && 'font-size: 25px;' }
  background-color: ${ props => props.theme.colors.bgInner2 };
  ${ props => props.$orange && `background-color: ${ props.theme.colors.accent };` }
  border-radius: 4px;
  margin: 5px;
  padding: 5px;
  flex-grow: 1;
  box-shadow: 1px 1px 4px 0px rgba(0, 0, 0, 0.3);
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  user-select: none;
  cursor: pointer;
  ${ props => props.$fade && 'opacity: 0.5; cursor: default;' }

  color: white;
  font-weight: bold;
`;

export default NewShowView;

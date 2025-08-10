import { FC } from 'react';
import styled from 'styled-components';
import Student, { MainInstrument } from '../../models/student';
import CastMember from './CastMember';

interface CastByInstrumentColumnProps {
  instrument: MainInstrument;
  castMembers: Student[];
  twoPmStart: boolean;
  activeEdit: string | null;
  setActiveEdit: (studentID: string | null) => void;
}

const CastByInstrumentColumn: FC<CastByInstrumentColumnProps> = ({ instrument, castMembers, twoPmStart, activeEdit, setActiveEdit }) => (
  <Column>
    <InstrumentHeader>
      <h3>{ instrument }</h3>
    </InstrumentHeader>
    { castMembers.map(x => <CastMember key={ x.name } student={ x } twoPmStart={ twoPmStart } activeEdit={ activeEdit } setActiveEdit={ setActiveEdit } />) }
  </Column>
)

const Column = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  text-align: center;
`;

const InstrumentHeader = styled.div`
  background-color: ${ props => props.theme.colors.accent };
  padding: 5px;
  margin: 2px;
  border-radius: 2px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
  width: 100%;
  
  > h3 {
    color: white;
    margin: 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }
`;

export default CastByInstrumentColumn;

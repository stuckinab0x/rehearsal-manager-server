import { FC } from 'react';
import styled from 'styled-components';
import Student, { MainInstrument } from '../../models/student';
import { useEditor } from '../../contexts/editor-context';

interface PickerColumnProps {
  instrument: MainInstrument;
  castMembers: Student[];
}

const PickerColumn: FC<PickerColumnProps> = ({ instrument, castMembers }) => {
  const { assignCasting } = useEditor();
  
  return (
    <Column>
      <InstrumentHeader>
        <h3>{ instrument }</h3>
      </InstrumentHeader>
      {
        castMembers.map(x =>
          <CastMember key={ x.name } onClick={ () => assignCasting(x.id) }>
            <h3>{ x.name }</h3>
          </CastMember>)
      }
    </Column>
  );
};

const Column = styled.div`
  display: flex;
  flex-direction: column;
  color: white;
  text-align: center;
`;

const InstrumentHeader = styled.div`
  background-color: ${ props => props.theme.colors.accent };
  padding: 5px;
  margin: 2px;
  border-radius: 2px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
  
  > h3 {
    color: white;
    margin: 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }
`;

const CastMember = styled.div`
  background-color: ${ props => props.theme.colors.bgInner1 };
  padding: 4px;
  margin: 2px;
  cursor: pointer;

  > h3 {
    color: white;
    margin: 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }
`;

export default PickerColumn;

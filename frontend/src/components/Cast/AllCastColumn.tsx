import { FC } from 'react';
import styled from 'styled-components';
import { MainInstrument } from '../../models/student';
import { useEditor } from '../../contexts/editor-context';

interface AllCastColumnProps {
  instrument: MainInstrument;
  students: string[];
}

const AllCastColumn: FC<AllCastColumnProps> = ({ instrument, students }) => {
  const { highlightedStudent, setHighlightedStudent } = useEditor();

  return (
    <Column>
      <Tile $orange>
        <h3>{ instrument }</h3>
      </Tile>
      { students.toSorted().map(x => <Tile key={ x } $student $orange={ x === highlightedStudent } onClick={ () => setHighlightedStudent(x === highlightedStudent ? null : x) }>
        <h3>{ x }</h3>
      </Tile>)
      }
    </Column>
  );
};

const Column = styled.div`
  display: flex;
  flex-direction: column;
`;

interface TileProps {
  $orange: boolean;
  $student?: boolean;
}

const Tile = styled.div<TileProps>`
  justify-content: center;
  align-items: center;
  padding: 2px 4px;
  width: 250px;
  margin: 2px;
  border-radius: 4px;
  background-color: ${ props => props.$orange ? props.theme.colors.accent : props.theme.colors.bgInner3 };
  ${ props => props.$student && 'cursor: pointer;' }
  user-select: none;
  
  > h3 {
    color: white;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
    margin: 0;
    text-align: center;
  }
`;

export default AllCastColumn;

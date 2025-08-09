import { FC } from 'react';
import styled from 'styled-components';
import { ALL_INSTRUMENTS } from '../../models/student';
import AllCastColumn from './AllCastColumn';
import { useEditor } from '../../contexts/editor-context';

const AllCast: FC = () => {
  const { showCast } = useEditor();
  
  if (showCast)
    return (
      <AllCastMain>
        <h3>Click a student to highlight their songs</h3>
        <div>{ ALL_INSTRUMENTS.map(x => <AllCastColumn key={ x } instrument={ x } students={ showCast.filter(student => student.main === x).map(student => student.name) } />) }</div>
      </AllCastMain>
    )
}

const AllCastMain = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${ props => props.theme.colors.bgInner2 };
  padding: 4px;
  border-radius: 4px;

  > h3 {
    margin: 2px 4px;
    color: rgba(255, 255, 255, 0.8);
  }

  > div {
    display: flex;
  }
`;

export default AllCast;

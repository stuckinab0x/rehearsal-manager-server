import { FC, useMemo } from 'react';
import styled, { css } from 'styled-components';
import { instAndFullNames } from '../../models/song';
import { CastingInst } from '../../models/student';
import { useProfile } from '../../contexts/profile-context';
import { useViews } from '../../contexts/views-context';

interface CastListHeaderProps {
  showName: string;
  disabled: boolean;
}

const CastListHeader: FC<CastListHeaderProps> = ({ showName, disabled }) => {
  const { prefs } = useProfile();
  const { toolsMode, setToolsMode } = useViews();
  
  const hidden = useMemo(() => {
    if (!prefs)
      return null;
    const hidden: CastingInst[] = [];
    if (prefs.hideGuitar3)
      hidden.push('gtr3');
    if (prefs.hideKeys3)
      hidden.push('keys3');
    if (prefs.hideExtras)
      hidden.push('bgVox3');
    return hidden;
  }, [prefs]);

  if (hidden)
    return (
      <HeaderMain $disabled={ disabled }>
        <CornerTile $active={ toolsMode } onClick={ () => toolsMode && setToolsMode(false) }>
          { !toolsMode && <span className='material-symbols-outlined' onClick={ () => setToolsMode(!toolsMode) }>settings</span> }
          <h3>{ toolsMode ? 'Click to  finish editing' : showName }</h3>
        </CornerTile>
        { instAndFullNames.filter(x => !hidden.includes(x[1])).map(x => 
          <InstrumentHeader key={ x[0] }>
            <h3>{ x[0] }</h3>
          </InstrumentHeader>)}
      </HeaderMain>
    );
};

interface HeaderProps {
  $disabled: boolean;
}

const HeaderMain = styled.div<HeaderProps>`
  display: flex;
  align-items: center;
  margin: 2px 2px 1px;
  ${ props => props.$disabled && 'opacity: 0.5;' }
  ${ props => props.$disabled && 'pointer-events: none;' }

  h3 {
    color: white;
    margin: 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
  }
`;

const InstrumentHeader = styled.div`
  display: flex;
  background-color: ${ props => props.theme.colors.accent };
  padding: 5px 10px;
  margin: 2px;
  border-radius: 2px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.2);
  justify-content: center;
  width: 100px;
`;

const cornerActiveStyle = css`
  animation: pulse 5s infinite;
  cursor: pointer;
  justify-content: center;
`;

interface CornerTileProps {
  $active: boolean;
}

const CornerTile = styled(InstrumentHeader)<CornerTileProps>`
  display: flex;
  background-color: #1f1f1f;
  justify-content: space-between;
  align-items: center;
  width: 250px;

  > span {
    cursor: pointer;
    color: white;
  }

  ${ props => props.$active && cornerActiveStyle }

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

export default CastListHeader;

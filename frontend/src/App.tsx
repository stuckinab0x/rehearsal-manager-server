import { FC } from 'react'
import styled, { createGlobalStyle, ThemeProvider } from 'styled-components'
import theme from './styles/Theme'
import Nav from './components/Nav'
import EditorView from './components/EditorView'
import EditorProvider from './contexts/editor-context'
import ProfileProvider from './contexts/profile-context'
import ViewsProvider from './contexts/views-context'
import SWRProvider from './providers/SWRProvider'

const GlobalStyle = createGlobalStyle`
  html, body {
    background-color : #353535;
    margin: 0;
    display: flex;
    height: 100vh;
    flex-direction: column;
    font-family: 'Segoe UI';
  }

  body > div {
    display: flex;
    flex: 1;
  }

  span {
    user-select: none;
  }
`;

const App: FC = () => {
  return (
    <ThemeProvider theme={ theme }>
      <SWRProvider>
        <ProfileProvider>
          <ViewsProvider>
            <EditorProvider>
              <Main>
                <GlobalStyle />
                <Nav />
                <Content>
                  <EditorContainer>
                    <EditorView />
                  </EditorContainer>
                </Content>
              </Main>
            </EditorProvider>
          </ViewsProvider>
        </ProfileProvider>
      </SWRProvider>
    </ThemeProvider>
  )
}

const Main = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0;
  flex: 1;
`

const Content = styled.div`
  display: flex;
  justify-content: center;
  padding: 30px;
`;

const EditorContainer = styled.div`
  display: flex;
  background-color: ${ props => props.theme.colors.bgInner1 };
  border-radius: 10px;
  box-shadow: 4px 4px 15px 2px rgba(0, 0, 0, 0.5);
  padding: 15px 20px;
`;

export default App

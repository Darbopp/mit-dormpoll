import styled from 'styled-components';
import * as palette from './Variables.js';

const StyleButton=styled.button`
    background: ${palette.ACCENT_COLOR};
    color: ${palette.TITLE_TEXT_COLOR};
    border-radius: 10%;
    border: none;

    font-size: 1rem;
    font-family: "Roboto", Times, serif;
    font-weight: bold;

    margin-left: .5rem;
    margin-right: .5rem;
    padding: 1em;

    :hover{
        background: ${palette.HOVER_ACCENT_COLOR};
        color: ${palette.HOVER_TITLE_TEXT_COLOR};
    }
    `;

const Announcement = styled.p`
  color: ${palette.ANNOUNCEMENT_TEXT_COLOR};
  text-align: center;
  font-size: 1.5rem;
  font-family: "Roboto", Times, serif;
`;

const MainDiv = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
`;

const MainPaddingDiv = styled.div`
  display: flex;
  padding-top: 5rem;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
`;

export default StyleButton;

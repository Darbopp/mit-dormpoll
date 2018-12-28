import styled from 'styled-components';
import * as palette from '../../StyleConstants.js';

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

export default StyleButton;

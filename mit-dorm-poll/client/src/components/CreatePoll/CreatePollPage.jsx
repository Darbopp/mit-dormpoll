import React, { Component } from 'react';
import '../../App.css';
import Announcement from '../styled/Announcement.jsx'; // Inherets for Mui Typography
import CreatePollWindow from './CreatePollWindow.jsx';
import MainDiv from '../styled/MainDiv.jsx';

export default class CreatePollPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render(){
        return(
            <MainDiv>
                <Announcement variant="h4" align="center">
                    Create A Poll
                </Announcement>
                <CreatePollWindow/>
            </MainDiv>
        );

    }


}

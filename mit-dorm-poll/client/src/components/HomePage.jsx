import React, { Component } from 'react';
import '../App.css';
import styled from "styled-components";
import Announcement from './styled/Announcement.jsx'; // Inherets for Mui Typography
import MainPaddingDiv from './styled/MainPaddingDiv.jsx';

import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';


const StyledCard = styled(Card)`
  &&{
    margin-top: 4rem;
  }
`

export default class HomePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      polls: [],
      authToken: ''
    };
  }

  componentWillMount() {
  }

  render(){
    return (
      <MainPaddingDiv>
          <Announcement variant="h4" align="center">
            Welcome to DormPoll!
          </Announcement>
          <Announcement variant="h5" align="center">
            We love questions and answers.
          </Announcement>

          <StyledCard>
            <CardMedia
              image={require('../images/maseehHall.jpg')}
              title="Masseh Hall"
              style={{width: "75vw", paddingTop: '56.25%'}}
            />
          </StyledCard>
      </MainPaddingDiv>);
  }
}

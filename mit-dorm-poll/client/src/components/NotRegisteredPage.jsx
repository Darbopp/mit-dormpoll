import React, { Component } from 'react';
import '../App.css';
import Announcement from './styled/Announcement.jsx'; // Inherits for Mui Typography
import MainPaddingDiv from './styled/MainPaddingDiv.jsx';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

export default class NotRegisteredPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authToken: ''
    };
  }

  render(){
    return (
      <MainPaddingDiv>
        <Card>
          <CardMedia
            image={require('../images/sadcat.jpg')}
            title="sadCat"
            style={{minWidth: '100%', width: "50vw", paddingTop: '56.25%'}}
          />
          <CardContent>
            <Announcement variant="h4" align="center">
              You are not yet registered on dormpoll
            </Announcement>
          </CardContent>
        </Card>
      </MainPaddingDiv>);
  }
}

import React, { Component } from 'react';
import '../App.css';
import Announcement from './styled/Announcement.jsx'; // Inherets for Mui Typography
import MainPaddingDiv from './styled/MainPaddingDiv.jsx';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';


export default class NoMatchPage extends Component {

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
                style={{width: "50vw", paddingTop: '56.25%'}}
              />
              <CardContent>
                <Announcement variant="h4" align="center">
                  404 Page Not Found
                </Announcement>
              </CardContent>
            </Card>
      </MainPaddingDiv>);
  }
}

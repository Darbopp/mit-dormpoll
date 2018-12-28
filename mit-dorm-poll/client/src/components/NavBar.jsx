import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Link } from 'react-router-dom';
import styled from 'styled-components';

import SignInButton from './SignInButton.jsx';
import SignOutButton from './SignOutButton.jsx';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';


const NavButton = styled(Button)`
  &&{
    margin: .5rem;
  }
  `;

export default class NavBar extends Component{

  constructor(props) {
    super(props);
    this.state = {
      msg: '',
    }
  }

  render() {

    let SignButton = this.props.loggedIn ? <SignOutButton/> : <SignInButton/>

    let PollButton = this.props.user ?
      <NavButton variant="contained" component={Link} to="/poll">
        Polls
      </NavButton>
      : '';

    let SignInMessage = this.props.user ?
      <Typography variant="h6" style={{}}>
        Signed in as <br/> {this.props.user} {this.state.msg}
      </Typography>
      : '';

    let AdminManageButton = (this.props.adminStatus) ?
      <NavButton variant="contained" component={Link} to="/admin/manage">
        Manage People
      </NavButton>
      : '';

    let CreatePollButton = (this.props.adminStatus) ?
      <NavButton variant="contained" component={Link} to="/poll/create">
        Create Poll
      </NavButton>
      : '';

    return (
        <AppBar position="sticky" color="primary">
            <Toolbar>
                <Button disableRipple style={{textTransform: 'none'}} component={Link} to="/">
                  <Typography variant="h6" style={{flexGrow: 1}}>
                      DormPoll
                  </Typography>
                </Button>
                <div style={{flex:1}}>
                </div>
                {CreatePollButton}
                {PollButton}
                {AdminManageButton}
                {SignButton}
                {SignInMessage}
            </Toolbar>
        </AppBar>
    )
  }

}

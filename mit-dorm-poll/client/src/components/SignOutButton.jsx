import React, { Component } from 'react';
import * as oidc from '../OidcConstants'
import styled from 'styled-components';
import axios from 'axios';

import Button from '@material-ui/core/Button';

const NavButton = styled(Button)`
    &&{
        margin: .5rem;
    }
    `;

export default class SignOutButton extends Component {

  constructor(props) {
    super(props);

    this.signOut = this.signOut.bind(this);
  }

  signOut() {
    axios.post('/api/users/logout');
    window.location = oidc.url;
  }

  render() {
    return(
      <NavButton variant="contained" onClick={this.signOut}>
        Sign Out
      </NavButton>
    )
  }

};

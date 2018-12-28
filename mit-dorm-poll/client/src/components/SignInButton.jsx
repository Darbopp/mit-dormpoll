import React, { Component } from 'react';
import * as oidc from '../OidcConstants'
import styled from 'styled-components';

import Button from '@material-ui/core/Button';

const NavButton = styled(Button)`
    &&{
        margin: .5rem;
    }
    `;

export default class SignInButton extends Component {

  constructor(props) {
    super(props);

    this.redirectOpenId = this.redirectOpenId.bind(this);
  }

  redirectOpenId() {
    window.location=oidc.oidc_url;
  }

  render(){
    return(
      <NavButton variant="contained" onClick={this.redirectOpenId}>
        Sign In
      </NavButton>
    )
  }

};

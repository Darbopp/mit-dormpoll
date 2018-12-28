import React, { Component } from 'react';
import {BrowserRouter as Router, Route, Link, Switch, Redirect} from 'react-router-dom';
import axios from "axios";
import styled from "styled-components";
import * as palette from './StyleConstants.js';
import * as oidc from './OidcConstants.js';

import { createMuiTheme } from '@material-ui/core/styles';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import CssBaseline from '@material-ui/core/CssBaseline';

import HomePage from './components/HomePage.jsx';
import PollPage from './components/PollPage/PollPage.jsx';
import CreatePollPage from './components/CreatePoll/CreatePollPage.jsx';
import ManagePage from './components/ManagePeoplePage/ManagePage.jsx';
import NoMatchPage from './components/NoMatchPage.jsx';
import MustBeAdminPage from './components/MustBeAdminPage.jsx';
import PleaseSignInPage from './components/PleaseSignInPage.jsx';
import NotRegisteredPage from './components/NotRegisteredPage';
import NavBar from './components/NavBar.jsx';
import PollResultsPage from './components/PollResultsPage.jsx';
import PollListItem from './components/PollPage/PollListItem.jsx';

const theme = createMuiTheme({
  palette: {
    primary: {
      light: '#8aaeff',
      main: '#527fe8',
      dark: '#0053b5',
    },
    seconday: {
      light: '#91ebff',
      main: '#5AB9EA',
      dark: '#0b89b8',
    },
    type: 'light',
    typography: {
      fontFamily: [
        'Roboto',
        'sans-serif',
      ].join(','),
      fontSize: 12,
    }
  }
});

const Title = styled.h1`
  color: ${palette.TITLE_TEXT_COLOR};
  text-algin: center;
  font-size: 2em;
`;

const Header = styled.section`
  padding: 1em;
  height: 10vh;
  background: ${palette.HEADER_COLOR};
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
  align-items: center;
`;

const Body = styled.section`
  height: fit-content;
  min-height: 100vh;
  padding-bottom: 10rem;
  background-image: linear-gradient(to bottom, #84ceeb 65%, #60b9ee, #55a0ee, #6883e6, #8860d0);
`;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      userLoaded: false,
      loggedIn: false
    };
    this.getProfile = this.getProfile.bind(this);
    this.checkAdmin = this.checkAdmin.bind(this);
  }

  componentDidMount() {
    axios.defaults.baseURL = oidc.base_url;
    axios
      .get(`/form`,)
      .then((res) => {
        // handle success
        this.state.csrfToken = res.data.csrfToken;
        axios.defaults.headers.common['CSRF-Token'] = res.data.csrfToken; // for all requests
      })
      .then(() => {
        this.getProfile();
      });
  }

  checkAdmin() {
    axios.get('/api/admins/status')
      .then(res => {
        this.setState({adminStatus: res.data.admin})
      })
      .catch((err) => {})
      .then(() => {
        this.setState({userLoaded: true});
      });
  }

  getProfile() {
    axios.get('/api/users')
      .then(res => {
        this.setState(res.data);
        this.setState({loggedIn: true})
      })
      .catch((err) => {
        if (err.response.data.error === 'You are not yet registered for dormpoll') {
          if (window.location.href !== `${oidc.base_url}/error/invaliduser`)
            window.location = `${oidc.base_url}/error/invaliduser`;
          this.setState({loggedIn: true})
        }
      })
      .then(() => {
        this.checkAdmin();
      });
  }

  //Router must only have one child, and enables us to use routes.
  //Routes has exact path="-path-", which will show the component in component={-component-}
  //Main menu has buttons wrapped in <Link>s, which will send you to the component below.
  render(){

    let signInMessage = this.state.name ? (<p>Signed in as <br/> {this.state.name}</p>) : '';

    let PollRoute = this.state.name ?
      <Route exact path="/poll" render={(props) => <PollPage {...props} adminStatus={this.state.adminStatus} />}/>
      :
      <Redirect from='/poll' to='/error/401' />;

    let CreatePollRoute = <Redirect from='/poll/create' to='/error/401' />;
    if (this.state.name !== undefined) {
      if (this.state.adminStatus === true){
        CreatePollRoute = <Route exact path="/poll/create" component={CreatePollPage} />
      }else{
        CreatePollRoute = <Redirect from='/poll/create' to='/error/403' />
      }
    }

    let test = CreatePollRoute === <Redirect from='/poll/create' to='/error/401' />;

    let PollResultsRoute = <Redirect from='/poll/results/:pollId' to='/error/401' />;
    if (this.state.name !== undefined) {
      if (this.state.adminStatus === true){
        PollResultsRoute = <Route exact path="/poll/results/:pollId" component={PollResultsPage} />
      }else{
        PollResultsRoute = <Redirect from='/poll/results/:pollId' to='/error/403' />;
      }
    }

    let ViewPollRoute = this.state.name ?
    <Route exact path="/poll/view/:pollId" component={PollListItem} />
    :
    <Redirect from='/poll/view/:pollId' to='/error/401' />;

    let ManageRoute = <Redirect from='/admin/manage' to='/error/401' />;
    if (this.state.name !== undefined) {
      if (this.state.adminStatus === true){
        ManageRoute = <Route path="/admin/manage" component={ManagePage} />
      }else{
        ManageRoute = <Redirect from='/admin/manage' to='/error/403' />;
      }
    };

    return(
        <Router>
          <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <div>

            <header>
              <meta name="csrf-token" content={this.state.csrfToken}/>
              <NavBar loggedIn={this.state.loggedIn} user={this.state.kerberos} adminStatus={this.state.adminStatus}/>
            </header>

            <Body>
              {this.state.userLoaded ? <Switch>
                <Route exact path="/" component={HomePage} />
                {PollRoute}
                {CreatePollRoute}
                {PollResultsRoute}
                {ViewPollRoute}
                {ManageRoute}
                <Route exact path="/error/invaliduser" component={NotRegisteredPage} />
                <Route exact path="/error/401" component={PleaseSignInPage} />
                <Route exact path="/error/403" component={MustBeAdminPage} />
                <Route component={NoMatchPage} />
              </Switch> : null}
            </Body>

          </div>
          </MuiThemeProvider>
        </Router>

    );
  }
}


export default App;

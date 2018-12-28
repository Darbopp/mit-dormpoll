import React, { Component } from 'react';
import IconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';
import Announcement from '../styled/Announcement.jsx';
import MainDiv from '../styled/MainDiv.jsx';
import AdminColumn from './AdminColumn.jsx';
import UserColumn from './UserColumn.jsx';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';

const ColumnsDiv = styled.div`
  display: flex;
  flex-flow: row wrap;
`
const ManageDiv = styled(MainDiv)`
  align-items: center;
`

export default class ManagePage extends Component {

    constructor(props) {
        super(props);

        this.state = {
          snackBarOpen: false,
          snackBarMessage: '',
        };

        this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
        this.openSnackBar = this.openSnackBar.bind(this);
    }

    // Closes the snackbar.
    handleSnackBarClose() {
      this.setState({
        snackBarOpen: false,
        snackBarMessage: '',
      });
    }

    openSnackBar(message){
      this.setState({
        snackBarOpen: true,
        snackBarMessage: message,
      })
    }

    render(){
        return(
          <ManageDiv>
            <Announcement variant="h4" align="center">
              Manage People
            </Announcement>
            <ColumnsDiv>
              <AdminColumn openSnackBar={this.openSnackBar}/>
              <UserColumn openSnackBar={this.openSnackBar}/>
            </ColumnsDiv>
            <Snackbar
              anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
              open={this.state.snackBarOpen}
              autoHideDuration={6000}
              onClose={this.handleSnackBarClose}
              ContentProps={{
                'aria-describedby': 'message-id',
              }}
              message={<span id="message-id">{this.state.snackBarMessage}</span>}
              action={[
                <IconButton
                  key="close"
                  aria-label="Close"
                  color="inherit"
                  onClick={this.handleSnackBarClose}
                >
                  <CloseIcon />
                </IconButton>,
              ]}
            />
          </ManageDiv>
        )
    }

    };

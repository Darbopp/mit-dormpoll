import React, { Component } from 'react';
import AddUserForm from './AddUserForm';
import UserList from './UserList';
import axios from "axios";
import styled from 'styled-components';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';


let ColumnDiv = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
`

export default class UserColumn extends Component {

    constructor(props) {
        super(props);

        this.state = {
          users: [], // [{userId: userId, kerberos: kerberos}]
          dialogOpen: false,
          deleteUserId: '',
        };

        this.addUser = this.addUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.confirmedDeleteUser = this.confirmedDeleteUser.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);

        let data;
        axios.get('/api/users/all')
          .then(res => {
            data = res.data.users;
        }).then(res => {
          this.setState({users: data});
        });
    }

    addUser(userKerberos) {
      if (userKerberos === '') {
        this.props.openSnackBar("user kerberos is required");
      }else{
        let data;
        axios.post(`/api/users/create/${userKerberos}`)
          .then(res => {
            // handle success
            data = res.data;
            this.props.openSnackBar("user added successfully!");
          })
          .then(res => {
            let data;
            axios.get('/api/users/all')
              .then(res => {
                data = res.data.users;
              }).then(res => {
              this.setState({users: data});
            });
          })
          .catch(err => {
            this.props.openSnackBar("Error adding user!")
          });
      }

    }

    deleteUser(userId){
      this.setState({
        dialogOpen: true,
        deleteUserId: userId});
    }

    confirmedDeleteUser(){
        let userId = this.state.deleteUserId;
        let indexOfChild = -1;
        for (let i = 0; i < this.state.users.length; i++) {
          if (this.state.users[i].userId === userId) {
            indexOfChild = i;
          }
        }

        if (indexOfChild === -1) {
          console.log("UserId was not an user");
        }

        const usersCopy = this.state.users.slice();
        const removedUser = usersCopy.splice(indexOfChild, 1);

        axios.delete(`api/users/${userId}`);
        this.props.openSnackBar("user Removed Successfully!");

        this.setState({
            users: usersCopy,
            dialogOpen: false,
            deleteUserId: '',
        });
    }

    // Closes the dialog.
    handleDialogClose() {
      this.setState({dialogOpen: false});
    };

    render(){
        return(
          <ColumnDiv>
            <AddUserForm
              addUser={this.addUser}
              />
            <UserList
              users={this.state.users}
              deleteUser={this.deleteUser}
              />

            <Dialog
              open={this.state.dialogOpen}
              onClose={this.handleDialogClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{"Remove user?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to remove this user?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleDialogClose} color="primary">
                  CANCEL
                </Button>
                <Button onClick={this.confirmedDeleteUser} color="primary" autoFocus>
                  REMOVE
                </Button>
              </DialogActions>
            </Dialog>
          </ColumnDiv>
        )
    }

    };

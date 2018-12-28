import React, { Component } from 'react';
import AddAdminForm from './AddAdminForm';
import AdminList from './AdminList';
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

export default class AdminColumn extends Component {

    constructor(props) {
        super(props);

        this.state = {
          admins: [], // [{userId: userId, kerberos: kerberos}]
          dialogOpen: false,
          deleteAdminUserId: '',
        };

        this.addAdmin = this.addAdmin.bind(this);
        this.deleteAdmin = this.deleteAdmin.bind(this);
        this.confirmedDeleteAdmin = this.confirmedDeleteAdmin.bind(this);
        this.handleDialogClose = this.handleDialogClose.bind(this);

        let data;
        axios.get('/api/admins/')
          .then(res => {
            data = res.data.admins;
        }).then(res => {
          this.setState({admins: data});
        });
    }

    addAdmin(adminKerberos) {
      if (adminKerberos === '') {
        this.props.openSnackBar("Admin kerberos is required");
      }else{
        const bodyContent = { adminKerberos: adminKerberos };
        let data;
        axios.post('/api/admins', bodyContent)
          .then(res => {
            // handle success
            data = res.data;
            this.props.openSnackBar("Admin added successfully!");
          })
          .then(res => {
            let newAdmin = {userId: data.admin, kerberos: adminKerberos};
            let joined = this.state.admins.concat(newAdmin);
            this.setState({
              admins: joined
            });
          })
          .catch(err => {
            this.props.openSnackBar("Error adding admin!")
          });
      }

    }

    deleteAdmin(userId){
      this.setState({
        dialogOpen: true,
        deleteAdminUserId: userId});
    }

    confirmedDeleteAdmin(){
        let userId = this.state.deleteAdminUserId;
        let indexOfChild = -1;
        for (let i = 0; i < this.state.admins.length; i++) {
          if (this.state.admins[i].userId === userId) {
            indexOfChild = i;
          }
        }

        if (indexOfChild === -1) {
          console.log("UserId was not an admin");
        }

        const adminsCopy = this.state.admins.slice();
        const removedAdmin = adminsCopy.splice(indexOfChild, 1);

        axios.delete(`api/admins/${userId}`);
        this.props.openSnackBar("Admin Removed Successfully!");

        this.setState({
            admins: adminsCopy,
            dialogOpen: false,
            deleteAdminUserId: '',
        });
    }

    // Closes the dialog.
    handleDialogClose() {
      this.setState({dialogOpen: false});
    };

    render(){
        return(
          <ColumnDiv>
            <AddAdminForm
              addAdmin={this.addAdmin}
              />
            <AdminList
              admins={this.state.admins}
              deleteAdmin={this.deleteAdmin}
              />

            <Dialog
              open={this.state.dialogOpen}
              onClose={this.handleDialogClose}
              aria-labelledby="alert-dialog-title"
              aria-describedby="alert-dialog-description"
            >
              <DialogTitle id="alert-dialog-title">{"Remove Admin?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Are you sure you want to remove this admin?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={this.handleDialogClose} color="primary">
                  CANCEL
                </Button>
                <Button onClick={this.confirmedDeleteAdmin} color="primary" autoFocus>
                  REMOVE
                </Button>
              </DialogActions>
            </Dialog>
          </ColumnDiv>
        )
    }

    };

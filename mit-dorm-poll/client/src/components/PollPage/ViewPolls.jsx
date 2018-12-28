import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from "axios";
import Announcement from '../styled/Announcement.jsx';
import PollListCard from './PollListCard';

import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';


export default class ViewPolls extends Component {
  constructor(props) {
    super(props);
    let message = () => {
      if (this.props.success) {
        if (this.props.success === 'create')
          return "Success! Poll Created!";
        if (this.props.success === 'update')
          return "Success! Your response has been updated!";
        if (this.props.success === 'vote')
          return "Success! Thank you for voting!";
      }
      return '';
    };

    this.state = {
      dialogOpen: false,
      snackBarOpen: this.props.success ? true: false,
      snackBarMessage: message(),
      deletePollId: 0,
    };

    this.deletePoll = this.deletePoll.bind(this);
    this.displaySnackBar = this.displaySnackBar.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
    this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
  }

  // Deletes the Poll.
  deletePoll() {
    this.setState({dialogOpen: false});
    const pollId = this.state.deletePollId;
    axios.delete(`/api/polls/${pollId}`, {})
    .then(response => {
      this.props.refresh(); // Re-render page.
      this.setState({snackBarMessage: response.data,
                     snackBarOpen: true});
    })
    .catch(err => {
      this.props.refresh();
      this.setState({snackBarMessage: err.response.data.error,
                     snackBarOpen: true});
    });
  }

  displaySnackBar(message) {
    this.setState({snackBarOpen: true,
                   snackBarMessage: message})
  }

  // Opens the dialog.
  handleDeleteClick(pollId) {
    this.setState({dialogOpen: true,
                   deletePollId: pollId})
  }

  // Closes the dialog.
  handleDialogClose() {
    this.setState({dialogOpen: false});
  };

  // Closes the snackbar.
  handleSnackBarClose() {
    this.setState({snackBarOpen: false});
  };

  render(){
  	let polls;
  	if (this.props.polls) {
  		polls = this.props.polls.map(poll => {
  			return <PollListCard
          key={poll.pollId}
          pollId={poll.pollId}
          data={poll.data}
          adminStatus={this.props.adminStatus}
          pollName={poll.pollName}
          startTime={poll.startTime}
          endTime={poll.endTime}
          handleDeleteClick={this.handleDeleteClick}
          isOpen={poll.isOpen}
          originalStartTime={poll.originalStartTime}
          originalEndTime={poll.originalEndTime}
          displaySnackBar={this.displaySnackBar}
          refresh={this.props.refresh}
        />;
  		});
  	} else {
      polls = <Announcement variant="h5" align="center">There are no polls</Announcement>;
    }

    // In-line styling for the win! But we really need to change this.
    return (<div>
      <Announcement variant="h4" align="center">
        View Polls
      </Announcement>
      <div style={{padding: 20}}>
        <Grid container className="poll-list" spacing={16}>
          { polls }
        </Grid>
      </div>
      <Dialog
          open={this.state.dialogOpen}
          onClose={this.handleDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Delete Poll?"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this poll?
              This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleDialogClose} color="primary">
              CANCEL
            </Button>
            <Button onClick={this.deletePoll} color="primary" autoFocus>
              DELETE
            </Button>
          </DialogActions>
        </Dialog>
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
    </div>);
  }
};

ViewPolls.propTypes = {
  polls: PropTypes.arrayOf(PropTypes.object)
}

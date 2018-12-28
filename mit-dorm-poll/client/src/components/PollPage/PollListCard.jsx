import React, { Component } from 'react';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import AssessmentIcon from '@material-ui/icons/Assessment';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import {BrowserRouter as Router, Route, Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import styled from "styled-components";

let TimeDiv = styled.div`
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    margin-top: 1rem;
    margin-bottom: 1rem;
`;

let EditButtonDiv = styled.div`
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
`;

let TimeTextField = styled(TextField)`
    && {
        width: 50%;
        padding-left: 1rem;
        padding-right: 1rem;
    }
`;

export default class PollListCard extends Component {
  constructor(props) {
    super(props);
    let pollTitle = <Typography variant="h5" component="h2">
                      {this.props.pollName}
                    </Typography>;
    let time = <Typography component="p">
                  Starts: {this.props.startTime}
                  <br />
                  Ends: {this.props.endTime}
                </Typography>;

    this.state = {
      data: {},
      pollTitle: pollTitle,
      time: time,
      edit: false,
      startTime: this.props.originalStartTime,
      endTime: this.props.originalEndTime,
      pollName: this.props.pollName,
      startTimeFormatted: this.props.startTime,
      endTimeFormatted: this.props.endTime,
      pollEditingSuccess: false,
    }

    this.setState = this.setState.bind(this);
    this.saveChanges = this.saveChanges.bind(this);
    this.cancelChanges = this.cancelChanges.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
  }

  /**
   * Handles the change of state 'name'
   */
  handleChange = name => event => {
      this.setState({
        [name]: event.target.value,
      });
  };

  saveChanges() {
    const bodyContent = { pollName: this.state.pollName,  startTime: this.state.startTime, endTime: this.state.endTime };
    axios.put(`/api/polls/${this.props.pollId}`, bodyContent)
    .then(res => {
      this.setState({
        startTimeFormatted: res.data['startTime'],
        endTimeFormatted: res.data['endTime'],
        pollEditingSuccess: true
      });
      this.props.displaySnackBar("Poll successfully updated!");
    })
    .catch(err => {
      this.props.displaySnackBar(err.response.data.error);
      this.setState({
        pollEditingSuccess: false
      })
    })
    .then(res => {
      if (this.state.pollEditingSuccess) {
        let pollTitle = <Typography variant="h5" component="h2">
                          {this.state.pollName}
                        </Typography>;
        let time = <Typography component="p">
                      Starts: {this.state.startTimeFormatted}
                      <br />
                      Ends: {this.state.endTimeFormatted}
                    </Typography>;
        this.setState({
          pollTitle: pollTitle,
          time: time,
          edit: false
        });
        this.props.refresh();
      }
    });
  }

  // Handles clicking on the delete button.
  handleDeleteClick() {
    this.props.handleDeleteClick(this.props.pollId);
  }

  // Handles clicking on edit button
  handleEditClick() {
    let pollTitle =
      <TextField
        id="poll-name"
        defaultValue={this.state.pollName}
        inputProps={{
            style: { textAlign: "center", fontSize: '1rem' }
        }}
        onChange={this.handleChange('pollName')}
        margin="normal"
        />;
    let time =
      <TimeDiv>
          <TimeTextField
              id="start-time"
              label="Start Time"
              type="datetime-local"
              defaultValue={this.state.startTime.substring(0, 16)}
              onChange={this.handleChange('startTime')}
              InputLabelProps={{
              shrink: true,
              }}
          />

          <TimeTextField
              id="end-time"
              label="End Time"
              type="datetime-local"
              defaultValue={this.state.endTime.substring(0, 16)}
              onChange={this.handleChange('endTime')}
              InputLabelProps={{
              shrink: true,
              }}
          />
      </TimeDiv>;

    this.setState({
      pollTitle: pollTitle,
      time: time,
      edit: true
    });
  }

  cancelChanges(){
    let pollTitle = <Typography variant="h5" component="h2">
                      {this.state.pollName}
                    </Typography>;
    let time = <Typography component="p">
                  Starts: {this.state.startTimeFormatted}
                  <br />
                  Ends: {this.state.endTimeFormatted}
                </Typography>;
    this.setState({
      pollTitle: pollTitle,
      time: time,
      edit: false
    });
    this.props.refresh();
  }

  render(){
    let link = '/poll/view/' + this.props.pollId.toString();
    let results = '/poll/results/' + this.props.pollId.toString();

    let ResultButton = this.props.adminStatus ?
        <IconButton component={Link} to={results}>
          <AssessmentIcon aria-label="Results"/>
        </IconButton>
        :
        '';

    let EditButton = this.props.adminStatus ?
        <IconButton onClick={this.handleEditClick}>
          <EditIcon aria-label="Edit"/>
        </IconButton>
        :
        '';

    let DeleteButton = this.props.adminStatus ?
        <IconButton onClick={this.handleDeleteClick}>
          <DeleteIcon/>
        </IconButton>
        :
        '';

    let VoteButton = (this.props.isOpen) ?
      <Button size="small" variant="outlined" component={Link} to={link} color="primary">
        <Typography variant="button" color="primary">
          Vote Now!
        </Typography>
      </Button>
      :
      <Button disableRipple disableFocusRipple size="small"  color="secondary">
        <Typography variant="button" color="error">
          CLOSED!
        </Typography>
      </Button>;

    let SaveButton = (this.state.edit) ?
      <Button size="small" variant="outlined" onClick={this.saveChanges} color="primary">
          <Typography variant="button" color="primary">
            Save Changes
          </Typography>
      </Button>
      :
      '';
    
      let CancelButton = (this.state.edit) ?
        <Button size="small" variant="outlined" onClick={this.cancelChanges} color="primary">
          <Typography variant="button" color="primary">
            Cancel
          </Typography>
        </Button>
        :
        '';

    return (
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              {this.state.pollTitle}
              {this.state.time}
              <EditButtonDiv>
                {SaveButton}
                {CancelButton}
              </EditButtonDiv>
            </CardContent>
            <CardActions>
              {VoteButton}
              <div style={{flex:1}}/>
              {ResultButton}
              {EditButton}
              {DeleteButton}
            </CardActions>
          </Card>
        </Grid>
  )}
};

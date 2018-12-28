import React, { Component } from 'react';
import '../../App.css';
import axios from "axios";
import ViewPolls from './ViewPolls';
import MainDiv from '../styled/MainDiv.jsx';
import * as qs from 'query-string';

export default class PollPage extends Component {

  constructor(props) {
    super(props);

    this.state = {
      polls: [],
      authToken: '',
      success: qs.parse(this.props.location.search)['success']
    };
    this.updatePolls = this.updatePolls.bind(this);
  }

   componentWillMount() {
     this.updatePolls();
   }


  updatePolls() {
    axios.get("/api/polls")
    .then(response => {
      this.setState({polls: response.data.polls});
    });
  }

  render(){
    return (
      <MainDiv>
          <ViewPolls success={this.state.success} polls={this.state.polls} refresh={this.updatePolls} adminStatus={this.props.adminStatus} />
      </MainDiv>);
  }
}

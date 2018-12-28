import React, { Component } from 'react';
import styled from "styled-components";
import Announcement from '../styled/Announcement.jsx';
import PollQuestion from './PollQuestion.jsx';
import * as oidc from '../../OidcConstants';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';

const MainDiv = styled.div`
  display: flex;
  padding-top: 5rem;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
`;

const StyledPaper = styled(Paper)`
  && {
    padding: 3em;
    margin-left: 5vw;
    margin-right: 5vw;

    display: flex;
    flex-flow: column wrap;
  }
  `

export default class PollListItem extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value:'',
      pollData: {},
      choices: {},
      snackBarOpen: false,
      message: ''
    };


    this.createPolls = this.createPolls.bind(this);
    this.handleChoiceChange = this.handleChoiceChange.bind(this);
    this.handleWriteInChange = this.handleWriteInChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    let url = this.props.match.url;
    let pollId = url.substring(url.indexOf("/", 9)+1);
    let data;
    
    axios.get(`/api/polls/${pollId}`)
      .then(res => {
        data = res.data.poll;
        if (data)
          this.setState({pollData: data});
        else
          window.location = `${oidc.base_url}/error/404`;
      });
    axios.get(`/api/responses/${pollId}`)
      .then(res => {
        data = res.data;
        this.setState({resData: data});
        this.setState((prevState) => {
          data.forEach(x => {
            prevState.choices[x.questionId] = x.answerText;
          });
          return prevState;
        });
    })
  }

  handleChoiceChange(event) {
    const name = event.currentTarget.name;
    const value = event.currentTarget.value;
    this.setState((prevState) => {
      prevState.choices[name] = value;
      return prevState;
    });
  }

  /**
   * Handles the change of state 'name'
   */
  handleWriteInChange = questionId => event => {
    const value = event.currentTarget.value;
    this.setState((prevState) => {
      prevState.choices[questionId] = value;
      return prevState;
    });
  };

  /** Handles the click of the submit button. */
  handleClick() {
    const choices = this.state.choices;
    axios.post("/api/responses", choices)
    .then(response => {
      this.setState({ message: response.data,
                      snackBarOpen: true });
      window.location = `${oidc.base_url}/poll?success=${response.data === 'Success! Your response has been updated!' ? 'update':'vote'}`;
    })
    .catch(err => {
      this.setState({ message: err.response.data.error,
                      snackBarOpen: true });
    });
  }

  /** Handles the closing of the snackbar. */
  handleClose(event, reason) {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ snackBarOpen: false });
  };

  /**
   * This renders ONE poll represented by data
   * @param {*} data [{questionText, choices: [{choiceId, choiceText}]}]
   * @param {*} responseData [{answerId, responseId, questionId, answerText}]
   */
  createPolls(data, responseData) {
    let finalPoll = [];

    if (!data.data || !responseData) {
      return;
    }

    for (let i = 0; i< data.data.length; i++){
      let propData = data.data[i];
      let answer = '';
      let response = responseData.filter((x) => {
        return x.questionId === propData.questionId
      });
      if (propData.questionType === 'multiplechoice') {
        if (response.length) {
          let answers = propData.choices.filter((x) => {
            return x.choiceText === response[0].answerText
          })
          if (answers.length) {
            answer = answers[0].choiceId.toString()
            if (this.state.choices[propData.questionId] === response[0].answerText) {
              this.setState((prevState) => {
                prevState.choices[propData.questionId] = answer;
                return prevState;
              });
            }
          }
        }
      } else {
        if (response.length) {
          answer = response[0].answerText
        }
      }
      let question = <PollQuestion responseData={answer} questionData={propData} key={i} parentKey={i} handleChoiceChange={this.handleChoiceChange} handleWriteInChange={this.handleWriteInChange} />

      finalPoll.push(question)
    }
    let output = <FormControl component="fieldset">{finalPoll}</FormControl>;
    return output;
  }

  render() {
    return (
      <MainDiv>
        <StyledPaper className="poll-list-item component">
            <Announcement variant="h5" align="center">{this.state.pollData.pollName}</Announcement>
            {this.createPolls(this.state.pollData, this.state.resData)}
            <Button variant='contained' color='primary' fullWidth={false} onClick={this.handleClick}>Submit</Button>
        </StyledPaper>
        <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
            open={this.state.snackBarOpen}
            autoHideDuration={6000}
            onClose={this.handleClose}
            ContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{this.state.message}</span>}
            action={[
              <IconButton
                key="close"
                aria-label="Close"
                color="inherit"
                onClick={this.handleClose}
              >
                <CloseIcon />
              </IconButton>,
            ]}
          />
      </MainDiv>
    );
  }
};

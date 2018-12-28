import React, { Component } from 'react';
import styled from "styled-components";
import CreatedPollQuestion from './CreatedPollQuestion.jsx';
import axios from 'axios';

import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';
import * as oidc from '../../OidcConstants';

let OuterPaper = styled(Paper)`
&& {
    margin-left: 10vw;
    margin-right: 10vw;
    margin-top: 1rem;
    padding: 2rem;
    display: flex;
    flex-flow: column wrap;
    align-items: center;
}`;

let InnerPaper = styled(Paper)`
&& {
    width: 80%;
    margin-top: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    display: flex;
    flex-flow: column wrap;
    align-items: center;
}`;

let QuestionDiv = styled.div`
    margin: 0rem 2rem 2rem 2rem;
    display: flex;
    flex-flow: column wrap;
    align-tiems: flext-start;
`

let TimeDiv = styled.div`
    display: flex;
    flex-flow: row wrap;
    justify-content: center;
    margin-top: 1rem;
    margin-bottom: 1rem;
`;

let TimeTextField = styled(TextField)`
    && {
        width: 50%;
        padding-left: 1rem;
        padding-right: 1rem;
    }
`;

export default class CreatePollWindow extends Component {
    constructor(props) {
      super(props);

      this.state = {
        keys: [],
        questions: [],
        questionsData: [], //Contains the data of all the questions in this poll
        startTime: "",
        endTime: "",
        pollName:'',
        questionKey: 0,
        snackBarOpen: false,
        snackBarMessage: ''
      };

      this.setState = this.setState.bind(this);
      this.addQuestion = this.addQuestion.bind(this);
      this.deleteQuestion = this.deleteQuestion.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleClose = this.handleClose.bind(this);
    }

    /**
     * Adds a question to the Poll Window
     *
     * Modifies State:
     *  keys
     *  questions
     *  questionsData
     *  questionKey
    */
    addQuestion(){
        let createdQuestion = <CreatedPollQuestion
                                deleteSelf={this.deleteQuestion}
                                sendQuestionData={this.setQuestionData.bind(this)}
                                key={this.state.questionKey}
                                myKey={this.state.questionKey}
                                questionNum={this.state.questions.length}/>

        let newQuestionData = {questionText: 'Untitled Question', questionType: 'multiplechoice', choices: []};
        let joined = this.state.questions.concat(createdQuestion);
        let joinedData = this.state.questionsData.concat(newQuestionData);
        let joinedKey = this.state.keys.concat(this.state.questionKey);
        let newKey = this.state.questionKey +1;

        this.setState({
            keys: joinedKey,
            questions: joined,
            questionsData: joinedData,
            questionKey: newKey,
        });
    }

    /**
     * Deletes a qeustion from this component
     * @param {int} childKey - The unique key of the question to be deleted
     *
     * Modifies State:
     *  keys
     *  questions
     *  questionsData
     */
    deleteQuestion(childKey){
        let indexOfChild = this.state.keys.indexOf(childKey);
        //Assumes the index of thedata is the same as the object itself
        let keysCopy = this.state.keys.slice();
        let questionsCopy = this.state.questions.slice();
        let questionsDataCopy = this.state.questionsData.slice();

        let removedKey = keysCopy.splice(indexOfChild,1);
        let removedQuestion = questionsCopy.splice(indexOfChild,1);
        let removedQuestionData = questionsDataCopy.splice(indexOfChild, 1);

        this.setState({
            keys: keysCopy,
            questions: questionsCopy,
            questionsData: questionsDataCopy,
        });
    }

    /**
     * Sets the data from just one question
     * @param {int} questionNum - the index of the question in the state arrays
     * @param {Object} questionData - the data to set at that index in the data array
     *
     * Modifies State:
     *  questionsData
     */
    setQuestionData(questionNum, questionData){
        let tempQuestionsData = this.state.questionsData;
        tempQuestionsData[questionNum] = questionData;
        this.setState({
            questionsData: tempQuestionsData
        });
    }

    /**
     * Parses Question Data into a string
     * @param {Object} questionData - The data being parsed
     * @returns {String} - A string representing the question data
     */
    parseQuestionData(questionData){
        let outputString = ""
        for (let i=0; i< questionData.length; i++){

            outputString += questionData[i].questionText.concat("\n");

            for (let j=0; j<questionData[i].choices.length; j++){
                outputString += "  ".concat(questionData[i].choices[j].choiceText).concat("\n");
            }
            outputString += "\n";
        }
        return outputString;
    }

    /**
     * Handles the change of state 'name'
     */
    handleChange = name => event => {
        this.setState({
          [name]: event.target.value,
        });
    };

    /**
     * Handles the click of the submit button.
     */
    handleSubmit() {
        const pollData = {startTime: this.state.startTime, endTime: this.state.endTime, questionsData: this.state.questionsData, pollName: this.state.pollName};
        axios.post("/api/polls", pollData)
        .then(response => {
            this.setState({
                snackBarMessage: "Success! Poll Created!",
                snackBarOpen: true
            });
            window.location = `${oidc.base_url}/poll?success=create`;
        })
        .catch(err => {
            this.setState({
                snackBarMessage: err.response.data.error,
                snackBarOpen: true
            });
        });
    }

    /**
     * Handles the closing of the snackbar.
     * @param event - the event triggering this handle
     * @param reason - the reason for this handle
     *
     * Modifies State:
     *  snackBarOpen
    */
    handleClose(event, reason) {
        if (reason === 'clickaway') {
          return;
        }

        this.setState({ snackBarOpen: false });
      };

    render(){
        return(
            <div>
                <OuterPaper>
                    <InnerPaper>
                    <QuestionDiv>
                        <TextField
                                id="poll-name"
                                placeholder="Poll Name"
                                inputProps={{
                                    style: { textAlign: "center", fontSize: '2rem'}
                                }}
                                onChange={this.handleChange('pollName')}
                                margin="normal"
                        />
                        <TimeDiv>
                            <TimeTextField
                                id="start-time"
                                label="Start Time"
                                type="datetime-local"
                                value={this.state.startTime}
                                onChange={this.handleChange('startTime')}
                                InputLabelProps={{
                                shrink: true,
                                }}
                            />

                            <TimeTextField
                                id="end-time"
                                label="End Time"
                                type="datetime-local"
                                value={this.state.endTime}
                                onChange={this.handleChange('endTime')}
                                InputLabelProps={{
                                shrink: true,
                                }}
                            />

                        </TimeDiv>

                    {this.state.questions}
                    </QuestionDiv>

                        <Button variant='contained' color='primary' onClick={this.addQuestion}>Add Question</Button>
                    </InnerPaper>
                    <Button variant='contained' color='primary' onClick={this.handleSubmit}>Submit</Button>
                    {/* This is for testing only. */}
                    {/* <Typography style={{display:'inline-block'}}>{this.parseQuestionData(this.state.questionsData)}</Typography> */}
                </OuterPaper>
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
                    message={<span id="message-id">{this.state.snackBarMessage}</span>}
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
            </div>
        )

    }
};

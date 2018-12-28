import React, { Component } from 'react';
import styled from "styled-components";
import CreatedRadioOption from './CreatedRadioOption.jsx';
import CreatedWriteIn from './CreatedWriteIn.jsx';

import TextField from '@material-ui/core/TextField';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

let StyledFormControl = styled(FormControl)`
    && {
    margin-top: 1rem;
    margin-bottom: 1rem;
    }`;

let QuestionTextDiv = styled.div`
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
    align-items: center;
    `

export default class CreatedPollQuestion extends Component {

    constructor(props) {
        super(props);

        this.state = {
          keys: [],
          options: [],
          optionsData: [],
          questionText:'Untitled Question',
          questionType: 'multiplechoice',
          optionKey: 0,
        };

        this.setState = this.setState.bind(this);
        this.addOptions = this.addOptions.bind(this);
        this.deleteOption = this.deleteOption.bind(this);
    }

    /**
     * Handles the change of state 'name'
     */
    handleChange = name => event => {

        this.setState({
            [name]: event.target.value,
        });

        let newQuestionText = this.state.questionText;
        let newQuestionType = this.state.questionType;

        if (name === "questionText"){
            newQuestionText = event.target.value;
        }else if (name === "questionType"){
            newQuestionType = event.target.value;
            this.clearQuestion();
        }

        this.props.sendQuestionData(this.props.questionNum,
            {questionText: newQuestionText,
                questionType: newQuestionType,
                choices: this.state.optionsData});
    };

    clearQuestion(){
        this.setState({
            keys: [],
            options: [],
            optionsData: [],
            optionKey: 0,
        });
    }

      
    /** 
     * Adds an Option to this question
     * 
     * Modifies State:
     *  keys
     *  options
     *  optionsData
     *  optionKey
    */  
    addOptions(){
        let childKey = this.state.optionkey;

        let createdOption = '';
        let newOptiondata = {choiceText: 'N/A'};

        if (this.state.questionType === "multiplechoice"){
            
            createdOption = <CreatedRadioOption 
                                deleteSelf={this.deleteOption} 
                                sendOptionData={this.setOptionData.bind(this)} 
                                myKey={this.state.optionKey} 
                                key={this.state.optionKey} 
                                optionNum={this.state.options.length}/>

            newOptiondata = {choiceText:'Untitled Option'}

        }else if (this.state.questionType === "writein"){
            
            createdOption = <CreatedWriteIn
                                sendOptionData={this.setOptionData.bind(this)}
                                myKey={this.state.optionKey}
                                key={this.state.optionKey}
                                optionNum={this.state.options.length}/>
            
            newOptiondata = {choiceText: 'N/A'};
        }

        let joined = this.state.options.concat(createdOption);
        let joinedData = this.state.optionsData.concat(newOptiondata);
        let joinedKey = this.state.keys.concat(this.state.optionKey);
        let newKey = this.state.optionKey + 1;


        this.setState({
            keys: joinedKey,
            options: joined,
            optionsData: joinedData,
            optionKey: newKey,
        });

        this.props.sendQuestionData(this.props.questionNum,
        {questionText: this.state.questionText,
            questionType: this.state.questionType,
            choices: joinedData});
    }

    /**
     * Deletes a qeustion from this component
     * @param {int} childKey - The unique key of the question to be deleted 
     * 
     * Modifies State:
     *  keys
     *  options
     *  optionsData
     */    
    deleteOption(childKey){
        let indexOfChild = this.state.keys.indexOf(childKey);
        //Assumes the index of thedata is the same as the object itself
        let keysCopy = this.state.keys.slice();
        let optionsCopy = this.state.options.slice();
        let optionsDataCopy = this.state.optionsData.slice();

        let removedKey = keysCopy.splice(indexOfChild,1);
        let removedOption = optionsCopy.splice(indexOfChild,1);
        let removedOptionData = optionsDataCopy.splice(indexOfChild, 1);

        this.setState({
            keys: keysCopy,
            options: optionsCopy,
            optionsData: optionsDataCopy,
        });

        this.props.sendQuestionData(this.props.questionNum,
        {questionText: this.state.questionText,
            questionType: this.state.questionType,
            choices: optionsDataCopy});
    }


    /**
     * Sets the data from just one question
     * @param {int} optionNum - the index of the question in the state arrays
     * @param {Object} optionData - the data to set at that index in the data array
     * 
     * Modifies State:
     *  optionsData
     */    
    setOptionData(optionNum, optionData){
        let tempOptions = this.state.optionsData;
        tempOptions[optionNum] = optionData;

        this.setState({
            optionsData: tempOptions
        });

        this.props.sendQuestionData(this.props.questionNum,
        {questionText: this.state.questionText,
            questionType: this.state.questionType,
            choices: tempOptions});
    }



    render(){
        let options = '';
        if (this.state.questionType === 'multiplechoice'){
            options = <RadioGroup>
                        {this.state.options}
                      </RadioGroup>
        }else if (this.state.questionType === 'writein'){
            options = this.state.options;
        }

        let addOptionButton = '';
        if (this.state.questionType === 'multiplechoice'){
            addOptionButton = <Button variant='contained' color='primary' onClick={this.addOptions}>Add Option</Button>;
        }else if (this.state.questionType === 'writein'){
            if (this.state.options.length < 1){
                addOptionButton = <Button variant='contained' color='primary' onClick={this.addOptions}>Add Option</Button>;
            }else{
                addOptionButton = '';
            }
            
        }


        return(
            <StyledFormControl>
                
                <QuestionTextDiv>
                    <TextField
                        id="question-text"
                        placeholder={this.state.questionText}
                        onChange={this.handleChange('questionText')}
                        multiline={true}
                        inputProps={{
                            style: { fontweight: "bold", fontSize: '1rem' }
                        }}
                        style={{flex: 1}}
                        margin="normal"
                    />

                    <FormControl>
                        <Select
                            value={this.state.questionType}
                            onChange={this.handleChange('questionType')}
                            inputProps={{
                                name: 'question type',
                                id: 'question-type',
                            }}
                        >
                            <MenuItem value="multiplechoice">Multiple Choice</MenuItem>
                            <MenuItem value="writein">Short Answer</MenuItem>
                        </Select>
                    </FormControl>

                    <IconButton color='primary' onClick={() => this.props.deleteSelf(this.props.myKey)}>
                        <DeleteIcon/>
                    </IconButton>
                </QuestionTextDiv>

                {options}

                {addOptionButton}

            </StyledFormControl>
        )

    }
}

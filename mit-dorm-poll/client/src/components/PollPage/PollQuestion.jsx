import React, { Component } from 'react';

import FormLabel from '@material-ui/core/FormLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import TextField from '@material-ui/core/TextField';


export default class PollQuestion extends Component {

    constructor(props){
        super(props);
        this.state = {
            value: '',
        };
    }

    componentDidMount() {
      this.setState({value: this.props.responseData});
    }

    handleChange = event => {
        this.setState({value: event.target.value});
    };

    createWriteInQuestion(data) {
        const questionTitle = <FormLabel key={this.props.parentKey*10 + this.props.parentKey}>{data.questionText}</FormLabel>
        const questionText =  <TextField
                                  id={this.props.questionData.questionId}
                                  defaultValue={this.props.responseData}
                                  multiline={true}
                                  placeholder="Type Response Here"
                                  margin="normal"
                                  rowsMax={4}
                                  fullWidth
                                  onChange={this.props.handleWriteInChange(this.props.questionData.questionId)}
                              />
        return <div>{questionTitle} {questionText}</div>
    }

    createRadioQuestion(data, response){
        // How should I key this bad boi?
        let question = <FormLabel key={this.props.parentKey*10 + this.props.parentKey}>{data.questionText}</FormLabel>

        let radioOptions = [];
        radioOptions.push(question);
        for (let i = 0; i < data.choices.length; i++){
            let choiceId = data.choices[i].choiceId;
            let choiceText = data.choices[i].choiceText;
            radioOptions.push(<FormControlLabel color='seconday' key={choiceId} value={choiceId.toString()} control={<Radio />} label={choiceText} onChange={this.props.handleChoiceChange} />)
        }
        let radioGroup = <RadioGroup name={data.questionId} value={this.state.value} onChange={this.handleChange}>{radioOptions}</RadioGroup>
        return radioGroup
    }

    render(){
        let questionObject = (this.props.questionData.questionType === 'multiplechoice') ?
            <div>{this.createRadioQuestion(this.props.questionData)}</div>
            :
            this.createWriteInQuestion(this.props.questionData);

        return(questionObject);
    }

};

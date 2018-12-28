import React, { Component } from 'react';

import TextField from '@material-ui/core/TextField';

export default class CreatedRadioOption extends Component {

    constructor(props) {
        super(props);

        this.state = {
          optionText:'Short Answer',
        };

        this.props.sendOptionData(this.props.optionNum,{choiceText: 'N/A'});
    }

    render(){
        return(
            <div>
                <TextField
                    disabled
                    id="short-answer-box"
                    multiline
                    rowsMax="4"
                    defaultValue="Short answer text"
                    margin="normal"
                />
            </div>
        )
    }

    };
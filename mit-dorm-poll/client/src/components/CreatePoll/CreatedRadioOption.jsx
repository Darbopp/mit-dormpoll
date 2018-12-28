import React, { Component } from 'react';

import ClearIcon from '@material-ui/icons/Clear';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';

export default class CreatedRadioOption extends Component {

    constructor(props) {
        super(props);

        this.state = {
          optionText:'Untitled Option',
        };
    }

    /**
     * Handles the change of state 'name'
     */
    handleChange = name => event => {
        this.setState({
          [name]: event.target.value,
        });
        this.props.sendOptionData(this.props.optionNum,{choiceText: event.target.value});
    };

    render(){
        return(
            <div>
                <FormControlLabel label={
                    <div>
                    <TextField
                        id="option-text"
                        placeholder={this.state.optionText}
                        onChange={this.handleChange('optionText')}
                        multiline={true}
                        margin="normal"
                    />
                    </div>
                }
                control={
                    <Radio disabled={true}/>
                }>

                </FormControlLabel>

                <IconButton color='primary' onClick={() => this.props.deleteSelf(this.props.myKey)}>
                    <ClearIcon/>
                </IconButton>
             </div>
        )
    }

    };

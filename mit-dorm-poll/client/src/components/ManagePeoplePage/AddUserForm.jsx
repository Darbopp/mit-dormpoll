import React, { Component } from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';

let OuterPaper = styled(Paper)`
&& {
    margin-left: 5rem;
    margin-right: 5rem;
    margin-top: 1rem;
    padding: 2rem;
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    width: fit-content;
}`;

const UserForm = styled(FormControl)`
  && {
    display: flex;
    flex-direction: row;
    text-align: left;
    border-radius: 3px;
    align-items: center;
  }
`;

export default class AddUserForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
          userKerberos: "",
        };

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange = name => event => {
      this.setState({
        [name]: event.target.value,
      });
    };

    render(){
        return(
          <OuterPaper>
            <h3>Add User</h3>
            <UserForm>
                <TextField
                  id="outlined-kerberos"
                  label="Kerberos"
                  value={this.state.userKerberos}
                  onChange={this.handleChange('userKerberos')}
                  margin="normal"
                />
              <div>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => {
                      this.setState({userKerberos: ''});
                      this.props.addUser(this.state.userKerberos);
                    }
                  }>
                  Add User
                </Button>
              </div>
            </UserForm>
          </OuterPaper>
        )
    }

    };

import React, { Component } from 'react';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';

let OuterPaper = styled(Paper)`
&& {
    margin-top: 1rem;
    padding: 2rem;
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    width: fit-content;
}`;

const AdminForm = styled(FormControl)`
  && {
    display: flex;
    flex-direction: row;
    text-align: left;
    border-radius: 3px;
    align-items: center;
  }
`;

export default class AddAdminForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
          adminKerberos: "",
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
            <h3>Add Admin</h3>
            <AdminForm>
                <TextField
                  id="outlined-kerberos"
                  label="Kerberos"
                  value={this.state.adminKerberos}
                  onChange={this.handleChange('adminKerberos')}
                  margin="normal"
                />
              <div>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={() => {
                      this.setState({adminKerberos: ''});
                      this.props.addAdmin(this.state.adminKerberos);
                    }
                  }>
                  Add Admin
                </Button>
              </div>
            </AdminForm>
          </OuterPaper>
        )
    }

    };

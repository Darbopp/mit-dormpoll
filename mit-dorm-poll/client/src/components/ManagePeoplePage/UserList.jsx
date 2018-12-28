import React, { Component } from 'react';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const StyledList = styled(List)`
  && {
    width: fit-content;
  }
`

let OuterPaper = styled(Paper)`
&& {
    margin-top: 1rem;
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    width: fit-content;
    max-height: 40vh;
    overflow: auto;
}`;

export default class UserList extends Component {

    constructor(props) {
        super(props);
        this.generate = this.generate.bind(this);
    }

    generate() {
      //{userid,kerberos}
      return this.props.users.map(value =>
        <ListItem key={value.userId}>
          <ListItemText
            primary={value.kerberos}
          />
        <IconButton onClick={() => this.props.deleteUser(value.userId)}>
          <DeleteIcon />
        </IconButton>
        </ListItem>
      );
    }

    render(){
        return(
            <OuterPaper>
                <StyledList>
                    {this.generate()}
                </StyledList>
            </OuterPaper>
        )
    }

    };
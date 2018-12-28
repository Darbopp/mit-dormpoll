import React, { Component } from 'react';
import '../App.css';
import styled from "styled-components";
import axios from 'axios';
import Announcement from './styled/Announcement.jsx'; // Inherets for Mui Typography
import MainDiv from './styled/MainDiv.jsx';

import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import ReactExport from "react-data-export";
import * as oidc from "../OidcConstants";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

let OuterPaper = styled(Paper)`
&& {
    margin: auto;
    padding: 2rem;
    display: flex;
    flex-flow: column wrap;
    align-items: center;
    width: 90%;
}`;

let StyledDiv = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-tiems: flex-start;
  width: 90%;
  padding-top: 10vh;
`;

let StyledPaper = styled(Paper)`
&& {
    width: 85%;
    height: 50vh;
    padding: 2rem;
    overflow: auto;
}`;

export default class HomePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      pollData: [],
      pollSheet:[{columns: [], data: []}]
    };
    this.displayResults = this.displayResults.bind(this);
  }

  componentDidMount() {
    let url = this.props.match.url;
    let pollId = url.substring(url.indexOf("/", 9)+1);
    let data;
    axios.get(`/api/responses/${pollId}/results`)
      .then(res => {
        data = res.data;
        if (data.length)
          this.setState({pollData: data});
        else
          window.location = `${oidc.base_url}/error/404`;
      });
    axios.get(`/api/responses/${pollId}/sheet`)
      .then(res => {
        data = res.data;
        this.setState({pollSheet: [data]});
      });
  }

  makeListItems(choices){
    let output = []
    for (let i = 0; i < choices.length; i++){
      let choice = choices[i];
      let choiceText = choice['choice'];
      let choiceNumVotes = choice['count'];
      let text = choiceText.toString().concat(": ").concat(choiceNumVotes.toString());

      let listItem = <ListItem key={i}>
                        <ListItemText
                          primary={text}/>
                     </ListItem>
      output.push(listItem);
    }
    return(output);
  }

  displayResults(data) {
    let finalResult = [];

    for (let i = 0; i < data.length; i++){

      let propData = data[i];
      let questionText = propData['question'];
      let resultDisplay = [];
      resultDisplay.push(<Announcement variant="h5">{questionText}</Announcement>);

      let listItems = this.makeListItems(propData['response']);
      let listResult = <List dense={false}>{listItems}</List>
      resultDisplay.push(listResult);

      finalResult.push(resultDisplay);
    }
    let output = finalResult;
    return output;
  }

  render(){
    return (
      <MainDiv>
        <Announcement variant="h4" align="center">
          Results
        </Announcement>
        <OuterPaper>
          <StyledPaper>
            <Table>
              <TableHead>
                <TableRow>
                  {this.state.pollSheet[0].columns.map(x => <TableCell>{x}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {this.state.pollSheet[0].data.map((row, idx) => {
                  return (
                    <TableRow key={idx}>
                      {row.map(x => <TableCell>{x}</TableCell>)}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </StyledPaper>
          <StyledDiv>
            {this.displayResults(this.state.pollData)}
          </StyledDiv>
          <ExcelFile filename={'Results'} element={<Button variant='contained' color='primary' fullWidth={false}>Download Results</Button>}>
            <ExcelSheet dataSet={this.state.pollSheet} name="Organization"/>
          </ExcelFile>
        </OuterPaper>

      </MainDiv>);
  }
}

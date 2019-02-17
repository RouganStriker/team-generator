import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import Chip from '@material-ui/core/Chip';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { createBrowserHistory } from 'history';
import utf8 from 'utf8';

// eslint-disable-next-line
import seedrandom from 'seedrandom';

import './App.css';
import nameGen from './randomName';


const styles = theme => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
});
const history = createBrowserHistory();


class TeamGenerator extends Component {
  constructor(props) {
    super(props);

    const { location } = props;
    const parsedParams = this.parseURLParam(location);
    let numGroups = 2;
    let nameList = [];
    let randomizedGroups = [];

    // Prepare random seed.
    // Use URL specified seed if available.
    if (parsedParams.seed) {
      this.prepareRandomSeed(this.decodeSeed(parsedParams.seed));
    }

    // Parse default number of groups
    if (parsedParams.numGroups != null) {
      const parsedNumGroups = parseInt(parsedParams.numGroups);
      numGroups = parsedNumGroups && parsedNumGroups > numGroups ? parsedNumGroups : numGroups;
    }

    // Parse default list of members
    if (parsedParams.members) {
      const memberNames = parsedParams.members.split(",");

      nameList = memberNames.map((name, index) => { return {"key": index, "label": name}; });

      if (this.seed) {
        // Randomize group if seed is set
        randomizedGroups = this.generateRandomGroups(numGroups, nameList);
      }
    }

    this.state = {
      numGroups: numGroups,
      nameList: nameList,
      newMember: '',
      randomizedGroups: randomizedGroups,
    };
  };

  parseURLParam = (location) => {
    const queryParams = location.search.split("?", 2)[1];

    if (!queryParams) {
      return {};
    }

    return queryParams.split("&").reduce((acc, param) => {
      const [name, value] = param.split("=", 2);

      acc[name] = decodeURI(value);

      return acc;
    }, {});
  };

  decodeSeed = (seed) => {
    return atob(seed);
  };

  encodeSeed = (seed) => {
    // URL encode a seed
    return encodeURI(btoa(seed));
  };

  prepareRandomSeed(seed) {
    if (!seed) {
      // Encoding may drop some values, ensure the same seed is used.
      this.seed = utf8.encode(Math.seedrandom());
    } else {
      this.seed = seed;
    }

    Math.seedrandom(this.seed);
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  handleNewMemberKeypress = event => {
    if (event.key === 'Enter') {
      this.handleAddMember();
    }
  };

  handleAddMember = () => {
    if (!this.state.newMember.trim()) {
      return;
    }

    this.setState({
      newMember: '',
      nameList: [...this.state.nameList, {'key': this.state.nameList.length, 'label': this.state.newMember.trim()}],
    });
  };

  handleDelete = data => () => {
    this.setState(state => {
      const nameList = [...state.nameList];
      const chipToDelete = nameList.indexOf(data);

      nameList.splice(chipToDelete, 1);

      return { nameList };
    });
  };

  generateRandomGroups = (numGroups, nameList) => {
    const newRandomizedGroups = Array(numGroups).fill(null);
    const availableMembers = [...nameList];
    let counter = 0;

    while (availableMembers.length > 0) {
      // Pick a member
      const index = Math.floor((Math.random() * availableMembers.length));
      const pickedMember = availableMembers.splice(index, 1)[0];

      if (newRandomizedGroups[counter] == null) {
        newRandomizedGroups[counter] = {
          "name": nameGen(),
          "members": [],
        };
      }

      newRandomizedGroups[counter]["members"].push(pickedMember['label']);
      counter = (counter + 1) % numGroups;
    }

    return newRandomizedGroups;
  };

  handleRandomize = () => {
    // Randomize groups with a new seed
    this.prepareRandomSeed();

    const newRandomizedGroups = this.generateRandomGroups(this.state.numGroups, this.state.nameList);

    this.setState({randomizedGroups: newRandomizedGroups});

    // Update URL
    const members = encodeURI(this.state.nameList.map((memberData) => memberData.label).join(","));
    const seed = this.encodeSeed(this.seed);

    history.push(`?numGroups=${this.state.numGroups}&members=${members}&seed=${seed}`);
  };

  render() {
    const {
      nameList,
      newMember,
      numGroups,
      randomizedGroups,
    } = this.state;

    return (
      <React.Fragment>
        <div style={{margin: "50px"}}>
          <CssBaseline />
          <h1>Team Generator</h1>

          <ExpansionPanel defaultExpanded={true}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
              Settings
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <TextField
                    label="Number of groups"
                    type="number"
                    fullWidth
                    inputProps={{min: 1}}
                    value={numGroups}
                    onChange={this.handleChange('numGroups')}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Add member"
                    placeholder="Enter member name"
                    onChange={this.handleChange('newMember')}
                    value={newMember}
                    fullWidth
                    onKeyPress={this.handleNewMemberKeypress.bind(this)}
                    onBlur={this.handleAddMember.bind(this)}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  {
                    nameList.map(data => {
                      return (
                        <Chip
                          key={data.key}
                          label={data.label}
                          onDelete={this.handleDelete(data)}
                        />
                      );
                    }
                  )}
                </Grid>
              </Grid>
            </ExpansionPanelDetails>
            <ExpansionPanelActions>
              <Button size="small"
                      color="primary"
                      disabled={numGroups < 1 || nameList.length < 1}
                      onClick={this.handleRandomize.bind(this)}>
                Randomize
              </Button>
            </ExpansionPanelActions>
          </ExpansionPanel>

          <Grid container spacing={8}>
            {
              randomizedGroups.map((groupData, index) => {
                if (!groupData) {
                  return null;
                }

                return (
                  <Grid item xs={6} key={index}>
                    <Paper>
                      <List subheader={<ListSubheader style={{"backgroundColor": "white"}}>{groupData["name"]}</ListSubheader>}>
                        {
                          [...groupData["members"]].sort().map((member, index) => {
                            return <ListItem key={index} divider={true}>{member}</ListItem>;
                          })
                        }
                      </List>
                    </Paper>
                  </Grid>
                );
              })
            }
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}


class App extends Component {
  render() {
    return (
       <Router>
          <Route path="/" component={TeamGenerator} />
       </Router>
    );
  }
}

export default withStyles(styles)(App);

import React, { PureComponent } from 'react';
// import { storiesOf } from '@storybook/react';
import differenceBy from 'lodash/differenceBy';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Delete from '@material-ui/icons/Delete';
import Add from '@material-ui/icons/Add';
import memoize from 'memoize-one';
import DataTable from 'react-data-table-component';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Grid, InputLabel, makeStyles, LinearProgress } from '@material-ui/core';
import DateFnsUtils from '@date-io/date-fns';
import Select from 'react-select';
import axios from 'axios';
import { ProjectStatus, ProjectStatusList } from '../model/model'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import './MaterialTable.css';
const sortIcon = <ArrowDownward />;
const selectProps = { indeterminate: isIndeterminate => isIndeterminate };
const actions = memoize(openHandler => (
    <IconButton
        color="primary"
        onClick={openHandler}
    >
        <Add />
    </IconButton>
));
const contextActions = memoize(deleteHandler => (
    <IconButton
        color="secondary"
        onClick={deleteHandler}
    >
        <Delete />
    </IconButton>
));

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        '& > * + *': {
            marginTop: theme.spacing(2),
        },
    },
}));

const LinearIndeterminate = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <LinearProgress />
        </div>
    );
};

const columns = memoize(() => [
    {
        name: 'Id',
        selector: 'id',
        sortable: true,
        grown: 0.5
    },
    {
        name: 'Name',
        selector: 'projectName',
        wrap: true,
        sortable: true,
    },
    {
        name: 'Status',
        selector: 'status',
        sortable: true,
    },
    {
        name: 'Start Date',
        selector: 'startDate',
        sortable: true,
    },
    {
        name: 'End Date',
        selector: 'endDate',
        sortable: true,
    },
]);

const now = () => {
    return new Date().toISOString().split('T')[0];
}

export default class MaterialTable extends PureComponent {

    state = {
        selectedRows: [],
        toggleCleared: false,
        open: false,
        pending: true,
        savedProject: {
            projectName: '',
            status: ProjectStatus.OPEN,
            startDate: now(),
            endDate: now(),
            leader: undefined,
            members: []
        },
        projects: [],
        form: {
            projectName: {
                valid: true,
                message: ''
            },
            startDate: {
                valid: true,
                message: ''
            },
            endDate: {
                valid: true,
                message: ''
            }
        }

    };
    users = new Map();
    userList = [];

    constructor(props) {
        super(props);
        this.setProjectName = this.setProjectName.bind(this);
        this.saveProject = this.saveProject.bind(this);
        this.setStartDate = this.setStartDate.bind(this);
        this.setEndDate = this.setEndDate.bind(this);
        this.setLeader = this.setLeader.bind(this);
        this.addMember = this.addMember.bind(this);
        this.setStatus = this.setStatus.bind(this);
        this.validateProjectName = this.validateProjectName.bind(this);
        this.isValidProject = this.isValidProject.bind(this);
    }

    componentWillMount() {
        axios.get(process.env.REACT_APP_GET_USER_URL).then(res => {
            this.userList = res.data.map(user => {
                this.users.set(user.id, user);
                return {
                    value: user.id,
                    label: user.firstName + ' ' + user.lastName
                }
            });
        }).catch(error => console.error(error));
    }

    componentDidMount() {
        axios.get(process.env.REACT_APP_GET_PROJECT_URL).then(res => {
            this.setState({
                ...this.state, projects: res.data
            });
        }).catch(error => console.error(error)).finally(() => this.setState({ ...this.state, pending: false }));
    }

    handleChange = state => {
        this.setState({ selectedRows: state.selectedRows });
    };

    handleRowClicked = row => {
        this.setState(state => ({ ...state, savedProject: row, open: true }));
    }

    handleClickOpen = () => {
        this.setState({ ...this.state, open: true });
    };
    handleClose = () => {
        this.setState({
            ...this.state, open: false, savedProject: {
                projectName: '',
                status: ProjectStatus.OPEN,
                startDate: now(),
                endDate: now(),
                leader: undefined,
                members: []
            },
            form : {
                projectName: {
                    valid: true,
                    message: ''
                },
                startDate: {
                    valid: true,
                    message: ''
                },
                endDate: {
                    valid: true,
                    message: ''
                }
            }
        });
    };

    setProjectName = (event) => {
        this.setState({
            ...this.state,
            savedProject: {
                ...this.state.savedProject,
                projectName: event.target.value
            }
        });
    };

    validateProjectName = (event) => {
        const str = this.state.savedProject.projectName;
        if (str === null || str.length === 0) {
            this.setState(state => ({
                form: {
                    ...state.form, projectName: {
                        valid: false,
                        message: 'Project name is mandatory'
                    }
                }
            }))
        } else {
            this.setState(state => ({
                form: {
                    ...state.form, projectName: {
                        valid: true,
                        message: ''
                    }
                }
            }))
        }
    }
    setStatus = (event) => {
        this.setState({
            ...this.state,
            savedProject: {
                ...this.state.savedProject,
                status: event.value
            }
        });
    }
    getStatus = () => {
        return {
            value: this.state.savedProject.status,
            label: this.state.savedProject.status
        }
    }
    setStartDate = (value) => {
        this.setState({
            ...this.state,
            savedProject: {
                ...this.state.savedProject,
                startDate: value.toISOString().split('T')[0]
            }
        });
    };

    setEndDate = (value) => {
        this.setState({
            ...this.state,
            savedProject: {
                ...this.state.savedProject,
                endDate: value.toISOString().split('T')[0]
            }
        });
    };

    setLeader = (event) => {
        if (event != null) {
            this.setState({
                ...this.state,
                savedProject: {
                    ...this.state.savedProject,
                    leader: this.users.get(event.value)
                }
            });
        }
    };

    addMember = (event) => {
        let members = [];
        if (event != null) {
            members = event.map(e => this.users.get(e.value));

        }
        this.setState({
            ...this.state,
            savedProject: {
                ...this.state.savedProject,
                members: members
            }
        });
    }

    isValidProject = () => {
        return this.state.form.projectName.valid
            && this.state.form.startDate.valid
            && this.state.form.endDate.valid;
    }

    getLeader = () => {

        const leader = this.state.savedProject.leader;
        if (leader) {
            const user = this.users.get(leader.id);
            if (user) {
                return {
                    value: user.id,
                    label: user.firstName + ' ' + user.lastName
                }
            }
        }

    }

    getMembers = () => {
        return this.state.savedProject.members.map(user => {
            return {
                value: user.id,
                label: user.firstName + ' ' + user.lastName
            }
        })
    }
    saveProject = (event) => {
        this.validateProjectName();
        if (!this.isValidProject()) {
            return;
        }
        this.setState({ ...this.state, open: false, pending: true });

        axios.post("http://localhost:8080/api/project", this.state.savedProject)
            .then(res => {
                const data = res.data;
                const index = this.state.projects.findIndex(p => p.id === data.id);
                if (index === -1) {
                    this.setState({ ...this.state, pending: false, projects: this.state.projects.concat(res.data) });
                } else {
                    let projects = [...this.state.projects];
                    projects[index] = data;
                    this.setState({ ...this.state, pending: false, projects: projects })
                }
            })
            .catch(error => console.error(error))
            .finally(() => this.handleClose());
    };

    deleteAll = () => {
        const { selectedRows } = this.state;
        const rows = selectedRows.map(r => r.projectName);
        const ids = selectedRows.map(r => r.id);
        if (window.confirm(`Are you sure you want to delete:\r ${rows}?`)) {
            axios.delete("http://localhost:8080/api/project/remove", {
                data: ids
            }).then(res => {
                if (res.status === 200) {
                    this.setState(state => ({ toggleCleared: !state.toggleCleared, projects: differenceBy(state.projects, state.selectedRows, 'id') }));
                }
            }).catch(error => console.error(error))
        }
    }

    render() {
        const { toggleCleared } = this.state;

        return (
            <div className="table-container">
                <Card style={{ height: '100%', width: '80%' }}>
                    <DataTable
                        title="Project"
                        columns={columns()}
                        data={this.state.projects}
                        selectableRows
                        highlightOnHover
                        defaultSortField="projectName"
                        actions={actions(this.handleClickOpen)}
                        contextActions={contextActions(this.deleteAll)}
                        sortIcon={sortIcon}
                        selectableRowsComponent={Checkbox}
                        selectableRowsComponentProps={selectProps}
                        onSelectedRowsChange={this.handleChange}
                        clearSelectedRows={toggleCleared}
                        onRowClicked={this.handleRowClicked}
                        pagination
                        progressPending={this.state.pending}
                        progressComponent={<LinearIndeterminate />}
                    />
                </Card>
                <Dialog fullWidth={true} maxWidth='sm' open={this.state.open} onClose={this.handleClose} aria-labelledby="form-dialog-title">
                    <DialogTitle id="form-dialog-title">Subscribe</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} direction="column">
                            <Grid item xs>
                                <TextField
                                    margin="dense"
                                    id="project-name"
                                    label="Project name"
                                    value={this.state.savedProject.projectName}
                                    onChange={this.setProjectName}
                                    onBlur={this.validateProjectName}
                                    fullWidth
                                    required
                                    helperText={this.state.form.projectName.message}
                                    error={!this.state.form.projectName.valid}
                                />
                            </Grid>
                            <Grid item container direction="row" justify="space-between">
                                <Grid item xs>
                                    <InputLabel id="status">Status</InputLabel>
                                    <Select
                                        className="basic-single"
                                        classNamePrefix="select"
                                        defaultValue={ProjectStatusList[0]}
                                        isClearable={false}
                                        isSearchable={true}
                                        value={this.getStatus()}
                                        onChange={this.setStatus}
                                        name="status"
                                        options={ProjectStatusList}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <InputLabel id="leader">Leader</InputLabel>
                                    <Select
                                        className="basic-single"
                                        classNamePrefix="select"
                                        isClearable={true}
                                        isSearchable={true}
                                        name="leader"
                                        value={this.getLeader()}
                                        onChange={this.setLeader}
                                        options={this.userList}
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs>
                                <InputLabel id="member">Member</InputLabel>
                                <Select
                                    className="basic-single"
                                    classNamePrefix="select"
                                    isClearable={false}
                                    isSearchable={true}
                                    isMulti={true}
                                    name="members"
                                    value={this.getMembers()}
                                    onChange={this.addMember}
                                    options={this.userList}
                                />
                            </Grid>
                            <Grid item xs>
                                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                    <Grid container justify="space-between">
                                        <KeyboardDatePicker
                                            margin="normal"
                                            id="startDate"
                                            label="Start date"
                                            format="yyyy-MM-dd"
                                            value={this.state.savedProject.startDate}
                                            onChange={this.setStartDate}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change date',
                                            }}
                                            error={!this.state.form.startDate.valid}
                                            required
                                            helperText={this.state.form.startDate.message}
                                        />
                                        <KeyboardDatePicker
                                            margin="normal"
                                            id="endDate"
                                            label="End date"
                                            format="yyyy-MM-dd"
                                            value={this.state.savedProject.endDate}
                                            onChange={this.setEndDate}
                                            KeyboardButtonProps={{
                                                'aria-label': 'change date',
                                            }}
                                            error={!this.state.form.endDate.valid}
                                            required
                                            helperText={this.state.form.endDate.message}
                                        />
                                    </Grid>
                                </MuiPickersUtilsProvider>
                            </Grid>
                        </Grid>
                    </DialogContent>


                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.saveProject} color="primary">
                            Save
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

/* storiesOf('Material UI', module)
  .add('Override Default Components', () => <MaterialTable />); */
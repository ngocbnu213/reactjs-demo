import React, { PureComponent } from 'react';
import differenceBy from 'lodash/differenceBy';
import Card from '@material-ui/core/Card';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import ArrowDownward from '@material-ui/icons/ArrowDownward';
import Delete from '@material-ui/icons/Delete';
import Add from '@material-ui/icons/Add';
import memoize from 'memoize-one';
import DataTable from 'react-data-table-component';
import axios from 'axios';

import './MaterialTable.css';

import { LOAD_PROJECT } from '../actions/ProjectAction';
import { ProjectDialog } from './ProjectDialog';
import { format } from 'date-fns';
import AppConstants from '../constants/AppConstants';
import { ProjectStatus } from '../model/model';

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

const now = () => {
    return format(new Date(), AppConstants.DATE_FORMAT);
}
const columns = memoize((t) => {
    if (!t) {
        return [];
    }
    return [
        {
            name: t('project.table.id'),
            selector: 'id',
            sortable: true,
            grown: 0.5
        },
        {
            name: t('project.table.name'),
            selector: 'projectName',
            wrap: true,
            sortable: true,
        },
        {
            name: t('project.table.status'),
            selector: 'status',
            sortable: true,
        },
        {
            name: t('project.table.start-date'),
            selector: 'startDate',
            sortable: true,
        },
        {
            name: t('project.table.end-date'),
            selector: 'endDate',
            sortable: true,
        },
    ];
});

export default class MaterialTable extends PureComponent {

     users = new Map();
     userList = [];
     state = {
        selectedRows: [],
        toggleCleared: false,
        open: false,
        project: {
            projectName: '',
            status: ProjectStatus.OPEN,
            startDate: now(),
            endDate: now(),
            leader: undefined,
            members: []
        }
    };
    constructor(props) {
        super(props);
        
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
            this.props.dispatch(LOAD_PROJECT(res.data));
        }).catch(error => console.error(error));
    }

    handleChange = state => {
        this.setState({ selectedRows: state.selectedRows });
    };

    handleRowClicked = row => {
        this.setState({ project: row, open: true });
    }

    handleClickOpen = () => {
        this.setState({ open: true });
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
        const { t } = this.props;
        return (
            <div className="table-container">
                <Card style={{ height: '100%', width: '80%' }}>
                    <DataTable
                        title="Project"
                        columns={columns(t)}
                        data={this.props.projects}
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
                    />
                </Card>
                <ProjectDialog open={this.state.open} project={this.state.project} users = {this.users} userList = {this.userList}/>
            </div>
        );
    }
}

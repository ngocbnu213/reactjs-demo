import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, Grid, TextField, InputLabel, Button, DialogActions } from '@material-ui/core';
import Select from 'react-select';
import DateFnsUtils from '@date-io/date-fns';
import { ProjectStatus, ProjectStatusList } from '../model/model'
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import isValid from 'date-fns/isValid';
import format from 'date-fns/format';
import isAfter from 'date-fns/isAfter';
import isBefore from 'date-fns/isBefore';
import AppConstants from '../constants/AppConstants';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { LOAD_PROJECT } from '../actions/ProjectAction';

const now = () => {
    return format(new Date(), AppConstants.DATE_FORMAT);
}

export const ProjectDialog = ({ dispatch, onClose, project, open, users, userList }) => {
    const [savedProject, setSavedProject] = useState(project);
    const [form, setForm] = useState({
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
    });
    const [t] = useTranslation('common');
    useEffect(() => {
        setSavedProject(project);
    }, [project]);
    const handleClose = () => {
        onClose();
        setSavedProject({
            projectName: '',
            status: ProjectStatus.OPEN,
            startDate: now(),
            endDate: now(),
            leader: undefined,
            members: []
        });
        setForm({
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
        });
    };

    const setProjectName = (event) => {
        setSavedProject({
            ...savedProject, projectName: event.target.value
        });
    };

    const validateProjectName = (event) => {
        const str = savedProject.projectName;
        if (str === null || str.length === 0) {
            setForm({
                ...form, projectName: {
                    valid: false,
                    message: 'project.errors.name'
                }
            });
        } else {
            setForm({
                ...form, projectName: {
                    valid: true,
                    message: ''
                }
            });
        }
    }
    const setStatus = (event) => {
        setSavedProject({
            ...savedProject,
            status: event.value
        });
    }
    const getStatus = () => {
        return {
            value: savedProject.status,
            label: savedProject.status
        }
    }
    const setStartDate = (value) => {
        if (isValid(value)) {
            let startDate = { valid: true, message: '' };
            if (isAfter(value, new Date(savedProject.endDate))) {
                startDate = {
                    valid: false, message: 'project.errors.start-date'
                }
            }
            setSavedProject({
                ...savedProject,
                startDate: format(value, AppConstants.DATE_FORMAT)
            });
            setForm({
                ...form,
                startDate: startDate,
                endDate: { valid: true, message: '' },
            });
        } else {
            setForm({ ...form, startDate: { valid: false, message: 'Invalid date format' } })
        }

    };

    const setEndDate = (value) => {
        if (isValid(value)) {
            let endDate = { valid: true, message: '' };
            if (isBefore(value, new Date(savedProject.startDate))) {
                endDate = {
                    valid: false, message: 'project.errors.end-date'
                }
            }
            setSavedProject({
                ...savedProject,
                endDate: format(value, AppConstants.DATE_FORMAT)
            });
            setForm({
                ...form,
                startDate: { valid: true, message: '' },
                endDate: endDate
            });
        } else {
            setForm({ ...form, endDate: { valid: false, message: 'Invalid date format' } });
        }
    };

    const setLeader = (event) => {
        let leader = null;
        if (event != null) {
            leader = users.get(event.value);
        }
        setSavedProject({
            ...savedProject,
            leader: leader
        });
    };

    const addMember = (event) => {
        let members = [];
        if (event != null) {
            members = event.map(e => users.get(e.value));

        }
        setSavedProject({
            ...savedProject,
            members: members
        });
    }

    const isValidProject = () => {
        return form.projectName.valid
            && form.startDate.valid
            && form.endDate.valid;
    }

    const getLeader = () => {

        const leader = savedProject.leader;
        if (leader) {
            const user = users.get(leader.id);
            if (user) {
                return {
                    value: user.id,
                    label: user.firstName + ' ' + user.lastName
                }
            }
        }

    }

    const getMembers = () => {
        return savedProject.members.map(user => {
            return {
                value: user.id,
                label: user.firstName + ' ' + user.lastName
            }
        })
    }
    const saveProject = (event) => {
        validateProjectName();
        if (!isValidProject()) {
            return;
        }
        axios.post("http://localhost:8080/api/project", savedProject)
            .then(res => {
                const data = res.data;
                dispatch(LOAD_PROJECT(data));
            })
            .catch(error => console.error(error))
            .finally(() => handleClose());
    };

    return (
        <Dialog className="animate__animated animate__zoomIn" fullWidth={true} maxWidth='sm' open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Project</DialogTitle>
            <DialogContent>
                <Grid container spacing={2} direction="column">
                    <Grid item xs>
                        <TextField
                            margin="dense"
                            id="project-name"
                            label={t('project.name')}
                            value={savedProject.projectName}
                            onChange={setProjectName}
                            onBlur={validateProjectName}
                            fullWidth
                            required
                            helperText={t(form.projectName.message)}
                            error={!form.projectName.valid}
                        />
                    </Grid>
                    <Grid item container direction="row" justify="space-between">
                        <Grid item xs>
                            <InputLabel id="status">{t('project.status')}</InputLabel>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                defaultValue={ProjectStatusList[0]}
                                isClearable={false}
                                isSearchable={true}
                                value={getStatus()}
                                onChange={setStatus}
                                name="status"
                                options={ProjectStatusList}
                            />
                        </Grid>
                        <Grid item xs>
                            <InputLabel id="leader">{t('project.leader')}</InputLabel>
                            <Select
                                className="basic-single"
                                classNamePrefix="select"
                                isClearable={true}
                                isSearchable={true}
                                name="leader"
                                value={getLeader()}
                                onChange={setLeader}
                                options={userList}
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs>
                        <InputLabel id="member">{t('project.member')}</InputLabel>
                        <Select
                            className="basic-single"
                            classNamePrefix="select"
                            isClearable={false}
                            isSearchable={true}
                            isMulti={true}
                            name="members"
                            value={getMembers()}
                            onChange={addMember}
                            options={userList}
                        />
                    </Grid>
                    <Grid item xs>
                        <MuiPickersUtilsProvider utils={DateFnsUtils}>
                            <Grid container justify="space-between">
                                <KeyboardDatePicker
                                    margin="normal"
                                    id="startDate"
                                    label={t('project.start-date')}
                                    format="yyyy-MM-dd"
                                    value={savedProject.startDate}
                                    onChange={setStartDate}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                    error={!form.startDate.valid}
                                    required
                                    helperText={t(form.startDate.message)}
                                />
                                <KeyboardDatePicker
                                    margin="normal"
                                    id="endDate"
                                    label={t('project.end-date')}
                                    format="yyyy-MM-dd"
                                    value={savedProject.endDate}
                                    onChange={setEndDate}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                    error={!form.endDate.valid}
                                    required
                                    helperText={t(form.endDate.message)}
                                />
                            </Grid>
                        </MuiPickersUtilsProvider>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    {t('label.cancel')}
                </Button>
                <Button onClick={saveProject} color="primary">
                    {t('label.save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
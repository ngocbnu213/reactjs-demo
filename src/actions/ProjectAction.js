export const ProjectActionType = {
    LOAD_PROJECT: 'LOAD_PROJECT',
    LOAD_ALL_PROJECT: 'LOAD_ALL_PROJECT',
    REMOVE_PROJECT:'REMOVE_PROJECT'
};

export function LOAD_PROJECT(project) {
    return {
        type: ProjectActionType.LOAD_PROJECT,
        payload: project
    }
}

export function LOAD_ALL_PROJECT(projects) {
    return {
        type: ProjectActionType.LOAD_ALL_PROJECT,
        payload: projects
    }
}

export function REMOVE_PROJECT(ids) {
    return {
        type: ProjectActionType.REMOVE_PROJECT,
        payload: ids
    }
}
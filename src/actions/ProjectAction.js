export const ProjectActionType = {
    LOAD_PROJECT: 'LOAD_PROJECT'
};

export function LOAD_PROJECT(projects) {
    return {
        type: ProjectActionType.LOAD_PROJECT,
        payload: projects
    }
}
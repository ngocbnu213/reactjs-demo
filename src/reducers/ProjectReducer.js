import { ProjectActionType } from "../actions/ProjectAction";

const project = (state = {
    list: []
}, action) => {
    if (action.type === ProjectActionType.LOAD_PROJECT) {
        return {
            ...state, list: action.payload
        }
    }
    return state;
};

export default project;
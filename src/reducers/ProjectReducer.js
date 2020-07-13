import { ProjectActionType } from "../actions/ProjectAction";

const project = (state = {
    list: []
}, action) => {
    if (action.type === ProjectActionType.LOAD_ALL_PROJECT) {
        return {
            ...state, list: action.payload
        }
    } else if (action.type === ProjectActionType.LOAD_PROJECT) {
        let list = [...state.list];
        let pro = action.payload;
        let index = list.findIndex(p => p.id === pro.id);
        if (index === -1) {
            list.push(pro);
        } else {
            list[index] = pro;
        }
        return {
            ...state,
            list: list
        }
    }
    return state;
};

export default project;
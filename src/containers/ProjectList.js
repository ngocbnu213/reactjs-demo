import MaterialTable from "../components/MaterialTable";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";

const mapStateToProp = (state) => {
    return {
        projects: state.project.list
    }
}
export default connect(mapStateToProp)(withTranslation('common')(MaterialTable));
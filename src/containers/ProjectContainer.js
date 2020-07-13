import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import { ProjectDialog } from "../components/ProjectDialog";

export default connect()(withTranslation('common')(ProjectDialog));
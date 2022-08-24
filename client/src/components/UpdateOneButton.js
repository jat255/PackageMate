import React, { Component } from 'react';
import LaddaButton, { XS, ZOOM_OUT } from 'react-ladda';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons'

class UpdateOneButton extends Component {
  state = { loading: false };

  render() {
    return (
      <LaddaButton
        id={`updateButton-${this.props.pkg._id}`}
        loading={this.state.loading}
        onClick={ () => {
          this.setState({loading: true})
          this.props.updateOnePackage(this.props.pkg)
            .then(() => {
              this.setState({loading: false})
              this.props.getPackages();
            })}}
        data-color="red"
        data-size={XS}
        data-style={ZOOM_OUT}
        data-spinner-color="#6c757d"
        data-spinner-lines={12}
        className="btn btn-outline-secondary update-one-btn"
      >
        <FontAwesomeIcon icon={faRedoAlt}/>
      </LaddaButton>
    )
  }
}

export default UpdateOneButton

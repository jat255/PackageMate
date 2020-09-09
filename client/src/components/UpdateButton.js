import React, { Component } from 'react';
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import LaddaButton, { S, EXPAND_RIGHT } from 'react-ladda';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'

class UpdateButton extends Component {

  toggle = () => {
    this.props.updateAllPackages();
  }

  render() {
    return (
      <Row>
        <Col >
          <LaddaButton
            id='updateButton'
            loading={this.props.loading}
            progress={this.props.updateProgress}
            onClick={this.toggle}
            data-color="red"
            data-size={S}
            data-style={EXPAND_RIGHT}
            // data-spinner-size={30}
            data-spinner-color="#ddd"
            data-spinner-lines={12}
            className="btn btn-info"
          >
            <FontAwesomeIcon icon={faSyncAlt}/>
            <span style={{marginLeft: 0.75 + 'em', marginTop: -0.5 + 'em'}}>Update package statuses</span>
          </LaddaButton>

        </Col>
      </Row>
    )
  }
}

export default UpdateButton

import React, { Component } from 'react';
import Button from 'react-bootstrap/Button'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons'

class UpdateButton extends Component {
  render() {
    return (
      <Row>
        <Col >
          <Button 
            id='updateButton' 
            variant='outline-success'
            onClick={this.props.updateAllPackages}>
            <FontAwesomeIcon icon={faSyncAlt}/>
            <span style={{marginLeft: 0.75 + 'em'}}>Update package statuses</span>
          </Button>
        </Col>
      </Row>
    )
  }
}

export default UpdateButton

import React, { Component } from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import FormControl from 'react-bootstrap/FormControl'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsps } from '@fortawesome/free-brands-svg-icons'
import { faFedex } from '@fortawesome/free-brands-svg-icons'
import { faUps } from '@fortawesome/free-brands-svg-icons'

class Input extends Component {
  state = {
    dropDownValue: "Carrier",
    carrier: "",
    trackingNumber: "",
    description: ""
  }

  carrierIcons = {
    USPS: <FontAwesomeIcon icon={faUsps} />,
    FedEx: <FontAwesomeIcon icon={faFedex} />,
    UPS: <FontAwesomeIcon icon={faUps} />,
  }

  addPackage = () => {
    const pkg = {
      carrier: this.state.carrier,
      trackingNumber: this.state.trackingNumber,
      description: this.state.description
    }
    if (pkg.carrier && pkg.trackingNumber && pkg.trackingNumber.length > 0) {
      axios.post('/api/packages', pkg)
        .then(res => {
          if (res.data) {
            this.props.getPackages();
            this.setState({
              trackingNumber: "",
              carrier: "",
              description: "",
              dropDownValue: "Carrier"
            })
          }
        })
        .catch(err => console.log(err))
    } else {
      console.log('Tracking number and Carrier required')
    }
  }

  handleTrackingNumberChange = (e) => {
    this.setState({
      trackingNumber: e.target.value
    })
  }
  handleCarrierChange = (e) => {
    this.setState({
      carrier: e.target.value
    })
  }
  handleDescriptionChange = (e) => {
    this.setState({
      description: e.target.value
    })
  }
  changeDropDownValue(text) {
    this.setState({
      dropDownValue: text,
      carrier: text
    })
  }
  createDropdownItems() {
    let items = [];
    for (let i = 0; i <= this.props.possibleCarriers.length; i++) {
      let c = this.props.possibleCarriers[i]
      if (c in this.carrierIcons) {
        items.push(
          <Dropdown.Item as="button" key={i} onClick={(e) => this.changeDropDownValue(c)} >
            {this.carrierIcons[c]} {c}
          </Dropdown.Item>
        );
      } else {
        items.push(
          <Dropdown.Item as="button" key={i} onClick={(e) => this.changeDropDownValue(c)} >
            {c}
          </Dropdown.Item>
        )
      }
    }
    return items;
  }

  render() {
    return (
      <Row>
        <Col>
          <InputGroup className="mb-3">
            <DropdownButton
              as={InputGroup.Prepend}
              key="carrier-dropdown"
              variant="outline-primary"
              title={this.state.dropDownValue}
              id="input-group-dropdown-1"
            >
              {
                this.props.possibleCarriers &&
                  this.props.possibleCarriers.length > 0
                  ?
                  this.createDropdownItems()
                  :
                  <Dropdown.Item variant='warning'>No supported carriers were found!</Dropdown.Item>
              }
            </DropdownButton>

            <FormControl
              placeholder="Tracking number"
              aria-label="Tracking number"
              onChange={this.handleTrackingNumberChange}
              value={this.state.trackingNumber}
              onKeyPress={event => {
                if (event.key === "Enter") {
                  this.addPackage();
                }
              }}
            />

            <InputGroup.Append>
              <FormControl
                placeholder="Description (optional)"
                aria-label="Description (optional)"
                onChange={this.handleDescriptionChange}
                id='description-input'
                value={this.state.description}
                onKeyPress={event => {
                  if (event.key === "Enter") {
                    this.addPackage();
                  }
                }}
              />
            </InputGroup.Append>
            <InputGroup.Append>
              <Button variant="outline-success" onClick={this.addPackage}>Add Package</Button>
            </InputGroup.Append>
          </InputGroup>
        </Col>
      </Row>
    )
  }
}

export default Input

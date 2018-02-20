import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Info from '../components/Info';
import '../styles/SearchResults.css';
import FaHand from 'react-icons/lib/fa/hand-o-up';
import FaPhone from 'react-icons/lib/fa/phone';
import FaMail from 'react-icons/lib/fa/envelope-o';
import FaClock from 'react-icons/lib/fa/clock-o';

class Service extends Component {
  urlify(url) {
    if(url !== undefined) {
      return url.toString()
      .toLowerCase()
      .split(/\&+/).join("-and-")
      .split(/[^a-z0-9]/).join("-")
      .split(/-+/).join("-")
      .trim('-')
    }
  }
  render() {
    return (
      <div className="service">
        <div className="search-result-hero">
        <Link to={{
        pathname: `/service/${this.urlify(this.props.record.PROVIDER_NAME)}`,
        state: this.props.record}} onClick={()=>this.props.changeResult(this.props.record)}><h3>{this.props.record.PROVIDER_NAME}</h3></Link>
        <p>{this.props.record.PHYSICAL_ADDRESS}</p>
        <span><u>Show on map</u></span>
        </div>
        <h4>{this.props.record.SERVICE_NAME}</h4>
        <p>{this.props.record.SERVICE_DETAIL}</p>
        <ul className="list-stripped">
          <li className="list-icon"><span><FaHand /></span> http://www.website.com</li>
          <li className="list-icon"><span><FaPhone/></span> {this.props.record.PUBLISHED_PHONE_1}</li>
          <li className="list-icon"><span><FaMail/></span> {this.props.record.PUBLISHED_CONTACT_EMAIL_1}</li>
          <li className="list-icon"><span><FaClock/></span> {this.props.record.PROVIDER_CONTACT_AVAILABILITY}</li>
        </ul>
      </div>
    );
  }
}

export default Service;

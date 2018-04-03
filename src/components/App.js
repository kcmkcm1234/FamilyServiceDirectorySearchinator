import React, { Component } from 'react';
import {connect} from 'react-redux';
import * as actionCreators from '../actions/index';
import MapResults from './Map/MapResults';
import AddressFinder from './Forms/AddressFinder';
import LazyLoad from 'react-lazyload';
import Filters from './Service/Filters';
import Service from '../components/Service/Service';
import Sharebar from '../components/Social/Sharebar';
import '../styles/Nav.css';
import '../styles/Form.css';
import Proximity from './Forms/Proximity';

let inputchanged = false;

class App extends Component {

  constructor() {
    super();
    this.state = {
      showMap: false,
      latlng: [],
      keyword: ''
    };
    this.resultButton = this.resultButton.bind(this);
    this.resultCountButton = this.resultCountButton.bind(this);
    this.keywordBlur = this.keywordBlur.bind(this);
    this.onKeywordChange = this.onKeywordChange.bind(this);
  }

  debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  componentWillMount () {
    this.props.loadFilters();
    this.radiusChange = this.debounce(this.radiusChange,200);
    this.setState({keyword: this.props.searchVars.keyword});
  }

  resultButton () {
    if(this.props.results.length > 0){
      return <button className="btn-toggle" onClick={() => {
        this.setState({ showMap: !this.state.showMap}); }
      }>{this.state.showMap ? 'Show List' : 'Toggle Map'}</button>;
    }
  }

  resultCountButton () {
    if(!this.props.itemsLoading && this.props.hasSearched){
      if(this.props.noSearchVars){
        return <p className="resultsDesc">No search parameters supplied</p>;
      }else if(this.props.totalResults && this.props.results.length == 100 && this.props.totalResults*1 > 100){
        return <p className="resultsDesc">Found {this.props.results.length} of {this.props.totalResults*1} result{this.props.totalResults*1 !== 1 ? 's' : ''} {this.resultButton()} </p>;
      }else{
        return <p className="resultsDesc">Found {this.props.results.length} result{this.props.totalResults*1 !== 1 ? 's' : ''} {this.resultButton()} </p>;
      }
    }
  }

  keywordBlur(e){
    if(inputchanged){
      const clone = {...this.props.searchVars};
      clone.keyword = e.target.value;
      clone.addressLatLng = (this.props.searchVars.addressLatLng === undefined ? this.state.latlng : this.props.searchVars.addressLatLng);
      this.props.loadResults(clone);
    }
  }

  onKeywordChange(value){
    this.setState({keyword: value});
  }

  enterPressed(e) {
    inputchanged = true;
    var code = e.keyCode || e.which;
    if(code === 13) {
      inputchanged = false;
      const clone = {...this.props.searchVars};
      clone.keyword = (e.target.value === '') ? null : e.target.value;
      clone.addressLatLng = (this.props.searchVars.addressLatLng === undefined ? this.state.latlng : this.props.searchVars.addressLatLng);
      this.props.loadResults(clone);
    }
  }

  addressBlur(e){
    /* clears location details when the field is emptied */
    if(e.target.value === ''){
      this.setState({latlng: {}});
      this.props.loadResults({
        category: this.props.searchVars.category,
        keyword: this.props.searchVars.keyword,
        addressLatLng: {},
        radius: 25000
      });
    }
  }

  radiusChange(value){
    const clone = {...this.props.searchVars};
    const callback = this.props.loadResults;
    clone.radius = value*1;
    setImmediate(function() {
      callback(clone);
    });
  }

  render() {
    console.log(this.props.searchVars);
    console.log(this.state.keyword);
    return (
      <div className="container-fluid">
        <Filters filters={this.props.filters} searchVars={this.props.searchVars} loadResults={this.props.loadResults} />
        <form className="form" onSubmit={(e)=>{
          e.preventDefault();
          this.setState({latlng: this.props.searchVars.addressLatLng});
          const clone = {...this.props.searchVars};
          clone.addressLatLng = (this.props.searchVars.addressLatLng === undefined ? this.state.latlng : this.props.searchVars.addressLatLng);
          clone.keyword = e.target.keyword.value;
          this.props.loadResults(clone);
        }}>
          <input value={this.state.keyword} type="search" name="keyword" onBlur={this.keywordBlur.bind(this)} onKeyPress={this.enterPressed.bind(this)} onChange={e => this.onKeywordChange(e.target.value)} placeholder="Enter topic or organisation" />
          <AddressFinder data={this.props} handler={this.addressBlur.bind(this)} radius={this.props.searchVars.radius}/>
          {this.props.searchVars.addressLatLng && Object.keys(this.props.searchVars.addressLatLng).length !== 0 &&
            <Proximity handler={this.radiusChange.bind(this)} radius={this.props.searchVars.radius}/>
          }
          <button type="submit">Search</button>
        </form>
        <div className={'results' + (this.props.itemsLoading ? ' loading' : '')}>
          {this.resultCountButton()}
          { !this.props.itemsLoading && this.state.showMap && <MapResults className="container-fluid" LatLng={this.props.searchVars.addressLatLng} map_results={this.props.results} />}
          { !this.props.itemsLoading && !this.state.showMap && this.props.results.map((data,index)=>
            <LazyLoad height={280} key={index}>
              <Service results={data} changeCategory={this.props.changeCategory} searchVars={this.props.searchVars} serviceId={data.FSD_ID} loadResults={this.props.loadResults} />
            </LazyLoad>)}
        </div>
        <Sharebar/>
      </div>
    );
  }
}

function mapStateToProps(state,ownProps) {
  const clone = {...state.searchVars};
  if(!state.searchVars.category && ownProps.startCategory){
    /* for some unidentified reason ownProps.startCategory is returning a string */
    clone.category = (ownProps.startCategory === 'undefined') ? '' : ownProps.startCategory;
  }
  return {
    filters: state.filter,
    results: state.results,
    showMap: state.showMap,
    searchVars: clone,
    noSearchVars: state.noSearchVars,
    totalResults: state.totalResults,
    itemsLoading: state.itemsLoading,
    hasSearched: state.hasSearched
  };
}

export default connect(mapStateToProps, actionCreators)(App);

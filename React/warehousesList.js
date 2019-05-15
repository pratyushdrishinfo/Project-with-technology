import _ from 'lodash';
import React, {Component} from 'react';
import { connect } from 'react-redux';
import {Field,reduxForm, reset} from 'redux-form';
import $ from 'jquery';

//import all component here
import WarehouseDetails from '../../containers/warehouse/warehouseDetails';
import WarehouseAdd from '../../containers/warehouse/warehouseAdd';
import WarehousesFilter from '../../containers/warehouse/warehousesFilter';
import WarehousesPagination from '../../containers/warehouse/warehousesPagination';
import { compose } from '../../../node_modules/redux';

// Import fetch list action
import { fetchWarehousesAction, fetchWarehouseDetailsAction, filterWarehousesAction, fetchStateDropdownList , fetchCityDropdownList } from '../../actions/warehouse';

const customStyle = {
  width: "auto"
};

//Component For Warehouse List
class WarehousesList extends Component {
  constructor(props) {
		super(props);

      this.state = {
        fieldsStyle: '',
        pageNumber: 1,
        recordsPerPage: 10,
        countWarehouse: '',
        totalPages: '',
        searchBy: '',
        prevSearchBy: '',
        keyword:'',
        prevkeyword:'',
        KeywordSelected: '',
        prevKeywordSelected: '',
        resetfilter:false,
        filterButtonDisable : true,
        isSearched : false,
        keywordField : "input",
        prevkeywordField : "input",
        loader : true
    };

    this.filterInPutFieldHandleChange = this.filterInPutFieldHandleChange.bind(this);
    this.filterSelectBoxHandleChange = this.filterSelectBoxHandleChange.bind(this);
    this.filterSelectKeywordChange = this.filterSelectKeywordChange.bind(this);
    this.filterOnSubmit = this.filterOnSubmit.bind(this);
    this.paginationThisPage = this.paginationThisPage.bind(this);
    this.paginationNextPage = this.paginationNextPage.bind(this);
    this.paginationPrevPage = this.paginationPrevPage.bind(this);
    this.paginationNoAction = this.paginationNoAction.bind(this);
    this.filterOnReset = this.filterOnReset.bind(this);
    this.actionCallForList = this.actionCallForList.bind(this);
  }
  componentDidMount(){
    let pageNumber = this.state.pageNumber;
    let recordsPerPage = this.state.recordsPerPage;
    this.props.fetchWarehousesAction(pageNumber, recordsPerPage, (response) => {
      this.setState({ loader: false });
    });
    $( "div" ).remove( ".modal-backdrop" );
    $('body').removeClass('modal-open');
    document.title = "Warehouse";
  }
  componentWillReceiveProps(newProps) {
    let pageNumber = this.state.pageNumber;
    let recordsPerPage = this.state.recordsPerPage;
    let totalRecords = newProps.totalRecords;
    let totalPages = (totalRecords>recordsPerPage) ? Math.ceil(totalRecords/recordsPerPage) : 0;
    this.setState({ countWarehouse: newProps.totalRecords });
    this.setState({ totalPages: totalPages });
  }
  componentWillUpdate(nextProps, nextState) {
    if (nextState.open == true && this.state.open == false) {
      this.props.onWillOpen();
    }
  }
  renderSelectField(field) {
    const { meta: { touched, error }, children } = field;
    return (
      <select {...field.input} style={field.customStyle} aria-controls="dtBasicExample" className="custom-select custom-select-sm form-control form-control-sm ml-2">
        {children}
      </select>
    );
  }
  handleRecordsPerPageFieldChange(field, event) {
    this.setState({ recordsPerPage : event.target.value, pageNumber : 1 });
    let pageNumber = 1;
    let isSearched = this.state.isSearched;
    let recordsPerPage = event.target.value;
    let searchBy = this.state.prevSearchBy;
    let keyword = this.state.prevkeyword;
    let keywordField = this.state.prevkeywordField;
    let KeywordSelected = this.state.prevKeywordSelected;
    this.actionCallForList(pageNumber, recordsPerPage, searchBy, keyword, isSearched, KeywordSelected, keywordField)
  }
  renderWarehouses(){
    if(this.props.warehouses) {
      if(this.props.totalRecords > 0) {
        return _.map(this.props.warehouses, warehouse => {
          return(
            <tr key={warehouse.Id}>
              <td>{warehouse.Name}</td>
              <td>{warehouse.Phone}</td>
              <td>{warehouse.Address}</td>
              <td>{warehouse.City}</td>
              <td>{warehouse.State}</td>
               <td>{warehouse.IsActive ? 'Yes' : 'No'}</td>
              <td><button type="button" className="btn btn-primary btn-sm custom-color"  onClick={() => this.viewWarehouseDetail(warehouse.Id)} data-target="#viewWarehouseDetail" data-toggle="modal">Details</button></td>
            </tr>
          );
        });
      } else {
        return (
          <tr><td colSpan="10">No Record Found</td></tr>
        );
      }
    }
  }
  filterInPutFieldHandleChange(field, event) {
    let searchBy = this.state.searchBy;
    let keyword = this.state.keyword;
    let isSearched = this.state.isSearched;
    let filterButtonDisable = this.state.filterButtonDisable;
    if(event.target.value !== '') {
      keyword = event.target.value;
      if(searchBy !== '') {
        filterButtonDisable = false;
      }
    } else {
      filterButtonDisable = true;
      keyword = '';
    }
    this.setState({ filterButtonDisable, keyword });
  }
  filterSelectKeywordChange(field, event) {
    let KeywordSelected = this.state.KeywordSelected;
    KeywordSelected = event.target.value;
    this.setState({ KeywordSelected });
  }
  filterSelectBoxHandleChange(field, event) {
    let fieldsStyle = this.state.fieldsStyle;
    let isSearched = this.state.isSearched;
    let resetfilter = this.state.resetfilter;
    let keyword = this.state.keyword;
    let filterButtonDisable = this.state.filterButtonDisable;
    let keywordField = this.state.keywordField;
    let KeywordSelected = this.state.KeywordSelected;
    let searchBy = this.state.searchBy;
    if( event.target.value !== '' ) {
      fieldsStyle = 'filterCustomStyle';
      let searchByValue = event.target.value;
      searchBy = searchByValue;
      keywordField = searchByValue.startsWith("Is") ? "select" : "input";
      if(keywordField === "select") {
        filterButtonDisable = false
        if(KeywordSelected === '') {
          KeywordSelected = 'true';
        }
      } else if(keywordField === "input") {
        if(keyword !== '') {
            filterButtonDisable = false
        } else {
          filterButtonDisable = true
        }
      }
    } else {
      fieldsStyle = '';
      filterButtonDisable = true
      searchBy = ''
      keywordField = "input"
    }
    this.setState({ resetfilter, KeywordSelected, filterButtonDisable, fieldsStyle, keyword, searchBy, keywordField });
  }
  filterOnSubmit(values) {
    let keywordField = this.state.keywordField;
    let resetfilter = this.state.resetfilter;
    let isSearched = this.state.isSearched;
    let pageNumber = this.state.pageNumber;
    let recordsPerPage = this.state.recordsPerPage;
    let keyword = this.state.keyword;
    let searchBy = this.state.searchBy;
    let KeywordSelected = this.state.KeywordSelected;
    this.setState({ loader: true, resetfilter : true, isSearched : true, pageNumber : 1 })
    this.props.filterWarehousesAction(values, 1, recordsPerPage, keywordField, (response) => {
      this.setState({ loader: false, prevkeywordField: keywordField, prevKeywordSelected: KeywordSelected, prevSearchBy: searchBy, prevkeyword: keyword });
    });
  }
  filterOnReset() {
    let recordsPerPage = this.state.recordsPerPage;
    this.setState({ isSearched : false, fieldsStyle: '', pageNumber : 1, KeywordSelected : "", prevKeywordSelected : "", searchBy : "", prevSearchBy : "", keyword : "", prevkeyword : "", filterButtonDisable : true, prevkeywordField: 'input', keywordField : "input" });
    this.actionCallForList(1, recordsPerPage, '', '','','','');
  }
  paginationThisPage(event) {
    const newPageNumber = parseInt(event.target.innerText);
    this.setState({ pageNumber : newPageNumber });
    let recordsPerPage = this.state.recordsPerPage;
    let searchBy = this.state.prevSearchBy;
    let keyword = this.state.prevkeyword;
    let isSearched = this.state.isSearched;
    let keywordField = this.state.prevkeywordField;
    let KeywordSelected = this.state.prevKeywordSelected;
    this.actionCallForList(newPageNumber, recordsPerPage, searchBy, keyword, isSearched, KeywordSelected, keywordField)
  }
  paginationNextPage() {
    let pageNumber = this.state.pageNumber;
    let newPageNumber = this.state.pageNumber + 1;
    this.setState({ pageNumber : newPageNumber });
    let recordsPerPage = this.state.recordsPerPage;
    let searchBy = this.state.prevSearchBy;
    let keyword = this.state.prevkeyword;
    let isSearched = this.state.isSearched;
    let keywordField = this.state.prevkeywordField;
    let KeywordSelected = this.state.prevKeywordSelected;
    this.actionCallForList(newPageNumber, recordsPerPage, searchBy, keyword, isSearched, KeywordSelected, keywordField)
  }
  paginationPrevPage() {
    let pageNumber = this.state.pageNumber;
    let newPageNumber = this.state.pageNumber - 1;
    this.setState({ pageNumber : newPageNumber });
    let recordsPerPage = this.state.recordsPerPage;
    let searchBy = this.state.prevSearchBy;
    let keyword = this.state.prevkeyword;
    let isSearched = this.state.isSearched;
    let keywordField = this.state.prevkeywordField;
    let KeywordSelected = this.state.prevKeywordSelected;
    this.actionCallForList(newPageNumber, recordsPerPage, searchBy, keyword, isSearched, KeywordSelected, keywordField)
  }
  actionCallForList(pageNumber, recordsPerPage, searchBy, keyword, isSearched, KeywordSelected, keywordField){
    this.setState({ loader: true });
    if(isSearched) {
      let values = {}
      values.SearchBy = searchBy;
      values.Keyword =  keyword;
      values.KeywordSelected = KeywordSelected;
      this.props.filterWarehousesAction(values, pageNumber, recordsPerPage, keywordField, (response) => {
        this.setState({ loader: false });
      });
    } else {
      this.props.fetchWarehousesAction(pageNumber, recordsPerPage, (response) => {
        this.setState({ loader: false });
      });
    }
  }
  paginationNoAction() {
    return;
  }
  viewWarehouseDetail(wareData){
    this.setState({ loader: true });
    this.props.fetchCityDropdownList( (response) => {
      if(response === 'unauthorized') {
        this.setState({ loader: false });
        $( "div" ).remove( ".modal-backdrop" );
        $('body').removeClass('modal-open');
      }
    });
    this.props.fetchStateDropdownList((response) => {
      if(response === 'unauthorized') {
        this.setState({ loader: false });
        $( "div" ).remove( ".modal-backdrop" );
        $('body').removeClass('modal-open');
      }
    });
    this.props.fetchWarehouseDetailsAction(wareData, (response) => {
      this.setState({ loader: false });
      if(response === 'unauthorized') {
        $( "div" ).remove( ".modal-backdrop" );
        $('body').removeClass('modal-open');
      }
    });
    $("#editWarehouseFields :input").prop("disabled", true);
  }
  render (){
    const { loader, recordsPerPage, pageNumber, countWarehouse, totalPages, prevkeyword, prevSearchBy, isSearched, prevkeywordField, prevKeywordSelected } = this.state;
    const { warehouseDetail } = this.props;
    return (
      <div>
         <div className="ibox-body mb-3 position-relative">
          <div className="search-toggle">
            <WarehouseAdd
              recordsPerPage={recordsPerPage}
              pageNumber={pageNumber}
              keyword={prevkeyword}
              searchBy={prevSearchBy}
              isSearched={isSearched}
              keywordField={prevkeywordField}
              KeywordSelected={prevKeywordSelected}
            />
            <WarehouseDetails
              recordsPerPage={recordsPerPage}
              pageNumber={pageNumber}
              keyword={prevkeyword}
              searchBy={prevSearchBy}
              isSearched={isSearched}
              keywordField={prevkeywordField}
              KeywordSelected={prevKeywordSelected}
              warehouses={warehouseDetail}
            />
            <WarehousesFilter
              data={this.state}
              actionInputChange={this.filterInPutFieldHandleChange}
              actionSelectKeyword={this.filterSelectKeywordChange}
              actionSelectBoxChange={this.filterSelectBoxHandleChange}
              actionOnSubmit={this.filterOnSubmit}
              actionReset={this.filterOnReset}
            />
            <div className="dataTables_length bs-select position-absolute" id="dtBasicExample_length">
             <label className="mb-0 mt-1">
                Display
                <Field name="recordsPerPage" customStyle={customStyle} component={this.renderSelectField} onChange={this.handleRecordsPerPageFieldChange.bind(this, "recordsPerPage")}>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </Field>
             </label>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          <table id="example" className="table table-bordered">
            <thead>
              <tr>
                <th>Warehouse Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Active</th>
                <th className='setWidth'></th>
              </tr>
            </thead>
            <tbody>
              {this.renderWarehouses()}
            </tbody>
          </table>
          {loader && (
            <div className="d-flex align-items-center position-fixed loader-overlay justify-content-center"><div className="loader"></div></div>
          )}
        </div>
        {totalPages>1 ?
          (<WarehousesPagination
            data={this.state}
            actionThisPage={this.paginationThisPage}
            actionNextPage={this.paginationNextPage}
            actionPrevPage={this.paginationPrevPage}
            actionNone={this.paginationNoAction}
          />
         )
         :
         (
          countWarehouse> 0 ? (<p className="float-left">  Showing 1 to {countWarehouse} of {countWarehouse} entries</p>) : ""
         )
      }
      </div>
    );
  }
}

// Return current state to props
function mapStateToProps(state){
  return {
    warehouses: state.warehouses.warehouses.Warehouses,
    warehouse:state.warehouses.warehouse,
    totalRecords: state.warehouses.warehouses.TotalRecords
  }
}

// export component with redux form
export default reduxForm({
  form: 'recordsPerPageForm'
})(
    connect( mapStateToProps, { filterWarehousesAction, fetchWarehousesAction, fetchWarehouseDetailsAction, fetchStateDropdownList, fetchCityDropdownList } )(WarehousesList)
  );

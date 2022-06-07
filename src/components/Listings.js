import React, { Component } from 'react';
import axios from "axios";
import update from "immutability-helper";
import Table from "react-bootstrap/Table";

class Listing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      listings: [],
      errors: ''
    };
  }

  loadlistings() {
    axios
      .get("/api/v1/flipkart_listings")
      .then((res) => {
        this.setState({ listings: res.data.data });
      })
      .catch((error) => console.log(error));
  }

  componentDidMount() {
    this.loadlistings();
  }

  isValidHttpUrl(inpUrl) {
    let url;
    try {
      url = new URL(inpUrl);
    } catch (e) { return false; }
    return /https?/.test(url.protocol);
  }

  scrapeUrl = (e) => {
    var url = e.target.value;
    if (!(url.value === "")) {
      
        if(this.timeout) clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          if (this.isValidHttpUrl(url)) {
          //API request
          axios
            .post("/api/v1/scrape_data", { url: url })
            .then((res) => {
              const listings = update(this.state.listings, {
                $splice: [[0, 0, res.data.data]],
              })
              this.textInp.value = ''
              this.setState({
                listings: listings,
                errors: ''
              });
            }).catch((err) =>{
              this.textInp.value = ''
              this.setState({
                  errors: err.response.data
              })
          })
        } else {
            this.textInp.value = ''
            this.setState({
                errors: 'Please enter a valid URL'
            })
        }
        }, 3000);
    }
  };

  handleChange = (e) => {
    this.setState({ inputValue: e.target.value });
  };
  
  componentDidUpdate (prevProps, prevState) {
    if(prevState.text !== this.state.text) {
      this.handleCheck();
    }
  }
  
  handleCheck = () => {
    // Clears running timer and starts a new one each time the user types
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.toggleCheck();
    }, 3000);
  }

  render() { 
    // const errors = this.state.errors
    return (
      <div>
        <div>
          <h1>SCRAPE FLIPKART LISTINGS</h1>
        </div>
        <div>
          <input
            id="textInp"
            className="newURL"
            type="text"
            placeholder="Input a URL to scrape"
            onKeyPress={this.scrapeUrl}
            // value={this.state.inputValue}
            onChange={this.scrapeUrl}
            ref={(ref) => this.textInp= ref}
          />
        </div>
        <div className="error">
          <h3>{this.state.errors}</h3>
        </div> 
        <div>
        <div>
          <h3>SCRAPED LISTINGS</h3>
        </div>
        <table className="table-striped table-bordered table-responsive table-fixed table-sm fixed-col-width" >
            <thead>
                <tr>
                  <td>
                    URL
                  </td>
                  <td>
                    TITLE
                  </td>
                  <td>
                    DESC
                  </td>
                  <td>
                    PRICE
                  </td>
                </tr>
            </thead>

            {this.state.listings.map((listing) => {
              return (
                <tbody key={listing.attributes.id}  className="listing-table">
                  <tr>
                    <td>
                      <a href={listing.attributes.url} target="_blank"  rel="noreferrer"> {listing.attributes.url} </a>
                    </td>
                    <td>
                      {listing.attributes.title || 'Title not available'} 
                    </td>
                    <td>
                      {listing.attributes.description || 'Description not available'} 
                    </td>
                    <td>
                      Rs. {listing.attributes.price}
                    </td>
                  </tr>
                </tbody>
              );
            }
          )}
          </table>
        </div>
       </div>
     );
   }
}

export default Listing;
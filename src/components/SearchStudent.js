import React from "react";
import tnpbase from "../api/tnpbase";
import ErrorDisplay from "./ErrorDisplay";
import SuccessMessage from "./SuccessMessage";

class SearchStudent extends React.Component {
  state = {
    rollNumber: "",
    editDetail: -1,
    driveEditDetail: -1,
    driveContent: [],
    rounds: [],
    drives: [],
    drive_id: "",
    personalDetails: [],
    selectionStatus: ["Selected", "Not Selected"],
    offerStatus: ["Submitted", "Not Submitted"],
    showForm: false,
    content: "",
    driveDetails: [],
    status: "",
    loading: true,
    error: "",
    formSubmitted: false,
    submitStatus: "",
    submitError: false,
    showMessage: false,
    statusCode: null
  };

  toggleSubmit = () => {
    this.setState({ formSubmitted: true });
  }

  getStudentData = () => {
    this.toggleSubmit();
    const data = { HTNO: this.state.rollNumber };
    tnpbase
      .post('/student/details', data)
      .then((result) => {
        console.log(result.data);
        if (result.data.presentStatus === 0) {
          this.setState({ submitError: true, submitStatus: "Enter valid number" });
        } else {
          if (result.status === 200) {
            this.setState({
              personalDetails: result.data.personal,
              driveDetails: result.data.drive,
              showMessage: true,
              submitError : false,
              submitStatus : "",
              statusCode: 1
            });
          } else {
            this.setState({ submitError: true, submitStatus: "Unable to send data to API" });
          }
        }
      }
      )
      .catch((err) => {
        console.log(err);
        this.setState({ submitError: true, submitStatus: err.message });
      })
  };

  handleXClick = e => {
    this.setState({ showMessage: false, formSubmitted: false });
  };

  displayMessage = () => {
    if (this.state.formSubmitted) {
      if (this.state.submitError) {
        return (
          <ErrorDisplay
            message={this.state.submitStatus}
            handleXClick={this.handleXClick}
          />
        );
      } else if (this.state.showMessage) {
        if (this.state.statusCode === 1) {
          return (
            <SuccessMessage
              message={this.state.submitStatus}
              handleXClick={this.handleXClick}
            />
          );
        } else {
          return (
            <ErrorDisplay
              headerData="Error!"
              message={this.state.submitStatus}
              handleXClick={this.handleXClick}
            />
          );
        }
      } else {
        return <h3>Loading</h3>;
      }
    } else {
      return "";
    }
  };

  getRounds = (drive) => {
    const data = { drive_name: drive };
    tnpbase
      .post("/drive/rounds", data)
      .then((result) => {
        this.setState({
          rounds: result.data
        });
      })
      .catch((err) => {
        console.log(err);
      })
  }

  buttonHandle = (detail, data, contentIndex) => {
    return (
      this.state.editDetail === contentIndex ? (
        <div className="ui basic icon buttons">
          <button
            className="ui  button"
            style={{ margin: "5px" }}
            onClick={() => {
              let ups = this.state.personalDetails;
              ups[detail] = this.state.content;
              tnpbase
                .post('/student/editDetail', ups)
                .then((res) => {
                  if(res.status === 200){
                    this.setState({ editDetail: -1  , submitError : false,
                      submitStatus : res.data,
                      statusCode: 1})
                  }
                })
                .catch((err) => { console.log(err); 
                  this.setState({ submitError: true, submitStatus: err.message });
               })
            }
            }>
            <i className="check icon" />
          </button>
          <button
            className="ui button"
            onClick={() => {
              console.log("Abort")
              this.setState({ editDetail: -1 })
            }}
          >
            <i className="x icon" />
          </button>
        </div>
      ) : (
          <div>
            <button
              className="ui  secondary button"
              style={{ margin: "5px" }}
              onClick={() => {
                this.setState({ editDetail: contentIndex, content: data });
              }}
            >
              <i className="pencil alternate icon" />
              Edit
              </button>
          </div>
        )
    );

  }

  contentHandle = (detail, data, contentIndex) => {
    let noEdit = ["HTNO", "BRANCH_CODE"]
    return (
      this.state.editDetail === contentIndex ? (
        noEdit.includes(detail) ? (
          <div className="ui input disabled">
            <input
              type="text"
              value={this.state.content}
              onChange={e => {
                this.setState({ content: e.target.value });
              }}
            />
          </div>
        ) : (
            <div className="ui input">
              <input
                type="text"
                value={this.state.content}
                onChange={e => {
                  this.setState({ content: e.target.value });
                }}
              />
            </div>)
      ) : (
          <div>
            {data}
          </div>
        )
    );
  }

  personalData = () => {
    if (this.state.personalDetails.length === 0) {
      return (
        <tr>
          <td colSpan={3}>It's Lonely Here</td>
        </tr>
      );
    }
    let details = Object.keys(this.state.personalDetails);
    let content = Object.values(this.state.personalDetails);

    return (
      details.map((detail, contentIndex) => {
        return (
          <tr key={contentIndex}>
            <td>{detail}</td>
            <td>{this.contentHandle(detail, content[contentIndex], contentIndex)}</td>
            <td>{this.buttonHandle(detail, content[contentIndex], contentIndex)}</td>
          </tr>
        )
      })
    );
  }

  driveButtonHandle = (detail, driveIndex) => {

    return (
      this.state.driveEditDetail === driveIndex ? (
        <div className="ui basic icon buttons">
          <button
            className="ui  button"
            style={{ margin: "5px" }}
            onClick={() => {
              let ups = this.state.driveDetails;
              ups[driveIndex] = detail;
              const data = { ups, HTNO: this.state.rollNumber }
              tnpbase
                .post('search/student/driveEditDetail', data)
                .then((res) => {
                  if(res.status === 200){
                      this.setState({ driveEditDetail: -1, driveContent: []  , submitError : false,
                      submitStatus : res.data,
                      statusCode: 1});
                      this.getStudentData();
                    }
                })
                .catch((err) => { 
                  console.log(err);
                  this.setState({ submitError: true, submitStatus: err.message });
                })
            }
            }>
            <i className="check icon" />
          </button>
          <button
            className="ui button"
            onClick={() => {
              console.log("Abort");

              this.setState({ driveEditDetail: -1, driveContent: detail })
            }}
          >
            <i className="x icon" />
          </button>
        </div>
      ) : (
          <div>
            <button
              className="ui  secondary button"
              style={{ margin: "5px" }}
              onClick={() => {
                this.getRounds(detail.company);
                this.setState({ driveEditDetail: driveIndex, driveContent: detail });
              }}
            >
              <i className="pencil alternate icon" />
              Edit
              </button>
          </div>
        )
    );
  }



  drivesData = () => {
    let details = this.state.driveDetails;
    if (details.length === 0) {
      return (
        <tr>
          <td colSpan={5}>It's Lonely Here</td>
        </tr>
      );
    }
    return (
      details.map((detail, driveIndex) => {
        return (
          <tr key={driveIndex}>
            <td>{detail.company}</td>
            <td>
              {
                this.state.driveEditDetail === driveIndex ? (
                  <select
                    className="ui search dropdown"
                    defaultValue={detail.round_name}
                    onChange={e => {
                      detail.round_name = e.target.value;

                    }}
                  >
                    {this.state.rounds.map(selection => {
                      return (<option value={selection.round_name}>{selection.round_name}</option>)
                    })}
                  </select>
                ) : (
                    detail.round_name
                  )}
            </td>
            <td>
              {this.state.driveEditDetail === driveIndex ? (
                <select
                  className="ui search dropdown"
                  defaultValue={detail.selected}
                  onChange={e => {
                    detail.selected = e.target.value;
                  }}
                >
                  {this.state.selectionStatus.map((selection, index) => (
                    <option key={index} value={selection}>{selection}</option>
                  ))}
                </select>
              ) : (
                  detail.selected
                )}
            </td>
            <td>
              {this.state.driveEditDetail === driveIndex ? (
                <select
                  className="ui search dropdown"
                  defaultValue={detail.offer_letter}
                  onChange={e => {
                    detail.offer_letter = e.target.value;

                  }}
                >
                  {this.state.offerStatus.map(selection => (
                    <option value={selection}>{selection}</option>
                  ))}
                </select>
              ) : (
                  detail.offer_letter
                )}
            </td>
            <td>{this.driveButtonHandle(detail, driveIndex)}</td>
          </tr>
        )
      })
    );


  }

  sendData = () => {
    console.log("Send data")
    let data = { students: [{ HTNO: this.state.rollNumber }], driveToAdd: this.state.drive_id }

    tnpbase
      .post('/students/addToDrive', { data })
      .then((res) => {
        if(res.status === 200){
          this.setState({ submitError : false,
          submitStatus : "Update succesfull",
          statusCode: 1});
          this.getStudentData();
        }
    })
      .catch((err) => {
        console.log(err);
        this.setState({ submitError: true, submitStatus: err.message });  
      })
  }

  displayForm = () => {
    let driveMenu = this.state.drives.map((drives, index) => (
      <option key={index} value={drives.drive_id}>{drives.company} {new Date(drives.date_of_drive).toLocaleDateString('en-GB')}</option>
    ));
    return (
      this.state.showForm ? (
        <div className="ui form">
          <label>Select Drive : </label>
          <select
            className="ui search dropdown"
            value={this.state.drive_id}
            onChange={e => {
              this.setState({ drive_id: e.target.value });
            }}
          >
            <option value="">Select Drive</option>
            {driveMenu}

          </select>
          <br />
          <button
            className="ui secondary button"
            onClick={this.sendData}
          >
            Add
            </button>
          <br />
        </div>

      ) : (
          ""
        )
    )

  }

  enableForm = () => {

    tnpbase
      .get('/drives/upcoming')
      .then((result) => {
        this.setState({ drives: result.data.result });
      })
      .catch((err) => {
        console.log(err);
      })
    const curr = this.state.showForm;
    this.setState({ showForm: !curr });
  }

  render() {
    return (
      <div>
        <div className="ui container">
          <h3 className="ui center aligned icon header">
            <i className="search icon" />
            <div className="content">
              Search Student
              <div className="sub header">Details of Student</div>
            </div>
          </h3>
          <div className="ui action input">
            <input
              type="text"
              placeholder="Enter roll no."
              value={this.state.rollNumber}
              onChange={e => {
                this.setState({ rollNumber: e.target.value });
              }}
            />
            <button
              className="ui secondary button"
              onClick={this.getStudentData}
            >
              Search
            </button>
          </div>
        </div>
        <div className="ui container">
          <div className="message-display">
            <br />
            {this.displayMessage()}
          </div>
        </div>
        <div>
          <br />
          <div className="ui container">
            <table className="ui blue table">
              <caption style={{ fontSize: '25px', height: "25px" }}>Personal Details</caption>
              <thead>
                <tr>
                  <th>Detail</th>
                  <th>Content</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>{this.personalData()}</tbody>
            </table>
          </div>
        </div>

        <div>
          <br />
          <div className="ui container">
            <table className="ui blue table">
              <caption style={{ fontSize: '25px', height: "25px" }}>Drive Details</caption>
              <thead>
                <tr>
                  <th>Drive</th>
                  <th>Round Name</th>
                  <th>Selected</th>
                  <th>Offer Letter</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>{this.drivesData()}</tbody>
            </table>
          </div>
          <br />
          <div className="ui container">
            <div className="ui buttons"
              style={{
                float: "right",
                verticalAlign: "middle",
                marginBottom: "5px"
              }}>
              <button
                className="ui secondary button "
                onClick={
                  this.enableForm
                }
              >
                Add to Drive
          </button>
            </div>
            <div>
              <br />
              <br />
              {this.displayForm()}
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default SearchStudent;

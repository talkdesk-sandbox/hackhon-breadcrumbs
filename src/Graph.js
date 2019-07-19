import React, { Fragment, PureComponent } from "react";
import NeoVis from 'neovis.js/dist/neovis.js';
import useWindowSize from 'react-use/lib/useWindowSize';
import Confetti from 'react-confetti';
import SlidingPane from 'react-sliding-pane';
import ReactJson from "react-json-view"
import 'react-sliding-pane/dist/react-sliding-pane.css';
import Dropdown from 'react-dropdown'
import 'react-dropdown/style.css'
import neo4j from 'neo4j-driver'

class Graph extends PureComponent {
  
  constructor() {
    super();
    this.state = {
      isLoading: true,
      currentInteractionID: "5d31bc15d2562700045be1f5",
      graphQuery: this.getQueryByInteractionID("5d31bc15d2562700045be1f5"),
      paneOpen: false,
      options: null
    }
    this.getList()
    this.search = this.search.bind(this);
    this.handleInputUpdate = this.handleInputUpdate.bind(this);
  }

  componentDidMount() {
    const config = {
      container_id: "viz",
      server_url: "bolt://54.226.181.219:7687",
      server_user: "neo4j",
      server_password: "i-089a33b376c7147cb",
      labels: {
        "Events": {
          "caption": "type",
        },
        "Models": {
          "caption": "type"
        },
      },
      nodes: {
        color: {
          background: "#bada55"
        }
      },
      relationships: {
        Uses: {
          thickness: "weight",
          caption: false
        }
      },
      hierarchical: true,
      initial_cypher: this.state.graphQuery,
    };

    this.viz = new NeoVis(config);

    this.viz.render();
    this.viz.registerOnEvent("completed", () => {
      this.setState({ isLoading: false });
      this.viz._network.on('selectNode', (evt) => {
        if (evt.nodes.length > 0) {
          console.log(this.viz._nodes[evt.nodes[0]]);

          const parsedInfo = JSON.parse(
            this.viz._nodes[evt.nodes[0]].title.split("<strong>payload:</strong>")[1].split("<strong>timestamp:</strong>")[0].replace("<br>", "")
          );
          this.setState({ info: parsedInfo, paneOpen: true });
        }
      });

    });

  }

  getQueryByInteractionID(interactionID) {
    return `MATCH (m {interaction_id: '${interactionID}'})-[r:Uses*]-(c) RETURN c, m, r ORDER by m.timestamp`
  }

  getQueryAllInteractionList() {
    return `MATCH (m:Models) WITH DISTINCT m.interaction_id AS ids RETURN ids`
  }

  handleInputUpdate(evt) {
    this.setState({ currentInteractionID: evt.value });
  }


  search() {
    this.viz.renderWithCypher(this.getQueryByInteractionID(this.state.currentInteractionID));
    this.setState({ isLoading: true });
  }



  getList() {
    var Listaaa =[]
    var driver = neo4j.driver(
      'bolt://54.226.181.219:7687',
      neo4j.auth.basic('neo4j', 'i-089a33b376c7147cb')
    )
    var session = driver.session()
    return session
      .run(`MATCH (m:Models) WITH DISTINCT m.interaction_id AS ids RETURN ids`)
      .then(result => {
        var lista= result.records.map(x => x.get('ids'))
        this.setState({options: lista})
        session.close()
        return Lista
      })
      .catch(function(error) {
      })
  }

  render() {

    console.log(this.state.currentInteractionID)
    return (

      <Fragment>
        {this.state.isLoading ? (
          <Confetti
            width={1000}
            height={1000}
          />
        ) : null}
        <Dropdown options={this.state.options} onChange={this.handleInputUpdate} placeholder="Select an Interaction" />
        <input value={this.state.currentInteractionID} onChange={this.handleInputUpdate} />
        <button onClick={this.search}>Search</button>
        <SlidingPane
          isOpen={this.state.paneOpen}
          from='right'
          width='400px'
          onRequestClose={() => this.setState({ paneOpen: false })}>
          <ReactJson src={this.state.info} theme="bright:inverted" />
        </SlidingPane>
        <div id="viz" style={{ width: "auto", height: "1000px" }} />
      </Fragment>
    );
  }
}

export default Graph;

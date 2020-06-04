/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import ReactDOM from "react-dom";
import { useQuery } from "react-query";

const organismToKingdom = new Map([
  ['dog', 'animal'],
  ['juniper', 'plant'],
  ['mushroom', 'fungi'],
]);

// Intentionally faked query 
const getKingdomQuery = async (key, organism) => {
  await new Promise((res) => setTimeout(res, 500));
  return organismToKingdom.get(organism);
};


const allMistmatchedQueryKeys = [];

// Intentionally faked query
// Returns a list of all the times it was called with mismatched
// organism and kingdom
const getMismatchedQueryKeys = async (key, organism, kingdom) => {
  if (organismToKingdom.get(organism) !== kingdom) {
    allMistmatchedQueryKeys.push({
      organism,
      kingdom,
      time: (new Date()).toISOString(),
    });
  }
  await new Promise((res) => setTimeout(res, 500));
  return [...allMistmatchedQueryKeys];
}


const organisms = [...organismToKingdom.keys()];

function App() {
  const [organism, setOrganism] = React.useState(organisms[0]);

  const handleChange = React.useCallback((event) => setOrganism(event.target.value), []);

  const kingdom = useQuery(
    ['getKingdomQuery', organism],
    getKingdomQuery,
  );

  const mismatchedQueryKeys = useQuery(
    kingdom.data && ['getMismatchedQueryKeys', organism, kingdom.data],
    getMismatchedQueryKeys,
  );

  return (
    <>
      <h1>Ephemeral Dependent Query with Mistmatched Keys</h1>
      <h2>Explantion of Problem</h2>
      <p>
        This app was designed to demonstrate a problem with&nbsp;
        <a href="https://github.com/tannerlinsley/react-query#dependent-queries">
          dependent queries
        </a>
        . Namely, when a dependent query has an&nbsp; 
        {<a href="https://github.com/tannerlinsley/react-query#query-keys">array key</a>}&nbsp;
        where
      </p>
      <ul>
        <li>{`
          one element of the key is dependent on mutable React state (in a React.useState
          sense) of the component
        `}</li>
        <li>{`
          another element of the key is derived from the data of a query which is itself
          relies on the exact same state mentioned above as its query key
        `}</li>
      </ul>
      <p>{`
        the two elements can become mismatched. When the state changes, it does not immediately
        generate a change in the returned data of the first (i.e. non-dependent) query. The first
        (i.e. non-dependent) query still returns a 'success' status and data that corresponds to
        the old value of the state for a single render. This results in the dependent query relying on
      `}</p>
      <ul>
        <li>
          a new state value as one element of the key
        </li>
        <li>
          a stale data value as another element of the key
        </li>
      </ul>
      <p>{`
          If the dependent query in question generates network traffic with these keys, then the
          server will receive a request for a mismatched set of parameters. This generates
          useless requests for the server--which can increase load, generate meaningless errors,
          etc.
      `}</p>
      <h2>Demo of Problem</h2>
      <p>{`
        Select an organism below. The app will make a query for the organism's kingdom
        based on the orgnaism's name. Note the correct nams and classes are below:
      `}</p>
      <ul>
        {[...organismToKingdom.entries()].map(([organism, kingdom]) => (
          <li key={organism}>A {organism} is a {kingdom}</li>
        ))}
      </ul>
      <p>{`
        Then the app will make a dependent query using both the
        organism's name and kingdom. When the two are mismatched, the app will report
        the mismatch.
      `}</p>
      <h3>Selection</h3>
      <label>
        Organism:
        <select value={organism} onChange={handleChange}>
          {organisms.map(
            (organism) => <option key={organism }value={organism}>{organism}</option>,
          )}
        </select>
      </label>
      <h3>Reported Mismatches</h3>
      <ul>
        {mismatchedQueryKeys.data?.map(
          (mqk) => (
            <li key={mqk.time}>{`
              At ${mqk.time}, queried for organism ${mqk.organism} and kingdom
              ${mqk.kingdom}
            `}</li>
          ),
        )}
      </ul>
    </>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

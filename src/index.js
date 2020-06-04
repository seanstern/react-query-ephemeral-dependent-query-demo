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

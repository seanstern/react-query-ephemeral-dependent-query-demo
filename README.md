# Motivation
This app was designed to demonstrate a problem with [dependent queries](https://github.com/tannerlinsley/react-query#dependent-queries). Namely, when a dependent query has an [array key](https://github.com/tannerlinsley/react-query#query-keys) where
- one element of the key is dependent on mutable React state (in a React.useState sense) of the component
- another element of the key is derived from the data of a query which is itself relies on the exact same state mentioned above as its query key
the two elements can become mismatched.

The code below outlnes the setup:
```javascript
const [state, setState] = React.useState(/*some value*/); 
const queryA = useQuery(['queryA', state], networkReqA);
// In this generalzed example state and queryA.data can become mismatched
// when state changes
const queryB = useQuery(queryA.data && ['queryB', state, queryA.data], networkReqB);
```
When the state changes, it does not immediately generate a change in the returned data of the first (i.e. non-dependent) query. In the above example, this means that when `state` changes to a new value, `queryA` does not immediately change. Instead, `queryA` initially returns the same `status` (i.e. `success`) and the same `data` (i.e. whatever was returned for the previous value of state). Only subsquenet renders *after the initial change* result in a change to `queryA`.

This results in the dependent query relying on
- a *new* state value as one element of the key
- a *stale* data value as another element of the key

If the dependent query in question generates network traffic with these keys, then the server will receive a request for a mismatched set of parameters (i.e. *new state* and *stale data*). This generates useless requests for the server--which can increase load, generate meaningless errors, etc.

# Getting Started

To run this example:

- `npm install` or `yarn`
- `npm run start` or `yarn start`

The app will show a single selection menu of organisms, each which beloing to a different kingdom.
- A dog is a animal
- A juniper is a plant
- A mushroom is a fungi

Each time the user selects a new organism, the app will make a query for the organism's kingdom based on the organism's name. This is the non-dependent query.

Then the app will make a query using the selected organism and the kingdom returned from the non-dependent query. When the two demonstrate a mismatch (i.e. the dependent query consists of an organism and a kingdom that do not match), the app will report the mismatch.

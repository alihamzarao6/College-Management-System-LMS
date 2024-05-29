// store.js
import {
  legacy_createStore as createStore,
  applyMiddleware,
  compose,
} from "redux";
import {thunk} from "redux-thunk";
import { reducers } from "./reducers";

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const mystore = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

export default mystore;

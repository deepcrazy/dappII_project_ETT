import React, { Suspense, useEffect, useState } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import Layout from "./hoc/Layout";
import { useSelector } from "react-redux";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
// loaded conditionally using code splitting below (https://reactjs.org/docs/code-splitting.html)
const LoginPage = React.lazy(() => {
  return import("./container/LoginPage/LoginPage");
});
const AdminPage = React.lazy(() => {
  return import("./container/AdminPage/AdminPage");
});
const UserPage = React.lazy(() => {
  return import("./container/UserPage/UserPage");
});

const App = () => {
  const account = useSelector(state => {
    return state.account;
  });

  const [type, setType] = useState("");
  const userType = { type, setType };
  let route = null;
  
  //on page load, set account for contract interaction
  useEffect(() => {
    if (account) {
      // loaded conditionally using code splitting below (https://reactjs.org/docs/code-splitting.html)
      // solves the issue if metamask is not present
      // Note: has to implement in coming future

      // import("./scripts/eventTicketingTokenInteract").then(func => {
      //   func
      //     .isEventOwner()
      //     .then(result => setCheckOwner(result))
      //     .catch(error => console.log(error));
      // });
    }
  }, [account]);

  //setting up routes depending on logged in or not
  if (!account) {
    route = (
      <Switch>
        <Route path="/login" render={() => <LoginPage userType={userType} />} />
        <Redirect to="/login" />
      </Switch>
    );
  } else {
    //if owner, set the route type for admin, else look at other cases
    // if (checkOwner) {
      route = (
        <Switch>
          <Route path="/admin" render={() => <AdminPage />} />
          <Redirect to="/admin" />
        </Switch>
      );
    // } else {
      switch (userType.type) {
        case "user":
          route = (
            <Switch>
              <Route path="/dashboard" render={() => <UserPage />} />
              <Redirect to="/dashboard" />
            </Switch>
          );
          break;
        // case "admin":
        //   //if admin submitted, but checkOwner failed, reset to user login
        //   userType.setType("user");
        //   break;
        case "admin":
          route = (
            <Switch>
              <Route path="/admin" render={() => <AdminPage />} />
              <Redirect to="/admin" />
            </Switch>
          );
        break;
        default:
      }
    // }
  }
  return (
    <Layout>
      <Suspense
        fallback={
          <Backdrop open={true}>
            <CircularProgress color="secondary" />
          </Backdrop>
        }
      >
        {route}
      </Suspense>
    </Layout>
  );
};

export default App;

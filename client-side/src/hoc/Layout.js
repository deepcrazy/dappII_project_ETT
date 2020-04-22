import React from "react";
import { useLocation } from "react-router-dom";
import Navigation from "../components/NavigationBar/NavigationBar";
function Layout(props) {
  const location = useLocation(); //temporary fix to get current location in App component - need to find a better way?
  const [heading, setHeading] = React.useState("");

  //setup the header bar name
  React.useEffect(() => {
    // console.log(location);
    const nameHeadingPair = {
      "/admin": "Admin Dashboard",
      "/dashboard": "User Dashboard",
      "/shareholder": "Shareholder"
    };

    if (nameHeadingPair[location.pathname]) {
      setHeading(nameHeadingPair[location.pathname]);
    } else {
      setHeading("");
    }
  }, [location]);

  return (
    <div>
      <Navigation label={heading} />
      <main>{props.children}</main>
    </div>
  );
}

export default Layout;

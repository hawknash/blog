import React, { useContext } from "react";
import { Link, useHistory } from "react-router-dom";
import { Usercontext } from "../App";
const NavBar = () => {
  const history = useHistory();
  const { state, dispatch } = useContext(Usercontext);
  const renderList = () => {
    if (state) {
      return [
        <li>
          <Link to="/profile">Profile</Link>
        </li>,
        <li>
          <Link to="/create">Create Post</Link>
        </li>,

        <li>
          <Link to="/followingPost">Following Posts</Link>
        </li>,
        <li>
          <button
            className="btn waves-effect waves-light #3949ab indigo darken-1"
            type="submit"
            name="action"
            onClick={() => {
              localStorage.clear();
              dispatch({ type: "CLEAR" });
              history.push("/signin");
            }}
          >
            Logout
          </button>
        </li>,
      ];
    } else {
      return [
        <li>
          <Link to="/signin">Login</Link>
        </li>,
        <li>
          <Link to="/signup">Signup</Link>
        </li>,
      ];
    }
  };

  return (
    <nav>
      <div className="nav-wrapper white">
        <Link to={state ? "/" : "/signin"} className="brand-logo left">
          Blogger
        </Link>
        <ul id="nav-mobile" className="right hide-on-med-and-down">
          {renderList()}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;

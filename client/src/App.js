import React, { Fragment, useEffect } from "react"
import { BrowserRouter as Router, Route, Switch } from "react-router-dom"
import "./App.css"
import Navbar from "./components/layout/Navbar"
import Landing from "./components/layout/Landing"
import Register from "./components/Auth/Register"
import Login from "./components/Auth/Login"
import Alert from "./components/layout/alert"
import CreateProfile from "./components/profile-form/createProfile"
import EditProfile from "./components/profile-form/editProfile"
import Profiles from "./components/profiles/profiles"
import Profile from "./components/profile/profile"
import Posts from "./components/posts/Posts"
import Post from "./components/post/Post"
import AddExperience from "./components/profile-form/addExperience"
import AddEducation from "./components/profile-form/addEducation"
import Dashboard from "./components/dashboard/dashboard"
import PrivateRouting from "./components/routes/PrivateRouting"
import { Provider } from "react-redux"
import store from "./store"
import { loadUser } from "./actions/auth"
import setAuthToken from "./util/setAuthToken"
if (localStorage.token) {
  setAuthToken(localStorage.token)
}

const App = () => {
  useEffect(() => {
    store.dispatch(loadUser())
  }, [])

  return (
    <Provider store={store}>
      <Router>
        <Fragment>
          <Navbar />
          <Route exact path="/" component={Landing} />
          <section className="container">
            <Alert />
            <Switch>
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/profiles" component={Profiles} />
              <Route exact path="/profile/:id" component={Profile} />
              <PrivateRouting exact path="/dashboard" component={Dashboard} />
              <PrivateRouting
                exact
                path="/create-profile"
                component={CreateProfile}
              />
              <PrivateRouting
                exact
                path="/edit-profile"
                component={EditProfile}
              />
              <PrivateRouting
                exact
                path="/add-experience"
                component={AddExperience}
              />
              <PrivateRouting
                exact
                path="/add-education"
                component={AddEducation}
              />
              <PrivateRouting exact path="/posts" component={Posts} />
              <PrivateRouting exact path="/post/:id" component={Post} />
            </Switch>
          </section>
        </Fragment>
      </Router>
    </Provider>
  )
}

export default App

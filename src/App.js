import React from 'react';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import MaterialTable from './components/MaterialTable';
import SignInSide from './components/SignInSide';
import { AuthContext } from './components/context';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));
const PrivateRoute = ({ isLoggedIn, ...props }) => {
  return (isLoggedIn ? <Route {...props} /> : <Redirect to={"/login"} />);
}

function App() {
  const initialLoginState = {
    token: null,
  };
  const loginReducer = (state, action) => {
    switch (action.type) {
      case 'RETRIEVE_TOKEN':
        localStorage.setItem('USER_TOKEN', action.payload);
        return {
          ...state, token: action.payload
        }
      case 'LOGOUT':
        return {
          ...state, token: null
        };
      default: return state;
    }
  };
  const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);
  const [isLoaded, setIsLoaded] = React.useState(false);
  React.useEffect(() => {
    const token = localStorage.getItem('USER_TOKEN');
    if (token) {
      axios.post("http://localhost:8080/verify", {
        token
      }).then( res => {
        if (res.data.ok) {
          console.log(res.data);
          dispatch({ type: 'RETRIEVE_TOKEN', payload: res.data.jwttoken });
        }
      }).finally(() => setIsLoaded(true));
    } else {
      setIsLoaded(true);
    }
    
  }, []);
  const authContext = React.useMemo(() => ({
    signIn: async (token) => {
      dispatch({ type: 'RETRIEVE_TOKEN', payload: token });
    },
    signOut: () => dispatch({ type: 'LOGOUT' })
  }), []);

  console.log(process.env.REACT_APP_BASE_URL);
  const classes = useStyles();
  if (!isLoaded) {
    return (
        <div className={classes.root}>
          <CircularProgress color="secondary" />
        </div>
    );
  }
  return (
    <AuthContext.Provider value={authContext}>
        <Router>
            <PrivateRoute exact={true} isLoggedIn={loginState.token != null} path="/" component={MaterialTable} />
            <PrivateRoute isLoggedIn={loginState.token != null} path="/project" component={MaterialTable} />
            <Route  path="/login" component={SignInSide}/>
        </Router>
    </AuthContext.Provider>
  );
}

export default App;

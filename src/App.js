import React from 'react';
import './App.css';
import { makeStyles } from '@material-ui/core/styles';
import SignInSide from './components/SignInSide';
import { AuthContext } from './components/context';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import { LinearProgress, Snackbar, AppBar, Button, MenuItem, Toolbar, Menu } from '@material-ui/core';
import { Alert } from './common';
import LanguageIcon from '@material-ui/icons/Language';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { useTranslation } from 'react-i18next';
import { createStore, combineReducers } from 'redux';
import project from './reducers/ProjectReducer'
import { Provider } from 'react-redux';
import ProjectList from './containers/ProjectList';

const store = createStore(combineReducers({ project }));


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
  toolBar: {
    justifyContent: 'flex-end'
  },
  languageBar: {
    outline: '0 !important'
  }
}));
const PrivateRoute = ({ isLoggedIn, ...props }) => {
  return (isLoggedIn ? <Route {...props} /> : <Redirect to={"/login"} />);
}

function App() {
  const initialLoginState = {
    token: null,
    error: {
      open: false,
      message: ''
    },
    success: {
      open: false,
      message: ''
    },
    progress: false
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
      case 'SHOW_ERROR':
        return {
          ...state, error: {
            open: true,
            message: action.payload
          }
        }
      case 'HIDE_ERROR':
        return {
          ...state, error: {
            ...state.error, open: false
          }
        }
      case 'SHOW_PROGRESS':
        return {
          ...state, progress: true
        }
      case 'HIDE_PROGRESS':
        return {
          ...state, progress: false
        }
      default: return state;
    }
  };
  const languages = [{
    code: 'en',
    name: 'English'
  }, {
    code: 'ja',
    name: 'Japanese'
  }, {
    code: 'vi',
    name: 'Tiếng Việt'
  }];
  const [loginState, dispatch] = React.useReducer(loginReducer, initialLoginState);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [language, setLanguage] = React.useState(languages[0]);
  // eslint-disable-next-line
  const [t, i18n] = useTranslation('common');
  const open = Boolean(anchorEl);

  const authContext = React.useMemo(() => ({
    signIn: async (token) => {
      dispatch({ type: 'RETRIEVE_TOKEN', payload: token });
    },
    signOut: () => dispatch({ type: 'LOGOUT' }),
    showError: (message) => {
      dispatch({ type: 'SHOW_ERROR', payload: message });
    },
    hideError: () => {
      dispatch({ type: 'HIDE_ERROR' });
    },
    showSuccess: (message) => {
      dispatch({ type: 'SHOW_SUCCESS', payload: message });
    },
    showProgress: () => {
      dispatch({ type: 'SHOW_PROGRESS' });
    },
    hideProgress: () => {
      dispatch({ type: 'HIDE_PROGRESS' });
    }
  }), []);
  React.useEffect(() => {
    axios.interceptors.request.eject(0);
    axios.interceptors.request.use(config => {
      authContext.showProgress();
      config.headers.Authorization = localStorage.getItem('USER_TOKEN');
      config.headers['Accept-Language'] = language.code;
      return config;
    }, error => {
      // handle the error
      authContext.hideProgress();
      return Promise.reject(error);
    });
    axios.interceptors.response.use(res => {
      authContext.hideProgress();
      return res;
    }, error => {
      // handle the error
      authContext.hideProgress();
      if (error.response) {
        authContext.showError(error.response.data);
      } else {
        authContext.showError("Unexpected error had been occured");
      }
      return Promise.reject(error);
    });
  }, [authContext, language]);
  React.useEffect(() => {
    axios.defaults.timeout = 3 * 60 * 60 * 1000; // timeout is 3 minutes
    const token = localStorage.getItem('USER_TOKEN');
    if (token) {
      fetch(process.env.REACT_APP_VERIFY_URL, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token
        })
      }).then(res => {
        return res.json();
      }).then(res => {
        if (res && res.ok) {
          dispatch({ type: 'RETRIEVE_TOKEN', payload: res.jwttoken });
        }
      }).finally(() => setIsLoaded(true));
    } else {
      setIsLoaded(true);
    }

  }, []);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const changeLanguage = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang.code);
    handleClose();
  }
  const classes = useStyles();
  if (!isLoaded) {
    return (
      <div className={classes.root}>
        <CircularProgress color="secondary" />
      </div>
    );
  }
  return (
    <Provider store={store}>
      <AuthContext.Provider value={authContext}>
        <AppBar position="static">
          <Toolbar className={classes.toolBar}>
            <Button
              className={classes.languageBar}
              color="inherit"
              onClick={handleMenu}
              startIcon={<LanguageIcon />}
              endIcon={<ExpandMoreIcon />}
            >
              {language.name}
            </Button>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={open}
              onClose={handleClose}
            >
              {languages.map(lang => (<MenuItem key={lang.code} onClick={() => changeLanguage(lang)}>{lang.name}</MenuItem>))}
            </Menu>
          </Toolbar>
        </AppBar>
        <Router>
          <PrivateRoute exact={true} isLoggedIn={loginState.token != null} path="/" component={ProjectList} />
          <PrivateRoute isLoggedIn={loginState.token != null} path="/project" component={ProjectList} />
          <Route path="/login" component={SignInSide} />
        </Router>
        <Snackbar open={loginState.success.open} autoHideDuration={6000} >
          <Alert className="animate__animated animate__fadeInUpBig" onClose={authContext.hideError} severity="success">
            {loginState.success.message}
          </Alert>
        </Snackbar>
        <Snackbar open={loginState.error.open} autoHideDuration={6000} >
          <Alert className="animate__animated animate__fadeInUpBig" onClose={authContext.hideError} severity="error">
            {loginState.error.message}
          </Alert>
        </Snackbar>
        {loginState.progress && <LinearProgress className="app-progress" color="secondary" />}
      </AuthContext.Provider>
    </Provider>
  );
}

export default App;

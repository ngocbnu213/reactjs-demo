import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import { AuthContext } from './context';
import { useHistory } from 'react-router-dom';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
let jwt_decode = require('jwt-decode');

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://material-ui.com/">
                Your Website
      </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: 'url(https://source.unsplash.com/random)',
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export default function SignInSide() {
    const classes = useStyles();
    const [username, setUsername] = React.useState({
        value: '',
        invalid: false,
        errorMessage: ''
    });
    const [password, setPassword] = React.useState({
        value: '',
        invalid: false,
        errorMessage: ''
    });
    const [error, setError] = React.useState({
        visible: false,
        message: '',
    });
    const { signIn } = React.useContext(AuthContext);
    const history = useHistory();
    const hideErrorMessage = () => {
        if (error.visible) {
            setError({
                visible: false,
                message: ''
            });
        }
    }
    const validateUsername = (event) => {
        const value = event.target.value;
        if (value) {
            setUsername({
                value: value,
                invalid: false,
                errorMessage: ''
            });
            // hide error message
            hideErrorMessage();
        } else {
            setUsername({
                value: value,
                invalid: true,
                errorMessage: 'Username can not be blank'
            });
        }
    }
    const validatePassword = (event) => {
        const value = event.target.value;
        if (value) {
            setPassword({
                value: value,
                invalid: false,
                errorMessage: ''
            });
            // hide error message
            hideErrorMessage();
        } else {
            setPassword({
                value: value,
                invalid: true,
                errorMessage: 'Password can not be blank'
            });
        }
    }
    const logIn = (event) => {
        event.preventDefault();
        if (!username.value || !password.value) {
            return;
        }
        axios.post(process.env.REACT_APP_LOGIN_URL,{
            username: username.value,
            password: password.value
        }).then(res => {
            console.log(jwt_decode(res.data.jwttoken));
            signIn(res.data.jwttoken).then(() => history.push("/"));
        }).catch(err => {
            if (err.response) {
                setError({
                    visible: true,
                    message: err.response.data
                });
            }
        });
    }
    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
          </Typography>
                    <form className={classes.form} onSubmit={logIn}>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            value={username.value}
                            error={username.invalid}
                            helperText={username.errorMessage}
                            onChange={validateUsername}
                            onBlur={validateUsername}
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            value={password.value}
                            error={password.invalid}
                            helperText={password.errorMessage}
                            onChange={validatePassword}
                            onBlur={validatePassword}
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Remember me"
                        />
                        {error.visible && <Alert severity="error">{error.message}</Alert>}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={logIn}
                        >
                            Sign In
            </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link href="#" variant="body2">
                                    Forgot password?
                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="#" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                        <Box mt={5}>
                            <Copyright />
                        </Box>
                    </form>
                </div>
            </Grid>
        </Grid>
    );
}
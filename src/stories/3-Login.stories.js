import React from 'react';
import { storiesOf } from '@storybook/react';
import SignInSide from '../components/SignInSide';

storiesOf('General', module)
  .add('Login', () => <SignInSide />);
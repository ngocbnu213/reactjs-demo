import React from 'react';
import { storiesOf } from '@storybook/react';
import MaterialTable from '../components/MaterialTable';

storiesOf('Material UI', module)
  .add('Override Default Components', () => <MaterialTable />);
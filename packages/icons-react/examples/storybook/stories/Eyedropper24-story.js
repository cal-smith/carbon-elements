import React from 'react';
import { storiesOf } from '@storybook/react';
import Eyedropper24 from '../../../es/eyedropper/24.js';

storiesOf('Eyedropper24', module)
  .add('default', () => <Eyedropper24 />)
  .add('with accessibility label', () => (
    <Eyedropper24 aria-label="Accessibility label" />
  ))
  .add('with title', () => (
    <Eyedropper24 aria-label="Icon label">
      <title>Icon title</title>
    </Eyedropper24>
  ));
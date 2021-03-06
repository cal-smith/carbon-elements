/**
 * Copyright IBM Corp. 2015, 2018
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const { reporter } = require('@carbon/cli-reporter');
const { paramCase } = require('change-case');
const fs = require('fs-extra');
const path = require('path');
const prettier = require('prettier');
const { colors } = require('../lib');

const SCSS_DIR = path.resolve(__dirname, '../scss');
const COLORS_ENTRYPOINT = path.join(SCSS_DIR, 'colors.scss');
const MIXINS_ENTRYPOINT = path.join(SCSS_DIR, 'mixins.scss');
const GENERATED_COMMENT = '// Code generated by @carbon/colors. DO NOT EDIT.';
const NAMESPACE = 'carbon';
const prettierOptions = {
  parser: 'scss',
  printWidth: 80,
  singleQuote: true,
};

async function build() {
  reporter.info('Building scss files for colors...');

  // Colors has the shape:
  // type Colors = {
  //   [swatch: string]: {
  //     [grade: string]: string,
  //   }
  // };
  //
  // We want to convert this into a flat array of variable descriptors that we
  // can use to create mixins. This flat array will look like:
  // type ColorValues = Array<{ name: string, value: string }>
  const colorValues = Object.keys(colors).reduce((acc, key) => {
    const swatch = paramCase(key);
    const values = Object.keys(colors[key]).reduce((acc, grade) => {
      const name = `${swatch}-${grade}`;
      const value = colors[key][grade];
      return acc.concat({
        swatch,
        grade,
        value,
      });
    }, []);

    return acc.concat(...values);
  }, []);

  const colorVariables = colorValues.map(({ grade, swatch, value }) => {
    return `$${swatch}-${grade}: ${value} !default !global;`;
  });

  const deprecatedColorVariables = colorValues.map(
    ({ grade, swatch, value }) => {
      return `$ibm-color__${swatch}-${grade}: ${value} !default !global;`;
    }
  );

  const namespacedColorVariables = colorValues.map(
    ({ grade, swatch, value }) => {
      return `$carbon--${swatch}-${grade}: ${value} !default !global;`;
    }
  );

  let deprecatedColorMap = `$ibm-color-map: (\n`;
  for (const swatch of Object.keys(colors)) {
    deprecatedColorMap += `  '${swatch}': (\n`;

    for (const grade of Object.keys(colors[swatch])) {
      deprecatedColorMap += `    ${grade}: ${colors[swatch][grade]},\n`;
    }

    deprecatedColorMap += `  ),\n`;
  }
  deprecatedColorMap += ') !default !global;';

  let colorMap = `$carbon--colors: (\n`;
  for (const swatch of Object.keys(colors)) {
    colorMap += `  '${swatch}': (\n`;

    for (const grade of Object.keys(colors[swatch])) {
      colorMap += `    ${grade}: ${colors[swatch][grade]},\n`;
    }

    colorMap += `  ),\n`;
  }
  colorMap += ') !default !global;';

  const mixins = `${GENERATED_COMMENT}

// Deprecated ☠️
@mixin ibm--colors {
  ${deprecatedColorVariables.join('\n')}

  ${deprecatedColorMap}
}

@mixin ${NAMESPACE}--colors {
${namespacedColorVariables.join('\n')}
${colorVariables.join('\n')}
${colorMap}
}
`;

  await fs.ensureDir(SCSS_DIR);
  await fs.writeFile(
    MIXINS_ENTRYPOINT,
    prettier.format(mixins, prettierOptions)
  );

  const colorsFile = `${GENERATED_COMMENT}

@import './mixins';

// Deprecated ☠️
@include ibm--colors();
// Preferred
@include ${NAMESPACE}--colors();
`;

  await fs.writeFile(
    COLORS_ENTRYPOINT,
    prettier.format(colorsFile, prettierOptions)
  );

  reporter.success('Done! 🎉');
}

build().catch(error => {
  console.error(error);
});

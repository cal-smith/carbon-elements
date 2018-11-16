import { storiesOf, moduleMetadata } from "@storybook/angular";

import { IconModule } from "./../../../ts";
import { ElementRef } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

storiesOf("Icons", module)
  .addDecorator(moduleMetadata({
    imports: [ IconModule, BrowserModule ],
  }))
  .add("icon", () => ({
    template: "<ibm-icon-add32></ibm-icon-add32>"
  }));

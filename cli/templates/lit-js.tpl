import { LitElement } from 'lit';
import {render, styles} from "./{{dashname}}.tpl.js";

export default class {{camelname}} extends LitElement {

  static get properties() {
    return {
      
    }
  }

  static get styles() {
    return styles();
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

}

customElements.define('{{dashname}}', {{camelname}});
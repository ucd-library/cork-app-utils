import { LitElement } from 'lit-element';
import render from "./{{dashname}}.tpl.js"


export default class {{camelname}} extends LitElement {

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this.render = render.bind(this);
  }

}

customElements.define('{{dashname}}', {{camelname}});

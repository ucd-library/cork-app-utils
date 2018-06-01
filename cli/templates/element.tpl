import {PolymerElement, html} from "@polymer/polymer"
import template from "./{{dashname}}.html"

export default class {{camelname}} extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

}

customElements.define('{{dashname}}', {{camelname}});
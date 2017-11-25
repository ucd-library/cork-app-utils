import {Element as PolymerElement} from "@polymer/polymer/polymer-element"
import template from "./{{dashname}}.html"

export default class {{camelname}} extends PolymerElement {

  static get template() {
    return template;
  }

  static get properties() {
    return {
      
    }
  }

}

customElements.define('{{dashname}}', {{camelname}});
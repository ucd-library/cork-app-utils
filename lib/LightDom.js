const LightDom = subclass =>
  class LightDomMixin extends subclass {

  _attachDom(dom) {
    if( window.ShadyDOM && window.ShadyDOM.inUse ) {
      return super._attachDom(dom);
    }
    
    // promote element styles to head
    let styles = dom.querySelectorAll('style');
    for( var i = 0; i < styles.length; i++ ) {
      styles[i].parentNode.removeChild(styles[i]);
      if( this._stylesInserted ) continue;
      styles[i].setAttribute('id', this.nodeName.toLowerCase()+'-styles');
      document.head.appendChild(styles[i]);
    }
    // append dom template to local dom (instead of a shadowroot)
    this.appendChild(dom);
    return dom;
  }

  querySelector(selector) {
    if( this.shadowRoot ) {
      return this.shadowRoot.querySelector(selector);
    }
    return super.querySelector(selector);
  }

  querySelectorAll(selector) {
    if( this.shadowRoot ) {
      return this.shadowRoot.querySelectorAll(selector);
    }
    return super.querySelectorAll(selector);
  }

}

export default LightDom
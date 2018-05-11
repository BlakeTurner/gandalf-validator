import React from 'react';
import * as validator from './validator';

class FormElement {
  constructor(props) {
    if (!props) throw 'field object is required';

    this.name = props.name;
    this.key = props.name;
    this.component = props.component;
    this.validators = props.validators;
    this.errorPropName = props.errorPropName;
    this.errorPropIsBool = props.errorPropIsBool;
    this.originalProps = props.props;
    this.onUpdate = props.onUpdate;
    this.debounce = props.debounce;
    this.getValueInOnChange = props.getValueInOnChange;
    this.onChangeHandler = props.onChangeHandler || 'onChange';
    this.children = props.children;

    this.pristine = true;
    this.errorMessage = '';
    this.value = props.defaultValue || '';
    this.timeOut = null;
    this.element = this.createReactElement();
  }

  createReactElement() {
    const props = Object.assign({}, this.originalProps, this.buildElementProps());
    return React.createElement(
      this.component,
      Object.assign({}, this.originalProps, this.buildElementProps()),
      this.children
    );
  }

  buildElementProps() {
    return {
      name: this.name,
      key: this.key,
      [this.onChangeHandler]: this.createChangeListener(),
      [this.errorPropName]: this.errorPropIsBool ? !!this.errorMessage : this.errorMessage,
      value: this.value,
    };
  }

  createChangeListener() {
    return (e, key, value) => {
      this.handleChange({
        value: this.getValueInOnChange ? this.getValueInOnChange(e, key, value) : e.target.value
      });
    }
  }

  handleChange({ value, skipDebounce }) {
    this.pristine = false;
    this.value = value;

    if (this.debounce && !skipDebounce) {
      this.handleDebounce();
    } else {
      this.validate();
    }

    this.element = this.createReactElement();
    console.log('element', this.element);
    this.onUpdate(this);
  }

  handleDebounce() {
    clearTimeout(this.timeOut);

    this.timeOut = setTimeout(() => {
      this.validate();
      this.element = this.createReactElement();
      this.onUpdate(this);
    }, this.debounce);
  }

  validate() {
    const validationResult = validator.validate(this.validators, this.value);
    this.errorMessage = validationResult.errorMessage;
  }
}

export default FormElement;

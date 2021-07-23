import React from 'react';
import { VegaLiteProps } from 'react-vega/lib/VegaLite';
import { PlainObject, View, ViewListener } from 'react-vega';
import { NOOP } from '../constants';
import { isFunction } from './utils';
import VegaEmbed from 'react-vega/lib/VegaEmbed';
import { vega } from 'vega-embed';

export type BifrostVegaProps = VegaLiteProps & {
  onNewView?: ViewListener;
};

const EMPTY = {};

export default class BifrostVega extends React.PureComponent<BifrostVegaProps> {
  vegaEmbed = React.createRef<VegaEmbed>();

  static defaultProps = {
    data: EMPTY,
  };

  componentDidMount() {
    this.update();
  }

  componentDidUpdate(prevProps: BifrostVegaProps) {
    if (!this.shallowEqual(this.props.data, prevProps.data)) {
      this.update();
    }
  }

  shallowEqual(a: PlainObject = EMPTY, b: PlainObject = EMPTY): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    return (
      aKeys.length === bKeys.length && aKeys.every((key) => a[key] === b[key])
    );
  }

  handleNewView: ViewListener = (view: View) => {
    this.update();
    const { onNewView = NOOP } = this.props;
    onNewView(view);
  };

  update() {
    const { data } = this.props;

    if (this.vegaEmbed.current && data && Object.keys(data).length > 0) {
      this.vegaEmbed.current.modifyView((view) => {
        this.updateMultipleDatasetsInView(view, data);
        view.resize().run();
      });
    }
  }

  updateMultipleDatasetsInView(view: View, data: PlainObject) {
    Object.keys(data).forEach((name) => {
      this.updateSingleDatasetInView(view, name, data[name]);
    });
  }

  updateSingleDatasetInView(view: View, name: string, value: unknown) {
    if (value) {
      if (isFunction(value)) {
        value(view.data(name));
      } else {
        view.change(
          name,
          vega
            .changeset()
            .remove(() => true)
            .insert(value)
        );
      }
    }
  }

  render() {
    const { data, ...restProps } = this.props;

    return (
      <VegaEmbed
        ref={this.vegaEmbed}
        {...restProps}
        onNewView={this.handleNewView}
        mode="vega-lite"
      />
    );
  }
}

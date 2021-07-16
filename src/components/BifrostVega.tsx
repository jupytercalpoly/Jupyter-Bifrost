import React from 'react';
import shallowEqual from 'react-vega/src/utils/shallowEqual';
import updateMultipleDatasetsInView from 'react-vega/src/utils/updateMultipleDatasetsInView';
import VegaEmbed from 'react-vega/src/VegaEmbed';
import { VegaLiteProps } from 'react-vega/lib/VegaLite';
import { View, ViewListener } from 'react-vega/src/types';
import { NOOP } from 'react-vega/src/constants';

export type BifrostVegaProps = VegaLiteProps & {
  onNewView?: ViewListener;
};

const EMPTY = {};

export default class Vega extends React.PureComponent<BifrostVegaProps> {
  vegaEmbed = React.createRef<VegaEmbed>();

  static defaultProps = {
    data: EMPTY,
  };

  componentDidMount() {
    this.update();
  }

  componentDidUpdate(prevProps: BifrostVegaProps) {
    if (!shallowEqual(this.props.data, prevProps.data)) {
      this.update();
    }
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
        updateMultipleDatasetsInView(view, data);
        view.resize().run();
      });
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

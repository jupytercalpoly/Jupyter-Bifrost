/** @jsx jsx */
import { jsx, css, ThemeProvider, Global } from '@emotion/react';

import { useState } from 'react';
import { WidgetModel } from '@jupyter-widgets/base';
import {
  useModelState,
  Args,
  BifrostModelContext,
} from '../hooks/bifrost-model';
import theme from '../theme';
import OnboardingWidget from './Onboarding/OnboardingWidget';
import VisualizationScreen from './VisualizationScreen';

const globalStyles = (theme: any) => css`
  // Global styles for the widget
  //===========================================================
  * {
    box-sizing: border-box;
  }

  button {
    cursor: pointer;
    transition: transform 0.4s;
    background-color: ${theme.color.primary.dark};
    color: white;
    font-weight: 700;
    padding: 10px 15px;
    border-radius: 7px;
    font-size: 16px;
    border: none;

    &:active {
      transform: scale(0.95);
    }

    &.wrapper {
      border: none;
      background: transparent;
      margin: 0;
      padding: 0;
      margin-right: 15px;
      color: initial;
    }
  }

  h1 {
    font-size: 35px;
    font-weight: 800;
    margin: 10px 0;
    margin-bottom: 15px;
  }

  h2 {
    font-size: 25px;
    font-weight: 800;
  }
`;

interface BifrostReactWidgetProps {
  model: WidgetModel;
}

export default function BifrostReactWidget(props: BifrostReactWidgetProps) {
  return (
    <ThemeProvider theme={theme}>
      <BifrostModelContext.Provider value={props.model}>
        <Global styles={globalStyles} />
        <BifrostReactWidgetDisplay />
      </BifrostModelContext.Provider>
    </ThemeProvider>
  );
}

function BifrostReactWidgetDisplay() {
  const args = useModelState<Args>('plot_function_args')[0];

  const [screenName, setScreenName] = useState<string>(
    !(args['x'] && args['y'])
      ? 'columnChooser'
      : !args['kind']
      ? 'chartChooser'
      : 'straight_visualize'
  );
  return (
    <div
      className="bifrost-widget-display"
      style={{ width: 'calc(100vw - 200px)' }}
    >
      {screenName === 'straight_visualize' ? (
        <VisualizationScreen />
      ) : (
        <OnboardingWidget
          screenName={screenName}
          setScreenName={setScreenName}
          args={args}
        />
      )}
    </div>
  );
}

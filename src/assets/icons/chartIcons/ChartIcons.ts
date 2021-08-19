import ScatterChartIcon from './ScatterChartIcon';
import BarChartIcon from './BarChartIcon';
import LineChartIcon from './LineChartIcon';
// import PieChartIcon from './PieChartIcon';
import TickChartIcon from './TickChartIcon';
import BoxPlotChartIcon from './BoxPlotChartIcon';
// import CircleChartIcon from './CircleChartIcon';
import ErrorBandChartIcon from './ErrorBandChartIcon';
// import SquareChartIcon from './SquareChartIcon';
import ErrorBarChartIcon from './ErrorBarChartIcon';
import { VegaMark } from '../../../modules/VegaEncodings';

export const chartIcons: { icon: typeof BarChartIcon; mark: VegaMark }[] = [
  { icon: BarChartIcon, mark: 'bar' },
  { icon: ScatterChartIcon, mark: 'point' },
  { icon: LineChartIcon, mark: 'line' },
  // { icon: PieChartIcon, mark: 'arc' },
  { icon: TickChartIcon, mark: 'tick' },
  { icon: BoxPlotChartIcon, mark: 'boxplot' },
  // { icon: CircleChartIcon, mark: 'circle' },
  { icon: ErrorBandChartIcon, mark: 'errorband' },
  { icon: ErrorBarChartIcon, mark: 'errorbar' },
  // { icon: SquareChartIcon, mark: 'square' },
];

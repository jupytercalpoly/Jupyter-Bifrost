/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import ScatterChartIcon from '../../assets/icons/ScatterChartIcon';
import BarChartIcon from '../../assets/icons/BarChartIcon';
import LineChartIcon from '../../assets/icons/LineChartIcon';
import PieChartIcon from '../../assets/icons/PieChartIcon';
import TickChartIcon from '../../assets/icons/TickChartIcon';
import { BifrostTheme } from '../../theme';
import theme from '../../theme';

const chartFilters = [
  { icon: BarChartIcon, mark: 'bar' },
  { icon: ScatterChartIcon, mark: 'point' },
  { icon: LineChartIcon, mark: 'line' },
  { icon: PieChartIcon, mark: 'arc' },
  { icon: TickChartIcon, mark: 'tick' },
];

const chartFilterCss = (theme: BifrostTheme) => css`
  list-style: none;
  margin: 5px;
  padding: 15px;
  border-radius: 50px;
  background-color: white;
  box-shadow: ${theme.shadow.handle};
  li {
    padding: 0;
    margin: 10px 0;
  }
`;

interface ChartFilterProps {
  activeMarks: Set<string>;
  availableMarks: Set<string>;
  onChange: (marks: Set<string>) => void;
}

export default function ChartFilter({
  onChange,
  activeMarks,
  availableMarks,
}: ChartFilterProps) {
  function toggleMark(mark: string) {
    const markSet = new Set(activeMarks);
    if (markSet.has(mark)) {
      markSet.delete(mark);
    } else {
      markSet.add(mark as string);
    }
    onChange(markSet);
  }

  return (
    <ul css={chartFilterCss}>
      {chartFilters
        .filter(({ mark }) => availableMarks.has(mark))
        .map(({ mark, icon: Icon }) => (
          <li key={mark}>
            <button className="wrapper" onClick={() => toggleMark(mark)}>
              <Icon
                color={
                  activeMarks.has(mark) ? theme.color.primary.dark : '#bbbbbb'
                }
              />
            </button>
          </li>
        ))}
    </ul>
  );
}

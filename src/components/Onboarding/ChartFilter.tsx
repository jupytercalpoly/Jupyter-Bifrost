/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { BifrostTheme } from '../../theme';
import theme from '../../theme';
import { chartIcons } from '../../assets/icons/chartIcons/ChartIcons';

const chartFilterCss = (theme: BifrostTheme) => css`
  margin: 5px;

  h3 {
    margin: 0;
    text-align: center;
  }

  ul {
    list-style: none;
    padding: 15px;
    border-radius: 15px;
    background-color: white;
    border: 1px solid #e0e0e0;
    margin: 7px 0;
    li {
      padding: 0;
      margin: 10px 0;
    }
  }
`;

interface ChartFilterProps {
  filteredMark: string;
  availableMarks: Set<string>;
  onChange: (mark: string) => void;
}

export default function ChartFilter({
  onChange,
  filteredMark,
  availableMarks,
}: ChartFilterProps) {
  function toggleMark(mark: string) {
    onChange(mark === filteredMark ? '' : mark);
  }

  return (
    <div className="ChartFilter" css={chartFilterCss}>
      <h3>Filter</h3>
      <ul>
        {chartFilters
          .filter(({ mark }) => availableMarks.has(mark))
          .map(({ mark, icon: Icon }) => (
            <li key={mark}>
              <button className="wrapper" onClick={() => toggleMark(mark)}>
                <Icon
                  color={
                    mark === filteredMark ? theme.color.primary.dark : '#bbbbbb'
                  }
                />
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
}

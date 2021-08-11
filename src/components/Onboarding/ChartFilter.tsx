/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { chartIcons } from '../../assets/icons/chartIcons/ChartIcons';
import { BifrostTheme } from '../../theme';
import theme from '../../theme';

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
      {chartIcons
        .filter(({ mark }) => availableMarks.has(mark))
        .map(({ mark, icon: Icon }) => (
          <li>
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

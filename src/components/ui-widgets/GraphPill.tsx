/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import { X } from 'react-feather';
import theme from '../../theme';

interface GraphPillProps {
  onClose: () => void;
  onAggregationSelected: () => void;
  onFilterSelected: () => void;
  position: number;
  [other: string]: any;
}
export default function GraphPill(props: GraphPillProps) {
  const { onClose, position, ...rest } = props;
  const color = theme.color.pill[position % theme.color.pill.length];

  const borderRaidus = '5px';

  const graphPillCss = css`
    .pill-header {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 10px;
      border-radius: 20px;
      background-color: ${color};
      border-radius: ${borderRaidus};
      overflow: hidden;
      background-color: white;
      box-shadow: ${theme.shadow.handle};

      .divider {
        height: 30px;
        width: 2px;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .pill
  `;

  return (
    <li css={graphPillCss} {...rest}>
      <div className="pill-header">
        <div className="divider"></div>
        <div className="divider"></div>
        <button className="wrapper" onClick={onClose}>
          <X />
        </button>
      </div>
    </li>
  );
}

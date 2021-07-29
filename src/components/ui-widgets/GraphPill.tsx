/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import { X } from 'react-feather';
import theme from '../../theme';
import NumericalIcon from '../../assets/NumericalIcon';
import FilterIcon from '../../assets/FilterIcon';
import CategoryIcon from '../../assets/CategoryIcon';
import AggregateIcon from '../../assets/AggregateIcon';

const typeIconMap: Record<string, typeof NumericalIcon> = {
  quantitative: NumericalIcon,
  nominal: CategoryIcon,
};

interface GraphPillProps extends React.LiHTMLAttributes<HTMLLIElement> {
  onClose: () => void;
  onAggregationSelected: () => void;
  onFilterSelected: () => void;
  position: number;
  type: string;
  encoding: string;
  filters: string[];
  aggregation: string;
  field: string;
}
export default function GraphPill(props: GraphPillProps) {
  const {
    onClose,
    position,
    type,
    encoding,
    field,
    filters,
    aggregation,
    ...rest
  } = props;
  const color = theme.color.pill[position % theme.color.pill.length];
  const TypeIcon = type in typeIconMap ? typeIconMap[type] : FilterIcon;

  const borderRaidus = '5px';

  const graphPillCss = css`
    list-style: none;
    background: white;
    border-radius: ${borderRaidus};
    width: min-content;
    margin: 5px;
    box-shadow: ${theme.shadow.handle};

    .pill-header {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
      background-color: ${color};
      border-radius: ${borderRaidus};
      overflow: hidden;
      span {
        white-space: nowrap;
        margin: 0 5px;
      }
      .divider {
        height: 30px;
        width: 2px;
        color: rgba(0, 0, 0, 0.6);
      }
    }

    .modifiers {
      display: flex;
      align-items: center;
      justify-content: start;
      padding: 8px;

      button.wrapper {
        background-color: transparent;
        transition: background-color 0.3s;
        border-radius: 4px;
        margin-bottom: -2px;
        padding: 1px;
        &:hover {
          background-color: ${theme.color.primary.light};
        }
      }

      .filter-list {
        list-style: none;
        padding: 0 5px;
        li {
          margin-bottom: 7px;
          padding: 0;
          white-space: nowrap;
          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  `;

  return (
    <li css={graphPillCss} {...rest}>
      <div className="pill-header">
        <TypeIcon />
        <div className="divider"></div>
        <span>{encoding}</span>
        <div className="divider"></div>
        <span>{field}</span>
        <button className="wrapper" onClick={onClose}>
          <X size={15} />
        </button>
      </div>
      <div className="modifiers">
        <button className="wrapper" onClick={props.onFilterSelected}>
          <FilterIcon />
        </button>
        <ul className="filter-list">
          {filters.map((filter) => (
            <li>{filter}</li>
          ))}
        </ul>
        <button
          className="wrapper"
          onClick={props.onAggregationSelected}
          style={{ marginLeft: 10 }}
        >
          <AggregateIcon />
        </button>
        <div style={{ padding: '0 5px' }}>{aggregation}</div>
      </div>
    </li>
  );
}

/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import produce from 'immer';

import { PlusCircle } from 'react-feather';
import { useEffect, useState } from 'react';
import {
  EncodingInfo,
  GraphSpec,
  useModelState,
} from '../../../hooks/bifrost-model';
import useSpecHistory from '../../../hooks/useSpecHistory';
import { VegaEncoding, vegaEncodingList } from '../../../modules/VegaEncodings';
import Pill from '../../ui-widgets/Pill';
import SearchBar from '../../ui-widgets/SearchBar';
import FilterScreen from './FilterScreen';
import {
  deleteSpecFilter,
  getFilterList,
  stringifyFilter,
} from '../../../modules/VegaFilters';
import GraphPill from '../../ui-widgets/GraphPill';

const variableTabCss = css`
  position: relative;
  width: 100%;
  height: 100%;
  .encoding-list,
  .encoding-choices {
    margin: 0;
    padding: 0;

    .encoding-wrapper {
      display: flex;
      b {
        margin-right: 5px;
      }
    }
  }

  .encoding-list {
    display: flex;
    flex-wrap: wrap;
  }

  .encoding-choices {
    background-color: whitesmoke;
    max-height: 150px;
    overflow: auto;
  }
  .columns-list {
    list-style: none;
    padding: 0;

    .column-el {
      padding: 10px;
      transition: background-color 0.5s;
      background-color: white;
      &:hover {
        background-color: whitesmoke;
      }
    }
  }
`;
const sortedEncodingList = [...vegaEncodingList];
sortedEncodingList.sort();
export default function VariablesTab({
  clickedAxis,
  updateClickedAxis,
}: {
  clickedAxis: VegaEncoding | '';
  updateClickedAxis: (encoding: VegaEncoding | '') => void;
}) {
  const columns = useModelState('df_columns')[0];
  const columnTypes = useModelState('column_types')[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(
    columns.map((choice, index) => ({ choice, index }))
  );
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const [activeEncoding, setActiveEncoding] = useState<VegaEncoding | ''>('');
  const [showEncodings, setShowEncodings] = useState(false);
  const [filterEncoding, setFilterEncoding] = useState<VegaEncoding | ''>('');

  useEffect(() => {
    setActiveEncoding(clickedAxis);
  }, [clickedAxis]);
  const saveSpecToHistory = useSpecHistory();
  // A list of GraphPill Props. Defined separately from spec to prevent reordering during user edits.
  const [pillsInfo, setPillsInfo] = useState<PillState[]>([]);

  // Set initial pills based off of spec.
  useEffect(() => {
    setPillsInfo(extractPillProps(graphSpec));
  }, []);

  // update pill filters and aggregations on spec change
  useEffect(updatePillFilters, [graphSpec]);

  const updateField = (field: string) => {
    if (activeEncoding === '') {
      return;
    }
    const dtype = columnTypes[field];
    const newSpec = produce(graphSpec, (gs) => {
      (gs.encoding[activeEncoding] as EncodingInfo) = {
        field: field,
        type: dtype,
      };
    });
    const newPillsInfo = produce(pillsInfo, (info) => {
      const pill = info.find((pill) => pill.encoding === activeEncoding);
      if (!pill) {
        return;
      }
      pill.field = field;
      pill.type = dtype;
    });
    setGraphSpec(newSpec);

    if (clickedAxis) {
      updateClickedAxis('');
    }
    saveSpecToHistory(newSpec);
    setPillsInfo(newPillsInfo);
    setActiveEncoding('');
  };

  function updatePillFilters() {
    setPillsInfo((pillsInfo) =>
      produce(pillsInfo, (info) => {
        info.forEach((config) => {
          config.filters = [];
          config.aggregation =
            graphSpec.encoding[config.encoding as VegaEncoding]?.aggregate ||
            '';
        });
        getFilterList(graphSpec).forEach((filter) => {
          // Apply filters to all pills with the same field
          info.forEach((config) => {
            if (config.field !== filter.field) {
              return;
            }
            config.filters.push(...stringifyFilter(filter));
          });
        });
      })
    );
  }

  function deletePill(pillState: PillState) {
    const encoding = pillState.encoding as VegaEncoding;
    const isFilter = pillState.type === 'filter';

    // Remove all filters associated with the pill
    let newSpec = deleteSpecFilter(
      graphSpec,
      pillState.field,
      columnTypes[pillState.field] === 'quantitative' ? 'range' : 'oneOf',
      { deleteCompound: true }
    );

    // Remove encodings if the pill has them
    if (!isFilter) {
      newSpec = produce(newSpec, (gs) => {
        delete gs.encoding[encoding];
      });
    }

    // Update the pill list accordingly
    const newPills = produce(pillsInfo, (info) => {
      const searchFunc = isFilter
        ? (pill: PillState) =>
            pill.encoding === '' && pill.field === pillState.field
        : (pill: PillState) => pill.encoding === encoding;
      const i = info.findIndex(searchFunc);
      if (i === -1) {
        return;
      }

      info.splice(i, 1);
    });
    setPillsInfo(newPills);
    setGraphSpec(newSpec);

    if (encoding === activeEncoding) {
      updateClickedAxis('');
    }
  }

  function openFilters(encoding: VegaEncoding) {
    setFilterEncoding(encoding);
  }

  function addEncoding(encoding: VegaEncoding) {
    if (graphSpec.encoding[encoding]) {
      return;
    }
    const newSpec = produce(graphSpec, (gs) => {
      if (activeEncoding) {
        (gs.encoding[encoding] as EncodingInfo) =
          gs.encoding[activeEncoding as VegaEncoding];
        delete gs.encoding[activeEncoding];
      } else {
        (gs.encoding[encoding] as EncodingInfo) = {
          field: '',
          type: '',
        };
      }
      setShowEncodings(false);
    });

    const newPills = produce(pillsInfo, (info) => {
      if (activeEncoding) {
        const i = pillsInfo.findIndex(
          (pill) => pill.encoding === activeEncoding
        );
        if (i === -1) {
          return;
        }
        info[i].encoding = encoding;
      } else {
        info.push({
          field: '',
          encoding,
          aggregation: '',
          type: '',
          filters: [],
        });
      }
    });

    console.log(newPills);
    setPillsInfo(newPills);
    setGraphSpec(newSpec);
    setActiveEncoding('');
  }

  const encodingList = pillsInfo.map((props, i) => (
    <GraphPill
      onClose={() => deletePill(props)}
      onAggregationSelected={() => openFilters(props.encoding as VegaEncoding)}
      onFilterSelected={() => openFilters(props.encoding as VegaEncoding)}
      onEncodingSelected={() => {
        setActiveEncoding(props.encoding as VegaEncoding);
        setShowEncodings((show) => !show);
      }}
      onFieldSelected={() => {
        setActiveEncoding((encoding) =>
          encoding === props.encoding ? '' : (props.encoding as VegaEncoding)
        );
      }}
      position={i}
      key={i}
      {...props}
    />
  ));

  encodingList.push(
    <button
      className="wrapper"
      style={{ margin: '0 10px' }}
      onClick={() => setShowEncodings(true)}
    >
      <PlusCircle />
    </button>
  );

  return (
    <section className="VariablesTab" css={variableTabCss}>
      <ul className="encoding-list">{encodingList}</ul>
      {showEncodings && (
        <ul className="encoding-choices">
          {sortedEncodingList.map((encoding) => (
            <Pill onClick={() => addEncoding(encoding)}>
              <span style={{ padding: '3px 10px' }}>{encoding}</span>
            </Pill>
          ))}
        </ul>
      )}
      {activeEncoding && (
        <div>
          <SearchBar
            choices={columns}
            onChange={setSearchQuery}
            value={searchQuery}
            onResultsChange={setSearchResults}
            placeholder="Search Columns"
          />
          <ul className="columns-list">
            {searchResults.map(({ choice: col }) => {
              return (
                <li
                  className="column-el"
                  key={col}
                  onClick={() => updateField(col)}
                >
                  {col}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {filterEncoding && (
        <FilterScreen
          encoding={filterEncoding}
          onBack={() => setFilterEncoding('')}
        />
      )}
    </section>
  );
}

interface PillState {
  encoding: string;
  type: string;
  filters: string[];
  aggregation: string;
  field: string;
}
type PillMap = Record<string, PillState[]>;

/**
 * Converts a graph spec to a list of GraphPill props.
 */
function extractPillProps(spec: GraphSpec) {
  // Get all of the encodings
  const pillsByField = Object.entries(spec.encoding).reduce(
    (pillMap, [encoding, info]) => {
      const field = info.field;
      const pillConfig = {
        field,
        encoding,
        aggregation: info.aggregate || '',
        type: info.type,
        filters: [],
      };
      pillMap[field]
        ? pillMap[field].push(pillConfig)
        : (pillMap[field] = [pillConfig]);
      return pillMap;
    },
    {} as PillMap
  );
  // Add all of the filters to existing encodings
  // and create entries for pure filters.
  getFilterList(spec).forEach((filter) => {
    if (filter.field in pillsByField) {
      pillsByField[filter.field].forEach((config) =>
        config.filters.push(...stringifyFilter(filter))
      );
    } else {
      pillsByField[filter.field] = [
        {
          field: filter.field,
          encoding: '',
          aggregation: '',
          type: 'filter',
          filters: stringifyFilter(filter),
        },
      ];
    }
  });
  return Object.values(pillsByField).flat();
}

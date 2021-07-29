/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import produce from 'immer';
import { useEffect } from 'react';
import { useState } from 'react';
import { Filter, PlusCircle, XCircle } from 'react-feather';
import { EncodingInfo, useModelState } from '../../../hooks/bifrost-model';
import { useMemo, useState } from 'react';
import { PlusCircle } from 'react-feather';
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
import { getFilterList, stringifyFilter } from '../../../modules/VegaFilters';
import GraphPill from '../../ui-widgets/GraphPill';

const variableTabCss = css`
  position: relative;
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
  const pillsInfo = useMemo(() => extractPillProps(graphSpec), [graphSpec]);

  const updateEncodings = (column: string) => {
    if (activeEncoding === '') {
      return;
    }
    const dtype = columnTypes[column];

    const newSpec = produce(graphSpec, (gs) => {
      if (gs.encoding[activeEncoding]) {
        const info = gs.encoding[activeEncoding] as EncodingInfo;
        info.field = column;
        info.type = dtype;
      }
      (gs.encoding[activeEncoding] as EncodingInfo) = {
        field: column,
        type: dtype,
      };
    });
    setGraphSpec(newSpec);

    if (clickedAxis === '') {
      setActiveEncoding('');
    } else {
      updateClickedAxis('');
    }
  };

  function deleteEncoding(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    encoding: VegaEncoding
  ) {
    event.stopPropagation();
    if (!graphSpec.encoding[encoding]) {
      return;
    }
    const newSpec = produce(graphSpec, (gs) => {
      delete gs.encoding[encoding];
    });
    setGraphSpec(newSpec);

    if (encoding === activeEncoding) {
      updateClickedAxis('');
    }
  }

  function openFilters(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    encoding: VegaEncoding
  ) {
    event.stopPropagation();
    setFilterEncoding(encoding);
  }

  function addEncoding(encoding: VegaEncoding) {
    if (graphSpec.encoding[encoding]) {
      return;
    }
    const newSpec = produce(graphSpec, (gs) => {
      (gs.encoding[encoding] as EncodingInfo) = {
        field: '',
        type: '',
      };
      setShowEncodings(false);
    });
    setGraphSpec(newSpec);
    setActiveEncoding(encoding);
  }

  // function selectEncoding(encoding: VegaEncoding) {
  //   setActiveEncoding((e) => (e === encoding ? '' : encoding));
  // }

  const encodingList = pillsInfo.map((props, i) => (
    <GraphPill
      onClose={() => deleteEncoding(props.encoding as VegaEncoding)}
      onAggregationSelected={() => openFilters(props.encoding as VegaEncoding)}
      onFilterSelected={() => openFilters(props.encoding as VegaEncoding)}
      position={i}
      key={i}
      {...props}
    />
  ));

  encodingList.push(
    <button className="wrapper" onClick={() => setShowEncodings(true)}>
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
              onClick={() => updateEncodings(col)}
            >
              {col}
            </li>
          );
        })}
      </ul>
      {filterEncoding && (
        <FilterScreen
          encoding={filterEncoding}
          onBack={() => setFilterEncoding('')}
        />
      )}
    </section>
  );
}

type PillMap = Record<
  string,
  {
    encoding: string;
    type: string;
    filters: string[];
    aggregation: string;
    field: string;
  }
>;

function extractPillProps(spec: GraphSpec) {
  // Get all of the encodings
  spec.encoding['x'].aggregate;
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
      pillMap[field] = pillConfig;
      return pillMap;
    },
    {} as PillMap
  );
  // Add all of the filters to existing encodings
  // and create entries for pure filters.
  getFilterList(spec).forEach((filter) => {
    if (filter.field in pillsByField) {
      pillsByField[filter.field].filters.push(...stringifyFilter(filter));
    } else {
      pillsByField[filter.field] = {
        field: filter.field,
        encoding: '',
        aggregation: '',
        type: 'filter',
        filters: stringifyFilter(filter),
      };
    }
  });

  return Object.values(pillsByField);
}

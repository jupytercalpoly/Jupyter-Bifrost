/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import produce from 'immer';
import { useState } from 'react';
import { Filter, PlusCircle, XCircle } from 'react-feather';
import {
  GraphSpec,
  EncodingInfo,
  useModelState,
  QuerySpec,
} from '../../../hooks/bifrost-model';
import { VegaEncoding, vegaEncodingList } from '../../../modules/VegaEncodings';
import Pill from '../../ui-widgets/Pill';
import SearchBar from '../../ui-widgets/SearchBar';
import FilterScreen from './FilterScreen';

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
export default function VariablesTab() {
  const columns = useModelState<string[]>('df_columns')[0];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(
    columns.map((choice, index) => ({ choice, index }))
  );
  const querySpec = useModelState<QuerySpec>('query_spec')[0];
  const [graphSpec, setGraphSpec] = useModelState<GraphSpec>('graph_spec');
  const [activeEncoding, setActiveEncoding] = useState<VegaEncoding | ''>('');
  const [showEncodings, setShowEncodings] = useState(false);
  const [filterEncoding, setFilterEncoding] = useState<VegaEncoding | ''>('');

  const updateEncodings = (column: string) => {
    if (activeEncoding === '') {
      return;
    }
    const dtype = querySpec.spec.encodings
      .filter((encoding: any) => encoding.field === column)
      .map((encoding: any) => encoding.type)[0];
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
  };

  function deleteEncoding(encoding: VegaEncoding) {
    if (!graphSpec.encoding[encoding]) {
      return;
    }
    const newSpec = produce(graphSpec, (gs) => {
      delete gs.encoding[encoding];
    });
    setGraphSpec(newSpec);
  }

  function openFilters(encoding: VegaEncoding) {
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

  function selectEncoding(encoding: VegaEncoding) {
    setActiveEncoding((e) => (e === encoding ? '' : encoding));
  }

  const encodingList = Object.entries(graphSpec.encoding).map(
    ([encoding, col]) => (
      <Pill
        active={activeEncoding === encoding}
        onClick={() => selectEncoding(encoding as VegaEncoding)}
      >
        <button
          className="wrapper"
          onClick={() => deleteEncoding(encoding as VegaEncoding)}
        >
          <XCircle size={20} />
        </button>
        <div className="encoding-wrapper">
          <b>{encoding}:</b>
          <span>{col.field}</span>
        </div>

        <button
          className="wrapper"
          onClick={() => openFilters(encoding as VegaEncoding)}
        >
          <Filter size={20} />
        </button>
      </Pill>
    )
  );

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

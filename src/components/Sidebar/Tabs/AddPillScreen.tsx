/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { X } from 'react-feather';
import { useModelState, EncodingInfo } from '../../../hooks/bifrost-model';
import { VegaEncoding, VegaMark } from '../../../modules/VegaEncodings';
import { vegaMarkEncodingMap } from '../../../modules/VegaEncodings';
import Pill from '../../ui-widgets/Pill';
import SearchBar from '../../ui-widgets/SearchBar';
import produce from 'immer';
import { PillState } from './EditTab';
import useSpecHistory from '../../../hooks/useSpecHistory';
import { addDefaultFilter } from '../../../modules/VegaFilters';
import { hasDuplicateField } from '../../../modules/utils';
import { BifrostTheme } from '../../../theme';
import { useEffect } from 'react';

const addPillScreenCss = (theme: BifrostTheme) => css`
  button {
    background: transparent;
    color: initial;
  }

  .cancel-button {
    float: right;
  }

  .datafield-button {
    border-radius: 0 7px 7px 0;
  }

  .variable-button {
    border-radius: 7px 0 0 7px;
  }

  .datafield-button,
  .variable-button {
    background-color: ${theme.color.primary.light};
    color: ${theme.color.primary.dark};
    flex: 1 1 50%;
    font-weight: normal;
    padding: 6px;

    &.selected {
      background-color: ${theme.color.primary.dark};
      color: white;
      font-weight: bold;
    }
  }
`;

interface AddPillScreenProps {
  pillsInfo: PillState[];
  updatePillState: (newPillsInfo: PillState[]) => void;
  onPrevious: () => void;
}

export default function AddPillScreen(props: AddPillScreenProps) {
  const [selectedEncoding, setSelectedEncoding] = useState<VegaEncoding | ''>(
    ''
  );
  const [selectedDataField, setSelectedDataField] = useState<string>('');
  const [columnTypes] = useModelState('column_types');
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const [data] = useModelState('graph_data');
  const saveSpecToHistory = useSpecHistory();
  const [currentScreen, setCurrentScreen] = useState<string>('var');

  useEffect(() => {
    selectedEncoding !== '' && selectedDataField !== '' && addNewPill();
  }, [selectedEncoding, selectedDataField]);

  function switchScreen(screen: string) {
    currentScreen !== screen && setCurrentScreen(screen);
  }

  function updateSelectedEncoding(encoding: VegaEncoding) {
    encoding !== selectedEncoding && setSelectedEncoding(encoding);
  }

  function updateSelectedDataField(field: string) {
    field !== selectedDataField && setSelectedDataField(field);
  }

  function addNewPill() {
    const dtype = columnTypes[selectedDataField];

    // change the encoded field.
    let newSpec = produce(graphSpec, (gs) => {
      if (selectedEncoding !== '') {
        (gs.encoding[selectedEncoding] as EncodingInfo) = {
          field: selectedDataField,
          type: dtype,
        };
      }
    });

    newSpec =
      // check if the filter is being used in another pill
      hasDuplicateField(newSpec, selectedDataField)
        ? // keep the same filter
          newSpec
        : // add default filter
          addDefaultFilter(newSpec, data, dtype, selectedDataField);

    const newPills = produce(props.pillsInfo, (info) => {
      info.push({
        field: selectedDataField,
        encoding: selectedEncoding,
        aggregation: '',
        type: dtype,
        scale: '',
        filters: [],
      });
    });

    props.updatePillState(newPills);
    saveSpecToHistory(
      newSpec,
      `Applied the ${selectedDataField} field to ${selectedEncoding}`
    );
    setGraphSpec(newSpec);
    props.onPrevious();
  }

  return (
    <article className={'add-new-pill-screen'} css={addPillScreenCss}>
      <nav>
        {/* {currentScreen === "datafield" ? } */}
        <button className={'cancel-button'} onClick={props.onPrevious}>
          <X />
        </button>
      </nav>
      <nav style={{ display: 'flex', width: '100%' }}>
        <button
          className={
            currentScreen === 'var'
              ? 'variable-button selected'
              : 'variable-button'
          }
          onClick={() => switchScreen('var')}
        >
          {selectedEncoding === '' ? 'var' : `encoding: ${selectedEncoding}`}
        </button>
        <button
          className={
            currentScreen === 'datafield'
              ? 'datafield-button selected'
              : 'datafield-button'
          }
          onClick={() => switchScreen('datafield')}
        >
          {selectedDataField === ''
            ? 'datafield'
            : `datafield: ${selectedDataField}`}
        </button>
      </nav>
      {currentScreen === 'var' ? (
        <VariableScreen
          updateSelectedEncoding={updateSelectedEncoding}
          onEncodingSelected={switchScreen}
        />
      ) : (
        <DataFieldScreen updateSelectedDataField={updateSelectedDataField} />
      )}
    </article>
  );
}

function VariableScreen({
  updateSelectedEncoding,
  onEncodingSelected,
}: {
  updateSelectedEncoding: (newEncoding: VegaEncoding) => void;
  onEncodingSelected: (screen: string) => void;
}) {
  const [graphSpec] = useModelState('graph_spec');

  function handleEncodingSelected(encoding: VegaEncoding) {
    updateSelectedEncoding(encoding);
    onEncodingSelected('datafield');
  }

  return (
    <ul className="encoding-choices">
      {vegaMarkEncodingMap[graphSpec.mark as VegaMark]
        .filter((encoding) => !(encoding in graphSpec.encoding))
        .map((encoding) => (
          <Pill
            key={encoding}
            onClick={() => handleEncodingSelected(encoding as VegaEncoding)}
          >
            <span style={{ padding: '3px 10px' }}>{encoding}</span>
          </Pill>
        ))}
    </ul>
  );
}

function DataFieldScreen({
  updateSelectedDataField,
}: {
  updateSelectedDataField: (dataField: string) => void;
}) {
  const [columns] = useModelState('df_columns');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(
    columns.map((choice, index) => ({ choice, index }))
  );

  return (
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
              onClick={() => updateSelectedDataField(col)}
            >
              {col}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

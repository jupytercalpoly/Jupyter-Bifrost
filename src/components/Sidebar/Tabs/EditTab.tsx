/** @jsx jsx */
import { css, jsx } from '@emotion/react';
import produce from 'immer';
import { useEffect, useState } from 'react';
import { ChevronUp, PlusCircle } from 'react-feather';
import {
  EncodingInfo,
  GraphData,
  GraphSpec,
  useModelState,
} from '../../../hooks/bifrost-model';
import {
  VegaEncoding,
  vegaMarkEncodingMap,
  BifrostVegaMark,
  VegaMark,
  VegaColumnType,
} from '../../../modules/VegaEncodings';
import useSpecHistory from '../../../hooks/useSpecHistory';
import Pill from '../../ui-widgets/Pill';
import SearchBar from '../../ui-widgets/SearchBar';
import FilterScreen from './FilterScreen';
import {
  deleteSpecFilter,
  getBounds,
  getCategories,
  getFilterList,
  stringifyFilter,
  updateSpecFilter,
  addDefaultFilter,
} from '../../../modules/VegaFilters';
import { hasDuplicateField } from '../../../modules/utils';
import GraphPill from '../../ui-widgets/GraphPill';
import { useRef } from 'react';
import { chartIcons } from '../../../assets/icons/chartIcons/ChartIcons';
import AddPillScreen from './AddPillScreen';
import Slider from '../../ui-widgets/Slider';
import { BifrostTheme } from '../../../theme';
import Tooltip from '../../Tooltip';

//TODO: have only scatter
const variableTabCss = (t: BifrostTheme) => css`
  position: relative;
  width: 100%;
  overflow: scroll;

  h3 {
    .data-section,
    .sampling-section {
      cursor: pointer;
      transition: transform 0.2s ease-in-out;
      &.open,
      &.open {
        transform: rotate(180deg);
      }
    }
  }

  .mark-list {
    list-style: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0;

    button {
      padding: 5px;
      padding-top: 7px;
      border-radius: 5px;
      background: transparent;

      &:disabled {
        opacity: 0.4;
      }

      &.active {
        background: ${t.color.primary.dark};
      }
    }
  }

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
    max-height: 150px;
    overflow: auto;
  }
  .columns-list {
    list-style: none;
    padding: 0;
    height: 300px;
    overflow: auto;

    .column-el {
      padding: 10px;
      transition: background-color 0.5s;
      background-color: white;
      &:hover {
        background-color: whitesmoke;
      }
    }
  }

  .dataset-percentage {
    margin-left: 13px;
    margin-bottom: 5px;
  }
`;

interface ActiveOptions {
  menu: 'encoding' | 'field' | 'filter' | '';
  encoding: VegaEncoding | '';
}

export default function EditTab({
  clickedAxis,
  updateClickedAxis,
}: {
  clickedAxis: VegaEncoding | '';
  updateClickedAxis: (encoding: VegaEncoding | '') => void;
}) {
  const columns = useModelState('df_columns')[0];
  const [columnTypes, setColumnTypes] = useModelState('column_types');
  const graphData = useModelState('graph_data')[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(
    columns.map((choice, index) => ({ choice, index }))
  );
  const [graphMark, setGraphMark] = useState<string>('');
  const [graphSpec, setGraphSpec] = useModelState('graph_spec');
  const [graphDataConfig, setGraphDataConfig] =
    useModelState('graph_data_config');
  const [data] = useModelState('graph_data');
  const [activeOptions, setActiveOptions] = useState<ActiveOptions>({
    menu: '',
    encoding: '',
  });
  const isInitialMount = useRef<boolean>(true);
  const [dataSectionOpen, setDataSectionOpen] = useState<boolean>(true);
  const [samplingSectionOpen, setSamplingSectionOpen] = useState<boolean>(true);
  const [addNewPill, setAddNewPill] = useState<boolean>(false);

  useEffect(() => {
    setActiveOptions((opt) => ({ ...opt, encoding: clickedAxis }));
  }, [clickedAxis]);
  const saveSpecToHistory = useSpecHistory();
  // A list of GraphPill Props. Defined separately from spec to prevent reordering during user edits.
  const [pillsInfo, setPillsInfo] = useState<PillState[]>([]);

  // Set initial pills based off of spec.
  useEffect(() => {
    const newSpec = initializeDefaultFilter(graphSpec, data, columnTypes);
    setGraphSpec(newSpec);
    setPillsInfo(extractPillProps(newSpec));
    if (typeof newSpec.mark === 'object') {
      setGraphMark(newSpec.mark.type);
    } else if (typeof newSpec.mark === 'string') {
      setGraphMark(newSpec.mark);
    }
  }, []);

  // update pill filters and aggregations on spec change
  useEffect(updatePillFilters, [graphSpec]);

  const updateField = (field: string) => {
    if (!activeOptions.encoding) {
      return;
    }
    const dtype = columnTypes[field];
    const oldFieldInfo = graphSpec.encoding[activeOptions.encoding];
    if (oldFieldInfo.field === field)
      return setActiveOptions((opt) => ({ ...opt, menu: '' }));
    let newSpec = graphSpec;
    if (!hasDuplicateField(newSpec, field))
      newSpec = deleteSpecFilter(
        newSpec,
        oldFieldInfo.field,
        oldFieldInfo.type === 'quantitative' ? 'range' : 'oneOf',
        { deleteCompound: true }
      );
    // change the encoded field.
    newSpec = produce(newSpec, (gs) => {
      (gs.encoding[activeOptions.encoding as VegaEncoding] as EncodingInfo) = {
        field: field,
        type: dtype,
      };
    });

    // check if the filter is being used in another pill
    if (!hasDuplicateField(newSpec, field))
      newSpec = addDefaultFilter(newSpec, data, columnTypes, field);

    const newPillsInfo = produce(pillsInfo, (info) => {
      const pill = info.find(
        (pill) => pill.encoding === activeOptions.encoding
      );
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
    saveSpecToHistory(
      newSpec,
      `Assigned the '${field}' field to ${activeOptions.encoding}`
    );
    setPillsInfo(newPillsInfo);
    setActiveOptions((opt) => ({ ...opt, menu: '' }));
  };

  function updatePillFilters() {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setPillsInfo((pillsInfo) =>
      produce(pillsInfo, (info) => {
        info.forEach((config) => {
          config.filters = [];
          config.aggregation =
            graphSpec.encoding[config.encoding as VegaEncoding]?.aggregate ||
            '';
          const scale =
            graphSpec.encoding[config.encoding as VegaEncoding]?.scale?.type;
          config.scale = scale === 'linear' || !scale ? '' : scale;
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
    let newSpec =
      // check if the filter is being used in another pill
      hasDuplicateField(graphSpec, pillState.field)
        ? graphSpec
        : // Remove all filters associated with the pill
          deleteSpecFilter(
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
    saveSpecToHistory(
      newSpec,
      `Removed the ${pillState.field} encoding from the ${newSpec.mark} plot.`
    );

    if (encoding === activeOptions.encoding) {
      updateClickedAxis('');
    }
    setActiveOptions({ menu: '', encoding: '' });
    saveSpecToHistory(newSpec);
  }

  function openFilters(encoding: VegaEncoding) {
    setActiveOptions({ menu: 'filter', encoding });
  }

  function addEncoding(encoding: VegaEncoding) {
    if (graphSpec.encoding[encoding]) {
      return;
    }
    const newSpec = produce(graphSpec, (gs) => {
      if (activeOptions.encoding) {
        (gs.encoding[encoding] as EncodingInfo) =
          gs.encoding[activeOptions.encoding];
        delete gs.encoding[activeOptions.encoding];
      } else {
        (gs.encoding[encoding] as EncodingInfo) = {
          field: '',
          type: '',
        };
      }
    });

    setActiveOptions({ menu: '', encoding: '' });

    const newPills = produce(pillsInfo, (info) => {
      if (activeOptions.encoding) {
        const i = pillsInfo.findIndex(
          (pill) => pill.encoding === activeOptions.encoding
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
          scale: '',
          filters: [],
        });
      }
    });

    setPillsInfo(newPills);
    setGraphSpec(newSpec);
    setActiveOptions((opt) => ({ ...opt, menu: '' }));
  }

  function updateFieldType(field: string, oldType: string) {
    if (typeof graphData[0][field] === 'string') {
      return;
    }
    const newType = oldType === 'nominal' ? 'quantitative' : 'nominal';
    setColumnTypes({
      ...columnTypes,
      [field]: newType,
    });
    setGraphSpec(
      produce(graphSpec, (gs) => {
        const info: any = Object.values(gs.encoding).find(
          (info: any) => info.field === field
        );
        if (!info) {
          return;
        }
        info.type = newType;
      })
    );

    // Update the pill list accordingly
    const newPills = produce(pillsInfo, (info) => {
      const pill = info.find((p) => p.field === field);
      if (!pill) {
        return;
      }
      pill.type = newType;
    });

    setPillsInfo(newPills);
  }

  const encodingList = pillsInfo.map((props, i) => (
    <GraphPill
      onClose={() => deletePill(props)}
      onFilterSelected={() =>
        props.field && openFilters(props.encoding as VegaEncoding)
      }
      onFieldTypeSelected={() => updateFieldType(props.field, props.type)}
      onEncodingSelected={() => {
        const toggledOn =
          activeOptions.encoding !== props.encoding ||
          activeOptions.menu !== 'encoding';
        setActiveOptions({
          menu: toggledOn ? 'encoding' : '',
          encoding: toggledOn ? (props.encoding as VegaEncoding) : '',
        });
      }}
      onFieldSelected={() => {
        setActiveOptions((opt) => {
          const toggledOn =
            opt.encoding !== props.encoding || activeOptions.menu !== 'field';
          return {
            menu: toggledOn ? 'field' : '',
            encoding: toggledOn ? (props.encoding as VegaEncoding) : '',
          };
        });
      }}
      selectedField={
        activeOptions.encoding === props.encoding ? activeOptions.menu : ''
      }
      position={i}
      key={i}
      {...props}
    />
  ));

  encodingList.push(
    <button
      key={'add-new-pill'}
      className="wrapper"
      style={{ margin: '0 10px' }}
      onClick={() => {
        setActiveOptions({ encoding: '', menu: '' });
        setAddNewPill(true);
      }}
    >
      <PlusCircle />
    </button>
  );

  function handleClickOnMark(mark: string) {
    if (mark === graphMark) {
      return;
    }
    const newSpec = produce(graphSpec, (gs) => {
      gs.mark = mark;
    });
    setGraphSpec(newSpec);
    setGraphMark(mark);
    saveSpecToHistory(newSpec, `Updated mark to ${mark}`);
  }

  function handleClickOnChevron(section: string) {
    if (section === 'data') {
      setDataSectionOpen(!dataSectionOpen);
    } else if (section === 'sampling') {
      setSamplingSectionOpen(!samplingSectionOpen);
    }
  }

  function setSamplingThreshold(val: number) {
    setGraphDataConfig({ ...graphDataConfig, sampleSize: Math.floor(val) });
  }

  return (
    <section className="DataTab" css={variableTabCss}>
      {addNewPill ? (
        <AddPillScreen
          pillsInfo={pillsInfo}
          updatePillState={(pillsInfo: PillState[]) => setPillsInfo(pillsInfo)}
          onPrevious={() => setAddNewPill(false)}
        />
      ) : activeOptions.menu === 'filter' ? (
        <FilterScreen
          encoding={activeOptions.encoding as VegaEncoding}
          onBack={() => setActiveOptions({ encoding: '', menu: '' })}
        />
      ) : (
        <article>
          <h3>
            Data
            <div
              className={dataSectionOpen ? 'data-section open' : 'data-section'}
              style={{ display: 'inline-block' }}
              onClick={() => handleClickOnChevron('data')}
            >
              <ChevronUp size={12} />
            </div>
          </h3>
          {dataSectionOpen ? (
            <section>
              <ul className="mark-list">
                {chartIcons.map(({ icon: Icon, mark }) => {
                  return (
                    <li key={mark}>
                      <Tooltip message={mark} position="top">
                        <button
                          className={mark === graphMark ? 'active' : ''}
                          onClick={() => handleClickOnMark(mark)}
                          disabled={!validateMarkChange(mark, graphSpec)}
                        >
                          <Icon
                            color={mark === graphMark ? 'white' : undefined}
                          />
                        </button>
                      </Tooltip>
                    </li>
                  );
                })}
              </ul>
              <ul className="encoding-list">{encodingList}</ul>
              {activeOptions.menu === 'encoding' && (
                <ul className="encoding-choices">
                  {vegaMarkEncodingMap[graphSpec.mark as BifrostVegaMark]
                    .filter((encoding) => !(encoding in graphSpec.encoding))
                    .map((encoding) => (
                      <Pill
                        // key={encoding}
                        onClick={() => addEncoding(encoding as VegaEncoding)}
                      >
                        <span style={{ padding: '3px 10px' }}>{encoding}</span>
                      </Pill>
                    ))}
                </ul>
              )}
              {activeOptions.menu === 'field' && (
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
            </section>
          ) : (
            <section></section>
          )}
          <section>
            <h3>
              Sampling
              <div
                className={
                  samplingSectionOpen
                    ? 'sampling-section open'
                    : 'sampling-section'
                }
                style={{ display: 'inline-block' }}
                onClick={() => handleClickOnChevron('sampling')}
              >
                <ChevronUp size={12} />
              </div>
            </h3>
            {samplingSectionOpen ? (
              <article>
                <p className="dataset-percentage">
                  {Math.round(
                    (graphDataConfig.sampleSize /
                      graphDataConfig.datasetLength) *
                      100
                  )}
                  % of dataset
                </p>
                <Slider
                  value={graphDataConfig.sampleSize}
                  domain={[1, graphDataConfig.datasetLength]}
                  onSlideEnd={setSamplingThreshold}
                  step={1}
                />
              </article>
            ) : (
              <div></div>
            )}
          </section>
        </article>
      )}
    </section>
  );
}

export interface PillState {
  encoding: string;
  type: string;
  filters: string[];
  aggregation: string;
  field: string;
  scale: string;
}
type PillMap = Record<string, PillState[]>;

function initializeDefaultFilter(
  spec: GraphSpec,
  data: GraphData,
  columnTypes: Record<EncodingInfo['field'], EncodingInfo['type']>
): GraphSpec {
  const filters = getFilterList(spec);
  let newSpec = Object.assign({}, spec);
  if (!filters.length) {
    Object.values(newSpec.encoding).map((info) => {
      const field = info.field;
      if (['ordinal', 'nominal'].includes(columnTypes[field])) {
        newSpec = updateSpecFilter(
          newSpec,
          field,
          'oneOf',
          getCategories(data, field)
        );
      } else {
        const range = getBounds(data, field);
        if (isFinite(range[0])) {
          newSpec = updateSpecFilter(newSpec, field, 'range', range);
        }
      }
    });
  }
  return newSpec;
}

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
        scale: info.scale?.type || '',
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
          scale: '',
        },
      ];
    }
  });
  return Object.values(pillsByField).flat();
}

/**
 * Determines whether a given mark is applicable to a GraphSpec.
 * @param mark The new mark option to be validated.
 * @param spec Spec receiving the new mark
 * @returns true if the mark is valid.
 */
function validateMarkChange(mark: VegaMark, spec: GraphSpec): boolean {
  const xAxisType = spec.encoding['x']?.type;
  const yAxisType = spec.encoding['y']?.type;

  const isAxisCombination = (types: (VegaColumnType | undefined)[]) => {
    if (types.length > 1) {
      return (
        (types[0] === xAxisType && types[1] === yAxisType) ||
        (types[1] === xAxisType && types[0] === yAxisType)
      );
    } else if (types.length === 1) {
      return xAxisType === types[0] || yAxisType === types[0];
    } else return false;
  };

  const quantComponents: (VegaColumnType | undefined)[][] = [
    [undefined, 'quantitative'],
    ['nominal', 'quantitative'],
    ['quantitative', 'quantitative'],
  ];

  switch (mark) {
    case 'bar':
      return ![
        [undefined, undefined],
        ['quantitative', undefined],
      ].some((c) => isAxisCombination(c as VegaColumnType[]));
    case 'point':
      return ![
        [undefined, undefined],
        ['nominal', undefined],
      ].some((c) => isAxisCombination(c as VegaColumnType[]));
    case 'line':
      return isAxisCombination(['quantitative', 'quantitative']);
    case 'tick':
      return quantComponents.some(isAxisCombination);
    case 'boxplot':
      return quantComponents.some(isAxisCombination);
    case 'errorband':
      return quantComponents.some(isAxisCombination);
    case 'errorbar':
      return quantComponents.some(isAxisCombination);

    default:
      return true;
  }
}

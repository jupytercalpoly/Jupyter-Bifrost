import React, { useState } from 'react';
import { VegaChart, vegaChartList } from '../../../../modules/VegaEncodings';
import SearchBar from '../../../ui-widgets/SearchBar';
import { CustomizeSubTapProps } from './CustomizationTab';
import { GraphSpec, useModelState } from '../../../../hooks/bifrost-model';
import { PlainObject, VegaLite, VisualizationSpec } from 'react-vega';
import produce from 'immer';

export default function MarkSubTab(props: CustomizeSubTapProps) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [results, setResults] = useState<VegaChart[]>(vegaChartList);
  const data = useModelState<PlainObject>('graph_data', (data) => ({
    data,
  }))[0];

  return (
    <div className="mark-options">
      <SearchBar
        choices={vegaChartList}
        onResultsChange={setResults}
        onChange={setSearchValue}
        value={searchValue}
      />
      {results.map((kind) => {
        const spec = produce(props.spec, (draftSpec: GraphSpec) => {
          draftSpec.mark = kind;
        });
        return (
          <div className={`option_${kind}`} key={kind}>
            <VegaLite spec={spec as VisualizationSpec} data={data} />
            <span>{kind}</span>;
          </div>
        );
      })}
    </div>
  );
}

/**@jsx jsx */

import { jsx, css } from '@emotion/react';
import { View } from 'vega';
import { useModelState } from '../../hooks/bifrost-model';
import Modal from './Modal';

const moreMenuCss = css`
  list-style: none;
  margin: 0;
  padding: 0;
  font-weight: 600;
  li {
    cursor: pointer;
    margin-bottom: 6px;
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

interface MoreMenuProps {
  view?: View;
  position?: [number, number];
  onBack(): void;
}

export default function MoreMenu({
  view,
  position = [0, 0],
  onBack,
}: MoreMenuProps) {
  const dfCode = useModelState('df_code')[0];

  function exportCode() {
    navigator.clipboard.writeText(dfCode);
  }
  function exportImage(type: 'svg' | 'png') {
    view?.toImageURL(type).then(function (url) {
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('target', '_blank');
      link.setAttribute('download', `bifrost_chart.${type}`);
      link.dispatchEvent(new MouseEvent('click'));
    });
  }

  return (
    <Modal position={position} onBack={onBack}>
      <ul css={moreMenuCss}>
        <li onClick={() => exportImage('png')}>Export PNG</li>
        <li onClick={() => exportImage('svg')}>Export SVG</li>
        <li onClick={exportCode}>Copy Code to Clipboard</li>
      </ul>
    </Modal>
  );
}

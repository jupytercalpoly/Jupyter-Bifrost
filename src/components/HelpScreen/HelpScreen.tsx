/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { useState } from 'react';
import { ArrowLeft } from 'react-feather';
import Md from 'react-markdown';
import { BifrostTheme } from '../../theme';
import Modal from '../ui-widgets/Modal';
import {
  chartRecs,
  editChart,
  exportChart,
  addVariable,
  changeEncoding,
  applyOptions,
  changeMarkType,
  accessHistory,
} from './articles';
const screenMap = {
  bifrostRecommendedCharts: () => <Md children={chartRecs} />,
  editChart: () => <Md children={editChart} />,
  exportChart: () => <Md children={exportChart} />,
  addVariable: () => <Md children={addVariable} />,
  changeEncoding: () => <Md children={changeEncoding} />,
  applyOptions: () => <Md children={applyOptions} />,
  changeMarkType: () => <Md children={changeMarkType} />,
  accessHistory: () => <Md children={accessHistory} />,
};
type ScreenName = keyof typeof screenMap | '';

const links: { title: string; screen: ScreenName }[] = [
  { title: 'Bifrost Recommended Charts', screen: 'bifrostRecommendedCharts' },
  { title: 'Edit a Chart', screen: 'editChart' },
  { title: 'Export Chart', screen: 'exportChart' },
  { title: 'Add a Variable', screen: 'addVariable' },
  { title: 'Change an Encoding', screen: 'changeEncoding' },
  { title: 'Apply Variable Options', screen: 'applyOptions' },
  { title: 'Change Mark Type', screen: 'changeMarkType' },
  { title: 'Access History', screen: 'accessHistory' },
];

const helpScreenCss = (t: BifrostTheme) => css`
  nav {
    ul {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    li {
      margin: 0;
    }
  }

  .help-content {
    h2 {
      margin-bottom: 10px;
    }
    ul {
      margin: 5px;
      padding-left: 0;
    }
    li {
      line-height: 20px;
      margin: 10px 0;
    }

    pre {
      background-color: whitesmoke;
      padding: 10px;
      border-radius: 5px;
    }
    blockquote {
      background: ${t.color.primary.light};
      border-left: 3px solid ${t.color.primary.standard};
      margin: 0;
      padding: 10px 20px;
    }
  }
`;
type Position = [number, number];
interface HelpScreenProps {
  position?: Position;
  onDismiss(): void;
}

export default function HelpScreen({
  position = [0, 0],
  onDismiss,
}: HelpScreenProps) {
  const [screen, setScreen] = useState<ScreenName>('');
  return (
    <Modal position={position} onBack={onDismiss} style={{ maxWidth: 330 }}>
      {screen ? (
        <section className="HelpScreen" css={helpScreenCss}>
          <nav className="graph-nav-bar">
            <ul>
              <li>
                <button className="wrapper" onClick={() => setScreen('')}>
                  <ArrowLeft />
                </button>
              </li>
            </ul>
          </nav>
          <div className="help-content">{screenMap[screen]()}</div>
        </section>
      ) : (
        <HelpLinks onLinkClick={setScreen} />
      )}
    </Modal>
  );
}

const helpLinksCss = css`
  h2 {
    margin-bottom: 10px;
  }
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    line-height: 25px;
    a:hover {
      text-decoration: underline;
    }
  }
`;

function HelpLinks(props: { onLinkClick(name: ScreenName): void }) {
  return (
    <section className="HelpLinks" css={helpLinksCss}>
      <h2>Help</h2>
      <ul>
        {links.map(({ title, screen }) => (
          <li key={title}>
            <a
              onClick={(e) => {
                e.preventDefault();
                props.onLinkClick(screen);
              }}
            >
              {title}
            </a>
          </li>
        ))}
        <li>
          <a
            href="https://github.com/jupytercalpoly/Jupyter-Bifrost"
            target="_blank"
          >
            GitHub Repository
          </a>
        </li>
      </ul>
    </section>
  );
}

/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { Fragment, useState } from 'react';
import { ArrowLeft } from 'react-feather';
import Md from 'react-markdown';
import { BifrostTheme } from '../../theme';
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
  width: 400px;
  height: 100%;
  border: 2px solid ${t.color.primary.light};
  border-radius: 5px;
  padding: 25px;
  background: white;
  z-index: 100;

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

  .HelpLinks {
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

const backdropCss = css`
  background: white;
  opacity: 0.5;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
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
  const posStyle = css`
    position: absolute;
    left: ${position[0]}px;
    top: ${position[1]}px;
  `;
  return (
    <Fragment>
      <div className="backdrop" css={backdropCss} onClick={onDismiss}></div>
      <aside className="HelpScreen" css={[helpScreenCss, posStyle]}>
        {screen ? (
          <section>
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
      </aside>
    </Fragment>
  );
}

function HelpLinks(props: { onLinkClick(name: ScreenName): void }) {
  return (
    <section className="HelpLinks">
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

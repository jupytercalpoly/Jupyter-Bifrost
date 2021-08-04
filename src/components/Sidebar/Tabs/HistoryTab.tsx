/**@jsx jsx */
import { jsx, css } from '@emotion/react';
// import produce from 'immer';
import { useEffect, useMemo } from 'react';
import {
  GraphSpec,
  SpecHistoryTree,
  useModelState,
} from '../../../hooks/bifrost-model';
import theme from '../../../theme';
import Tree, { Node } from '@naisutech/react-tree';
import { ChevronUp } from 'react-feather';
import { chartIcons } from '../../../assets/icons/ChartIcons';
import { filterIcons } from '../../../assets/icons/FilterIcons';
import HistoryMergeIcon from '../../../assets/icons/HistoryMergeIcon';
// import SearchBar from '../../ui-widgets/SearchBar';

const historyCss = css`
  height: 100%;
  padding: 0;
  max-height: 300px;
  overflow-y: scroll;
  background-color: none;
  font-size: 14px;

  .leaf-node-wrapper {
    display: flex;
    align-items: center;
  }

  .history-el {
    padding: 10px;
    transition: background-color 0.5s;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-left: 10px solid ${theme.color.primary.standard};

    * {
      font-size: 14px;
    }

    &:hover {
      border: 3px solid ${theme.color.primary.standard};
      border-left: 10px solid ${theme.color.primary.standard};
      background-color: whitesmoke;
    }
    &.active {
      font-weight: 700;
      border: 3px solid ${theme.color.primary.dark};
      border-left: 10px solid ${theme.color.primary.dark};
    }

    &.leaf {
      margin-left: 40px;
      border-left: 10px solid ${theme.color.secondary.standard};
      flex-grow: 1;

      &.hasMergeButton {
        margin-left: 8px;
      }
      &:hover {
        border: 3px solid ${theme.color.secondary.standard};
        border-left: 10px solid ${theme.color.secondary.standard};
        background-color: whitesmoke;
      }
      &.active {
        font-weight: 700;
        border: 3px solid ${theme.color.secondary.dark};
        border-left: 10px solid ${theme.color.secondary.dark};
      }
      .merge-history-button {
        cursor: pointer;
      }
    }

    .arrowIcon {
      transition: transform 0.2s ease-in-out;
      margin: 0 5px;
      color: grey;

      &.open {
        transform: rotate(180deg);
      }
    }

    .history-text,
    .history-icons-wrapper {
      display: flex;
      align-items: center;
    }
  }
`;

export default function HistoryTab() {
  const [spec, setSpec] = useModelState('graph_spec');
  const [specHistory] = useModelState('spec_history');
  // each node is HistorySpecTree instance
  const [historyNode, setHistoryNode] = useModelState('history_node');
  const treeHist = specHistory.map((change, i) =>
    generateTreeSpec(change, i + 1, 1)
  );

  // Select the last valid spec if current spec has no encoding
  useEffect(() => {
    const hasNoEncodings = !Object.keys(spec.encoding).length;
    if (hasNoEncodings) {
      const lastLeaves = specHistory.map((change) => change.mainLeaf);
      const lastValidSpec = lastLeaves.sort((a, b) => b[0] - a[0])[0];
      // const lastValidSpec = produce(specHistory.mainLeaf, (gs) => gs);
      setSpec(lastValidSpec[1]);
    }
  }, []);

  function setHistoryPosition(nodeIds: string[]): void {
    const selectedId = nodeIds[0];
    const selectedNode = specHistory
      .map((history) =>
        history.find((node) => node.id === parseInt(selectedId))
      )
      .filter((node) => node)[0];

    const spec = selectedNode?.spec;
    spec && setSpec(spec);
    selectedNode && setHistoryNode(selectedNode);
  }

  return (
    <section className="HistoryTab" css={historyCss}>
      <Tree
        nodes={treeHist}
        onSelect={(nodeIds) => setHistoryPosition(nodeIds as string[])}
        containerStyle={{ background: 'white' }}
        theme={'light'}
        NodeRenderer={(props) =>
          TreeNode({
            ...props,
            data: props.data as unknown as customNode,
            currentNodeId: historyNode.id,
          })
        }
        LeafRenderer={(props) =>
          LeaveNode({
            ...props,
            data: props.data as unknown as customNode,
            currentNodeId: historyNode.id,
          })
        }
      />
    </section>
  );
}

function generateDescription(
  spec: GraphSpec,
  parentIndex: number,
  childIndex?: number
) {
  const fieldString = Object.values(spec.encoding)
    .map((info) => info.field)
    .join(' vs ');
  return `${parentIndex}${childIndex ? `-${childIndex}.` : '.'} ${fieldString}`;
}

interface customNode {
  id: number;
  parentId: number | null;
  label: string;
  items: Node[];
  spec: GraphSpec;
}

function generateTreeSpec(
  node: SpecHistoryTree,
  parentIndex: number,
  childIndex: number
): customNode {
  return {
    id: node.id,
    parentId: node.parentId ? node.parentId : node.parentId,
    label: node.parentId
      ? generateDescription(node.spec, parentIndex, childIndex)
      : generateDescription(node.spec, parentIndex),
    items: node.children.map((child, i) =>
      generateTreeSpec(child, parentIndex, i + 1)
    ),
    spec: node.spec,
  };
}

function TreeNode(props: {
  data: customNode;
  isOpen: boolean;
  isRoot: boolean;
  selected: boolean;
  level: number;
  currentNodeId: number;
}) {
  const classes = [
    ['history-el', true],
    [
      'active',
      props.selected ? props.selected : props.currentNodeId === props.data.id,
    ],
  ]
    .filter((pair) => pair[1])
    .map((pair) => pair[0])
    .join(' ');

  const isOpen = props.data.items ? props.isOpen : false;

  return (
    <div className={classes} key={props.data.id}>
      <div className={'history-text'}>
        {props.data.label}
        {!!props.data.items.length && (
          <div className={isOpen ? 'arrowIcon open' : 'arrowIcon'}>
            <ChevronUp size={15} />
          </div>
        )}
      </div>
      <HistoryIcons data={props.data} />
    </div>
  );
}

function LeaveNode(props: {
  data: customNode;
  selected: boolean;
  level: number;
  currentNodeId: number;
}) {
  const [specHistory, setSpecHistory] = useModelState('spec_history');

  const parentNode = useMemo(
    () =>
      (
        specHistory
          .map((history) =>
            history.find((change) => change.id === props.data.parentId)
          )
          .filter((node) => node) as SpecHistoryTree[]
      )[0],
    [props.data]
  );

  const idx = parentNode.children.findIndex(
    (child) => child.id === props.data.id
  );

  const classes = [
    ['history-el', true],
    ['leaf', true],
    [
      'active',
      props.selected ? props.selected : props.currentNodeId === props.data.id,
    ],
    ['hasMergeButton', idx === 0],
  ]
    .filter((pair) => pair[1])
    .map((pair) => pair[0])
    .join(' ');

  function handleOnClick() {
    const childrenNodes = parentNode.children.slice();
    childrenNodes.forEach((childNode) => (childNode.parentId = null));
    parentNode.children = [];

    const idxToInsert = specHistory.indexOf(parentNode) + 1;
    const newSpecHistory = specHistory.slice();
    newSpecHistory.splice(idxToInsert, 0, ...childrenNodes);

    setSpecHistory(newSpecHistory);
  }

  return (
    <div className={'leaf-node-wrapper'}>
      {idx === 0 ? (
        <div className={'merge-history-button'} onClick={handleOnClick}>
          <HistoryMergeIcon />
        </div>
      ) : null}
      <div className={classes} key={props.data.id}>
        <div className={'history-text'}>{props.data.label}</div>
        <HistoryIcons data={props.data} />
      </div>
    </div>
  );
}

function HistoryIcons({ data }: { data: customNode }) {
  const mark = data.spec.mark;

  return (
    <div className={'history-icons-wrapper'}>
      {chartIcons
        .filter((icon) => icon.mark === mark)
        .map(({ icon: Icon }) => (
          <Icon style={{ margin: '0 5px' }} />
        ))}
      {filterIcons.map(({ icon: Icon, filter }) => {
        if (filter === 'range' && data.spec.transform.length) {
          return <Icon style={{ margin: '0 5px' }} />;
        }
        const hasAggregate =
          Object.values(data.spec.encoding).filter((encodingInfo) => {
            return filter in encodingInfo;
          }).length !== 0;
        if (filter === 'aggregate' && hasAggregate) {
          return <Icon style={{ margin: '0 5px' }} />;
        }
      })}
    </div>
  );
}

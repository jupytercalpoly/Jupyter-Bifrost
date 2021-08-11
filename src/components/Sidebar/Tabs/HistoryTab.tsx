/**@jsx jsx */
import { jsx, css } from '@emotion/react';
// import produce from 'immer';
import { useEffect } from 'react';
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
// import HistoryMergeIcon from '../../../assets/icons/HistoryMergeIcon';
import { VegaEncoding } from '../../../modules/VegaEncodings';
import { findNodes } from '../../../modules/BifrostHistory';
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
      margin-left: 8px;
      border-left: 10px solid ${theme.color.secondary.standard};
      flex-grow: 1;

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
  // const [childrenNodes, setChildrenNodes] = useModelState('children_nodes');

  // function updateChildrenNodes(childrenSpecs: SpecHistoryTree[]) {
  //   setChildrenNodes(childrenSpecs);
  // }

  // Select the last valid spec if current spec has no encoding
  useEffect(() => {
    const hasNoEncodings = !Object.keys(spec.encoding).length;
    if (hasNoEncodings) {
      const lastLeaves = specHistory.map((change) => change.mainLeaf);
      const lastValidSpec = lastLeaves.sort((a, b) => b[0] - a[0])[0];
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
            // childrenNodes: childrenNodes,
          })
        }
        LeafRenderer={(props) =>
          LeaveNode({
            ...props,
            data: props.data as unknown as customNode,
            currentNodeId: historyNode.id,
            // childrenNodes: childrenNodes,
            // updateChildrenNodes: updateChildrenNodes,
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
  const classes = [
    ['history-el', true],
    ['leaf', true],
    [
      'active',
      props.selected ? props.selected : props.currentNodeId === props.data.id,
    ],
  ]
    .filter((pair) => pair[1])
    .map((pair) => pair[0])
    .join(' ');

  return (
    <div className={'leaf-node-wrapper'}>
      <div className={classes} key={props.data.id}>
        <div className={'history-text'}>{props.data.label}</div>
        <HistoryIcons data={props.data} />
      </div>
    </div>
  );
}

function HistoryIcons({ data }: { data: customNode }) {
  const mark = data.spec.mark;
  const [specHistory] = useModelState('spec_history');

  const hasAggregate =
    Object.values(data.spec.encoding).filter((encodingInfo) => {
      return 'aggregate' in encodingInfo;
    }).length !== 0;

  const hasScale =
    Object.values(data.spec.encoding).filter((encodingInfo) => {
      return 'scale' in encodingInfo && !('zero' in encodingInfo['scale']);
    }).length !== 0;

  let changes = {
    aggregateChanged: hasAggregate,
    scaleChanged: hasScale,
    rangeChanged: data.spec.transform.length !== 0,
    categoryChanged: data.spec.transform.length !== 0,
  };

  if (data.parentId) {
    // Closest sibling from the same parent
    const parentNode = findNodes(data.parentId, specHistory)[0];
    const idx = parentNode.children.findIndex((child) => child.id === data.id);
    const closestSibling = parentNode.children[idx - 1];
    changes = closestSibling
      ? checkChanges(closestSibling.spec, data.spec)
      : checkChanges(parentNode.spec, data.spec);
  } else {
    // closest sibling from the root
    const idx = specHistory.findIndex((change) => change.id === data.id);
    if (idx !== 0) {
      changes = checkChanges(specHistory[idx - 1].spec, data.spec);
    }
  }

  return (
    <div className={'history-icons-wrapper'}>
      {chartIcons
        .filter((icon) => icon.mark === mark)
        .map(({ icon: Icon }) => (
          <Icon style={{ margin: '0 5px' }} />
        ))}
      {filterIcons.map(({ icon: Icon, filter }) => {
        if (filter === 'range' && changes['rangeChanged']) {
          return <Icon style={{ margin: '0 5px' }} />;
        }
        if (filter === 'aggregate' && changes['aggregateChanged']) {
          return <Icon style={{ margin: '0 5px' }} />;
        }
        if (filter === 'scale' && changes['scaleChanged']) {
          return <Icon style={{ margin: '0 5px' }} />;
        }
        if (filter === 'category' && changes['categoryChanged']) {
          return <Icon style={{ margin: '0 5px' }} size={12} />;
        }
      })}
    </div>
  );
}

function checkChanges(
  prevSpec: GraphSpec,
  currSpec: GraphSpec
): {
  aggregateChanged: boolean;
  scaleChanged: boolean;
  rangeChanged: boolean;
  categoryChanged: boolean;
} {
  console.log(prevSpec);
  console.log(currSpec);

  const aggregateChanged = Object.keys(prevSpec.encoding)
    .map((channel) => {
      if (channel in prevSpec.encoding && channel in currSpec.encoding) {
        return (
          prevSpec.encoding[channel as VegaEncoding]['aggregate'] !==
          currSpec.encoding[channel as VegaEncoding]['aggregate']
        );
      }
      return false;
    })
    .filter(Boolean);

  const scaleChanged = Object.keys(prevSpec.encoding)
    .map((channel) => {
      if (channel in prevSpec.encoding && channel in currSpec.encoding) {
        return (
          prevSpec.encoding[channel as VegaEncoding].scale?.['type'] !==
          currSpec.encoding[channel as VegaEncoding].scale?.['type']
        );
      }
      return false;
    })
    .filter(Boolean);

  let rangeChanged = false;
  let categoryChanged = false;

  if (currSpec.transform.length !== prevSpec.transform.length) {
    const currFilterSet = new Set(currSpec.transform);
    const prevFilterSet = new Set(prevSpec.transform);

    const difference = new Set(
      [...currFilterSet].filter((x) => !prevFilterSet.has(x))
    );

    difference.forEach((change) => {
      if ('oneOf' in change.filter) {
        categoryChanged = true;
      }
      if ('or' in change.filter) {
        rangeChanged = true;
      }
    });
  }

  return {
    aggregateChanged: aggregateChanged.length !== 0,
    scaleChanged: scaleChanged.length !== 0,
    rangeChanged,
    categoryChanged,
  };
}

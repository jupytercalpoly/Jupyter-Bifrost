/**@jsx jsx */
import { jsx, css } from '@emotion/react';
// import produce from 'immer';
import { useEffect /*useState */ } from 'react';
import {
  GraphSpec,
  SpecHistoryTree,
  useModelState,
} from '../../../hooks/bifrost-model';
import theme from '../../../theme';
import Tree, { Node } from '@naisutech/react-tree';
import { ChevronUp } from 'react-feather';
// import SearchBar from '../../ui-widgets/SearchBar';

const historyCss = css`
  height: 100%;
  padding: 0;
  max-height: 300px;
  overflow-y: scroll;
  .history-el {
    padding: 10px;
    transition: background-color 0.5s;
    background-color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    &:hover {
      border: 3px solid ${theme.color.primary.standard};
      background-color: whitesmoke;
    }
    &.leaf {
      margin-left: 20px;
    }
    &.active {
      border-left: 3px solid ${theme.color.primary.standard};
      font-weight: 700;
    }
    .arrowIcon {
      transition: transform 0.2s ease-in-out;

      &.open {
        transform: rotate(180deg);
      }
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
  const mark = spec.mark;
  return `${parentIndex}${
    childIndex ? `-${childIndex}.` : '.'
  } ${fieldString} ${mark} chart`;
}

interface customNode {
  id: string;
  parentId: number | null;
  label: string;
  items: Node[];
  spec: GraphSpec;
}

function generateTreeSpec(
  node: SpecHistoryTree,
  parentIndex: number,
  childIndex: number
): Node {
  return {
    id: node.id.toString(),
    parentId: node.parentId ? node.parentId.toString() : node.parentId,
    label: node.parentId
      ? generateDescription(node.spec, parentIndex, childIndex)
      : generateDescription(node.spec, parentIndex),
    items: node.children.map((child, i) =>
      generateTreeSpec(child, parentIndex, i + 1)
    ),
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
      props.selected
        ? props.selected
        : props.currentNodeId === parseInt(props.data.id),
    ],
  ]
    .filter((pair) => pair[1])
    .map((pair) => pair[0])
    .join(' ');

  const isOpen = props.data.items ? props.isOpen : false;

  return (
    <div className={classes} key={props.data.id}>
      {props.data.label}
      {!!props.data.items.length && (
        <div className={isOpen ? 'arrowIcon open' : 'arrowIcon'}>
          <ChevronUp size={15} />
        </div>
      )}
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
      props.selected
        ? props.selected
        : props.currentNodeId === parseInt(props.data.id),
    ],
  ]
    .filter((pair) => pair[1])
    .map((pair) => pair[0])
    .join(' ');
  return (
    <div className={classes} key={props.data.id}>
      {props.data.label}
    </div>
  );
}

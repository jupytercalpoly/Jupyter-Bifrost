/**@jsx jsx */
import { jsx, css } from '@emotion/react';
import produce from 'immer';
import { useEffect, useState } from 'react';
import {
  GraphSpec,
  SpecHistoryTree,
  useModelState,
} from '../../../hooks/bifrost-model';
import theme from '../../../theme';
import Tree from 'react-d3-tree';

const historyCss = (theme: any) => css`
  height: 100%;
  .history-list {
    list-style: none;
    padding: 0;
    max-height: 370px;
    overflow-y: scroll;

    .history-el {
      padding: 10px;
      transition: background-color 0.5s;
      background-color: white;
      &:hover {
        background-color: whitesmoke;
      }

      &.active {
        border-left: 3px solid ${theme.color.primary[1]};
        font-weight: 700;
      }
    }
  }
`;

export default function HistoryTab() {
  const [spec, setSpec] = useModelState('graph_spec');
  const [specHistory] = useModelState('spec_history');
  const [historyNode, setHistoryNode] = useModelState('history_node');
  const treeHist = generateTreeSpec(specHistory);

  // Select the last valid spec if current spec has no encoding
  useEffect(() => {
    const hasNoEncodings = !Object.keys(spec.encoding).length;
    if (hasNoEncodings) {
      const lastValidSpec = produce(specHistory.mainLeaf, (gs) => gs);
      setSpec(lastValidSpec);
    }
  }, []);

  function setHistoryPosition(nodeData: D3Node) {
    setSpec(nodeData.spec);
    const selectedNode = specHistory.find((node) => node.id === nodeData.id);
    selectedNode && setHistoryNode(selectedNode);
  }

  return (
    <section className="HistoryTab" css={historyCss}>
      <Tree
        data={treeHist}
        orientation="vertical"
        renderCustomNodeElement={(data) => (
          <TreeNode
            nodeDatum={data.nodeDatum as unknown as D3Node} // Did this so that I could include spec on the node
            toggleNode={data.toggleNode}
            onClick={setHistoryPosition}
            activeNodeId={historyNode.id}
          />
        )}
      />
    </section>
  );
}

function generateDescription(spec: GraphSpec) {
  const fieldString = Object.values(spec.encoding)
    .map((info) => info.field)
    .join(' vs ');
  const mark = spec.mark;
  return `${fieldString} ${mark} chart`;
}

interface D3Node {
  name: string;
  attributes?: Record<string, string | number | boolean>;
  children: D3Node[];
  spec: GraphSpec;
  id: number;
}

function generateTreeSpec(node: SpecHistoryTree): D3Node {
  return {
    name: generateDescription(node.spec),
    children: node.children.map(generateTreeSpec),
    spec: node.spec,
    id: node.id,
  };
}

function TreeNode(props: {
  nodeDatum: D3Node;
  toggleNode: () => void;
  onClick: (node: D3Node) => void;
  activeNodeId: number;
}) {
  const [hovering, setHovering] = useState(false);
  return (
    <g>
      <circle
        r="15"
        onClick={() => props.onClick(props.nodeDatum)}
        fill={
          props.activeNodeId === props.nodeDatum.id
            ? theme.color.primary.standard
            : 'black'
        }
        onMouseOver={() => setHovering(true)}
        onMouseOut={() => setHovering(false)}
      />
      {hovering && (
        <text fill="black" strokeWidth="1" x="20">
          {props.nodeDatum.name}
        </text>
      )}
    </g>
  );
}

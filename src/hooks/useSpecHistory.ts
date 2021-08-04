import { useEffect, useRef, useState } from 'react';
import { GraphSpec, SpecHistoryTree, useModelState } from './bifrost-model';
import { findNodes, findHistoriesOnSameLevel } from '../modules/BifrostHistory';

interface SpecHistoryOptions {
  saveOnDismount?: boolean;
}

/**
 * Keeps track of history and saves Graph Specs.
 * @param options Adaptations to how saving state should be handled
 * @returns a function that can manually save a graph spec to history
 */
export default function useSpecHistory(
  options: SpecHistoryOptions = { saveOnDismount: false }
) {
  const graphSpec = useModelState('graph_spec')[0];
  const [historyNode, setHistoryNode] = useModelState('history_node');
  const [opHistory, setOpHistory] = useModelState('spec_history');
  const [originalSpec, setOriginalSpec] = useState(graphSpec);
  const saveRef = useRef<(spec?: GraphSpec) => void>(save);

  useEffect(() => {
    setOriginalSpec(graphSpec);
    return () => {
      //Slightly delay the dismount save so that new component's event listeners
      // have time to initialize and receive the update (prevents race condition).
      setTimeout(() => {
        options.saveOnDismount && saveRef.current();
      }, 100);
    };
  }, []);

  /**
   * Saves graph spec to the current history branch
   * @param spec Graph Spec to save
   */
  function save(spec: GraphSpec = graphSpec) {
    const hasChanged = originalSpec !== spec;
    const hasNoEncoding = !Object.keys(spec.encoding).length;
    if (!hasChanged || hasNoEncoding) {
      return;
    }
    let node: SpecHistoryTree | null = null;

    if (historyNode.parentId) {
      const parentNode = findNodes(historyNode.parentId, opHistory)[0];
      node = parentNode.addChild(spec);
    } else {
      const siblings = findHistoriesOnSameLevel(historyNode, opHistory);
      if (!siblings.length) {
        node = new SpecHistoryTree(spec, null);
        setOpHistory([...opHistory, node]);
      } else {
        const youngerSiblings = siblings.find(
          (sibling) => sibling.id > historyNode.id
        );
        if (!youngerSiblings) {
          node = new SpecHistoryTree(spec, null);
          setOpHistory([...opHistory, node]);
        } else {
          node = historyNode.addChild(spec);
        }
      }
    }
    node && setHistoryNode(node);
    setOriginalSpec(spec);
  }

  saveRef.current = save;

  return save;
}

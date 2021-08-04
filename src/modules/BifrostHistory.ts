import { SpecHistoryTree } from '../hooks/bifrost-model';

export function findHistoriesOnSameLevel(
  node: SpecHistoryTree,
  opHistory: SpecHistoryTree[]
): SpecHistoryTree[] {
  const nodesOnSameLevel = opHistory
    .map((history) =>
      history.find((change) => change.parentId === node.parentId)
    )
    .filter((node) => node) as SpecHistoryTree[]; // we sure it's not null
  return nodesOnSameLevel;
}

export function findNodes(
  id: number,
  opHistory: SpecHistoryTree[]
): SpecHistoryTree[] {
  const nodes = opHistory
    .map((history) => history.find((change) => change.id === id))
    .filter((node) => node) as SpecHistoryTree[]; // we sure it's not null
  return nodes;
}

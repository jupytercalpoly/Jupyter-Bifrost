import NumericalIcon from './NumericalIcon';
import CategoryIcon from './CategoryIcon';

export const typeIconMap: Record<string, typeof NumericalIcon> = {
  quantitative: NumericalIcon,
  nominal: CategoryIcon,
};

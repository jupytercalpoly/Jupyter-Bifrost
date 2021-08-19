import FilterSliderIcon from './FilterSliderIcon';
import { CheckSquare, Icon } from 'react-feather';

export const filterIconMap: Record<string, typeof FilterSliderIcon | Icon> = {
  quantitative: FilterSliderIcon,
  nominal: CheckSquare,
};
